---
status: human_needed
phase: 39
verified: 2026-10-28
---

# Phase 39 Verification

## Automated evidence

- Approved source archive SHA-256 and SVG/XML/resource checks passed.
- Token generation, TypeScript typecheck, focused identity tests, temporary
  production build and changed-file Trunk formatting/checks passed.
- The dedicated static Chromium preview passed all four `project-brand.spec.ts`
  cases after both brand E2E specs were updated to assert logo image selectors,
  accessible names and public asset paths instead of removed text markup.
- `ProjectBrand` unit tests assert the compact header and larger auth WebP asset
  routes, which prevents returning to the large source SVG exports.
- The emitted-manifest contract checks one `site.webmanifest` link, no VitePWA
  manifest file, the approved Android icon list and the blue token colors.
- Focused final-background tests cover the sole Storybook story, explicit
  static fallback, preview-only forced motion, its speed value and the
  `BackgroundArt` fallback-versus-selected-cover boundary.
- Storybook builds successfully when its cache and output are placed in a
  temporary writable directory. The checkout's pre-existing
  `node_modules/.cache/storybook` is not writable, so its default cache path
  cannot be used in this environment.
- Full Vitest is inconclusive: it aborts with `ECONNRESET` before reporting
  test results, including at one worker.

## Human verification required

1. At `/login`, verify the approved wordmark, animated Glasreflexion B
   backdrop, readable form controls and both light/dark theme behavior.
2. At a wide authenticated route, verify header wordmark plus gamepad mark;
   at 320px verify mark-only navigation and its accessible Home control.
3. Confirm tab favicon and installed PWA icon use the supplied gamepad mark.
4. In Storybook, open
   `http://localhost:6006/?path=/story/marke-za-hintergrund--glasreflexion-blue&args=reducedMotion:false`.
   Inspect animated and static dark/light frames. The animated frame must keep
   moving while an OS reduced-motion preference is active. Toggle
   `ZA-Reduzierte Bewegung` and move `Animationsgeschwindigkeit` between 0,5×
   and 2×. Confirm the static fallback remains still. The control is review-only
   and does not alter app settings.
5. Exercise keyboard and touch navigation. Do not claim physical gamepad
   validation unless a real controller is used.

## Scope preservation

No API, auth, storage, database, Docker, NAS/media or Team4s mutation occurred.
