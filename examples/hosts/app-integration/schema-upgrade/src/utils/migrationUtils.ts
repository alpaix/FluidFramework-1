/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { IContainer } from "@fluidframework/container-definitions";

import { ContainerKillBit } from "../dds";
import { IContainerKillBit, IInventoryList } from "../interfaces";
import { createContainer } from "./containerUtils";

import { extractInventoryData } from "./dataHelpers";

export const saveAndEndSession = async (
    inventoryList: IInventoryList,
    containerKillBit: IContainerKillBit,
): Promise<string | undefined> => {
    if (!containerKillBit.markedForDestruction) {
        await containerKillBit.markForDestruction();
    }

    if (containerKillBit.dead) {
        return undefined;
    }

    // After the quorum proposal is accepted, our system doesn't allow further edits to the string
    // So we can immediately get the data out even before taking the lock.
    const inventoryData = await extractInventoryData(inventoryList);
    if (containerKillBit.dead) {
        return inventoryData;
    }

    await containerKillBit.volunteerForDestruction();
    if (containerKillBit.dead) {
        return;
    }

    if (!containerKillBit.haveDestructionTask()) {
        throw new Error("Lost task during write");
    } else {
        await containerKillBit.setDead();
    }

    return inventoryData;
};

export const migrateContainer = async (
    container: IContainer,
    containerKillBit: ContainerKillBit,
    inventoryList: IInventoryList,
) => {
    const inventoryData = await saveAndEndSession(inventoryList, containerKillBit);
    container.close();

    await createContainer(inventoryData);
};
