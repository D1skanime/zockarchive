// RomM v2 design-token public API. Color groups live in their own module so
// palettes, dimensions and interaction tokens remain independently readable.
import {
  colorBrand,
  colorBrandLight,
  colorCanvas,
  colorCoverArt,
  colorCrt,
  colorDark,
  colorLight,
  colorOverlay,
  colorProvider,
  colorStatus,
  colorStatusBase,
  colorStatusLight,
} from "./colors";

export {
  colorBrand,
  colorBrandLight,
  colorCanvas,
  colorCoverArt,
  colorCrt,
  colorDark,
  colorLight,
  colorOverlay,
  colorProvider,
  colorStatus,
  colorStatusBase,
  colorStatusLight,
};

export const fontFamily = {
  sans: "'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, 'Inter', Roboto, sans-serif",
  display:
    "'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, 'Inter', Roboto, sans-serif",
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
} as const;

export const fontSize = {
  xs: "10.5px",
  sm: "11.5px",
  md: "13px",
  lg: "14.5px",
  xl: "17px",
  "2xl": "22px",
  "3xl": "32px",
  "4xl": "38px",
} as const;

export const lineHeight = {
  tight: "1.1",
  normal: "1.4",
  relaxed: "1.7",
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

export const space = {
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  10: "40px",
  12: "48px",
  14: "56px",
  rowPad: "36px",
} as const;

export const radius = {
  none: "0",
  xs: "3px",
  sm: "4px",
  chip: "6px",
  md: "8px",
  art: "8px",
  lg: "10px",
  card: "14px",
  xl: "20px",
  pill: "100px",
  full: "9999px",
} as const;

export const elevation = {
  0: "none",
  1: "0 2px 8px rgba(0, 0, 0, 0.2)",
  2: "0 8px 24px rgba(0, 0, 0, 0.45)",
  3: "0 8px 30px rgba(0, 0, 0, 0.6)",
  4: "0 20px 60px rgba(0, 0, 0, 0.7)",
  5: "0 32px 96px rgba(0, 0, 0, 0.7)",
  cover: "0 24px 48px rgba(0, 0, 0, 0.8)",
} as const;

export const motion = {
  fast: "150ms",
  med: "220ms",
  slow: "360ms",
  easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  easeBack: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const focus = {
  ringWidthMouse: "2px",
  ringWidthKey: "2.5px",
  ringWidthPad: "3.5px",
  ringOffset: "3px",
} as const;

export const zIndex = {
  drawer: "2300",
  dialog: "2400",
  menu: "2500",
  tooltip: "2600",
  snackbar: "2700",
} as const;

export const layout = {
  navHeight: "104px",
  bottomNavHeight: "58px",
  bottomNavMaxWidth: "480px",
  touchTarget: "44px",
  rowPad: "36px",
  pageMaxWidth: "1920px",
  cardArtWidth: "158px",
  cardArtHeight: "213px",
  cardArtWidthXs: "48px",
  cardArtHeightXs: "64px",
  cardArtWidthSm: "120px",
  cardArtHeightSm: "162px",
  cardArtWidthLg: "200px",
  cardArtHeightLg: "270px",
  cardArtWidthXl: "240px",
  cardArtHeightXl: "324px",
  heroCardWidth: "300px",
  heroCardHeight: "169px",
  heroCardWidthXs: "90px",
  heroCardHeightXs: "51px",
  heroCardWidthSm: "230px",
  heroCardHeightSm: "130px",
  heroCardWidthLg: "380px",
  heroCardHeightLg: "214px",
  heroCardWidthXl: "460px",
  heroCardHeightXl: "259px",
  detailCoverWidth: "240px",
  collectionCoverWidth: "140px",
  collectionCoverHeight: "188px",
  collectionCoverWidthXs: "150px",
  collectionCoverHeightXs: "202px",
  alphaStripWidth: "24px",
  alphaStripWidthXs: "30px",
  listRowHeight: "80px",
  listHeaderHeight: "40px",
} as const;

export const tokens = {
  colorBrand,
  colorStatus,
  colorStatusBase,
  colorProvider,
  colorDark,
  colorLight,
  colorOverlay,
  colorCanvas,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  space,
  radius,
  elevation,
  motion,
  focus,
  layout,
  zIndex,
} as const;

export type Tokens = typeof tokens;
