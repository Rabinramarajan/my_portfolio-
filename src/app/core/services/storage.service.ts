import {
  DestroyRef,
  EnvironmentInjector,
  Injectable,
  InjectionToken,
  Injector,
  PLATFORM_ID,
  type EnvironmentProviders,
  type ResourceRef,
  type Signal,
  type WritableSignal,
  computed,
  effect,
  inject,
  linkedSignal,
  makeEnvironmentProviders,
  resource,
  runInInjectionContext,
  signal,
  untracked,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

/* ==========================================================================================
 * 1. PUBLIC TYPES
 * ======================================================================================== */

/** Identifier of a concrete storage backend. */
export type StorageDriverType = 'local' | 'session' | 'indexeddb' | 'memory';

/** Lifecycle status of a bound storage signal. */
export type StorageSignalStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Origin of a change notification. */
export type StorageChangeSource = 'local' | 'remote' | 'expire' | 'clear';

/** A JSON-addressable storage key. */
export type StorageKey = string;

/** Serialized envelope persisted by every driver. */
export interface StorageEnvelope {
  /** Envelope schema version. */
  readonly sv: number;
  /** Encoded payload (JSON string, or base64 cipher text when encrypted). */
  readonly p: string;
  /** Created-at epoch ms. */
  readonly c: number;
  /** Updated-at epoch ms. */
  readonly u: number;
  /** Absolute expiry epoch ms (undefined = never). */
  readonly e?: number | undefined;
  /** Encryption marker. */
  readonly x?: boolean | undefined;
  /** Base64 IV when encrypted. */
  readonly iv?: string | undefined;
  /** Optional user metadata / tags. */
  readonly m?: Readonly<Record<string, string | number | boolean>> | undefined;
}

/** Metadata describing a stored record without materialising its value. */
export interface StorageRecordInfo {
  readonly key: StorageKey;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly expiresAt: number | undefined;
  readonly encrypted: boolean;
  readonly bytes: number;
}

/** Per-operation options. */
export interface StorageWriteOptions {
  /** Time-to-live in milliseconds from now. */
  readonly ttl?: number | undefined;
  /** Absolute expiry epoch ms — wins over {@link ttl}. */
  readonly expiresAt?: number | undefined;
  /** Encrypt this record (requires a configured passphrase). */
  readonly encrypt?: boolean | undefined;
  /** Arbitrary metadata stored alongside the value. */
  readonly meta?: Readonly<Record<string, string | number | boolean>> | undefined;
  /** Skip the write when the serialized payload is byte-identical. Default `true`. */
  readonly skipIdenticalWrites?: boolean | undefined;
  /** Broadcast this change to other tabs. Default `true`. */
  readonly broadcast?: boolean | undefined;
}

/** Per-read options. */
export interface StorageReadOptions<T> {
  /** Value returned when the key is missing or expired. */
  readonly fallback?: T | undefined;
  /** Bypass the in-memory LRU cache. */
  readonly bypassCache?: boolean | undefined;
  /** Validate the decoded value; a rejection surfaces as a validation error. */
  readonly validate?: StorageValidator<T> | undefined;
  /** Remove the record after a successful read. */
  readonly consume?: boolean | undefined;
}

/** Options accepted by every scoped operation. */
export interface StorageScopeOptions {
  /** Backend to target. Defaults to the instance driver. */
  readonly driver?: StorageDriverType | undefined;
  /** Key namespace override. */
  readonly namespace?: string | undefined;
}

/** Combined option bag used by most of the public API. */
export type StorageOptions<T = unknown> = StorageScopeOptions &
  StorageWriteOptions &
  StorageReadOptions<T>;

/** Root configuration for the service. */
export interface StorageConfig {
  /** Default backend. */
  readonly driver: StorageDriverType;
  /** Prefix applied to every key. */
  readonly namespace: string;
  /** Default TTL applied to writes without an explicit one. */
  readonly defaultTtl?: number | undefined;
  /** Encrypt every write by default. */
  readonly encryptByDefault: boolean;
  /** Passphrase for AES-GCM. Required when encryption is used. */
  readonly encryptionKey?: string | undefined;
  /** PBKDF2 iteration count. */
  readonly keyDerivationIterations: number;
  /** Max entries kept in the LRU read cache. */
  readonly cacheSize: number;
  /** Cache entry lifetime in ms. */
  readonly cacheTtl: number;
  /** Enable cross-tab synchronisation. */
  readonly syncAcrossTabs: boolean;
  /** BroadcastChannel name. */
  readonly channelName: string;
  /** Background expiry sweep interval in ms. `0` disables it. */
  readonly cleanupInterval: number;
  /** IndexedDB database name. */
  readonly dbName: string;
  /** IndexedDB object store name. */
  readonly dbStore: string;
  /** IndexedDB schema version. */
  readonly dbVersion: number;
  /** Secondary indexes created on the object store. */
  readonly dbIndexes: readonly StorageIndexDefinition[];
  /** Fall back to memory when the requested driver is unavailable. */
  readonly fallbackToMemory: boolean;
  /** Emit diagnostics through `console.debug`. */
  readonly debug: boolean;
}

/** IndexedDB secondary index declaration. */
export interface StorageIndexDefinition {
  readonly name: string;
  readonly keyPath: string | readonly string[];
  readonly unique?: boolean;
  readonly multiEntry?: boolean;
}

/** Change notification emitted by {@link StorageService.watch}. */
export interface StorageChangeEvent<T = unknown> {
  readonly key: StorageKey;
  readonly value: T | undefined;
  readonly previous: T | undefined;
  readonly driver: StorageDriverType;
  readonly source: StorageChangeSource;
  readonly timestamp: number;
}

/** Validation contract — return `true` or an error message. */
export type StorageValidator<T> = (value: unknown) => value is T;

/** Signal bound to a storage key. */
export interface StorageSignal<T> extends WritableSignal<T | undefined> {
  /** The key this signal mirrors. */
  readonly key: StorageKey;
  /** Reactive load status. */
  readonly status: Signal<StorageSignalStatus>;
  /** Last error, if any. */
  readonly error: Signal<StorageError | undefined>;
  /** `true` until the first read settles. */
  readonly loading: Signal<boolean>;
  /** Re-read the value from the backing driver. */
  readonly reload: () => Promise<T | undefined>;
  /** Delete the record and reset the signal. */
  readonly remove: () => Promise<void>;
  /** Detach the binding (does not delete the record). */
  readonly destroy: () => void;
}

/** Read-only projection of a storage signal. */
export type ReadonlyStorageSignal<T> = Signal<T | undefined>;

/** A single unit of work inside {@link StorageService.batch}. */
export type StorageBatchOperation =
  | {
      readonly type: 'set';
      readonly key: StorageKey;
      readonly value: unknown;
      readonly options?: StorageOptions;
    }
  | { readonly type: 'remove'; readonly key: StorageKey; readonly options?: StorageScopeOptions }
  | {
      readonly type: 'rename';
      readonly key: StorageKey;
      readonly to: StorageKey;
      readonly options?: StorageScopeOptions;
    }
  | { readonly type: 'clear'; readonly options?: StorageScopeOptions };

/** Transactional handle passed to {@link StorageService.transaction}. */
export interface StorageTransaction {
  readonly get: <T>(key: StorageKey) => Promise<T | undefined>;
  readonly set: <T>(key: StorageKey, value: T, options?: StorageWriteOptions) => Promise<void>;
  readonly remove: (key: StorageKey) => Promise<void>;
  readonly abort: (reason?: string) => never;
}

/** Cursor page returned by IndexedDB pagination. */
export interface StoragePage<T> {
  readonly items: readonly StorageEntryPair<T>[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}

/** Key/value tuple with metadata. */
export interface StorageEntryPair<T> {
  readonly key: StorageKey;
  readonly value: T;
  readonly info: StorageRecordInfo;
}

/** Serializable dump produced by {@link StorageService.export}. */
export interface StorageDump {
  readonly format: 'zv-storage';
  readonly version: number;
  readonly driver: StorageDriverType;
  readonly namespace: string;
  readonly exportedAt: number;
  readonly records: Readonly<Record<string, StorageEnvelope>>;
}

/** Aggregate runtime statistics. */
export interface StorageStats {
  readonly driver: StorageDriverType;
  readonly keys: number;
  readonly bytes: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly writes: number;
  readonly reads: number;
  readonly evictions: number;
  readonly signals: number;
}

/* ==========================================================================================
 * 2. ERRORS
 * ======================================================================================== */

/** Base class for every error raised by this service. */
export class StorageError extends Error {
  readonly code: string;
  readonly key: StorageKey | undefined;
  override readonly cause: unknown;

  constructor(code: string, message: string, key?: StorageKey, cause?: unknown) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.key = key;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Normalises any thrown value into a {@link StorageError}. */
  static from(error: unknown, code: string, message: string, key?: StorageKey): StorageError {
    return error instanceof StorageError ? error : new StorageError(code, message, key, error);
  }

  override toString(): string {
    return `${this.name}[${this.code}]: ${this.message}${this.key ? ` (key: ${this.key})` : ''}`;
  }
}

export class StorageUnavailableError extends StorageError {
  constructor(driver: StorageDriverType, cause?: unknown) {
    super(
      'STORAGE_UNAVAILABLE',
      `Storage driver "${driver}" is not available in this environment.`,
      undefined,
      cause,
    );
  }
}

export class StorageSerializationError extends StorageError {
  constructor(key: StorageKey | undefined, cause?: unknown) {
    super('SERIALIZATION_FAILED', 'Value could not be serialized.', key, cause);
  }
}

export class StorageDeserializationError extends StorageError {
  constructor(key: StorageKey | undefined, cause?: unknown) {
    super('DESERIALIZATION_FAILED', 'Stored payload could not be deserialized.', key, cause);
  }
}

export class StorageEncryptionError extends StorageError {
  constructor(message: string, key?: StorageKey, cause?: unknown) {
    super('ENCRYPTION_FAILED', message, key, cause);
  }
}

export class StorageQuotaExceededError extends StorageError {
  constructor(key: StorageKey, cause?: unknown) {
    super('QUOTA_EXCEEDED', 'The storage quota has been exceeded.', key, cause);
  }
}

export class StorageKeyError extends StorageError {
  constructor(message: string, key?: StorageKey) {
    super('INVALID_KEY', message, key);
  }
}

export class StorageValidationError extends StorageError {
  constructor(key: StorageKey, message = 'Stored value failed validation.') {
    super('VALIDATION_FAILED', message, key);
  }
}

export class StorageTypeError extends StorageError {
  constructor(key: StorageKey, expected: string, actual: string) {
    super(
      'TYPE_MISMATCH',
      `Expected stored value at "${key}" to be ${expected} but found ${actual}.`,
      key,
    );
  }
}

export class StorageTransactionError extends StorageError {
  constructor(message: string, cause?: unknown) {
    super('TRANSACTION_FAILED', message, undefined, cause);
  }
}

export class StorageDestroyedError extends StorageError {
  constructor() {
    super('DESTROYED', 'The storage service instance has been destroyed.');
  }
}

/* ==========================================================================================
 * 3. CONSTANTS & DEFAULTS
 * ======================================================================================== */

const ENVELOPE_VERSION = 1;
const DUMP_VERSION = 1;
const KEY_SEPARATOR = ':';
const TYPE_TAG = '__zvT';
const VALUE_TAG = '__zvV';
const PBKDF2_SALT = 'zv-storage/pbkdf2/v1';
const MAX_KEY_LENGTH = 512;
const IDB_KEY_PATH = 'key';

/** Immutable factory defaults. */
export const STORAGE_DEFAULT_CONFIG: StorageConfig = Object.freeze({
  driver: 'local',
  namespace: 'zv',
  defaultTtl: undefined,
  encryptByDefault: false,
  encryptionKey: undefined,
  keyDerivationIterations: 150_000,
  cacheSize: 256,
  cacheTtl: 60_000,
  syncAcrossTabs: true,
  channelName: 'zv-storage',
  cleanupInterval: 120_000,
  dbName: 'zv-storage-db',
  dbStore: 'records',
  dbVersion: 1,
  dbIndexes: Object.freeze([
    Object.freeze({ name: 'by_updated', keyPath: 'u' }),
    Object.freeze({ name: 'by_expires', keyPath: 'e' }),
  ]) as readonly StorageIndexDefinition[],
  fallbackToMemory: true,
  debug: false,
});

/** DI token carrying a partial configuration override. */
export const STORAGE_CONFIG = new InjectionToken<Partial<StorageConfig>>('ZV_STORAGE_CONFIG', {
  providedIn: 'root',
  factory: (): Partial<StorageConfig> => ({}),
});

/** DI token allowing a fully custom driver implementation to be injected. */
export const STORAGE_DRIVER_OVERRIDE = new InjectionToken<StorageDriverAdapter | null>(
  'ZV_STORAGE_DRIVER_OVERRIDE',
  { providedIn: 'root', factory: (): StorageDriverAdapter | null => null },
);

/** Provides a configured {@link StorageService} at the environment level. */
export const provideStorage = (config: Partial<StorageConfig> = {}): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: STORAGE_CONFIG, useValue: config }]);

