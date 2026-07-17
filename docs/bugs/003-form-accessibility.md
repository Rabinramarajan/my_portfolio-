# Bug #3: Form Accessibility Violations (WCAG 2.1)

**Severity**: 🔴 CRITICAL - Legal/Compliance  
**File**: `src/app/features/contact/contact.html`  
**Lines**: 59-110 (form inputs)  
**Status**: CONFIRMED

---

## Problem

Form input fields are missing required ARIA attributes that communicate validation state and error messages to assistive technologies (screen readers, voice control, etc.).

```html
<!-- Current: Missing ARIA attributes -->
<input
  id="c-name"
  type="text"
  placeholder="Jane Doe"
  [formField]="contactForm.name"
  class="ct-input"
/>
@if (contactForm.name().touched() && contactForm.name().invalid()) {
<p class="ct-error">{{ contactForm.name().errors()[0]?.message }}</p>
}
```

### Missing Attributes

1. **`aria-required="true"`** - Doesn't indicate which fields are required
2. **`aria-invalid="true/false"`** - Doesn't communicate validation state
3. **`aria-describedby="c-name-error"`** - Doesn't associate error message with field

---

## Impact

**Screen Reader Users Cannot**:

- Identify which form fields are required
- Understand when a field has a validation error
- Know which error message belongs to which field
- Successfully complete and submit the form

**Legal/Compliance**:

- Violates WCAG 2.1 Level A (mandatory accessibility standard)
- Violates Section 508 (U.S. federal requirement)
- Violates ADA/AATA in some jurisdictions
- Creates legal liability for your portfolio/personal brand

**Business Impact**:

- Recruiters/companies using screen readers cannot evaluate your work
- Demonstrates poor accessibility awareness
- Negative signal to prospective employers prioritizing inclusive design

---

## Root Cause

The template displays validation errors visually but doesn't communicate them programmatically via ARIA attributes. Screen readers only see the input element, not the associated error message.

---

## Solution

Add ARIA attributes to communicate validation state and link error messages:

```html
<div class="ct-field">
  <label for="c-name" class="ct-label">Your name</label>
  <input
    id="c-name"
    type="text"
    placeholder="Jane Doe"
    [formField]="contactForm.name"
    class="ct-input"
    [attr.aria-required]="true"
    [attr.aria-invalid]="contactForm.name().invalid()"
    [attr.aria-describedby]="contactForm.name().invalid() ? 'c-name-error' : null"
  />
  @if (contactForm.name().touched() && contactForm.name().invalid()) {
  <p class="ct-error" id="c-name-error">{{ contactForm.name().errors()[0]?.message }}</p>
  }
</div>

<!-- Repeat for all fields: c-email, c-subject, c-message -->
<div class="ct-field">
  <label for="c-email" class="ct-label">Your email</label>
  <input
    id="c-email"
    type="email"
    placeholder="jane@example.com"
    [formField]="contactForm.email"
    class="ct-input"
    [attr.aria-required]="true"
    [attr.aria-invalid]="contactForm.email().invalid()"
    [attr.aria-describedby]="contactForm.email().invalid() ? 'c-email-error' : null"
  />
  @if (contactForm.email().touched() && contactForm.email().invalid()) {
  <p class="ct-error" id="c-email-error">{{ contactForm.email().errors()[0]?.message }}</p>
  }
</div>

<!-- Subject field -->
<div class="ct-field">
  <label for="c-subject" class="ct-label">Subject</label>
  <input
    id="c-subject"
    type="text"
    placeholder="What is this regarding?"
    [formField]="contactForm.subject"
    class="ct-input"
    [attr.aria-required]="true"
    [attr.aria-invalid]="contactForm.subject().invalid()"
    [attr.aria-describedby]="contactForm.subject().invalid() ? 'c-subject-error' : null"
  />
  @if (contactForm.subject().touched() && contactForm.subject().invalid()) {
  <p class="ct-error" id="c-subject-error">{{ contactForm.subject().errors()[0]?.message }}</p>
  }
</div>

<!-- Message field -->
<div class="ct-field">
  <label for="c-message" class="ct-label">Message</label>
  <textarea
    id="c-message"
    rows="5"
    placeholder="Tell me a little about what you have in mind..."
    [formField]="contactForm.message"
    class="ct-input ct-textarea"
    [attr.aria-required]="true"
    [attr.aria-invalid]="contactForm.message().invalid()"
    [attr.aria-describedby]="contactForm.message().invalid() ? 'c-message-error' : null"
  ></textarea>
  @if (contactForm.message().touched() && contactForm.message().invalid()) {
  <p class="ct-error" id="c-message-error">{{ contactForm.message().errors()[0]?.message }}</p>
  }
</div>
```

### Explanation

- **`aria-required="true"`**: Tells screen reader that all fields are required
- **`[attr.aria-invalid]="contactForm.name().invalid()"`**: Updates dynamically when validation state changes
- **`[attr.aria-describedby]`**: Links input to error message by ID (only when invalid)
- **`id="c-name-error"`**: Error paragraph gets unique ID to match describedby

---

## Testing

### Screen Reader Testing

1. **NVDA (Windows, free)**: https://www.nvaccess.org/
2. **JAWS (Windows, paid)**: https://www.freedomscientific.com/
3. **VoiceOver (Mac/iOS, built-in)**: `Cmd+F5` to enable
4. **TalkBack (Android, built-in)**: Settings > Accessibility > TalkBack

Test flow:

1. Navigate to contact form
2. Tab through each input
3. Verify screen reader announces "required" for each field
4. Enter invalid data and lose focus
5. Verify screen reader announces "invalid" and reads the error message
6. Fix the field and verify "invalid" state clears

### Automated Testing

```bash
npx axe-core  # Accessibility linter
# or use WebAIM WAVE browser extension
```

---

## WCAG Compliance Checklist

- [x] Input has associated `<label>` (Level A)
- [x] Validation state communicated via `aria-invalid` (Level A)
- [x] Error message associated via `aria-describedby` (Level A)
- [x] Required fields marked with `aria-required` (Level A)
- [ ] (Bonus) Visual error indicator for color-blind users
- [ ] (Bonus) Inline error messages prevent form resubmission

---

## Related

- WCAG 2.1 Level A Standards
- Angular Signal Forms with ARIA
- Screen Reader Testing Best Practices
- FormField component enhancement
