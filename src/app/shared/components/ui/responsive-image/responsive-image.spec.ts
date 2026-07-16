import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { ResponsiveImage } from './responsive-image';
import { WORKING_IMAGES } from '../../../../core/constants/working-images';

// The app runs zoneless, so host state must be signals — mutating a plain field
// would never mark this component dirty and the template would not re-render.
@Component({
  imports: [ResponsiveImage],
  template: `<app-responsive-image
    name="hero-golden-hour"
    [alt]="alt()"
    [eager]="eager()"
    [priority]="priority()"
  />`,
})
class Host {
  readonly alt = signal('A desk at golden hour');
  readonly eager = signal(false);
  readonly priority = signal(false);
}

describe('ResponsiveImage', () => {
  let fixture: ComponentFixture<Host>;

  const img = () => fixture.nativeElement.querySelector('img') as HTMLImageElement;
  const source = () => fixture.nativeElement.querySelector('source') as HTMLSourceElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('advertises only widths that were actually generated', () => {
    const srcset = source().getAttribute('srcset')!;
    const advertised = srcset
      .split(',')
      .map((s) => Number(s.trim().split(' ')[1].replace('w', '')));

    expect(advertised).toEqual([...WORKING_IMAGES['hero-golden-hour'].widths]);
    // Regression guard: sources cap at 1600, so a 1920 entry would 404.
    expect(srcset).not.toContain('1920');
  });

  it('serves webp via <source> and a jpeg fallback on <img>', () => {
    expect(source().getAttribute('type')).toBe('image/webp');
    expect(img().getAttribute('src')).toBe('assets/images/working/hero-golden-hour.jpg');
  });

  it('reserves intrinsic dimensions to avoid layout shift', () => {
    expect(img().getAttribute('width')).toBe('1600');
    expect(img().getAttribute('height')).toBe('900');
  });

  it('lazy-loads by default with no fetchpriority', () => {
    expect(img().getAttribute('loading')).toBe('lazy');
    expect(img().getAttribute('fetchpriority')).toBeNull();
  });

  it('eager loads without claiming high priority', () => {
    fixture.componentInstance.eager.set(true);
    fixture.detectChanges();

    expect(img().getAttribute('loading')).toBe('eager');
    expect(img().getAttribute('fetchpriority')).toBeNull();
  });

  it('priority implies eager and sets high fetchpriority', () => {
    fixture.componentInstance.priority.set(true);
    fixture.detectChanges();

    expect(img().getAttribute('loading')).toBe('eager');
    expect(img().getAttribute('fetchpriority')).toBe('high');
  });

  it('hides an empty-alt image from assistive tech', () => {
    fixture.componentInstance.alt.set('');
    fixture.detectChanges();

    expect(img().getAttribute('alt')).toBe('');
    expect(img().getAttribute('aria-hidden')).toBe('true');
    expect(img().getAttribute('role')).toBe('presentation');
  });

  it('keeps a meaningful image exposed to assistive tech', () => {
    expect(img().getAttribute('alt')).toBe('A desk at golden hour');
    expect(img().getAttribute('aria-hidden')).toBeNull();
  });
});
