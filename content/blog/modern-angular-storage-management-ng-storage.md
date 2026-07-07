---
title: "Modern Angular Storage Management with @zellavora/ng-storage"
description: "A deep technical guide for enterprise developers: unifying localStorage, sessionStorage, IndexedDB, and cookies behind a signals-first, SSR-safe API — with encryption, compression, versioning, and cross-tab sync."
tags: ["Angular", "Signals", "Storage", "IndexedDB", "Security", "SSR"]
author: "Rabin R"
date: "2026-07-03"
readingTime: "13 min read"
---

> **Note:** `@zellavora/ng-storage` is a design study. APIs and performance figures are **illustrative** — idiomatic Angular 21 patterns used to explain the architecture, not a shipped release.

## Storage challenges in large applications

Client-side storage looks trivial — `localStorage.setItem` and you're done — right up until an application gets large, and then it becomes a source of subtle, expensive bugs:

- **Serialization is manual and error-prone.** `localStorage` stores strings. Every read/write is a `JSON.parse`/`stringify` you can forget or get wrong.
- **No reactivity.** Nothing tells your UI when storage changes — especially when it changes in *another tab*.
- **SSR crashes.** `localStorage` doesn't exist on the server. A single stray access during construction breaks server rendering.
- **No schema evolution.** You ship v1 with `{ theme }`, then v2 needs `{ theme, density }`. Old clients have stale shapes and no migration path.
- **Security is an afterthought.** Tokens and PII land in plaintext `localStorage`, readable by any XSS.
- **Quota and size.** `localStorage` caps around 5MB and is synchronous — large blobs block the main thread.

In a large app these aren't edge cases; they're daily friction distributed across every feature team.

## Why localStorage alone is not enough

`localStorage` is a synchronous, string-only, ~5MB, same-origin key–value store with no reactivity, no expiry, and no structure. That's fine for a theme preference. It's inadequate for:

- **Large or binary data** → needs IndexedDB (async, hundreds of MB).
- **Per-session data** → needs `sessionStorage`.
- **Server-readable data** → needs cookies.
- **Sensitive data** → needs encryption (or, better, not storing it client-side at all).
- **Evolving data** → needs versioning and migrations.
- **Multi-tab UIs** → needs cross-tab synchronization.

The insight behind `@zellavora/ng-storage` is that these are all the *same operation* (get/set a typed value) against *different backends* with *different capabilities*. So unify the API and make the backend a strategy.

```bash
npm install @zellavora/ng-storage
```

## The unified, signals-first API

The core primitive is a **storage signal** — a signal whose value is transparently persisted and rehydrated:

```ts
@Component({
  template: `
    <button (click)="theme.set(theme() === 'dark' ? 'light' : 'dark')">
      {{ theme() }}
    </button>
  `,
})
export class ThemeToggle {
  // Reads existing value on init, writes on every change — SSR-safe
  theme = storageSignal<'light' | 'dark'>('theme', 'dark');
}
```

`storageSignal` returns a `WritableSignal` you use like any other — but writes flow to the chosen backend, and it hydrates from storage on the browser while falling back to the default on the server.

```ts
export function storageSignal<T>(
  key: string,
  initial: T,
  opts?: StorageOptions,
): WritableSignal<T> { /* ... */ }
```

`StorageOptions` is where the power lives:

```ts
interface StorageOptions {
  backend?: 'local' | 'session' | 'indexeddb' | 'cookie';
  encrypt?: boolean;
  compress?: boolean;
  version?: number;
  migrate?: (old: unknown, oldVersion: number) => unknown;
  ttl?: number;          // cookie/local expiry in ms
  syncTabs?: boolean;    // cross-tab sync
}
```

## Backends

### localStorage

The default. Persistent, synchronous, ~5MB. Good for small preferences and cached lookups.

```ts
const density = storageSignal('ui.density', 'comfortable'); // backend: 'local'
```

