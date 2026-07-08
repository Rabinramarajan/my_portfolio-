/**
 * Portfolio Data Type Definitions
 * Provides complete type safety for portfolio content structure
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface IconPath {
  name: string;
  color: string;
  iconPath: string;
}

export interface Link {
  label: string;
  url?: string;
  href?: string;
  icon?: string;
}

export interface ButtonCTA {
  label: string;
  href: string;
}

// ============================================================================
// META / HEADER
// ============================================================================

export interface MetaData {
  name: string;
  role: string;
  profileImage: string;
  description: string;
  email: string;
  location?: string;
  github?: string;
  resumePdf?: string;
  socialLinks?: Link[];
}

export interface NavItem {
  label: string;
  href: string;
  id?: string;
  highlight?: boolean;
  external?: boolean;
}

export interface NavData {
  items?: NavItem[];
  links?: NavItem[];
}

// ============================================================================
// HERO SECTION
// ============================================================================

export interface HeroCTA {
  primary: ButtonCTA;
  booking: ButtonCTA;
}

export interface HeroStats {
  number: string;
  label: string;
}

export interface HeroData {
  badge: string;
  headline: string;
  headlineAccent: string;
  description: string;
  cta: HeroCTA;
  stack: IconPath[];
  stats: HeroStats[];
  portrait?: string;
}

// ============================================================================
// ABOUT SECTION
// ============================================================================

export interface AboutData {
  sectionLabel: string;
  title: string;
  content: string;
  image?: string;
}

// ============================================================================
// EXPERIENCE SECTION
// ============================================================================

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  description: string;
  technologies: string[];
}

export interface ExperienceData {
  sectionLabel: string;
  title: string;
  items: ExperienceItem[];
}

// ============================================================================
// SKILLS SECTION
// ============================================================================

export interface SkillItem {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  icon?: string;
}

export interface SkillCategory {
  name: string;
  icon?: string;
}

export interface SkillsData {
  sectionLabel: string;
  title: string;
  items?: SkillItem[];
  categories?: SkillCategory[];
}

// ============================================================================
// PROJECTS SECTION
// ============================================================================

export interface ProjectLinks {
  github?: string;
  live?: string;
  demo?: string;
  caseStudy?: string;
}

export interface ProjectChallenge {
  title?: string;
  description?: string;
  problem?: string;
  options?: string;
  chosen?: string;
  why?: string;
}

export interface ProjectResult {
  title?: string;
  description?: string;
  metric?: string;
  label?: string;
  icon?: string;
}

export interface ProjectGalleryImage {
  src?: string;
  image?: string;
  alt: string;
  caption?: string;
}

export interface ProjectCaseStudy {
  title?: string;
  content?: string;
  overview?: string;
  context?: string;
  problem?: string;
  approach?: string;
  solution?: string;
  role?: string;
  timeline?: string;
  sections?: Array<{ title: string; content: string }>;
  challenges?: ProjectChallenge[];
  results?: ProjectResult[];
  gallery?: ProjectGalleryImage[];
}

export interface ProjectItem {
  title: string;
  name?: string;
  slug: string;
  description: string;
  status?: string;
  statusColor?: string;
  outcome?: string;
  thumbnail: string;
  image?: string;
  alt?: string;
  technologies: string[];
  tags?: string[];
  highlights?: string;
  links: ProjectLinks;
  caseStudy: ProjectCaseStudy;
  caseStudyUrl?: string;
  featured?: boolean;
}

export interface ProjectsData {
  sectionLabel: string;
  title: string;
  items?: ProjectItem[];
  featured?: ProjectItem;
  grid?: ProjectItem[];
}

// ============================================================================
// BLOG SECTION
// ============================================================================

export interface ContentBlock {
  type: 'p' | 'h2' | 'ul' | 'code';
  text?: string;
  items?: string[];
  lang?: string;
  code?: string;
}

export interface BlogArticle {
  title: string;
  slug: string;
  excerpt: string;
  content?: ContentBlock[];
  markdownFile?: string;
  date: string;
  readTime: string;
  thumbnail?: string;
  tags?: string[];
}

export interface BlogData {
  sectionLabel: string;
  title: string;
  articles: BlogArticle[];
}

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

export interface TestimonialItem {
  name: string;
  role: string;
  company?: string;
  content: string;
  image?: string;
  rating?: number;
}

export interface TestimonialsData {
  sectionLabel: string;
  title: string;
  items: TestimonialItem[];
}

// ============================================================================
// OPEN SOURCE SECTION
// ============================================================================

export interface OpenSourceProject {
  name: string;
  description: string;
  url: string;
  language: string;
  stars?: number;
  icon?: string;
}

export interface OpenSourceData {
  sectionLabel: string;
  title: string;
  projects: OpenSourceProject[];
}

// ============================================================================
// CONTACT SECTION
// ============================================================================

export interface ContactChannel {
  type: string;
  label: string;
  url?: string;
  href?: string;
  value?: string;
  external?: boolean;
  icon?: string;
}

export interface ContactForm {
  note?: string;
  submitLabel?: string;
  emailPlaceholder?: string;
  subjectPlaceholder?: string;
  messagePlaceholder?: string;
  namePlaceholder?: string;
}

export interface ContactData {
  sectionLabel: string;
  title: string;
  description: string;
  email: string;
  directTitle?: string;
  directSub?: string;
  form?: ContactForm;
  availText?: string;
  availNote?: string;
  channels?: ContactChannel[];
  socialLinks: Link[];
}

// ============================================================================
// FOOTER
// ============================================================================

export interface SocialItem {
  type: string;
  url?: string;
  href?: string;
  label?: string;
  icon?: string;
}

export interface FooterData {
  tagline?: string;
  copyright: string;
  links?: Link[];
  socialLinks?: Link[];
  socials?: SocialItem[];
  madeWith?: string;
}

// ============================================================================
// HIRE ME PAGE
// ============================================================================

export interface HireMeData {
  sectionLabel: string;
  title: string;
  description: string;
  cta?: ButtonCTA;
}

// ============================================================================
// SCHEDULING / CALENDLY
// ============================================================================

export interface SchedulingData {
  calendlyUrl: string;
  embedUrl?: string;
  ctaLabel?: string;
  ctaSubLabel?: string;
}

// ============================================================================
// RESUME
// ============================================================================

export interface ResumeData {
  url: string;
  label: string;
  lastUpdated?: string;
}

// ============================================================================
// SOCIAL LINKS
// ============================================================================

export interface SocialLinks {
  linkedin?: { url: string };
  github?: { url: string };
  twitter?: { url: string };
  email?: { url: string };
}

// ============================================================================
// COMPLETE PORTFOLIO DATA INTERFACE
// ============================================================================

export interface PortfolioData {
  meta: MetaData;
  nav: NavData;
  hero: HeroData;
  about: AboutData;
  experience: ExperienceData;
  skills: SkillsData;
  projects: ProjectsData;
  resume: ResumeData;
  linkedin: SocialLinks;
  contact: ContactData;
  footer: FooterData;
  testimonials: TestimonialsData;
  openSource: OpenSourceData;
  blog: BlogData;
  hireMe: HireMeData;
  scheduling: SchedulingData;
}
