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
  /** Displayed card number, e.g. "01". */
  readonly number?: string;
  readonly title: string;
  readonly shortTitle?: string;
  readonly tagline: string;
  readonly category: ProjectCategory;
  readonly role: string;
  readonly year: number;
  readonly client: string;
  readonly summary: string;
  readonly featured: boolean;
  /** Publishing lifecycle — only `published` projects appear publicly. */
  readonly status: ContentStatus;
  /** Sort order — changing it reorders the Work section. */
  readonly order: number;
  readonly publishedAt?: string;
  readonly updatedAt?: string;
  readonly version?: number;
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
  readonly id: string;
  /** Displayed row number, e.g. "01". */
  readonly index: string;
  /** Numeric order used for sorting. */
  readonly order: number;
  readonly title: string;
  /** Short line for cards and previews. */
  readonly shortDescription: string;
  readonly description: string;
  readonly technologies: readonly string[];
  readonly deliverables: readonly string[];
  readonly icon?: string;
  readonly image?: PortfolioMedia;
  readonly featured?: boolean;
  /** `false` removes the service from the UI without a code change. */
  readonly active: boolean;
  readonly updatedAt?: string;
  readonly version?: number;
}

export interface PortfolioExperience {
  readonly id: string;
  readonly company: string;
  readonly role: string;
  readonly employmentType?: string;
  readonly start: string;
  /** For the current role keep `end` as `'Present'`; the UI renders it from `current`. */
  readonly end: string | 'Present';
  readonly current: boolean;
  readonly location: string;
  readonly summary: string;
  readonly achievements: readonly string[];
  readonly technologies: readonly string[];
  readonly order: number;
  /** `false` hides the role without a code change. */
  readonly visible: boolean;
}

export type SkillGroup =
  'Frontend' | 'Backend' | 'Database' | 'Mobile' | 'Design' | 'Testing' | 'DevOps' | 'Tools';

export interface PortfolioSkill {
  readonly id: string;
  readonly name: string;
  readonly icon?: string;
  readonly featured?: boolean;
  readonly order?: number;
  readonly visible?: boolean;
}

export interface PortfolioSkillCluster {
  readonly group: SkillGroup;
  readonly blurb: string;
  readonly items: readonly PortfolioSkill[];
}

/** Hierarchy tier for visual emphasis in the constellation. */
export type TechTier = 'primary' | 'secondary' | 'supporting';

/** Category label used by the ecosystem filter — a curated subset of SkillGroup. */
export type EcosystemCategory = 'Frontend' | 'Mobile' | 'Backend' | 'Data' | 'Design' | 'Testing' | 'Tools';

/** Metadata for an ecosystem category. */
export interface CategoryDescription {
  readonly category: EcosystemCategory;
  readonly description: string;
}

/** A technology node in the engineering constellation. */
export interface EcosystemNode {
  readonly id: string;
  readonly name: string;
  readonly monogram: string;
  readonly tier: TechTier;
  readonly category: EcosystemCategory;
  /** Angle in degrees from 12-o'clock, clockwise. */
  readonly angle: number;
  /** Normalised distance from center (0 = center, 1 = edge). */
  readonly radius: number;
  /** IDs of directly connected technologies. */
  readonly connections: readonly string[];
  /** Short metadata shown on hover — e.g. "Used in 8+ projects". */
  readonly meta?: string;
  /** Sub-features or aspects shown when the node is selected. */
  readonly features?: readonly string[];
  /** Project slugs where this technology is used. */
  readonly projects?: readonly string[];
  /** Years of professional experience with this technology (e.g., "4+", "3-4"). */
  readonly experience?: string;
}

