# Accessibility Testing & Semantic Improvements

As a frontend accessibility engineer, this document outlines steps to ensure the portfolio is entirely accessible and highly compatible with Playwright's preferred DOM locator strategies (e.g., `getByRole()`).

## 1. General Identification & Best Practices
UI Elements needing frequent audits:
* Icon-only buttons (Theme switchers, Social Links, Hamburger menus)
* Form inputs lacking explicitly associated labels
* Custom non-semantic cards/divs acting as links.

## 2. Semantic Before / After Examples

### A. Icon-Only Buttons (Theme Switcher, Mobile Menu)
**Poor (Before):**
```html
<div class="theme-toggle" (click)="toggleTheme()">
  <i class="fas fa-moon"></i>
</div>
```
*Issue:* Screen readers ignore divs; keyboard users cannot tab to it or press Enter; Playwright cannot locate it gracefully.

**Improved (After):**
```html
<button class="theme-toggle" (click)="toggleTheme()" aria-label="Toggle dark mode">
  <i class="fas fa-moon" aria-hidden="true"></i>
</button>
```
*Playwright tests can now use:* `page.getByRole('button', { name: 'Toggle dark mode' })`

### B. Project Cards Navigation
**Poor (Before):**
```html
<div class="card" (click)="goToProject(project.id)">
  <img [src]="project.img">
  <div class="title">{{ project.name }}</div>
</div>
```
*Issue:* No focus state, image lacks alt text, semantically incorrect.

**Improved (After):**
```html
<article class="card">
  <a [routerLink]="['/project', project.id]" class="card-link" [aria-label]="'View details for ' + project.name">
    <img [src]="project.img" [alt]="project.name + ' preview screenshot'">
    <h3 class="title">{{ project.name }}</h3>
  </a>
</article>
```
*Playwright tests can now use:* `page.getByRole('link', { name: 'View details for NextJS Dashboard' })`

### C. Contact Form Labels
**Poor (Before):**
```html
<input type="email" formControlName="email" placeholder="Email">
```
*Issue:* Placeholders are not substitutes for permanent labels.

**Improved (After):**
```html
<div class="form-group">
  <label for="email-input">Email Address</label>
  <input id="email-input" type="email" formControlName="email" autocomplete="email">
  <!-- Error message with proper aria-live -->
  @if (email.invalid && email.touched) {
    <span class="error" aria-live="polite">Please enter a valid email address.</span>
  }
</div>
```
*Playwright tests can now use:* `page.getByLabel('Email Address').fill('test@test.com')`

### D. External Links
**Poor (Before):**
```html
<a href="https://github.com/user">GitHub</a>
```
**Improved (After):**
```html
<a href="https://github.com/user" target="_blank" rel="noopener noreferrer" aria-label="Visit my GitHub profile (opens in new tab)">
  GitHub
  <span class="sr-only">(opens in new tab)</span>
</a>
```

## 3. Keyboard & Focus Management
* Ensure no outline resets like `outline: none;` exist without an accompanying customized `:focus-visible` state.
* Lazy loaded dialogs or overlays (like a mobile menu) must trap focus within the overlay context and restore focus upon closing.
* Skip to content link should be added for keyboard users to bypass the nav.
