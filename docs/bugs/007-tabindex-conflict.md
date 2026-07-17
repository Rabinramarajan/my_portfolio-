# Bug #7: Tabindex Conflict - Static vs Dynamic Binding

**Severity**: 🟠 HIGH - Keyboard Navigation  
**File**: `src/app/shared/components/ui/chip/chip.ts`  
**Line**: 10  
**Status**: PLAUSIBLE

---

## Problem

Static host tabindex binding conflicts with parent component's dynamic tabindex binding, preventing proper keyboard focus management.

```typescript
// chip.ts line 10: Static host binding
@Component({
  selector: 'app-chip',
  host: {
    role: 'button',
    tabindex: '0',  // ← Static binding
    // ...
  }
})

// filter-tabs.ts line 22: Dynamic binding tries to override
<app-chip
  [attr.tabindex]="option === selected() ? 0 : -1"  // ← Ignored!
/>
```

---

## Impact

**Keyboard Navigation Broken**:

- Parent wants: `tabindex="0"` for selected chip, `tabindex="-1"` for unselected
- Chip ignores parent's binding due to static host property
- All chips remain focusable with `tabindex="0"`
- Tab key visits every chip instead of only the selected one
- Violates WAI-ARIA authoring practices for tab components

**Users Affected**:

- Keyboard-only users must tab through all chips to navigate
- Screen reader users get confusing focus order
- Accessibility testing fails

---

## Root Cause

In Angular, when both static and dynamic bindings exist for the same attribute:

- Static `host: { tabindex: '0' }` takes precedence
- Dynamic `[attr.tabindex]` is ignored or merged incorrectly
- Result: static value wins, dynamic binding has no effect

---

## Solution

### Option 1: Remove Static Binding (Recommended)

Let parent control tabindex via binding:

```typescript
// chip.ts: Remove static tabindex
@Component({
  selector: 'app-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'button',
    // ❌ Remove: tabindex: '0',
    class: 'chip',
    '[class.chip--selected]': 'selected()',
    '[attr.aria-pressed]': 'selected()',
    '[attr.tabindex]': '-1',  // ← Default to -1 (not focusable)
  },
})
export class Chip {
  readonly selected = input(false);
}

// filter-tabs.ts: Parent controls tabindex
<app-chip
  [attr.tabindex]="option === selected() ? 0 : -1"
/>
```

### Option 2: Use Reactive Property Binding

Make tabindex reactive based on selected input:

```typescript
// chip.ts
import { computed } from '@angular/core';

export class Chip {
  readonly selected = input(false);
  readonly tabindex = computed(() => this.selected() ? 0 : -1);
}

// template
host: {
  role: 'button',
  '[attr.tabindex]': 'tabindex()',
  '[class.chip--selected]': 'selected()',
}

// filter-tabs.ts: Just bind selected
<app-chip
  [selected]="option === selected()"
/>
```

### Option 3: Use Attribute Input

Make tabindex an input property:

```typescript
// chip.ts
export class Chip {
  readonly selected = input(false);
  readonly tabindex = input<0 | -1>(-1);
}

// filter-tabs.ts
<app-chip
  [selected]="option === selected()"
  [tabindex]="option === selected() ? 0 : -1"
/>
```

---

## WAI-ARIA Tab Pattern

According to WAI-ARIA authoring practices, tab components should implement:

1. **One tab in tab order at a time** (tabindex="0")
2. **All other tabs removed from tab order** (tabindex="-1")
3. **Arrow keys move focus between tabs**
4. **Home/End keys move to first/last tab**

```html
<!-- Correct pattern -->
<div role="tablist">
  <button role="tab" tabindex="0" aria-selected="true">Active Tab</button>
  <button role="tab" tabindex="-1" aria-selected="false">Other Tab</button>
  <button role="tab" tabindex="-1" aria-selected="false">Other Tab</button>
</div>
```

---

## Testing

Test keyboard focus behavior:

```typescript
it('should only put selected chip in tab order', () => {
  component.options.set(['Finished', 'Upcoming', 'Abandoned']);
  component.selected.set('Finished');

  fixture.detectChanges();

  const chips = fixture.debugElement.queryAll(By.css('app-chip'));

  // First chip (selected) should be focusable
  expect(chips[0].nativeElement.getAttribute('tabindex')).toBe('0');

  // Other chips should not be focusable
  expect(chips[1].nativeElement.getAttribute('tabindex')).toBe('-1');
  expect(chips[2].nativeElement.getAttribute('tabindex')).toBe('-1');
});

it('should update tabindex when selection changes', fakeAsync(() => {
  component.options.set(['Finished', 'Upcoming']);
  component.selected.set('Finished');
  fixture.detectChanges();
  tick();

  let chips = fixture.debugElement.queryAll(By.css('app-chip'));
  expect(chips[0].nativeElement.getAttribute('tabindex')).toBe('0');
  expect(chips[1].nativeElement.getAttribute('tabindex')).toBe('-1');

  // Change selection
  component.selected.set('Upcoming');
  fixture.detectChanges();
  tick();

  chips = fixture.debugElement.queryAll(By.css('app-chip'));
  expect(chips[0].nativeElement.getAttribute('tabindex')).toBe('-1');
  expect(chips[1].nativeElement.getAttribute('tabindex')).toBe('0');
}));
```

---

## Related

- WAI-ARIA Tab Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- Angular host bindings
- Keyboard navigation patterns
- Accessible components
