# Bug #5: Missing preventDefault() on Space/Enter Keys

**Severity**: 🟠 HIGH - Keyboard Navigation  
**File**: `src/app/shared/components/ui/filter-tabs/filter-tabs.ts`  
**Lines**: 24-25  
**Status**: CONFIRMED

---

## Problem

Keyboard event handlers for Space and Enter keys do not prevent default browser behavior, causing unintended page scrolling and actions.

```typescript
// Lines 24-25: Missing preventDefault()
keydown.enter = 'selected.set(option)'(keydown.space) = 'selected.set(option)';
```

---

## Impact

**User Experience**:

- User presses Space to select a chip
- Selection works, but page also scrolls down (Space's default action)
- User presses Enter to select a chip
- Selection works, but may trigger unwanted form submission

**Keyboard Users Affected**:

- Users with motor disabilities using keyboard navigation
- Power users using keyboard-only workflows
- Screen reader users navigating via keyboard

---

## Root Cause

When event handlers don't call `preventDefault()`, the browser executes the default action for that key:

- **Space**: Scroll down by one page height
- **Enter**: Submit form or activate button (context-dependent)

---

## Solution

Call `preventDefault()` in the event handler:

```typescript
// BEFORE
template: `
  ...
  (keydown.enter)="selected.set(option)"
  (keydown.space)="selected.set(option)"
  ...
`,

// AFTER: Create event handler methods that call preventDefault()
template: `
  ...
  (keydown.enter)="onEnter($event)"
  (keydown.space)="onSpace($event)"
  ...
`,

// Add handler methods
protected onEnter(event: KeyboardEvent): void {
  event.preventDefault();
  this.selected.set(this.selected());
}

protected onSpace(event: KeyboardEvent): void {
  event.preventDefault();
  this.selected.set(this.selected());
}
```

### Better Solution: Update Existing Handlers

Since `move()` and `moveTo()` already handle arrow/home/end keys correctly with `preventDefault()`, update the Space/Enter handlers similarly:

```typescript
template: `
  ...
  (keydown.enter)="handleEnter($event)"
  (keydown.space)="handleSpace($event)"
  ...
`,

protected handleEnter(event: KeyboardEvent): void {
  event.preventDefault();
  const options = this.options();
  const current = options.indexOf(this.selected());
  if (current >= 0) {
    this.selected.set(options[current]);
  }
}

protected handleSpace(event: KeyboardEvent): void {
  event.preventDefault();
  const options = this.options();
  const current = options.indexOf(this.selected());
  if (current >= 0) {
    this.selected.set(options[current]);
  }
}
```

### Simplest Solution: Use Arrow Method

Actually, since the chip is already selected via click/model binding, the Space/Enter handlers just need to prevent default:

```typescript
template: `
  ...
  (keydown.enter)="$event.preventDefault()"
  (keydown.space)="$event.preventDefault()"
  ...
`,
```

But this won't select the chip. Better approach:

```typescript
template: `
  ...
  (keydown.enter)="onKeySelect($event)"
  (keydown.space)="onKeySelect($event)"
  ...
`,

protected onKeySelect(event: KeyboardEvent): void {
  event.preventDefault();
  this.selected.set((event.target as HTMLElement).textContent?.trim() || this.selected());
}
```

---

## Testing

Test keyboard behavior:

1. **Tab to a chip** and press Space/Enter
2. Verify chip is selected (aria-selected updates)
3. Verify page does **NOT** scroll
4. Tab to next chip and repeat

Automated test:

```typescript
it('should prevent default Space key behavior', () => {
  const event = new KeyboardEvent('keydown', { key: ' ' });
  spyOn(event, 'preventDefault');

  component.onSpace(event);

  expect(event.preventDefault).toHaveBeenCalled();
});
```

---

## Related

- MDN: Keyboard events
- WAI-ARIA authoring practices
- Event bubbling and preventing defaults
- Accessible form controls