/** Provides a bespoke driver implementation, bypassing the built-in factory. */
export const provideStorageDriver = (driver: StorageDriverAdapter): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: STORAGE_DRIVER_OVERRIDE, useValue: driver }]);

const mergeConfig = (overrides: Partial<StorageConfig>): StorageConfig => {
  const merged: StorageConfig = { ...STORAGE_DEFAULT_CONFIG, ...stripUndefined(overrides) };
  if (merged.encryptByDefault && !merged.encryptionKey) {
    throw new StorageEncryptionError('`encryptByDefault` requires an `encryptionKey`.');
  }
  return Object.freeze(merged);
};

const stripUndefined = <T extends object>(value: T): Partial<T> => {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(value)) {
    if (v !== undefined) {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
};

/* ==========================================================================================
 * 4. RICH SERIALIZATION
 * ======================================================================================== */

interface TypeCodec<T> {
  readonly tag: string;
  readonly test: (value: unknown) => value is T;
  readonly encode: (value: T) => unknown;
  readonly decode: (raw: unknown) => T;
  readonly encodeAsync?: (value: T) => Promise<unknown>;
}

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const TYPED_ARRAY_CTORS = {
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  BigInt64Array,
  BigUint64Array,
} as const;

type TypedArrayName = keyof typeof TYPED_ARRAY_CTORS;
type AnyTypedArray = InstanceType<(typeof TYPED_ARRAY_CTORS)[TypedArrayName]>;

const isTypedArray = (value: unknown): value is AnyTypedArray =>
  ArrayBuffer.isView(value) && !(value instanceof DataView);

class RichSerializer {
  private readonly codecs: readonly TypeCodec<never>[];

  constructor() {
    this.codecs = this.buildCodecs() as readonly TypeCodec<never>[];
  }

  readonly stringify = async (value: unknown, key?: StorageKey): Promise<string> => {
    try {
      const prepared = await this.encodeValue(value, new WeakMap<object, string>(), '$');
      return JSON.stringify(prepared);
    } catch (error) {
      throw new StorageSerializationError(key, error);
    }
  };

  readonly parse = <T>(payload: string, key?: StorageKey): T => {
    try {
      const raw: unknown = JSON.parse(payload);
      return this.decodeValue(raw, new Map<string, unknown>()) as T;
    } catch (error) {
      throw new StorageDeserializationError(key, error);
    }
  };

  readonly clone = <T>(value: T): T => {
    if (value === null || typeof value !== 'object') {
      return value;
    }
    if (typeof structuredClone === 'function') {
      try {
        return structuredClone(value);
      } catch {
        /* fall through to codec-based clone */
      }
    }
    return value;
  };

  private readonly buildCodecs = (): readonly TypeCodec<never>[] => {
    const codecs: TypeCodec<never>[] = [];
    const push = <T>(codec: TypeCodec<T>): void => {
      codecs.push(codec as unknown as TypeCodec<never>);
    };

    push<Date>({
      tag: 'Date',
      test: (v): v is Date => v instanceof Date,
      encode: (v) => (Number.isNaN(v.getTime()) ? null : v.toISOString()),
      decode: (raw) => (raw === null ? new Date(NaN) : new Date(String(raw))),
    });

    push<RegExp>({
      tag: 'RegExp',
      test: (v): v is RegExp => v instanceof RegExp,
      encode: (v) => ({ source: v.source, flags: v.flags }),
      decode: (raw) => {
        const { source, flags } = raw as { source: string; flags: string };
        return new RegExp(source, flags);
      },
    });

    push<bigint>({
      tag: 'BigInt',
      test: (v): v is bigint => typeof v === 'bigint',
      encode: (v) => v.toString(),
      decode: (raw) => BigInt(String(raw)),
    });

    push<Error>({
      tag: 'Error',
      test: (v): v is Error => v instanceof Error,
      encode: (v) => ({ name: v.name, message: v.message, stack: v.stack ?? null }),
      decode: (raw) => {
        const { name, message, stack } = raw as {
          name: string;
          message: string;
          stack: string | null;
        };
        const error = new Error(message);
        error.name = name;
        if (stack) {
          error.stack = stack;
        }
        return error;
      },
    });

    push<ArrayBuffer>({
      tag: 'ArrayBuffer',
      test: (v): v is ArrayBuffer => v instanceof ArrayBuffer,
      encode: (v) => bytesToBase64(new Uint8Array(v)),
      decode: (raw) => {
        const bytes = base64ToBytes(String(raw));
        return bytes.slice().buffer as ArrayBuffer;
      },
    });

    push<AnyTypedArray>({
      tag: 'TypedArray',
      test: (v): v is AnyTypedArray => isTypedArray(v),
      encode: (v) => ({
        ctor: v.constructor.name,
        data: bytesToBase64(new Uint8Array(v.buffer, v.byteOffset, v.byteLength)),
      }),
      decode: (raw) => {
        const { ctor, data } = raw as { ctor: TypedArrayName; data: string };
        const Ctor = TYPED_ARRAY_CTORS[ctor] ?? Uint8Array;
        const bytes = base64ToBytes(data);
        return new Ctor(bytes.slice().buffer) as AnyTypedArray;
      },
    });

    push<DataView>({
      tag: 'DataView',
      test: (v): v is DataView => v instanceof DataView,
      encode: (v) => bytesToBase64(new Uint8Array(v.buffer, v.byteOffset, v.byteLength)),
      decode: (raw) => new DataView(base64ToBytes(String(raw)).slice().buffer),
    });

    const hasFile = typeof File !== 'undefined';
    const hasBlob = typeof Blob !== 'undefined';

    if (hasFile) {
      push<File>({
        tag: 'File',
        test: (v): v is File => v instanceof File,
        encode: () => {
          throw new StorageSerializationError(undefined, 'File requires async serialization.');
        },
        encodeAsync: async (v) => ({
          name: v.name,
          type: v.type,
          lastModified: v.lastModified,
          data: bytesToBase64(new Uint8Array(await v.arrayBuffer())),
        }),
        decode: (raw) => {
          const { name, type, lastModified, data } = raw as {
            name: string;
            type: string;
            lastModified: number;
            data: string;
          };
          return new File([base64ToBytes(data) as unknown as BlobPart], name, {
            type,
            lastModified,
          });
        },
      });
    }

    if (hasBlob) {
      push<Blob>({
        tag: 'Blob',
        test: (v): v is Blob => v instanceof Blob,
        encode: () => {
          throw new StorageSerializationError(undefined, 'Blob requires async serialization.');
        },
        encodeAsync: async (v) => ({
          type: v.type,
          data: bytesToBase64(new Uint8Array(await v.arrayBuffer())),
        }),
        decode: (raw) => {
          const { type, data } = raw as { type: string; data: string };
          return new Blob([base64ToBytes(data) as unknown as BlobPart], { type });
        },
      });
    }

    return codecs;
  };

  private readonly findCodec = (value: unknown): TypeCodec<never> | undefined =>
    this.codecs.find((codec) => codec.test(value as never));

  private readonly encodeValue = async (
    value: unknown,
    seen: WeakMap<object, string>,
    path: string,
  ): Promise<unknown> => {
    if (value === undefined) {
      return { [TYPE_TAG]: 'undefined' };
    }
    if (value === null || typeof value === 'string' || typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      if (Number.isNaN(value)) return { [TYPE_TAG]: 'NaN' };
      if (value === Infinity) return { [TYPE_TAG]: 'Infinity' };
      if (value === -Infinity) return { [TYPE_TAG]: '-Infinity' };
      return value;
    }
    if (typeof value === 'function' || typeof value === 'symbol') {
      throw new TypeError(`Values of type "${typeof value}" cannot be persisted.`);
    }

    const codec = this.findCodec(value);
    if (codec) {
      const encoded = codec.encodeAsync
        ? await codec.encodeAsync(value as never)
        : codec.encode(value as never);
      return { [TYPE_TAG]: codec.tag, [VALUE_TAG]: encoded };
    }

    if (typeof value === 'object') {
      const existing = seen.get(value as object);
      if (existing !== undefined) {
        return { [TYPE_TAG]: 'Ref', [VALUE_TAG]: existing };
      }
      seen.set(value as object, path);

      if (value instanceof Map) {
        const pairs: unknown[] = [];
        let i = 0;
        for (const [k, v] of value) {
          pairs.push([
            await this.encodeValue(k, seen, `${path}.m${i}k`),
            await this.encodeValue(v, seen, `${path}.m${i}v`),
          ]);
          i++;
        }
        return { [TYPE_TAG]: 'Map', [VALUE_TAG]: pairs, __zvP: path };
      }

      if (value instanceof Set) {
        const items: unknown[] = [];
        let i = 0;
        for (const v of value) {
          items.push(await this.encodeValue(v, seen, `${path}.s${i++}`));
        }
        return { [TYPE_TAG]: 'Set', [VALUE_TAG]: items, __zvP: path };
      }

      if (Array.isArray(value)) {
        const out: unknown[] = [];
        for (let i = 0; i < value.length; i++) {
          out.push(await this.encodeValue(value[i], seen, `${path}.${i}`));
        }
        return { [TYPE_TAG]: 'Array', [VALUE_TAG]: out, __zvP: path };
      }

      const record = value as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const objectKey of Object.keys(record)) {
        out[objectKey] = await this.encodeValue(record[objectKey], seen, `${path}.${objectKey}`);
      }
      return { [TYPE_TAG]: 'Object', [VALUE_TAG]: out, __zvP: path };
    }

    return value;
  };

  private readonly decodeValue = (raw: unknown, refs: Map<string, unknown>): unknown => {
    if (raw === null || typeof raw !== 'object') {
      return raw;
    }
    if (Array.isArray(raw)) {
      return raw.map((item) => this.decodeValue(item, refs));
    }

    const tagged = raw as Record<string, unknown>;
    const tag = tagged[TYPE_TAG];
    if (typeof tag !== 'string') {
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(tagged)) {
        out[key] = this.decodeValue(tagged[key], refs);
      }
      return out;
    }

    const path = typeof tagged['__zvP'] === 'string' ? (tagged['__zvP'] as string) : undefined;
    const payload = tagged[VALUE_TAG];

    switch (tag) {
      case 'undefined':
        return undefined;
      case 'NaN':
        return NaN;
      case 'Infinity':
        return Infinity;
      case '-Infinity':
        return -Infinity;
      case 'Ref':
        return refs.get(String(payload));
      case 'Array': {
        const out: unknown[] = [];
        if (path) refs.set(path, out);
        for (const item of payload as unknown[]) {
          out.push(this.decodeValue(item, refs));
        }
        return out;
      }
      case 'Object': {
        const out: Record<string, unknown> = {};
        if (path) refs.set(path, out);
        const source = payload as Record<string, unknown>;
        for (const key of Object.keys(source)) {
          out[key] = this.decodeValue(source[key], refs);
        }
        return out;
      }
      case 'Map': {
        const out = new Map<unknown, unknown>();
        if (path) refs.set(path, out);
        for (const [k, v] of payload as [unknown, unknown][]) {
          out.set(this.decodeValue(k, refs), this.decodeValue(v, refs));
        }
        return out;
      }
      case 'Set': {
        const out = new Set<unknown>();
        if (path) refs.set(path, out);
        for (const item of payload as unknown[]) {
          out.add(this.decodeValue(item, refs));
        }
        return out;
      }
      default: {
        const codec = this.codecs.find((c) => c.tag === tag);
        if (!codec) {
          throw new TypeError(`Unknown serialization tag "${tag}".`);
        }
        return codec.decode(payload);
      }
    }
  };
}

