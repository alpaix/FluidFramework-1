## API Report File for "@fluid-internal/tree"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { IChannel } from '@fluidframework/datastore-definitions';
import { IChannelAttributes } from '@fluidframework/datastore-definitions';
import { IChannelFactory } from '@fluidframework/datastore-definitions';
import { IChannelServices } from '@fluidframework/datastore-definitions';
import { IFluidDataStoreRuntime } from '@fluidframework/datastore-definitions';
import { ISharedObject } from '@fluidframework/shared-object-base';
import { IsoBuffer } from '@fluidframework/common-utils';
import { Jsonable } from '@fluidframework/datastore-definitions';
import { Serializable } from '@fluidframework/datastore-definitions';

// @public
export type Anchor = Brand<number, "rebaser.Anchor">;

// @public @sealed
export class AnchorSet {
    applyDelta(delta: Delta.Root): void;
    // (undocumented)
    forget(anchor: Anchor): void;
    isEmpty(): boolean;
    locate(anchor: Anchor): UpPath | undefined;
    moveChildren(count: number, srcStart: UpPath | undefined, dst: UpPath | undefined): void;
    track(path: UpPath | null): Anchor;
}

// @public
export type Brand<ValueType, Name extends string> = ValueType & BrandedType<ValueType, Name>;

// @public
export function brand<T extends Brand<any, string>>(value: T extends BrandedType<infer ValueType, string> ? ValueType : never): T;

// @public @sealed
export abstract class BrandedType<ValueType, Name extends string> {
    protected readonly _type_brand: Name;
    // (undocumented)
    protected _typeCheck?: Invariant<ValueType>;
}

// @public
export function brandOpaque<T extends BrandedType<any, string>>(value: isAny<ValueFromBranded<T>> extends true ? never : ValueFromBranded<T>): BrandedType<ValueFromBranded<T>, NameFromBranded<T>>;

// @public (undocumented)
export function buildForest(schema: StoredSchemaRepository): IEditableForest;

// @public
export abstract class ChangeEncoder<TChange> {
    decodeBinary(formatVersion: number, change: IsoBuffer): TChange;
    abstract decodeJson(formatVersion: number, change: JsonCompatibleReadOnly): TChange;
    encodeBinary(formatVersion: number, change: TChange): IsoBuffer;
    abstract encodeForJson(formatVersion: number, change: TChange): JsonCompatibleReadOnly;
}

// @public (undocumented)
export interface ChangeFamily<TEditor, TChange> {
    // (undocumented)
    buildEditor(deltaReceiver: (delta: Delta.Root) => void, anchorSet: AnchorSet): TEditor;
    // (undocumented)
    readonly encoder: ChangeEncoder<TChange>;
    // (undocumented)
    intoDelta(change: TChange): Delta.Root;
    // (undocumented)
    readonly rebaser: ChangeRebaser<TChange>;
}

// @public
export interface ChangeRebaser<TChangeset> {
    compose(changes: TChangeset[]): TChangeset;
    // (undocumented)
    invert(changes: TChangeset): TChangeset;
    rebase(change: TChangeset, over: TChangeset): TChangeset;
    // (undocumented)
    rebaseAnchors(anchors: AnchorSet, over: TChangeset): void;
    // (undocumented)
    _typeCheck?: Invariant<TChangeset>;
}

// @public (undocumented)
export type ChangesetFromChangeRebaser<TChangeRebaser extends ChangeRebaser<any>> = TChangeRebaser extends ChangeRebaser<infer TChangeset> ? TChangeset : never;

// @public (undocumented)
export type ChangesetTag = number | string;

// @public
export type ChildCollection = FieldKey | RootField;

// @public
export interface ChildLocation {
    // (undocumented)
    readonly container: ChildCollection;
    // (undocumented)
    readonly index: number;
}

// @public
export interface Contravariant<T> {
    // (undocumented)
    _removeCovariance?: (_: T) => void;
}

// @public
const counter: FieldKind;

// @public
const counterHandle: FieldChangeHandler<number>;

// @public
export interface Covariant<T> {
    // (undocumented)
    _removeContravariance?: T;
}

// @public
export function cursorToJsonObject(reader: ITreeCursor): JsonCompatible;

// @public
export const defaultSchemaPolicy: FullSchemaPolicy;

// @public
interface Delete {
    // (undocumented)
    count: number;
    // (undocumented)
    type: typeof MarkType.Delete;
}

declare namespace Delta {
    export {
        inputLength,
        Root,
        empty,
        Mark,
        OuterMark,
        InnerModify,
        MarkList,
        Skip_2 as Skip,
        Modify,
        ModifyDeleted,
        ModifyMovedOut,
        ModifyMovedIn,
        ModifyInserted,
        Delete,
        ModifyAndDelete,
        MoveOut,
        ModifyAndMoveOut,
        MoveIn,
        MoveInAndModify,
        Insert,
        InsertAndModify,
        ProtoNode_2 as ProtoNode,
        MoveId,
        Offset,
        FieldMap_2 as FieldMap,
        FieldMarks,
        MarkType
    }
}
export { Delta }

// @public
export interface Dependee extends NamedComputation {
    registerDependent(dependent: Dependent): boolean;
    removeDependent(dependent: Dependent): void;
}

