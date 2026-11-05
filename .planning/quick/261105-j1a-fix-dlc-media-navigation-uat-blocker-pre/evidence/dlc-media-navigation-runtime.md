# DLC Media Navigation Runtime Evidence

**Captured:** 2026-11-05
**Target:** authenticated ZA UAT instance, identified through the supplied
runtime-only login configuration. No credentials, tokens, host URL, request
bodies, uploads, placement changes, deletions, or cover changes were recorded.

## Before the correction

At 1440 px, Playwright opened the productive DLC overview, clicked **Media**,
and observed the Media URL query and mounted panel. The Media tab's center hit
target was inside the tab and its `pointer-events` value was `auto`; this ruled
out the earlier sticky-toolbar overlay hypothesis.

Once the image gallery mounted, the browser reported
`ResizeObserver.observe: parameter 1 is not of type Element`. The DLC gallery
used `ref="gallery"` inside a `v-for`; Vue resolves such string refs as an
array while `useResponsiveColumns` requires one `HTMLElement`. The resulting
observer exception matched the blocked post-Media interaction. The isolated
fixture then also reproduced a query race: after the Media subtab wrote its
query, clicking the next primary tab could return to `tab=overview`.

## After the correction

`setGallery` now admits only an `HTMLElement` to the responsive-columns
composable. `usePcDlcPrimaryTabSync` serializes the selected primary tab until
its router replacement commits, preventing a stale subtab route write from
restoring the prior primary tab. The primary overflow-menu entries now call
that same selection path; a cancelled router replacement clears its pending
selection instead of rescheduling indefinitely.

An authenticated, non-mutating post-fix browser proof clicked Media, then
Overview, Game downloads, Files, and Notes at 1440 px and 390 px. At each
viewport every selected primary tab had a center hit target inside the control,
`pointer-events: auto`, and the expected `tab` query after the real click.
Both post-fix runs recorded no page errors. The final mobile run recorded no
failed requests; an earlier desktop diagnostic saw only an unrelated missing
platform SVG request.

The isolated browser regression repeats the direct flow at both widths and,
in addition, selects **Actions → Artwork**. It asserts the real center hit
target, `pointer-events`, resulting URL, selected state, and focus for every
primary tab.
