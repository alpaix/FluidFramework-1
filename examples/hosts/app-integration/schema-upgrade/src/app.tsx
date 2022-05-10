/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { IContainer, IFluidModuleWithDetails } from "@fluidframework/container-definitions";
import { Loader } from "@fluidframework/container-loader";
import { ensureFluidResolvedUrl } from "@fluidframework/driver-utils";
import { requestFluidObject } from "@fluidframework/runtime-utils";
import { createTinyliciousCreateNewRequest } from "@fluidframework/tinylicious-driver";

import React from "react";
import ReactDOM from "react-dom";

import { ContainerView } from "./containerView";
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

interface IAppState {
    inventoryData?: string;
    containerId?: string;
    inventoryList?: IInventoryList;
    containerKillBit?: IContainerKillBit;
}

type ActionType =
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
    | { type: "loadExistingContainer" };

const reducer = (state: IAppState, { type: actionType, payload }: any): IAppState => {
    switch (actionType) {
        case "initContainer": {
            const { containerId, inventoryList, containerKillBit } = payload;
            return { ...state, containerId, inventoryList, containerKillBit, inventoryData: "" };
        }
        case "setInventoryData":
            return { ...state, inventoryData: payload };
        default:
            // throw new Error("⚠️ Unexpected action!");
            return state;
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
    dispatch: React.Dispatch<ActionType>,
) => {
    const loader = createLoader();
    const containerId = location.hash.substring(1);
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

const middleware = (action: ActionType, state: IAppState, dispatch: React.Dispatch<ActionType>) => {
    switch (action.type) {
        case "saveAndEndSession": {
            const { inventoryList, containerKillBit } = state;
            if (inventoryList && containerKillBit) {
                saveAndEndSession(
                    inventoryList,
                    containerKillBit,
                    dispatch,
                ).catch(console.error);
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
            loadExistingContainer(dispatch).catch(console.error);
            return;
        default:
            dispatch(action);
    }
};

const App: React.FC = () => {
    const [appState, dispatch]: [IAppState, React.Dispatch<ActionType>] = React.useReducer(
        reducer,
        {
            inventoryData: "",
        },
    );

    const wrappedDispatch = React.useCallback(
        (action: ActionType) => middleware(action, appState, dispatch),
        [dispatch],
    );

    React.useEffect(() => {
        // In interacting with the service, we need to be explicit about whether we're creating a new container vs.
        // loading an existing one.  If loading, we also need to provide the unique ID for the container we are
        // loading from.

        // In this app, we'll choose to create a new container when navigating directly to http://localhost:8080.
        // A newly created container will generate its own ID, which we'll place in the URL hash.
        // If navigating to http://localhost:8080#containerId, we'll load from the ID in the hash.

        // These policy choices are arbitrary for demo purposes, and can be changed however you'd like.
        if (location.hash.length === 0) {
            wrappedDispatch({ type: "createNewContainer" });
        } else {
            wrappedDispatch({ type: "loadExistingContainer" });
        }
    }, []);

    React.useEffect(() => {
        // Update the URL with the actual container ID
        location.hash = appState.containerId ?? "";

        // Put the container ID in the tab title
        document.title = appState.containerId ?? "Loading...";
    }, [appState.containerId]);

    return <>
        {
            appState.inventoryList && appState.containerKillBit &&
            <ContainerView
                inventoryList={appState.inventoryList}
                containerKillBit={appState.containerKillBit}
                inventoryData={appState.inventoryData}
                dispatch={wrappedDispatch}
            />
        }
    </>;
};

const div = document.getElementById("content") as HTMLDivElement;
ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    div,
);