export interface PortfolioProcessStep {
  readonly id: string;
  /** Displayed row number, e.g. "01". */
  readonly index: string;
  /** Short stage name, e.g. "Discover". */
  readonly name: string;
  /** Full eyebrow, e.g. "01 / DISCOVER". */
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly outputsLabel: string;
  readonly outputs: readonly string[];
  /** Longer supporting copy (optional, not always rendered). */
  readonly details?: string;
  readonly technologies?: readonly string[];
  /** Key that maps to a visual asset (see ProcessVisual). */
  readonly visual?: string;
  readonly order: number;
  /** `false` removes the step without a code change. */
  readonly active: boolean;
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
  readonly ambientDeveloper: PortfolioVideo;
  readonly processAnimation: PortfolioVideo;
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
  /** Compact role line used in the header and hero metadata, e.g. "Frontend Angular Consultant". */
  readonly consultLabel: string;
  /** Short editorial location line, e.g. "Chennai, India". */
  readonly basedIn: string;
  readonly headline: readonly string[];
  readonly valueProposition: string;
  readonly bio: readonly string[];
  readonly philosophy: string;
  readonly location: string;
  readonly timezone: string;
  readonly email: string;
  readonly phone?: string;
  /** Displayed coordinates for the decorative engineering readouts. */
  readonly coordinates?: { readonly lat: string; readonly lon: string; readonly short: string };
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

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CONTENT MODULES
 * ─────────────────────────────────────────────────────────────────────────────
 * The typed shape of every content module served by the content API and read by
 * `PortfolioContentService`. The static config (`portfolio.content.ts`) seeds
 * these; a future CMS/API supplies the same shape at runtime.
 */

export type ContentStatus = 'draft' | 'published' | 'archived';

/** Machine-readable availability that also drives the public copy. */
export type AvailabilityLevel = 'AVAILABLE' | 'LIMITED' | 'BUSY' | 'NOT_AVAILABLE';

/** A single CTA link rendered by data-driven sections. */
export interface ContentCta {
  readonly label: string;
  readonly href: string;
}

export interface HeroContent {
  readonly eyebrow: string;
  readonly headline: readonly string[];
  readonly description: string;
  readonly primaryCta: ContentCta;
  readonly secondaryCta: ContentCta;
  /** Copy per availability state — the label the hero pulse shows. */
  readonly availabilityLabels: Readonly<Record<AvailabilityState, string>>;
  readonly availabilityResponse: string;
  readonly role: string;
  readonly location: string;
  readonly focus: string;
  /** Which rows of `profile.stats` the hero metric strip shows. */
  readonly metricsLabels: readonly string[];
  /** Technology ticker under the hero. */
  readonly technologies: readonly string[];
  readonly scrollLabel: string;
  readonly bridge: { readonly index: string; readonly quote: string };
}

export interface AboutPrinciple {
  readonly id: string;
  readonly title: string;
  readonly statement: string;
}

export interface CareerMilestone {
  readonly year: string;
  readonly role: string;
  readonly detail: string;
}

export interface AboutStoryKeyword {
  readonly id: string;
  readonly word: string;
}

export interface AboutStoryParagraph {
  /**
   * Plain paragraph text. Keywords appear inline wrapped in `{id}` placeholders
   * that the component turns into interactive highlighted spans.
   */
  readonly text: string;
  readonly keywords?: readonly AboutStoryKeyword[];
}

export interface AboutPortraitStamp {
  readonly name: string;
  readonly role: string;
  readonly location: string;
  readonly status: string;
}

export interface AboutContent {
  readonly sectionIndex: string;
  readonly sectionLabel: string;
  readonly manifestoHeading: string;
  readonly storyEyebrow: string;
  readonly story: readonly AboutStoryParagraph[];
  readonly portrait: AboutPortraitStamp;
  readonly principlesEyebrow: string;
  readonly philosophyStatement: string;
  readonly principles: readonly AboutPrinciple[];
  readonly milestonesEyebrow: string;
  readonly careerMilestones: readonly CareerMilestone[];
  readonly stackEyebrow: string;
  readonly engineeringStack: readonly string[];
  readonly closingStatement: string;
}

export interface AvailabilityContent {
  readonly status: AvailabilityLevel;
  readonly message: string;
  readonly responseTime: string;
  readonly updatedAt?: string;
}

export interface ContactContent {
  readonly title: string;
  readonly description: string;
  /** Short availability blurb in the contact hero status line. */
  readonly heroNote: string;
  readonly email: string;
  readonly availability: string;
  readonly responseTime: string;
}

export interface PricingPlan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly currency: 'INR';
  /** Numeric price used for programmatic display. */
  readonly price: number;
  /** Pre-formatted INR label exactly as it should read, e.g. "₹35,000+". */
  readonly priceLabel: string;
  readonly priceType: 'starting_from' | 'fixed' | 'custom';
  readonly billingType: 'project' | 'monthly';
  readonly features: readonly string[];
  readonly recommended?: boolean;
  readonly order: number;
  /** `false` removes the plan without a code change. */
  readonly active: boolean;
  readonly updatedAt?: string;
  readonly version?: number;
}

