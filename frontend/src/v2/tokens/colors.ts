// Color token groups are kept separate from dimensions, typography and
// interaction tokens so each source module stays within the repository limit.

export const colorBrand = {
  // ZockArchive's blue glass accent. Hover lightens over dark artwork;
  // pressed tightens back toward the archive-blue base.
  primary: "#63A4F7",
  primaryHover: "#93C5FD",
  primaryPressed: "#3578D4",
  secondary: "#7DB5F5",
  secondaryHover: "#DCEBFF",
  secondaryPressed: "#4B8DDF",
  accent: "#7CC4FF",
  accentHover: "#B7DDFF",
  fav: "#FF4F6B",
  avatarGradient: "linear-gradient(135deg, #93C5FD, #3578D4)",
  rommRed: "#DA3633",
  rommGreen: "#3FB950",
  rommBlue: "#0070F3",
  rommGold: "#FFD700",
} as const;

export const colorBrandLight = {
  primary: "#1D5FB8",
  primaryHover: "#164B94",
  primaryPressed: "#123C78",
  secondary: "#346FAF",
  accent: "#1769C2",
  rommGold: "#B8860B",
} as const;

export const colorStatus = {
  success: "#4ADE80",
  warning: "#FBBF24",
  danger: "#FF5050",
  info: "#93C5FD",
  warningFg: "#FACC15",
  dangerFg: "#F87171",
} as const;

export const colorStatusBase = {
  success: "#22C55E",
  warning: "#EAB308",
  danger: "#EF4444",
  info: "#3B82F6",
} as const;

export const colorStatusLight = {
  success: "#15A34A",
  warning: "#CA8A04",
  danger: "#DC2626",
  info: "#2563EB",
  warningFg: "#854D0E",
  dangerFg: "#B91C1C",
} as const;

export const colorProvider = {
  igdb: "#6366F1",
  moby: "#F59E0B",
  screenscraper: "#3B82F6",
  retroachievements: "#EF4444",
  steamgriddb: "#0EA5E9",
  launchbox: "#8B5CF6",
  hasheous: "#6B7280",
  flashpoint: "#F97316",
  hltb: "#22C55E",
} as const;

export const colorDark = {
  bg: "#07070f",
  bgElevated: "rgba(255, 255, 255, 0.06)",
  surface: "rgba(255, 255, 255, 0.06)",
  surfaceHover: "rgba(255, 255, 255, 0.1)",
  fg: "#ffffff",
  fgHeading: "#ffffff",
  fgSecondary: "rgba(255, 255, 255, 0.75)",
  fgMuted: "rgba(255, 255, 255, 0.45)",
  fgFaint: "rgba(255, 255, 255, 0.25)",
  fgFaintHard: "rgba(255, 255, 255, 0.05)",
  border: "rgba(255, 255, 255, 0.14)",
  borderStrong: "rgba(255, 255, 255, 0.22)",
  glassTint: "hsl(222 70% 62% / 12%)",
  glassShadow: "rgba(30, 50, 80, 0.16)",
  focus: "rgba(255, 255, 255, 0.45)",
  panel: "rgba(16, 12, 28, 0.97)",
  panelBorder: "rgba(255, 255, 255, 0.1)",
  tooltipBg: "rgba(7, 7, 15, 0.94)",
  tooltipBorder: "rgba(255, 255, 255, 0.09)",
  shimmerSweep: "rgba(255, 255, 255, 0.08)",
  coverPlaceholder: "#1a1a2e",
  coverPlaceholderBright: "#252540",
  authGlass: "rgba(13, 17, 23, 0.65)",
  authGlassHover: "rgba(13, 17, 23, 0.78)",
  authGlassBorder: "hsl(222 70% 62% / 32%)",
  toastBg: "rgba(13, 17, 23, 0.92)",
  switchKnobOn: "#111117",
  titleShadow: "rgba(0, 0, 0, 0.5)",
} as const;

export const colorLight = {
  bg: "#f3f7fd",
  bgElevated: "rgba(255, 255, 255, 0.52)",
  surface: "rgba(255, 255, 255, 0.58)",
  surfaceHover: "rgba(255, 255, 255, 0.78)",
  fg: "#111117",
  fgHeading: "rgba(17, 17, 23, 0.86)",
  fgSecondary: "rgba(17, 17, 23, 0.82)",
  fgMuted: "rgba(17, 17, 23, 0.74)",
  fgFaint: "rgba(17, 17, 23, 0.58)",
  border: "hsl(222 45% 35% / 18%)",
  borderStrong: "hsl(222 45% 35% / 30%)",
  glassTint: "hsl(222 70% 62% / 12%)",
  glassShadow: "rgba(30, 50, 80, 0.08)",
  focus: "rgba(0, 0, 0, 0.45)",
  panel: "rgba(240, 240, 246, 0.98)",
  panelBorder: "rgba(17, 17, 23, 0.1)",
  tooltipBg: "rgba(245, 245, 250, 0.96)",
  tooltipBorder: "rgba(17, 17, 23, 0.08)",
  shimmerSweep: "rgba(0, 0, 0, 0.06)",
  coverPlaceholder: "#e4e2ef",
  coverPlaceholderBright: "#efeef7",
  authGlass: "rgba(245, 245, 250, 0.85)",
  authGlassHover: "rgba(245, 245, 250, 0.94)",
  authGlassBorder: "hsl(222 70% 62% / 32%)",
  toastBg: "rgba(245, 245, 250, 0.95)",
  switchKnobOn: "rgba(255, 255, 255, 0.95)",
  titleShadow: "transparent",
} as const;

export const colorOverlay = {
  fg: "rgba(255, 255, 255, 0.95)",
  fgSecondary: "rgba(255, 255, 255, 0.85)",
  fgMuted: "rgba(255, 255, 255, 0.45)",
  border: "rgba(255, 255, 255, 0.12)",
  borderStrong: "rgba(255, 255, 255, 0.25)",
  scrimSoft: "rgba(0, 0, 0, 0.55)",
  scrimStrong: "rgba(0, 0, 0, 0.78)",
  emphasisBg: "#ffffff",
  emphasisBgHover: "#e6e6e6",
  emphasisFg: "#111117",
  gold: "#FFD700",
} as const;

export const colorCanvas = {
  bg: "#000000",
  bgDeep: "#0d1117",
} as const;

export const colorCrt = {
  glow: "#7dffb4",
  ghostWarm: "#ff3b5c",
  ghostCool: "#3bd9ff",
} as const;

export const colorCoverArt = {
  base: "#553E98",
  shade: "#371F69",
  warm: "#FF9B85",
  icon: "#F9F9F9",
} as const;
