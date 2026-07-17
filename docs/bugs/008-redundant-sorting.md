# Bug #8: Redundant Sorting in Projects Page

**Severity**: 🟠 HIGH - Performance  
**File**: `src/app/features/projects/projects.ts`  
**Line**: 47  
**Status**: CONFIRMED

---

## Problem

Both `finished` and `upcoming` computed signals independently call `applySort()`, causing the same data to be sorted twice on every filter or sort change.

```typescript
// Redundant: Both signals sort the same data independently
readonly finished = computed(() => {
  const items = this.data
    .projects()
    .filter((p) => p.status === 'Finished');
  return this.applySort(items);  // ← Sort 1
});

readonly upcoming = computed(() => {
  const items = this.data
    .projects()
    .filter((p) => p.status === 'Upcoming');
  return this.applySort(items);  // ← Sort 2
});
```

---

## Impact

**Performance**:

- With 50+ projects: **O(2n log n)** instead of O(n log n)
- Sort algorithm runs twice for the same operation
- Change detection runs twice (once per computed signal)
- Doubles memory usage during sort
- On slower devices or large datasets, noticeable lag

**Scalability**:

- Adding more filter tabs (Status, Year, Company) multiplies the problem
- 10 filter tabs = 10x sorting overhead
- Mobile devices suffer most from duplicate work

---

## Root Cause

Each computed signal independently filters and sorts. There's no shared sorting logic or memoization. When sort signal changes, both computed signals re-run their applySort() calls with the same filtered data.

---

## Solution

### Option 1: Share Sorted Result (Recommended)

Sort once, then filter:

```typescript
// Sort first, then filter
readonly sortedProjects = computed(() => {
  return this.applySort(this.data.projects());
});

readonly finished = computed(() => {
  return this.sortedProjects().filter((p) => p.status === 'Finished');
});

readonly upcoming = computed(() => {
  return this.sortedProjects().filter((p) => p.status === 'Upcoming');
});
```

### Option 2: Extract Shared Sort + Filter

```typescript
readonly projects = computed(() => this.data.projects());

private getSortedByStatus(status: 'Finished' | 'Upcoming'): Readonly<Project[]> {
  const items = this.projects().filter((p) => p.status === status);
  return this.applySort(items);
}

readonly finished = computed(() => this.getSortedByStatus('Finished'));
readonly upcoming = computed(() => this.getSortedByStatus('Upcoming'));
```

But this doesn't help—still sorts twice. Use Option 1 instead.

### Option 3: Use Map to Deduplicate

```typescript
private cachedSorted: Signal<Project[]> | null = null;
private cachedSortKey = '';

readonly sortedProjects = computed(() => {
  const key = `${this.sort()}${this.data.projects().length}`;
  if (key === this.cachedSortKey && this.cachedSorted) {
    return this.cachedSorted();
  }
  this.cachedSortKey = key;
  return this.applySort(this.data.projects());
});

readonly finished = computed(() => {
  return this.sortedProjects().filter((p) => p.status === 'Finished');
});

readonly upcoming = computed(() => {
  return this.sortedProjects().filter((p) => p.status === 'Upcoming');
});
```

---

## Before & After Performance

### Before (Redundant Sorting)

```
Sort 50 projects by name (merge sort): 50 × log₂(50) ≈ 300 comparisons
Do this for finished filter: 300 comparisons
Do this for upcoming filter: 300 comparisons
Total: 600 comparisons ✗
```

### After (Shared Sort)

```
Sort 50 projects by name: 300 comparisons
Filter for finished: 50 iterations
Filter for upcoming: 50 iterations
Total: 400 comparisons ✓
```

**Savings**: 33% reduction in computations per sort change

---

## Testing

```typescript
it('should sort projects only once', () => {
  spyOn(component as any, 'applySort').and.callThrough();

  component.sort.set('name');
  fixture.detectChanges();

  // Computed signals trigger evaluation
  component.finished();
  component.upcoming();

  // applySort should be called once (for sortedProjects), not twice
  expect((component as any).applySort).toHaveBeenCalledTimes(1);
});

it('should maintain correct filter results', () => {
  component.data.projects.set([
    { id: 1, name: 'Project A', status: 'Finished' },
    { id: 2, name: 'Project B', status: 'Upcoming' },
    { id: 3, name: 'Project C', status: 'Finished' },
  ]);

  expect(component.finished()).toEqual([
    { id: 1, name: 'Project A', status: 'Finished' },
    { id: 3, name: 'Project C', status: 'Finished' },
  ]);

  expect(component.upcoming()).toEqual([{ id: 2, name: 'Project B', status: 'Upcoming' }]);
});
```

---

## Profiling

Measure improvement in DevTools:

```
1. Open DevTools > Performance
2. Click Record
3. Change sort/filter several times
4. Stop recording
5. Compare "applySort" function call count before/after fix
```

Expected result: Function calls should drop by 50% after fix.

---

## Related

- Computed signals in Angular
- Signal memoization
- Performance optimization
- Tree shaking vs redundant computation
