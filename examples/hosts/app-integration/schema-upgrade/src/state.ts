/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { IContainer } from "@fluidframework/container-definitions";
import { createContainer, extractInventoryData, loadContainer, migrateContainer, saveAndEndSession } from "./utils";

import type { IContainerKillBit, IInventoryList } from "./interfaces";

// Consolidated application state.
export interface IAppState {
    containerId?: string;
    container?: IContainer;
    inventoryList?: IInventoryList;
    containerKillBit?: IContainerKillBit;
    inventoryData?: string;
}

// Declaration of available actions for mutating the application state.
export type ActionType =
    | { type: "reset-state" }
    | {
        type: "init-state",
        payload: {
            containerId: string,
            container: IContainer,
            inventoryList: IInventoryList,
            containerKillBit: IContainerKillBit,
        }
    }
    | { type: "set-inventory-data", payload: string | undefined }
    | { type: "save-and-end-session" }
    | { type: "write-to-external-storage" }
    | { type: "create-container", payload?: { inventoryData: string } }
    | { type: "load-container", payload: { containerId: string } }
    | { type: "migrate-container", payload?: { inventoryData: string | undefined } }
    ;

// Main reducer method responsible for mutating the application state.
export const reducer = (state: IAppState, action: ActionType): IAppState => {
    console.log(action, state);
    switch (action.type) {
        case "init-state": {
            const { containerId, container, inventoryList, containerKillBit } = action.payload;
            return { ...state, containerId, container, inventoryList, containerKillBit };
        }
        case "set-inventory-data":
            return { ...state, inventoryData: action.payload };
        default:
            throw new Error("⚠️ Unexpected action!");
    }
};

const writeToExternalStorage = async (
    inventoryList: IInventoryList,
    dispatch: React.Dispatch<ActionType>,
) => {
    // CONSIDER: it's perhaps more-correct to spawn a new client to extract with (to avoid local changes).
    // This can be done by making a loader.request() call with appropriate headers (same as we do for the
    // summarizing client).  E.g.
    // const exportContainer = await loader.resolve(...);
    // const inventoryList = (await exportContainer.request(...)).value;
    // const stringData = extractStringData(inventoryList);
    // exportContainer.close();

    const inventoryData = await extractInventoryData(inventoryList);
    console.log("Wrote data:", inventoryData);
    dispatch({
        type: "set-inventory-data",
        payload: inventoryData,
    });
};

// Middleware implementation wrapping the state reducer built to invoke async flows.
export const middleware = async (action: ActionType, state: IAppState, dispatch: React.Dispatch<ActionType>) => {
    console.log(action, state);
    switch (action.type) {
        case "save-and-end-session": {
            const { inventoryList, containerKillBit } = state;
            if (inventoryList && containerKillBit) {
                saveAndEndSession(inventoryList, containerKillBit)
                    .then((inventoryData) => dispatch({
                        type: "set-inventory-data",
                        payload: inventoryData,
                    }))
                    .catch(console.error);
            }
            return;
        }
        case "write-to-external-storage": {
            const { inventoryList } = state;
            if (inventoryList) {
                writeToExternalStorage(inventoryList, dispatch).catch(console.error);
            }
            return;
        }
        case "create-container":
            createContainer(action.payload?.inventoryData)
                .then((payload) => dispatch({ type: "init-state", payload }))
                .catch(console.error);
            return;
        case "load-container":
            loadContainer(action.payload.containerId)
                .then((payload) => dispatch({ type: "init-state", payload }))
                .catch(console.error);
            return;
        case "migrate-container": {
            migrateContainer(action.payload?.inventoryData, state, dispatch).catch(console.error);
            return;
        }
        default:
            // pass-through action dispatch
            dispatch(action);
    }
};
