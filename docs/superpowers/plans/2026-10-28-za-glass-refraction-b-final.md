# ZA Glass Refraction B Finalization

## Decision

Human UAT selected Glasreflexion B. All other Phase 39 background proposals
are removed instead of remaining as dormant alternatives.

## Implementation

1. Keep `AppShell/BackgroundArt.vue` as the selected-cover cross-fade owner.
   Apply the shared CSS fallback only to layers without a selected cover.
2. Define the approved logo-blue palette in the existing v2 token source and
   render cyan and light-cyan bands through `r-v2-za-glass-background`.
3. Apply that utility to app fallback, login and pair shells; use only
   transform and opacity animation, and freeze it for both reduced-motion
   mechanisms.
4. Retain one German Storybook story with animated and static dark/light
   previews plus review-only force-motion and speed controls.
5. Remove inherited RomM SVG background assets after proving no source still
   references them, then update architecture, Phase 39 and UAT documentation.

## Verification

- Focused tests cover the final-only Storybook export, preview controls and
  fallback-versus-selected-cover behavior in `BackgroundArt`.
- Token generation, typecheck, test suite, production build and changed-file
  lint are run before commit.
