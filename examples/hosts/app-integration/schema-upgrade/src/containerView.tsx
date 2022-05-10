/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";

import type { IContainerKillBit, IInventoryList } from "./interfaces";
import { InventoryListView } from "./inventoryView";

export interface IContainerViewProps {
    inventoryList: IInventoryList;
    containerKillBit: IContainerKillBit;
    inventoryData: string | undefined;
    dispatch: React.Dispatch<any>;
}

export const ContainerView: React.FC<IContainerViewProps> = (props: IContainerViewProps) => {
    const {
        inventoryList,
        containerKillBit,
        inventoryData,
        dispatch,
    } = props;

    const [dead, setDead] = useState<boolean>(containerKillBit.dead);
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

    if (dead) {
        return <h1>The session has ended.</h1>;
    }

    const endSessionButtonClickHandler = () => {
        containerKillBit.markForDestruction().catch(console.error);
    };

    const setDeadButtonClickHandler = () => {
        containerKillBit.setDead().catch(console.error);
    };

    return (
        <div>
            {sessionEnding && <h1>The session is ending...</h1>}
            <InventoryListView inventoryList={inventoryList} disabled={sessionEnding} />
            <button onClick={() => dispatch({ type: "saveAndEndSession" })}>Save and end session</button><br />
            <button onClick={endSessionButtonClickHandler}>1. End collaboration session</button>
            <button onClick={() => dispatch({ type: "writeToExternalStorage" })}>2. Save</button>
            <button onClick={setDeadButtonClickHandler}>3. Set dead</button>
            {
                (inventoryData !== undefined) &&
                <>
                    <div>Data out:</div>
                    <textarea value={inventoryData} rows={5} readOnly></textarea>
                    <button onClick={() => dispatch({ type: "createNewContainer", payload: { inventoryData } })}>
                        Create new container
                    </button>
                </>
            }
        </div >
    );
};