// @public
export interface Dependent extends NamedComputation {
    markInvalid(token?: InvalidationToken): void;
}

// @public
export interface DetachedField extends Opaque<Brand<string, "tree.DetachedField">> {
}

// @public
export interface EditableTree {
    readonly [getTypeSymbol]: (key?: string, nameOnly?: boolean) => TreeSchema | TreeSchemaIdentifier | undefined;
    readonly [proxyTargetSymbol]: object;
    readonly [valueSymbol]: Value;
    readonly [key: string]: UnwrappedEditableField;
}

// @public
export interface EditableTreeContext {
    free(): void;
    prepareForEdit(): void;
}

// @public
export type EditableTreeOrPrimitive = EditableTree | PrimitiveValue;

// @public (undocumented)
export enum Effects {
    // (undocumented)
    All = "All",
    // (undocumented)
    Delete = "Delete",
    // (undocumented)
    Move = "Move",
    // (undocumented)
    None = "None"
}

// @public (undocumented)
const empty: Root;

// @public
export const emptyField: FieldSchema;

// @public
export const EmptyKey: LocalFieldKey;

// @public
export type ExtractFromOpaque<TOpaque extends BrandedType<any, string>> = TOpaque extends BrandedType<infer ValueType, infer Name> ? isAny<ValueType> extends true ? unknown : Brand<ValueType, Name> : never;

// @public
export function extractFromOpaque<TOpaque extends BrandedType<any, string>>(value: TOpaque): ExtractFromOpaque<TOpaque>;

// @public (undocumented)
export interface FieldChange {
    // (undocumented)
    change: FieldChangeset;
    // (undocumented)
    fieldKind: FieldKindIdentifier;
}

// @public (undocumented)
export interface FieldChangeEncoder<TChangeset> {
    decodeJson(formatVersion: number, change: JsonCompatibleReadOnly, decodeChild: NodeChangeDecoder): TChangeset;
    encodeForJson(formatVersion: number, change: TChangeset, encodeChild: NodeChangeEncoder): JsonCompatibleReadOnly;
}

// @public
export interface FieldChangeHandler<TChangeset> {
    // (undocumented)
    editor: FieldEditor<TChangeset>;
    // (undocumented)
    encoder: FieldChangeEncoder<TChangeset>;
    // (undocumented)
    intoDelta(change: TChangeset, deltaFromChild: ToDelta): Delta.MarkList;
    // (undocumented)
    rebaser: FieldChangeRebaser<TChangeset>;
    // (undocumented)
    _typeCheck?: Invariant<TChangeset>;
}

// @public (undocumented)
export type FieldChangeMap = Map<FieldKey, FieldChange>;

// @public (undocumented)
export interface FieldChangeRebaser<TChangeset> {
    compose(changes: TChangeset[], composeChild: NodeChangeComposer): TChangeset;
    // (undocumented)
    invert(changes: TChangeset, invertChild: NodeChangeInverter): TChangeset;
    rebase(change: TChangeset, over: TChangeset, rebaseChild: NodeChangeRebaser): TChangeset;
}

// @public (undocumented)
export type FieldChangeset = Brand<unknown, "FieldChangeset">;

// @public (undocumented)
export interface FieldEditor<TChangeset> {
    buildChildChange(childIndex: number, change: NodeChangeset): TChangeset;
}

// @public
export type FieldKey = LocalFieldKey | GlobalFieldKeySymbol;

// @public @sealed
export class FieldKind {
    constructor(identifier: FieldKindIdentifier, multiplicity: Multiplicity, changeHandler: FieldChangeHandler<any>, allowsTreeSupersetOf: (originalTypes: ReadonlySet<TreeSchemaIdentifier> | undefined, superset: FieldSchema) => boolean, handlesEditsFrom: ReadonlySet<FieldKindIdentifier>);
    // (undocumented)
    allowsFieldSuperset(policy: FullSchemaPolicy, originalData: SchemaData, originalTypes: ReadonlySet<TreeSchemaIdentifier> | undefined, superset: FieldSchema): boolean;
    // (undocumented)
    readonly changeHandler: FieldChangeHandler<any>;
    // (undocumented)
    readonly handlesEditsFrom: ReadonlySet<FieldKindIdentifier>;
    // (undocumented)
    readonly identifier: FieldKindIdentifier;
    // (undocumented)
    readonly multiplicity: Multiplicity;
}

// @public
export type FieldKindIdentifier = Brand<string, "tree.FieldKindIdentifier">;

declare namespace FieldKinds {
    export {
        lastWriteWinsRebaser,
        replaceRebaser,
        UnitEncoder,
        ValueEncoder,
        Replacement,
        ReplaceOp,
        noChangeHandle,
        counterHandle,
        counter,
        value,
        optional,
        sequence,
        forbidden,
        fieldKinds
    }
}
export { FieldKinds }

// @public
const fieldKinds: ReadonlyMap<FieldKindIdentifier, FieldKind>;

// @public
export interface FieldLocation {
    // (undocumented)
    readonly key: FieldKey;
    // (undocumented)
    readonly parent: ForestLocation;
}

// @public
export interface FieldMap<TChild> {
    // (undocumented)
    [key: string]: TChild[];
}

