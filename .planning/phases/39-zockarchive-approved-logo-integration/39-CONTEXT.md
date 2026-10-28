# Phase 39: ZockArchive approved logo integration - Context

**Gathered:** 2026-10-27
**Status:** Ready for planning
**Mode:** Autonomous, decisions supplied in job 261027-0277

## Phase boundary

Integrate the approved ZockArchive identity package in active v2 branding and
browser install surfaces. Replace the purple-first visual language with the
approved glass-blue direction through the existing semantic token owner. Keep
Phase 38's installed storage, authentication, API, upstream-history and
read-only archive boundaries unchanged.

## Locked decisions

- `ProjectBrand` remains the sole in-app identity owner. It renders the supplied
  wordmark in the header and authentication card, with truthful alternative
  text and decorative treatment only when the enclosing link labels it.
- The supplied favicon, Apple touch and Android icons replace their matching
  public files. The manifest remains the PWA owner and refers only to the
  matching approved Android assets.
- The existing v2 token source, `src/v2/tokens/index.ts`, owns the glass-blue
  direction. No component-level color literals or parallel theme pipeline may
  be added. Dark and light values must preserve legibility and status/focus
  semantics.
- Glasreflexion B is the selected product background. Its decorative CSS layers
  are inaccessible to assistive technology, performance-bounded and have
  reduced-motion/static fallbacks.

## Builder assumptions

- Use the supplied SVGs as externally loaded image assets after validating
  they contain no executable or remote content. Do not inline or recolor them.
- Do not use the supplied WebM or overlay image as a runtime background. The
  final background is a token-driven CSS treatment with no media decode cost.
- Adopt the Team4s reference as token semantics: translucent glass surfaces,
  blue primary tint, subtle borders and blur. Translate values for the
  established ZA dark/light palettes instead of copying feature CSS.

## 2026-10-28 final background decision

- The human selected Glasreflexion B as the product background. All alternative
  proposal code, stories, tests and documentation are removed.
- `AppShell/BackgroundArt.vue` remains the owner for selected-cover cross-fades
  and uses the shared token-driven ZA glass fallback when no cover is selected.
  Login and device-pair shells use the same background utility.
- The cyan and light-cyan bands animate only with compositor opacity and
  transforms. Only the ZA reduced-motion setting freezes them in place;
  `prefers-reduced-motion` remains available to all unrelated components.
  Storybook retains one German final-background story with ZA reduced-motion
  and speed controls.
