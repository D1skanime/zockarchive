# Phase 39 Human UAT

## URLs

- `http://<ZA-host>/login`
- `http://<ZA-host>/` after login
- `http://<storybook-host>/?path=/story/marke-za-hintergrundvorschl%C3%A4ge--compare-variants`

## Checklist

1. In dark and light themes, inspect the login wordmark and blue archive
   backdrop. Forms, warnings/errors and keyboard focus must remain legible.
2. On a wide authenticated viewport, inspect header wordmark plus gamepad
   mark. At 320px, inspect mark-only navigation and activate Home with keyboard
   and touch.
3. Reload once and inspect browser tab favicon. Install the PWA where supported
   and inspect the device/app icon.
4. In the Storybook comparison, evaluate Azurdrift, ZA-Gamepad-Strömung and
   Glasreflexion beside the fourth current-RomM tile in both themes. Azurdrift
   is a recommendation only; choose whether any ZA proposal should become
   future product behavior.
5. Set `Animation erzwingen` while OS reduced motion is active, then try
   `Animationsgeschwindigkeit` from 0,5× through 2×. Confirm each static
   fallback remains still. These preview controls must not change the active
   application background. A real controller test is optional and must be
   recorded separately.
