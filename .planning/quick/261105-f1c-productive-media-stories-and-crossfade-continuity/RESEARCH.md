# Focused Research

- `MediaTab.vue` and `PcDlcMediaTab.vue` already own the real vertical `ZATabNav` and mounted panels, so Storybook can render them with synthetic ROM/component data and mocked adapter calls rather than duplicate page markup.
- `BackgroundArt` keeps inactive layers intentionally during cross-fades. Overlay treatment needs matching per-layer opacity transitions, not an immediate active-layer class swap.
- `MediaManagementCard` already exposes its real failed-preview state through an image error event, so a deliberately unavailable synthetic URL can document and test it.
- The main soundtrack placement controls can use `MediaManagementAction`; DLC ordering needs the same component-scoped placement endpoint semantics as its existing toggle/delete actions.
