# StorageService — Usage Guide

A single-file, signal-aware storage layer for Angular. One service, four backends
(`local`, `session`, `idb`, `memory`), with TTL, AES encryption, cross-tab sync,
rich serialization, and SSR safety.

---

## Table of contents

1. [Install & wire up](#1-install--wire-up)
2. [Configuration](#2-configuration)
3. [Core CRUD](#3-core-crud)
4. [Backends](#4-backends)
5. [TTL / expiration](#5-ttl--expiration)
6. [Signals](#6-signals)
7. [Querying](#7-querying)
8. [Mutation helpers](#8-mutation-helpers)
9. [Array & primitive helpers](#9-array--primitive-helpers)
10. [Bulk & transactions](#10-bulk--transactions)
11. [Export / import / snapshots](#11-export--import--snapshots)
12. [Encryption](#12-encryption)
13. [Serialization](#13-serialization)
14. [Cross-tab sync](#14-cross-tab-sync)
15. [SSR](#15-ssr)
16. [Error handling](#16-error-handling)
17. [Maintenance & teardown](#17-maintenance--teardown)
18. [Full API reference](#18-full-api-reference)
19. [Recipes](#19-recipes)
20. [Gotchas](#20-gotchas)

---

## 1. Install & wire up

### Dependencies

```bash
npm install crypto-js
npm install -D @types/crypto-js
```

`@angular/core/rxjs-interop` and `rxjs` ship with Angular — no extra install.

### Drop in the file

Place `storage.service.ts` anywhere under `src/app` (convention:
`src/app/core/services/storage.service.ts`). It is `providedIn: 'root'`, so
there is nothing to register.

### Inject it

```ts
import { Component, inject } from '@angular/core';
import { StorageService } from './core/services/storage.service';

@Component({ selector: 'app-root', template: '' })
export class AppComponent {
  private readonly storage = inject(StorageService);
}
```

### Verify `resource()` compiles

The service exposes an `idbEntries` resource using the `{ params, loader,
defaultValue }` signature. That property was called `request` before Angular 20.
If your build fails on it:

```ts
// Angular 19
readonly idbEntries = resource({ request: () => this.revision(), loader: ... });
```

Or delete the `idbEntries` field entirely — nothing else depends on it.

---

## 2. Configuration

Defaults are applied automatically. Override any subset via `STORAGE_CONFIG`.

```ts
// app.config.ts
import { ApplicationConfig, inject } from '@angular/core';
import { STORAGE_CONFIG } from './core/services/storage.service';
import { AppSettingsService } from './core/services/app-settings.service';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: STORAGE_CONFIG,
      useFactory: () => {
        const settings = inject(AppSettingsService);
        return {
          prefix: 'myapp.',
          encryptionKey: settings.storageKey,
          encryptByDefault: true,
          encryptIndexedDb: false,
          dbName: 'myapp-db',
          dbVersion: 2,
          storeName: 'keyval',
          stores: ['keyval', 'documents', 'audit'],
          defaultBackend: 'local' as const,
          defaultTtl: 0,
          channel: 'myapp-storage',
          cleanupInterval: 60_000,
        };
      },
    },
  ],
};
```

### Every option

| Option             | Type                | Default                    | Meaning                                                                                                              |
| ------------------ | ------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `prefix`           | `string`            | `'app.'`                   | Prepended to every `localStorage`/`sessionStorage` key. Namespaces your app so `clear()` never touches foreign keys. |
| `encryptionKey`    | `string`            | `'change-me-at-bootstrap'` | AES passphrase. **Change this.**                                                                                     |
| `encryptByDefault` | `boolean`           | `true`                     | Encrypt `local`/`session` payloads.                                                                                  |
| `encryptIndexedDb` | `boolean`           | `false`                    | Encrypt IndexedDB payloads too.                                                                                      |
| `dbName`           | `string`            | `'app-db'`                 | IndexedDB database name.                                                                                             |
| `dbVersion`        | `number`            | `1`                        | Schema version. Bump to trigger `upgradeDB()`.                                                                       |
| `storeName`        | `string`            | `'keyval'`                 | Default object store.                                                                                                |
| `stores`           | `readonly string[]` | `['keyval']`               | Extra stores created on upgrade.                                                                                     |
| `defaultBackend`   | `StorageBackend`    | `'local'`                  | Used when no `backend` option is passed.                                                                             |
| `defaultTtl`       | `number`            | `0`                        | Default TTL in ms. `0` = never expires.                                                                              |
| `channel`          | `string`            | `'app-storage'`            | BroadcastChannel name for cross-tab sync.                                                                            |
| `cleanupInterval`  | `number`            | `60_000`                   | Auto-run `clearExpired()` every N ms. `0` disables.                                                                  |

> **Note on `encryptionKey`:** a passphrase shipped in a browser bundle is
> obfuscation, not security. It stops casual DevTools inspection and shoulder
> surfing. It does not protect against a determined attacker who has your JS.
> Never store anything you'd genuinely mind being read.

---

## 3. Core CRUD

All core methods are `async` and generic.

```ts
// Write
await this.storage.set<User>('profile', { id: 1, name: 'Rabin' });

// Read
const user = await this.storage.get<User>('profile'); // User | undefined

// Delete one key
await this.storage.remove('profile');

// Delete everything under the prefix, for one backend
await this.storage.clear();
```

`get()` returns `undefined` — never `null` — for missing, expired, or
unreadable keys.

### Options object

Every method that touches storage accepts an optional `StorageOptions`:

```ts
interface StorageOptions {
  backend?: 'local' | 'session' | 'idb' | 'memory';
  ttl?: number; // ms; 0/undefined = never expires
  encrypt?: boolean; // per-call override
  store?: string; // IndexedDB object store override
}
```

```ts
await this.storage.set('draft', body, {
  backend: 'idb',
  store: 'documents',
  ttl: 86_400_000,
  encrypt: true,
});
```

---

## 4. Backends

| Backend   | Persists         | Scope            | Capacity       | Use for                              |
| --------- | ---------------- | ---------------- | -------------- | ------------------------------------ |
| `local`   | Yes              | Origin, all tabs | ~5 MB          | Tokens, preferences, cached lookups  |
| `session` | Until tab closes | One tab          | ~5 MB          | Wizard state, per-tab context        |
| `idb`     | Yes              | Origin, all tabs | Hundreds of MB | Documents, offline data, large lists |
| `memory`  | No               | This JS context  | RAM            | SSR fallback, ephemeral state, tests |

```ts
await this.storage.set('token', jwt); // local (default)
await this.storage.set('step', 3, { backend: 'session' });
await this.storage.set('doc', blob, { backend: 'idb' });
await this.storage.set('tmp', x, { backend: 'memory' });
```

**Keys are namespaced by backend.** `get('token')` on `local` and
`get('token', { backend: 'session' })` are two entirely separate records with
separate cache entries and separate signals. Be consistent about which backend a
key lives in, or wrap it:

```ts
private readonly session = { backend: 'session' } as const;
await this.storage.set('step', 3, this.session);
await this.storage.get<number>('step', this.session);
```

---

## 5. TTL / expiration

```ts
// Expires in 10 minutes
await this.storage.set('otp', code, { ttl: 600_000 });

// Never expires (default)
await this.storage.set('theme', 'dark');
```

Expiry is enforced three ways:

1. **On read** — `get()` checks the envelope, deletes the record, returns `undefined`.
2. **On a timer** — `clearExpired()` runs every `cleanupInterval` ms.
3. **Manually** — call `clearExpired()` or `cleanup()` yourself.

```ts
const removed = await this.storage.clearExpired();
console.log(`${removed} expired records purged`);
```

`copy()`, `move()`, and `import()` preserve the _remaining_ TTL, not the
original duration — a record with 30s left keeps 30s, not the full window.

---

## 6. Signals

This is the part that changes how you write components.

### Basic

```ts
@Component({
  template: `
    <p>Welcome, {{ profile()?.name ?? 'guest' }}</p>
    <button (click)="rename()">Rename</button>
  `,
})
export class ProfileComponent {
  private readonly storage = inject(StorageService);

  readonly profile = this.storage.signal<User>('profile');

  async rename(): Promise<void> {
    await this.storage.merge<User>('profile', { name: 'New name' });
    // this.profile() already reflects the new value — no manual refresh
  }
}
```

### How hydration works

A signal has to have a value _synchronously_, but storage reads are async. So:

- `signal('profile')` returns **immediately** with the cached value, your
  `initialValue`, or `undefined`
- a background read hydrates it a tick later
- from then on it's warm — `set()`/`remove()`/`update()`/`merge()` update it
  synchronously via the memory cache

```ts
readonly theme = this.storage.signal<string>('theme', 'light'); // initial value
```

If you need to know whether hydration finished, await a `get()` first, or use
`resource()` in your own component.

### Reuse

Signals are cached by `backend::key`. Calling `signal('profile')` twice returns
the _same_ `WritableSignal` — cheap to call, safe to call in a template-adjacent
getter.

### Which methods update signals

| Method                                            | Updates signal                                        |
| ------------------------------------------------- | ----------------------------------------------------- |
| `set`, `update`, `merge`                          | Yes                                                   |
| `remove`                                          | Yes → `undefined`                                     |
| `clear`                                           | Yes → all signals for that backend become `undefined` |
| `push`/`pop`/`shift`/`unshift`/`append`/`prepend` | Yes (they call `set`)                                 |
| `increment`/`decrement`/`toggle`                  | Yes                                                   |
| `bulkSet`/`bulkRemove`                            | Yes                                                   |
| `transaction`                                     | Yes, after commit                                     |
| Another tab writing                               | Yes, via BroadcastChannel                             |

### Derived signals

```ts
readonly isAdmin = this.storage.select<User, boolean>(
  'profile',
  (user) => user?.role === 'admin',
);

// Or plain computed()
readonly initials = computed(() => {
  const name = this.profile()?.name ?? '';
  return name.split(' ').map((p) => p[0]).join('');
});
```

### Watching

```ts
export class TokenWatcher {
  private readonly storage = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const stop = this.storage.watch<string>('token', (token) => {
      if (!token) {
        this.router.navigate(['/login']);
      }
    });
    this.destroyRef.onDestroy(stop);
  }
}
```

`watch()` returns an unsubscribe function. Call it, or it lives as long as the
service.

### RxJS interop

```ts
readonly token$ = this.storage.observe<string>('token');

readonly authed$ = this.storage
  .observe<string>('token')
  .pipe(map((t) => !!t), distinctUntilChanged());
```

---

## 7. Querying

```ts
await this.storage.exists('token'); // boolean
await this.storage.keys(); // readonly string[]
await this.storage.values<User>(); // readonly User[]
await this.storage.entries<User>(); // readonly StorageEntry<User>[]
await this.storage.count(); // number of keys
await this.storage.size(); // approximate bytes
```

`StorageEntry<T>` gives you metadata alongside the value:

```ts
interface StorageEntry<T> {
  key: string;
  value: T;
  backend: StorageBackend;
  expiresAt: number | null;
  updatedAt: number;
}
```

### Synchronous key list

```ts
readonly keyCount = this.storage.keyCount; // Signal<number>
readonly allKeys = this.storage.keyList;   // linkedSignal<readonly string[]>
```

These cover `local`, `session`, and `memory` only — IndexedDB is async and can't
participate in a sync signal. Use `idbEntries` for that.

### Search with pagination

```ts
const page = await this.storage.search<Order>(
  {
    key: 'order:', // substring match on key
    where: (order) => order.status === 'pending', // predicate on value
    limit: 20,
    offset: 40,
    direction: 'prev', // IDBCursorDirection
  },
  { backend: 'idb', store: 'documents' },
);

page.items; // readonly StorageEntry<Order>[]
page.total; // total matches before pagination
page.hasMore; // boolean
```

For `idb` this uses a real `IDBCursor` — large stores are never fully
materialized. Unreadable records are skipped rather than aborting the scan.

---

## 8. Mutation helpers

### `update()` — read, transform, write

```ts
const next = await this.storage.update<number>('visits', (n) => (n ?? 0) + 1);
```

### `merge()` — shallow patch an object

```ts
await this.storage.merge<Settings>('settings', { theme: 'dark' });
```

Shallow only. Nested objects are replaced, not merged. For deep merges do it
yourself inside `update()`.

Throws `StorageTypeError` if the existing value isn't an object.

### `rename()` / `copy()` / `move()`

```ts
await this.storage.copy('draft', 'draft.backup');
await this.storage.move('draft', 'published');
await this.storage.rename('old', 'new'); // alias for move()
```

`copy()` throws `StorageError` with code `NOT_FOUND` if the source is missing.
All three preserve remaining TTL.

### `batch()` — a list of mixed operations

```ts
await this.storage.batch([
  { type: 'set', key: 'a', value: 1 },
  { type: 'merge', key: 'settings', value: { theme: 'dark' } },
  { type: 'update', key: 'count', updater: (n: number | undefined) => (n ?? 0) + 1 },
  { type: 'remove', key: 'temp' },
]);
```

Sequential, not atomic — a failure partway through leaves earlier operations
applied. For atomicity on IndexedDB use `transaction()`.

---

## 9. Array & primitive helpers

Each reads, mutates, and writes back. All type-checked — wrong type throws
`StorageTypeError`.

### Arrays

```ts
await this.storage.push<string>('recent', 'item-a', 'item-b'); // → new length
await this.storage.unshift<string>('recent', 'item-z'); // → new length
const last = await this.storage.pop<string>('recent'); // → item | undefined
const first = await this.storage.shift<string>('recent'); // → item | undefined
```

Missing key is treated as an empty array, so `push()` on a fresh key works.

### Strings

```ts
await this.storage.append('log', 'line\n'); // → full string
await this.storage.prepend('log', 'HEAD\n'); // → full string
```

> `append`/`prepend` are **string concatenation**. `push`/`unshift` are **array
> operations**. They'd be duplicates otherwise.

### Numbers & booleans

```ts
await this.storage.increment('count'); // +1 → new value
await this.storage.increment('count', 5); // +5
await this.storage.decrement('count', 2); // -2
await this.storage.toggle('darkMode'); // → new boolean
```

Missing keys default to `0` / `false`.

---

## 10. Bulk & transactions

### Bulk insert / delete

One IndexedDB transaction for the whole batch. On other backends it falls back
to sequential `set`/`remove` with identical semantics.

```ts
await this.storage.bulkSet(
  new Map([
    ['u:1', userA],
    ['u:2', userB],
  ]),
  { backend: 'idb' },
);

// Or an array of tuples
await this.storage.bulkSet(
  [
    ['u:1', userA],
    ['u:2', userB],
  ],
  { backend: 'idb', ttl: 3_600_000 },
);

await this.storage.bulkRemove(['u:1', 'u:2'], { backend: 'idb' });
```

### `transaction()` — atomic multi-step work

```ts
const total = await this.storage.transaction(
  async (tx) => {
    const cart = (await tx.get<CartItem[]>('cart')) ?? [];
    const next = [...cart, newItem];
    await tx.set('cart', next);
    await tx.set('cartTotal', next.length);
    await tx.remove('cartDraft');
    return next.length;
  },
  { backend: 'idb' },
);
```

On `idb` everything runs on one transaction and aborts together if the callback
throws. Caches and signals are refreshed after commit.

> **Critical limitation:** IndexedDB transactions auto-close when the microtask
> queue drains. Any `await` inside the callback on something that is _not_ an IDB
> request — a `fetch`, a `setTimeout`, an HTTP call — will kill the transaction
> mid-flight. Keep these callbacks pure storage work. Do your I/O before or after.

On non-`idb` backends the callback still runs with the same shape, but there is
no rollback.

---

## 11. Export / import / snapshots

### Export

```ts
const dump = await this.storage.export({ backend: 'idb' });
const json = JSON.stringify(dump);
```

`StorageDump` is plain JSON — safe to download, POST, or write to a file.

### Import

```ts
const written = await this.storage.import(dump);
const written2 = await this.storage.import(jsonString); // string works too
```

Additive — existing keys are overwritten, others left alone. Already-expired
entries are skipped. Returns the number of records written. Throws
`StorageError` with code `DESERIALIZATION` on an unrecognized format.

### Snapshots

Labelled in-memory checkpoints. Useful for "reset to defaults", undo, or test
setup.

```ts
await this.storage.snapshot('before-import');
await this.storage.import(userSuppliedDump);

if (somethingWentWrong) {
  await this.storage.restore('before-import'); // clears, then re-imports
}
```

Snapshots live in memory only and vanish on reload. Persist a snapshot by
writing the returned dump to storage yourself.

---

## 12. Encryption

CryptoJS AES, applied to the encoded envelope before it hits the backend.

```ts
// Config defaults
encryptByDefault: true; // local + session
encryptIndexedDb: false; // idb

// Per-call override
await this.storage.set('public', data, { encrypt: false });
await this.storage.set('secret', data, { backend: 'idb', encrypt: true });
```

Reads auto-detect: payloads starting with `U2FsdGVk` (CryptoJS's base64 header)
are decrypted, others are parsed as-is. So you can flip `encryptByDefault` on an
existing store without a migration — old plaintext records still read fine.

If decryption fails (wrong key, corrupt data), the record is **deleted** and
`get()` returns `undefined`. This is deliberate: one bad record from an old
schema shouldn't poison every caller. If you'd rather see the error, change the
catch block in `get()`.

IndexedDB encryption is off by default because it defeats `search()`'s ability
to filter cheaply — every record has to be decrypted during the cursor scan.
It still works, just slower.

---

## 13. Serialization

`encode()`/`decode()` handle far more than `JSON.stringify`:

| Type                             | Round-trips                  |
| -------------------------------- | ---------------------------- |
| `Date`                           | Yes — real `Date` back       |
| `Map`                            | Yes, including nested values |
| `Set`                            | Yes                          |
| `BigInt`                         | Yes                          |
| `RegExp`                         | Yes, source + flags          |
| `Infinity`, `-Infinity`, `NaN`   | Yes                          |
| `undefined` in object properties | Yes                          |
| Nested objects, arrays           | Yes                          |

```ts
await this.storage.set('complex', {
  when: new Date(),
  tags: new Set(['a', 'b']),
  index: new Map([['k', { nested: new Date() }]]),
  big: 9007199254740993n,
  pattern: /^ab+c$/gi,
  missing: undefined,
});

const back = await this.storage.get<typeof value>('complex');
back.when instanceof Date; // true
back.tags instanceof Set; // true
back.index.get('k').nested; // Date
```

**Not supported:** class instances lose their prototype (you get a plain
object), circular references throw `StorageSerializationError`, and functions
are dropped. Rehydrate classes yourself:

```ts
const raw = await this.storage.get<UserData>('profile');
const user = raw ? Object.assign(new User(), raw) : undefined;
```

---

## 14. Cross-tab sync

Two mechanisms, automatic:

- **`StorageEvent`** — native `localStorage`/`sessionStorage` change events
- **`BroadcastChannel`** — covers IndexedDB and gives faster, richer notification

When another tab writes, this tab drops its cache entry for that key and
re-reads from storage, updating the signal. Components using
`storage.signal('token')` re-render with no extra code.

```ts
// Tab A
await storage.set('theme', 'dark');

// Tab B — this signal updates on its own
readonly theme = this.storage.signal<string>('theme');
```

**Messages carry key + backend only, never values.** Each tab re-reads from
storage itself. This avoids putting decrypted payloads on a channel any script
on the origin can listen to. The cost is one extra read per tab per change —
cheap, and usually served from the backend's own cache.

If `BroadcastChannel` is unavailable, the service degrades to `StorageEvent`
only, meaning IndexedDB writes won't propagate across tabs.

---

## 15. SSR

The service checks for `window` and `document` at construction. Under SSR:

- every backend silently becomes `memory`
- no `StorageEvent` listener, no `BroadcastChannel`, no cleanup timer
- IndexedDB is never opened
- all methods work and return sensible values

No `isPlatformBrowser` checks needed in your code, and no
`ReferenceError: localStorage is not defined`.

```ts
// Safe on server and client alike
const theme = (await this.storage.get<string>('theme')) ?? 'light';
```

Note that server-side memory storage is **per-request-ish** and empty — a value
written during SSR is not visible to the browser after hydration. Expect
`undefined` on the server for anything the user set previously. Design your
components to render a sensible default and update after hydration.

Writes issued before `ready()` flips true are queued and flushed automatically
by an `effect()`.

---

## 16. Error handling

Nothing raw ever escapes. Every failure is a `StorageError` subclass with a
typed `code` and the original error on `cause`.

```ts
import { StorageError, StorageQuotaError } from './storage.service';

try {
  await this.storage.set('big', hugePayload);
} catch (error) {
  if (error instanceof StorageQuotaError) {
    await this.storage.cleanup();
    return;
  }
  if (error instanceof StorageError) {
    console.error(error.code, error.message, error.cause);
    return;
  }
  throw error;
}
```

### Error types

| Class                         | `code`            | When                                                   |
| ----------------------------- | ----------------- | ------------------------------------------------------ |
| `StorageUnavailableError`     | `UNAVAILABLE`     | Backend missing, IndexedDB blocked, write failed       |
| `StorageSerializationError`   | `SERIALIZATION`   | Circular reference, unserializable value               |
| `StorageDeserializationError` | `DESERIALIZATION` | Corrupt payload, bad dump format                       |
| `StorageEncryptionError`      | `ENCRYPTION`      | AES encrypt failed                                     |
| `StorageDecryptionError`      | `DECRYPTION`      | Wrong key, corrupt ciphertext                          |
| `StorageKeyError`             | `INVALID_KEY`     | Empty or non-string key                                |
| `StorageQuotaError`           | `QUOTA_EXCEEDED`  | `localStorage`/`sessionStorage` full                   |
| `StorageTypeError`            | `TYPE_MISMATCH`   | `increment()` on a string, `push()` on an object, etc. |
| `StorageTransactionError`     | `TRANSACTION`     | IDB transaction failed or aborted                      |
| `StorageDestroyedError`       | `DESTROYED`       | Method called after `destroy()`                        |

### What does _not_ throw

- `get()` on a missing key → `undefined`
- `get()` on a corrupt/undecryptable record → deletes it, returns `undefined`
- `search()` / `entries()` on unreadable records → skips them
- `broadcast()` on a closed channel → silent

---

## 17. Maintenance & teardown

```ts
await this.storage.clearExpired(); // → count removed, all backends
await this.storage.cleanup(); // clearExpired + purge stale cache & signals
this.storage.destroy(); // full teardown
```

`clearExpired()` runs automatically every `cleanupInterval` ms. `destroy()` is
wired to `DestroyRef` and fires on app teardown — you rarely call it yourself.
After `destroy()`, every method throws `StorageDestroyedError`.

`cleanup()` also drops signals that are `undefined` and uncached, which matters
if you're generating many short-lived keys.

---

## 18. Full API reference

### Signals (properties)

| Member       | Type                                         | Description                                |
| ------------ | -------------------------------------------- | ------------------------------------------ |
| `ready`      | `Signal<boolean>`                            | Service initialized                        |
| `available`  | `Signal<boolean>`                            | Ready and not destroyed                    |
| `version`    | `Signal<number>`                             | Revision counter, bumped on every mutation |
| `keyList`    | `linkedSignal<readonly string[]>`            | Sync key list (local/session/memory)       |
| `keyCount`   | `Signal<number>`                             | Length of `keyList`                        |
| `idbEntries` | `Resource<readonly StorageEntry<unknown>[]>` | Async view of the default IDB store        |

### Methods

| Method                                    | Returns                               |
| ----------------------------------------- | ------------------------------------- |
| `set<T>(key, value, options?)`            | `Promise<void>`                       |
| `get<T>(key, options?)`                   | `Promise<T \| undefined>`             |
| `remove(key, options?)`                   | `Promise<void>`                       |
| `clear(options?)`                         | `Promise<void>`                       |
| `exists(key, options?)`                   | `Promise<boolean>`                    |
| `keys(options?)`                          | `Promise<readonly string[]>`          |
| `values<T>(options?)`                     | `Promise<readonly T[]>`               |
| `entries<T>(options?)`                    | `Promise<readonly StorageEntry<T>[]>` |
| `count(options?)`                         | `Promise<number>`                     |
| `size(options?)`                          | `Promise<number>` (approx. bytes)     |
| `search<T>(query?, options?)`             | `Promise<StoragePage<T>>`             |
| `update<T>(key, updater, options?)`       | `Promise<T>`                          |
| `merge<T>(key, patch, options?)`          | `Promise<T>`                          |
| `rename(from, to, options?)`              | `Promise<void>`                       |
| `copy(from, to, options?)`                | `Promise<void>`                       |
| `move(from, to, options?)`                | `Promise<void>`                       |
| `batch(operations, options?)`             | `Promise<void>`                       |
| `bulkSet<T>(records, options?)`           | `Promise<void>`                       |
| `bulkRemove(keys, options?)`              | `Promise<void>`                       |
| `transaction<R>(work, options?)`          | `Promise<R>`                          |
| `push<T>(key, ...items)`                  | `Promise<number>`                     |
| `pop<T>(key)`                             | `Promise<T \| undefined>`             |
| `shift<T>(key)`                           | `Promise<T \| undefined>`             |
| `unshift<T>(key, ...items)`               | `Promise<number>`                     |
| `append(key, text, options?)`             | `Promise<string>`                     |
| `prepend(key, text, options?)`            | `Promise<string>`                     |
| `increment(key, by?, options?)`           | `Promise<number>`                     |
| `decrement(key, by?, options?)`           | `Promise<number>`                     |
| `toggle(key, options?)`                   | `Promise<boolean>`                    |
| `signal<T>(key, initialValue?, options?)` | `WritableSignal<T \| undefined>`      |
| `select<T, R>(key, project, options?)`    | `Signal<R>`                           |
| `watch<T>(key, callback, options?)`       | `() => void` (unsubscribe)            |
| `observe<T>(key, options?)`               | `Observable<T \| undefined>`          |
| `export(options?)`                        | `Promise<StorageDump>`                |
| `import(dump, options?)`                  | `Promise<number>`                     |
| `snapshot(label?, options?)`              | `Promise<StorageDump>`                |
| `restore(label?, options?)`               | `Promise<number>`                     |
| `clearExpired()`                          | `Promise<number>`                     |
| `cleanup()`                               | `Promise<number>`                     |
| `destroy()`                               | `void`                                |

---

## 19. Recipes

### Auth token with reactive guard

```ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);

  readonly token = this.storage.signal<string>('auth.token');
  readonly isAuthenticated = computed(() => !!this.token());

  async login(credentials: Credentials): Promise<void> {
    const { token, expiresIn } = await firstValueFrom(
      this.http.post<LoginResponse>('/api/login', credentials),
    );
    await this.storage.set('auth.token', token, { ttl: expiresIn * 1000 });
  }

  async logout(): Promise<void> {
    await this.storage.remove('auth.token');
  }
}

export const authGuard: CanActivateFn = () =>
  inject(AuthService).isAuthenticated() || inject(Router).createUrlTree(['/login']);
```

The token expires on its own via TTL, logout propagates to every open tab, and
the guard reads a plain signal.

### Persisted user preferences

```ts
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly storage = inject(StorageService);

  private readonly defaults: Preferences = {
    theme: 'system',
    density: 'comfortable',
    language: 'en',
  };

  readonly preferences = computed<Preferences>(() => ({
    ...this.defaults,
    ...(this.storage.signal<Partial<Preferences>>('prefs')() ?? {}),
  }));

  readonly theme = computed(() => this.preferences().theme);

  async patch(changes: Partial<Preferences>): Promise<void> {
    await this.storage.merge<Preferences>('prefs', changes);
  }
}
```

### Offline cache with stale-while-revalidate

```ts
async getProducts(): Promise<Product[]> {
  const cached = await this.storage.get<Product[]>('products', { backend: 'idb' });

  const refresh = firstValueFrom(this.http.get<Product[]>('/api/products'))
    .then((fresh) =>
      this.storage.set('products', fresh, { backend: 'idb', ttl: 3_600_000 })
        .then(() => fresh),
    );

  return cached ?? refresh; // instant if cached, otherwise wait
}
```

### Multi-step form surviving refresh

```ts
export class WizardComponent {
  private readonly storage = inject(StorageService);
  private readonly opts = { backend: 'session' } as const;

  readonly draft = this.storage.signal<WizardDraft>('wizard', {}, this.opts);

  async saveStep(step: number, data: Partial<WizardDraft>): Promise<void> {
    await this.storage.merge<WizardDraft>('wizard', { ...data, step }, this.opts);
  }

  async finish(): Promise<void> {
    await this.http.post('/api/submit', this.draft()).toPromise();
    await this.storage.remove('wizard', this.opts);
  }
}
```

### Paginated offline table

```ts
readonly page = signal(0);
readonly filter = signal('');

readonly results = resource({
  params: () => ({ page: this.page(), filter: this.filter() }),
  loader: ({ params }) =>
    this.storage.search<Order>(
      {
        where: (o) => o.customer.toLowerCase().includes(params.filter.toLowerCase()),
        limit: 25,
        offset: params.page * 25,
      },
      { backend: 'idb' },
    ),
});
```

### Backup and restore

```ts
async downloadBackup(): Promise<void> {
  const dump = await this.storage.export({ backend: 'idb' });
  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup-${new Date().toISOString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async restoreBackup(file: File): Promise<void> {
  await this.storage.snapshot('pre-restore', { backend: 'idb' });
  try {
    const count = await this.storage.import(await file.text(), { backend: 'idb' });
    this.toast.success(`Restored ${count} records`);
  } catch {
    await this.storage.restore('pre-restore', { backend: 'idb' });
    this.toast.error('Restore failed — rolled back');
  }
}
```

### Testing

```ts
describe('PreferencesService', () => {
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: STORAGE_CONFIG,
          useValue: {
            defaultBackend: 'memory' as const,
            encryptByDefault: false,
            cleanupInterval: 0,
          },
        },
      ],
    });
    storage = TestBed.inject(StorageService);
  });

  afterEach(async () => {
    await storage.clear({ backend: 'memory' });
  });

  it('persists a patch', async () => {
    const service = TestBed.inject(PreferencesService);
    await service.patch({ theme: 'dark' });
    expect(service.theme()).toBe('dark');
  });
});
```

`memory` backend + no encryption + no cleanup timer = fast, isolated, no
browser API mocking.

---

## 20. Gotchas

**Signals are backend-scoped.** `signal('token')` and
`signal('token', undefined, { backend: 'session' })` are different signals over
different records. Be consistent, or wrap your options in a constant.

**Signals start `undefined`.** First render shows the initial value; the real
value arrives a tick later. Give an `initialValue` or handle `undefined` in
templates. Don't assert on a signal immediately after construction in a test —
`await` a `get()` first.

**`merge()` is shallow.** Nested objects are replaced. Deep-merge inside
`update()` if you need it.

**`batch()` is not atomic.** Use `transaction()` on `idb` for that.

**IDB transactions die on non-IDB awaits.** No `fetch`, no `setTimeout`, no HTTP
inside a `transaction()` callback. Do that work outside.

**Corrupt records are deleted, not surfaced.** A failed decrypt or decode
silently removes the key. Deliberate, but change the catch in `get()` if you'd
rather know.

**Class instances lose prototypes.** You get plain objects back. Rehydrate
manually.

**Circular references throw.** `StorageSerializationError`.

**The encryption key is in your bundle.** It's obfuscation, not security.

**SSR memory storage starts empty.** Values the user set previously are not
visible on the server. Render defaults, update after hydration.

**`keyList` / `keyCount` skip IndexedDB.** They're synchronous; IDB isn't. Use
`idbEntries` or `await count({ backend: 'idb' })`.

**Bump `dbVersion` when changing `stores`.** New object stores are only created
during an upgrade, and upgrades only run when the version number increases.

**`size()` is approximate.** It counts UTF-16 code units of the stored strings,
which is close to actual bytes for `localStorage` but ignores browser overhead.
