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
          keywords: ['Angular Projects', 'Government Portals', 'Enterprise Web Apps', 'Case Studies'],
        },
        loadComponent: () => import('./features/projects/projects').then((m) => m.ProjectsPage),
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
        path: 'case-studies',
        title: 'Case Studies',
        data: {
          description:
            'In-depth case studies by Rabin R — government immigration portals, pension platforms and cross-platform mobile apps: the problem, the solution, the architecture and the results.',
          keywords: ['Angular Case Studies', 'Frontend Case Study', 'Government Portal', 'Enterprise Web Apps'],
        },
        loadComponent: () =>
          import('./features/case-studies/case-studies').then((m) => m.CaseStudiesPage),
      },
      {
        path: 'case-studies/:id',
        title: 'Case Study',
        loadComponent: () =>
          import('./features/case-studies/case-study-detail/case-study-detail').then(
            (m) => m.CaseStudyDetailPage,
          ),
      },
      {
        path: 'services',
        title: 'Services',
        data: {
          description:
            'Freelance frontend services by Rabin R — Angular development, Ionic cross-platform apps, API integration, UI development and performance optimization.',
          keywords: ['Freelance Angular Developer', 'Ionic App Development', 'Frontend Services', 'Hire Angular Developer'],
        },
        loadComponent: () => import('./features/services/services').then((m) => m.ServicesPage),
      },
      {
        path: 'certifications',
        title: 'Certifications',
        data: {
          description:
            'Professional certifications and credentials of Rabin R — Applied AI & ML (IIT Patna) and Web Design & Development, backing his frontend engineering practice.',
          keywords: ['Rabin R Certifications', 'Angular Developer Credentials', 'Web Development Certificate'],
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