/* ==========================================================================================
 * 5. LRU CACHE
 * ======================================================================================== */

interface CacheSlot<V> {
  value: V;
  expiresAt: number;
  bytes: number;
}

class LruCache<V> {
  private readonly slots = new Map<string, CacheSlot<V>>();
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;

  constructor(
    private readonly capacity: number,
    private readonly ttl: number,
  ) {}

  get hits(): number {
    return this.hitCount;
  }
  get misses(): number {
    return this.missCount;
  }
  get evictions(): number {
    return this.evictionCount;
  }
  get size(): number {
    return this.slots.size;
  }

  readonly get = (key: string): V | undefined => {
    const slot = this.slots.get(key);
    if (!slot) {
      this.missCount++;
      return undefined;
    }
    if (slot.expiresAt <= Date.now()) {
      this.slots.delete(key);
      this.missCount++;
      return undefined;
    }
    this.slots.delete(key);
    this.slots.set(key, slot);
    this.hitCount++;
    return slot.value;
  };

  readonly set = (key: string, value: V, bytes = 0): void => {
    if (this.capacity <= 0) {
      return;
    }
    if (this.slots.has(key)) {
      this.slots.delete(key);
    }
    this.slots.set(key, { value, bytes, expiresAt: Date.now() + this.ttl });
    while (this.slots.size > this.capacity) {
      const oldest = this.slots.keys().next();
      if (oldest.done === true) break;
      this.slots.delete(oldest.value);
      this.evictionCount++;
    }
  };

  readonly has = (key: string): boolean => this.get(key) !== undefined;

  readonly delete = (key: string): void => {
    this.slots.delete(key);
  };

  readonly deleteByPrefix = (prefix: string): void => {
    for (const key of [...this.slots.keys()]) {
      if (key.startsWith(prefix)) {
        this.slots.delete(key);
      }
    }
  };

  readonly clear = (): void => {
    this.slots.clear();
  };

  readonly prune = (): number => {
    const now = Date.now();
    let removed = 0;
    for (const [key, slot] of [...this.slots.entries()]) {
      if (slot.expiresAt <= now) {
        this.slots.delete(key);
        removed++;
      }
    }
    return removed;
  };
}

/* ==========================================================================================
 * 6. SCHEDULING HELPERS
 * ======================================================================================== */

type IdleHandle = number;

interface IdleWindow {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
}

const scheduleIdle = (work: () => void, timeout = 2_000): IdleHandle => {
  const scope = globalThis as unknown as IdleWindow;
  if (typeof scope.requestIdleCallback === 'function') {
    return scope.requestIdleCallback(work, { timeout });
  }
  return setTimeout(work, 0) as unknown as IdleHandle;
};

const cancelIdle = (handle: IdleHandle): void => {
  const scope = globalThis as unknown as IdleWindow;
  if (typeof scope.cancelIdleCallback === 'function') {
    scope.cancelIdleCallback(handle);
    return;
  }
  clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
};

const microtask = (work: () => void): void => {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(work);
    return;
  }
  void Promise.resolve().then(work);
};

class InflightRegistry {
  private readonly pending = new Map<string, Promise<unknown>>();

  readonly run = async <T>(key: string, factory: () => Promise<T>): Promise<T> => {
    const existing = this.pending.get(key);
    if (existing) {
      return existing as Promise<T>;
    }
    const task = factory().finally(() => this.pending.delete(key));
    this.pending.set(key, task);
    return task;
  };

  readonly clear = (): void => this.pending.clear();
}

/* ==========================================================================================
 * 7. ENCRYPTION (Web Crypto, AES-GCM + PBKDF2)
 * ======================================================================================== */

interface CipherResult {
  readonly payload: string;
  readonly iv: string;
}

class CryptoBox {
  private keyPromise: Promise<CryptoKey> | undefined;

  constructor(
    private readonly passphrase: string | undefined,
    private readonly iterations: number,
  ) {}

  get available(): boolean {
    return (
      !!this.passphrase &&
      typeof globalThis.crypto !== 'undefined' &&
      typeof globalThis.crypto.subtle !== 'undefined'
    );
  }

  readonly encrypt = async (plaintext: string, key?: StorageKey): Promise<CipherResult> => {
    this.assertAvailable(key);
    try {
      const cryptoKey = await this.deriveKey();
      const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(plaintext);
      const cipher = await globalThis.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encoded as unknown as BufferSource,
      );
      return { payload: bytesToBase64(new Uint8Array(cipher)), iv: bytesToBase64(iv) };
    } catch (error) {
      throw new StorageEncryptionError('Failed to encrypt the value.', key, error);
    }
  };

  readonly decrypt = async (payload: string, iv: string, key?: StorageKey): Promise<string> => {
    this.assertAvailable(key);
    try {
      const cryptoKey = await this.deriveKey();
      const plain = await globalThis.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToBytes(iv) as unknown as BufferSource },
        cryptoKey,
        base64ToBytes(payload) as unknown as BufferSource,
      );
      return new TextDecoder().decode(plain);
    } catch (error) {
      throw new StorageEncryptionError(
        'Failed to decrypt the value — wrong key or corrupt data.',
        key,
        error,
      );
    }
  };

  readonly reset = (): void => {
    this.keyPromise = undefined;
  };

  private readonly assertAvailable = (key?: StorageKey): void => {
    if (!this.passphrase) {
      throw new StorageEncryptionError('No `encryptionKey` configured.', key);
    }
    if (typeof globalThis.crypto?.subtle === 'undefined') {
      throw new StorageEncryptionError(
        'Web Crypto SubtleCrypto is unavailable (requires a secure context).',
        key,
      );
    }
  };

  private readonly deriveKey = (): Promise<CryptoKey> => {
    this.keyPromise ??= (async (): Promise<CryptoKey> => {
      const encoder = new TextEncoder();
      const material = await globalThis.crypto.subtle.importKey(
        'raw',
        encoder.encode(this.passphrase ?? '') as unknown as BufferSource,
        'PBKDF2',
        false,
        ['deriveKey'],
      );
      return globalThis.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode(PBKDF2_SALT) as unknown as BufferSource,
          iterations: this.iterations,
          hash: 'SHA-256',
        },
        material,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
      );
    })();
    return this.keyPromise;
  };
}

/* ==========================================================================================
 * 8. DRIVER ADAPTERS
 * ======================================================================================== */

export interface StorageDriverAdapter {
  readonly type: StorageDriverType;
  readonly init: () => Promise<void>;
  readonly read: (key: string) => Promise<string | null>;
  readonly write: (key: string, payload: string) => Promise<void>;
  readonly delete: (key: string) => Promise<void>;
  readonly clearAll: (prefix: string) => Promise<void>;
  readonly listKeys: (prefix: string) => Promise<readonly string[]>;
  readonly listEntries: (prefix: string) => Promise<readonly (readonly [string, string])[]>;
  readonly bulkWrite: (records: readonly (readonly [string, string])[]) => Promise<void>;
  readonly bulkDelete: (keys: readonly string[]) => Promise<void>;
  readonly dispose: () => void;
}

export class MemoryStorageDriver implements StorageDriverAdapter {
  readonly type: StorageDriverType = 'memory';
  private readonly map = new Map<string, string>();

  readonly init = async (): Promise<void> => undefined;

  readonly read = async (key: string): Promise<string | null> => this.map.get(key) ?? null;

  readonly write = async (key: string, payload: string): Promise<void> => {
    this.map.set(key, payload);
  };

  readonly delete = async (key: string): Promise<void> => {
    this.map.delete(key);
  };

  readonly clearAll = async (prefix: string): Promise<void> => {
    for (const key of [...this.map.keys()]) {
      if (key.startsWith(prefix)) {
        this.map.delete(key);
      }
    }
  };

  readonly listKeys = async (prefix: string): Promise<readonly string[]> =>
    [...this.map.keys()].filter((key) => key.startsWith(prefix));

  readonly listEntries = async (prefix: string): Promise<readonly (readonly [string, string])[]> =>
    [...this.map.entries()].filter(([key]) => key.startsWith(prefix));

  readonly bulkWrite = async (records: readonly (readonly [string, string])[]): Promise<void> => {
    for (const [key, payload] of records) {
      this.map.set(key, payload);
    }
  };

  readonly bulkDelete = async (keys: readonly string[]): Promise<void> => {
    for (const key of keys) {
      this.map.delete(key);
    }
  };

  readonly dispose = (): void => {
    this.map.clear();
  };
}

export class WebStorageDriver implements StorageDriverAdapter {
  readonly type: StorageDriverType;
  private readonly area: Storage;

  private constructor(type: 'local' | 'session', area: Storage) {
    this.type = type;
    this.area = area;
  }

  static create(type: 'local' | 'session'): WebStorageDriver | null {
    try {
      const scope = globalThis as unknown as { localStorage?: Storage; sessionStorage?: Storage };
      const area = type === 'local' ? scope.localStorage : scope.sessionStorage;
      if (!area) {
        return null;
      }
      const probe = `__zv_probe_${Date.now()}__`;
      area.setItem(probe, '1');
      area.removeItem(probe);
      return new WebStorageDriver(type, area);
    } catch {
      return null;
    }
  }

  readonly init = async (): Promise<void> => undefined;

  readonly read = async (key: string): Promise<string | null> => this.area.getItem(key);

  readonly write = async (key: string, payload: string): Promise<void> => {
    try {
      this.area.setItem(key, payload);
    } catch (error) {
      if (isQuotaError(error)) {
        throw new StorageQuotaExceededError(key, error);
      }
      throw new StorageError('WRITE_FAILED', 'Web storage write failed.', key, error);
    }
  };

  readonly delete = async (key: string): Promise<void> => {
    this.area.removeItem(key);
  };

  readonly clearAll = async (prefix: string): Promise<void> => {
    for (const key of this.rawKeys()) {
      if (key.startsWith(prefix)) {
        this.area.removeItem(key);
      }
    }
  };

  readonly listKeys = async (prefix: string): Promise<readonly string[]> =>
    this.rawKeys().filter((key) => key.startsWith(prefix));

  readonly listEntries = async (
    prefix: string,
  ): Promise<readonly (readonly [string, string])[]> => {
    const out: (readonly [string, string])[] = [];
    for (const key of this.rawKeys()) {
      if (!key.startsWith(prefix)) continue;
      const value = this.area.getItem(key);
      if (value !== null) {
        out.push([key, value] as const);
      }
    }
    return out;
  };

  readonly bulkWrite = async (records: readonly (readonly [string, string])[]): Promise<void> => {
    for (const [key, payload] of records) {
      await this.write(key, payload);
    }
  };

