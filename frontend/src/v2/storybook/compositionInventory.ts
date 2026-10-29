/**
 * Single source of truth for Storybook's reusable-component declarations.
 * Keys are story-module paths relative to `src/v2`, so the catalog checker
 * can compare the emitted docs metadata without maintaining a second list.
 */
export const primitiveDocs = (component: string): string =>
  `grundelemente-grundbaustein-${component.toLowerCase()}--docs`;

export type CompositionRecord = {
  /** Direct reusable primitives, never transitive implementation details. */
  primitives: readonly string[];
};

export const compositionInventory = {
  "components/GameCard/GameCard.stories.ts": {
    primitives: ["RBtn", "RCheckbox", "RPlatformIcon", "RTooltip"],
  },
  "components/Player/AssetCard.stories.ts": { primitives: ["RCard", "RTag"] },
  "components/Player/AssetPreview.stories.ts": { primitives: ["RBtn", "RImg"] },
  "components/Player/ResumePanel.stories.ts": { primitives: ["RBtn", "RCard"] },
  "components/shared/AssetList.stories.ts": {
    primitives: ["RList", "RListItem"],
  },
  "components/shared/AssetStrip.stories.ts": { primitives: ["RBtn", "RCard"] },
  "lib/data/RTable/RTable.stories.ts": {
    primitives: ["RIcon", "RSkeletonBlock"],
  },
  "lib/forms/RCheckbox/RCheckbox.stories.ts": { primitives: ["RIcon"] },
  "lib/forms/RComboboxField/RComboboxField.stories.ts": {
    primitives: ["RIcon", "RTag"],
  },
  "lib/forms/RDateField/RDateField.stories.ts": {
    primitives: ["RBtn", "RIcon", "RTextField"],
  },
  "lib/forms/RDropzone/RDropzone.stories.ts": { primitives: ["RIcon"] },
  "lib/forms/RRating/RRating.stories.ts": { primitives: ["RIcon"] },
  "lib/forms/RSelect/RSelect.stories.ts": {
    primitives: [
      "RDivider",
      "RForm",
      "RIcon",
      "RProgressCircular",
      "RTag",
      "RTextField",
    ],
  },
  "lib/forms/RTextField/RTextField.stories.ts": {
    primitives: ["RForm", "RIcon", "RProgressCircular", "RTooltip"],
  },
  "lib/media/RPlatformIcon/RPlatformIcon.stories.ts": {
    primitives: ["RTooltip"],
  },
  "lib/menus/RMenu/RMenu.stories.ts": {
    primitives: ["RDialog", "RIcon", "RTextField"],
  },
  "lib/overlays/RCarousel/RCarousel.stories.ts": {
    primitives: ["RBtn", "RIcon"],
  },
  "lib/overlays/RDialog/RDialog.stories.ts": {
    primitives: ["RBtn", "RIcon", "RDivider"],
  },
  "lib/overlays/RDrawer/RDrawer.stories.ts": {
    primitives: ["RBtn", "RIcon", "RDivider"],
  },
  "lib/primitives/RAlert/RAlert.stories.ts": { primitives: ["RBtn", "RIcon"] },
  "lib/primitives/RAvatar/RAvatar.stories.ts": { primitives: ["RIcon"] },
  "lib/primitives/RBadge/RBadge.stories.ts": { primitives: ["RIcon"] },
  "lib/primitives/RBtn/RBtn.stories.ts": {
    primitives: ["RIcon", "RProgressCircular", "RTooltip"],
  },
  "lib/primitives/RChip/RChip.stories.ts": { primitives: ["RIcon"] },
  "lib/primitives/REmptyState/REmptyState.stories.ts": {
    primitives: ["RIcon"],
  },
  "lib/primitives/RSliderBtnGroup/RSliderBtnGroup.stories.ts": {
    primitives: ["RBtn", "RIcon", "RTooltip"],
  },
  "lib/primitives/RSpinner/RSpinner.stories.ts": {
    primitives: ["RProgressCircular"],
  },
  "lib/primitives/RTabNav/RTabNav.stories.ts": {
    primitives: ["RIcon", "RImg"],
  },
  "lib/primitives/RTag/RTag.stories.ts": { primitives: ["RIcon"] },
  "lib/structural/RCollapsible/RCollapsible.stories.ts": {
    primitives: ["RIcon"],
  },
  "lib/structural/RListItem/RListItem.stories.ts": {
    primitives: ["RAvatar", "RIcon"],
  },
  "lib/structural/RTooltip/RTooltip.stories.ts": { primitives: ["RIcon"] },
  "InUse.stories.ts": {
    primitives: [
      "RAlert",
      "RBtn",
      "RDialog",
      "RDivider",
      "RDrawer",
      "RForm",
      "RTextField",
    ],
  },
} as const satisfies Record<string, CompositionRecord>;

export type CompositeStoryPath = keyof typeof compositionInventory;

export function compositionDescription(path: CompositeStoryPath): string {
  const { primitives } = compositionInventory[path];
  return `Besteht aus: ${primitives
    .map(
      (primitive) => `[${primitive}](?path=/docs/${primitiveDocs(primitive)})`,
    )
    .join(", ")}`;
}

export function compositionParameters(path: CompositeStoryPath) {
  return { docs: { description: { component: compositionDescription(path) } } };
}

/** Phase 39's approved hierarchy is intentionally outside the new taxonomy. */
export const phase39BrandDocsId = "marke-za-hintergrund-glasreflexion-b--docs";
