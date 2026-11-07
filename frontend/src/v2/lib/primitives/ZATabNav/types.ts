export type ZATabNavItem = {
  id: string;
  label: string;
  /** ID of the tab panel controlled by this item, when the nav owns panels. */
  controls?: string;
  /** ID assigned to the tab so its panel can reference it as a label. */
  tabId?: string;
  /** Optional MDI icon name shown before the label. */
  icon?: string;
  /** Optional image URL shown before the label — used when an item needs
   *  a logo / provider mark instead of a glyph (provider chips, brand
   *  tabs). Wins over `icon` when both are set. Rendered as an `<img>`
   *  sized to match the icon's visual weight. */
  image?: string;
  badge?: string | number | null;
  show?: boolean;
};
