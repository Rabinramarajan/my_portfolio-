# Component Architecture - Visual Guide

## Component Hierarchy Tree

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Home (Container)                              │
│                    [30 lines - Pure Composition]                   │
│                                                                     │
│  Imports: ScrollProgressComponent + 11 section components          │
│  Template: Layout shell with <app-*> tags only                     │
│  Logic: None (no business logic)                                   │
└─────────────────────────────────────────────────────────────────────┘
              │
    ┌─────────┼──────────────────────────────────┬──────────────┐
    │         │                                  │              │
    ▼         ▼                                  ▼              ▼
  CORE     INTERACTIVE                      DEFERRED         FORM
SECTIONS   SECTIONS                         SECTIONS         HANDLING


┌──────────────────────────────────────────────────────────────────┐
│                     CORE SECTIONS                                 │
│                  (Always Rendered)                                │
└──────────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│    Hero     │  │    About    │  │  Experience  │
│ [50 lines]  │  │ [40 lines]  │  │  [45 lines]  │
│   No State  │  │  No State   │  │  No State    │
│  Stateless  │  │ Stateless   │  │  Stateless   │
└─────────────┘  └─────────────┘  └──────┬───────┘
                                         │
                    ┌────────────────────┘
                    ▼
              ┌───────────────┐
              │Experience Card│
              │   (Sub-comp)  │
              │  [20 lines]   │
              │  Reusable     │
              └───────────────┘


┌─────────────┐  ┌──────────────┐
│   Skills    │  │  Projects    │
│ [40 lines]  │  │ [80 lines]   │
│ No State    │  │  No State    │
│ Stateless   │  │  Stateless   │
└──────┬──────┘  └──────┬───────┘
       │                │
       ▼                ▼
  ┌──────────┐  ┌──────────────────────┐
  │Skill Card│  │  Project Sub-comps   │
  │(reusable)│  │                      │
  │[20 lines]│  ├─ ProjectFeatured     │
  └──────────┘  ├─ ProjectCard (x many)│
               ├─ WipSection           │
               └─ ProjectsCTA          │
                 [20-30 lines each]


┌──────────────────────────────────────────────────────────────────┐
│               INTERACTIVE SECTIONS                                │
│           (Stateful or Tab-Based)                                 │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Playground      │
│  [70 lines]      │
│  STATEFUL        │
│  State:          │
│  - activeTab     │  ◄─── Signals from HomeStateService
│    (Signal)      │
│  - computed      │
│    visibility    │
└─────────┬────────┘
          │
          ▼
  ┌──────────────────┐
  │Playground Tabs   │
  │(sub-component)   │
  │[15 lines]        │
  │Tab Selector UI   │
  └──────────────────┘


┌──────────────────────────────────────────────────────────────────┐
│               DEFERRED SECTIONS                                   │
│      (Below-fold, @defer on viewport)                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────┐  ┌────────────────┐  ┌─────────────┐
│ Resume   │  │Testimonials    │  │ OpenSource  │
│[30 lines]│  │  [30 lines]    │  │ [20 lines]  │
│Deferred  │  │  Deferred      │  │  Deferred   │
│Stateless │  │  Stateless     │  │  Stateless  │
│Skeleton  │  │  Skeleton      │  │  Skeleton   │
└──────────┘  └────────────────┘  └─────────────┘

┌──────────────┐  ┌──────────────────┐
│    Blog      │  │   Contact        │
│  [40 lines]  │  │  [80 lines]      │
│  Deferred    │  │  STATEFUL        │
│  Computed:   │  │  State:          │
│  featured()  │  │  - isSubmitting  │
│  Articles    │  │  - submitMessage │
└──────┬───────┘  │  - submitStatus  │  ◄─── Signals from
       │          │  - Form Group    │     HomeStateService
       ▼          │  Services:       │
  ┌──────────┐    │  - ContactSvc    │
  │Blog Card │    │  - ToastSvc      │
  │(reusable)│    │  - HomeState     │
  │[20 lines]│    └──────────────────┘
  └──────────┘