// @public (undocumented)
type FieldMap_2<T> = Map<FieldKey, T>;

// @public (undocumented)
type FieldMarks<TMark> = FieldMap_2<MarkList<TMark>>;

// @public (undocumented)
export interface FieldSchema {
    // (undocumented)
    readonly kind: FieldKindIdentifier;
    readonly types?: TreeTypeSet;
}

// @public
export const enum FieldScope {
    // (undocumented)
    global = "fields",
    // (undocumented)
    local = "fields"
}

// @public
const forbidden: FieldKind;

// @public
export type ForestLocation = ITreeSubscriptionCursor | Anchor;

// @public
export interface FullSchemaPolicy extends SchemaPolicy {
    readonly fieldKinds: ReadonlyMap<FieldKindIdentifier, FieldKind>;
}

// @public (undocumented)
export type GapCount = number;

// @public
export interface GenericTreeNode<TChild> extends NodeData {
    // (undocumented)
    [FieldScope.local]?: FieldMap<TChild>;
    // (undocumented)
    [FieldScope.global]?: FieldMap<TChild>;
}

// @public
export function getEditableTree(forest: IEditableForest): [EditableTreeContext, UnwrappedEditableField];

// @public
export const getTypeSymbol: unique symbol;

// @public
export type GlobalFieldKey = Brand<string, "tree.GlobalFieldKey">;

// @public
export type GlobalFieldKeySymbol = Brand<symbol, "GlobalFieldKeySymbol">;

// @public (undocumented)
export interface HasOpId {
    id: OpId;
}

// @public (undocumented)
export interface ICheckout<TEditBuilder> {
    readonly forest: IForestSubscription;
    runTransaction(transaction: (forest: IForestSubscription, editor: TEditBuilder) => TransactionResult): TransactionResult;
}

// @public
export interface IEditableForest extends IForestSubscription {
    readonly anchors: AnchorSet;
    applyDelta(delta: Delta.Root): void;
}

// @public
export interface IForestSubscription extends Dependee {
    allocateCursor(): ITreeSubscriptionCursor;
    forgetAnchor(anchor: Anchor): void;
    root(range: DetachedField): Anchor;
    // (undocumented)
    readonly rootField: DetachedField;
    readonly schema: StoredSchemaRepository;
    tryMoveCursorTo(destination: Anchor, cursorToMove: ITreeSubscriptionCursor, observer?: ObservingDependent): TreeNavigationResult;
}

// @public
type InnerModify = ModifyDeleted | ModifyInserted | ModifyMovedIn | ModifyMovedOut;

// @public
function inputLength(mark: Mark): number;

// @public
interface Insert {
    // (undocumented)
    content: ProtoNode_2[];
    // (undocumented)
    type: typeof MarkType.Insert;
}

// @public
interface InsertAndModify {
    // (undocumented)
    content: ProtoNode_2;
    // (undocumented)
    fields: FieldMarks<Skip_2 | ModifyInserted | MoveIn | MoveInAndModify>;
    // (undocumented)
    type: typeof MarkType.InsertAndModify;
}

// @public
export class InvalidationToken {
    constructor(description: string, isSecondaryInvalidation?: boolean);
    // (undocumented)
    readonly description: string;
    // (undocumented)
    readonly isSecondaryInvalidation: boolean;
    // (undocumented)
    protected readonly _typeCheck: MakeNominal;
}

// @public
export interface Invariant<T> extends Contravariant<T>, Covariant<T> {
}

// @public
export type isAny<T> = boolean extends (T extends {} ? true : false) ? true : false;

// @public
export interface ISharedTree extends ICheckout<SequenceEditBuilder>, ISharedObject {
}

// @public (undocumented)
export function isNeverField(policy: FullSchemaPolicy, originalData: SchemaData, field: FieldSchema): boolean;

// @public (undocumented)
export function isPrimitive(schema: TreeSchema): boolean;

// @public (undocumented)
export function isPrimitiveValue(nodeValue: Value): nodeValue is PrimitiveValue;

// @public
export interface ITreeCursor<TResult = TreeNavigationResult> {
    down(key: FieldKey, index: number): TResult;
    // (undocumented)
    keys: Iterable<FieldKey>;
    // (undocumented)
    length(key: FieldKey): number;
    seek(offset: number): TResult;
    readonly type: TreeType;
    up(): TResult;
    readonly value: Value;
}

// @public
export interface ITreeSubscriptionCursor extends ITreeCursor {
    buildAnchor(): Anchor;
    clear(): void;
    // (undocumented)
    fork(observer?: ObservingDependent): ITreeSubscriptionCursor;
    free(): void;
    observer?: ObservingDependent;
    readonly state: ITreeSubscriptionCursorState;
}

// @public (undocumented)
export enum ITreeSubscriptionCursorState {
    Cleared = 1,
    Current = 0,
    Freed = 2
}

// @public
export interface JsonableTree extends PlaceholderTree {
}

// @public
export function jsonableTreeFromCursor(cursor: ITreeCursor): JsonableTree;

// @public (undocumented)
export const jsonArray: NamedTreeSchema;

// @public (undocumented)
export const jsonBoolean: NamedTreeSchema;