  readonly bulkDelete = async (keys: readonly string[]): Promise<void> => {
    for (const key of keys) {
      this.area.removeItem(key);
    }
  };

  readonly dispose = (): void => undefined;

  private readonly rawKeys = (): string[] => {
    const keys: string[] = [];
    for (let i = 0; i < this.area.length; i++) {
      const key = this.area.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return keys;
  };
}

const isQuotaError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const name = error.name;
  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED';
};

interface IdbRow {
  readonly key: string;
  readonly payload: string;
  readonly u: number;
  readonly e: number;
}

export class IndexedDbStorageDriver implements StorageDriverAdapter {
  readonly type: StorageDriverType = 'indexeddb';
  private db: IDBDatabase | undefined;
  private opening: Promise<IDBDatabase> | undefined;

  constructor(
    private readonly dbName: string,
    private readonly storeName: string,
    private readonly version: number,
    private readonly indexes: readonly StorageIndexDefinition[],
  ) {}

  static isSupported(): boolean {
    const scope = globalThis as unknown as { indexedDB?: IDBFactory };
    return typeof scope.indexedDB !== 'undefined' && scope.indexedDB !== null;
  }

  readonly init = async (): Promise<void> => {
    await this.openDatabase();
  };

  readonly openDatabase = (): Promise<IDBDatabase> => {
    if (this.db) {
      return Promise.resolve(this.db);
    }
    this.opening ??= new Promise<IDBDatabase>((resolve, reject) => {
      if (!IndexedDbStorageDriver.isSupported()) {
        reject(new StorageUnavailableError('indexeddb'));
        return;
      }
      const request = indexedDB.open(this.dbName, this.version);
      request.onupgradeneeded = (event): void => {
        this.upgradeDatabase(request.result, event.oldVersion, request.transaction);
      };
      request.onsuccess = (): void => {
        this.db = request.result;
        this.db.onversionchange = (): void => {
          this.db?.close();
          this.db = undefined;
          this.opening = undefined;
        };
        resolve(request.result);
      };
      request.onerror = (): void =>
        reject(
          new StorageError('DB_OPEN_FAILED', 'Failed to open IndexedDB.', undefined, request.error),
        );
      request.onblocked = (): void =>
        reject(new StorageError('DB_BLOCKED', 'IndexedDB upgrade is blocked by another tab.'));
    }).catch((error: unknown) => {
      this.opening = undefined;
      throw error;
    });
    return this.opening;
  };

  readonly upgradeDatabase = (
    db: IDBDatabase,
    _oldVersion: number,
    tx: IDBTransaction | null,
  ): void => {
    const store = db.objectStoreNames.contains(this.storeName)
      ? tx?.objectStore(this.storeName)
      : this.createObjectStore(db);
    if (!store) {
      return;
    }
    for (const index of this.indexes) {
      if (!store.indexNames.contains(index.name)) {
        store.createIndex(index.name, index.keyPath as string | string[], {
          unique: index.unique ?? false,
          multiEntry: index.multiEntry ?? false,
        });
      }
    }
  };

  readonly createObjectStore = (db: IDBDatabase): IDBObjectStore =>
    db.createObjectStore(this.storeName, { keyPath: IDB_KEY_PATH });

  readonly read = async (key: string): Promise<string | null> => {
    const row = await this.getRow(key);
    return row?.payload ?? null;
  };

  readonly getRow = async (key: string): Promise<IdbRow | undefined> =>
    this.withStore('readonly', (store) => store.get(key) as IDBRequest<IdbRow | undefined>);

  readonly write = async (key: string, payload: string): Promise<void> => {
    await this.put(key, payload);
  };

  readonly put = async (
    key: string,
    payload: string,
    updatedAt = Date.now(),
    expiresAt = 0,
  ): Promise<void> => {
    const row: IdbRow = { key, payload, u: updatedAt, e: expiresAt };
    await this.withStore('readwrite', (store) => store.put(row) as IDBRequest<IDBValidKey>);
  };

  readonly bulkPut = async (records: readonly (readonly [string, string])[]): Promise<void> => {
    if (records.length === 0) return;
    const db = await this.openDatabase();
    await this.runTransaction(db, 'readwrite', (store) => {
      const now = Date.now();
      for (const [key, payload] of records) {
        store.put({ key, payload, u: now, e: 0 } satisfies IdbRow);
      }
    });
  };

  readonly delete = async (key: string): Promise<void> => {
    await this.withStore(
      'readwrite',
      (store) => store.delete(key) as unknown as IDBRequest<undefined>,
    );
  };

  readonly bulkDelete = async (keys: readonly string[]): Promise<void> => {
    if (keys.length === 0) return;
    const db = await this.openDatabase();
    await this.runTransaction(db, 'readwrite', (store) => {
      for (const key of keys) {
        store.delete(key);
      }
    });
  };

  readonly bulkWrite = async (records: readonly (readonly [string, string])[]): Promise<void> =>
    this.bulkPut(records);

  readonly clearAll = async (prefix: string): Promise<void> => {
    if (prefix.length === 0) {
      await this.clear();
      return;
    }
    const keys = await this.listKeys(prefix);
    await this.bulkDelete(keys);
  };

  readonly clear = async (): Promise<void> => {
    await this.withStore('readwrite', (store) => store.clear() as unknown as IDBRequest<undefined>);
  };

  readonly listKeys = async (prefix: string): Promise<readonly string[]> => {
    const keys = await this.withStore(
      'readonly',
      (store) => store.getAllKeys() as IDBRequest<IDBValidKey[]>,
    );
    return (keys ?? []).map(String).filter((key) => key.startsWith(prefix));
  };

  readonly listEntries = async (
    prefix: string,
  ): Promise<readonly (readonly [string, string])[]> => {
    const rows = await this.withStore(
      'readonly',
      (store) => store.getAll() as IDBRequest<IdbRow[]>,
    );
    return (rows ?? [])
      .filter((row) => row.key.startsWith(prefix))
      .map((row) => [row.key, row.payload] as const);
  };

  readonly cursor = async (
    prefix: string,
    visitor: (row: IdbRow) => boolean | void,
    direction: IDBCursorDirection = 'next',
    indexName?: string,
  ): Promise<void> => {
    const db = await this.openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const source =
        indexName && store.indexNames.contains(indexName) ? store.index(indexName) : store;
      const request = source.openCursor(null, direction);
      request.onsuccess = (): void => {
        const cursor = request.result;
        if (!cursor) {
          resolve();
          return;
        }
        const row = cursor.value as IdbRow;
        if (row.key.startsWith(prefix) && visitor(row) === false) {
          resolve();
          return;
        }
        cursor.continue();
      };
      request.onerror = (): void =>
        reject(
          new StorageError('CURSOR_FAILED', 'IndexedDB cursor failed.', undefined, request.error),
        );
    });
  };

  readonly pagination = async (
    prefix: string,
    page: number,
    pageSize: number,
    direction: IDBCursorDirection = 'next',
  ): Promise<{ rows: readonly IdbRow[]; total: number }> => {
    const safePage = Math.max(0, Math.trunc(page));
    const safeSize = Math.max(1, Math.trunc(pageSize));
    const skip = safePage * safeSize;
    const rows: IdbRow[] = [];
    let seen = 0;
    await this.cursor(
      prefix,
      (row) => {
        if (seen++ < skip) return;
        if (rows.length < safeSize) {
          rows.push(row);
        }
      },
      direction,
    );
    return { rows, total: seen };
  };

  readonly search = async (
    prefix: string,
    term: string,
    limit = 50,
  ): Promise<readonly IdbRow[]> => {
    const needle = term.toLowerCase();
    const rows: IdbRow[] = [];
    await this.cursor(prefix, (row) => {
      if (row.key.toLowerCase().includes(needle) || row.payload.toLowerCase().includes(needle)) {
        rows.push(row);
      }
      return rows.length < limit;
    });
    return rows;
  };

  readonly transactions = async <T>(
    mode: IDBTransactionMode,
    work: (store: IDBObjectStore) => T,
  ): Promise<T> => {
    const db = await this.openDatabase();
    return this.runTransaction(db, mode, work);
  };

  readonly dispose = (): void => {
    this.db?.close();
    this.db = undefined;
    this.opening = undefined;
  };

  private readonly runTransaction = async <T>(
    db: IDBDatabase,
    mode: IDBTransactionMode,
    work: (store: IDBObjectStore) => T,
  ): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      let result!: T;
      let tx: IDBTransaction;
      try {
        tx = db.transaction(this.storeName, mode);
      } catch (error) {
        reject(new StorageTransactionError('Failed to start an IndexedDB transaction.', error));
        return;
      }
      tx.oncomplete = (): void => resolve(result);
      tx.onerror = (): void =>
        reject(new StorageTransactionError('IndexedDB transaction failed.', tx.error));
      tx.onabort = (): void =>
        reject(new StorageTransactionError('IndexedDB transaction aborted.', tx.error));
      try {
        result = work(tx.objectStore(this.storeName));
      } catch (error) {
        tx.abort();
        reject(new StorageTransactionError('IndexedDB transaction body threw.', error));
      }
    });

  private readonly withStore = async <T>(
    mode: IDBTransactionMode,
    work: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> => {
    const db = await this.openDatabase();
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(this.storeName, mode);
      const request = work(tx.objectStore(this.storeName));
      request.onsuccess = (): void => resolve(request.result);
      request.onerror = (): void =>
        reject(
          new StorageError(
            'IDB_REQUEST_FAILED',
            'IndexedDB request failed.',
            undefined,
            request.error,
          ),
        );
    });
  };
}

/* ==========================================================================================
 * 9. DRIVER FACTORY
 * ======================================================================================== */

interface DriverResolution {
  readonly adapter: StorageDriverAdapter;
  readonly requested: StorageDriverType;
  readonly degraded: boolean;
}

const createDriver = (
  requested: StorageDriverType,
  config: StorageConfig,
  isBrowser: boolean,
): DriverResolution => {
  const degrade = (): DriverResolution => {
    if (!config.fallbackToMemory) {
      throw new StorageUnavailableError(requested);
    }
    return { adapter: new MemoryStorageDriver(), requested, degraded: true };
  };

  if (!isBrowser || requested === 'memory') {
    return {
      adapter: new MemoryStorageDriver(),
      requested,
      degraded: requested !== 'memory',
    };
  }

  switch (requested) {
    case 'local':
    case 'session': {
      const adapter = WebStorageDriver.create(requested);
      return adapter ? { adapter, requested, degraded: false } : degrade();
    }
    case 'indexeddb': {
      if (!IndexedDbStorageDriver.isSupported()) {
        return degrade();
      }
      return {
        adapter: new IndexedDbStorageDriver(
          config.dbName,
          config.dbStore,
          config.dbVersion,
          config.dbIndexes,
        ),
        requested,
        degraded: false,
      };
    }
    default:
      return degrade();
  }
};

/* ==========================================================================================
 * 10. VALIDATION HELPERS
 * ======================================================================================== */

export const StorageValidators = {
  string: (v: unknown): v is string => typeof v === 'string',
  number: (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v),
  boolean: (v: unknown): v is boolean => typeof v === 'boolean',
  date: (v: unknown): v is Date => v instanceof Date && !Number.isNaN(v.getTime()),
  array:
    <T>(item?: StorageValidator<T>) =>
    (v: unknown): v is T[] =>
      Array.isArray(v) && (item === undefined || v.every((entry) => item(entry))),
  record:
    <T>(item?: StorageValidator<T>) =>
    (v: unknown): v is Record<string, T> =>
      typeof v === 'object' &&
      v !== null &&
      !Array.isArray(v) &&
      (item === undefined ||
        Object.values(v as Record<string, unknown>).every((entry) => item(entry))),
  oneOf:
    <T extends string | number>(...allowed: readonly T[]) =>
    (v: unknown): v is T =>
      allowed.includes(v as T),
  shape:
    <T extends Record<string, unknown>>(shape: {
      readonly [K in keyof T]: StorageValidator<T[K]>;
    }) =>
    (v: unknown): v is T => {
      if (typeof v !== 'object' || v === null) return false;
      const record = v as Record<string, unknown>;
      return Object.entries(shape).every(([key, check]) =>
        (check as StorageValidator<unknown>)(record[key]),
      );
    },
} as const;

