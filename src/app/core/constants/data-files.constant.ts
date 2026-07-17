import type {
  HomeConfig,
  AboutConfig,
  BlogConfig,
  ContactConfig,
  EducationConfig,
  ExperienceConfig,
  FooterConfig,
  NavigationConfig,
  Profile,
  ProjectsConfig,
  ResumeConfig,
  SeoConfig,
  ServicesConfig,
  SkillsConfig,
  SocialsConfig,
  StatsConfig,
  TechnologiesConfig,
  ThemeConfig,
  CertificatesConfig,
  OfferingsConfig,
  CaseStudiesConfig,
  AwardsConfig,
  TestimonialsConfig,
  OpenSourceConfig,
  TalksConfig,
  CommunityConfig,
  RecruiterConfig,
  ResumeVersionsConfig,
  DeveloperShowcaseConfig,
  AnalyticsDashboardConfig,
  CareerRoadmapConfig,
  LearningTimelineConfig,
  TechEvolutionConfig,
  WorldMapConfig,
  ExperienceTimelineConfig,
  SkillsTreeConfig,
} from '../models';

/**
 * Central registry mapping a logical data key -> JSON filename and payload type.
 * The `DataResources` type binds each key to its response shape so
 * `DataService.load('profile')` is fully typed with zero casts.
 */
export interface DataResources {
  readonly profile: Profile;
  readonly home: HomeConfig;
  readonly about: AboutConfig;
  readonly navigation: NavigationConfig;
  readonly socials: SocialsConfig;
  readonly stats: StatsConfig;
  readonly experience: ExperienceConfig;
  readonly projects: ProjectsConfig;
  readonly skills: SkillsConfig;
  readonly technologies: TechnologiesConfig;
  readonly education: EducationConfig;
  readonly resume: ResumeConfig;
  readonly contact: ContactConfig;
  readonly footer: FooterConfig;
  readonly blogs: BlogConfig;
  readonly seo: SeoConfig;
  readonly theme: ThemeConfig;
  readonly services: ServicesConfig;
  readonly certificates: CertificatesConfig;
  readonly offerings: OfferingsConfig;
  readonly 'case-studies': CaseStudiesConfig;
  readonly awards: AwardsConfig;
  readonly testimonials: TestimonialsConfig;
  readonly opensource: OpenSourceConfig;
  readonly talks: TalksConfig;
  readonly community: CommunityConfig;
  readonly recruiter: RecruiterConfig;
  readonly 'resume-versions': ResumeVersionsConfig;
  readonly showcase: DeveloperShowcaseConfig;
  readonly analytics: AnalyticsDashboardConfig;
  readonly 'career-roadmap': CareerRoadmapConfig;
  readonly 'learning-timeline': LearningTimelineConfig;
  readonly 'tech-evolution': TechEvolutionConfig;
  readonly 'world-map': WorldMapConfig;
  readonly 'experience-timeline': ExperienceTimelineConfig;
  readonly 'skills-tree': SkillsTreeConfig;
}

/** Valid data keys. */
export type DataKey = keyof DataResources;

/** Filename for each data key (all live under `assets/data`). */
export const DATA_FILES: Readonly<Record<DataKey, string>> = {
  profile: 'profile.json',
  home: 'home.json',
  about: 'about.json',
  navigation: 'navigation.json',
  socials: 'socials.json',
  stats: 'stats.json',
  experience: 'experience.json',
  projects: 'projects.json',
  skills: 'skills.json',
  technologies: 'technologies.json',
  education: 'education.json',
  resume: 'resume.json',
  contact: 'contact.json',
  footer: 'footer.json',
  blogs: 'blogs.json',
  seo: 'seo.json',
  theme: 'theme.json',
  services: 'services.json',
  certificates: 'certificates.json',
  offerings: 'offerings.json',
  'case-studies': 'case-studies.json',
  awards: 'awards.json',
  testimonials: 'testimonials.json',
  opensource: 'opensource.json',
  talks: 'talks.json',
  community: 'community.json',
  recruiter: 'recruiter.json',
  'resume-versions': 'resume-versions.json',
  showcase: 'showcase.json',
  analytics: 'analytics.json',
  'career-roadmap': 'career-roadmap.json',
  'learning-timeline': 'learning-timeline.json',
  'tech-evolution': 'tech-evolution.json',
  'world-map': 'world-map.json',
  'experience-timeline': 'experience-timeline.json',
  'skills-tree': 'skills-tree.json',
} as const;