// @public
export type JsonCompatible = string | number | boolean | null | JsonCompatible[] | {
    [P in string]: JsonCompatible;
};

// @public
export type JsonCompatibleReadOnly = string | number | boolean | null | readonly JsonCompatibleReadOnly[] | {
    readonly [P in string]: JsonCompatibleReadOnly | undefined;
};

// @public @sealed
export class JsonCursor<T> implements ITreeCursor<SynchronousNavigationResult> {
    constructor(root: Jsonable<T>);
    // (undocumented)
    down(key: FieldKey, index: number): SynchronousNavigationResult;
    // (undocumented)
    get keys(): Iterable<FieldKey>;
    // (undocumented)
    length(key: FieldKey): number;
    // (undocumented)
    seek(offset: number): SynchronousNavigationResult;
    // (undocumented)
    get type(): TreeType;
    // (undocumented)
    up(): SynchronousNavigationResult;
    // (undocumented)
    get value(): Value;
}

// @public (undocumented)
export const jsonNull: NamedTreeSchema;

// @public (undocumented)
export const jsonNumber: NamedTreeSchema;

// @public (undocumented)
export const jsonObject: NamedTreeSchema;

// @public (undocumented)
export const jsonString: NamedTreeSchema;

// @public (undocumented)
export const jsonTypeSchema: Map<TreeSchemaIdentifier, NamedTreeSchema>;

// @public (undocumented)
export function keyFromSymbol(key: GlobalFieldKeySymbol): GlobalFieldKey;

// @public
function lastWriteWinsRebaser<TChange>(data: {
    noop: TChange;
    invert: (changes: TChange) => TChange;
}): FieldChangeRebaser<TChange>;

// @public
export type LocalFieldKey = Brand<string, "tree.LocalFieldKey">;

// @public
export interface MakeNominal {
}

// @public
type Mark = OuterMark | InnerModify;

// @public
type MarkList<TMark = Mark> = TMark[];

// @public (undocumented)
const MarkType: {
    readonly Modify: 0;
    readonly Insert: 1;
    readonly InsertAndModify: 2;
    readonly MoveIn: 3;
    readonly MoveInAndModify: 4;
    readonly Delete: 5;
    readonly ModifyAndDelete: 6;
    readonly MoveOut: 7;
    readonly ModifyAndMoveOut: 8;
};

// @public
interface Modify {
    // (undocumented)
    fields?: FieldMarks<OuterMark>;
    // (undocumented)
    setValue?: Value;
    // (undocumented)
    type: typeof MarkType.Modify;
}

// @public
interface ModifyAndDelete {
    // (undocumented)
    fields: FieldMarks<Skip_2 | ModifyDeleted | MoveOut>;
    // (undocumented)
    type: typeof MarkType.ModifyAndDelete;
}

// @public
interface ModifyAndMoveOut {
    // (undocumented)
    fields?: FieldMarks<Skip_2 | ModifyMovedOut | Delete | MoveOut>;
    moveId: MoveId;
    // (undocumented)
    setValue?: Value;
    // (undocumented)
    type: typeof MarkType.ModifyAndMoveOut;
}

// @public
interface ModifyDeleted {
    // (undocumented)
    fields: FieldMarks<Skip_2 | ModifyDeleted | ModifyAndMoveOut | MoveOut>;
    // (undocumented)
    type: typeof MarkType.Modify;
}

// @public
interface ModifyInserted {
    // (undocumented)
    fields: FieldMarks<Skip_2 | ModifyInserted | MoveIn | MoveInAndModify>;
    // (undocumented)
    type: typeof MarkType.Modify;
}

// @public
interface ModifyMovedIn {
    // (undocumented)
    fields: FieldMarks<Skip_2 | ModifyMovedIn | MoveIn | MoveInAndModify | Insert | InsertAndModify>;
    // (undocumented)
    type: typeof MarkType.Modify;
}

// @public
interface ModifyMovedOut {
    // (undocumented)
    fields?: FieldMarks<Skip_2 | ModifyMovedOut | Delete | ModifyAndDelete | ModifyAndMoveOut | MoveOut>;
    // (undocumented)
    setValue?: Value;
    // (undocumented)
    type: typeof MarkType.Modify;
}

// @public @sealed
export class ModularChangeFamily implements ChangeFamily<ModularEditBuilder, FieldChangeMap>, ChangeRebaser<FieldChangeMap> {
    constructor(fieldKinds: ReadonlyMap<FieldKindIdentifier, FieldKind>);
    // (undocumented)
    buildEditor(deltaReceiver: (delta: Delta.Root) => void, anchors: AnchorSet): ModularEditBuilder;
    // (undocumented)
    compose(changes: FieldChangeMap[]): FieldChangeMap;
    // (undocumented)
    readonly encoder: ChangeEncoder<FieldChangeMap>;
    // (undocumented)
    readonly fieldKinds: ReadonlyMap<FieldKindIdentifier, FieldKind>;
    // (undocumented)
    intoDelta(change: FieldChangeMap): Delta.Root;
    // (undocumented)
    invert(changes: FieldChangeMap): FieldChangeMap;
    // (undocumented)
    rebase(change: FieldChangeMap, over: FieldChangeMap): FieldChangeMap;
    // (undocumented)
    rebaseAnchors(anchors: AnchorSet, over: FieldChangeMap): void;
    // (undocumented)
    get rebaser(): ChangeRebaser<FieldChangeMap>;
}

