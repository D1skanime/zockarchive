import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ZAPlatformIcon from "./ZAPlatformIcon.vue";

const meta: Meta<typeof ZAPlatformIcon> = {
  title: "Medien/Grundbaustein/ZAPlatformIcon",
  component: ZAPlatformIcon,
  argTypes: {
    name: { control: "text" },
    src: { control: "text" },
    size: { control: "number" },
    title: { control: "text" },
    showTooltip: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof ZAPlatformIcon>;

export const Known: Story = {
  name: "Bekannt",
  args: { name: "snes", size: 40 },
};
export const Unknown: Story = {
  name: "Unbekannt",
  args: { name: "does-not-exist", size: 40 },
};
export const Row: Story = {
  name: "Reihe",
  render: () => ({
    components: { ZAPlatformIcon },
    template: `
      <div style="display:flex;gap:.5rem;align-items:center">
        <ZAPlatformIcon name="snes" />
        <ZAPlatformIcon name="nes" />
        <ZAPlatformIcon name="gba" />
        <ZAPlatformIcon name="ps1" />
        <ZAPlatformIcon name="mystery" />
      </div>
    `,
  }),
};

// Size ladder — `size` binds directly to width/height inline so the
// icon honours the requested dimension even inside indefinite flex
// parents (e.g. ZABtn's icon slot). Previously the icon was clamped
// by `max-width: 100% / max-height: 100%` to whatever the parent
// gave it, which silently shrunk it when the parent had no defined
// extent. The badge in GameCard relies on this fix.
export const SizeLadder: Story = {
  name: "Größenleiter",
  render: () => ({
    components: { ZAPlatformIcon },
    template: `
      <div style="display:flex;gap:14px;align-items:center;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <ZAPlatformIcon name="snes" :size="16" />
          <span>16</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <ZAPlatformIcon name="snes" :size="22" />
          <span>22</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <ZAPlatformIcon name="snes" :size="32" />
          <span>32</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <ZAPlatformIcon name="snes" :size="48" />
          <span>48</span>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`size` wird an die Inline-Werte `width`/`height` gebunden und nicht auf das Elternelement begrenzt. Das ist nützlich, wenn das Symbol in einem Flex-Slot ohne feste Ausdehnung sitzt.",
      },
    },
  },
};

// Inside an indefinite flex container — proves the size prop is
// honoured even when the parent has no defined cross-axis extent.
// Regression guard for the GameCard platform badge.
export const InsideFlexParent: Story = {
  name: "In Flex-Elternelement ohne feste Ausdehnung",
  render: () => ({
    components: { ZAPlatformIcon },
    template: `
      <div style="display:flex;align-items:center;gap:6px;padding:6px;border:1px dashed var(--r-color-border);border-radius:6px">
        <span style="font:11px sans-serif;color:var(--r-color-fg-muted)">Flex-Elternelement ohne feste Ausdehnung →</span>
        <ZAPlatformIcon name="snes" :size="22" />
      </div>
    `,
  }),
};
