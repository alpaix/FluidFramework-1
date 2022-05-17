/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { IContainer, IFluidModuleWithDetails } from "@fluidframework/container-definitions";
import { Loader } from "@fluidframework/container-loader";
import { ensureFluidResolvedUrl } from "@fluidframework/driver-utils";
import { requestFluidObject } from "@fluidframework/runtime-utils";
import { createTinyliciousCreateNewRequest } from "@fluidframework/tinylicious-driver";

import type { IContainerKillBit, IInventoryList } from "../interfaces";
import { TinyliciousService } from "../services";
import {
    containerKillBitId,
    InventoryListContainerRuntimeFactory as InventoryListContainerRuntimeFactory1,
// eslint-disable-next-line import/no-internal-modules
} from "../packages/v1";
import {
    InventoryListContainerRuntimeFactory as InventoryListContainerRuntimeFactory2,
// eslint-disable-next-line import/no-internal-modules
} from "../packages/v2";

import { applyInventoryData, fetchInventoryData } from "./dataHelpers";

async function getInventoryListFromContainer(container: IContainer): Promise<IInventoryList> {
    // Since we're using a ContainerRuntimeFactoryWithDefaultDataStore, our inventory list is available at the URL "/".
    return requestFluidObject<IInventoryList>(container, { url: "/" });
}

async function getContainerKillBitFromContainer(container: IContainer): Promise<IContainerKillBit> {
    // Our kill bit is available at the URL containerKillBitId.
    return requestFluidObject<IContainerKillBit>(container, { url: containerKillBitId });
}

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

export const createContainer = async (inventoryData?: string) => {
    const loader = createLoader();
    const container = await loader.createDetachedContainer({ package: "no-dynamic-package", config: {} });
    const inventoryList = await getInventoryListFromContainer(container);
    const containerKillBit = await getContainerKillBitFromContainer(container);

    if (inventoryData === undefined) {
        // eslint-disable-next-line no-param-reassign
        inventoryData = await fetchInventoryData();
    }
    await applyInventoryData(inventoryList, inventoryData);

    await container.attach(createTinyliciousCreateNewRequest());

    // Discover the container ID after attaching
    const resolved = container.resolvedUrl;
    ensureFluidResolvedUrl(resolved);
    const containerId = resolved.id;

    return {
        containerId,
        container,
        inventoryList,
        containerKillBit,
    };
};

export const loadContainer = async (containerId: string) => {
    const loader = createLoader();
    const container = await loader.resolve({ url: containerId });
    const containerKillBit = await getContainerKillBitFromContainer(container);
    const inventoryList = await getInventoryListFromContainer(container);

    return {
        containerId,
        container,
        inventoryList,
        containerKillBit,
    };
};
