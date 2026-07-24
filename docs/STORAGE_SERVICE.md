# StorageService — Usage Guide

A single-file, signal-powered storage layer for Angular 22 (standalone, zoneless, SSR-safe).
One API over **localStorage**, **sessionStorage**, **IndexedDB**, and an in-memory driver.

Source: [`src/app/core/services/storage.service.ts`](../src/app/core/services/storage.service.ts)

---

## Table of contents

1. [Setup](#1-setup)
2. [Two ways to read](#2-two-ways-to-read-async-vs-signal)
3. [Core CRUD](#3-core-crud)
4. [Signals](#4-signals)
5. [Value mutators](#5-value-mutators)
6. [Expiry & TTL](#6-expiry--ttl)
7. [Picking a driver](#7-picking-a-driver)
8. [Encryption](#8-encryption)
9. [Batch & transactions](#9-batch--transactions)
10. [Watching changes & multi-tab sync](#10-watching-changes--multi-tab-sync)
11. [IndexedDB: pagination & search](#11-indexeddb-pagination--search)
12. [Backup: snapshot / export / import](#12-backup-snapshot--export--import)
13. [Validation](#13-validation)
14. [Rich types you can store](#14-rich-types-you-can-store)
15. [SSR behaviour](#15-ssr-behaviour)
16. [Error handling](#16-error-handling)
17. [Diagnostics](#17-diagnostics)
18. [Testing](#18-testing)
19. [API reference](#19-api-reference)
20. [Gotchas](#20-gotchas)

---

## 1. Setup

The service is `providedIn: 'root'` — it works with zero configuration:

```ts
import { StorageService } from './core/services/storage.service';

export class MyComponent {
  private readonly storage = inject(StorageService);
}
```

To configure it, add `provideStorage()` to your app config:

```ts
// app.config.ts
import { provideStorage } from './core/services/storage.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStorage({
      namespace: 'portfolio', // every key is prefixed "portfolio:"
      driver: 'local', // 'local' | 'session' | 'indexeddb' | 'memory'
      defaultTtl: 1000 * 60 * 60, // 1h TTL on writes that don't specify one
      cacheSize: 512,
      syncAcrossTabs: true,
      debug: !environment.production,
    }),
  ],
};
```

### All config options

| Option                             | Default                               | What it does                                   |
| ---------------------------------- | ------------------------------------- | ---------------------------------------------- |
| `driver`                           | `'local'`                             | Default backend                                |
| `namespace`                        | `'zv'`                                | Key prefix (`"zv:theme"`)                      |
| `defaultTtl`                       | —                                     | TTL applied when a write doesn't specify one   |
| `encryptByDefault`                 | `false`                               | Encrypt every write (requires `encryptionKey`) |
| `encryptionKey`                    | —                                     | AES-GCM passphrase                             |
| `keyDerivationIterations`          | `150_000`                             | PBKDF2 rounds                                  |
| `cacheSize`                        | `256`                                 | LRU capacity                                   |
| `cacheTtl`                         | `60_000`                              | Cache slot lifetime (ms)                       |
| `syncAcrossTabs`                   | `true`                                | BroadcastChannel + `storage` events            |
| `channelName`                      | `'zv-storage'`                        | BroadcastChannel name                          |
| `cleanupInterval`                  | `120_000`                             | Expiry sweep interval; `0` disables            |
| `dbName` / `dbStore` / `dbVersion` | `'zv-storage-db'` / `'records'` / `1` | IndexedDB schema                               |
| `dbIndexes`                        | `by_updated`, `by_expires`            | Secondary indexes                              |
| `fallbackToMemory`                 | `true`                                | Degrade to memory instead of throwing          |
| `debug`                            | `false`                               | `console.debug` diagnostics                    |

> Setting `encryptByDefault: true` without an `encryptionKey` throws a `StorageEncryptionError` at startup — deliberately, so it fails loudly rather than silently storing plaintext.

---

## 2. Two ways to read: async vs signal

This matters, so it comes first.

**IndexedDB cannot be read synchronously.** To keep one API across all four drivers, every
direct method returns a `Promise`. If you want synchronous reads in a template, use a
**signal** — it hydrates once and then reads from memory instantly.

```ts
// Async — precise, awaits the real backend
const theme = await storage.get<string>('theme');

// Signal — sync after hydration, auto-updates, template-friendly
readonly theme = this.storage.signal<string>('theme', 'dark');
// template: {{ theme() }}
```

Rule of thumb: **signals for UI state, `await` for logic that must be certain.**

---

## 3. Core CRUD

```ts
await storage.set('user', { id: 1, name: 'Ada' });
await storage.set('token', 'abc', { ttl: 60_000 }); // expires in 60s
await storage.set('draft', text, { driver: 'session' }); // different backend

const user = await storage.get<User>('user');
const name = await storage.get('name', { fallback: 'Guest' });
const otp = await storage.get('otp', { consume: true }); // read-once, then deleted

await storage.remove('token');
await storage.clear(); // namespace only, not the whole origin
```

### Inspecting

```ts
await storage.exists('user'); // true — present and not expired
await storage.has('tags', 'angular'); // membership in array / Set / Map / object / string
await storage.keys(); // ['user', 'theme', ...]  (namespace stripped)
await storage.values<User>();
await storage.entries<User>(); // [['user', {...}], ...]
await storage.count(); // live (non-expired) record count
await storage.size(); // approximate bytes
await storage.info('user'); // { createdAt, updatedAt, expiresAt, encrypted, bytes }
```

`clear()` only removes keys inside your namespace — it never wipes other apps' data on the
same origin.

### Moving keys

```ts
await storage.rename('old', 'new'); // preserves metadata
await storage.copy('draft', 'draft.backup');
await storage.move('cart', 'cart', { targetDriver: 'indexeddb' }); // promote across drivers
```

---

## 4. Signals

`signal()` returns a `WritableSignal` bound to a key. Writing to it persists automatically.

```ts
export class SettingsPage {
  private readonly storage = inject(StorageService);

  readonly theme = this.storage.signal<'light' | 'dark'>('theme', 'light');
  readonly prefs = this.storage.signal<Prefs>('prefs', DEFAULT_PREFS);

  toggleTheme(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark'); // persisted for you
  }
}
```

```html
<p>Theme: {{ theme() }}</p>
@if (theme.loading()) { <app-spinner /> } @if (theme.error(); as err) {
<p class="error">{{ err.message }}</p>
}
```

Each bound signal carries extras:

| Member      | Type                                        | Purpose                                |
| ----------- | ------------------------------------------- | -------------------------------------- |
| `key`       | `string`                                    | The bound key                          |
| `status()`  | `'idle' \| 'loading' \| 'ready' \| 'error'` | Load lifecycle                         |
| `loading()` | `boolean`                                   | Shorthand for `status() === 'loading'` |
| `error()`   | `StorageError \| undefined`                 | Last failure                           |
| `reload()`  | `Promise<T \| undefined>`                   | Re-read from the driver                |
| `remove()`  | `Promise<void>`                             | Delete the record and reset            |
| `destroy()` | `void`                                      | Detach the binding (keeps the record)  |

Signals are **memoized per key** — calling `signal('theme')` twice returns the same instance,
so two components stay in lockstep.

### Derived state

```ts
readonly isDark = this.storage.computed<Theme, boolean>('theme', (t) => t === 'dark');
```

### `resource()`

```ts
readonly profile = this.storage.resource<Profile>('profile');
// profile.value(), profile.isLoading(), profile.error(), profile.reload()
```

The resource reloads on **any** mutation — including changes from another browser tab.

### `store()` — a small feature-state facade

```ts
readonly filters = this.storage.store('filters', { tag: '', sort: 'new' as const });

filters.value();                       // always defined, falls back to the initial
filters.patch({ tag: 'angular' });     // shallow merge + persist
filters.reset();
readonly tag = filters.select((f) => f.tag);
```

---

## 5. Value mutators

Typed helpers that read-modify-write in one call.

```ts
// objects
await storage.update<number>('count', (n) => (n ?? 0) + 1);
await storage.merge<Settings>('settings', { fontSize: 16 });

// arrays
await storage.push('recent', 'angular', 'signals');
await storage.unshift('recent', 'newest');
const last = await storage.pop<string>('recent');
const first = await storage.shift<string>('recent');

// strings *or* arrays — type-aware
await storage.append('log', 'line\n');
await storage.prepend('log', 'header\n');

// scalars
await storage.toggle('sidebarOpen');
await storage.increment('visits');
await storage.decrement('credits', 5);
```

Type mismatches throw `StorageTypeError` rather than corrupting the record — calling
`push()` on a stored number fails loudly.

> `push()` and `unshift()` take rest-args, so they have no options parameter and always use
> the default driver. For a non-default driver, use `update()`.

---

## 6. Expiry & TTL

```ts
await storage.set('session', data, { ttl: 15 * 60_000 }); // relative
await storage.set('promo', data, { expiresAt: Date.parse('2026-12-25') }); // absolute

await storage.expire('session', 30 * 60_000); // extend an existing record
await storage.expire('session', null); // make it permanent

await storage.cleanup(); // manual sweep → number removed
```

Expiry is enforced **lazily on read** (an expired key returns `undefined` and self-deletes)
and **proactively** by a background sweep that runs on `requestIdleCallback` every
`cleanupInterval` ms.

---

## 7. Picking a driver

Set a default in config, override per call:

```ts
await storage.set('bigBlob', file, { driver: 'indexeddb' });
await storage.set('wizardStep', 3, { driver: 'session' });
const blob = await storage.get<Blob>('bigBlob', { driver: 'indexeddb' });
```

| Driver      | Use for                         | Limit                             |
| ----------- | ------------------------------- | --------------------------------- |
| `local`     | Preferences, tokens, small JSON | ~5 MB, synchronous under the hood |
| `session`   | Per-tab wizard/scroll state     | ~5 MB, dies with the tab          |
| `indexeddb` | Files, blobs, large collections | Hundreds of MB                    |
| `memory`    | SSR, tests, throwaway cache     | Process lifetime                  |

Drivers are created lazily and cached, so mixing them costs nothing up front.

**Graceful degradation:** if the requested driver is unavailable (Safari private mode,
disabled storage, no IndexedDB), it falls back to memory and flags `storage.degraded()`.
Set `fallbackToMemory: false` to get a `StorageUnavailableError` instead.

---

## 8. Encryption

AES-GCM via Web Crypto, with a PBKDF2-SHA256 derived key (memoized once per service instance)
and a fresh random IV per write.

```ts
provideStorage({ encryptionKey: 'a-user-derived-passphrase' });
```

```ts
await storage.set('pii', record, { encrypt: true }); // opt in per write
const record = await storage.get<Pii>('pii'); // decrypts transparently
```

Or `encryptByDefault: true` to encrypt everything.

**Read this before shipping it:** a passphrase bundled in your JS is not a secret — anyone
can open DevTools and read it. Encryption here defends against _casual_ inspection of the
storage inspector and against other scripts scraping `localStorage`, not against a
determined attacker with the page open. Derive the key from something the user supplies.
Requires a secure context (HTTPS or localhost); `crypto.subtle` is undefined otherwise and
you'll get a `StorageEncryptionError`.

---

## 9. Batch & transactions

`batch()` runs operations in order and **rolls back everything** if any step throws:

```ts
await storage.batch([
  { type: 'set', key: 'a', value: 1 },
  { type: 'set', key: 'b', value: 2, options: { ttl: 60_000 } },
  { type: 'rename', key: 'old', to: 'new' },
  { type: 'remove', key: 'stale' },
]);
```

`transaction()` gives you a staged view — writes buffer and commit atomically at the end:

```ts
await storage.transaction(async (tx) => {
  const balance = (await tx.get<number>('balance')) ?? 0;
  if (balance < 100) {
    tx.abort('Insufficient balance.'); // nothing is written
  }
  await tx.set('balance', balance - 100);
  await tx.set('lastPurchase', Date.now());
});
```

Reads inside the transaction see your own staged writes. Nothing hits the driver until the
body resolves; a throw or `abort()` discards the lot.

---

## 10. Watching changes & multi-tab sync

```ts
const stop = storage.watch<User>('user', (e) => {
  console.log(e.key, e.previous, '→', e.value, 'via', e.source);
});
stop(); // unsubscribe
```

`e.source` is `'local'` | `'remote'` (another tab) | `'expire'` | `'clear'`.

RxJS flavour, if you need operators:

```ts
storage.observe<User>('user').pipe(debounceTime(300)).subscribe(...);
```

Multi-tab sync is automatic when `syncAcrossTabs` is on — a BroadcastChannel carries changes,
with `storage` events as a fallback. Bound signals in every tab update themselves; the
originating tab ignores its own echo.

---

## 11. IndexedDB: pagination & search

```ts
const page = await storage.paginate<Article>(0, 25, { driver: 'indexeddb' });
// page.items → [{ key, value, info }], plus page.total / hasNext / hasPrevious

const hits = await storage.search<Article>('angular', {
  driver: 'indexeddb',
  limit: 20,
});
```

Pagination is cursor-driven, so it doesn't materialise the whole store. Both methods also
work on the other drivers (via an in-memory slice), so you can develop against `local` and
switch to `indexeddb` later without touching call sites.

Search is a substring match over raw payloads — a cheap prefilter, not a real index. For
encrypted records it can't match ciphertext, so it will miss them.

---

## 12. Backup: snapshot / export / import

```ts
const dump = await storage.export(); // plain JSON-safe object
download(JSON.stringify(dump), 'backup.json');

await storage.import(dump); // merge (default)
await storage.import(json, { merge: false }); // replace the namespace

await storage.snapshot('before-migration'); // in-memory checkpoint
await storage.restore('before-migration'); // roll back
```

Exports contain raw envelopes, so **encrypted records stay encrypted** in the dump — they
only decrypt on read with the right key.

---

## 13. Validation

Guard against schema drift and hand-edited storage:

```ts
import { StorageValidators as v } from './core/services/storage.service';

const isUser = v.shape<User>({
  id: v.number,
  name: v.string,
  role: v.oneOf('admin', 'editor'),
});

const user = await storage.get<User>('user', {
  validate: isUser,
  fallback: GUEST,
});
```

A failing value throws `StorageValidationError` rather than propagating a malformed object.
Available: `string`, `number`, `boolean`, `date`, `array(item?)`, `record(item?)`,
`oneOf(...)`, `shape({...})`. Any type-guard function works too.

---

## 14. Rich types you can store

`JSON.stringify` is not the storage format — a structural codec runs first, so these survive
a round-trip intact:

```ts
await storage.set('when', new Date());
await storage.set('lookup', new Map([['a', 1]]));
await storage.set('tags', new Set(['x', 'y']));
await storage.set('big', 123n);
await storage.set('re', /^ab+c$/gi);
await storage.set('bytes', new Uint8Array([1, 2, 3]));
await storage.set('buffer', new ArrayBuffer(8));
await storage.set('avatar', fileFromInput, { driver: 'indexeddb' });

(await storage.get<Date>('when')) instanceof Date; // true
(await storage.get<Map<string, number>>('lookup')).get('a'); // 1
```

Also handled: `NaN`, `±Infinity`, explicit `undefined`, `Error`, `DataView`, nested
combinations, and **cyclic object graphs** (via an internal reference table).

Not storable: functions and symbols — both throw `StorageSerializationError`.

---

## 15. SSR behaviour

The service never touches `window`, `document`, `localStorage`, or `indexedDB` directly. It
branches on `isPlatformBrowser(PLATFORM_ID)`.

On the server: the memory driver is used unconditionally, tab-sync and cleanup timers are
never installed, and nothing warns during prerender. Client-side, signals hydrate from real
storage on the first microtask.

**This means server-rendered HTML shows the initial value, not the stored one.** That's
correct — the server has no access to the user's storage. If a flash of the default value
matters (theme is the classic case), keep using an inline `<head>` script for that one value
and let the service manage everything else.

```ts
readonly theme = this.storage.signal<Theme>('theme', 'light');
// SSR renders 'light'; the browser swaps to the stored value on hydration.
```

---

## 16. Error handling

Nothing raw is ever thrown — every failure is a `StorageError` with a `code`, an optional
`key`, and the original `cause`.

```ts
import { StorageError, StorageQuotaExceededError } from './core/services/storage.service';

try {
  await storage.set('big', payload);
} catch (e) {
  if (e instanceof StorageQuotaExceededError) {
    await storage.cleanup();
  } else if (e instanceof StorageError) {
    console.error(e.code, e.key, e.cause);
  }
}
```

| Class                         | `code`                   | Raised when                                   |
| ----------------------------- | ------------------------ | --------------------------------------------- |
| `StorageUnavailableError`     | `STORAGE_UNAVAILABLE`    | Driver missing and fallback disabled          |
| `StorageSerializationError`   | `SERIALIZATION_FAILED`   | Value can't be encoded                        |
| `StorageDeserializationError` | `DESERIALIZATION_FAILED` | Corrupt payload                               |
| `StorageEncryptionError`      | `ENCRYPTION_FAILED`      | No key, insecure context, wrong key           |
| `StorageQuotaExceededError`   | `QUOTA_EXCEEDED`         | Backend full                                  |
| `StorageKeyError`             | `INVALID_KEY`            | Empty key, >512 chars, missing on rename/copy |
| `StorageValidationError`      | `VALIDATION_FAILED`      | `validate` rejected the value                 |
| `StorageTypeError`            | `TYPE_MISMATCH`          | `push` on a number, `merge` on an array, …    |
| `StorageTransactionError`     | `TRANSACTION_FAILED`     | Transaction aborted or failed                 |
| `StorageDestroyedError`       | `DESTROYED`              | Use after `destroy()`                         |

Errors surfaced from background work (watchers, remote sync, driver init) don't throw —
they land in `storage.lastError()`.

---

## 17. Diagnostics

```ts
storage.stats(); // { driver, keys, bytes, cacheHits, cacheMisses, writes, reads, evictions, signals }
storage.driver(); // the backend actually in use
storage.degraded(); // true if it fell back to memory
storage.version(); // mutation counter — a cheap reactive dependency
storage.lastError();
storage.statusLine(); // 'local · ns="portfolio"'
storage.isBrowser;
storage.config; // frozen, fully resolved
```

All of these are signals except `isBrowser` and `config`, so they drop straight into a debug
overlay:

```html
<pre>{{ storage.stats() | json }}</pre>
```

---

## 18. Testing

Force the memory driver for fast, isolated tests:

```ts
TestBed.configureTestingModule({
  providers: [provideStorage({ driver: 'memory', syncAcrossTabs: false, cleanupInterval: 0 })],
});

const storage = TestBed.inject(StorageService);
await storage.set('k', 1);
expect(await storage.get('k')).toBe(1);
```

Signals hydrate on a microtask, so `await Promise.resolve()` (or `await fixture.whenStable()`)
before asserting on a freshly created signal.

You can also swap in your own backend wholesale:

```ts
provideStorageDriver(new MyCustomDriver()); // implements StorageDriverAdapter
```

---

## 19. API reference

### Reads / writes

`set` · `get` · `remove` · `clear` · `exists` · `has` · `keys` · `values` · `entries` ·
`size` · `count` · `info`

### Keys

`rename` · `copy` · `move`

### Mutators

`update` · `merge` · `push` · `pop` · `shift` · `unshift` · `append` · `prepend` · `toggle` ·
`increment` · `decrement`

### Lifecycle

`expire` · `refresh` · `cleanup` · `destroy`

### Composition

`batch` · `transaction`

### Reactive

`signal` · `computed` · `resource` · `watch` · `observe` · `store`

### Data movement

`snapshot` · `restore` · `export` · `import`

### Querying

`paginate` · `search`

### Signals exposed

`version` · `driver` · `degraded` · `stats` · `lastError` · `statusLine`

### Exported symbols

`StorageService` · `provideStorage` · `provideStorageDriver` · `STORAGE_CONFIG` ·
`STORAGE_DRIVER_OVERRIDE` · `STORAGE_DEFAULT_CONFIG` · `StorageValidators` ·
`MemoryStorageDriver` · `WebStorageDriver` · `IndexedDbStorageDriver` · all error classes ·
all types

---

## 20. Gotchas

- **Everything is async except signals.** IndexedDB forces this. Use signals for templates.
- **Signals hydrate on a microtask.** The very first synchronous read returns your `initial`
  value, not the stored one. Check `status()` if the difference matters.
- **`push()` / `unshift()` take no options** — rest parameters occupy the tail of the
  signature. Use `update()` for a non-default driver.
- **`clear()` is namespace-scoped**, not origin-scoped. That's intentional.
- **Identical writes are skipped** by default (`skipIdenticalWrites`), so `set()` with an
  unchanged value costs a read and no write. Encrypted writes always go through, since a
  fresh IV makes every ciphertext different.
- **`destroy()` is terminal.** The root instance is destroyed with the app; calling it
  yourself makes every later call throw `StorageDestroyedError`.
- **Blob and File need IndexedDB in practice.** They serialize to base64, which inflates
  them ~33% — fine for a small avatar, wasteful in `localStorage`'s 5 MB budget.
- **The `search()` substring match** scans raw payloads. It's a prefilter, not an index, and
  it cannot see inside encrypted records.