// @public @sealed (undocumented)
export class ModularEditBuilder extends ProgressiveEditBuilder<FieldChangeMap> {
    constructor(family: ModularChangeFamily, deltaReceiver: (delta: Delta.Root) => void, anchors: AnchorSet);
    // (undocumented)
    setValue(path: UpPathWithFieldKinds, value: Value): void;
    submitChange(path: UpPathWithFieldKinds | undefined, field: FieldKey, fieldKind: FieldKindIdentifier, change: FieldChangeset): void;
}

// @public
interface MoveId extends Opaque<Brand<number, "delta.MoveId">> {
}

// @public
interface MoveIn {
    moveId: MoveId;
    // (undocumented)
    type: typeof MarkType.MoveIn;
}

// @public
interface MoveInAndModify {
    // (undocumented)
    fields: FieldMarks<Skip_2 | ModifyMovedIn | MoveIn | Insert>;
    moveId: MoveId;
    // (undocumented)
    type: typeof MarkType.MoveInAndModify;
}

// @public
interface MoveOut {
    // (undocumented)
    count: number;
    moveId: MoveId;
    // (undocumented)
    type: typeof MarkType.MoveOut;
}

// @public
export enum Multiplicity {
    Forbidden = 3,
    Optional = 1,
    Sequence = 2,
    Value = 0
}

// @public (undocumented)
export interface Named<TName> {
    // (undocumented)
    readonly name: TName;
}

// @public
export interface NamedComputation {
    readonly computationName: string;
    listDependees?(): Iterable<Dependee>;
    listDependents?(): Iterable<Dependent>;
}

// @public (undocumented)
export type NamedTreeSchema = TreeSchema & Named<TreeSchemaIdentifier>;

// @public
export type NameFromBranded<T extends BrandedType<any, string>> = T extends BrandedType<any, infer Name> ? Name : never;

// @public
export const neverTree: TreeSchema;

// @public
const noChangeHandle: FieldChangeHandler<0>;

// @public (undocumented)
export type NodeChangeComposer = (changes: NodeChangeset[]) => NodeChangeset;

// @public (undocumented)
export type NodeChangeDecoder = (change: JsonCompatibleReadOnly) => NodeChangeset;

// @public (undocumented)
export type NodeChangeEncoder = (change: NodeChangeset) => JsonCompatibleReadOnly;

// @public (undocumented)
export type NodeChangeInverter = (change: NodeChangeset) => NodeChangeset;

// @public (undocumented)
export type NodeChangeRebaser = (change: NodeChangeset, baseChange: NodeChangeset) => NodeChangeset;

// @public (undocumented)
export interface NodeChangeset {
    // (undocumented)
    fieldChanges?: FieldChangeMap;
    // (undocumented)
    valueChange?: ValueChange;
}

// @public (undocumented)
export type NodeCount = number;

// @public
export interface NodeData {
    readonly type: TreeSchemaIdentifier;
    value?: TreeValue;
}

// @public
export interface NodePath extends UpPath {
}

// @public
export interface ObservingDependent extends Dependent {
    // @override
    listDependees(): Iterable<Dependee>;
    registerDependee(dependee: Dependee): void;
}

// @public (undocumented)
type Offset = number;

// @public
export type Opaque<T extends Brand<any, string>> = T extends Brand<infer ValueType, infer Name> ? BrandedType<ValueType, Name> : never;

// @public
export type OpId = number;

// @public
const optional: FieldKind;

// @public
type OuterMark = Skip_2 | Modify | Delete | MoveOut | MoveIn | Insert | ModifyAndDelete | ModifyAndMoveOut | MoveInAndModify | InsertAndModify;

// @public
export type PlaceholderTree<TPlaceholder = never> = GenericTreeNode<PlaceholderTree<TPlaceholder>> | TPlaceholder;

// @public
export interface PlacePath extends UpPath {
}

// @public (undocumented)
export type PrimitiveValue = string | boolean | number;

// @public (undocumented)
export abstract class ProgressiveEditBuilder<TChange> {
    constructor(changeFamily: ChangeFamily<unknown, TChange>, deltaReceiver: (delta: Delta.Root) => void, anchorSet: AnchorSet);
    // @sealed
    protected applyChange(change: TChange): void;
    // @sealed (undocumented)
    getChanges(): TChange[];
}

// @public
export type ProtoNode = JsonableTree;

// @public
type ProtoNode_2 = JsonableTree;

// @public
export const proxyTargetSymbol: unique symbol;

// @public @sealed
export class Rebaser<TChangeRebaser extends ChangeRebaser<any>> {
    constructor(rebaser: TChangeRebaser);
    discardRevision(revision: RevisionTag): void;
    // (undocumented)
    readonly empty: RevisionTag;
    // (undocumented)
    getResolutionPath(from: RevisionTag, to: RevisionTag): ChangesetFromChangeRebaser<TChangeRebaser>;
    rebase(changes: ChangesetFromChangeRebaser<TChangeRebaser>, from: RevisionTag, to: RevisionTag): [RevisionTag, ChangesetFromChangeRebaser<TChangeRebaser>];
    rebaseAnchors(anchors: AnchorSet, from: RevisionTag, to: RevisionTag): void;
    // (undocumented)
    readonly rebaser: TChangeRebaser;
}

