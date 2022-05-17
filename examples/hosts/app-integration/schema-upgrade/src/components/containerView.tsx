/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";

import type { IContainerKillBit, IInventoryList } from "../interfaces";
import { ActionType } from "../state";
import { InventoryListView } from "./inventoryView";

export interface IContainerViewProps {
    inventoryList: IInventoryList;
    containerKillBit: IContainerKillBit;
    // inventoryData: string | undefined;
    dispatch: React.Dispatch<ActionType>;
}

export const ContainerView: React.FC<IContainerViewProps> = (props: IContainerViewProps) => {
    const {
        inventoryList,
        containerKillBit,
        dispatch,
    } = props;

    const [isDead, setDead] = useState<boolean>(containerKillBit.dead);
    const [sessionEnding, setSessionEnding] = useState<boolean>(containerKillBit.markedForDestruction);
    const [isBusy, setBusy] = useState<boolean>(false);
    const [inventoryData] = useState<string>();

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
        setBusy(true);
        containerKillBit.markForDestruction()
            .then(() => setBusy(false))
            .catch(console.error);
    };

    const setDeadButtonClickHandler = () => {
        setBusy(true);
        containerKillBit.setDead()
            .then(() => setBusy(false))
            .catch(console.error);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "baseline", gap: "10px", padding: "10px" }}>
            {isDead && <h1>The session has ended</h1>}
            {
                (isDead === false) &&
                <>
                    {sessionEnding && <h1>The session is ending...</h1>}
                    {(isBusy === false) &&
                        <div style={{ position: "relative" }}>
                            <div className="spinner">
                                <p>Working...</p>
                            </div>
                        </div>
                    }
                    <InventoryListView inventoryList={inventoryList} disabled={sessionEnding} />
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => dispatch({ type: "save-and-end-session" })}>Save and end session</button>
                        <button onClick={() => dispatch({ type: "migrate-container", payload: { inventoryData } })}>
                            Migrate to new container
                        </button>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={endSessionButtonClickHandler}>1. End collaboration session</button>
                        <button onClick={() => dispatch({ type: "write-to-external-storage" })}>2. Save</button>
                        <button onClick={setDeadButtonClickHandler}>3. Set dead</button>
                    </div>
                </>
            }
            {
                (inventoryData !== undefined) &&
                <>
                    <p>Saved inventory data:</p>
                    <textarea value={inventoryData} rows={5} readOnly></textarea>
                </>
            }
        </div >
    );
};
