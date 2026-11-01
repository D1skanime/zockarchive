import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ZAChip from "./ZAChip.vue";

const meta: Meta<typeof ZAChip> = {
  title: "Grundelemente/Grundbaustein/ZAChip",
  component: ZAChip,
  argTypes: {
    variant: {
      control: "select",
      options: ["flat", "text", "elevated", "translucent", "outlined", "plain"],
    },
    size: {
      control: "select",
      options: ["x-small", "small", "default", "large", "x-large"],
    },
    color: { control: "text" },
    label: { control: "boolean" },
    closable: { control: "boolean" },
    prependIcon: { control: "text" },
    appendIcon: { control: "text" },
    disabled: { control: "boolean" },
    rounded: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof ZAChip>;

// ── Defaults ────────────────────────────────────────────────────────

export const Default: Story = {
  args: { variant: "translucent" },
  render: (args) => ({
    components: { ZAChip },
    setup: () => ({ args }),
    template: `<ZAChip v-bind="args">Aktion</ZAChip>`,
  }),
};

export const WithIcons: Story = {
  args: {
    variant: "translucent",
    color: "primary",
    prependIcon: "mdi-filter-outline",
    appendIcon: "mdi-menu-down",
  },
  render: (args) => ({
    components: { ZAChip },
    setup: () => ({ args }),
    template: `<ZAChip v-bind="args">Genre</ZAChip>`,
  }),
};

// ── Size ladder ─────────────────────────────────────────────────────

export const SizeLadder: Story = {
  name: "Größenabstufung",
  render: () => ({
    components: { ZAChip },
    template: `
      <div style="display:flex;align-items:flex-end;gap:18px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAChip variant="translucent" color="primary" size="x-small">x-small</ZAChip>
          <span>20px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAChip variant="translucent" color="primary" size="small">small</ZAChip>
          <span>24px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAChip variant="translucent" color="primary" size="default">default</ZAChip>
          <span>32px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAChip variant="translucent" color="primary" size="large">large</ZAChip>
          <span>40px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAChip variant="translucent" color="primary" size="x-large">x-large</ZAChip>
          <span>48px</span>
        </div>
      </div>
    `,
  }),
};

// ── Variants ────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => ({
    components: { ZAChip },
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,auto);gap:14px 24px;justify-items:center;align-items:center">
        <ZAChip variant="flat" color="primary">flat</ZAChip>
        <ZAChip variant="elevated" color="primary">elevated</ZAChip>
        <ZAChip variant="translucent" color="primary">translucent</ZAChip>
        <ZAChip variant="outlined" color="primary">outlined</ZAChip>
        <ZAChip variant="text" color="primary">text</ZAChip>
        <ZAChip variant="plain" color="primary">plain</ZAChip>
      </div>
    `,
  }),
};

// ── Tones ───────────────────────────────────────────────────────────

export const Tones: Story = {
  name: "Töne · durchscheinend",
  render: () => ({
    components: { ZAChip },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px;max-width:520px">
        <ZAChip variant="translucent" color="primary" prepend-icon="mdi-shape">primary</ZAChip>
        <ZAChip variant="translucent" color="secondary" prepend-icon="mdi-shape">secondary</ZAChip>
        <ZAChip variant="translucent" color="accent" prepend-icon="mdi-shape">accent</ZAChip>
        <ZAChip variant="translucent" color="success" prepend-icon="mdi-check">success</ZAChip>
        <ZAChip variant="translucent" color="warning" prepend-icon="mdi-alert">warning</ZAChip>
        <ZAChip variant="translucent" color="danger" prepend-icon="mdi-close-octagon">danger</ZAChip>
        <ZAChip variant="translucent" color="info" prepend-icon="mdi-information">info</ZAChip>
        <ZAChip variant="translucent">neutral</ZAChip>
      </div>
    `,
  }),
};

