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
  "components/Settings/SettingsToggleRow.stories.ts": {
    primitives: ["ZASwitch", "ZAIcon"],
  },
  "components/GameDetails/RelatedGamesGrid.stories.ts": {
    primitives: ["ZABtn", "ZAIcon"],
  },
  "components/GameCard/GameCard.stories.ts": {
    primitives: ["ZABtn", "ZACheckbox", "ZAPlatformIcon", "ZATooltip"],
  },
  "components/Player/AssetCard.stories.ts": { primitives: ["ZACard", "ZATag"] },
  "components/Player/AssetPreview.stories.ts": {
    primitives: ["ZABtn", "ZAImg"],
  },
  "components/Player/ResumePanel.stories.ts": {
    primitives: ["ZABtn", "ZACard"],
  },
  "components/GameDetails/PcSaveBackupsSection.stories.ts": {
    primitives: [
      "ZABtn",
      "ZADialog",
      "ZADropzone",
      "ZAProgressLinear",
      "ZASpinner",
      "ZATextField",
    ],
  },
  "components/GameDetails/MediaManagement.stories.ts": {
    primitives: ["ZABtn", "ZACard", "ZADropzone", "ZAIcon"],
  },
  "components/shared/AssetList.stories.ts": {
    primitives: ["ZAList", "ZAListItem"],
  },
  "components/shared/AssetStrip.stories.ts": {
    primitives: ["ZABtn", "ZACard"],
  },
  "lib/data/ZATable/ZATable.stories.ts": {
    primitives: ["ZABtn", "ZAIcon", "ZASkeletonBlock"],
  },
  "lib/forms/ZACheckbox/ZACheckbox.stories.ts": { primitives: ["ZAIcon"] },
  "lib/forms/ZAComboboxField/ZAComboboxField.stories.ts": {
    primitives: ["ZAIcon", "ZATag"],
  },
  "lib/forms/ZADateField/ZADateField.stories.ts": {
    primitives: ["ZABtn", "ZAIcon", "ZATextField"],
  },
  "lib/forms/ZADropzone/ZADropzone.stories.ts": { primitives: ["ZAIcon"] },
  "lib/forms/ZARating/ZARating.stories.ts": { primitives: ["ZAIcon"] },
  "lib/forms/ZASelect/ZASelect.stories.ts": {
    primitives: [
      "ZADivider",
      "ZAForm",
      "ZAIcon",
      "ZAProgressCircular",
      "ZATag",
      "ZATextField",
    ],
  },
  "lib/forms/ZATextField/ZATextField.stories.ts": {
    primitives: ["ZAForm", "ZAIcon", "ZAProgressCircular", "ZATooltip"],
  },
  "lib/media/ZAPlatformIcon/ZAPlatformIcon.stories.ts": {
    primitives: ["ZATooltip"],
  },
  "lib/menus/ZAMenu/ZAMenu.stories.ts": {
    primitives: ["ZADialog", "ZAIcon", "ZATextField"],
  },
  "lib/overlays/ZACarousel/ZACarousel.stories.ts": {
    primitives: ["ZABtn", "ZAIcon"],
  },
  "lib/overlays/ZADialog/ZADialog.stories.ts": {
    primitives: ["ZABtn", "ZAIcon", "ZADivider"],
  },
  "lib/overlays/ZADrawer/ZADrawer.stories.ts": {
    primitives: ["ZABtn", "ZAIcon", "ZADivider"],
  },
  "lib/primitives/ZAAlert/ZAAlert.stories.ts": {
    primitives: ["ZABtn", "ZAIcon"],
  },
  "lib/primitives/ZAAvatar/ZAAvatar.stories.ts": { primitives: ["ZAIcon"] },
  "lib/primitives/ZABadge/ZABadge.stories.ts": { primitives: ["ZAIcon"] },
  "lib/primitives/ZABtn/ZABtn.stories.ts": {
    primitives: ["ZAIcon", "ZAProgressCircular", "ZATooltip"],
  },
  "lib/primitives/ZAChip/ZAChip.stories.ts": { primitives: ["ZAIcon"] },
  "lib/primitives/ZAEmptyState/ZAEmptyState.stories.ts": {
    primitives: ["ZAIcon"],
  },
  "lib/primitives/ZASliderBtnGroup/ZASliderBtnGroup.stories.ts": {
    primitives: ["ZABtn", "ZAIcon", "ZATooltip"],
  },
  "lib/primitives/ZASpinner/ZASpinner.stories.ts": {
    primitives: ["ZAProgressCircular"],
  },
  "lib/primitives/ZATabNav/ZATabNav.stories.ts": {
    primitives: ["ZAIcon", "ZAImg"],
  },
  "lib/primitives/ZATag/ZATag.stories.ts": { primitives: ["ZAIcon"] },
  "lib/structural/ZACollapsible/ZACollapsible.stories.ts": {
    primitives: ["ZAIcon"],
  },
  "lib/structural/ZAListItem/ZAListItem.stories.ts": {
    primitives: ["ZAAvatar", "ZAIcon"],
  },
  "lib/structural/ZATooltip/ZATooltip.stories.ts": { primitives: ["ZAIcon"] },
  "lib/InUse.stories.ts": {
    primitives: [
      "ZAAlert",
      "ZABtn",
      "ZADialog",
      "ZADivider",
      "ZADrawer",
      "ZAForm",
      "ZASelect",
      "ZATextField",
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
