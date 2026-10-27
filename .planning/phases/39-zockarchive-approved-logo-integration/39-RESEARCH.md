# Phase 39 Research

## Existing ownership

- `frontend/src/v2/components/shared/ProjectBrand.vue` is consumed by AppNav
  and AuthCard, making it the single identity integration point.
- `frontend/src/v2/tokens/index.ts` generates `styles/tokens.css`; the v2
  theming policy prohibits color literals outside those generated/source files.
- `frontend/src/v2/layouts/AuthLayout.vue` owns authentication background
  media and already establishes responsive and input-modality mirrors.
- `frontend/public/site.webmanifest` and `frontend/index.html` own install
  icon, favicon, Apple touch and browser chrome declarations.
- `useReducedMotion` already mirrors a class onto `<html>` and global CSS uses
  it to reduce background motion and GPU work.

## Asset validation

- Archive SHA-256 is `346853cbbcfe198c2b762779a3cf470228ea512e84219ce99e6370e2317aab08`.
- Both supplied SVGs parse as XML and contain no scripts, event handlers,
  foreign objects or external resource attributes. Their `http://` namespace
  declarations are XML namespace metadata, not remote loads.
- The supplied PNGs match their names: favicons 16 and 32 px, Apple 180 px,
  Android 192 and 512 px, mark 382x352 px, and wordmark/overlay 750x510 px.
- The supplied WebM is 68,203 bytes. It is kept decorative and never given
  audio controls or an assistive-technology name.

## Compatibility findings

The change is frontend-only. It requires no backend/schema/API/storage/auth
changes and does not interact with external library media or Docker state.