export const TonesFlat: Story = {
  name: "Farbtöne · flach",
  render: () => ({
    components: { ZAChip },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px;max-width:520px">
        <ZAChip variant="flat" color="primary">primary</ZAChip>
        <ZAChip variant="flat" color="secondary">secondary</ZAChip>
        <ZAChip variant="flat" color="accent">accent</ZAChip>
        <ZAChip variant="flat" color="success">success</ZAChip>
        <ZAChip variant="flat" color="warning">warning</ZAChip>
        <ZAChip variant="flat" color="danger">danger</ZAChip>
        <ZAChip variant="flat" color="info">info</ZAChip>
      </div>
    `,
  }),
};

// ── Shape ───────────────────────────────────────────────────────────

export const Label: Story = {
  name: "Beschriftung (eckige Ecken)",
  render: () => ({
    components: { ZAChip },
    template: `
      <div style="display:flex;gap:14px;align-items:center">
        <ZAChip variant="translucent" color="primary">Kapsel (Standard)</ZAChip>
        <ZAChip variant="translucent" color="primary" label>Beschriftung · eckig</ZAChip>
      </div>
    `,
  }),
};

export const RoundedLadder: Story = {
  name: "Abrundung überschreiben",
  render: () => ({
    components: { ZAChip },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        <ZAChip variant="translucent" color="primary" :rounded="0">0</ZAChip>
        <ZAChip variant="translucent" color="primary" rounded="sm">sm</ZAChip>
        <ZAChip variant="translucent" color="primary" rounded="md">md</ZAChip>
        <ZAChip variant="translucent" color="primary" rounded="lg">lg</ZAChip>
        <ZAChip variant="translucent" color="primary" rounded="xl">xl</ZAChip>
        <ZAChip variant="translucent" color="primary" :rounded="20">20px</ZAChip>
        <ZAChip variant="translucent" color="primary" rounded="full">full / pill</ZAChip>
      </div>
    `,
  }),
};

// ── Closable ────────────────────────────────────────────────────────

export const Closable: Story = {
  name: "Schließbar (interaktiv)",
  render: () => ({
    components: { ZAChip },
    setup() {
      const initial = [
        { id: 1, label: "Abenteuer", color: "primary" },
        { id: 2, label: "Jump ’n’ Run", color: "accent" },
        { id: 3, label: "JRPG", color: "info" },
        { id: 4, label: "Koop", color: "success" },
      ];
      const tags = ref([...initial]);
      function remove(id: number) {
        tags.value = tags.value.filter((t) => t.id !== id);
      }
      function reset() {
        tags.value = [...initial];
      }
      return { tags, remove, reset };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;align-items:flex-start">
        <div style="display:flex;flex-wrap:wrap;gap:8px;max-width:420px">
          <ZAChip
            v-for="t in tags"
            :key="t.id"
            variant="translucent"
            :color="t.color"
            closable
            @click:close="remove(t.id)"
          >
            {{ t.label }}
          </ZAChip>
        </div>
        <button
          type="button"
          style="padding:6px 12px;background:var(--r-color-brand-primary);color:white;border:none;border-radius:6px;font:12px/1 sans-serif;cursor:pointer"
          @click="reset"
        >
          Zurücksetzen
        </button>
      </div>
    `,
  }),
};

// ── Disabled ────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => ({
    components: { ZAChip },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        <ZAChip variant="translucent" color="primary" disabled>Deaktiviert durchscheinend</ZAChip>
        <ZAChip variant="flat" color="primary" disabled>Deaktiviert flach</ZAChip>
        <ZAChip variant="outlined" color="primary" disabled>Deaktiviert umrandet</ZAChip>
        <ZAChip variant="translucent" color="primary" closable disabled>Mit Schließen</ZAChip>
      </div>
    `,
  }),
};

// ── Real-world ──────────────────────────────────────────────────────

export const GalleryTags: Story = {
  name: "Tag-Zeile (Plattform / Sammlung)",
  render: () => ({
    components: { ZAChip },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <ZAChip size="x-small" variant="translucent" color="primary">JP</ZAChip>
          <ZAChip size="x-small" variant="translucent" color="primary">EU</ZAChip>
          <ZAChip size="x-small" variant="translucent" color="primary">USA</ZAChip>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <ZAChip size="small" variant="translucent" :rounded="20">Abenteuer</ZAChip>
          <ZAChip size="small" variant="translucent" :rounded="20">Jump ’n’ Run</ZAChip>
          <ZAChip size="small" variant="translucent" :rounded="20">2D</ZAChip>
        </div>
      </div>
    `,
  }),
};
