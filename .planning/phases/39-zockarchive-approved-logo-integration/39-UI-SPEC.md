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

## Animation proposals for UAT

1. **Recommended, static blue archive backdrop:** the approved `za-overlay`
   creates a low-contrast login backdrop. It has no motion and is suitable for
   all devices.
2. **Optional gamepad-mark drift:** the supplied WebM loops muted behind the
   login card at reduced opacity. It is hidden when the user or OS requests
   reduced motion and swaps to the static overlay.
3. **Optional shell archive wash:** the static overlay enriches the existing
   BackgroundArt fallback only. It does not replace game cover art and uses no
   continuous animation.

The delivered Storybook preview labels these as proposals and makes each
variant inspectable without persisting a user preference.

## Responsive and accessibility contract

- Wide header: full wordmark. Narrow header: mark-only, with the enclosing
  home link retaining its localized accessible name.
- Authentication imagery is `aria-hidden`, has no focus stop and cannot play
  audio.
- Focus rings follow the current modality system. Existing product controls
  retain keyboard, touch and gamepad behavior without a new interaction owner.
- Reduced motion always selects the static fallback and stops video decoding.
