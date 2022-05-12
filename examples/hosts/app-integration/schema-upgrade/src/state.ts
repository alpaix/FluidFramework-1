/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { IContainer, IFluidModuleWithDetails } from "@fluidframework/container-definitions";
import { Loader } from "@fluidframework/container-loader";
import { ensureFluidResolvedUrl } from "@fluidframework/driver-utils";
import { requestFluidObject } from "@fluidframework/runtime-utils";
import { createTinyliciousCreateNewRequest } from "@fluidframework/tinylicious-driver";

import { extractStringData, applyStringData, fetchData } from "./dataHelpers";
import type { IContainerKillBit, IInventoryList } from "./interfaces";
import { TinyliciousService } from "./tinyliciousService";
import {
    containerKillBitId,
    InventoryListContainerRuntimeFactory as InventoryListContainerRuntimeFactory1,
} from "./version1";
import {
    InventoryListContainerRuntimeFactory as InventoryListContainerRuntimeFactory2,
} from "./version2";

async function getInventoryListFromContainer(container: IContainer): Promise<IInventoryList> {
    // Since we're using a ContainerRuntimeFactoryWithDefaultDataStore, our inventory list is available at the URL "/".
    return requestFluidObject<IInventoryList>(container, { url: "/" });
}

async function getContainerKillBitFromContainer(container: IContainer): Promise<IContainerKillBit> {
    // Our kill bit is available at the URL containerKillBitId.
    return requestFluidObject<IContainerKillBit>(container, { url: containerKillBitId });
}

// Consolidated application state.
export interface IAppState {
    containerId?: string;
    inventoryList?: IInventoryList;
    containerKillBit?: IContainerKillBit;
    inventoryData?: string;
}

// Declaration of available actions for mutating the application state.
export type ActionType =
    | {
        type: "initContainer",
        payload: {
            containerId: string, inventoryList: IInventoryList, containerKillBit: IContainerKillBit,
        }
    }
    | { type: "setInventoryData", payload: string }
    | { type: "saveAndEndSession" }
    | { type: "writeToExternalStorage" }
    | { type: "createNewContainer", payload?: { inventoryData: string } }
    | { type: "loadExistingContainer", payload: { containerId: string } };

// Main reducer method responsible for mutating the application state.
export const reducer = (state: IAppState, action: ActionType): IAppState => {
    console.log(action, state);
    switch (action.type) {
        case "initContainer": {
            const { containerId, inventoryList, containerKillBit } = action.payload;
            return { ...state, containerId, inventoryList, containerKillBit };
        }
        case "setInventoryData":
            return { ...state, inventoryData: action.payload };
        default:
            throw new Error("⚠️ Unexpected action!");
    }
};

const createLoader = () => {
    const tinyliciousService = new TinyliciousService();
    const load = async (): Promise<IFluidModuleWithDetails> => {
        // TODO: Use some reasonable logic to select the appropriate container code to load from.
        const useNewVersion = false;
        const containerRuntimeFactory = useNewVersion
            ? new InventoryListContainerRuntimeFactory2()
            : new InventoryListContainerRuntimeFactory1();

        return {
            module: { fluidExport: containerRuntimeFactory },
            details: { package: "no-dynamic-package", config: {} },
        };
    };
    const codeLoader = { load };

    const loader = new Loader({
        urlResolver: tinyliciousService.urlResolver,
        documentServiceFactory: tinyliciousService.documentServiceFactory,
        codeLoader,
    });
    return loader;
};

const createNewContainer = async (
    inventoryData: string | undefined,
    dispatch: React.Dispatch<ActionType>,
) => {
    const loader = createLoader();
    const container = await loader.createDetachedContainer({ package: "no-dynamic-package", config: {} });
    const inventoryList = await getInventoryListFromContainer(container);
    const containerKillBit = await getContainerKillBitFromContainer(container);

    if (inventoryData === undefined) {
        // eslint-disable-next-line no-param-reassign
        inventoryData = await fetchData();
    }
    await applyStringData(inventoryList, inventoryData);

    await container.attach(createTinyliciousCreateNewRequest());

    // Discover the container ID after attaching
    const resolved = container.resolvedUrl;
    ensureFluidResolvedUrl(resolved);
    const containerId = resolved.id;

    dispatch({
        type: "initContainer",
        payload: {
            containerId,
            inventoryList,
            containerKillBit,
        },
    });
};

const loadExistingContainer = async (
    containerId: string,
    dispatch: React.Dispatch<ActionType>,
) => {
    const loader = createLoader();
    const container = await loader.resolve({ url: containerId });
    const containerKillBit = await getContainerKillBitFromContainer(container);
    const inventoryList = await getInventoryListFromContainer(container);

    dispatch({
        type: "initContainer",
        payload: {
            containerId,
            inventoryList,
            containerKillBit,
        },
    });
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

    const inventoryData = await extractStringData(inventoryList);
    console.log("Wrote data:", inventoryData);
    dispatch({
        type: "setInventoryData",
        payload: inventoryData,
    });
};

const saveAndEndSession = async (
    inventoryList: IInventoryList,
    containerKillBit: IContainerKillBit,
    dispatch: React.Dispatch<ActionType>,
) => {
    if (!containerKillBit.markedForDestruction) {
        await containerKillBit.markForDestruction();
    }

    if (containerKillBit.dead) {
        return;
    }

    // After the quorum proposal is accepted, our system doesn't allow further edits to the string
    // So we can immediately get the data out even before taking the lock.
    const inventoryData = await extractStringData(inventoryList);
    if (containerKillBit.dead) {
        return;
    }

    await containerKillBit.volunteerForDestruction();
    if (containerKillBit.dead) {
        return;
    }

    dispatch({
        type: "setInventoryData",
        payload: inventoryData,
    });
    if (!containerKillBit.haveDestructionTask()) {
        throw new Error("Lost task during write");
    } else {
        await containerKillBit.setDead();
    }
};

// Middleware implementation wrapping the state reducer designed to invoke complicated async actions.
export const middleware = (action: ActionType, state: IAppState, dispatch: React.Dispatch<ActionType>) => {
    console.log(action, state);
    switch (action.type) {
        case "saveAndEndSession": {
            const { inventoryList, containerKillBit } = state;
            if (inventoryList && containerKillBit) {
                saveAndEndSession(inventoryList, containerKillBit, dispatch).catch(console.error);
            }
            return;
        }
        case "writeToExternalStorage": {
            const { inventoryList } = state;
            if (inventoryList) {
                writeToExternalStorage(inventoryList, dispatch).catch(console.error);
            }
            return;
        }
        case "createNewContainer":
            createNewContainer(action.payload?.inventoryData, dispatch).catch(console.error);
            return;
        case "loadExistingContainer":
            loadExistingContainer(action.payload.containerId, dispatch).catch(console.error);
            return;
        default:
            dispatch(action);
    }
};
