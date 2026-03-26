# Detailed E2E & Manual Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Priority | Severity | Test Type | Automation Status |
|---|---|---|---|---|---|---|---|---|---|
| TC_001 | Landing Page | Validate Hero Section | App deployed | 1. Navigate to `/` | Hero title, subtitle, and CTA buttons are visible | High | Critical | UI / E2E | Automatable |
| TC_002 | Navbar | Anchor Navigation | App loaded | 1. Click "About" link | Page scrolls to About section | High | Major | E2E | Automatable |
| TC_003 | Mobile Menu | Open/Close Menu | Mobile viewport | 1. Click hamburger icon<br>2. Click 'X' icon | Menu overlays screen, then closes successfully | High | Major | UI / E2E | Automatable |
| TC_004 | Theme Toggle | Dark/Light Mode Switch | System set to Light | 1. Click Theme toggle | `document.body` class toggles to dark mode, colors invert | Medium | Minor | E2E | Automatable |
| TC_005 | Projects | Render Project Cards | App loaded | 1. Scroll to Projects | Cards display image, title, and tags | High | Major | UI / E2E | Automatable |
| TC_006 | Project Details | Open Details Page | Cards are visible | 1. Click on Project Card | Router navigates to `/project/:id` with detail specifics | High | Critical | E2E | Automatable |
| TC_007 | Contact Form | Validation empty | App loaded | 1. Click 'Send' with empty inputs | Required field error messages appear | High | Major | E2E | Automatable |
| TC_008 | Contact Form | Validation format | Form visible | 1. Enter invalid email <br>2. Blur input | Email format error is displayed | High | Major | E2E | Automatable |
| TC_009 | Contact Form | Success submission | Valid data entered | 1. Click 'Send' | Success toast appears, form clears | High | Critical | E2E | Automatable |
| TC_010 | Resume Button | Download PDF | App loaded | 1. Click 'Download Resume' | Resume PDF triggers browser download/open | Medium | Major | E2E | Automatable |
| TC_011 | Social Links | External Navigation | App loaded | 1. Click GitHub icon | Opens new tab with GitHub profile URL | Medium | Major | E2E | Automatable |
| TC_012 | Routing | Invalid URL | App loaded | 1. Navigate to `/fake-url` | 404 Custom Error Page resolves | Medium | Minor | E2E | Automatable |
| TC_013 | Performance | Lighthouse Metrics | App deployed | 1. Run Lighthouse audit on `/` | Performance, SEO, A11y ≥ 90 | High | Minor | Perf | Automatable |
| TC_014 | Accessibility | Axe-core Scan | App deployed | 1. Run `axe` standard scan on `/` | 0 Critical or Serious violations | High | Major | A11y | Automatable |
| TC_015 | Animations | Scroll Triggers | App loaded | 1. Scroll to Skills | Elements fade/slide into viewport view | Low | Minor | Visual | Manual/Visual |
