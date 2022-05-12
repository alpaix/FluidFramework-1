/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";

import { ContainerView } from "./containerView";
import { ActionType, middleware, reducer } from "./state";

export const App: React.FC = () => {
    const [appState, dispatch] = React.useReducer(reducer, {});
    const wrappedDispatch = (action: ActionType) => middleware(action, appState, dispatch);

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
            wrappedDispatch({
                type: "loadExistingContainer",
                payload: {
                    containerId: location.hash.substring(1),
                },
            });
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
