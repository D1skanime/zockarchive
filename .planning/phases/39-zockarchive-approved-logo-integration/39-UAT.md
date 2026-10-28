# Phase 39 Human UAT

## URLs

- `http://<ZA-host>/login`
- `http://<ZA-host>/` after login
- `http://<storybook-host>/?path=/story/marke-za-hintergrund--glasreflexion-blue&args=forceMotion:true`

## Checklist

1. In dark and light themes, inspect the login wordmark and blue archive
   backdrop. Forms, warnings/errors and keyboard focus must remain legible.
2. On a wide authenticated viewport, inspect header wordmark plus gamepad
   mark. At 320px, inspect mark-only navigation and activate Home with keyboard
   and touch.
3. Reload once and inspect browser tab favicon. Install the PWA where supported
   and inspect the device/app icon.
4. In Storybook, evaluate the final Glasreflexion B background in both themes,
   including the adjacent static reduced-motion fallback.
5. Set `Animation erzwingen` while OS reduced motion is active, then try
   `Animationsgeschwindigkeit` from 0,5× through 2×. Confirm the static
   fallback remains still. These preview controls do not change application
   settings. A real controller test is optional and must be recorded separately.
