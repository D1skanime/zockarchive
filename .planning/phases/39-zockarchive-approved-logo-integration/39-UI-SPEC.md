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

1. **Recommended, Azurdrift:** visible blue gradient orbs cross a quiet glass
   wash over nine and twelve seconds. It is the builder recommendation only,
   not a product selection.
2. **ZA-Gamepad-Strömung:** the unchanged transparent gamepad monogram drifts
   diagonally under a light-blue glass haze over seven and ten seconds.
3. **Glasreflexion:** higher-contrast diagonal glass-light bands cross the
   blue field over eight and eleven seconds.
4. **Current RomM background:** the inherited runtime animation appears only
   as a fourth comparison tile, never as a ZA selection proposal.

The delivered Storybook preview labels these as proposals and makes each
variant inspectable without persisting a user preference. Its German
`Animation erzwingen` control overrides OS reduced motion only for animated
preview frames, and `Animationsgeschwindigkeit` ranges from 0,5× to 2×.

## Responsive and accessibility contract

- Wide header: full wordmark. Narrow header: mark-only, with the enclosing
  home link retaining its localized accessible name.
- Authentication imagery is `aria-hidden`, has no focus stop and cannot play
  audio.
- Focus rings follow the current modality system. Existing product controls
  retain keyboard, touch and gamepad behavior without a new interaction owner.
- Reduced motion always stops the CSS animation and leaves each proposal as a
  static token-driven backdrop. An explicitly static preview stays static even
  when Storybook forces motion for the adjacent animated preview.
