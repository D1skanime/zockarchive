// RomM v2 Component Library — barrel export.
//
// Only design-system *primitives* live here. Specializations (BackBtn,
// PlatformTile, InfoPanel, …) belong under src/v2/components/<feature>/
// and are imported directly, not through this barrel.
//
// Rule: every export below must be general enough that two or more
// features depend on it, and must ship a Storybook story.
//
// Folders mirror Storybook categories (primitives, forms, structural,
// menus, overlays, data, media).

// Primitives
export * from "./primitives/ZAAlert";
export * from "./primitives/ZAAvatar";
export * from "./primitives/ZABadge";
export * from "./primitives/ZABtn";
export * from "./primitives/ZACard";
export * from "./primitives/ZAChip";
export * from "./primitives/ZADivider";
export * from "./primitives/ZAEmptyState";
export * from "./primitives/ZAIcon";
export * from "./primitives/ZAImg";
export * from "./primitives/ZALetterHeading";
export * from "./primitives/ZAProgressCircular";
export * from "./primitives/ZAProgressLinear";
export * from "./primitives/ZASkeletonBlock";
export * from "./primitives/ZASliderBtnGroup";
export * from "./primitives/ZASpinner";
export * from "./primitives/ZASteps";
export * from "./primitives/ZATabNav";
export * from "./primitives/ZATag";

// Forms
export * from "./forms/ZACheckbox";
export * from "./forms/ZAComboboxField";
export * from "./forms/ZADateField";
export * from "./forms/ZADropzone";
export * from "./forms/ZAForm";
export * from "./forms/ZARating";
export * from "./forms/ZASelect";
export * from "./forms/ZASlider";
export * from "./forms/ZASwitch";
export * from "./forms/ZATextField";

// Structural
export * from "./structural/ZACollapsible";
export * from "./structural/ZAExpandTransition";
export * from "./structural/ZAList";
export * from "./structural/ZAListItem";
export * from "./structural/ZAToolbar";
export * from "./structural/ZATooltip";
export * from "./structural/ZAVirtualScroller";

// Menus
export * from "./menus/ZAMenu";
export * from "./menus/ZAMenuItem";

// Overlays
export * from "./overlays/ZACarousel";
export * from "./overlays/ZADialog";
export * from "./overlays/ZADrawer";

// Data
export * from "./data/ZATable";

// Media
export * from "./media/ZABox3D";
export * from "./media/ZAPlatformIcon";

// (GameCard lives under components/GameCard/ — it's a feature
// composite that depends on stores + useGameActions, not a lib primitive.)