// @public
export function recordDependency(dependent: ObservingDependent | undefined, dependee: Dependee): void;

// @public (undocumented)
interface Replacement<T> {
    // (undocumented)
    new: T;
    // (undocumented)
    old: T;
}

// @public (undocumented)
type ReplaceOp<T> = Replacement<T> | 0;

// @public
function replaceRebaser<T>(): FieldChangeRebaser<ReplaceOp<T>>;

// @public
export type RevisionTag = Brand<number, "rebaser.RevisionTag">;

// @public
type Root = FieldMarks<OuterMark>;

// @public
export interface RootField {
    // (undocumented)
    readonly key: DetachedField;
}

// @public
export const rootFieldKey: GlobalFieldKey;

// @public
export interface SchemaData extends SchemaDataReader {
    // (undocumented)
    readonly globalFieldSchema: ReadonlyMap<GlobalFieldKey, FieldSchema>;
    // (undocumented)
    readonly treeSchema: ReadonlyMap<TreeSchemaIdentifier, TreeSchema>;
}

// @public
export interface SchemaDataReader {
    // (undocumented)
    readonly globalFieldSchema: ReadonlyMap<GlobalFieldKey, FieldSchema>;
    // (undocumented)
    readonly treeSchema: ReadonlyMap<TreeSchemaIdentifier, TreeSchema>;
}

// @public
export interface SchemaPolicy {
    readonly defaultGlobalFieldSchema: FieldSchema;
    readonly defaultTreeSchema: TreeSchema;
}

// @public
const sequence: FieldKind;

// @public (undocumented)
export type SequenceChangeset = Transposed.LocalChangeset;

// @public (undocumented)
export class SequenceEditBuilder extends ProgressiveEditBuilder<SequenceChangeset> {
    constructor(deltaReceiver: (delta: Delta.Root) => void, anchorSet: AnchorSet);
    // (undocumented)
    delete(place: PlacePath, count: number): void;
    // (undocumented)
    insert(place: PlacePath, cursor: ITreeCursor): void;
    // (undocumented)
    move(source: PlacePath, count: number, destination: PlacePath): void;
    // (undocumented)
    setValue(node: NodePath, value: Value): void;
}

// @public
export class SharedTreeFactory implements IChannelFactory {
    // (undocumented)
    attributes: IChannelAttributes;
    // (undocumented)
    create(runtime: IFluidDataStoreRuntime, id: string): ISharedTree;
    // (undocumented)
    load(runtime: IFluidDataStoreRuntime, id: string, services: IChannelServices, channelAttributes: Readonly<IChannelAttributes>): Promise<IChannel>;
    // (undocumented)
    type: string;
}

// @public
export class SimpleDependee implements Dependee {
    constructor(computationName?: string);
    // (undocumented)
    readonly computationName: string;
    invalidateDependents(): void;
    // @sealed (undocumented)
    listDependents(): Set<Dependent>;
    // (undocumented)
    registerDependent(dependent: Dependent): boolean;
    // (undocumented)
    removeDependent(dependent: Dependent): void;
}

// @public (undocumented)
export function singleTextCursor(root: JsonableTree): TextCursor;

// @public (undocumented)
export type Skip = number;

// @public
type Skip_2 = number;

// @public @sealed
export class StoredSchemaRepository<TPolicy extends SchemaPolicy = SchemaPolicy> extends SimpleDependee implements SchemaData {
    constructor(policy: TPolicy, data?: SchemaData);
    // (undocumented)
    clone(): StoredSchemaRepository;
    // (undocumented)
    readonly computationName: string;
    // (undocumented)
    protected readonly data: {
        treeSchema: Map<TreeSchemaIdentifier, TreeSchema>;
        globalFieldSchema: Map<GlobalFieldKey, FieldSchema>;
    };
    // (undocumented)
    get globalFieldSchema(): ReadonlyMap<GlobalFieldKey, FieldSchema>;
    // (undocumented)
    lookupGlobalFieldSchema(identifier: GlobalFieldKey): FieldSchema;
    // (undocumented)
    lookupTreeSchema(identifier: TreeSchemaIdentifier): TreeSchema;
    // (undocumented)
    readonly policy: TPolicy;
    // (undocumented)
    get treeSchema(): ReadonlyMap<TreeSchemaIdentifier, TreeSchema>;
    updateFieldSchema(identifier: GlobalFieldKey, schema: FieldSchema): void;
    updateTreeSchema(identifier: TreeSchemaIdentifier, schema: TreeSchema): void;
}

// @public (undocumented)
export function symbolFromKey(key: GlobalFieldKey): GlobalFieldKeySymbol;

// @public
export type SynchronousNavigationResult = TreeNavigationResult.Ok | TreeNavigationResult.NotFound;

