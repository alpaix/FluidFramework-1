/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { IInventoryList } from "../interfaces";

export const fetchInventoryData = async () => {
    const inventoryData =
        `Alpha:1
Beta:2
Gamma:3
Delta:4`;
    return inventoryData;
};

function parseInventoryData(inventoryData: string) {
    const itemLines = inventoryData.split("\n");
    return itemLines.map((line) => {
        const [itemNameToken, itemQuantityToken] = line.split(":");
        return { name: itemNameToken, quantity: parseInt(itemQuantityToken, 10) };
    });
}

export const applyInventoryData = async (inventoryList: IInventoryList, inventoryData: string) => {
    const parsedInventoryData = parseInventoryData(inventoryData);
    for (const { name, quantity } of parsedInventoryData) {
        inventoryList.addItem(name, quantity);
    }
};

export const extractInventoryData = async (inventoryList: IInventoryList): Promise<string> => {
    const items = inventoryList.getItems();
    const lines = items.map((item) =>
        `${item.name.getText()}:${item.quantity.toString()}`,
    );
    return lines.join("\n");
};
