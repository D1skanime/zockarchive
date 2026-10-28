# ZA Background Variant Review Design

## Intent

Provide a visual, non-production selection aid for the deferred Phase 39
background decision. The human needs to compare three ZA-specific, glass-blue
motion directions without changing the current application backdrop.

## Goals

- Document the existing RomM owner: `BackgroundArt.vue` renders two
  `.r-v2-bg__layer` elements and `global.css` supplies the animated
  `assets/auth_background.svg` fallback.
- Present three clearly distinct ZA variants in Storybook, each in light and
  dark themes and with a static reduced-motion fallback.
- Keep the proposal CSS-only, decorative, muted, pointer-inert and bounded to
  compositor-friendly opacity and transform animation.

## Non-goals

- Do not replace the active `BackgroundArt` fallback or login background.
- Do not select or ship a product-default variant.
- Do not modify the transparent ZA gamepad-monogram artwork.
- Do not add video assets, canvas rendering or runtime configuration.

## Approaches

1. Reuse the supplied WebM preview. It is not an own ZA visual direction and
   creates a media decode cost, so it does not meet this review request.
2. Generate raster or video alternatives. They would add asset weight and
   require a new media pipeline, which is unnecessary for review-only
   backgrounds.
3. Use one shared CSS-only proposal component with token-driven layers. This
   keeps all colors in the existing theme owner, has no network media cost, and
   can freeze each variant through a single reduced-motion prop. This is the
   selected builder approach.

## Variant contract

- **Azure drift:** large, low-contrast blue gradient orbs move slowly.
- **Archive current:** a restrained archive-card grid pans horizontally behind
  glass haze.
- **Glass refraction:** wide glass-light bands sweep diagonally at the lowest
  opacity.
- Each variant is `aria-hidden`, accepts `reducedMotion`, and carries a stable
  variant data attribute for tests and Storybook comparison.
- Individual stories expose every variant. A comparison story renders all
  three together, with recommendation text that does not imply approval.

## Builder assumptions

The existing Phase 39 autonomous instruction supersedes an approval checkpoint.
The recommended direction is Azure drift because it communicates the blue
glass language without adding a recognizable motif behind authentication or
content. It remains a recommendation only.
