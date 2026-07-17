# Bug #2: Service Worker Subscription Memory Leak

**Severity**: 🔴 CRITICAL - Memory Leak  
**File**: `src/app/app.config.ts`  
**Lines**: 30-37  
**Status**: CONFIRMED

---

## Problem

The service worker update subscription is never cleaned up, causing subscriptions to accumulate over time.

```typescript
// Line 30-37: Subscription created but never unsubscribed
function activateUpdatesOnNextLoad(): void {
  const updates = inject(SwUpdate);
  if (!updates.isEnabled) return;

  updates.versionUpdates.subscribe((event) => {
    if (event.type === 'VERSION_READY') void updates.activateUpdate();
  });
  // No unsubscribe! Subscription leaked.
}
```

---

## Impact

**Memory Leak**: On long user sessions with multiple application reloads or version updates:

- Each subscription holds references to event objects
- Subscriptions never complete or unsubscribe
- Garbage collection cannot reclaim memory
- Memory usage grows over time

**Measurable Impact**:

- Long-session users (4+ hours) may see ~100KB+ leaked per version update
- Users who keep browser tab open for days accumulate significant memory waste
- On mobile devices with limited RAM, causes performance degradation or crashes

---

## Root Cause

The subscription to `updates.versionUpdates` is created at app startup but there's no cleanup mechanism. Unlike components that have `OnDestroy` lifecycle, the app initializer function runs once and has no way to unsubscribe later.

---

## Solution

Use `takeUntilDestroyed()` to automatically unsubscribe when the component/service is destroyed:

```typescript
import { inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

function activateUpdatesOnNextLoad(): void {
  const updates = inject(SwUpdate);
  const destroyRef = inject(DestroyRef);
  if (!updates.isEnabled) return;

  updates.versionUpdates.pipe(takeUntilDestroyed(destroyRef)).subscribe((event) => {
    if (event.type === 'VERSION_READY') void updates.activateUpdate();
  });
}
```

### Alternative: Explicit Unsubscribe

If you prefer explicit cleanup:

```typescript
function activateUpdatesOnNextLoad(): void {
  const updates = inject(SwUpdate);
  if (!updates.isEnabled) return;

  const subscription = updates.versionUpdates.subscribe((event) => {
    if (event.type === 'VERSION_READY') {
      void updates.activateUpdate();
      // Unsubscribe after first VERSION_READY event
      subscription.unsubscribe();
    }
  });
}
```

---

## Testing

After fix, verify:

1. **Build succeeds**: `npm run build`
2. **No TypeScript errors**: `npx tsc --noEmit`
3. **Service worker still detects updates** in DevTools
4. **No memory leak**:
   - Open DevTools Memory tab
   - Create heap snapshot
   - Simulate version update (DevTools > Application > Service Workers > update)
   - Create another heap snapshot
   - Compare: memory should not grow significantly

---

## Performance Impact

**Memory Savings**: ~100-500 bytes per subscription (depending on event queue)  
**CPU Savings**: Minimal, but removes unnecessary event processing

---

## Related

- Angular OnDestroy lifecycle
- RxJS subscription management
- takeUntilDestroyed pattern
- DestroyRef injection
