# Structural Issues & Cleanup Items

**Severity**: 🟡 LOW - Not blocking, but affects maintainability

---

## 1. Empty Placeholder Directories (6 folders)

### Issue

The following directories exist but contain only `index.ts` with `export {}`:

- `src/app/core/guards/`
- `src/app/core/interceptors/`
- `src/app/shared/directives/`
- `src/app/shared/pipes/`
- `src/app/shared/hooks/`
- `src/app/shared/validators/`

### Impact

- Suggests incomplete planning or abandoned features
- Clutters the project structure
- Confuses new developers about project organization
- Takes up mental space when navigating codebase

### Solution

**Option A: Remove Empty Directories** (Recommended)

```bash
rm -rf src/app/core/guards/
rm -rf src/app/core/interceptors/
rm -rf src/app/shared/directives/  # Animation directives live in shared/animations instead
rm -rf src/app/shared/pipes/
rm -rf src/app/shared/hooks/
rm -rf src/app/shared/validators/
```

Then consolidate animation directives:

```bash
# Move/merge shared/animations content
# Option 1: Rename animations → directives
# Option 2: Keep animations if you have non-directive animations
```

**Option B: Populate Directories** (If planned for future)
Create a README in each explaining the plan:

```markdown
# Directives (Coming Soon)

This directory will contain reusable Angular directives:

- Auto-focus
- Infinite scroll
- Lazy load
- Click outside

See [Roadmap](../../ROADMAP.md) for timeline.
```

### Files to Update After Cleanup

- Any `import { something } from '../../shared/directives'` statements
- Delete barrel exports from `index.ts` files
- Update IDE workspace settings if any directory paths are referenced

---

## 2. Project Name Typo

### Issue

Project name: `my-portolio-ng22` (should be `portfolio`)

Appears in:

- `package.json`: `"name": "my-portolio-ng22"`
- `angular.json`: `"my-portolio-ng22"`
- Build output: `dist/my-portolio-ng22/browser`
- `tsconfig.json` references

### Impact

- Minor: Affects build output path and package identification
- Professional: Typo in project name reflects poorly on portfolio
- Documentation: Examples and instructions reference wrong name

### Solution

Fix the typo:

```bash
# 1. Update package.json
# "name": "my-portfolio-ng22"

# 2. Update angular.json
# "my-portfolio-ng22"

# 3. Update tsconfig.json references if any

# 4. Update .vercelignore
# dist
# → stays the same (vercel will pick correct path)

# 5. Test build
npm run build
# Should create: dist/my-portfolio-ng22/browser

# 6. Commit
git add -A
git commit -m "fix: correct project name typo (portolio → portfolio)"
```

### Verification

```bash
npm run build
ls dist/  # Should show my-portfolio-ng22
```

---

## 3. Limited Test Coverage

### Issue

- Only 2 `.spec.ts` test files
- 125+ TypeScript components with minimal unit tests
- Critical components have no tests:
  - Contact form (email validation, submission, error states)
  - Filter tabs (keyboard navigation)
  - Responsive images (loading, fallbacks)
  - Data service (HTTP error handling)

### Impact

- Refactoring risk: breaking changes not caught
- Regression risk: bugs reappear in future
- Maintenance burden: harder to debug issues
- Quality signal: low test coverage suggests low quality

### Solution

**Phase 1: Critical Components (This Sprint)**
Add tests for:

1. Contact form validation and submission
2. Filter tabs keyboard navigation and accessibility
3. Data service HTTP error handling
4. Authentication/protected routes (if any)

**Phase 2: Core Utilities (Next Sprint)**

1. Form field validation
2. Theme service
3. SEO service
4. Animation directives

**Phase 3: Feature Coverage (Backlog)**

1. Each feature page (home, about, projects, etc.)
2. UI components (cards, badges, etc.)
3. Integration tests for critical flows

### Test File Template

```typescript
// features/contact/contact.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactPage } from './contact';

describe('ContactPage', () => {
  let component: ContactPage;
  let fixture: ComponentFixture<ContactPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should require name field', () => {
      component.contactForm.name().markTouched();
      expect(component.contactForm.name().invalid()).toBe(true);
    });

    it('should require valid email', () => {
      component.contactForm.email().setValue('invalid');
      component.contactForm.email().markTouched();
      expect(component.contactForm.email().invalid()).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should send email on valid submission', async () => {
      component.contactForm.name().setValue('Jane Doe');
      component.contactForm.email().setValue('jane@example.com');
      component.contactForm.subject().setValue('Inquiry');
      component.contactForm.message().setValue('Hello, I have a question...');

      await component.onSubmit();

      expect(component.sent()).toBe(true);
    });

    it('should show error on submission failure', async () => {
      spyOn(component['emailService'], 'send').and.returnValue(
        Promise.reject(new Error('Network error')),
      );

      component.contactForm.name().setValue('Jane Doe');
      component.contactForm.email().setValue('jane@example.com');
      component.contactForm.subject().setValue('Inquiry');
      component.contactForm.message().setValue('Hello...');

      await component.onSubmit();

      expect(component.error()).toBeTruthy();
    });
  });
});
```

### Test Coverage Goals

- **Minimum**: 60% overall coverage
- **Target**: 80% coverage for core features
- **Critical paths**: 100% coverage for contact form, auth, data service

### Tools

```bash
npm install --save-dev @angular/core @angular/platform-browser-dynamic karma karma-chrome-launcher karma-coverage

# Run tests with coverage
npm test -- --code-coverage
```

---

## Summary

| Issue             | Priority | Effort    | Impact                      |
| ----------------- | -------- | --------- | --------------------------- |
| Empty directories | Low      | 1 hour    | Cleaner structure           |
| Project name typo | Low      | 30 min    | Professional appearance     |
| Test coverage     | Medium   | 1-2 weeks | Better quality & confidence |

---

## Cleanup Checklist

- [ ] Remove 6 empty placeholder directories
- [ ] Consolidate animation directives location
- [ ] Fix project name typo in package.json and angular.json
- [ ] Add unit tests for critical components
- [ ] Update CI/CD to enforce minimum test coverage (60%)
- [ ] Update CONTRIBUTING.md with testing guidelines