// @public
export class TextCursor implements ITreeCursor<SynchronousNavigationResult> {
    constructor(root: JsonableTree[], index: number, field?: DetachedField);
    // (undocumented)
    down(key: FieldKey, index: number): SynchronousNavigationResult;
    // (undocumented)
    protected getNode(): JsonableTree;
    // (undocumented)
    protected index: number;
    // (undocumented)
    protected readonly indexStack: number[];
    // (undocumented)
    isRooted(): boolean;
    // (undocumented)
    get keys(): Iterable<FieldKey>;
    // (undocumented)
    protected readonly keyStack: FieldKey[];
    // (undocumented)
    length(key: FieldKey): number;
    // (undocumented)
    seek(offset: number): SynchronousNavigationResult;
    // (undocumented)
    protected siblings: JsonableTree[];
    // (undocumented)
    protected readonly siblingStack: JsonableTree[][];
    // (undocumented)
    get type(): TreeType;
    // (undocumented)
    up(): SynchronousNavigationResult;
    // (undocumented)
    get value(): Value;
}

// @public (undocumented)
export enum Tiebreak {
    // (undocumented)
    Left = 0,
    // (undocumented)
    Right = 1
}

// @public (undocumented)
export type ToDelta = (child: NodeChangeset) => Delta.Modify;

// @public (undocumented)
export enum TransactionResult {
    // (undocumented)
    Abort = 0,
    // (undocumented)
    Apply = 1
}

// @public
export namespace Transposed {
    // (undocumented)
    export type Attach = Insert | ModifyInsert | MoveIn | ModifyMoveIn | Bounce | Intake;
    export interface Bounce extends HasOpId, HasPlaceFields {
        // (undocumented)
        type: "Bounce";
    }
    // (undocumented)
    export interface Detach extends HasOpId {
        // (undocumented)
        count: NodeCount;
        // (undocumented)
        gaps?: GapEffect[];
        // (undocumented)
        tomb?: ChangesetTag;
        // (undocumented)
        type: "Delete" | "MoveOut";
    }
    // (undocumented)
    export interface FieldMarks {
        // (undocumented)
        [key: string]: MarkList;
    }
    // (undocumented)
    export interface Forward extends HasOpId, GapEffectPolicy {
        // (undocumented)
        type: "Forward";
    }
    // (undocumented)
    export type GapEffect = Scorch | Forward | Heal | Unforward;
    // (undocumented)
    export interface GapEffectPolicy {
        excludePriorInsertions?: true;
        includePosteriorInsertions?: true;
    }
    // (undocumented)
    export interface GapEffectSegment {
        // (undocumented)
        count: GapCount;
        stack: GapEffect[];
        // (undocumented)
        tomb?: ChangesetTag;
        // (undocumented)
        type: "Gap";
    }
    // (undocumented)
    export type GapEffectType = GapEffect["type"];
    // (undocumented)
    export interface HasPlaceFields {
        heed?: Effects | [Effects, Effects];
        scorch?: PriorOp;
        src?: PriorOp;
        tiebreak?: Tiebreak;
    }
    // (undocumented)
    export interface Heal extends HasOpId, GapEffectPolicy {
        // (undocumented)
        type: "Heal";
    }
    // (undocumented)
    export interface Insert extends HasOpId, HasPlaceFields {
        // (undocumented)
        content: ProtoNode[];
        // (undocumented)
        type: "Insert";
    }
    export interface Intake extends PriorOp {
        // (undocumented)
        type: "Intake";
    }
    export interface LocalChangeset {
        // (undocumented)
        marks: FieldMarks;
        // (undocumented)
        moves?: MoveEntry<TreeForestPath>[];
    }
    // (undocumented)
    export type Mark = SizedMark | Attach;
    // (undocumented)
    export type MarkList<TMark = Mark> = TMark[];
    // (undocumented)
    export interface Modify {
        // (undocumented)
        fields?: FieldMarks;
        // (undocumented)
        tomb?: ChangesetTag;
        // (undocumented)
        type: "Modify";
        // (undocumented)
        value?: SetValue;
    }
    // (undocumented)
    export interface ModifyDetach extends HasOpId {
        // (undocumented)
        fields?: FieldMarks;
        // (undocumented)
        tomb?: ChangesetTag;
        // (undocumented)
        type: "MDelete" | "MMoveOut";
        // (undocumented)
        value?: SetValue;
    }
    // (undocumented)
    export interface ModifyInsert extends HasOpId, HasPlaceFields {
        // (undocumented)
        content: ProtoNode;
        // (undocumented)
        fields?: FieldMarks;
        // (undocumented)
        type: "MInsert";
        // (undocumented)
        value?: SetValue;
    }
    // (undocumented)
    export interface ModifyMoveIn extends HasOpId, HasPlaceFields {
        // (undocumented)
        fields?: FieldMarks;
        // (undocumented)
        type: "MMoveIn";
        // (undocumented)
        value?: SetValue;
    }
    // (undocumented)
    export interface ModifyReattach extends HasOpId {
        // (undocumented)
        fields?: FieldMarks;
        // (undocumented)
        tomb: ChangesetTag;
        // (undocumented)
        type: "MRevive" | "MReturn";
        // (undocumented)
        value?: SetValue;
    }
    // (undocumented)
    export interface MoveEntry<TPath = TreeRootPath> {
        // (undocumented)
        dst: TPath;
        // (undocumented)
        hops?: TPath[];
        // (undocumented)
        id: OpId;
        // (undocumented)
        src: TPath;
    }
    // (undocumented)
    export interface MoveIn extends HasOpId, HasPlaceFields {
        count: NodeCount;
        // (undocumented)
        type: "MoveIn";
    }
    // (undocumented)
    export type NodeMark = Detach | Reattach;
    // (undocumented)
    export type ObjectMark = SizedObjectMark | Attach;
    export interface PeerChangeset {
        // (undocumented)
        marks: MarkList;
        // (undocumented)
        moves?: MoveEntry[];
    }
    // (undocumented)
    export interface PriorOp {
        // (undocumented)
        change: ChangesetTag;
        // (undocumented)
        id: OpId;
    }
    // (undocumented)
    export interface Reattach extends HasOpId {
        // (undocumented)
        count: NodeCount;
        // (undocumented)
        tomb: ChangesetTag;
        // (undocumented)
        type: "Revive" | "Return";
    }
    // (undocumented)
    export interface Scorch extends HasOpId, GapEffectPolicy {
        // (undocumented)
        type: "Scorch";
    }
    // (undocumented)
    export interface SetValue extends HasOpId {
        value?: TreeValue;
    }
    // (undocumented)
    export type SizedMark = Skip | SizedObjectMark;
    // (undocumented)
    export type SizedObjectMark = Tomb | Modify | Detach | Reattach | ModifyReattach | ModifyDetach | GapEffectSegment;
    // (undocumented)
    export interface Tomb {
        // (undocumented)
        change: ChangesetTag;
        // (undocumented)
        count: number;
        // (undocumented)
        type: "Tomb";
    }
    export interface Tombstones {
        // (undocumented)
        change: ChangesetTag;
        // (undocumented)
        count: NodeCount;
    }
    // (undocumented)
    export interface Unforward extends HasOpId, GapEffectPolicy {
        // (undocumented)
        type: "Unforward";
    }
}

