/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";

import type { IContainerKillBit, IInventoryList } from "./interfaces";
import { InventoryListView } from "./inventoryView";
import { ActionType } from "./state";

export interface IContainerViewProps {
    inventoryList: IInventoryList;
    containerKillBit: IContainerKillBit;
    inventoryData: string | undefined;
    dispatch: React.Dispatch<ActionType>;
}

export const ContainerView: React.FC<IContainerViewProps> = (props: IContainerViewProps) => {
    const {
        inventoryList,
        containerKillBit,
        inventoryData,
        dispatch,
    } = props;

    const [isDead, setDead] = useState<boolean>(containerKillBit.dead);
    const [sessionEnding, setSessionEnding] = useState<boolean>(containerKillBit.markedForDestruction);

    useEffect(() => {
        const deadHandler = () => {
            setDead(containerKillBit.dead);
        };
        containerKillBit.on("dead", deadHandler);
        // For some reason, I'm seeing the event fire between setting the state initially and adding the listener.
        deadHandler();
        return () => {
            containerKillBit.off("dead", deadHandler);
        };
    }, [containerKillBit]);

    useEffect(() => {
        const markedForDestructionHandler = () => {
            setSessionEnding(containerKillBit.markedForDestruction);
        };
        containerKillBit.on("markedForDestruction", markedForDestructionHandler);
        markedForDestructionHandler();
        return () => {
            containerKillBit.off("markedForDestruction", markedForDestructionHandler);
        };
    }, [containerKillBit]);

    const endSessionButtonClickHandler = () => {
        containerKillBit.markForDestruction().catch(console.error);
    };

    const setDeadButtonClickHandler = () => {
        containerKillBit.setDead().catch(console.error);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "baseline", gap: "10px", padding: "10px" }}>
            {isDead && <h1>The session has ended.</h1>}
            {sessionEnding && <h1>The session is ending...</h1>}
            {
                (isDead === false) &&
                <>
                    <InventoryListView inventoryList={inventoryList} disabled={sessionEnding} />
                    <button onClick={() => dispatch({ type: "saveAndEndSession" })}>Save and end session</button>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={endSessionButtonClickHandler}>1. End collaboration session</button>
                        <button onClick={() => dispatch({ type: "writeToExternalStorage" })}>2. Save</button>
                        <button onClick={setDeadButtonClickHandler}>3. Set dead</button>
                    </div>
                </>
            }
            {
                (inventoryData !== undefined) &&
                <>
                    <p>Saved inventory data:</p>
                    <textarea value={inventoryData} rows={5} readOnly></textarea>
                    <button onClick={() => dispatch({ type: "createNewContainer", payload: { inventoryData } })}>
                        Create new container
                    </button>
                </>
            }
        </div >
    );
};
