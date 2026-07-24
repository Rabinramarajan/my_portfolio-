/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  InjectionToken,
  DestroyRef,
  EnvironmentInjector,
  Signal,
  WritableSignal,
  computed,
  effect,
  inject,
  linkedSignal,
  resource,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';

/* =========================================================
 * CONFIGURATION
 * =======================================================*/

export interface StorageConfig {
  /** Prefix applied to every localStorage / sessionStorage key. */
  readonly prefix: string;
  /** AES passphrase. Replace at bootstrap from AppSettingsService. */
  readonly encryptionKey: string;
  /** Encrypt web-storage payloads by default. */
  readonly encryptByDefault: boolean;
  /** Encrypt IndexedDB payloads as well. */
  readonly encryptIndexedDb: boolean;
  /** IndexedDB database name. */
  readonly dbName: string;
  /** IndexedDB schema version. */
  readonly dbVersion: number;
  /** Default object store. */
  readonly storeName: string;
  /** Additional object stores created on upgrade. */
  readonly stores: readonly string[];
  /** Default backend when none is supplied. */
  readonly defaultBackend: StorageBackend;
  /** Default TTL in ms. 0 = never expires. */
  readonly defaultTtl: number;
  /** BroadcastChannel name for cross-tab sync. */
  readonly channel: string;
  /** Run clearExpired() on this interval (ms). 0 disables. */
  readonly cleanupInterval: number;
}

export const STORAGE_CONFIG = new InjectionToken<Partial<StorageConfig>>('STORAGE_CONFIG');

const DEFAULT_CONFIG: StorageConfig = {
  prefix: 'app.',
  encryptionKey: 'change-me-at-bootstrap',
  encryptByDefault: true,
  encryptIndexedDb: false,
  dbName: 'app-db',
  dbVersion: 1,
  storeName: 'keyval',
  stores: ['keyval'],
  defaultBackend: 'local',
  defaultTtl: 0,
  channel: 'app-storage',
  cleanupInterval: 60_000,
};

/* =========================================================
 * TYPES
 * =======================================================*/

export type StorageBackend = 'local' | 'session' | 'idb' | 'memory';

export interface StorageOptions {
  readonly backend?: StorageBackend;
  /** Time to live in milliseconds. 0 / undefined = never expires. */
  readonly ttl?: number;
  /** Override the default encryption behaviour for this call. */
  readonly encrypt?: boolean;
  /** IndexedDB object store override. */
  readonly store?: string;
}

export interface StorageEntry<T> {
  readonly key: string;
  readonly value: T;
  readonly backend: StorageBackend;
  readonly expiresAt: number | null;
  readonly updatedAt: number;
}

export interface StorageQuery<T> {
  /** Substring match against the key. */
  readonly key?: string;
  /** Arbitrary predicate over the decoded value. */
  readonly where?: (value: T, key: string) => boolean;
  readonly limit?: number;
  readonly offset?: number;
  readonly direction?: IDBCursorDirection;
}

export interface StoragePage<T> {
  readonly items: readonly StorageEntry<T>[];
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
  readonly hasMore: boolean;
}

export type StorageBatchOperation<T = unknown> =
  | {
      readonly type: 'set';
      readonly key: string;
      readonly value: T;
      readonly options?: StorageOptions;
    }
  | { readonly type: 'remove'; readonly key: string; readonly options?: StorageOptions }
  | {
      readonly type: 'merge';
      readonly key: string;
      readonly value: Partial<T>;
      readonly options?: StorageOptions;
    }
  | {
      readonly type: 'update';
      readonly key: string;
      readonly updater: (current: T | undefined) => T;
      readonly options?: StorageOptions;
    };

export interface StorageTransactionContext {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, options?: StorageOptions): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface StorageDump {
  readonly version: 1;
  readonly exportedAt: number;
  readonly entries: readonly {
    readonly key: string;
    readonly backend: StorageBackend;
    readonly value: unknown;
    readonly expiresAt: number | null;
    readonly updatedAt: number;
  }[];
}

/** Internal on-disk envelope. Never leaks to callers. */
interface StorageEnvelope<T> {
  v: T;
  e: number | null;
  t: number;
}

interface CacheRecord {
  value: unknown;
  expiresAt: number | null;
  updatedAt: number;
}

interface SyncMessage {
  readonly kind: 'set' | 'remove' | 'clear';
  readonly key?: string;
  readonly backend: StorageBackend;
  readonly at: number;
}

/* =========================================================
 * ERRORS
 * =======================================================*/

export type StorageErrorCode =
  | 'UNAVAILABLE'
  | 'SERIALIZATION'
  | 'DESERIALIZATION'
  | 'ENCRYPTION'
  | 'DECRYPTION'
  | 'INVALID_KEY'
  | 'NOT_FOUND'
  | 'QUOTA_EXCEEDED'
  | 'TYPE_MISMATCH'
  | 'TRANSACTION'
  | 'DESTROYED';

