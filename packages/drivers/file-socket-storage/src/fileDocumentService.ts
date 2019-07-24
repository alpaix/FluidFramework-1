/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as api from "@prague/container-definitions";
import { FileDeltaStorageService } from "./fileDeltaStorageService";
import { ReplayFileDeltaConnection } from "./fileDocumentDeltaConnection";

/**
 * The DocumentService manages the different endpoints for connecting to
 * underlying storage for file document service.
 */
export class FileDocumentService implements api.IDocumentService {
    constructor(
            private readonly storage: api.IDocumentStorageService,
            private readonly deltaStorage: FileDeltaStorageService) {
    }

    public async connectToStorage(): Promise<api.IDocumentStorageService> {
        return this.storage;
    }

    public async connectToDeltaStorage(): Promise<api.IDocumentDeltaStorageService> {
        return this.deltaStorage;
    }

    /**
     * Connects to a delta storage endpoint of provided documentService to get ops and then replaying
     * them so as to mimic a delta stream endpoint.
     *
     * @param client - Client that connects to socket.
     * @returns returns the delta stream service.
     */
    public async connectToDeltaStream(client: api.IClient): Promise<api.IDocumentDeltaConnection> {
        return ReplayFileDeltaConnection.create(this.deltaStorage);
    }

    public async branch(): Promise<string> {
        return Promise.reject("Not implemented");
    }

    public getErrorTrackingService() {
        return null;
    }
}
