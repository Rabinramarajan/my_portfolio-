/**
 * Domain models for every piece of portfolio content.
 * These are deliberately API-shaped so the local content provider can later be
 * swapped for an HTTP/CMS-backed one without touching a single component.
 */

export type MediaKind = 'image' | 'video' | 'animation';

export interface PortfolioMedia {
  readonly kind: MediaKind;
  /** Primary source. For images this is the fallback (jpg/png/webp). */
  readonly src: string;
  /** Optional modern formats, most-preferred first (avif, then webp). */
  readonly sources?: readonly { readonly type: string; readonly srcset: string }[];
  /** Poster frame for video/animation. Required for video to avoid CLS. */
  readonly poster?: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly caption?: string;
  /**
   * How the image sits in its frame. `cover` (default) fills and crops, which
   * is right for landscape screenshots and photography. `contain` letterboxes
   * instead — the only correct choice for tall phone screenshots, which `cover`
   * reduces to an unreadable sliver.
   */
  readonly fit?: 'cover' | 'contain';
  /**
   * Aspect ratio of the *frame*, e.g. `'4 / 3'`. Defaults to the image's own
   * dimensions. Set it with `fit: 'contain'` to give a row of differently
   * proportioned screenshots one consistent shape.
   */
  readonly displayAspect?: string;
}

export interface PortfolioVideo {
  readonly mp4: string;
  readonly webm?: string;
  readonly poster: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  /**
   * Shown beneath the video. Use it to state what the footage actually is
   * whenever that is not self-evident — an illustrative motion piece must never
   * be mistaken for a recording of the delivered system.
   */
  readonly caption?: string;
  /** Purely decorative footage: hidden from assistive tech, no controls. */
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
  /** Measurable outcomes. Leave empty rather than inventing numbers. */
  readonly impact: readonly { readonly label: string; readonly value: string }[];
  readonly technologies: readonly string[];
  readonly thumbnail: PortfolioMedia;
  readonly hero: PortfolioMedia;
  readonly preview?: PortfolioVideo;
  readonly gallery: readonly PortfolioMedia[];
  readonly caseStudy: readonly CaseStudySection[];
  readonly liveUrl?: string;
  readonly repoUrl?: string;
  /** Accent used for hover treatments on the card. Falls back to brand accent. */
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

/** Photography and footage used to dress the page sections, keyed by placement. */
export interface SiteMedia {
  readonly aboutPortrait: PortfolioMedia;
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

export interface PortfolioEducation {
  readonly institution: string;
  readonly qualification: string;
  readonly start: string;
  readonly end: string;
  readonly location: string;
}

export interface PortfolioCertification {
  readonly name: string;
  readonly issuer: string;
  readonly date: string;
  readonly credentialUrl?: string;
}

export interface PortfolioProfile {
  readonly name: string;
  readonly shortName: string;
  readonly role: string;
  readonly positioning: string;
  readonly headline: readonly string[];
  readonly valueProposition: string;
  readonly bio: readonly string[];
  readonly philosophy: string;
  readonly location: string;
  readonly timezone: string;
  readonly email: string;
  readonly phone?: string;
  readonly availability: AvailabilityState;
  readonly availabilityNote: string;
  readonly industries: readonly string[];
  readonly stats: readonly PortfolioStat[];
  readonly resumeUrl: string;
  readonly resumeUpdated: string;
  readonly education: readonly PortfolioEducation[];
  readonly certifications: readonly PortfolioCertification[];
  readonly socials: readonly PortfolioSocial[];
}
