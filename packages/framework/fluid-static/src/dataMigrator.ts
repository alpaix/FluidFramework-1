/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */
import { IDirectory } from "@fluidframework/map";
import { LoadableObjectRecord } from "./types";

// builder?
// context?
// snapshot?
// manager?
// seed
export interface IDataMigrator {
    readonly snapshot: LoadableObjectRecord;
    addObject(key: string, object: any/* LoadableObjectClass */, props: any): any;
    dropObject(key: string): void;
    // move/rename/update?
    commit(): void;
}

export class DataMigrator implements IDataMigrator {
    private constructor(private readonly _initialObjects: LoadableObjectRecord) {}

    static async create(objects: IDirectory) {
        const _initialObjects: LoadableObjectRecord = {};
        // We will always load the initial objects so they are available to the developer
        const loadInitialObjectsP: Promise<void>[] = [];
        for (const [key, value] of Array.from(objects.entries())) {
            const loadDir = async () => {
                const obj = await value.get();
                Object.assign(_initialObjects, { [key]: obj });
            };
            loadInitialObjectsP.push(loadDir());
        }

        await Promise.all(loadInitialObjectsP);

        return new DataMigrator(_initialObjects);
    }

    get snapshot(): LoadableObjectRecord {
        return this._initialObjects;
    }

    async addObject(key: string, object: any, props: any) {
        throw new Error("Method not implemented.");
    }

    dropObject(key: string): void {
        throw new Error("Method not implemented.");
    }

    commit(): void {
        throw new Error("Method not implemented.");
    }
}
