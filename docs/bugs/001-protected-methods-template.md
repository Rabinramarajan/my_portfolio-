# Bug #1: Protected Methods Called from Template

**Severity**: 🔴 CRITICAL - Build Failure  
**File**: `src/app/shared/components/ui/filter-tabs/filter-tabs.ts`  
**Lines**: 26-29  
**Status**: CONFIRMED

---

## Problem

Template bindings attempt to call `protected` methods, which violates TypeScript access modifiers in strict mode.

```typescript
// Line 26-29: Template tries to call protected methods
(keydown.arrowRight)="move(1, $event)"
(keydown.arrowLeft)="move(-1, $event)"
(keydown.home)="moveTo(0, $event)"
(keydown.end)="moveTo(options().length - 1, $event)"

// Line 76-82: Methods are protected
protected move(delta: number, event: Event): void {
  // ...
}

// Line 85-93: Methods are protected
protected moveTo(index: number, event: Event): void {
  // ...
}
```

---

## Impact

**Build Failure**: TypeScript compiler will fail with:

```
error TS2341: Property 'move' is protected and only accessible within class 'FilterTabs' and its subclasses.
```

This blocks deployment and breaks the build pipeline.

---

## Root Cause

In Angular, template bindings have the same access level restrictions as regular TypeScript code. Protected members can only be accessed within the class or its subclasses, not from templates.

The methods were marked `protected` for encapsulation, but templates need them to be `public`.

---

## Solution

Make the methods public. Since they're used by the template for keyboard event handling, they should be part of the public API.

```typescript
// BEFORE
protected move(delta: number, event: Event): void {
  // ...
}

protected moveTo(index: number, event: Event): void {
  // ...
}

// AFTER
move(delta: number, event: Event): void {
  // ...
}

moveTo(index: number, event: Event): void {
  // ...
}
```

### Alternative Solution

If you want to keep them protected, create public wrapper methods:

```typescript
public onArrowRight(event: Event): void {
  this.move(1, event);
}

public onArrowLeft(event: Event): void {
  this.move(-1, event);
}

public onHome(event: Event): void {
  this.moveTo(0, event);
}

public onEnd(event: Event): void {
  this.moveTo(this.options().length - 1, event);
}
```

Then update template:

```html
(keydown.arrowRight)="onArrowRight($event)" (keydown.arrowLeft)="onArrowLeft($event)"
(keydown.home)="onHome($event)" (keydown.end)="onEnd($event)"
```

---

## Testing

After fix, verify:

1. Build completes without errors: `npm run build`
2. No TypeScript errors: `npx tsc --noEmit`
3. Keyboard navigation still works in browser
4. Arrow keys move between tabs correctly
5. Home/End keys work as expected

---

## Related

- Filter tabs keyboard navigation test
- Component encapsulation best practices
