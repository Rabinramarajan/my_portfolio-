import { describe, expect, it, beforeEach, vi } from 'vitest';

// Define the global matchMedia mock immediately (before any imports that might trigger it)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DataService, EmailService } from '../../core';
import { signal } from '@angular/core';

describe('ContactPage', () => {
  let ContactPage: any;
  let mockDataService: any;
  let mockEmailService: any;
  let isEmailConfigured = true;

  beforeEach(async () => {
    isEmailConfigured = true;

    // Dynamically import ContactPage to bypass ES module hoisting and ensure matchMedia mock is registered first
    const contactModule = await import('./contact');
    ContactPage = contactModule.ContactPage;

    mockDataService = {
      profile: vi.fn().mockReturnValue({
        value: signal({
          name: 'Rabin',
          socials: [],
        }),
        isLoading: signal(false),
        error: signal(null),
      }),
      load: vi.fn().mockImplementation((key: string) => {
        if (key === 'contact') {
          return {
            value: signal({
              title: 'Contact Me',
              description: 'Get in touch',
              channels: [],
            }),
            isLoading: signal(false),
            error: signal(null),
          };
        }
        // Fallback for other keys like 'footer'
        return {
          value: signal({}),
          isLoading: signal(false),
          error: signal(null),
        };
      }),
    };

    mockEmailService = {
      get isConfigured() {
        return isEmailConfigured;
      },
      send: vi.fn().mockResolvedValue({ status: 200, text: 'OK' }),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: DataService, useValue: mockDataService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    });
  });

  it('should initialize empty contact form', () => {
    const fixture = TestBed.createComponent(ContactPage);
    const component: any = fixture.componentInstance;

    expect(component['model']()).toEqual({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  });

  it('should invalidate empty form fields', () => {
    const fixture = TestBed.createComponent(ContactPage);
    const component: any = fixture.componentInstance;

    fixture.detectChanges();
    expect(component['contactForm']().invalid()).toBe(true);
  });

  it('should submit successfully when form is valid and email service is configured', async () => {
    const fixture = TestBed.createComponent(ContactPage);
    const component: any = fixture.componentInstance;
    fixture.detectChanges();

    component['model'].set({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'This is a long enough message with more than 10 characters.',
    });

    fixture.detectChanges();

    await component['onSubmit']();

    expect(mockEmailService.send).toHaveBeenCalled();
    expect(component['sent']()).toBe(true);
    expect(component['error']()).toBeNull();
  });

  it('should show error when email service is not configured', async () => {
    isEmailConfigured = false;
    const fixture = TestBed.createComponent(ContactPage);
    const component: any = fixture.componentInstance;
    fixture.detectChanges();

    component['model'].set({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'This is a long enough message with more than 10 characters.',
    });

    fixture.detectChanges();

    await component['onSubmit']();

    expect(mockEmailService.send).not.toHaveBeenCalled();
    expect(component['sent']()).toBe(false);
    expect(component['error']()).toContain('not configured');
  });
});
