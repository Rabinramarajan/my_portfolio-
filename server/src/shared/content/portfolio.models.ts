/**
 * Shared portfolio content types - used by both client and server.
 * This mirrors the client's portfolio.models.ts for API compatibility.
 */

export type MediaKind = 'image' | 'video' | 'animation';

export interface PortfolioMedia {
  readonly kind: MediaKind;
  readonly src: string;
  readonly sources?: readonly { readonly type: string; readonly srcset: string }[];
  readonly poster?: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly caption?: string;
  readonly fit?: 'cover' | 'contain';
  readonly displayAspect?: string;
}

export interface PortfolioVideo {
  readonly mp4: string;
  readonly webm?: string;
  readonly poster: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly caption?: string;
  readonly decorative?: boolean;
}

export type ProjectCategory =
  | 'Government Platform'
  | 'Citizen Portal'
  | 'Pension Platform'
  | 'Mobile Application'
  | 'Enterprise Platform'
  | 'AI Product';

export interface CaseStudySection {
  readonly index: string;
  readonly title: string;
  readonly body: readonly string[];
  readonly media?: readonly PortfolioMedia[];
}

export interface PortfolioProject {
  readonly slug: string;
  readonly title: string;
  readonly tagline: string;
  readonly category: ProjectCategory;
  readonly role: string;
  readonly year: number;
  readonly client: string;
  readonly summary: string;
  readonly featured: boolean;
  readonly problem: string;
  readonly solution: string;
  readonly impact: readonly { readonly label: string; readonly value: string }[];
  readonly technologies: readonly string[];
  readonly thumbnail: PortfolioMedia;
  readonly hero: PortfolioMedia;
  readonly preview?: PortfolioVideo;
  readonly gallery: readonly PortfolioMedia[];
  readonly caseStudy: readonly CaseStudySection[];
  readonly liveUrl?: string;
  readonly repoUrl?: string;
  readonly accent?: string;
}

export interface PortfolioService {
  readonly index: string;
  readonly title: string;
  readonly description: string;
  readonly technologies: readonly string[];
  readonly deliverables: readonly string[];
}

export interface PortfolioExperience {
  readonly company: string;
  readonly role: string;
  readonly start: string;
  readonly end: string | 'Present';
  readonly location: string;
  readonly summary: string;
  readonly achievements: readonly string[];
  readonly technologies: readonly string[];
}

export type SkillGroup =
  'Frontend' | 'Backend' | 'Database' | 'Mobile' | 'Design' | 'Testing' | 'DevOps' | 'Tools';

export interface PortfolioSkillCluster {
  readonly group: SkillGroup;
  readonly blurb: string;
  readonly items: readonly string[];
}

export interface PortfolioProcessStep {
  readonly index: string;
  readonly title: string;
  readonly description: string;
  readonly outputs: readonly string[];
}

export interface PortfolioTestimonial {
  readonly quote: string;
  readonly author: string;
  readonly role: string;
  readonly company: string;
  readonly avatar?: PortfolioMedia;
}

export interface PortfolioSocial {
  readonly label: string;
  readonly handle: string;
  readonly url: string;
}

export interface PortfolioStat {
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
}

export type AvailabilityState = 'available' | 'limited' | 'booked';

export interface SiteMedia {
  readonly aboutPortrait: PortfolioMedia;
  readonly heroPortrait: PortfolioMedia;
  readonly aboutMonitors: PortfolioMedia;
  readonly aboutCoffee: PortfolioMedia;
  readonly servicesWhiteboard: PortfolioMedia;
  readonly workFlatlay: PortfolioMedia;
  readonly experienceCollaboration: PortfolioMedia;
  readonly skillsKeyboard: PortfolioMedia;
  readonly nightDeskDivider: PortfolioMedia;
  readonly contactPortrait: PortfolioMedia;
  readonly ambientLoop: PortfolioVideo;
  readonly ambientOffice: PortfolioVideo;
  readonly ambientStory: PortfolioVideo;
}