import type { IconName } from '../types/common.types';

/** Availability badge shown across sidebar / hero / resume. */
export interface Availability {
  readonly available: boolean;
  readonly label: string;
  readonly caption?: string;
}

/** Core identity used by nav header, hero, about, resume, footer. */
export interface Profile {
  readonly name: string;
  readonly shortName: string;
  readonly role: string;
  readonly greeting?: string;
  readonly tagline: string;
  readonly bio: string;
  readonly signature?: string;
  readonly location: string;
  readonly email: string;
  readonly phone: string;
  readonly website: string;
  readonly avatar: string;
  readonly heroImage?: string;
  readonly logo?: string;
  readonly resumeUrl: string;
  readonly availability: Availability;
  readonly roleHighlights?: readonly string[];
  readonly whatIDo?: readonly ProfileCapability[];
}

/** "What I Do" capability entry (About / hero). */
export interface ProfileCapability {
  readonly icon: IconName;
  readonly label: string;
  readonly description?: string;
}