export interface SeoContent {
  readonly siteName: string;
  readonly defaultTitle: string;
  readonly defaultDescription: string;
  readonly ogImage: string;
  readonly homeTitle: string;
  readonly homeDescription: string;
  readonly workTitle: string;
  readonly workDescription: string;
  readonly resumeTitle: string;
  readonly resumeDescription: string;
  readonly contactTitle: string;
  readonly contactDescription: string;
  readonly notFoundTitle: string;
  readonly notFoundDescription: string;
}

export interface SiteSettings {
  readonly siteName: string;
  readonly ownerName: string;
  readonly defaultTitle: string;
  readonly defaultDescription: string;
  readonly email: string;
  readonly location: string;
  readonly timezone: string;
  readonly defaultOgImage: string;
  readonly socialLinks: readonly PortfolioSocial[];
  readonly availability: AvailabilityContent;
  readonly maintenanceMode: boolean;
  readonly seo: SeoContent;
  readonly lastUpdated?: string;
  readonly version?: number;
}

/** Copy block for a section header (index + eyebrow + heading + lede). */
export interface SectionCopy {
  readonly index?: string;
  readonly eyebrow: string;
  readonly heading: string;
  readonly lede?: string;
}

/** One source of truth for every section's header copy and CTAs. */
export interface SectionsContent {
  readonly about: SectionCopy;
  readonly services: SectionCopy;
  readonly work: SectionCopy;
  readonly workPage: SectionCopy;
  readonly experience: SectionCopy;
  readonly skills: SectionCopy;
  readonly process: SectionCopy;
  readonly testimonials: SectionCopy;
  readonly resume: SectionCopy;
}

/** Small reusable UI copy (empty states, CTAs) kept out of templates. */
export interface UiCopy {
  readonly workEmpty: string;
  readonly workPageEmpty: string;
  readonly servicesCta: { readonly text: string; readonly label: string };
  readonly workCta: { readonly label: string };
  readonly processEnding: { readonly text: string; readonly cta: string };
  readonly resume: {
    readonly downloadLabel: string;
    readonly printLabel: string;
    readonly updatedLabel: string;
    readonly profileLabel: string;
    readonly experienceLabel: string;
    readonly educationLabel: string;
    readonly certificationsLabel: string;
    readonly skillsLabel: string;
    readonly presentLabel: string;
  };
  readonly footer: {
    readonly ctaHeading: string;
    readonly ctaLines: readonly string[];
    readonly ctaLede: string;
    readonly ctaAction: string;
    readonly navigateLabel: string;
    readonly elsewhereLabel: string;
    readonly availabilityLabel: string;
    readonly rights: string;
    readonly builtWith: string;
  };
}

/** Standard envelope returned by the content API. */
export interface ContentEnvelope<T> {
  readonly success: boolean;
  readonly data: T;
  readonly meta?: { readonly timestamp?: string; readonly version?: string };
}
