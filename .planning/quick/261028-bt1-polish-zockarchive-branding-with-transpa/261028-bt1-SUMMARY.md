---
id: 261028-bt1
status: complete
---
# Transparent ZockArchive overlays

Implemented in 649c44c6e on codex/transparent-brand-overlay.
Depends on pending Phase 39 branch ki/za-261027-0277 (4989ef61d).
The new branch was created from origin/main and fast-forwarded to that
existing dependency; no main merge, deployment or KI state change was performed.

## Result
- True-alpha transparent artwork, preserving the metallic blue identity.
- One navigation emblem with readable native theme-colored product text.
- Compact navigation hides text; auth/about retain the full transparent logo.
- Original artwork remains preserved; runtime WebP files stay small.
- User-selected backgrounds and theme preferences remain intact.
- Updated architecture, component tests and both brand browser suites.

## Validation
- Typecheck passed.
- All 152 frontend test files passed, 1707 tests.
- Six isolated built-output Chromium tests passed: dark/light, 320 through
  3840px, mouse/touch/keyboard and synthetic gamepad, auth/about and navigation.
- Browser canvas decoding verifies alpha on all three runtime assets.
- Production build passed (existing CSS/dependency warnings remain).
- Targeted ESLint passed; commit hook formatted/rechecked all ten changed files,
  with no issues.
- Screenshots inspected for both themes. Browser evidence:
  /tmp/za-transparent-brand-browser
- Physical controller and populated live-service UAT were not performed.
  Static preview uses existing API fixtures and does not access NAS data.

## Asset provenance
Built-in image_gen, background-extraction, based on existing overlay.png.
Full overlay saved as frontend/public/assets/zockarchive/overlay-transparent.png.
Icon saved as frontend/public/assets/zockarchive/mark-transparent.png.
Runtime derivatives retain alpha, resized with the existing Pillow environment.
Overlay prompt: preserve exact metallic electric-blue/cyan ZA gamepad emblem and
ZockArchive wording and arrangement; remove black/navy rectangle, floor/reflection
and tiny tagline; true transparent negative space; crisp edges and subtle glow.
Icon prompt: keep only the same ZA gamepad emblem, remove all text; transparent
background without floor/reflection; preserve geometry and metallic blue finish.

## Approved size and internal transparency refinement

The navigation emblem is 128 by 88 px, twice the previous 64 by 44 px. The shared navigation-height token is 104 px so fixed-header offsets and content remain aligned. Medium desktops show the emblem without the native name to preserve the centered navigation pill. Updated transparent masters remove the dark internal backing as well as the exterior background; the navigation derivative is 256 px wide for high-density displays. Browser checks enforce the doubled dimensions, header containment, responsive navigation separation and a negligible opaque-dark pixel fraction.

Validation: typecheck passed; 152 test files and 1,707 tests passed; production build passed; all six Chromium brand checks passed in light/dark themes, 320 px through 4K, including synthetic controller input and internal transparency. Browser screenshots were inspected in both themes. Physical-controller UAT remains manual.
