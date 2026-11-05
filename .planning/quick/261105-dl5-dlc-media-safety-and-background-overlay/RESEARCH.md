# Focused Research

- `store_pc_component_upload` used a deterministic component/role filename while gallery and screenshot rows intentionally retain multiple records. Audio and manual siblings already use a random token.
- `BackgroundArt` already receives both cross-fade layers and the active layer. Selecting overlay treatment from the active layer fixes fallback bleed without changing transition or reduced-motion behavior.
- DLC manual storage and routes are independent data contracts. Removing only the navigation entry preserves existing data and API compatibility.
