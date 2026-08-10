import { Component, DestroyRef, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { asyncTeardown } from './async-teardown';

@Component({ selector: 'app-host', template: '' })
class Host {
  readonly teardown = asyncTeardown();
  readonly destroyRef = inject(DestroyRef);
}

describe('asyncTeardown', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [Host] }));

  it('runs registered teardown when the view is destroyed', () => {
    const fixture = TestBed.createComponent(Host);
    const cleanup = vi.fn();

    fixture.componentInstance.teardown.register(cleanup);
    expect(cleanup).not.toHaveBeenCalled();

    fixture.destroy();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('reports destruction so async work can bail out', () => {
    const fixture = TestBed.createComponent(Host);
    expect(fixture.componentInstance.teardown.destroyed).toBe(false);

    fixture.destroy();
    expect(fixture.componentInstance.teardown.destroyed).toBe(true);
  });

  /**
   * The bug this exists to prevent: a directive awaits a lazily-imported
   * library, the user navigates away, and the late `onDestroy` registration
   * throws `NG0911: View has already been destroyed`.
   */
  it('does not throw when teardown is registered after destruction', () => {
    const fixture = TestBed.createComponent(Host);
    const { teardown } = fixture.componentInstance;
    fixture.destroy();

    const cleanup = vi.fn();
    expect(() => teardown.register(cleanup)).not.toThrow();
    // and the resource is still released rather than leaked
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('still throws on raw DestroyRef.onDestroy after destruction', () => {
    // Pins the underlying Angular behaviour this utility exists to work around.
    const fixture = TestBed.createComponent(Host);
    const { destroyRef } = fixture.componentInstance;
    fixture.destroy();

    expect(() => destroyRef.onDestroy(() => undefined)).toThrow(/NG0911|destroyed/i);
  });
});
