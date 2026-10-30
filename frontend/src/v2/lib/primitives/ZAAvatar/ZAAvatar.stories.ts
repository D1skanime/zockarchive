import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ZAAvatar from "./ZAAvatar.vue";

const meta: Meta<typeof ZAAvatar> = {
  title: "Grundelemente/Grundbaustein/ZAAvatar",
  component: ZAAvatar,
  argTypes: {
    size: { control: "text" },
    color: { control: "text" },
    image: { control: "text" },
    icon: { control: "text" },
    rounded: { control: "text" },
    variant: {
      control: "select",
      options: ["flat", "elevated", "translucent", "outlined", "text", "plain"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof ZAAvatar>;

// ── Content modes ───────────────────────────────────────────────────

export const Initial: Story = {
  args: { color: "primary", size: 40 },
  render: (args) => ({
    components: { ZAAvatar },
    setup: () => ({ args }),
    template: `<ZAAvatar v-bind="args">YZ</ZAAvatar>`,
  }),
};

export const Icon: Story = {
  args: { icon: "mdi-account", color: "primary", size: 40 },
};

export const Image: Story = {
  args: { image: "/assets/isotipo.svg", size: 48 },
};

// ── Size ladder ─────────────────────────────────────────────────────

export const SizeLadder: Story = {
  name: "Größenabstufung",
  render: () => ({
    components: { ZAAvatar },
    template: `
      <div style="display:flex;align-items:flex-end;gap:24px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar size="x-small" color="primary">A</ZAAvatar>
          <span>x-small · 24px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar size="small" color="primary">A</ZAAvatar>
          <span>small · 32px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar size="default" color="primary">A</ZAAvatar>
          <span>default · 40px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar size="large" color="primary">A</ZAAvatar>
          <span>large · 48px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar size="x-large" color="primary">A</ZAAvatar>
          <span>x-large · 56px</span>
        </div>
      </div>
    `,
  }),
};

export const NumericSizes: Story = {
  name: "Numerische Größen",
  render: () => ({
    components: { ZAAvatar },
    template: `
      <div style="display:flex;align-items:flex-end;gap:24px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar :size="20" color="accent" icon="mdi-account" />
          <span>20</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar :size="32" color="accent" icon="mdi-account" />
          <span>32</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar :size="64" color="accent" icon="mdi-account" />
          <span>64</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar :size="96" color="accent" icon="mdi-account" />
          <span>96</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar :size="128" color="accent" icon="mdi-account" />
          <span>128</span>
        </div>
      </div>
    `,
  }),
};

// ── Variants ────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => ({
    components: { ZAAvatar },
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px 24px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar variant="flat" color="primary" size="48">YZ</ZAAvatar>
          <span>flat</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar variant="elevated" color="primary" size="48">YZ</ZAAvatar>
          <span>elevated</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar variant="translucent" color="primary" size="48">YZ</ZAAvatar>
          <span>translucent</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar variant="outlined" color="primary" size="48">YZ</ZAAvatar>
          <span>outlined</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar variant="text" color="primary" size="48">YZ</ZAAvatar>
          <span>text</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar variant="plain" color="primary" size="48">YZ</ZAAvatar>
          <span>plain</span>
        </div>
      </div>
    `,
  }),
};

// ── Tones ───────────────────────────────────────────────────────────

export const Tones: Story = {
  name: "Farbtöne · flach",
  render: () => ({
    components: { ZAAvatar },
    template: `
      <div style="display:grid;grid-template-columns:repeat(4,auto);gap:16px 18px;align-items:center;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <ZAAvatar color="primary" size="40" icon="mdi-account" />
          <span>primary</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <ZAAvatar color="secondary" size="40" icon="mdi-account" />
          <span>secondary</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <ZAAvatar color="accent" size="40" icon="mdi-account" />
          <span>accent</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <ZAAvatar color="success" size="40" icon="mdi-check" />
          <span>success</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <ZAAvatar color="warning" size="40" icon="mdi-alert" />
          <span>warning</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <ZAAvatar color="danger" size="40" icon="mdi-close" />
          <span>danger</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <ZAAvatar color="info" size="40" icon="mdi-information" />
          <span>info</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <ZAAvatar size="40" icon="mdi-account" />
          <span>ohne Farbe</span>
        </div>
      </div>
    `,
  }),
};

export const TonesTranslucent: Story = {
  name: "Farbtöne · durchscheinend",
  render: () => ({
    components: { ZAAvatar },
    template: `
      <div style="display:flex;gap:16px;align-items:center">
        <ZAAvatar variant="translucent" color="primary" size="40" icon="mdi-account" />
        <ZAAvatar variant="translucent" color="secondary" size="40" icon="mdi-account" />
        <ZAAvatar variant="translucent" color="accent" size="40" icon="mdi-account" />
        <ZAAvatar variant="translucent" color="success" size="40" icon="mdi-check" />
        <ZAAvatar variant="translucent" color="warning" size="40" icon="mdi-alert" />
        <ZAAvatar variant="translucent" color="danger" size="40" icon="mdi-close" />
        <ZAAvatar variant="translucent" color="info" size="40" icon="mdi-information" />
      </div>
    `,
  }),
};

// ── Shapes ──────────────────────────────────────────────────────────

export const Rounded: Story = {
  name: "Abrundungsabstufung",
  render: () => ({
    components: { ZAAvatar },
    template: `
      <div style="display:flex;align-items:flex-end;gap:24px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar :rounded="false" color="primary" size="48">R</ZAAvatar>
          <span>false / "0"</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar rounded="sm" color="primary" size="48">R</ZAAvatar>
          <span>sm · 4</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar rounded="md" color="primary" size="48">R</ZAAvatar>
          <span>md · 8</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar rounded="lg" color="primary" size="48">R</ZAAvatar>
          <span>lg · 12</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar rounded="xl" color="primary" size="48">R</ZAAvatar>
          <span>xl · 16</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAAvatar rounded="circle" color="primary" size="48">R</ZAAvatar>
          <span>Kreis (Standard)</span>
        </div>
      </div>
    `,
  }),
};

// ── Real-world ──────────────────────────────────────────────────────

export const UserRow: Story = {
  name: "In einer Benutzerzeile",
  render: () => ({
    components: { ZAAvatar },
    template: `
      <div style="width:340px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:12px;overflow:hidden;font:13px/1.4 sans-serif;color:var(--r-color-fg)">
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px">
          <ZAAvatar image="/assets/isotipo.svg" size="36" />
          <div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-weight:600">RomM Admin</span>
            <span style="color:var(--r-color-fg-muted);font-size:11px">Admin · zuletzt vor 3 Min. gesehen</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-top:1px solid var(--r-color-border)">
          <ZAAvatar color="accent" size="36">EM</ZAAvatar>
          <div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-weight:600">Emma</span>
            <span style="color:var(--r-color-fg-muted);font-size:11px">Redaktion</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-top:1px solid var(--r-color-border)">
          <ZAAvatar variant="translucent" color="info" size="36" icon="mdi-account-question" />
          <div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-weight:600">Gast</span>
            <span style="color:var(--r-color-fg-muted);font-size:11px">Betrachtung · ausstehend</span>
          </div>
        </div>
      </div>
    `,
  }),
};

export const StackedGroup: Story = {
  name: "Gestapelte Gruppe (Avatar-Gruppe)",
  render: () => ({
    components: { ZAAvatar },
    template: `
      <div style="display:flex;align-items:center">
        <ZAAvatar color="primary" size="36" style="border:2px solid var(--r-color-bg);position:relative;z-index:5">AB</ZAAvatar>
        <ZAAvatar color="accent" size="36" style="margin-left:-12px;border:2px solid var(--r-color-bg);position:relative;z-index:4">CD</ZAAvatar>
        <ZAAvatar color="success" size="36" style="margin-left:-12px;border:2px solid var(--r-color-bg);position:relative;z-index:3">EF</ZAAvatar>
        <ZAAvatar color="warning" size="36" style="margin-left:-12px;border:2px solid var(--r-color-bg);position:relative;z-index:2">GH</ZAAvatar>
        <ZAAvatar variant="translucent" color="info" size="36" style="margin-left:-12px;border:2px solid var(--r-color-bg);position:relative;z-index:1">+5</ZAAvatar>
      </div>
    `,
  }),
};
