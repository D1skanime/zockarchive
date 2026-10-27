# Phase 39 Human UAT

## URLs

- `http://<ZA-host>/login`
- `http://<ZA-host>/` after login
- `http://<storybook-host>/?path=/story/brand-animation-proposals--review-variants`

## Checklist

1. In dark and light themes, inspect the login wordmark and blue archive
   backdrop. Forms, warnings/errors and keyboard focus must remain legible.
2. On a wide authenticated viewport, inspect header wordmark plus gamepad
   mark. At 320px, inspect mark-only navigation and activate Home with keyboard
   and touch.
3. Reload once and inspect browser tab favicon. Install the PWA where supported
   and inspect the device/app icon.
4. In the Storybook preview, compare the recommended static archive backdrop,
   optional WebM gamepad drift and optional static shell wash. Choose whether
   any optional variant should become future product behavior.
5. Enable OS or application reduced motion and confirm the preview uses static
   media. A real controller test is optional and must be recorded separately.
