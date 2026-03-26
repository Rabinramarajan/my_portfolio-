# QA & Delivery Checklists

## 1. Pre-release QA Checklist
Prior to cutting a release or merging to the production branch, verify the following:

- [ ] All dynamic routes mapping (projects, details) resolve dynamically without 404s.
- [ ] Cross-browser compatibility confirmed on Windows (Chrome, Edge) and Mac (Safari).
- [ ] Mobile responsive layout validates cleanly down to 320px logical width.
- [ ] Forms successfully interact with their target APIs in the production-like staging environment.
- [ ] Image assets load properly without breaking layout boundaries (lazy loading verified).
- [ ] No `console.error` or `console.warn` occurrences in DevTools on page load.
- [ ] Google Analytics / tracking scripts (if any) are firing correctly.
- [ ] `robots.txt` and `sitemap.xml` are properly constructed.

## 2. Regression Checklist
Use this checklist when isolated changes are made to ensure critical paths aren't broken.

- [ ] Navbar anchor links accurately scroll to the section.
- [ ] Theme toggler retains its state on page reload (`localStorage/sessionStorage`).
- [ ] Resume download link points to the most up-to-date asset.
- [ ] Contact form triggers the visual "Submitting/Loading" state on click to prevent duplicate sends.
- [ ] 404 Catch-all route successfully traps unrecognized navigation paths.
- [ ] External links contain `target="_blank"` and `rel="noopener noreferrer"`.

## 3. Code Quality & Standards Checklist
For developers during the PR review process:

- [ ] **Angular Best Practices:** Standalone components used where applicable.
- [ ] **Change Detection:** `ChangeDetectionStrategy.OnPush` is applied to pure presentation components.
- [ ] **Reactivity:** Angular `Signals` or `RxJS` Async pipes used for template unwrapping; no manual `.subscribe()` leaks.
- [ ] **Type Safety:** Strict TypeScript rules enforced, avoid relying heavily on `any` types.
- [ ] **Accessibility:** Every `<img>` has an `alt` tag, buttons have semantic text/aria-labels.
- [ ] **Testing:** Associated test spec (`.spec.ts`) updated and passing.
- [ ] **Linting:** CLI `ng lint` / Prettier rules pass.
