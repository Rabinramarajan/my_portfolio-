import type { AccentColor } from '../types/common.types';

/** Client testimonial entry. */
export interface Testimonial {
  readonly id: string;
  readonly text: string;
  readonly author: string;
  readonly role: string;
  readonly company: string;
  readonly image?: string;
  readonly accent?: AccentColor;
}

/** testimonials.json payload. */
export interface TestimonialsConfig {
  readonly items: readonly Testimonial[];
}