### sessionStorage

Cleared when the tab closes. Ideal for wizard progress or a per-session draft.

```ts
const draft = storageSignal('checkout.draft', {}, { backend: 'session' });
```

### IndexedDB

Asynchronous, large-capacity, structured. For anything big — offline caches, document drafts, image blobs. Because IndexedDB is async, the signal exposes a load state:

```ts
const cache = indexedSignal<Report[]>('reports.cache', []);
// cache.value() — the data signal
// cache.ready() — false until the async read resolves
```

```ts
@Component({
  template: `
    @if (cache.ready()) {
      <app-report-list [reports]="cache.value()" />
    } @else {
      <app-spinner />
    }
  `,
})
```

### Cookie management

For values the *server* must read (feature flags, locale, auth hints). Typed access with attributes:

```ts
const locale = cookieSignal('locale', 'en', {
  path: '/', sameSite: 'Lax', secure: true, ttl: 30 * 864e5,
});
```

The cookie backend is the one that's SSR-*readable* — during server rendering it reads from the request cookies via injected context, so the server render already knows the user's locale.

## Encryption

Sensitive values can be encrypted at rest with the Web Crypto API (AES-GCM). A key is derived from a per-app secret and, ideally, a per-user salt:

```ts
const token = storageSignal('session.hint', '', {
  backend: 'local',
  encrypt: true,
});
```

Encryption runs through Web Crypto (`crypto.subtle`), which is async, so encrypted signals are backed by the same `ready()`-gated pattern as IndexedDB.

> **Security reality check:** client-side encryption raises the bar against casual inspection and some XSS payloads, but the decryption key lives in the same browser. It is **not** a substitute for keeping true secrets server-side. Never store long-lived auth tokens client-side if an httpOnly cookie is an option. (More in *Security considerations*.)

## Compression

Large JSON (e.g. a cached dataset) can be compressed with the native `CompressionStream` API before storage, trading a little CPU for staying under quota:

```ts
const dataset = storageSignal('analytics.snapshot', [], {
  backend: 'indexeddb',
  compress: true, // gzip via CompressionStream
});
```

