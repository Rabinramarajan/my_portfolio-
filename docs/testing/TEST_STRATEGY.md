# Master Test Strategy Document

## 1. Project Overview
This project is an Angular-based developer portfolio website designed to showcase projects, skills, and professional experience. It features modular, lazy-loaded sections including a hero interface, about page, project showcase, certifications, a functional contact form, resume access, and dynamic theme switching (light/dark mode). The application follows responsive design principles and utilizes smooth animations and route navigation.

## 2. Testing Objectives
* Deliver a seamless, bug-free user experience across all supported devices and browsers.
* Ensure functionality of critical user flows: navigation, form submission, theme toggling, and external routing.
* Validate performance, responsiveness, and accessibility (WCAG 2.1 AA compliance).
* Implement a robust continuous integration (CI) test pipeline using Playwright.

## 3. Scope of Testing
Testing will cover all user-facing interfaces, functional components, backend service integrations (e.g., mailer service for the contact form), state management, routing, and dynamic data rendering across the portfolio.

## 4. Features to be Tested
* Navigation (desktop navbar & mobile menu)
* Routing and lazy-loaded module rendering
* Hero CTA interactions and animations
* Theme switching (Light/Dark mode) persistency
* Project cards and project detail rendering
* Contact form validation and submission
* Resume download functionality
* Social media external link routing
* 404 error page navigation

## 5. Features Not In Scope
* Content management system (CMS) admin portal (if applicable and strictly back-office).
* Third-party social platform uptime or status.
* Deployment infrastructure (hosting platform uptime).

## 6. Testing Types Used
* **Unit Testing:** Angular `Jasmine`/`Karma` (or `Jest`) for isolated component and service logic.
* **Integration Testing:** Ensuring Angular components successfully interact with services.
* **End-to-End (E2E) Testing:** Playwright testing simulating actual user journeys.
* **UI Testing:** Visual regression using Playwright snapshots.
* **Responsive Testing:** Emulating mobile, tablet, and desktop viewports.
* **Accessibility Testing:** Axe-core integrated with Playwright for semantic checks.
* **Performance Testing:** Lighthouse CI checks for Core Web Vitals.

## 7. Test Environment Details
* Local Development: Node.js standard environment, Angular CLI local server (`v17+`).
* QA/Staging: Vercel/Netlify staging deployments mirroring production.
* Production: Live domain.

## 8. Browser and Device Coverage
* **Browsers:** Chromium (Chrome, Edge), Firefox, WebKit (Safari).
* **Devices:** Desktop (1920x1080), Tablet (iPad Mini, iPad Pro), Mobile (iPhone 13, Pixel 5).

## 9. Test Strategy
A shift-left approach will be prioritized. Developers will write unit tests for Angular components alongside PRs. The QA automation suite (Playwright) will run against staging deployments in the CI pipeline before merging to main.

## 10. Test Architecture
* Angular Testing Module for Unit/Integration levels.
* Playwright with Page Object Model (POM) for E2E.
* GitHub Actions / GitLab CI for automated test orchestration.

## 11. Folder Structure for Tests
```
e2e/
  ├── playwight.config.ts
  ├── tests/
  │   ├── visual/         # Visual regression tests
  │   ├── e2e/            # Core user flow tests
  │   └── a11y/           # Accessibility audits
  ├── pages/              # Page Object Models
  ├── fixtures/           # Mock data and test fixtures
  └── utils/              # Helper functions and locators
```

## 12. Naming Conventions
* Test strings must clearly define the expectation: `it('should display validation error on invalid email')`
* Page Objects: `{PageName}Page` (e.g., `HomePage`, `ContactPage`)
* Test Files: `*.spec.ts`

## 13. Test Data Strategy
E2E tests will utilize static JSON fixtures located in `/fixtures/` to mock HTTP responses (e.g., simulating successful or failed contact form submissions without hitting a real backend).

## 14. Entry and Exit Criteria
* **Entry:** Code compiles without errors; unit test coverage > 80%; PR opened.
* **Exit:** All E2E tests pass; 0 critical UI bugs; Lighthouse scores > 90.

## 15. Defect Reporting Template
* **Issue ID:** [Auto-generated]
* **Title:** [Component] - Brief description
* **Environment:** Setup details (e.g., Chrome v120, Mobile viewport)
* **Steps to Reproduce:** Numbered actions
* **Expected Result & Actual Result:**
* **Severity/Priority:**
* **Screenshot/Video Attachment:**

## 16. Risk Analysis
* **Flaky UI animations:** Playwright may execute faster than Angular animations resolving. *Mitigation:* Disable Angular animations in test mode or utilize `waitFor` state assertions.
* **Third Party APIs:** Form submission endpoint downtime. *Mitigation:* Mock network requests for frontend validation.

## 17. Detailed Test Scenarios
Refer to `TEST_CASES.md`.

## 18. Detailed Test Cases
Refer to `TEST_CASES.md`.

## 19. Regression Checklist
Refer to `QA_CHECKLIST.md`.

## 20. Pre-release QA Checklist
Refer to `QA_CHECKLIST.md`.

## 21. CI/CD Testing Workflow
1. Developer pushes to feature branch.
2. CI triggers unit tests and linting.
3. CI deploys to preview environment.
4. CI triggers Playwright E2E suite against preview URL.
5. Report generated and posted as PR comment; merge blocked on failure.

## 22. Reporting and Metrics
* Playwright HTML Report deployed as build artifact.
* Flakiness tracked via Playwright trace viewer details.

## 23. Code Quality Checklist
Refer to `QA_CHECKLIST.md`.

## 24. Maintenance Strategy
* Page Objects will be updated cohesively with UI component structural changes.
* Locators will strictly rely on `aria-labels`, `data-testid`, and semantic text matches to prevent brittleness on CSS refactoring.
