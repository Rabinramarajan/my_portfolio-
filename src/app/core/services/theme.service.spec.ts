import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockDocument: any;
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    mockLocalStorage = {};

    // Mock localStorage and document element
    mockDocument = {
      documentElement: {
        setAttribute: vi.fn(),
        style: {
          colorScheme: '',
        },
      },
      defaultView: {
        localStorage: {
          getItem: (key: string) => mockLocalStorage[key] || null,
          setItem: (key: string, value: string) => {
            mockLocalStorage[key] = value;
          },
        },
        matchMedia: vi.fn().mockReturnValue({
          matches: false,
        }),
      },
    };

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: DOCUMENT, useValue: mockDocument }],
    });

    service = TestBed.inject(ThemeService);
  });

  it('should initialize with light or dark mode based on media preferences when storage is empty', () => {
    // Since we mocked matchMedia to return false for light-theme, it defaults to dark
    expect(service.mode()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('should toggle theme from dark to light and vice versa', () => {
    expect(service.mode()).toBe('dark');

    service.toggle();
    expect(service.mode()).toBe('light');
    expect(service.isDark()).toBe(false);

    service.toggle();
    expect(service.mode()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('should set theme mode explicitly', () => {
    service.setMode('light');
    expect(service.mode()).toBe('light');

    service.setMode('dark');
    expect(service.mode()).toBe('dark');
  });
});