*(Illustrative — actual ratios depend entirely on your data's entropy.)*

| Payload | Raw | Compressed (illustrative) |
|---|---|---|
| 500-row JSON table | ~420 KB | ~70 KB |
| Config object | ~8 KB | ~3 KB |
| Already-binary blob | ~1 MB | ~1 MB (no gain) |

Rule of thumb: compress text-heavy JSON; don't bother with already-compressed binary.

## Versioning

The feature that separates a toy from a production store. Each key carries a version; when the stored version is older than the code's, a migration runs on read:

```ts
const settings = storageSignal('user.settings', defaultSettings, {
  version: 3,
  migrate: (old, oldVersion) => {
    let s = old as any;
    if (oldVersion < 2) s = { ...s, density: 'comfortable' };
    if (oldVersion < 3) s = { ...s, theme: s.dark ? 'dark' : 'light' };
    return s;
  },
});
```

Now a user who last visited on v1 gets their data transparently upgraded to v3 instead of a crash or a silent reset.

## Cross-tab synchronization

When a user has your app open in two tabs and changes the theme in one, the other should update. `syncTabs` wires the `storage` event (for local/session) or a `BroadcastChannel` (for richer backends) into the signal:

```ts
const theme = storageSignal('theme', 'dark', { syncTabs: true });
// Change in Tab A → theme() updates in Tab B, view re-renders
```

Under the hood, an incoming cross-tab event calls `signal.set()` with the new value — so every consumer re-renders through the normal signal path, no manual event plumbing.

## SSR-safe implementation

The library never assumes a browser:

1. **Platform guard on every backend.** On the server, `local`/`session`/`indexeddb` backends return the provided default; only `cookie` reads real data (from the request).
2. **No storage access in field initializers.** Reads happen through a provider that checks `isPlatformBrowser()`.
3. **State transfer.** Values read on the server (cookies) transfer to the client via `TransferState`, avoiding a re-read flash.

```ts
export class StorageEngine {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  read<T>(key: string, fallback: T): T {
    if (!this.isBrowser) return fallback;
    // ...browser read
  }
}
```

The consequence: `storageSignal('theme', 'dark')` renders `dark` on the server and hydrates to the real value on the client with no mismatch.

## Security considerations

Storage is a security surface, so the library's defaults are conservative:

- **Nothing sensitive by default.** Encryption is opt-in and loudly documented as *not* a secret-management solution.
- **Prefer httpOnly cookies for auth.** The docs steer auth tokens to server-set httpOnly cookies, which JavaScript (and XSS) can't read — the storage lib deliberately can't manage those.
- **`sameSite` + `secure` defaults** on the cookie backend.
- **Namespaced keys** (`appId:key`) prevent collisions between micro-frontends on the same origin.
- **Size guards** to avoid quota-exceeded exceptions taking down the app.

The honest guidance: use client storage for *convenience and UX state*, not for *trust decisions*. Anything an attacker could exploit by reading or forging belongs on the server.

## Real enterprise examples

**Remembered dashboard layout** (ties into `@zellavora/ng-layout`):

```ts
export class DashboardShell {
  sidebarOpen = storageSignal('dash.sidebar', true, { syncTabs: true });
  density = storageSignal('dash.density', 'comfortable');
}
```

**Offline-capable drafts** for a long form (ties into `@zellavora/ng-form`):

```ts
export class TicketForm {
  private draft = storageSignal('ticket.draft', {}, {
    backend: 'indexeddb', compress: true,
  });
  model = signal(this.draft());
  constructor() {
    // autosave: mirror model into storage
    effect(() => this.draft.set(this.model()));
  }
}
```

**Encrypted, versioned user settings:**

```ts
const settings = storageSignal('settings', defaults, {
  encrypt: true, version: 4, migrate,
});
```

## Performance comparison

*(Illustrative and directional — not measurements of a shipped build.)*

| Concern | Raw `localStorage` | `@zellavora/ng-storage` |
|---|---|---|
| Reactivity | None (manual) | Signal — views update automatically |
| Large data | Blocks main thread | IndexedDB, async, off critical path |
| Cross-tab | Manual `storage` listener | Built-in `syncTabs` |
| Schema evolution | None | Versioned migrations |
| SSR | Crashes on access | Guarded, deterministic |
| Serialization | Hand-written per call | Automatic, typed |

## Best practices

- **Choose the backend by capability.** Small preference → local; per-session → session; large/structured → IndexedDB; server-readable → cookie.
- **Always version anything with a non-trivial shape.** Future-you will change it.
- **Namespace keys** by app/feature to avoid collisions.
- **Debounce autosave effects** so a fast-typing user doesn't hammer IndexedDB.
- **Treat encryption as obfuscation, not security.** Keep real secrets server-side.

## Common mistakes

- **Accessing storage in a constructor/field initializer** — the classic SSR crash. Route through the guarded engine.
- **Storing auth tokens in `localStorage`** — readable by any XSS. Prefer httpOnly cookies.
- **Forgetting migrations** — shipping a shape change strands existing users' data.
- **Putting megabytes in `localStorage`** — synchronous and quota-limited; use IndexedDB.

## Conclusion

Client storage in large Angular apps is not one problem but several — reactivity, SSR-safety, size, evolution, security, and multi-tab consistency — that teams usually solve ad hoc, badly, and repeatedly. `@zellavora/ng-storage` unifies them behind a single signals-first primitive: pick a backend, get automatic serialization, reactivity, SSR-safety, and opt-in encryption/compression/versioning. The result is that persistence stops being a source of bugs and becomes a one-line concern — which is exactly what infrastructure should be.
