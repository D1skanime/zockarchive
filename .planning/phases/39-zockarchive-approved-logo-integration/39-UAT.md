# Phase 39 Human UAT

## URLs

- `http://<ZA-host>/login`
- `http://<ZA-host>/` after login
- `http://<storybook-host>/?path=/story/brand-za-background-proposals--compare-variants`

## Checklist

1. In dark and light themes, inspect the login wordmark and blue archive
   backdrop. Forms, warnings/errors and keyboard focus must remain legible.
2. On a wide authenticated viewport, inspect header wordmark plus gamepad
   mark. At 320px, inspect mark-only navigation and activate Home with keyboard
   and touch.
3. Reload once and inspect browser tab favicon. Install the PWA where supported
   and inspect the device/app icon.
4. In the Storybook comparison, evaluate Azure drift, Archive current and
   Glass refraction in both themes. Azure drift is a recommendation only;
   choose whether any proposal should become future product behavior.
5. Confirm every proposal has a visible static fallback and respects OS or
   application reduced motion. A real controller test is optional and must be
   recorded separately.
