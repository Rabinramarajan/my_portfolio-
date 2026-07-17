# Bug #6: Focus Timing Race Condition

**Severity**: 🟠 HIGH - Zoneless Change Detection  
**File**: `src/app/shared/components/ui/filter-tabs/filter-tabs.ts`  
**Lines**: 85-93  
**Status**: PLAUSIBLE

---

## Problem

DOM focus operation executes synchronously immediately after signal update, before zoneless change detection completes DOM binding updates.

```typescript
// Lines 85-93: Focus executes before DOM updates
protected moveTo(index: number, event: Event): void {
  const options = this.options();
  const option = options[index];
  if (option === undefined) return;
  event.preventDefault();
  this.selected.set(option);  // ← Signal update

  const tabs = (event.currentTarget as HTMLElement).closest('[role="tablist"]');
  tabs?.querySelectorAll<HTMLElement>('[role="tab"]')[index]?.focus(); // ← Immediate focus
}
```

---

## Impact

**Keyboard Navigation Issues**:

- User presses Home key to jump to first chip
- `moveTo(0)` sets signal and immediately focuses element
- But template binding `[attr.tabindex]="option === selected() ? 0 : -1"` hasn't updated yet
- Focus lands on stale element or element with wrong tabindex
- Subsequent keyboard navigation is broken

**Affects**:

- Rapid keyboard navigation (holding arrow keys)
- Home/End key navigation
- Screen reader users navigating via keyboard

---

## Root Cause

With zoneless change detection, signal updates don't automatically trigger Angular's change detection cycle. The DOM bindings update asynchronously, but the focus operation happens synchronously.

Timeline:

1. User presses Home → `moveTo(0)`
2. `selected.set(option)` queues change detection
3. `querySelectorAll(...).focus()` executes immediately
4. DOM bindings haven't updated yet → focus on wrong element
5. Change detection runs → updates tabindex on all chips

---

## Solution

Defer focus operation until after change detection completes using `afterNextRender()`:

```typescript
import { afterNextRender } from '@angular/core';

protected moveTo(index: number, event: Event): void {
  const options = this.options();
  const option = options[index];
  if (option === undefined) return;
  event.preventDefault();
  this.selected.set(option);

  // Defer focus until after change detection completes
  afterNextRender(() => {
    const tabs = (event.currentTarget as HTMLElement).closest('[role="tablist"]');
    tabs?.querySelectorAll<HTMLElement>('[role="tab"]')[index]?.focus();
  }, { phase: 'write' });
}
```

### Alternative: Use setTimeout

If `afterNextRender` doesn't work, use `setTimeout` to defer:

```typescript
protected moveTo(index: number, event: Event): void {
  const options = this.options();
  const option = options[index];
  if (option === undefined) return;
  event.preventDefault();
  this.selected.set(option);

  // Defer focus to next microtask
  setTimeout(() => {
    const tabs = (event.currentTarget as HTMLElement).closest('[role="tablist"]');
    tabs?.querySelectorAll<HTMLElement>('[role="tab"]')[index]?.focus();
  }, 0);
}
```

### Alternative: Use ViewChildren to Cache Elements

Cache tab elements to avoid querying DOM:

```typescript
import { ViewChildren } from '@angular/core';

export class FilterTabs {
  @ViewChildren('[role="tab"]') tabs!: QueryList<ElementRef<HTMLElement>>;

  protected moveTo(index: number, event: Event): void {
    const options = this.options();
    const option = options[index];
    if (option === undefined) return;
    event.preventDefault();
    this.selected.set(option);

    // Focus the cached element
    afterNextRender(() => {
      this.tabs.get(index)?.nativeElement.focus();
    });
  }
}
```

---

## Testing

Test rapid keyboard navigation:

```typescript
it('should focus correct tab when pressing Home key', fakeAsync(() => {
  component.selected.set('Finished');

  const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
  component.moveTo(0, homeEvent);

  tick(); // Allow change detection

  const firstTab = fixture.debugElement.query(By.css('[role="tab"]:first-child'));
  expect(document.activeElement).toBe(firstTab.nativeElement);
}));

it('should handle rapid arrow key navigation', fakeAsync(() => {
  const options = ['All', 'Finished', 'Upcoming'];
  component.options.set(options);
  component.selected.set('All');

  // Simulate rapid arrow key presses
  for (let i = 0; i < 3; i++) {
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.move(1, event);
    tick();
  }

  expect(component.selected()).toBe('All'); // Should cycle back
}));
```

---

## Related

- Angular Zoneless Change Detection
- afterNextRender lifecycle
- ViewChildren and ElementRef
- Keyboard event handling
- Timing issues with signals
