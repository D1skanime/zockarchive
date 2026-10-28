# Phase 39 Plan 01 Summary

## Delivered

- Integrated approved wordmark and gamepad-mark assets through the shared
  `ProjectBrand` owner for header, auth and about surfaces.
- Replaced favicon, Apple touch and Android PWA icons, while preserving the
  supplied archive and provenance in the phase assets directory.
- Migrated v2 brand and shared glass semantic tokens from purple to blue,
  retaining independent warning, error and focus semantic tokens.
- Selected Glasreflexion B after UAT and made it the shared CSS-only production
  backdrop for the application fallback, login and device-pair shells. The
  retired RomM SVG/PNG backgrounds and all unselected variants are removed.
- Retained one Storybook final-background story with dark/light animated and
  static fallback frames plus German review controls for forced motion and
  0,5×–2× speed.
- Updated frontend architecture documentation and focused identity tests.
- Split palette ownership into `tokens/colors.ts` after the deterministic
  size gate identified the public token entry point as oversized; its existing
  exports and generated CSS contract remain unchanged.
- Updated both brand E2E specs from removed text nodes to the approved image
  selectors, including their `alt` and public asset-path contracts.
- Replaced the large embedded-PNG SVG exports on persistent identity surfaces
  with checked-in, viewport-sized WebP derivatives made from the approved PNG
  assets. The header now requests 14,192 bytes of logo media instead of 953,360.
- Made `site.webmanifest` the only install-manifest owner. VitePWA continues
  generating the service worker but no longer injects a second manifest; the
  rebuilt ICO packages the approved 16px and 32px favicon PNGs.

## Validation

- `npm run build:tokens` passed.
- `npm run typecheck` passed.
- Focused `ProjectBrand.test.ts`: 10 tests passed.
- Temporary-output Vite production build passed. The normal `dist/` target is
  owned by `nobody:nogroup` and not writable in this checkout.
- `trunk fmt && trunk check` passed for 22 modified files.
- The isolated Chromium preview ran all four `project-brand.spec.ts` cases
  successfully in both themes after the image assertions were added.
- The full Vitest run aborts before suite reporting with `ECONNRESET`; this
  was reproduced with one worker and no tests were changed or disabled.
- Final-background focused tests cover the single Storybook export, preview
  controls, static fallback and the `BackgroundArt` fallback/cover boundary.

## Human follow-up

Browser UAT remains required because Playwright's configured Chromium binary
is unavailable in this execution environment. See `39-UAT.md`.