export class StorageError extends Error {
  constructor(
    message: string,
    readonly code: StorageErrorCode,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class StorageUnavailableError extends StorageError {
  constructor(backend: StorageBackend, cause?: unknown) {
    super(`Storage backend "${backend}" is not available.`, 'UNAVAILABLE', cause);
    this.name = 'StorageUnavailableError';
  }
}

export class StorageSerializationError extends StorageError {
  constructor(key: string, cause?: unknown) {
    super(`Failed to serialize value for key "${key}".`, 'SERIALIZATION', cause);
    this.name = 'StorageSerializationError';
  }
}

export class StorageDeserializationError extends StorageError {
  constructor(key: string, cause?: unknown) {
    super(`Failed to deserialize value for key "${key}".`, 'DESERIALIZATION', cause);
    this.name = 'StorageDeserializationError';
  }
}

export class StorageEncryptionError extends StorageError {
  constructor(key: string, cause?: unknown) {
    super(`Failed to encrypt value for key "${key}".`, 'ENCRYPTION', cause);
    this.name = 'StorageEncryptionError';
  }
}

export class StorageDecryptionError extends StorageError {
  constructor(key: string, cause?: unknown) {
    super(`Failed to decrypt value for key "${key}".`, 'DECRYPTION', cause);
    this.name = 'StorageDecryptionError';
  }
}

export class StorageKeyError extends StorageError {
  constructor(key: unknown) {
    super(`Invalid storage key: ${String(key)}`, 'INVALID_KEY');
    this.name = 'StorageKeyError';
  }
}

export class StorageQuotaError extends StorageError {
  constructor(key: string, cause?: unknown) {
    super(`Storage quota exceeded while writing key "${key}".`, 'QUOTA_EXCEEDED', cause);
    this.name = 'StorageQuotaError';
  }
}

export class StorageTypeError extends StorageError {
  constructor(key: string, expected: string, actual: string) {
    super(`Key "${key}" holds a ${actual} but a ${expected} was expected.`, 'TYPE_MISMATCH');
    this.name = 'StorageTypeError';
  }
}

export class StorageTransactionError extends StorageError {
  constructor(message: string, cause?: unknown) {
    super(message, 'TRANSACTION', cause);
    this.name = 'StorageTransactionError';
  }
}

export class StorageDestroyedError extends StorageError {
  constructor() {
    super('StorageService has been destroyed.', 'DESTROYED');
    this.name = 'StorageDestroyedError';
  }
}

/* =========================================================
 * SERVICE
 * =======================================================*/

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly injector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly config: StorageConfig = {
    ...DEFAULT_CONFIG,
    ...(inject(STORAGE_CONFIG, { optional: true }) ?? {}),
  };

  /** True only in a real browser. Under SSR everything falls back to memory. */
  private readonly isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  private readonly memory = new Map<string, string>();
  private readonly cache = new Map<string, CacheRecord>();
  private readonly signals = new Map<string, WritableSignal<unknown>>();
  private readonly snapshots = new Map<string, StorageDump>();
  private readonly pending: Array<() => Promise<void>> = [];

  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private channel: BroadcastChannel | null = null;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private storageListener: ((event: StorageEvent) => void) | null = null;
  private destroyed = false;

  /** Bumped on every mutation. Drives derived signals and resources. */
  private readonly revision = signal(0);
  private readonly _ready = signal(false);

  readonly ready: Signal<boolean> = this._ready.asReadonly();
  readonly version: Signal<number> = this.revision.asReadonly();
  readonly available: Signal<boolean> = computed(() => this._ready() && !this.destroyed);

  /**
   * Writable-but-derived list of known keys. Recomputes whenever the
   * revision changes; can be overridden locally without losing the link.
   */
  readonly keyList = linkedSignal<number, readonly string[]>({
    source: () => this.revision(),
    computation: () => this.listKeysSync(),
  });

  readonly keyCount: Signal<number> = computed(() => this.keyList().length);

  /**
   * Async view over the whole IndexedDB default store.
   * Reloads automatically when the revision changes.
   */
  readonly idbEntries = resource<readonly StorageEntry<unknown>[], number>({
    params: () => this.revision(),
    loader: async () => {
      if (!this.isBrowser) {
        return [];
      }
      return this.entries<unknown>({ backend: 'idb' });
    },
    defaultValue: [],
  });

  constructor() {
    this.init();

    // Flush anything queued before the service finished initializing.
    effect(() => {
      if (!this._ready()) {
        return;
      }
      const queued = this.pending.splice(0, this.pending.length);
      for (const task of queued) {
        void task().catch(() => undefined);
      }
    });

    this.destroyRef.onDestroy(() => this.destroy());
  }

  /* =========================================================
   * INITIALIZATION
   * =======================================================*/

  private init(): void {
    if (!this.isBrowser) {
      // SSR: memory storage only, no listeners, no IndexedDB.
      this._ready.set(true);
      return;
    }

    this.attachStorageListener();
    this.attachBroadcastChannel();
    this.startCleanupTimer();

    // IndexedDB stays lazy — opened on first idb access.
    this._ready.set(true);
    void this.clearExpired().catch(() => undefined);
  }

  private attachStorageListener(): void {
    this.storageListener = (event: StorageEvent): void => {
      if (!event.key || !event.key.startsWith(this.config.prefix)) {
        return;
      }
      const backend: StorageBackend = event.storageArea === this.rawSession() ? 'session' : 'local';
      const key = event.key.slice(this.config.prefix.length);
      this.invalidate(key, backend);
    };
    window.addEventListener('storage', this.storageListener);
  }

  private attachBroadcastChannel(): void {
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }
    try {
      this.channel = new BroadcastChannel(this.config.channel);
      this.channel.onmessage = (event: MessageEvent<SyncMessage>): void => {
        const message = event.data;
        if (!message || typeof message.kind !== 'string') {
          return;
        }
        if (message.kind === 'clear') {
          this.dropLocalState(message.backend);
          this.bump();
          return;
        }
        if (message.key) {
          this.invalidate(message.key, message.backend);
        }
      };
    } catch {
      this.channel = null;
    }
  }

  private startCleanupTimer(): void {
    if (this.config.cleanupInterval <= 0) {
      return;
    }
    this.cleanupTimer = setInterval(() => {
      void this.clearExpired().catch(() => undefined);
    }, this.config.cleanupInterval);
  }

  /* =========================================================
   * INDEXEDDB
   * =======================================================*/

