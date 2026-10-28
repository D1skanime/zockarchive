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

1. **Recommended, Azure drift:** blue gradient orbs drift slowly behind a
   quiet glass wash. It is the builder recommendation only, not a product
   selection.
2. **Archive current:** a restrained archive-card grid pans beneath a blue
   haze, communicating the library context without using the approved logo.
3. **Glass refraction:** low-intensity diagonal light bands move across a blue
   field, giving the least literal direction.

The delivered Storybook preview labels these as proposals and makes each
variant inspectable without persisting a user preference.

## Responsive and accessibility contract

- Wide header: full wordmark. Narrow header: mark-only, with the enclosing
  home link retaining its localized accessible name.
- Authentication imagery is `aria-hidden`, has no focus stop and cannot play
  audio.
- Focus rings follow the current modality system. Existing product controls
  retain keyboard, touch and gamepad behavior without a new interaction owner.
- Reduced motion always stops the CSS animation and leaves each proposal as a
  static token-driven backdrop.
