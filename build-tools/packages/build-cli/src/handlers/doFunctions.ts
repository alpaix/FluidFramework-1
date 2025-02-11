/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "assert";
import { bumpVersionScheme, detectVersionScheme } from "@fluid-tools/version-tools";
import { FluidRepo, MonoRepo } from "@fluidframework/build-tools";
import chalk from "chalk";
import { Machine } from "jssm";
import { bumpReleaseGroup, difference, getPreReleaseDependencies, npmCheckUpdates } from "../lib";
import { CommandLogger } from "../logging";
import { MachineState } from "../machines";
import { isReleaseGroup } from "../releaseGroups";
import { FluidReleaseStateHandlerData } from "./fluidReleaseStateHandler";
import { BaseStateHandler, StateHandlerFunction } from "./stateHandlers";

/**
 * Bumps any pre-release dependencies that have been released.
 *
 * @param state - The current state machine state.
 * @param machine - The state machine.
 * @param testMode - Set to true to run function in test mode.
 * @param log - A logger that the function can use for logging.
 * @param data - An object with handler-specific contextual data.
 * @returns True if the state was handled; false otherwise.
 */
export const doBumpReleasedDependencies: StateHandlerFunction = async (
    state: MachineState,
    machine: Machine<unknown>,
    testMode: boolean,
    log: CommandLogger,
    data: FluidReleaseStateHandlerData,
): Promise<boolean> => {
    if (testMode) return true;

    const { context, releaseGroup } = data;
    assert(context !== undefined, "Context is undefined.");

    const { releaseGroups, packages, isEmpty } = await getPreReleaseDependencies(
        context,
        releaseGroup!,
    );

    assert(!isEmpty, `No prereleases found in DoBumpReleasedDependencies state.`);

    const packagesToBump = new Set(packages.keys());
    for (const rg of releaseGroups.keys()) {
        for (const p of context.packagesInReleaseGroup(rg)) {
            packagesToBump.add(p.name);
        }
    }

    // First, check if any prereleases have released versions on npm
    let { updatedPackages, updatedDependencies } = await npmCheckUpdates(
        context,
        releaseGroup!,
        [...packagesToBump],
        "current",
        /* prerelease */ true,
        /* writeChanges */ false,
        log,
    );

    // Divide the updated dependencies into individual packages and release groups
    const updatedReleaseGroups = new Set<string>();
    const updatedDeps = new Set<string>();
    for (const p of updatedDependencies) {
        if (p.monoRepo === undefined) {
            updatedDeps.add(p.name);
        } else {
            updatedReleaseGroups.add(p.monoRepo.kind);
        }
    }

    const remainingReleaseGroupsToBump = difference(
        new Set(releaseGroups.keys()),
        updatedReleaseGroups,
    );
    const remainingPackagesToBump = difference(new Set(packages.keys()), updatedDeps);

    if (remainingReleaseGroupsToBump.size === 0 && remainingPackagesToBump.size === 0) {
        // This is the same command as run above, but this time we write the changes. THere are more
        // efficient ways to do this but this is simple.
        ({ updatedPackages, updatedDependencies } = await npmCheckUpdates(
            context,
            releaseGroup!,
            [...packagesToBump],
            "current",
            /* prerelease */ true,
            /* writeChanges */ true,
        ));
    }

    if (updatedPackages.length > 0) {
        // There were updates, which is considered a failure.
        BaseStateHandler.signalFailure(machine, state);
        context.repo.reload();
        return true;
    }

    BaseStateHandler.signalSuccess(machine, state);
    return true;
};

/**
 * Bumps any pre-release dependencies that have been released.
 *
 * @param state - The current state machine state.
 * @param machine - The state machine.
 * @param testMode - Set to true to run function in test mode.
 * @param log - A logger that the function can use for logging.
 * @param data - An object with handler-specific contextual data.
 * @returns True if the state was handled; false otherwise.
 */
export const doReleaseGroupBump: StateHandlerFunction = async (
    state: MachineState,
    machine: Machine<unknown>,
    testMode: boolean,
    log: CommandLogger,
    data: FluidReleaseStateHandlerData,
): Promise<boolean> => {
    if (testMode) return true;

    const { bumpType, context, releaseGroup, releaseVersion, shouldInstall } = data;
    assert(context !== undefined, "Context is undefined.");
    assert(bumpType !== undefined, `bumpType is undefined.`);

    const rgRepo = isReleaseGroup(releaseGroup)
        ? context.repo.releaseGroups.get(releaseGroup)!
        : context.fullPackageMap.get(releaseGroup!)!;
    const scheme = detectVersionScheme(releaseVersion!);
    const newVersion = bumpVersionScheme(releaseVersion, bumpType, scheme);
    const packages = rgRepo instanceof MonoRepo ? rgRepo.packages : [rgRepo];

    log.info(
        `Version ${releaseVersion} of ${releaseGroup} already released, so we can bump to ${newVersion} (${chalk.blue(
            bumpType,
        )} bump)!`,
    );

    const bumpResults = await bumpReleaseGroup(context, bumpType, rgRepo, scheme);
    log.verbose(`Raw bump results:`);
    log.verbose(bumpResults);

    if (shouldInstall === true && !(await FluidRepo.ensureInstalled(packages, false))) {
        log.errorLog("Install failed.");
        BaseStateHandler.signalFailure(machine, state);
        return true;
    }

    BaseStateHandler.signalSuccess(machine, state);
    return true;
};
