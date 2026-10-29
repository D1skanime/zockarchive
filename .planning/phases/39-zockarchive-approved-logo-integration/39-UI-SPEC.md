# Phase 39 UI Design Contract

## Identity

The approved wordmark replaces text-built branding at the two active entry
points: full header identity and authentication hero. The compact gamepad mark
is used where the navigation collapses. Image `alt` text is `ZockArchive`
unless the image is within an already labelled home link, in which case it is
decorative to avoid duplicate announcements.

## Glass-blue language

Dark mode uses translucent white glass, strong but not opaque borders, a blue
brand primary and a restrained blue wash. Light mode uses a soft blue-white
canvas, white translucent surfaces and dark blue readable brand text. Warning,
danger and focus values retain their semantic owners. Background blur is
static and transitions opacity only.

## Final background

Glasreflexion B is the selected product background. Token-driven cyan bands
with a sparing light-cyan glow cross the blue glass field over nine and eleven
seconds. The existing `BackgroundArt` owner applies it only when no game cover
is selected, preserving cover-art cross-fades. Login and pair shells consume
the same shared CSS utility. Storybook retains one final-background story with
German `ZA-Reduzierte Bewegung` and `Animationsgeschwindigkeit` controls from
0,5× to 2×; neither persists a preference.

## Responsive and accessibility contract

- Wide header: full wordmark. Narrow header: mark-only, with the enclosing
  home link retaining its localized accessible name.
- Authentication imagery is `aria-hidden`, has no focus stop and cannot play
  audio.
- Focus rings follow the current modality system. Existing product controls
  retain keyboard, touch and gamepad behavior without a new interaction owner.
- The ZA reduced-motion setting stops the CSS animation and leaves the final
  token-driven backdrop static. The background intentionally ignores the
  operating system's `prefers-reduced-motion` preference.
