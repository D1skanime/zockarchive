# ZA Background Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add review-only, token-driven ZA background motion variants to Storybook without changing the active background.

**Architecture:** A shared Vue component exposes a closed variant union, a reduced-motion fallback and Storybook-only motion controls. Its scoped CSS draws decorative layers from existing v2 tokens and reuses the unchanged transparent gamepad asset only as a pattern. A Storybook module provides three individual ZA proposals, the inherited RomM comparison and a four-tile comparison view.

**Tech Stack:** Vue 3, TypeScript, scoped CSS, Storybook, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-28-za-background-variants-design.md`

## Global Constraints

- Preserve the existing RomM `BackgroundArt` runtime owner and current login backdrop.
- Preserve the transparent ZA gamepad monogram unchanged.
- Use v2 theme tokens only, no CSS color literals.
- Keep motion decorative, `aria-hidden`, transform/opacity-only and static when reduced motion is requested.
- Keep all new production files below 500 logical lines.

## Review Focus

- An unknown variant must be impossible in TypeScript through the closed union.
- Reduced motion must remove all infinite animation, not merely make it faster.
- Every variant must be distinguishable by both its class and explanatory copy.
- Comparison must not state that a product selection has been made.
- Both Storybook theme decorators must preserve legible token-driven surfaces.

---

### Task 1: Shared review component and tests

**Files:**

- Create: `frontend/src/v2/components/shared/BrandBackgroundVariant.vue`
- Create: `frontend/src/v2/components/shared/BrandBackgroundVariant.test.ts`

**Interfaces:**

- Produces `BrandBackgroundVariant` with `variant: "azure-drift" | "archive-current" | "glass-refraction" | "romm-current"`, a static `reducedMotion?: boolean` fallback, plus review-only `forceMotion?: boolean` and `motionSpeed?: number` props.

- [ ] **Step 1: Write failing component tests**

Assert the variant data attribute, decorative accessibility contract and static reduced-motion class.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm run test -- --run src/v2/components/shared/BrandBackgroundVariant.test.ts`

- [ ] **Step 3: Implement the component**

Use token-backed pseudo-elements and variant classes. The `reducedMotion` class disables animation.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm run test -- --run src/v2/components/shared/BrandBackgroundVariant.test.ts`

### Task 2: Storybook selection surface and documentation

**Files:**

- Modify: `frontend/src/v2/components/shared/BrandMotionPreview.stories.ts`
- Modify: `frontend/src/v2/components/shared/BrandMotionPreview.stories.css`
- Modify: `docs/FRONTEND_ARCHITECTURE.md`
- Modify: `.planning/phases/39-zockarchive-approved-logo-integration/39-CONTEXT.md`

**Interfaces:**

- Consumes `BrandBackgroundVariant` from Task 1.
- Produces individual dark/light review stories, a current-RomM comparison and a comparison story with German `Animation erzwingen` and `Animationsgeschwindigkeit` controls.

- [ ] **Step 1: Write a failing story export test**

Assert that the story module exposes three named variants and the comparison view.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm run test -- --run src/v2/components/shared/BrandBackgroundVariant.test.ts`

- [ ] **Step 3: Implement individual and comparison stories**

Render each direction with recommendation and decision status text, including a static reduced-motion demonstration.

- [ ] **Step 4: Update ownership documentation**

Record the existing RomM background owner, the review-only component, and the Storybook route.

- [ ] **Step 5: Run focused tests and Storybook build**

Run: `npm run test -- --run src/v2/components/shared/BrandBackgroundVariant.test.ts && npm run storybook:build`

### Task 3: Verification and commit

- [ ] Run typecheck, test suite, production build, changed-file Trunk checks and visual Storybook browser evidence.
- [ ] Inspect the intended diff and commit with the repository hook enabled.
