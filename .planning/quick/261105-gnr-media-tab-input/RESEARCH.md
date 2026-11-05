---
quick_id: 261105-gnr
status: complete
---

# Research

The background and dropzone overlays already explicitly use `pointer-events:
none`, so they are not the common blocker. The shared sticky upload class
(`mediaManagementUpload.css`) has `z-index: 2`. The main and DLC detail
layouts share a post-navigation scrolling panel without an isolated stacking
context. The correction therefore belongs at the layout boundary, not in an
individual uploader or media action.