┌──────────────────────────────────────────────────────────────────┐
│               SHARED SUB-COMPONENTS                               │
│            (Reusable across sections)                             │
└──────────────────────────────────────────────────────────────────┘

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│SectionHeader   │  │ExperienceCard  │  │SkillCard       │
│(wrapper)       │  │(reusable)      │  │(reusable)      │
│Label+Title+Sub │  │Job data        │  │Category data   │
│5 lines template│  │20 lines        │  │20 lines        │
└────────────────┘  └────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐
│ProjectCard     │  │BlogCard        │
│(reusable)      │  │(reusable)      │
│Project data    │  │Article data    │
│30 lines        │  │25 lines        │
└────────────────┘  └────────────────┘
```

---

## State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                HomeStateService (NEW)                       │
│              [Signals-Based State Management]               │
│                                                             │
│  Signals:                                                  │
│  ├─ isSubmitting = signal(false)                           │
│  ├─ submitMessage = signal('')                             │
│  ├─ submitStatus = signal<'idle'|'success'|'error'>        │
│  └─ activePlaygroundTab = signal('buttons')                │
│                                                             │
│  Effects:                                                  │
│  └─ autoResetEffect() [auto-reset form after 5s]           │
│                                                             │
│  Methods:                                                  │
│  ├─ setSubmitting(boolean)                                 │
│  ├─ setSubmitStatus(status, message)                       │
│  ├─ setPlaygroundTab(tabId)                                │
│  └─ resetFormState()                                       │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌──────────┐    ┌────────────┐
│ Contact  │    │ Playground │
│Component │    │ Component  │
│          │    │            │
│Injects:  │    │Injects:    │
│- State   │    │- State     │
│- Form    │    │- Computed  │
└──────────┘    └────────────┘
    │                 │
    ▼                 ▼
Template        Template
accesses:       accesses:
- isSubmitting()  - activeTab()
- submitMessage() - showXTab()
- submitStatus()
```

---

## Service Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│            PortfolioDataService (Root)                      │
│     [Read-only Signals for all sections]                    │
│                                                             │
│  Provides:                                                  │
│  hero(), about(), experience(), skills(),                  │
│  projects(), resume(), blog(), testimonials(),             │
│  openSource(), contact(), scheduling(), meta(),            │
│  linkedin()                                                 │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴──────────────────────────────────┐
    │                                            │
    ▼                                            ▼
[ALL SECTIONS]                        ┌──────────────────────┐
Read data for rendering               │ HomeStateService     │
├─ Hero                               │ (NEW)                │
├─ About                              │ Centralized UI State │
├─ Experience                         └──────┬───────────────┘
├─ Skills                                    │
├─ Projects                        ┌─────────┴──────────┐
├─ Resume                          │                    │
├─ Blog                            ▼                    ▼
├─ Testimonials           ┌──────────────┐     ┌──────────────┐
├─ OpenSource             │  Contact     │     │  Playground  │
└─ Playground             │  Component   │     │  Component   │
                          └────┬─────────┘     └──────────────┘
                               │
                    ┌──────────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │  ContactService         │
        │  [Form submission]      │
        │                         │
        │  ToastService           │
        │  [Notifications]        │
        │                         │
        │  GsapService            │
        │  [Animations]           │
        │                         │
        │  FormBuilder            │
        │  [Reactive Forms]       │
        └─────────────────────────┘
```

---

## Data Flow (Simplified)

```
User Action (e.g., submit form)
        │
        ▼
┌──────────────────────────┐
│  Contact Component       │
│  - Validates form        │
│  - Updates HomeState     │
│    .setSubmitting(true)  │
└──────────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  ContactService      │
    │  - Submits to API    │
    │  - Gets response     │
    └──────────┬───────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼ (success)          ▼ (error)
HomeState           HomeState
.setSubmitStatus    .setSubmitStatus
('success', msg)    ('error', msg)
    │                   │
    └────────┬──────────┘
             │
             ▼
    ┌──────────────────────┐
    │  Signals Update      │
    │  - submitStatus()    │
    │  - submitMessage()   │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Template Reacts     │
    │  @if (status())      │
    │  Display message     │
    │                      │
    │  5s later:           │
    │  Effect triggers     │
    │  Auto-reset status   │
    │  Message disappears  │
    └──────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  No manual setTimeout()                                 │
