import { Routes } from '@angular/router';
import { Shell } from './shared/components/layout/shell/shell';

/**
 * Application routes.
 * - Home renders standalone (top navbar layout).
 * - All inner pages render inside the {@link Shell} (sidebar layout).
 * - Every route is lazy (`loadComponent`), carries a `title` (→ TitleStrategy)
 *   and SEO `data`.
 */
export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Senior Frontend Angular Developer',
        data: {
          description:
            'Rabin R — Senior Frontend Angular Developer with 4+ years building enterprise-grade web & mobile apps for government and financial platforms serving 10,000+ users.',
          keywords: [
            'Rabin R',
            'Angular Developer',
            'Senior Frontend Developer',
            'TypeScript',
            'RxJS',
            'Ionic',
          ],
        },
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'about',
        title: 'About',
        data: {
          description:
            'About Rabin R — a Senior Frontend Angular Developer engineering accessible, high-performance products for government and enterprise clients.',
          keywords: ['About Rabin R', 'Angular Engineer', 'Frontend Architecture'],
        },
        loadComponent: () => import('./features/about/about').then((m) => m.AboutPage),
      },
      {
        path: 'experience',
        title: 'Experience',
        data: {
          description:
            'Professional experience of Rabin R — 4+ years delivering enterprise Angular & Ionic platforms across government and financial sectors.',
          keywords: ['Angular Experience', 'Enterprise Frontend', 'Ionic Developer'],
        },
        loadComponent: () =>
          import('./features/experience/experience').then((m) => m.ExperiencePage),
      },
      {
        path: 'projects',
        title: 'Projects',
        data: {
          description:
            'Selected work by Rabin R — immigration portals, pension platforms and cross-platform mobile apps built with Angular, Ionic and TypeScript.',
          keywords: [
            'Angular Projects',
            'Government Portals',
            'Enterprise Web Apps',
            'Case Studies',
          ],
        },
        loadComponent: () => import('./features/projects/projects').then((m) => m.ProjectsPage),
      },
      {
        path: 'projects/:slug',
        title: 'Case Study',
        loadComponent: () =>
          import('./features/projects/project-detail/project-detail').then(
            (m) => m.ProjectDetailPage,
          ),
      },
      {
        path: 'skills',
        title: 'Skills & Technologies',
        data: {
          description:
            'Technical skills of Rabin R — Angular, TypeScript, RxJS, Angular Signals, Ionic, Tailwind CSS, accessibility and frontend performance engineering.',
          keywords: ['Angular Skills', 'TypeScript', 'RxJS', 'Angular Signals', 'Tailwind CSS'],
        },
        loadComponent: () => import('./features/skills/skills').then((m) => m.SkillsPage),
      },
      {
        path: 'resume',
        title: 'Resume',
        data: {
          description:
            'Resume of Rabin R — Senior Frontend Angular Developer with 4+ years of enterprise experience. View and download the full CV.',
          keywords: ['Rabin R Resume', 'Angular Developer CV', 'Frontend Developer Resume'],
        },
        loadComponent: () => import('./features/resume/resume').then((m) => m.ResumePage),
      },
      {
        path: 'services',
        title: 'Services',
        data: {
          description:
            'Freelance frontend services by Rabin R — Angular development, Ionic cross-platform apps, API integration, UI development and performance optimization.',
          keywords: [
            'Freelance Angular Developer',
            'Ionic App Development',
            'Frontend Services',
            'Hire Angular Developer',
          ],
        },
        loadComponent: () => import('./features/services/services').then((m) => m.ServicesPage),
      },
      {
        path: 'settings',
        title: 'Settings',
        data: {
          description:
            'Customize your portfolio with themes, colors, fonts, layouts, and accessibility options.',
          keywords: ['Settings', 'Personalization', 'Accessibility', 'Theme', 'Customization'],
        },
        loadComponent: () => import('./features/settings/settings').then((m) => m.SettingsPage),
      },
      {
        path: 'showcase',
        title: 'Developer Showcase',
        data: {
          description:
            'Interactive code playground, API explorer, architecture diagrams, code metrics, and project dependencies showcase.',
          keywords: [
            'Code Showcase',
            'Portfolio Demo',
            'API Documentation',
            'Architecture',
            'Code Snippets',
          ],
        },
        loadComponent: () => import('./features/showcase/showcase').then((m) => m.ShowcasePage),
      },
      {
        path: 'recruiter',
        title: 'Recruiter Hub',
        data: {
          description:
            'Recruiter-focused hub with interview Q&A, resume versions, availability, salary preferences, and project inquiry wizard.',
          keywords: ['Hire Rabin', 'Interview Prep', 'Resume', 'Availability', 'Project Inquiry'],
        },
        loadComponent: () => import('./features/recruiter/recruiter').then((m) => m.RecruiterPage),
      },
      {
        path: 'certifications',
        title: 'Certifications',
        data: {
          description:
            'Professional certifications and credentials of Rabin R — Applied AI & ML (IIT Patna) and Web Design & Development, backing his frontend engineering practice.',
          keywords: [
            'Rabin R Certifications',
            'Angular Developer Credentials',
            'Web Development Certificate',
          ],
        },
        loadComponent: () =>
          import('./features/certifications/certifications').then((m) => m.CertificationsPage),
      },
      {
        path: 'blog',
        title: 'Blog',
        data: { description: 'Articles, tutorials and insights on frontend development.' },
        loadComponent: () => import('./features/blog/blog').then((m) => m.BlogPage),
      },
      {
        path: 'blog/:slug',
        title: 'Blog Article',
        loadComponent: () =>
          import('./features/blog/blog-detail/blog-detail').then((m) => m.BlogDetailPage),
      },
      {
        path: 'knowledge',
        title: 'Knowledge Hub',
        data: {
          description:
            'A living library of Angular tips, reusable snippets, interview notes, design patterns, system design write-ups and a bug-solving diary by Rabin R.',
          keywords: [
            'Angular Tips',
            'Code Snippets',
            'Interview Preparation',
            'Design Patterns',
            'System Design',
            'Frontend Notes',
          ],
        },
        loadComponent: () => import('./features/knowledge/knowledge').then((m) => m.KnowledgePage),
      },
      {
        path: 'knowledge/:slug',
        title: 'Knowledge',
        loadComponent: () =>
          import('./features/knowledge/knowledge-detail/knowledge-detail').then(
            (m) => m.KnowledgeDetailPage,
          ),
      },
      {
        path: 'career-roadmap',
        title: 'Career Roadmap',
        data: {
          description:
            'Professional career timeline with milestones, promotions, and achievements from junior developer to lead engineer.',
          keywords: ['Career', 'Roadmap', 'Professional Growth', 'Milestones'],
        },
        loadComponent: () =>
          import('./features/career-roadmap/career-roadmap').then((m) => m.CareerRoadmapPage),
      },
      {
        path: 'learning-timeline',
        title: 'Learning Timeline',
        data: {
          description:
            'Educational journey with certifications, courses, workshops, and continuous learning achievements.',
          keywords: ['Learning', 'Education', 'Certifications', 'Skills'],
        },
        loadComponent: () =>
          import('./features/learning-timeline/learning-timeline').then(
            (m) => m.LearningTimelinePage,
          ),
      },
      {
        path: 'experience-timeline',
        title: 'Experience Timeline',
        data: {
          description:
            'Detailed work experience timeline with accomplishments, technologies, and impact metrics.',
          keywords: ['Experience', 'Work History', 'Professional'],
        },
        loadComponent: () =>
          import('./features/experience-timeline/experience-timeline').then(
            (m) => m.ExperienceTimelinePage,
          ),
      },
      {
        path: 'contact',
        title: 'Contact',
        data: {
          description:
            'Contact Rabin R for full-time Senior/Lead Frontend roles, freelance Angular & Ionic projects, and collaborations. Based in Chennai, available remote.',
          keywords: ['Hire Angular Developer', 'Contact Rabin R', 'Freelance Frontend Developer'],
        },
        loadComponent: () => import('./features/contact/contact').then((m) => m.ContactPage),
      },
    ],
  },
  {
    path: '**',
    title: 'Page Not Found',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
