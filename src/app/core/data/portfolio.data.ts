export interface Skill {
  name: string;
  level: number;
  category: 'frontend' | 'backend' | 'tools' | 'other';
  image?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  technologies: string[];
  highlights: string[];
  image?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  achievements: string[];
}

export const PROFILE = {
  name: 'Rabin Ramarajan',
  role: 'Frontend Developer',
  tagline: 'Angular & Ionic Specialist',
  experience: '3.6+',
  email: 'suriyarabin@gmail.com',
  phone: '+91 9789376992',
  website: 'www.rabinr.in',
  education: 'B.Sc. Information Technology',
  summary: `Frontend Developer with 3.6+ years of experience specializing in Angular 13-20 (including Angular 20 Zoneless), 
  Ionic 7-8, TypeScript, Signals, RxJS, REST API integrations, JWT authentication, modular architecture, 
  micro frontends, and enterprise application development. Passionate about creating performant, 
  scalable, and user-friendly web applications.`
};

export const SKILLS: Skill[] = [
  { name: 'Angular 13-20', level: 95, category: 'frontend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { name: 'Angular Zoneless', level: 90, category: 'frontend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { name: 'Ionic 7-8', level: 88, category: 'frontend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ionic/ionic-original.svg' },
  { name: 'TypeScript', level: 92, category: 'frontend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
  { name: 'JavaScript', level: 90, category: 'frontend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
  { name: 'SCSS/CSS', level: 88, category: 'frontend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sass/sass-original.svg' },
  { name: 'Signals', level: 85, category: 'frontend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { name: 'RxJS', level: 87, category: 'frontend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rxjs/rxjs-original.svg' },
  { name: 'PrimeNG', level: 82, category: 'frontend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { name: 'Angular Material', level: 85, category: 'frontend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
  { name: 'Node.js', level: 75, category: 'backend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
  { name: 'Express', level: 72, category: 'backend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg' },
  { name: 'MongoDB', level: 70, category: 'backend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg' },
  { name: 'REST APIs', level: 88, category: 'backend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
  { name: 'JWT/RBAC', level: 80, category: 'backend', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
  { name: 'Micro Frontends', level: 78, category: 'tools', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/webpack/webpack-original.svg' },
  { name: 'Monorepos', level: 75, category: 'tools', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original-wordmark.svg' },
  { name: 'PWA', level: 80, category: 'tools', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/chrome/chrome-original.svg' },
  { name: 'CI/CD', level: 72, category: 'tools', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg' },
  { name: 'Git', level: 85, category: 'tools', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' }
];

export const PROJECTS: Project[] = [
  {
    id: 'prims',
    title: 'PRIMS',
    subtitle: 'Member Portal',
    description: `A comprehensive member portal system designed to manage member information, 
    subscriptions, and services. Built with Angular and featuring real-time updates, 
    role-based access control, and seamless API integrations.`,
    duration: '14 months',
    technologies: ['Angular', 'TypeScript', 'RxJS', 'REST APIs', 'JWT', 'SCSS'],
    highlights: [
      'Developed modular architecture for scalability',
      'Implemented secure JWT-based authentication',
      'Created responsive UI components with PrimeNG',
      'Optimized performance with lazy loading'
    ]
  },
  {
    id: 'fid',
    title: 'FID',
    subtitle: 'Online Visa & Immigration System',
    description: `An enterprise-grade visa and immigration management system that streamlines 
    the application process for users and administrators. Features document management, 
    application tracking, and automated workflows.`,
    duration: '18 months',
    technologies: ['Angular', 'Ionic', 'TypeScript', 'Signals', 'MongoDB', 'Node.js'],
    highlights: [
      'Built cross-platform solution with Ionic',
      'Implemented complex form validations',
      'Created document upload and verification system',
      'Developed admin dashboard with analytics'
    ]
  },
  {
    id: 'vnpf-blo-mi',
    title: 'VNPF BLO MI',
    subtitle: 'Loan/Withdrawal Platform',
    description: `A robust financial platform enabling members to manage loans and withdrawals 
    efficiently. Includes loan calculators, application workflows, and real-time status tracking 
    with secure transaction handling.`,
    duration: '12 months',
    technologies: ['Angular', 'TypeScript', 'RxJS', 'REST APIs', 'RBAC', 'Express'],
    highlights: [
      'Developed secure loan application workflow',
      'Implemented real-time notification system',
      'Created interactive loan calculators',
      'Built comprehensive reporting dashboard'
    ]
  }
];

export const EXPERIENCES: Experience[] = [
  {
    id: 'exp-1',
    role: 'Frontend Developer',
    company: 'Enterprise Solutions',
    period: '2021 - Present',
    description: 'Lead frontend development for enterprise applications using Angular and Ionic frameworks.',
    achievements: [
      'Migrated legacy applications to Angular 20 Zoneless architecture',
      'Implemented Signals-based state management reducing complexity by 40%',
      'Developed reusable component library used across 5+ projects',
      'Mentored junior developers and conducted code reviews'
    ]
  },
  {
    id: 'exp-2',
    role: 'Junior Frontend Developer',
    company: 'Tech Innovations',
    period: '2020 - 2021',
    description: 'Developed and maintained web applications using Angular and TypeScript.',
    achievements: [
      'Built responsive UI components following design specifications',
      'Integrated REST APIs and handled data management with RxJS',
      'Participated in agile development cycles',
      'Contributed to improving code quality and testing practices'
    ]
  }
];