│  No manual state reset                                  │
│  Automatic, reactive, clean                            │
└─────────────────────────────────────────────────────────┘
```

---

## Folder Structure After Refactoring

```
src/app/pages/home/
│
├── home.component.ts               [30 lines] Container only
├── home.component.html             [15 lines] Just composition
├── home.component.scss             [100 lines] Global styles + tokens
│
├── components/
│   ├── hero/
│   │   ├── hero.component.ts
│   │   ├── hero.component.html
│   │   └── hero.component.scss
│   │
│   ├── about/
│   │   ├── about.component.ts
│   │   ├── about.component.html
│   │   └── about.component.scss
│   │
│   ├── experience/
│   │   ├── experience.component.ts
│   │   ├── experience.component.html
│   │   ├── experience.component.scss
│   │   └── experience-card.component.ts  [Sub-component]
│   │
│   ├── skills/
│   │   ├── skills.component.ts
│   │   ├── skills.component.html
│   │   ├── skills.component.scss
│   │   └── skill-card.component.ts  [Sub-component]
│   │
│   ├── projects/
│   │   ├── projects.component.ts
│   │   ├── projects.component.html
│   │   ├── projects.component.scss
│   │   ├── project-featured.component.ts
│   │   ├── project-card.component.ts
│   │   └── wip-section.component.ts
│   │
│   ├── resume/
│   │   ├── resume.component.ts
│   │   ├── resume.component.html
│   │   └── resume.component.scss
│   │
│   ├── testimonials/
│   │   ├── testimonials.component.ts
│   │   ├── testimonials.component.html
│   │   └── testimonials.component.scss
│   │
│   ├── open-source/
│   │   ├── open-source.component.ts
│   │   ├── open-source.component.html
│   │   └── open-source.component.scss
│   │
│   ├── blog/
│   │   ├── blog.component.ts
│   │   ├── blog.component.html
│   │   ├── blog.component.scss
│   │   └── blog-card.component.ts  [Sub-component]
│   │
│   ├── playground/
│   │   ├── playground.component.ts
│   │   ├── playground.component.html
│   │   ├── playground.component.scss
│   │   ├── playground-tabs.component.ts
│   │   └── playground-content.component.ts
│   │
│   ├── contact/
│   │   ├── contact.component.ts
│   │   ├── contact.component.html
│   │   └── contact.component.scss
│   │
│   └── shared/
│       └── section-header.component.ts  [Reusable wrapper]
│
├── services/
│   ├── home-state.service.ts           [NEW - Signals state]
│   └── home-animations.service.ts      [NEW - GSAP orchestration]
│
├── models/
│   ├── contact-form.model.ts
│   └── section-state.model.ts
│
├── constants/
│   └── playground-tabs.constant.ts
│
├── README.md                           [Component documentation]
└── styles/                             [Optional - shared styles]
    └── _tokens.scss                    [Design tokens]
```

---

## Component Checklist: Before & After

### Before (Monolithic)
```
┌──────────────────────────────┐
│  Home Component              │
│  ├─ Hero section             │
│  ├─ About section            │
│  ├─ Experience section       │
│  ├─ Skills section           │
│  ├─ Projects section         │
│  ├─ Resume section           │
│  ├─ Testimonials section     │
│  ├─ OpenSource section       │
│  ├─ Blog section             │
│  ├─ Playground section       │
│  ├─ Contact section          │
│  │                           │
│  ├─ State:                   │
│  │  ├─ contactForm (FormGroup)
│  │  ├─ isSubmitting (boolean)
│  │  ├─ submitMessage (string)
│  │  ├─ submitStatus (string)
│  │  └─ activePlaygroundTab   │
│  │      (Signal)             │
│  │                           │
│  ├─ Methods:                 │
│  │  ├─ initGsapAnimations()  │
│  │  ├─ submitContact()       │
│  │  └─ getFieldError()       │
│  │                           │
│  └─ Hard to:                 │
│     ├─ Test                  │
│     ├─ Maintain              │
│     ├─ Reuse                 │
│     └─ Understand            │
└──────────────────────────────┘
Total: 3,826 lines in 3 files
```

### After (Modular)
```
┌────────────────────────────────┐
│  Home Container (30 lines)      │
│  ├─ <app-hero></app-hero>       │
│  ├─ <app-about></app-about>     │
│  ├─ <app-experience></app-experience>
│  ├─ <app-skills></app-skills>   │
│  ├─ <app-projects></app-projects>
│  ├─ <app-resume></app-resume>   │
│  ├─ <app-testimonials></app-testimonials>
│  ├─ <app-open-source></app-open-source>
│  ├─ <app-blog></app-blog>       │
│  ├─ <app-playground></app-playground>
│  └─ <app-contact></app-contact> │
└────────────────────────────────┘

┌─────────────────────────────────┐
│  HomeStateService (60 lines)     │
│  ├─ Signals: isSubmitting        │
│  ├─ Signals: submitMessage       │
│  ├─ Signals: submitStatus        │
│  ├─ Signals: activePlaygroundTab │
│  ├─ Effects: autoReset()         │
│  └─ Methods: setter methods      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  11 Section Components           │
│  Each: 30-80 lines TS            │
│  Clean separation of concerns    │
│  Easy to test                    │
│  Easy to maintain                │
│  Easy to reuse                   │
│  Easy to understand              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  6+ Sub-components              │
│  Reusable cards, tabs, etc.      │
│  Reduced duplication             │
│  Consistent UI patterns          │
└─────────────────────────────────┘

Total: ~2,500 lines in 20+ files
(More files, but much smaller and focused)
```

---

## Benefit Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Size** | 1 file, 1,200 lines | 12 files, avg 90 lines |
| **Readability** | Hard (too much) | Easy (focused) |
| **Testing** | Monolithic | Isolated, easy |
| **Reusability** | Limited | High |
| **Maintainability** | Difficult | Straightforward |
| **Performance** | OK | Better (tree-shaking) |
| **Type Safety** | Good | Excellent |
| **State Management** | Imperative | Reactive (Signals) |
| **Change Detection** | OnPush | OnPush + Signals |
| **Learning Curve** | Steep | Gentle |

---

**Status**: ✅ Architecture Complete and Approved  
**Next Step**: Phase 3 - Extract Core Components