/* ==========================================================================================
 * 11. THE SERVICE
 * ======================================================================================== */

interface SignalBinding<T> {
  readonly source: WritableSignal<T | undefined>;
  readonly status: WritableSignal<StorageSignalStatus>;
  readonly error: WritableSignal<StorageError | undefined>;
  readonly handle: StorageSignal<T>;
  refCount: number;
}

interface SyncMessage {
  readonly kind: 'set' | 'remove' | 'clear';
  readonly key: string;
  readonly driver: StorageDriverType;
  readonly origin: string;
  readonly at: number;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly driverOverride = inject(STORAGE_DRIVER_OVERRIDE, { optional: true });

  readonly config: StorageConfig = mergeConfig(inject(STORAGE_CONFIG, { optional: true }) ?? {});

  readonly isBrowser: boolean = isPlatformBrowser(this.platformId);

  private readonly serializer = new RichSerializer();
  private readonly crypto = new CryptoBox(
    this.config.encryptionKey,
    this.config.keyDerivationIterations,
  );
  private readonly cache = new LruCache<unknown>(this.config.cacheSize, this.config.cacheTtl);
  private readonly inflight = new InflightRegistry();
  private readonly bindings = new Map<string, SignalBinding<unknown>>();
  private readonly watchers = new Map<string, Set<(event: StorageChangeEvent) => void>>();
  private readonly snapshots = new Map<string, StorageDump>();
  private readonly drivers = new Map<StorageDriverType, StorageDriverAdapter>();
  private readonly instanceId = `zv-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;

  private channel: BroadcastChannel | undefined;
  private storageListener: ((event: StorageEvent) => void) | undefined;
  private cleanupTimer: ReturnType<typeof setInterval> | undefined;
  private idleHandle: IdleHandle | undefined;
  private destroyed = false;

  private readonly revision = signal(0);
  private readonly readCount = signal(0);
  private readonly writeCount = signal(0);
  private readonly lastErrorSignal = signal<StorageError | undefined>(undefined);
  private readonly keyCount = signal(0);
  private readonly byteCount = signal(0);

  readonly version: Signal<number> = this.revision.asReadonly();

  readonly lastError: Signal<StorageError | undefined> = this.lastErrorSignal.asReadonly();

  readonly stats: Signal<StorageStats> = computed(() => {
    this.revision();
    return {
      driver: this.activeDriverType(),
      keys: this.keyCount(),
      bytes: this.byteCount(),
      cacheHits: this.cache.hits,
      cacheMisses: this.cache.misses,
      writes: this.writeCount(),
      reads: this.readCount(),
      evictions: this.cache.evictions,
      signals: this.bindings.size,
    } satisfies StorageStats;
  });

  private readonly activeDriverType = signal<StorageDriverType>(this.config.driver);

  readonly degraded = signal(false);

  readonly driver: Signal<StorageDriverType> = this.activeDriverType.asReadonly();

  readonly statusLine = linkedSignal<StorageDriverType, string>({
    source: () => this.activeDriverType(),
    computation: (driverType) =>
      `${driverType}${this.degraded() ? ' (degraded)' : ''} · ns="${this.config.namespace}"`,
  });

  constructor() {
    const resolved = createDriver(this.config.driver, this.config, this.isBrowser);
    const adapter = this.driverOverride ?? resolved.adapter;
    this.drivers.set(adapter.type, adapter);
    this.drivers.set(resolved.requested, adapter);
    this.activeDriverType.set(adapter.type);
    this.degraded.set(this.driverOverride ? false : resolved.degraded);

    void adapter
      .init()
      .catch((error: unknown) => this.reportError(error, 'INIT_FAILED', 'Driver init failed.'));

    if (this.isBrowser) {
      this.installTabSync();
      this.installBackgroundCleanup();
      this.scheduleStatsRefresh();
    }

    effect(
      () => {
        if (this.degraded() && this.config.debug) {
          this.log(
            `Requested driver "${this.config.driver}" unavailable — using "${this.activeDriverType()}".`,
          );
        }
      },
      { injector: this.injector },
    );

    this.destroyRef.onDestroy(() => this.destroy());
  }

  async set<T>(key: StorageKey, value: T, options: StorageOptions<T> = {}): Promise<void> {
    this.assertAlive();
    this.assertKey(key);

    const adapter = await this.resolveDriver(options.driver);
    const scoped = this.scopedKey(key, options);
    const previous = await this.peek<T>(key, options);

    const encrypt = options.encrypt ?? this.config.encryptByDefault;
    const now = Date.now();
    const expiresAt = this.resolveExpiry(options, now);

    let payload = await this.serializer.stringify(value, key);
    let iv: string | undefined;

    if (encrypt) {
      const cipher = await this.crypto.encrypt(payload, key);
      payload = cipher.payload;
      iv = cipher.iv;
    }

    const envelope: StorageEnvelope = {
      sv: ENVELOPE_VERSION,
      p: payload,
      c: previous === undefined ? now : (this.cacheMeta(scoped)?.createdAt ?? now),
      u: now,
      ...(expiresAt !== undefined ? { e: expiresAt } : {}),
      ...(encrypt ? { x: true, iv } : {}),
      ...(options.meta ? { m: options.meta } : {}),
    };

    const serialized = JSON.stringify(envelope);
    const skipIdentical = options.skipIdenticalWrites ?? true;

    if (skipIdentical && !encrypt) {
      const existing = await adapter.read(scoped);
      if (existing !== null && this.samePayload(existing, serialized)) {
        this.pushToSignal(key, value, options);
        return;
      }
    }

    try {
      await adapter.write(scoped, serialized);
    } catch (error) {
      throw this.reportError(error, 'WRITE_FAILED', `Failed to write "${key}".`, key);
    }

    this.cache.set(scoped, { value, envelope }, serialized.length);
    this.writeCount.update((n) => n + 1);
    this.bump();
    this.pushToSignal(key, value, options);
    this.notify({ key, value, previous, driver: adapter.type, source: 'local', timestamp: now });

    if (options.broadcast ?? true) {
      this.broadcast({ kind: 'set', key, driver: adapter.type, origin: this.instanceId, at: now });
    }
    this.scheduleStatsRefresh();
  }

  async get<T>(key: StorageKey, options: StorageOptions<T> = {}): Promise<T | undefined> {
    this.assertAlive();
    this.assertKey(key);

    const adapter = await this.resolveDriver(options.driver);
    const scoped = this.scopedKey(key, options);

    return this.inflight.run(`${adapter.type}${KEY_SEPARATOR}${scoped}`, async () => {
      this.readCount.update((n) => n + 1);

      if (!options.bypassCache) {
        const cached = this.cache.get(scoped) as
          { value: T; envelope: StorageEnvelope } | undefined;
        if (cached) {
          if (this.isExpired(cached.envelope)) {
            await this.expireRecord(key, adapter, scoped);
            return options.fallback;
          }
          return this.finishRead(key, cached.value, options, adapter, scoped);
        }
      }

      const raw = await adapter.read(scoped);
      if (raw === null) {
        return options.fallback;
      }

      const envelope = this.parseEnvelope(raw, key);
      if (this.isExpired(envelope)) {
        await this.expireRecord(key, adapter, scoped);
        return options.fallback;
      }

      const plaintext = envelope.x
        ? await this.crypto.decrypt(envelope.p, envelope.iv ?? '', key)
        : envelope.p;

      const value = this.serializer.parse<T>(plaintext, key);
      this.cache.set(scoped, { value, envelope }, raw.length);
      return this.finishRead(key, value, options, adapter, scoped);
    });
  }

  private async peek<T>(key: StorageKey, options: StorageScopeOptions): Promise<T | undefined> {
    try {
      const adapter = await this.resolveDriver(options.driver);
      const scoped = this.scopedKey(key, options);
      const cached = this.cache.get(scoped) as { value: T } | undefined;
      if (cached) {
        return cached.value;
      }
      const raw = await adapter.read(scoped);
      if (raw === null) return undefined;
      const envelope = this.parseEnvelope(raw, key);
      if (this.isExpired(envelope)) return undefined;
      const plaintext = envelope.x
        ? await this.crypto.decrypt(envelope.p, envelope.iv ?? '', key)
        : envelope.p;
      return this.serializer.parse<T>(plaintext, key);
    } catch {
      return undefined;
    }
  }

  async remove(
    key: StorageKey,
    options: StorageScopeOptions & { broadcast?: boolean | undefined } = {},
  ): Promise<void> {
    this.assertAlive();
    this.assertKey(key);

    const adapter = await this.resolveDriver(options.driver);
    const scoped = this.scopedKey(key, options);
    const previous = await this.peek(key, options);

    await adapter.delete(scoped);
    this.cache.delete(scoped);
    this.bump();
    this.pushToSignal(key, undefined, options);
    this.notify({
      key,
      value: undefined,
      previous,
      driver: adapter.type,
      source: 'local',
      timestamp: Date.now(),
    });

    if (options.broadcast ?? true) {
      this.broadcast({
        kind: 'remove',
        key,
        driver: adapter.type,
        origin: this.instanceId,
        at: Date.now(),
      });
    }
    this.scheduleStatsRefresh();
  }

  async clear(
    options: StorageScopeOptions & { broadcast?: boolean | undefined } = {},
  ): Promise<void> {
    this.assertAlive();
    const adapter = await this.resolveDriver(options.driver);
    const prefix = this.prefix(options);

    await adapter.clearAll(prefix);
    this.cache.deleteByPrefix(prefix);
    this.bump();

    for (const [key, binding] of this.bindings) {
      binding.source.set(undefined);
      this.notify({
        key,
        value: undefined,
        previous: undefined,
        driver: adapter.type,
        source: 'clear',
        timestamp: Date.now(),
      });
    }

    if (options.broadcast ?? true) {
      this.broadcast({
        kind: 'clear',
        key: '*',
        driver: adapter.type,
        origin: this.instanceId,
        at: Date.now(),
      });
    }
    this.scheduleStatsRefresh();
  }

  async exists(key: StorageKey, options: StorageScopeOptions = {}): Promise<boolean> {
    this.assertKey(key);
    const adapter = await this.resolveDriver(options.driver);
    const scoped = this.scopedKey(key, options);
    if (this.cache.has(scoped)) {
      return true;
    }
    const raw = await adapter.read(scoped);
    if (raw === null) return false;
    return !this.isExpired(this.parseEnvelope(raw, key));
  }

  async has(
    key: StorageKey,
    member?: unknown,
    options: StorageScopeOptions = {},
  ): Promise<boolean> {
    if (member === undefined) {
      return this.exists(key, options);
    }
    const value = await this.get<unknown>(key, options);
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.includes(member);
    if (value instanceof Set) return value.has(member);
    if (value instanceof Map) return value.has(member);
    if (typeof value === 'string') return value.includes(String(member));
    if (typeof value === 'object')
      return Object.prototype.hasOwnProperty.call(value, String(member));
    return Object.is(value, member);
  }

  async keys(options: StorageScopeOptions = {}): Promise<readonly StorageKey[]> {
    const adapter = await this.resolveDriver(options.driver);
    const prefix = this.prefix(options);
    const raw = await adapter.listKeys(prefix);
    return raw.map((key) => this.logicalKey(key, prefix));
  }

  async values<T>(options: StorageScopeOptions = {}): Promise<readonly T[]> {
    const pairs = await this.entries<T>(options);
    return pairs.map(([, value]) => value);
  }

  async entries<T>(
    options: StorageScopeOptions = {},
  ): Promise<readonly (readonly [StorageKey, T])[]> {
    const adapter = await this.resolveDriver(options.driver);
    const prefix = this.prefix(options);
    const rows = await adapter.listEntries(prefix);
    const out: (readonly [StorageKey, T])[] = [];

    for (const [rawKey, raw] of rows) {
      const key = this.logicalKey(rawKey, prefix);
      try {
        const envelope = this.parseEnvelope(raw, key);
        if (this.isExpired(envelope)) continue;
        const plaintext = envelope.x
          ? await this.crypto.decrypt(envelope.p, envelope.iv ?? '', key)
          : envelope.p;
        out.push([key, this.serializer.parse<T>(plaintext, key)] as const);
      } catch (error) {
        this.reportError(error, 'ENTRY_DECODE_FAILED', `Skipping unreadable record "${key}".`, key);
      }
    }
    return out;
  }

  async size(options: StorageScopeOptions = {}): Promise<number> {
    const adapter = await this.resolveDriver(options.driver);
    const rows = await adapter.listEntries(this.prefix(options));
    return rows.reduce((total, [key, payload]) => total + key.length * 2 + payload.length * 2, 0);
  }

  async count(options: StorageScopeOptions = {}): Promise<number> {
    const adapter = await this.resolveDriver(options.driver);
    const rows = await adapter.listEntries(this.prefix(options));
    let live = 0;
    for (const [, payload] of rows) {
      try {
        if (!this.isExpired(this.parseEnvelope(payload))) live++;
      } catch {
        /* unreadable rows are not counted */
      }
    }
    return live;
  }

  async info(
    key: StorageKey,
    options: StorageScopeOptions = {},
  ): Promise<StorageRecordInfo | undefined> {
    const adapter = await this.resolveDriver(options.driver);
    const scoped = this.scopedKey(key, options);
    const raw = await adapter.read(scoped);
    if (raw === null) return undefined;
    const envelope = this.parseEnvelope(raw, key);
    return {
      key,
      createdAt: envelope.c,
      updatedAt: envelope.u,
      expiresAt: envelope.e,
      encrypted: envelope.x === true,
      bytes: raw.length * 2,
    };
  }

  async rename(from: StorageKey, to: StorageKey, options: StorageOptions = {}): Promise<void> {
    this.assertKey(from);
    this.assertKey(to);
    if (from === to) return;

    const adapter = await this.resolveDriver(options.driver);
    const raw = await adapter.read(this.scopedKey(from, options));
    if (raw === null) {
      throw new StorageKeyError(`Cannot rename "${from}" — the key does not exist.`, from);
    }
    await adapter.write(this.scopedKey(to, options), raw);
    await adapter.delete(this.scopedKey(from, options));

    this.cache.delete(this.scopedKey(from, options));
    this.cache.delete(this.scopedKey(to, options));
    this.bump();

    const value = await this.peek(to, options);
    this.pushToSignal(from, undefined, options);
    this.pushToSignal(to, value, options);
    this.broadcast({
      kind: 'set',
      key: to,
      driver: adapter.type,
      origin: this.instanceId,
      at: Date.now(),
    });
    this.broadcast({
      kind: 'remove',
      key: from,
      driver: adapter.type,
      origin: this.instanceId,
      at: Date.now(),
    });
  }

  async copy(from: StorageKey, to: StorageKey, options: StorageOptions = {}): Promise<void> {
    const value = await this.get<unknown>(from, options);
    if (value === undefined) {
      throw new StorageKeyError(`Cannot copy "${from}" — the key does not exist.`, from);
    }
    await this.set(to, value, options);
  }

  async move(
    from: StorageKey,
    to: StorageKey,
    options: StorageOptions & { targetDriver?: StorageDriverType } = {},
  ): Promise<void> {
    const value = await this.get<unknown>(from, options);
    if (value === undefined) {
      throw new StorageKeyError(`Cannot move "${from}" — the key does not exist.`, from);
    }
    await this.set(to, value, { ...options, driver: options.targetDriver ?? options.driver });
    await this.remove(from, options);
  }

  async update<T>(
    key: StorageKey,
    updater: (current: T | undefined) => T,
    options: StorageOptions<T> = {},
  ): Promise<T> {
    const current = await this.get<T>(key, options);
    const next = updater(current);
    await this.set(key, next, options);
    return next;
  }

  async merge<T extends object>(
    key: StorageKey,
    patch: Partial<T>,
    options: StorageOptions<T> = {},
  ): Promise<T> {
    const current = await this.get<T>(key, options);
    if (current !== undefined && current instanceof Map) {
      const next = new Map(current);
      for (const [k, v] of Object.entries(patch)) {
        next.set(k, v);
      }
      await this.set(key, next as unknown as T, options);
      return next as unknown as T;
    }
    if (current !== undefined && (typeof current !== 'object' || Array.isArray(current))) {
      throw new StorageTypeError(
        key,
        'an object',
        Array.isArray(current) ? 'an array' : typeof current,
      );
    }
    const next = { ...(current ?? ({} as T)), ...patch } as T;
    await this.set(key, next, options);
    return next;
  }

  async push<T>(key: StorageKey, ...items: readonly T[]): Promise<readonly T[]> {
    return this.mutateArray<T>(key, (list) => [...list, ...items], {});
  }

  async pop<T>(
    key: StorageKey,
    options: StorageOptions<readonly T[]> = {},
  ): Promise<T | undefined> {
    const list = await this.readArray<T>(key, options);
    if (list.length === 0) return undefined;
    const next = list.slice(0, -1);
    await this.set(key, next, options as StorageOptions);
    return list[list.length - 1];
  }

  async shift<T>(
    key: StorageKey,
    options: StorageOptions<readonly T[]> = {},
  ): Promise<T | undefined> {
    const list = await this.readArray<T>(key, options);
    if (list.length === 0) return undefined;
    await this.set(key, list.slice(1), options as StorageOptions);
    return list[0];
  }

  async unshift<T>(key: StorageKey, ...items: readonly T[]): Promise<readonly T[]> {
    return this.mutateArray<T>(key, (list) => [...items, ...list], {});
  }

  async append<T>(
    key: StorageKey,
    addition: T | string,
    options: StorageOptions = {},
  ): Promise<unknown> {
    const current = await this.get<unknown>(key, options);
    if (typeof current === 'string' || (current === undefined && typeof addition === 'string')) {
      const next = `${(current as string | undefined) ?? ''}${String(addition)}`;
      await this.set(key, next, options);
      return next;
    }
    return this.mutateArray(key, (list) => [...list, addition], options);
  }

  async prepend<T>(
    key: StorageKey,
    addition: T | string,
    options: StorageOptions = {},
  ): Promise<unknown> {
    const current = await this.get<unknown>(key, options);
    if (typeof current === 'string' || (current === undefined && typeof addition === 'string')) {
      const next = `${String(addition)}${(current as string | undefined) ?? ''}`;
      await this.set(key, next, options);
      return next;
    }
    return this.mutateArray(key, (list) => [addition, ...list], options);
  }

  async toggle(key: StorageKey, options: StorageOptions<boolean> = {}): Promise<boolean> {
    const current = await this.get<boolean>(key, options);
    if (current !== undefined && typeof current !== 'boolean') {
      throw new StorageTypeError(key, 'a boolean', typeof current);
    }
    const next = !(current ?? false);
    await this.set(key, next, options as StorageOptions);
    return next;
  }

  async increment(
    key: StorageKey,
    step = 1,
    options: StorageOptions<number> = {},
  ): Promise<number> {
    return this.mutateNumber(key, (n) => n + step, options);
  }

  async decrement(
    key: StorageKey,
    step = 1,
    options: StorageOptions<number> = {},
  ): Promise<number> {
    return this.mutateNumber(key, (n) => n - step, options);
  }

  async expire(
    key: StorageKey,
    ttl: number | null,
    options: StorageScopeOptions = {},
  ): Promise<void> {
    const adapter = await this.resolveDriver(options.driver);
    const scoped = this.scopedKey(key, options);
    const raw = await adapter.read(scoped);
    if (raw === null) {
      throw new StorageKeyError(`Cannot set a TTL on "${key}" — the key does not exist.`, key);
    }
    const envelope = this.parseEnvelope(raw, key);
    const next: StorageEnvelope =
      ttl === null
        ? { ...envelope, e: undefined, u: Date.now() }
        : { ...envelope, e: Date.now() + Math.max(0, ttl), u: Date.now() };

    await adapter.write(scoped, JSON.stringify(next));
    this.cache.delete(scoped);
    this.bump();
  }

  async refresh<T>(key: StorageKey, options: StorageOptions<T> = {}): Promise<T | undefined> {
    const scoped = this.scopedKey(key, options);
    this.cache.delete(scoped);
    const value = await this.get<T>(key, { ...options, bypassCache: true });
    this.pushToSignal(key, value, options);
    return value;
  }

  async cleanup(options: StorageScopeOptions = {}): Promise<number> {
    const adapter = await this.resolveDriver(options.driver);
    const prefix = this.prefix(options);
    const rows = await adapter.listEntries(prefix);
    const doomed: string[] = [];

    for (const [rawKey, payload] of rows) {
      try {
        if (this.isExpired(this.parseEnvelope(payload))) {
          doomed.push(rawKey);
        }
      } catch {
        doomed.push(rawKey);
      }
    }

    if (doomed.length > 0) {
      await adapter.bulkDelete(doomed);
      for (const rawKey of doomed) {
        const key = this.logicalKey(rawKey, prefix);
        this.cache.delete(rawKey);
        this.pushToSignal(key, undefined, options);
        this.notify({
          key,
          value: undefined,
          previous: undefined,
          driver: adapter.type,
          source: 'expire',
          timestamp: Date.now(),
        });
      }
      this.bump();
    }

    this.cache.prune();
    this.scheduleStatsRefresh();
    return doomed.length;
  }

  async clearExpired(options: StorageScopeOptions = {}): Promise<number> {
    return this.cleanup(options);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.cleanupTimer !== undefined) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    if (this.idleHandle !== undefined) {
      cancelIdle(this.idleHandle);
      this.idleHandle = undefined;
    }
    if (this.storageListener && this.isBrowser) {
      (globalThis as unknown as Window).removeEventListener('storage', this.storageListener);
      this.storageListener = undefined;
    }
    this.channel?.close();
    this.channel = undefined;

    for (const adapter of new Set(this.drivers.values())) {
      adapter.dispose();
    }
    this.drivers.clear();
    this.bindings.clear();
    this.watchers.clear();
    this.snapshots.clear();
    this.cache.clear();
    this.inflight.clear();
    this.crypto.reset();
  }

  async batch(operations: readonly StorageBatchOperation[]): Promise<void> {
    this.assertAlive();
    const rollback: (() => Promise<void>)[] = [];

    try {
      for (const op of operations) {
        switch (op.type) {
          case 'set': {
            const previous = await this.peek(op.key, op.options ?? {});
            rollback.push(async () => {
              if (previous === undefined) {
                await this.remove(op.key, op.options ?? {});
              } else {
                await this.set(op.key, previous, op.options ?? {});
              }
            });
            await this.set(op.key, op.value, op.options ?? {});
            break;
          }
          case 'remove': {
            const previous = await this.peek(op.key, op.options ?? {});
            rollback.push(async () => {
              if (previous !== undefined) {
                await this.set(op.key, previous, op.options ?? {});
              }
            });
            await this.remove(op.key, op.options ?? {});
            break;
          }
          case 'rename': {
            rollback.push(async () => {
              await this.rename(op.to, op.key, op.options ?? {}).catch(() => undefined);
            });
            await this.rename(op.key, op.to, op.options ?? {});
            break;
          }
          case 'clear': {
            const dump = await this.export(op.options ?? {});
            rollback.push(async () => {
              await this.import(dump, { ...(op.options ?? {}), merge: false });
            });
            await this.clear(op.options ?? {});
            break;
          }
        }
      }
    } catch (error) {
      for (const undo of rollback.reverse()) {
        await undo().catch(() => undefined);
      }
      throw StorageError.from(error, 'BATCH_FAILED', 'Batch failed and was rolled back.');
    }
  }

  async transaction<T>(
    work: (tx: StorageTransaction) => Promise<T> | T,
    options: StorageScopeOptions = {},
  ): Promise<T> {
    this.assertAlive();

    const staged = new Map<
      StorageKey,
      { value: unknown; options?: StorageWriteOptions | undefined } | null
    >();
    let aborted = false;

    const tx: StorageTransaction = {
      get: async <V>(key: StorageKey): Promise<V | undefined> => {
        if (staged.has(key)) {
          const entry = staged.get(key);
          return entry === null ? undefined : (this.serializer.clone(entry?.value) as V);
        }
        return this.get<V>(key, options);
      },
      set: async <V>(
        key: StorageKey,
        value: V,
        writeOptions?: StorageWriteOptions,
      ): Promise<void> => {
        this.assertKey(key);
        staged.set(key, { value, options: writeOptions });
      },
      remove: async (key: StorageKey): Promise<void> => {
        staged.set(key, null);
      },
      abort: (reason = 'Transaction aborted by caller.'): never => {
        aborted = true;
        throw new StorageTransactionError(reason);
      },
    };

    let result: T;
    try {
      result = await work(tx);
    } catch (error) {
      throw aborted
        ? (error as StorageTransactionError)
        : new StorageTransactionError('Transaction body failed; no changes were committed.', error);
    }

    const commit: StorageBatchOperation[] = [...staged.entries()].map(([key, entry]) =>
      entry === null
        ? ({ type: 'remove', key, options } as const)
        : ({
            type: 'set',
            key,
            value: entry.value,
            options: { ...options, ...entry.options },
          } as const),
    );

    await this.batch(commit);
    return result;
  }

  signal<T>(key: StorageKey, initial?: T, options: StorageOptions<T> = {}): StorageSignal<T> {
    this.assertAlive();
    this.assertKey(key);

    const existing = this.bindings.get(key) as SignalBinding<T> | undefined;
    if (existing) {
      existing.refCount++;
      return existing.handle;
    }

    const source = signal<T | undefined>(initial);
    const status = signal<StorageSignalStatus>('idle');
    const error = signal<StorageError | undefined>(undefined);

    const rawSet = source.set.bind(source);
    const rawUpdate = source.update.bind(source);

    const load = async (): Promise<T | undefined> => {
      status.set('loading');
      try {
        const value = await this.get<T>(key, { ...options, bypassCache: true });
        const next = value === undefined ? initial : value;
        rawSet(next);
        status.set('ready');
        error.set(undefined);
        return next;
      } catch (cause) {
        const wrapped = StorageError.from(
          cause,
          'SIGNAL_LOAD_FAILED',
          `Failed to load "${key}".`,
          key,
        );
        error.set(wrapped);
        status.set('error');
        return undefined;
      }
    };

    const persist = (value: T | undefined): void => {
      if (value === undefined) {
        void this.remove(key, options).catch((cause: unknown) => {
          error.set(
            StorageError.from(cause, 'SIGNAL_REMOVE_FAILED', `Failed to remove "${key}".`, key),
          );
          status.set('error');
        });
        return;
      }
      void this.set(key, value, options).catch((cause: unknown) => {
        error.set(
          StorageError.from(cause, 'SIGNAL_WRITE_FAILED', `Failed to persist "${key}".`, key),
        );
        status.set('error');
      });
    };

    const handle = source as unknown as {
      set: (value: T | undefined) => void;
      update: (fn: (value: T | undefined) => T | undefined) => void;
    } & StorageSignal<T>;

    handle.set = (value: T | undefined): void => {
      rawSet(value);
      persist(value);
    };
    handle.update = (fn: (value: T | undefined) => T | undefined): void => {
      rawUpdate(fn);
      persist(untracked(source));
    };

    Object.defineProperties(handle, {
      key: { value: key, enumerable: true },
      status: { value: status.asReadonly(), enumerable: true },
      error: { value: error.asReadonly(), enumerable: true },
      loading: { value: computed(() => status() === 'loading'), enumerable: true },
      reload: { value: load, enumerable: true },
      remove: {
        value: async (): Promise<void> => {
          await this.remove(key, options);
          rawSet(undefined);
        },
        enumerable: true,
      },
      destroy: {
        value: (): void => {
          const binding = this.bindings.get(key);
          if (!binding) return;
          binding.refCount--;
          if (binding.refCount <= 0) {
            this.bindings.delete(key);
          }
        },
        enumerable: true,
      },
    });

    const binding: SignalBinding<T> = {
      source,
      status,
      error,
      handle,
      refCount: 1,
    };
    this.bindings.set(key, binding as unknown as SignalBinding<unknown>);

    microtask(() => void load());

    return handle;
  }

  computed<T, R>(
    key: StorageKey,
    project: (value: T | undefined) => R,
    options: StorageOptions<T> = {},
  ): Signal<R> {
    const source = this.signal<T>(key, options.fallback as T | undefined, options);
    return computed(() => project(source()));
  }

  resource<T>(key: StorageKey, options: StorageOptions<T> = {}): ResourceRef<T | undefined> {
    this.assertKey(key);
    return runInInjectionContext(this.environmentInjector, () =>
      resource<T | undefined, number>({
        params: () => this.revision(),
        loader: async () => this.get<T>(key, { ...options, bypassCache: true }),
        injector: this.environmentInjector,
      }),
    );
  }

  watch<T>(key: StorageKey, listener: (event: StorageChangeEvent<T>) => void): () => void {
    this.assertKey(key);
    const set = this.watchers.get(key) ?? new Set<(event: StorageChangeEvent) => void>();
    set.add(listener as (event: StorageChangeEvent) => void);
    this.watchers.set(key, set);
    return () => {
      set.delete(listener as (event: StorageChangeEvent) => void);
      if (set.size === 0) {
        this.watchers.delete(key);
      }
    };
  }

  observe<T>(key: StorageKey): Observable<StorageChangeEvent<T>> {
    return new Observable<StorageChangeEvent<T>>((subscriber) => {
      const unwatch = this.watch<T>(key, (event) => subscriber.next(event));
      return () => unwatch();
    });
  }

  store<T extends object>(
    key: StorageKey,
    initial: T,
    options: StorageOptions<T> = {},
  ): {
    readonly value: Signal<T>;
    readonly status: Signal<StorageSignalStatus>;
    readonly patch: (partial: Partial<T>) => void;
    readonly replace: (next: T) => void;
    readonly reset: () => void;
    readonly select: <R>(project: (value: T) => R) => Signal<R>;
  } {
    const bound = this.signal<T>(key, initial, options);
    const value = computed(() => bound() ?? initial);

    return {
      value,
      status: bound.status,
      patch: (partial: Partial<T>): void => bound.set({ ...untracked(value), ...partial }),
      replace: (next: T): void => bound.set(next),
      reset: (): void => bound.set(initial),
      select: <R>(project: (v: T) => R): Signal<R> => computed(() => project(value())),
    };
  }

  async snapshot(label = 'default', options: StorageScopeOptions = {}): Promise<StorageDump> {
    const dump = await this.export(options);
    this.snapshots.set(label, dump);
    return dump;
  }

  async restore(label = 'default', options: StorageScopeOptions = {}): Promise<void> {
    const dump = this.snapshots.get(label);
    if (!dump) {
      throw new StorageKeyError(`No snapshot named "${label}" was captured.`);
    }
    await this.import(dump, { ...options, merge: false });
  }

  async export(options: StorageScopeOptions = {}): Promise<StorageDump> {
    const adapter = await this.resolveDriver(options.driver);
    const prefix = this.prefix(options);
    const rows = await adapter.listEntries(prefix);
    const records: Record<string, StorageEnvelope> = {};

    for (const [rawKey, payload] of rows) {
      try {
        records[this.logicalKey(rawKey, prefix)] = this.parseEnvelope(payload);
      } catch {
        /* skip corrupt rows rather than failing the whole export */
      }
    }

    return {
      format: 'zv-storage',
      version: DUMP_VERSION,
      driver: adapter.type,
      namespace: options.namespace ?? this.config.namespace,
      exportedAt: Date.now(),
      records,
    };
  }

  async import(
    dump: StorageDump | string,
    options: StorageScopeOptions & { merge?: boolean } = {},
  ): Promise<number> {
    const parsed: StorageDump = typeof dump === 'string' ? (JSON.parse(dump) as StorageDump) : dump;
    if (parsed.format !== 'zv-storage') {
      throw new StorageDeserializationError(undefined, 'Unrecognised dump format.');
    }

    const adapter = await this.resolveDriver(options.driver);
    if (options.merge === false) {
      await this.clear({ ...options, broadcast: false });
    }

    const records: (readonly [string, string])[] = Object.entries(parsed.records).map(
      ([key, envelope]) => [this.scopedKey(key, options), JSON.stringify(envelope)] as const,
    );

    await adapter.bulkWrite(records);
    this.cache.deleteByPrefix(this.prefix(options));
    this.bump();

    for (const key of Object.keys(parsed.records)) {
      void this.refresh(key, options);
    }
    this.scheduleStatsRefresh();
    return records.length;
  }

  async paginate<T>(
    page: number,
    pageSize = 25,
    options: StorageScopeOptions = {},
  ): Promise<StoragePage<T>> {
    const adapter = await this.resolveDriver(options.driver ?? 'indexeddb');
    const prefix = this.prefix(options);

    if (!(adapter instanceof IndexedDbStorageDriver)) {
      const all = await this.entries<T>(options);
      const start = Math.max(0, page) * pageSize;
      const slice = all.slice(start, start + pageSize);
      return {
        items: slice.map(([key, value]) => ({
          key,
          value,
          info: {
            key,
            createdAt: 0,
            updatedAt: 0,
            expiresAt: undefined,
            encrypted: false,
            bytes: 0,
          },
        })),
        page,
        pageSize,
        total: all.length,
        hasNext: start + pageSize < all.length,
        hasPrevious: start > 0,
      };
    }

    const { rows, total } = await adapter.pagination(prefix, page, pageSize);
    const items: StorageEntryPair<T>[] = [];
    for (const row of rows) {
      const key = this.logicalKey(row.key, prefix);
      const envelope = this.parseEnvelope(row.payload, key);
      if (this.isExpired(envelope)) continue;
      const plaintext = envelope.x
        ? await this.crypto.decrypt(envelope.p, envelope.iv ?? '', key)
        : envelope.p;
      items.push({
        key,
        value: this.serializer.parse<T>(plaintext, key),
        info: {
          key,
          createdAt: envelope.c,
          updatedAt: envelope.u,
          expiresAt: envelope.e,
          encrypted: envelope.x === true,
          bytes: row.payload.length * 2,
        },
      });
    }

    const start = Math.max(0, page) * pageSize;
    return {
      items,
      page,
      pageSize,
      total,
      hasNext: start + pageSize < total,
      hasPrevious: start > 0,
    };
  }

  async search<T>(
    term: string,
    options: StorageScopeOptions & { limit?: number } = {},
  ): Promise<readonly StorageEntryPair<T>[]> {
    const limit = options.limit ?? 50;
    const adapter = await this.resolveDriver(options.driver);
    const prefix = this.prefix(options);
    const needle = term.toLowerCase();

    const rows: (readonly [string, string])[] =
      adapter instanceof IndexedDbStorageDriver
        ? (await adapter.search(prefix, term, limit)).map((row) => [row.key, row.payload] as const)
        : (await adapter.listEntries(prefix)).filter(
            ([key, payload]) =>
              key.toLowerCase().includes(needle) || payload.toLowerCase().includes(needle),
          );

    const out: StorageEntryPair<T>[] = [];
    for (const [rawKey, payload] of rows.slice(0, limit)) {
      const key = this.logicalKey(rawKey, prefix);
      try {
        const envelope = this.parseEnvelope(payload, key);
        if (this.isExpired(envelope)) continue;
        const plaintext = envelope.x
          ? await this.crypto.decrypt(envelope.p, envelope.iv ?? '', key)
          : envelope.p;
        out.push({
          key,
          value: this.serializer.parse<T>(plaintext, key),
          info: {
            key,
            createdAt: envelope.c,
            updatedAt: envelope.u,
            expiresAt: envelope.e,
            encrypted: envelope.x === true,
            bytes: payload.length * 2,
          },
        });
      } catch {
        /* unreadable rows are silently skipped from search results */
      }
    }
    return out;
  }

  private async resolveDriver(type?: StorageDriverType): Promise<StorageDriverAdapter> {
    this.assertAlive();
    const requested = type ?? this.activeDriverType();
    const existing = this.drivers.get(requested);
    if (existing) {
      return existing;
    }
    const resolved = createDriver(requested, this.config, this.isBrowser);
    await resolved.adapter.init();
    this.drivers.set(requested, resolved.adapter);
    this.drivers.set(resolved.adapter.type, resolved.adapter);
    return resolved.adapter;
  }

  private readonly prefix = (options: StorageScopeOptions): string => {
    const namespace = options.namespace ?? this.config.namespace;
    return namespace.length > 0 ? `${namespace}${KEY_SEPARATOR}` : '';
  };

  private readonly scopedKey = (key: StorageKey, options: StorageScopeOptions): string =>
    `${this.prefix(options)}${key}`;

  private readonly logicalKey = (rawKey: string, prefix: string): StorageKey =>
    prefix.length > 0 && rawKey.startsWith(prefix) ? rawKey.slice(prefix.length) : rawKey;

  private readonly assertKey = (key: StorageKey): void => {
    if (typeof key !== 'string' || key.length === 0) {
      throw new StorageKeyError('Storage keys must be non-empty strings.');
    }
    if (key.length > MAX_KEY_LENGTH) {
      throw new StorageKeyError(`Storage keys must be at most ${MAX_KEY_LENGTH} characters.`, key);
    }
  };

  private readonly assertAlive = (): void => {
    if (this.destroyed) {
      throw new StorageDestroyedError();
    }
  };

  private readonly parseEnvelope = (raw: string, key?: StorageKey): StorageEnvelope => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new StorageDeserializationError(key, error);
    }
    if (typeof parsed !== 'object' || parsed === null) {
      throw new StorageDeserializationError(key, 'Envelope is not an object.');
    }
    const candidate = parsed as Partial<StorageEnvelope>;
    if (typeof candidate.p !== 'string' || typeof candidate.sv !== 'number') {
      throw new StorageDeserializationError(key, 'Envelope is missing required fields.');
    }
    return {
      sv: candidate.sv,
      p: candidate.p,
      c: candidate.c ?? Date.now(),
      u: candidate.u ?? Date.now(),
      e: candidate.e,
      x: candidate.x,
      iv: candidate.iv,
      m: candidate.m,
    };
  };

  private readonly isExpired = (envelope: StorageEnvelope): boolean =>
    typeof envelope.e === 'number' && envelope.e > 0 && envelope.e <= Date.now();

  private readonly resolveExpiry = (
    options: StorageWriteOptions,
    now: number,
  ): number | undefined => {
    if (typeof options.expiresAt === 'number') return options.expiresAt;
    if (typeof options.ttl === 'number') return now + Math.max(0, options.ttl);
    if (typeof this.config.defaultTtl === 'number') return now + this.config.defaultTtl;
    return undefined;
  };

  private readonly cacheMeta = (scoped: string): { createdAt: number } | undefined => {
    const cached = this.cache.get(scoped) as { envelope?: StorageEnvelope } | undefined;
    return cached?.envelope ? { createdAt: cached.envelope.c } : undefined;
  };

  private readonly samePayload = (existingRaw: string, nextRaw: string): boolean => {
    try {
      const a = this.parseEnvelope(existingRaw);
      const b = this.parseEnvelope(nextRaw);
      return a.p === b.p && a.e === b.e && a.x === b.x;
    } catch {
      return false;
    }
  };

  private async expireRecord(
    key: StorageKey,
    adapter: StorageDriverAdapter,
    scoped: string,
  ): Promise<void> {
    await adapter.delete(scoped);
    this.cache.delete(scoped);
    this.pushToSignal(key, undefined, {});
    this.notify({
      key,
      value: undefined,
      previous: undefined,
      driver: adapter.type,
      source: 'expire',
      timestamp: Date.now(),
    });
    this.bump();
  }

  private async finishRead<T>(
    key: StorageKey,
    value: T,
    options: StorageReadOptions<T>,
    adapter: StorageDriverAdapter,
    scoped: string,
  ): Promise<T | undefined> {
    if (options.validate && !options.validate(value)) {
      throw this.reportError(
        new StorageValidationError(key),
        'VALIDATION_FAILED',
        `Stored value at "${key}" failed validation.`,
        key,
      );
    }
    if (options.consume) {
      await adapter.delete(scoped);
      this.cache.delete(scoped);
      this.bump();
    }
    return value;
  }

  private readonly pushToSignal = (
    key: StorageKey,
    value: unknown,
    _options: StorageScopeOptions,
  ): void => {
    const binding = this.bindings.get(key);
    if (!binding) return;
    const raw = Object.getPrototypeOf(binding.source) as { set?: (v: unknown) => void };
    if (typeof raw.set === 'function') {
      raw.set.call(binding.source, value);
    } else {
      binding.source.set(value);
    }
    binding.status.set('ready');
    binding.error.set(undefined);
  };

  private readonly notify = (event: StorageChangeEvent): void => {
    const listeners = this.watchers.get(event.key);
    if (!listeners || listeners.size === 0) return;
    for (const listener of [...listeners]) {
      try {
        listener(event);
      } catch (error) {
        this.reportError(error, 'WATCHER_FAILED', `A watcher for "${event.key}" threw.`, event.key);
      }
    }
  };

  private readonly bump = (): void => {
    microtask(() => this.revision.update((n) => n + 1));
  };

  private readonly broadcast = (message: SyncMessage): void => {
    if (!this.config.syncAcrossTabs || !this.channel) return;
    try {
      this.channel.postMessage(message);
    } catch (error) {
      this.reportError(error, 'BROADCAST_FAILED', 'Failed to broadcast a storage change.');
    }
  };

  private readonly installTabSync = (): void => {
    if (!this.config.syncAcrossTabs) return;

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(this.config.channelName);
        this.channel.onmessage = (event: MessageEvent<SyncMessage>): void => {
          const message = event.data;
          if (!message || message.origin === this.instanceId) return;
          this.applyRemoteChange(message.key, message.kind, message.driver);
        };
      } catch (error) {
        this.reportError(error, 'CHANNEL_FAILED', 'BroadcastChannel could not be opened.');
      }
    }

    this.storageListener = (event: StorageEvent): void => {
      if (event.storageArea === null) return;
      const prefix = this.prefix({});
      if (event.key === null) {
        this.applyRemoteChange('*', 'clear', 'local');
        return;
      }
      if (!event.key.startsWith(prefix)) return;
      this.applyRemoteChange(
        this.logicalKey(event.key, prefix),
        event.newValue === null ? 'remove' : 'set',
        'local',
      );
    };
    (globalThis as unknown as Window).addEventListener('storage', this.storageListener);
  };

  private readonly applyRemoteChange = (
    key: StorageKey,
    kind: SyncMessage['kind'],
    driverType: StorageDriverType,
  ): void => {
    if (kind === 'clear') {
      this.cache.clear();
      for (const [boundKey, binding] of this.bindings) {
        binding.source.set(undefined);
        this.notify({
          key: boundKey,
          value: undefined,
          previous: undefined,
          driver: driverType,
          source: 'remote',
          timestamp: Date.now(),
        });
      }
      this.bump();
      return;
    }

    this.cache.delete(this.scopedKey(key, {}));
    this.bump();

    if (kind === 'remove') {
      this.pushToSignal(key, undefined, {});
      this.notify({
        key,
        value: undefined,
        previous: undefined,
        driver: driverType,
        source: 'remote',
        timestamp: Date.now(),
      });
      return;
    }

    void this.get<unknown>(key, { driver: driverType, bypassCache: true })
      .then((value) => {
        this.pushToSignal(key, value, {});
        this.notify({
          key,
          value,
          previous: undefined,
          driver: driverType,
          source: 'remote',
          timestamp: Date.now(),
        });
      })
      .catch((error: unknown) =>
        this.reportError(
          error,
          'REMOTE_SYNC_FAILED',
          `Failed to sync "${key}" from another tab.`,
          key,
        ),
      );
  };

  private readonly installBackgroundCleanup = (): void => {
    if (this.config.cleanupInterval <= 0) return;
    this.cleanupTimer = setInterval(() => {
      this.idleHandle = scheduleIdle(() => {
        void this.cleanup().catch(() => undefined);
      });
    }, this.config.cleanupInterval);
  };

  private readonly scheduleStatsRefresh = (): void => {
    if (!this.isBrowser || this.destroyed) return;
    scheduleIdle(() => {
      if (this.destroyed) return;
      void (async (): Promise<void> => {
        try {
          const adapter = await this.resolveDriver();
          const rows = await adapter.listEntries(this.prefix({}));
          this.keyCount.set(rows.length);
          this.byteCount.set(
            rows.reduce((total, [key, payload]) => total + key.length * 2 + payload.length * 2, 0),
          );
        } catch {
          /* statistics are best-effort */
        }
      })();
    });
  };

  private readonly mutateArray = async <T>(
    key: StorageKey,
    project: (current: readonly T[]) => readonly T[],
    options: StorageOptions,
  ): Promise<readonly T[]> => {
    const list = await this.readArray<T>(key, options);
    const next = project(list);
    await this.set(key, next, options);
    return next;
  };

  private readonly readArray = async <T>(
    key: StorageKey,
    options: StorageScopeOptions,
  ): Promise<readonly T[]> => {
    const current = await this.get<readonly T[]>(key, options);
    if (current === undefined) return [];
    if (!Array.isArray(current)) {
      throw new StorageTypeError(key, 'an array', typeof current);
    }
    return current;
  };

  private readonly mutateNumber = async (
    key: StorageKey,
    project: (current: number) => number,
    options: StorageOptions<number>,
  ): Promise<number> => {
    const current = await this.get<number>(key, options);
    if (current !== undefined && typeof current !== 'number') {
      throw new StorageTypeError(key, 'a number', typeof current);
    }
    const next = project(current ?? 0);
    await this.set(key, next, options as StorageOptions);
    return next;
  };

  private readonly reportError = (
    error: unknown,
    code: string,
    message: string,
    key?: StorageKey,
  ): StorageError => {
    const wrapped = StorageError.from(error, code, message, key);
    this.lastErrorSignal.set(wrapped);
    if (this.config.debug) {
      this.log(wrapped.toString(), wrapped.cause);
    }
    return wrapped;
  };

  private readonly log = (message: string, detail?: unknown): void => {
    if (!this.config.debug) return;
    // eslint-disable-next-line no-console
    console.debug(`[StorageService] ${message}`, detail ?? '');
  };
}
