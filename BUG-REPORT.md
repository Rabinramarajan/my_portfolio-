# Portfolio Application — Bug & Optimization Report (Pass 4)

**Date:** 2026-07-15 (re-review + fixes applied)
**Scope:** Full `src/app` source review + production build (`ng build`)
**Build status:** ✅ Passes clean — **no errors, no warnings** (~5s)
**Overall:** 🎉 **Zero open items.** Every correctness, robustness, a11y, and performance item has been resolved.

---

## ✅ All bugs & issues resolved

| ID | Item | Status |
|----|------|--------|
| BUG-1 | SEO tags cleared when omitted + dynamic SEO in `CaseStudyDetailPage` | ✅ Fixed |
| BUG-2 | Resume scroll-lock — reader moved to `ResumeReader`, rendered via `@if`, releases `rz-lock` on `DestroyRef.onDestroy` (covers close, Escape **and navigation away**) | ✅ Fixed ([resume-reader.ts:37-40](src/app/features/resume/resume-reader/resume-reader.ts#L37-L40)) |
| BUG-3 | Blog "Popular" sort ranks by `popularIds` | ✅ Fixed |
| MIN-1 | Certifications `formatDate` guards invalid dates | ✅ Fixed |
| MIN-2 | Stagger directive kills all tracked tweens on destroy | ✅ Fixed |
| OPT-1 | `resume.scss` under budget | ✅ Fixed |
| OPT-3 | Blog search now matches title + excerpt + tags (`matchesTerm`) | ✅ Fixed ([blog.ts:74](src/app/features/blog/blog.ts#L74)) |
| OPT-4 | Shared/deduped profile resource | ✅ Fixed |
| A11Y-1 | **Filter-tabs** now supports roving `tabindex` + Arrow/Home/End keyboard navigation | ✅ Fixed this pass ([filter-tabs.ts](src/app/shared/components/ui/filter-tabs/filter-tabs.ts)) |
| A11Y-2 | **Search-input** now uses `:focus-visible` with a clear 2px outline ring | ✅ Fixed this pass ([search-input.ts:54](src/app/shared/components/forms/search-input/search-input.ts#L54)) |

---

## 🔧 Fixes applied in this pass

### A11Y-1 — Filter-tabs keyboard navigation
[filter-tabs.ts](src/app/shared/components/ui/filter-tabs/filter-tabs.ts)
- Added roving `tabindex` (`0` for the selected tab, `-1` for the rest) so the tablist is a single tab stop.
- Added `ArrowRight`/`ArrowLeft` (with wrap-around), `Home`, and `End` handlers via `move()` / `moveTo()`, which update the selection and move DOM focus to the target tab. `preventDefault()` stops page scroll.
- ARIA `role="tablist"`/`role="tab"` now matches the implemented keyboard behavior.

### A11Y-2 — Search-input focus ring
[search-input.ts:54-58](src/app/shared/components/forms/search-input/search-input.ts#L54-L58)
- Replaced the `:focus` border-only style with `:focus-visible` plus a 2px `outline` ring + offset, giving keyboard users a clear focus indicator while not showing a ring on mouse click.

---

### OPT-2 — Image CLS (resolved this pass)
Audited every image class. Findings:
- **Cover/banner images** (`bc__cover`, `bl-feat__cover`, `cs__img`, `csd__shot`, `pjc__img`) already reserve space via `aspect-ratio: 16/9` + `object-fit: cover`. ✅
- **Fixed-size images** (avatars, logos, thumbnails: `ab-visual__img`, `pc__img`, `bl-pop__thumb`, `sk-tile__logo`, `ex-evo__logo`, `bl-hero`, `ex-aside__img`) reserve space via explicit CSS `height`/`width`. ✅
- **Overlay map** (`ct-map__img`) is `position: absolute; inset: 0` inside a `min-height` container — out of flow, no shift. ✅
- **Only gap:** the decorative desktop-only `sk-hero` SVG had `width` but no reserved height. **Fixed** — added `aspect-ratio: 460 / 300` (matches the SVG viewBox) + `height: auto` at [skills.scss:5-12](src/app/features/skills/skills.scss#L5-L12).

The home hero is already correctly `loading="eager"` for LCP. ✅

---

## Summary

| ID    | Type   | Status  |
|-------|--------|---------|
| BUG-1 | Correctness | ✅ Fixed |
| BUG-2 | Correctness | ✅ Fixed |
| BUG-3 | Correctness | ✅ Fixed |
| MIN-1 | Robustness  | ✅ Fixed |
| MIN-2 | Cleanup     | ✅ Fixed |
| A11Y-1| a11y        | ✅ Fixed (this pass) |
| A11Y-2| a11y        | ✅ Fixed (this pass) |
| OPT-1 | Perf        | ✅ Fixed |
| OPT-3 | UX          | ✅ Fixed |
| OPT-4 | Perf        | ✅ Fixed |
| OPT-2 | Perf        | ✅ Fixed (this pass) |

**No open bugs. No open optimizations. No security issues. No build warnings.** Every item from every pass is resolved and the production build is clean.
