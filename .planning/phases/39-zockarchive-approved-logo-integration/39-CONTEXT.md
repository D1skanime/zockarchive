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
- Animation is intentionally not selected as a product default. The build
  must expose reviewable, optional proposals with a recommendation. Decorative
  media is muted, inaccessible to assistive technology, performance-bounded,
  and has reduced-motion/static fallbacks.

## Builder assumptions

- Use the supplied SVGs as externally loaded image assets after validating
  they contain no executable or remote content. Do not inline or recolor them.
- Use `za-overlay.png` as the static fallback for the recommended login
  proposal. Keep `za-animated.webm` available as an opt-in preview only,
  rather than making it a permanent animated page backdrop.
- Adopt the Team4s reference as token semantics: translucent glass surfaces,
  blue primary tint, subtle borders and blur. Translate values for the
  established ZA dark/light palettes instead of copying feature CSS.

## Deferred product decision

Human UAT chooses whether either animation proposal graduates from preview to
default product behavior. This phase recommends static, subtle blue archive
backdrop as the safe default and does not claim animation approval.

## 2026-10-28 UAT replacement proposals

- The active inherited owner is `AppShell/BackgroundArt.vue`, with global
  `.r-v2-bg__layer` fallback art from `assets/auth_background.svg`. It remains
  unchanged until a product decision.
- The earlier asset-preview story is replaced by three ZA-specific, CSS-only
  review variants: Azure drift, Archive current and Glass refraction.
- Each proposal renders both themes beside a static reduced-motion fallback.
  Azure drift is the builder recommendation only, not a selected default.
