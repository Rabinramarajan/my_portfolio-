import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContactService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should submit contact form to /api/contact', () => {
    const payload = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Hello there',
      message: 'This is a long enough message.',
    };

    service.submitContact(payload).subscribe((res) => {
      expect(res.success).toBe(true);
      expect(res.message).toContain('successfully');
    });

    const req = httpMock.expectOne('/api/contact');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, message: 'Message sent successfully!' });
  });

  it('should rate limit rapid submissions client-side', () => {
    const payload = {
      name: 'A',
      email: 'a@b.com',
      subject: 'Subject line',
      message: 'Long enough message here.',
    };

    service.submitContact(payload).subscribe();
    httpMock.expectOne('/api/contact').flush({ success: true, message: 'ok' });

    service.submitContact(payload).subscribe({
      error: (err) => expect(err.message).toContain('30 seconds'),
    });
    httpMock.expectNone('/api/contact');
  });

  it('should validate email format', () => {
    expect(service.isValidEmail('valid@example.com')).toBe(true);
    expect(service.isValidEmail('invalid')).toBe(false);
  });
});