// @public (undocumented)
export interface TreeForestPath {
    // (undocumented)
    [label: string]: TreeRootPath;
}

// @public (undocumented)
export interface TreeLocation {
    // (undocumented)
    readonly index: number;
    // (undocumented)
    readonly range: FieldLocation | DetachedField;
}

// @public (undocumented)
export const enum TreeNavigationResult {
    NotFound = -1,
    Ok = 1,
    Pending = 0
}

// @public (undocumented)
export type TreeRootPath = number | {
    [label: number]: TreeForestPath;
};

// @public (undocumented)
export interface TreeSchema {
    readonly extraGlobalFields: boolean;
    readonly extraLocalFields: FieldSchema;
    readonly globalFields: ReadonlySet<GlobalFieldKey>;
    readonly localFields: ReadonlyMap<LocalFieldKey, FieldSchema>;
    readonly value: ValueSchema;
}

// @public
export type TreeSchemaIdentifier = Brand<string, "tree.TreeSchemaIdentifier">;

// @public (undocumented)
export type TreeType = TreeSchemaIdentifier;

// @public
export type TreeTypeSet = ReadonlySet<TreeSchemaIdentifier> | undefined;

// @public
export interface TreeValue extends Serializable {
}

// @public @sealed
class UnitEncoder extends ChangeEncoder<0> {
    // (undocumented)
    decodeBinary(formatVersion: number, change: IsoBuffer): 0;
    // (undocumented)
    decodeJson(formatVersion: number, change: JsonCompatible): 0;
    // (undocumented)
    encodeBinary(formatVersion: number, change: 0): IsoBuffer;
    // (undocumented)
    encodeForJson(formatVersion: number, change: 0): JsonCompatible;
}

// @public
export type UnwrappedEditableField = UnwrappedEditableTree | undefined | readonly UnwrappedEditableTree[];

// @public
export type UnwrappedEditableTree = EditableTreeOrPrimitive | readonly UnwrappedEditableTree[];

// @public
export interface UpPath {
    // (undocumented)
    readonly parent: UpPath | undefined;
    readonly parentField: FieldKey;
    readonly parentIndex: number;
}

// @public (undocumented)
export interface UpPathWithFieldKinds extends UpPath {
    // (undocumented)
    readonly parent: UpPathWithFieldKinds | undefined;
    // (undocumented)
    readonly parentFieldKind: FieldKindIdentifier;
}

// @public
export type Value = undefined | TreeValue;

// @public
const value: FieldKind;

// @public (undocumented)
export interface ValueChange {
    value?: Value;
}

// @public @sealed
class ValueEncoder<T extends JsonCompatibleReadOnly> extends ChangeEncoder<T> {
    // (undocumented)
    decodeJson(formatVersion: number, change: JsonCompatibleReadOnly): T;
    // (undocumented)
    encodeForJson(formatVersion: number, change: T): JsonCompatibleReadOnly;
}

// @public
export type ValueFromBranded<T extends BrandedType<any, string>> = T extends BrandedType<infer ValueType, string> ? ValueType : never;

// @public
export enum ValueSchema {
    // (undocumented)
    Boolean = 3,
    // (undocumented)
    Nothing = 0,
    // (undocumented)
    Number = 1,
    Serializable = 4,
    // (undocumented)
    String = 2
}

// @public
export const valueSymbol: unique symbol;

// (No @packageDocumentation comment for this package)

```
