---
quick_id: 261119-bpn
title: Clarify the Scan type selector and remove technical copy
status: in_progress
---

# Plan

1. Remove the two technical paragraphs below Scan type without inserting
   replacement copy.
2. Present the existing selector as an outlined control with an explicit
   chevron and feature-scoped focus treatment, retaining its options and
   model binding.
3. Verify dropdown interaction, focus indication, and the scroll separation
   from the existing action area in desktop and mobile browsers. Record the
   result, update state, and commit without a test suite.

# Acceptance criteria

- No technical quick-scan paragraph remains below the selector.
- The selector has a visible boundary, chevron, and focus state.
- Existing scan selection and actions remain usable on desktop and mobile.
