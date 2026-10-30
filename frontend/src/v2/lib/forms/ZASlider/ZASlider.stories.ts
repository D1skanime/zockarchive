import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ZASlider from "./ZASlider.vue";

const meta: Meta<typeof ZASlider> = {
  title: "Formulare/Grundbaustein/ZASlider",
  component: ZASlider,
  // ZASlider has no visible label, so every instance needs `ariaLabel`.
  args: { ariaLabel: "Wert" },
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    color: { control: "text" },
    valuePosition: {
      control: "inline-radio",
      options: ["none", "left", "right", "thumb"],
    },
    valueSuffix: { control: "text" },
    showTicks: { control: "boolean" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
  },
  render: (args) => ({
    components: { ZASlider },
    setup: () => {
      const value = ref(args.modelValue ?? 50);
      return { args, value };
    },
    template: `
      <div style="padding:24px;min-width:380px">
        <ZASlider v-bind="args" v-model="value" />
        <div style="margin-top:12px;font-size:11px;color:var(--r-color-fg-muted)">
          Wert: {{ value }}
        </div>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<typeof ZASlider>;

// ── Defaults ────────────────────────────────────────────────────────

export const Default: Story = { args: { modelValue: 50 } };

// ── Value badges ───────────────────────────────────────────────────

export const ValueRight: Story = {
  name: "Wertanzeige · rechts",
  args: { modelValue: 42, valuePosition: "right", valueSuffix: "%" },
};

export const ValueLeft: Story = {
  name: "Wertanzeige · links",
  args: { modelValue: 42, valuePosition: "left", valueSuffix: "%" },
};

export const ValueThumb: Story = {
  name: "Wertanzeige · schwebender Regler",
  args: { modelValue: 30, valuePosition: "thumb", valueSuffix: "%" },
};

// ── Steps + ticks ──────────────────────────────────────────────────

export const Stepped: Story = {
  name: "Schrittweise (10er)",
  args: { modelValue: 30, step: 10, showTicks: true },
};

export const FineSteps: Story = {
  name: "Feine Schritte (0,5)",
  args: { modelValue: 50, min: 0, max: 100, step: 0.5 },
};

// ── Range examples ─────────────────────────────────────────────────

export const Volume: Story = {
  name: "Lautstärke (0–100)",
  args: {
    modelValue: 65,
    valuePosition: "right",
    valueSuffix: "%",
    color: "accent",
  },
};

export const Temperature: Story = {
  name: "Temperatur",
  args: {
    modelValue: 22,
    min: 16,
    max: 30,
    step: 1,
    valuePosition: "thumb",
    valueSuffix: "°",
    color: "warning",
  },
};

// ── Color tones ────────────────────────────────────────────────────

export const ColorLadder: Story = {
  name: "Farbübersicht",
  render: () => ({
    components: { ZASlider },
    setup: () => ({
      primary: ref(70),
      success: ref(70),
      warning: ref(70),
      danger: ref(70),
      info: ref(70),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:18px;padding:24px;min-width:380px">
        <ZASlider v-model="primary" color="primary" value-position="right" value-suffix="%" aria-label="Primär" />
        <ZASlider v-model="success" color="success" value-position="right" value-suffix="%" aria-label="Erfolg" />
        <ZASlider v-model="warning" color="warning" value-position="right" value-suffix="%" aria-label="Warnung" />
        <ZASlider v-model="danger" color="danger" value-position="right" value-suffix="%" aria-label="Gefahr" />
        <ZASlider v-model="info" color="info" value-position="right" value-suffix="%" aria-label="Info" />
      </div>
    `,
  }),
};

// ── States ─────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { modelValue: 40, disabled: true, valuePosition: "right" },
};

export const Readonly: Story = {
  args: { modelValue: 40, readonly: true, valuePosition: "right" },
};

// ── Commit-on-end pattern ──────────────────────────────────────────

export const CommitOnEnd: Story = {
  name: "Übernahme am Ende (@end)",
  render: () => ({
    components: { ZASlider },
    setup: () => {
      const preview = ref(50);
      const committed = ref(50);
      function onEnd(v: number) {
        committed.value = v;
      }
      return { preview, committed, onEnd };
    },
    template: `
      <div style="padding:24px;min-width:380px;display:flex;flex-direction:column;gap:10px">
        <ZASlider v-model="preview" value-position="thumb" value-suffix="%" aria-label="Lautstärke" @end="onEnd" />
        <div style="font:12px sans-serif;color:var(--r-color-fg-muted)">
          Vorschau: {{ preview }} · zuletzt übernommen: {{ committed }}
        </div>
        <div style="font:11px sans-serif;color:var(--r-color-fg-faint)">
          Ziehen Sie den Regler. Die Vorschau aktualisiert sich sofort, übernommen wird erst beim Loslassen.
        </div>
      </div>
    `,
  }),
};
