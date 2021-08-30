/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ITelemetryBufferedLogger } from "@fluidframework/test-driver-definitions";
import { ITelemetryBaseEvent } from "@fluidframework/common-definitions";
import { Context } from "mocha";
import { pkgName } from "./packageVersion";

const _global: any = global;
class TestLogger implements ITelemetryBufferedLogger {
    send(event: ITelemetryBaseEvent) {
        if (this.testName !== undefined) {
            event.testName = this.testName;
        }
        event.hostName = pkgName;
        this.parentLogger.send(event);
    }
    async flush() {
        return this.parentLogger.flush();
    }
    constructor(private readonly parentLogger: ITelemetryBufferedLogger,
        private readonly testName?: string) { }
}
const nullLogger: ITelemetryBufferedLogger = {
    send: () => { },
    flush: async () => { },
};

const log = console.log;
const error = console.log;
const warn = console.warn;
let currentTestLogger: ITelemetryBufferedLogger | undefined;
let currentTestName: string | undefined;
let originalLogger: ITelemetryBufferedLogger;
export const mochaHooks = {
    beforeAll() {
        originalLogger = _global.getTestLogger?.() ?? nullLogger;
        _global.getTestLogger = () => {
            // If it hasn't been created yet, create a test logger that will log the test name on demand
            if (!currentTestLogger && currentTestName !== undefined) {
                currentTestLogger = new TestLogger(originalLogger, currentTestName);
            }
            return currentTestLogger ?? originalLogger;
        };
    },
    beforeEach() {
        // Suppress console.log if not verbose mode
        if (process.env.FLUID_TEST_VERBOSE === undefined) {
            console.log = () => { };
            console.error = () => { };
            console.warn = () => { };
        }
        // save the test name can and clear the previous logger (if afterEach didn't get ran and it got left behind)
        const context = this as any as Context;
        currentTestName = context.currentTest?.fullTitle();
        currentTestLogger = undefined;
    },
    afterEach() {
        console.log = log;
        console.error = error;
        console.warn = warn;

        // clear the test logger and test name after each test
        currentTestLogger = undefined;
        currentTestName = undefined;
    },
};
