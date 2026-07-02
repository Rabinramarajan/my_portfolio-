export interface MetaSection {
  title: string;
  description: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  website: string;
  location: string;
  timezone: string;
  resumePdf: string;
  profileImage: string;
  elfsightWidgetId?: string;
}

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  highlight?: boolean;
}

export interface NavSection {
  logo: string;
  links: NavLink[];
}

export interface HeroSection {
  badge: string;
  headline: string;
  headlineAccent: string;
  description: string;
  cta: {
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
    booking?: { label: string; href: string };
  };
  stack: { name: string; color: string }[];
  stats: { number: string; label: string }[];
  codeSnippet?: { filename: string; lines?: unknown[] };
}

export interface AboutSection {
  sectionLabel: string;
  title: string;
  intro: string;
  openBadge: string;
  bio: string[];
  infoCards: { label: string; value: string }[];
}

export interface ExperienceJob {
  company: string;
  location: string;
  role: string;
  duration: string;
  achievements: string[];
  tags: string[];
}

export interface ExperienceSection {
  sectionLabel: string;
  title: string;
  subtitle: string;
  jobs: ExperienceJob[];
}

export interface SkillCategory {
  name: string;
  icon?: string;
  items: string[];
}

export interface SkillsSection {
  sectionLabel: string;
  title: string;
  subtitle: string;
  categories: SkillCategory[];
}

export interface ProjectItem {
  name: string;
  description: string;
  image: string;
  alt: string;
  tags: string[];
  link: string;
  github?: string;
  highlights?: string;
}

export interface ProjectsSection {
  sectionLabel: string;
  title: string;
  subtitle: string;
  featured?: ProjectItem;
  grid?: ProjectItem[];
}

export interface ResumeSection {
  sectionLabel: string;
  title: string;
  subtitle: string;
  availBadge: string;
  cardTitle: string;
  cardBio: string;
  downloadLabel: string;
  viewLabel: string;
  updatedLabel: string;
}

export interface TestimonialItem {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
  location: string;
  rating: number;
  avatar: string;
  avatarColor: string;
}

export interface TestimonialsSection {
  sectionLabel: string;
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

export interface LinkedInSection {
  sectionLabel: string;
  title: string;
  subtitle: string;
}

export interface ContactChannel {
  type: string;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

export interface ContactSection {
  sectionLabel: string;
  title: string;
  subtitle: string;
  directTitle: string;
  directSub: string;
  availText: string;
  availNote: string;
  form: {
    namePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    note: string;
    submitLabel: string;
  };
  channels: ContactChannel[];
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[];
  featured?: boolean;
  content?: string[];
}

export interface BlogSection {
  sectionLabel: string;
  title: string;
  subtitle: string;
  viewAllLabel: string;
  viewAllHref: string;
  articles: BlogArticle[];
}

export interface FooterSection {
  logo: string;
  tagline: string;
  links: NavLink[];
  socials: { label: string; href: string; type: string }[];
  copyright: string;
  madeWith: string;
}

export interface SchedulingSection {
  calendlyUrl: string;
  ctaLabel: string;
  ctaSubLabel: string;
}

export interface HireMeSection {
  sectionLabel?: string;
  hero: {
    title: string;
    titleAccent: string;
    subtitle: string;
    badge: string;
    cta?: string;
    ctaHref?: string;
  };
  process: {
    title: string;
    subtitle: string;
    steps: { step: string; title: string; desc: string; icon: string }[];
  };
  services: {
    icon: string;
    title: string;
    items: string[];
    highlight: boolean;
  }[];
  timelines: { project: string; duration: string }[];
  notAFit: string[];
  faqs: { q: string; a: string }[];
}

export interface PortfolioData {
  meta: MetaSection;
  nav: NavSection;
  hero: HeroSection;
  about: AboutSection;
  experience: ExperienceSection;
  skills: SkillsSection;
  projects: ProjectsSection;
  resume: ResumeSection;
  linkedin: LinkedInSection;
  contact: ContactSection;
  footer: FooterSection;
  testimonials: TestimonialsSection;
  blog: BlogSection;
  hireMe: HireMeSection;
  scheduling: SchedulingSection;
}