  private async openDB(): Promise<IDBDatabase> {
    if (this.destroyed) {
      throw new StorageDestroyedError();
    }
    if (this.db) {
      return this.db;
    }
    if (!this.isBrowser || typeof indexedDB === 'undefined') {
      throw new StorageUnavailableError('idb');
    }
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      let request: IDBOpenDBRequest;
      try {
        request = indexedDB.open(this.config.dbName, this.config.dbVersion);
      } catch (error) {
        reject(new StorageUnavailableError('idb', error));
        return;
      }

      request.onupgradeneeded = (event: IDBVersionChangeEvent): void => {
        this.upgradeDB(request.result, event);
      };
      request.onsuccess = (): void => {
        const database = request.result;
        database.onversionchange = (): void => {
          database.close();
          this.db = null;
          this.dbPromise = null;
        };
        this.db = database;
        resolve(database);
      };
      request.onerror = (): void => {
        this.dbPromise = null;
        reject(new StorageUnavailableError('idb', request.error));
      };
      request.onblocked = (): void => {
        this.dbPromise = null;
        reject(
          new StorageUnavailableError(
            'idb',
            new Error('IndexedDB upgrade blocked by another tab.'),
          ),
        );
      };
    });

    return this.dbPromise;
  }

  private upgradeDB(db: IDBDatabase, _event: IDBVersionChangeEvent): void {
    const wanted = new Set<string>([this.config.storeName, ...this.config.stores]);
    for (const name of wanted) {
      if (!db.objectStoreNames.contains(name)) {
        const store = db.createObjectStore(name);
        // Envelope-level index so expiry sweeps do not decode every record.
        try {
          store.createIndex('expiresAt', 'e', { unique: false });
        } catch {
          // Index already present or unsupported layout — safe to ignore.
        }
      }
    }
  }

  private async getTransaction(
    mode: IDBTransactionMode,
    storeName?: string,
  ): Promise<IDBObjectStore> {
    const db = await this.openDB();
    const name = storeName ?? this.config.storeName;
    if (!db.objectStoreNames.contains(name)) {
      throw new StorageTransactionError(`Object store "${name}" does not exist.`);
    }
    try {
      return db.transaction(name, mode).objectStore(name);
    } catch (error) {
      throw new StorageTransactionError(
        `Could not open a "${mode}" transaction on "${name}".`,
        error,
      );
    }
  }

  private request<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = (): void => resolve(request.result);
      request.onerror = (): void =>
        reject(new StorageTransactionError('IndexedDB request failed.', request.error));
    });
  }

  /* =========================================================
   * ENCRYPTION
   * =======================================================*/

  private encrypt(plain: string, key: string): string {
    try {
      return CryptoJS.AES.encrypt(plain, this.config.encryptionKey).toString();
    } catch (error) {
      throw new StorageEncryptionError(key, error);
    }
  }

  private decrypt(cipher: string, key: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(cipher, this.config.encryptionKey);
      const plain = bytes.toString(CryptoJS.enc.Utf8);
      if (!plain) {
        throw new Error('Empty plaintext after decryption.');
      }
      return plain;
    } catch (error) {
      throw new StorageDecryptionError(key, error);
    }
  }

  /** Cheap heuristic — CryptoJS AES output is always base64 starting with U2FsdGVk. */
  private looksEncrypted(raw: string): boolean {
    return raw.startsWith('U2FsdGVk');
  }

  /* =========================================================
   * SERIALIZATION
   * =======================================================*/

  private encode(value: unknown, key: string): string {
    try {
      return JSON.stringify(
        value,
        function (this: Record<string, unknown>, prop: string, serialized: unknown) {
          const raw = this ? this[prop] : serialized;
          if (raw instanceof Date) {
            return { __type: 'Date', value: raw.toISOString() };
          }
          if (raw instanceof Map) {
            return { __type: 'Map', value: Array.from(raw.entries()) };
          }
          if (raw instanceof Set) {
            return { __type: 'Set', value: Array.from(raw.values()) };
          }
          if (raw instanceof RegExp) {
            return { __type: 'RegExp', value: raw.source, flags: raw.flags };
          }
          if (typeof raw === 'bigint') {
            return { __type: 'BigInt', value: raw.toString() };
          }
          if (typeof serialized === 'number' && !Number.isFinite(serialized)) {
            return { __type: 'Number', value: String(serialized) };
          }
          if (raw === undefined && prop !== '') {
            return { __type: 'Undefined' };
          }
          return serialized;
        },
      );
    } catch (error) {
      throw new StorageSerializationError(key, error);
    }
  }

  private decode<T>(raw: string, key: string): T {
    try {
      return JSON.parse(raw, (_prop: string, value: unknown) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          return value;
        }
        const tagged = value as { __type?: string; value?: unknown; flags?: string };
        switch (tagged.__type) {
          case 'Date':
            return new Date(tagged.value as string);
          case 'Map':
            return new Map(tagged.value as readonly (readonly [unknown, unknown])[]);
          case 'Set':
            return new Set(tagged.value as readonly unknown[]);
          case 'RegExp':
            return new RegExp(tagged.value as string, tagged.flags);
          case 'BigInt':
            return BigInt(tagged.value as string);
          case 'Number':
            return Number(tagged.value);
          case 'Undefined':
            return undefined;
          default:
            return value;
        }
      }) as T;
    } catch (error) {
      throw new StorageDeserializationError(key, error);
    }
  }

  /* =========================================================
   * INTERNAL HELPERS
   * =======================================================*/

  private assertAlive(): void {
    if (this.destroyed) {
      throw new StorageDestroyedError();
    }
  }

  private assertKey(key: string): void {
    if (typeof key !== 'string' || key.length === 0) {
      throw new StorageKeyError(key);
    }
  }

  private backendOf(options?: StorageOptions): StorageBackend {
    if (!this.isBrowser) {
      return 'memory';
    }
    return options?.backend ?? this.config.defaultBackend;
  }

  private shouldEncrypt(backend: StorageBackend, options?: StorageOptions): boolean {
    if (options?.encrypt !== undefined) {
      return options.encrypt;
    }
    if (backend === 'idb') {
      return this.config.encryptIndexedDb;
    }
    if (backend === 'memory') {
      return false;
    }
    return this.config.encryptByDefault;
  }

  private cacheId(key: string, backend: StorageBackend): string {
    return `${backend}::${key}`;
  }

  private physicalKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  private rawLocal(): Storage | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  private rawSession(): Storage | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }

  private webStorage(backend: StorageBackend): Storage | null {
    return backend === 'session' ? this.rawSession() : this.rawLocal();
  }

  private isExpired(envelope: StorageEnvelope<unknown>): boolean {
    return envelope.e !== null && envelope.e <= Date.now();
  }

  private bump(): void {
    this.revision.update((n) => n + 1);
  }

  private broadcast(message: SyncMessage): void {
    if (!this.channel) {
      return;
    }
    try {
      this.channel.postMessage(message);
    } catch {
      // A closed channel is not worth failing a write over.
    }
  }

  /** Drop cached state for a key and re-hydrate its signal from storage. */
  private invalidate(key: string, backend: StorageBackend): void {
    this.cache.delete(this.cacheId(key, backend));
    const holder = this.signals.get(this.cacheId(key, backend));
    if (holder) {
      void this.get(key, { backend })
        .then((value) => holder.set(value))
        .catch(() => holder.set(undefined));
    }
    this.bump();
  }

  private dropLocalState(backend: StorageBackend): void {
    for (const id of Array.from(this.cache.keys())) {
      if (id.startsWith(`${backend}::`)) {
        this.cache.delete(id);
      }
    }
    for (const [id, holder] of this.signals) {
      if (id.startsWith(`${backend}::`)) {
        holder.set(undefined);
      }
    }
  }

  private touchSignal(key: string, backend: StorageBackend, value: unknown): void {
    const holder = this.signals.get(this.cacheId(key, backend));
    if (holder) {
      holder.set(value);
    }
  }

  private listKeysSync(): readonly string[] {
    const found = new Set<string>();
    for (const backend of ['local', 'session'] as const) {
      const store = this.webStorage(backend);
      if (!store) {
        continue;
      }
      for (let i = 0; i < store.length; i++) {
        const raw = store.key(i);
        if (raw && raw.startsWith(this.config.prefix)) {
          found.add(raw.slice(this.config.prefix.length));
        }
      }
    }
    for (const raw of this.memory.keys()) {
      if (raw.startsWith(this.config.prefix)) {
        found.add(raw.slice(this.config.prefix.length));
      }
    }
    return Array.from(found);
  }

  /* =========================================================
   * RAW READ / WRITE
   * =======================================================*/

  private async readEnvelope<T>(
    key: string,
    backend: StorageBackend,
    options?: StorageOptions,
  ): Promise<StorageEnvelope<T> | undefined> {
    let raw: string | undefined;

    if (backend === 'idb') {
      const store = await this.getTransaction('readonly', options?.store);
      raw = (await this.request<string | undefined>(store.get(key))) ?? undefined;
    } else if (backend === 'memory') {
      raw = this.memory.get(this.physicalKey(key));
    } else {
      const store = this.webStorage(backend);
      if (!store) {
        raw = this.memory.get(this.physicalKey(key));
      } else {
        raw = store.getItem(this.physicalKey(key)) ?? undefined;
      }
    }

    if (raw === undefined || raw === null) {
      return undefined;
    }

    const plain = this.looksEncrypted(raw) ? this.decrypt(raw, key) : raw;
    return this.decode<StorageEnvelope<T>>(plain, key);
  }

  private async writeEnvelope<T>(
    key: string,
    envelope: StorageEnvelope<T>,
    backend: StorageBackend,
    options?: StorageOptions,
  ): Promise<void> {
    const encoded = this.encode(envelope, key);
    const payload = this.shouldEncrypt(backend, options) ? this.encrypt(encoded, key) : encoded;

    if (backend === 'idb') {
      const store = await this.getTransaction('readwrite', options?.store);
      await this.request(store.put(payload, key));
      return;
    }

    if (backend === 'memory') {
      this.memory.set(this.physicalKey(key), payload);
      return;
    }

    const store = this.webStorage(backend);
    if (!store) {
      this.memory.set(this.physicalKey(key), payload);
      return;
    }
    try {
      store.setItem(this.physicalKey(key), payload);
    } catch (error) {
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      ) {
        throw new StorageQuotaError(key, error);
      }
      throw new StorageError(
        `Failed to write key "${key}" to ${backend} storage.`,
        'UNAVAILABLE',
        error,
      );
    }
  }

  private async deleteRaw(
    key: string,
    backend: StorageBackend,
    options?: StorageOptions,
  ): Promise<void> {
    if (backend === 'idb') {
      const store = await this.getTransaction('readwrite', options?.store);
      await this.request(store.delete(key));
      return;
    }
    if (backend === 'memory') {
      this.memory.delete(this.physicalKey(key));
      return;
    }
    const store = this.webStorage(backend);
    if (!store) {
      this.memory.delete(this.physicalKey(key));
      return;
    }
    store.removeItem(this.physicalKey(key));
  }

  /* =========================================================
   * CORE CRUD
   * =======================================================*/

  async set<T>(key: string, value: T, options?: StorageOptions): Promise<void> {
    this.assertAlive();
    this.assertKey(key);

    const backend = this.backendOf(options);
    const id = this.cacheId(key, backend);
    const ttl = options?.ttl ?? this.config.defaultTtl;
    const expiresAt = ttl > 0 ? Date.now() + ttl : null;

    // Skip duplicate writes — same value, same expiry window.
    const cached = this.cache.get(id);
    if (cached && cached.expiresAt === expiresAt && this.sameValue(cached.value, value)) {
      return;
    }

    const envelope: StorageEnvelope<T> = { v: value, e: expiresAt, t: Date.now() };

    if (!this._ready()) {
      this.pending.push(() => this.set(key, value, options));
      return;
    }

    await this.writeEnvelope(key, envelope, backend, options);

    this.cache.set(id, { value, expiresAt, updatedAt: envelope.t });
    this.touchSignal(key, backend, value);
    this.bump();
    this.broadcast({ kind: 'set', key, backend, at: envelope.t });
  }

  async get<T>(key: string, options?: StorageOptions): Promise<T | undefined> {
    this.assertAlive();
    this.assertKey(key);

    const backend = this.backendOf(options);
    const id = this.cacheId(key, backend);

    const cached = this.cache.get(id);
    if (cached) {
      if (cached.expiresAt !== null && cached.expiresAt <= Date.now()) {
        await this.remove(key, options);
        return undefined;
      }
      return cached.value as T;
    }

    let envelope: StorageEnvelope<T> | undefined;
    try {
      envelope = await this.readEnvelope<T>(key, backend, options);
    } catch (error) {
      if (error instanceof StorageDecryptionError || error instanceof StorageDeserializationError) {
        // Corrupt or foreign payload — drop it rather than poisoning callers.
        await this.deleteRaw(key, backend, options);
        return undefined;
      }
      throw error;
    }

    if (!envelope) {
      return undefined;
    }
    if (this.isExpired(envelope)) {
      await this.remove(key, options);
      return undefined;
    }

    this.cache.set(id, { value: envelope.v, expiresAt: envelope.e, updatedAt: envelope.t });
    this.touchSignal(key, backend, envelope.v);
    return envelope.v;
  }

  async remove(key: string, options?: StorageOptions): Promise<void> {
    this.assertAlive();
    this.assertKey(key);

    const backend = this.backendOf(options);
    await this.deleteRaw(key, backend, options);

    this.cache.delete(this.cacheId(key, backend));
    this.touchSignal(key, backend, undefined);
    this.bump();
    this.broadcast({ kind: 'remove', key, backend, at: Date.now() });
  }

  async clear(options?: StorageOptions): Promise<void> {
    this.assertAlive();
    const backend = this.backendOf(options);

    if (backend === 'idb') {
      const store = await this.getTransaction('readwrite', options?.store);
      await this.request(store.clear());
    } else if (backend === 'memory') {
      this.memory.clear();
    } else {
      const store = this.webStorage(backend);
      if (store) {
        const doomed: string[] = [];
        for (let i = 0; i < store.length; i++) {
          const raw = store.key(i);
          if (raw && raw.startsWith(this.config.prefix)) {
            doomed.push(raw);
          }
        }
        for (const raw of doomed) {
          store.removeItem(raw);
        }
      } else {
        this.memory.clear();
      }
    }

    this.dropLocalState(backend);
    this.bump();
    this.broadcast({ kind: 'clear', backend, at: Date.now() });
  }

  /* =========================================================
   * QUERYING
   * =======================================================*/

  async exists(key: string, options?: StorageOptions): Promise<boolean> {
    return (await this.get<unknown>(key, options)) !== undefined;
  }

  async keys(options?: StorageOptions): Promise<readonly string[]> {
    this.assertAlive();
    const backend = this.backendOf(options);

    if (backend === 'idb') {
      const store = await this.getTransaction('readonly', options?.store);
      const raw = await this.request<IDBValidKey[]>(store.getAllKeys());
      return raw.map((k) => String(k));
    }

    if (backend === 'memory') {
      return Array.from(this.memory.keys()).map((k) => k.slice(this.config.prefix.length));
    }

    const store = this.webStorage(backend);
    if (!store) {
      return Array.from(this.memory.keys()).map((k) => k.slice(this.config.prefix.length));
    }
    const found: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const raw = store.key(i);
      if (raw && raw.startsWith(this.config.prefix)) {
        found.push(raw.slice(this.config.prefix.length));
      }
    }
    return found;
  }

  async values<T>(options?: StorageOptions): Promise<readonly T[]> {
    const entries = await this.entries<T>(options);
    return entries.map((entry) => entry.value);
  }

  async entries<T>(options?: StorageOptions): Promise<readonly StorageEntry<T>[]> {
    this.assertAlive();
    const backend = this.backendOf(options);
    const keys = await this.keys(options);
    const result: StorageEntry<T>[] = [];

    for (const key of keys) {
      let envelope: StorageEnvelope<T> | undefined;
      try {
        envelope = await this.readEnvelope<T>(key, backend, options);
      } catch {
        continue;
      }
      if (!envelope || this.isExpired(envelope)) {
        continue;
      }
      result.push({
        key,
        value: envelope.v,
        backend,
        expiresAt: envelope.e,
        updatedAt: envelope.t,
      });
    }
    return result;
  }

  async count(options?: StorageOptions): Promise<number> {
    this.assertAlive();
    const backend = this.backendOf(options);
    if (backend === 'idb') {
      const store = await this.getTransaction('readonly', options?.store);
      return this.request<number>(store.count());
    }
    return (await this.keys(options)).length;
  }

  /** Approximate byte size of everything under this prefix. */
  async size(options?: StorageOptions): Promise<number> {
    this.assertAlive();
    const backend = this.backendOf(options);
    let bytes = 0;

    if (backend === 'idb') {
      const store = await this.getTransaction('readonly', options?.store);
      const all = await this.request<unknown[]>(store.getAll());
      for (const payload of all) {
        bytes += typeof payload === 'string' ? payload.length * 2 : 0;
      }
      return bytes;
    }

    const store = this.webStorage(backend);
    if (!store) {
      for (const [k, v] of this.memory) {
        bytes += (k.length + v.length) * 2;
      }
      return bytes;
    }
    for (let i = 0; i < store.length; i++) {
      const raw = store.key(i);
      if (raw && raw.startsWith(this.config.prefix)) {
        bytes += (raw.length + (store.getItem(raw)?.length ?? 0)) * 2;
      }
    }
    return bytes;
  }

  /**
   * Cursor-driven, paginated search. Uses a real IDBCursor for the `idb`
   * backend so large stores are never fully materialized.
   */
  async search<T>(query: StorageQuery<T> = {}, options?: StorageOptions): Promise<StoragePage<T>> {
    this.assertAlive();
    const backend = this.backendOf(options);
    const limit = query.limit ?? 25;
    const offset = query.offset ?? 0;
    const matches: StorageEntry<T>[] = [];

    const accept = (key: string, envelope: StorageEnvelope<T>): boolean => {
      if (this.isExpired(envelope)) {
        return false;
      }
      if (query.key && !key.includes(query.key)) {
        return false;
      }
      if (query.where && !query.where(envelope.v, key)) {
        return false;
      }
      return true;
    };

    if (backend === 'idb') {
      const store = await this.getTransaction('readonly', options?.store);
      await new Promise<void>((resolve, reject) => {
        const request = store.openCursor(null, query.direction ?? 'next');
        request.onsuccess = (): void => {
          const cursor = request.result;
          if (!cursor) {
            resolve();
            return;
          }
          const key = String(cursor.key);
          try {
            const raw = cursor.value as string;
            const plain = this.looksEncrypted(raw) ? this.decrypt(raw, key) : raw;
            const envelope = this.decode<StorageEnvelope<T>>(plain, key);
            if (accept(key, envelope)) {
              matches.push({
                key,
                value: envelope.v,
                backend,
                expiresAt: envelope.e,
                updatedAt: envelope.t,
              });
            }
          } catch {
            // Skip unreadable records instead of aborting the scan.
          }
          cursor.continue();
        };
        request.onerror = (): void =>
          reject(new StorageTransactionError('Cursor scan failed.', request.error));
      });
    } else {
      for (const key of await this.keys(options)) {
        const envelope = await this.readEnvelope<T>(key, backend, options).catch(() => undefined);
        if (envelope && accept(key, envelope)) {
          matches.push({
            key,
            value: envelope.v,
            backend,
            expiresAt: envelope.e,
            updatedAt: envelope.t,
          });
        }
      }
    }

    const items = matches.slice(offset, offset + limit);
    return {
      items,
      total: matches.length,
      offset,
      limit,
      hasMore: offset + items.length < matches.length,
    };
  }

  /* =========================================================
   * MUTATION HELPERS
   * =======================================================*/

  async update<T>(
    key: string,
    updater: (current: T | undefined) => T,
    options?: StorageOptions,
  ): Promise<T> {
    const current = await this.get<T>(key, options);
    const next = updater(current);
    await this.set<T>(key, next, options);
    return next;
  }

  async merge<T extends object>(
    key: string,
    patch: Partial<T>,
    options?: StorageOptions,
  ): Promise<T> {
    const current = await this.get<T>(key, options);
    if (current !== undefined && (typeof current !== 'object' || current === null)) {
      throw new StorageTypeError(key, 'object', typeof current);
    }
    const next = { ...(current ?? ({} as T)), ...patch } as T;
    await this.set<T>(key, next, options);
    return next;
  }

  async rename(from: string, to: string, options?: StorageOptions): Promise<void> {
    await this.move(from, to, options);
  }

  async copy(from: string, to: string, options?: StorageOptions): Promise<void> {
    this.assertKey(from);
    this.assertKey(to);
    const backend = this.backendOf(options);
    const envelope = await this.readEnvelope<unknown>(from, backend, options);
    if (!envelope) {
      throw new StorageError(`Key "${from}" does not exist.`, 'NOT_FOUND');
    }
    const remaining = envelope.e === null ? undefined : Math.max(0, envelope.e - Date.now());
    const nextOptions = remaining === undefined ? options : { ...options, ttl: remaining };
    await this.set(to, envelope.v, nextOptions);
  }

  async move(from: string, to: string, options?: StorageOptions): Promise<void> {
    await this.copy(from, to, options);
    await this.remove(from, options);
  }

  async batch(
    operations: readonly StorageBatchOperation<any>[],
    options?: StorageOptions,
  ): Promise<void> {
    this.assertAlive();
    for (const operation of operations) {
      const scoped = { ...options, ...operation.options };
      switch (operation.type) {
        case 'set':
          await this.set(operation.key, operation.value, scoped);
          break;
        case 'remove':
          await this.remove(operation.key, scoped);
          break;
        case 'merge':
          await this.merge(operation.key, operation.value as object, scoped);
          break;
        case 'update':
          await this.update(operation.key, operation.updater, scoped);
          break;
        default:
          throw new StorageError('Unknown batch operation.', 'TYPE_MISMATCH');
      }
    }
  }

  /** Bulk insert on a single IndexedDB transaction. */
  async bulkSet<T>(
    records: ReadonlyMap<string, T> | readonly (readonly [string, T])[],
    options?: StorageOptions,
  ): Promise<void> {
    this.assertAlive();
    const list = records instanceof Map ? Array.from(records.entries()) : Array.from(records);
    const backend = this.backendOf(options);
    const ttl = options?.ttl ?? this.config.defaultTtl;
    const expiresAt = ttl > 0 ? Date.now() + ttl : null;

    if (backend !== 'idb') {
      for (const [key, value] of list) {
        await this.set(key, value, options);
      }
      return;
    }

    const store = await this.getTransaction('readwrite', options?.store);
    await Promise.all(
      list.map(([key, value]) => {
        const envelope: StorageEnvelope<T> = { v: value, e: expiresAt, t: Date.now() };
        const encoded = this.encode(envelope, key);
        const payload = this.shouldEncrypt(backend, options) ? this.encrypt(encoded, key) : encoded;
        return this.request(store.put(payload, key));
      }),
    );

    for (const [key, value] of list) {
      this.cache.set(this.cacheId(key, backend), {
        value,
        expiresAt,
        updatedAt: Date.now(),
      });
      this.touchSignal(key, backend, value);
    }
    this.bump();
  }

  /** Bulk delete on a single IndexedDB transaction. */
  async bulkRemove(keys: readonly string[], options?: StorageOptions): Promise<void> {
    this.assertAlive();
    const backend = this.backendOf(options);

    if (backend !== 'idb') {
      for (const key of keys) {
        await this.remove(key, options);
      }
      return;
    }

    const store = await this.getTransaction('readwrite', options?.store);
    await Promise.all(keys.map((key) => this.request(store.delete(key))));
    for (const key of keys) {
      this.cache.delete(this.cacheId(key, backend));
      this.touchSignal(key, backend, undefined);
    }
    this.bump();
  }

  /**
   * Runs a callback against a single IndexedDB transaction. Web-storage
   * backends fall back to sequential operations with the same shape.
   */
  async transaction<R>(
    work: (context: StorageTransactionContext) => Promise<R>,
    options?: StorageOptions,
  ): Promise<R> {
    this.assertAlive();
    const backend = this.backendOf(options);

    if (backend !== 'idb') {
      return work({
        get: <T>(key: string) => this.get<T>(key, options),
        set: <T>(key: string, value: T, scoped?: StorageOptions) =>
          this.set<T>(key, value, { ...options, ...scoped }),
        remove: (key: string) => this.remove(key, options),
      });
    }

    const store = await this.getTransaction('readwrite', options?.store);
    const touched: string[] = [];

    const context: StorageTransactionContext = {
      get: async <T>(key: string): Promise<T | undefined> => {
        const raw = await this.request<string | undefined>(store.get(key));
        if (!raw) {
          return undefined;
        }
        const plain = this.looksEncrypted(raw) ? this.decrypt(raw, key) : raw;
        const envelope = this.decode<StorageEnvelope<T>>(plain, key);
        return this.isExpired(envelope) ? undefined : envelope.v;
      },
      set: async <T>(key: string, value: T, scoped?: StorageOptions): Promise<void> => {
        const ttl = scoped?.ttl ?? options?.ttl ?? this.config.defaultTtl;
        const envelope: StorageEnvelope<T> = {
          v: value,
          e: ttl > 0 ? Date.now() + ttl : null,
          t: Date.now(),
        };
        const encoded = this.encode(envelope, key);
        const payload = this.shouldEncrypt(backend, scoped ?? options)
          ? this.encrypt(encoded, key)
          : encoded;
        await this.request(store.put(payload, key));
        touched.push(key);
      },
      remove: async (key: string): Promise<void> => {
        await this.request(store.delete(key));
        touched.push(key);
      },
    };

    try {
      const result = await work(context);
      for (const key of touched) {
        this.cache.delete(this.cacheId(key, backend));
        this.invalidate(key, backend);
      }
      return result;
    } catch (error) {
      try {
        store.transaction.abort();
      } catch {
        // Transaction may already be finished.
      }
      throw error instanceof StorageError
        ? error
        : new StorageTransactionError('Transaction callback failed.', error);
    }
  }

  /* =========================================================
   * ARRAY & PRIMITIVE HELPERS
   * =======================================================*/

  private async readArray<T>(key: string, options?: StorageOptions): Promise<T[]> {
    const current = await this.get<T[]>(key, options);
    if (current === undefined) {
      return [];
    }
    if (!Array.isArray(current)) {
      throw new StorageTypeError(key, 'array', typeof current);
    }
    return [...current];
  }

  async push<T>(key: string, ...items: readonly T[]): Promise<number> {
    const list = await this.readArray<T>(key);
    list.push(...items);
    await this.set(key, list);
    return list.length;
  }

  async pop<T>(key: string): Promise<T | undefined> {
    const list = await this.readArray<T>(key);
    const item = list.pop();
    await this.set(key, list);
    return item;
  }

  async shift<T>(key: string): Promise<T | undefined> {
    const list = await this.readArray<T>(key);
    const item = list.shift();
    await this.set(key, list);
    return item;
  }

  async unshift<T>(key: string, ...items: readonly T[]): Promise<number> {
    const list = await this.readArray<T>(key);
    list.unshift(...items);
    await this.set(key, list);
    return list.length;
  }

  /** String concatenation at the end of the stored value. */
  async append(key: string, text: string, options?: StorageOptions): Promise<string> {
    const current = await this.get<string>(key, options);
    if (current !== undefined && typeof current !== 'string') {
      throw new StorageTypeError(key, 'string', typeof current);
    }
    const next = `${current ?? ''}${text}`;
    await this.set(key, next, options);
    return next;
  }

  /** String concatenation at the beginning of the stored value. */
  async prepend(key: string, text: string, options?: StorageOptions): Promise<string> {
    const current = await this.get<string>(key, options);
    if (current !== undefined && typeof current !== 'string') {
      throw new StorageTypeError(key, 'string', typeof current);
    }
    const next = `${text}${current ?? ''}`;
    await this.set(key, next, options);
    return next;
  }

  async increment(key: string, by = 1, options?: StorageOptions): Promise<number> {
    const current = await this.get<number>(key, options);
    if (current !== undefined && typeof current !== 'number') {
      throw new StorageTypeError(key, 'number', typeof current);
    }
    const next = (current ?? 0) + by;
    await this.set(key, next, options);
    return next;
  }

  async decrement(key: string, by = 1, options?: StorageOptions): Promise<number> {
    return this.increment(key, -by, options);
  }

  async toggle(key: string, options?: StorageOptions): Promise<boolean> {
    const current = await this.get<boolean>(key, options);
    if (current !== undefined && typeof current !== 'boolean') {
      throw new StorageTypeError(key, 'boolean', typeof current);
    }
    const next = !(current ?? false);
    await this.set(key, next, options);
    return next;
  }

  /* =========================================================
   * SIGNALS
   * =======================================================*/

  /**
   * Returns the WritableSignal bound to a key. Created lazily, reused
   * afterwards, and hydrated asynchronously on first access.
   */
  signal<T>(
    key: string,
    initialValue?: T,
    options?: StorageOptions,
  ): WritableSignal<T | undefined> {
    this.assertAlive();
    this.assertKey(key);

    const backend = this.backendOf(options);
    const id = this.cacheId(key, backend);
    const existing = this.signals.get(id);
    if (existing) {
      return existing as WritableSignal<T | undefined>;
    }

    const cached = this.cache.get(id);
    const holder = signal<T | undefined>((cached?.value as T | undefined) ?? initialValue);
    this.signals.set(id, holder as WritableSignal<unknown>);

    if (!cached) {
      void this.get<T>(key, options)
        .then((value) => {
          if (value !== undefined) {
            holder.set(value);
          }
        })
        .catch(() => undefined);
    }

    return holder;
  }

  /** Read-only derived view of a key. */
  select<T, R>(
    key: string,
    project: (value: T | undefined) => R,
    options?: StorageOptions,
  ): Signal<R> {
    const source = this.signal<T>(key, undefined, options);
    return computed(() => project(source()));
  }

  /** Callback on every change to a key. Returns an unsubscribe function. */
  watch<T>(
    key: string,
    callback: (value: T | undefined) => void,
    options?: StorageOptions,
  ): () => void {
    const source = this.signal<T>(key, undefined, options);
    const reference = runInInjectionContext(this.injector, () => effect(() => callback(source())));
    return () => reference.destroy();
  }

  /** RxJS view of a key, for code that still lives in Observables. */
  observe<T>(key: string, options?: StorageOptions): Observable<T | undefined> {
    const source = this.signal<T>(key, undefined, options);
    return runInInjectionContext(this.injector, () => toObservable(source));
  }

  /* =========================================================
   * SNAPSHOT / EXPORT
   * =======================================================*/

  async export(options?: StorageOptions): Promise<StorageDump> {
    this.assertAlive();
    const backend = this.backendOf(options);
    const entries = await this.entries<unknown>(options);
    return {
      version: 1,
      exportedAt: Date.now(),
      entries: entries.map((entry) => ({
        key: entry.key,
        backend,
        value: entry.value,
        expiresAt: entry.expiresAt,
        updatedAt: entry.updatedAt,
      })),
    };
  }

  async import(dump: StorageDump | string, options?: StorageOptions): Promise<number> {
    this.assertAlive();
    const parsed = typeof dump === 'string' ? this.decode<StorageDump>(dump, '<import>') : dump;

    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.entries)) {
      throw new StorageError('Unrecognized storage dump format.', 'DESERIALIZATION');
    }

    let written = 0;
    for (const entry of parsed.entries) {
      const remaining =
        entry.expiresAt === null ? undefined : Math.max(0, entry.expiresAt - Date.now());
      if (remaining === 0) {
        continue;
      }
      await this.set(entry.key, entry.value, {
        backend: entry.backend,
        ...options,
        ...(remaining !== undefined ? { ttl: remaining } : {}),
      });
      written++;
    }
    return written;
  }

  /** Capture the current state under a label. */
  async snapshot(label = 'default', options?: StorageOptions): Promise<StorageDump> {
    const dump = await this.export(options);
    this.snapshots.set(label, dump);
    return dump;
  }

  /** Restore a previously captured snapshot, replacing current state. */
  async restore(
    label: string | StorageDump = 'default',
    options?: StorageOptions,
  ): Promise<number> {
    const dump = typeof label === 'string' ? this.snapshots.get(label) : label;
    if (!dump) {
      throw new StorageError(`No snapshot named "${String(label)}".`, 'NOT_FOUND');
    }
    await this.clear(options);
    return this.import(dump, options);
  }

  /* =========================================================
   * MAINTENANCE
   * =======================================================*/

  /** Remove every expired record across all reachable backends. */
  async clearExpired(): Promise<number> {
    if (this.destroyed) {
      return 0;
    }
    const backends: StorageBackend[] = this.isBrowser
      ? ['local', 'session', 'idb', 'memory']
      : ['memory'];

    let removed = 0;
    for (const backend of backends) {
      let keys: readonly string[];
      try {
        keys = await this.keys({ backend });
      } catch {
        continue;
      }
      for (const key of keys) {
        try {
          const envelope = await this.readEnvelope<unknown>(key, backend);
          if (envelope && this.isExpired(envelope)) {
            await this.remove(key, { backend });
            removed++;
          }
        } catch {
          // Unreadable record — leave it for cleanup() to decide on.
        }
      }
    }
    return removed;
  }

  /** clearExpired() plus a purge of stale in-memory cache records. */
  async cleanup(): Promise<number> {
    const removed = await this.clearExpired();
    const now = Date.now();
    for (const [id, record] of Array.from(this.cache.entries())) {
      if (record.expiresAt !== null && record.expiresAt <= now) {
        this.cache.delete(id);
      }
    }
    for (const [id, holder] of Array.from(this.signals.entries())) {
      if (holder() === undefined && !this.cache.has(id)) {
        this.signals.delete(id);
      }
    }
    this.bump();
    return removed;
  }

  /** Tear down listeners, timers, channels and the IndexedDB handle. */
  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    if (this.storageListener && this.isBrowser) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    if (this.channel) {
      try {
        this.channel.close();
      } catch {
        // Already closed.
      }
      this.channel = null;
    }
    if (this.db) {
      try {
        this.db.close();
      } catch {
        // Already closed.
      }
      this.db = null;
      this.dbPromise = null;
    }

    this.cache.clear();
    this.signals.clear();
    this.pending.length = 0;
    this._ready.set(false);
  }

  /* =========================================================
   * MISC
   * =======================================================*/

  /** Structural equality without paying for a full serialization round-trip. */
  private sameValue(a: unknown, b: unknown): boolean {
    if (a === b) {
      return true;
    }
    if (typeof a !== typeof b) {
      return false;
    }
    if (a === null || b === null || typeof a !== 'object') {
      return false;
    }
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
}
