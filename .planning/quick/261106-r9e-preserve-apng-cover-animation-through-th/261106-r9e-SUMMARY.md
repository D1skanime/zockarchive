---
quick_id: 261106-r9e
status: complete
date: 2026-11-06
---

# APNG cover preservation

The metadata-dialog cover downloader now preserves a source PNG whenever
Pillow reports animation, instead of flattening it through `Image.copy()`.
GIF/WebP raw preservation remains unchanged. Manual owned-media upload already
validates and writes GIF, PNG and WebP source bytes unchanged.

`trunk check backend/handler/filesystem/resource_download.py` passed. No test
suite was run during active UAT. Existing static ROM29 derivatives cannot gain
their missing frames retrospectively; the human must apply a reliable animated
source again after the deployed correction.
