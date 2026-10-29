import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import RChip from "./RChip.vue";

const meta: Meta<typeof RChip> = {
  title: "Grundelemente/Grundbaustein/RChip",
  component: RChip,
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

type Story = StoryObj<typeof RChip>;

// ── Defaults ────────────────────────────────────────────────────────

export const Default: Story = {
  args: { variant: "translucent" },
  render: (args) => ({
    components: { RChip },
    setup: () => ({ args }),
    template: `<RChip v-bind="args">Aktion</RChip>`,
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
    components: { RChip },
    setup: () => ({ args }),
    template: `<RChip v-bind="args">Genre</RChip>`,
  }),
};

// ── Size ladder ─────────────────────────────────────────────────────

export const SizeLadder: Story = {
  name: "Größenabstufung",
  render: () => ({
    components: { RChip },
    template: `
      <div style="display:flex;align-items:flex-end;gap:18px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <RChip variant="translucent" color="primary" size="x-small">x-small</RChip>
          <span>20px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <RChip variant="translucent" color="primary" size="small">small</RChip>
          <span>24px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <RChip variant="translucent" color="primary" size="default">default</RChip>
          <span>32px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <RChip variant="translucent" color="primary" size="large">large</RChip>
          <span>40px</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <RChip variant="translucent" color="primary" size="x-large">x-large</RChip>
          <span>48px</span>
        </div>
      </div>
    `,
  }),
};

// ── Variants ────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => ({
    components: { RChip },
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,auto);gap:14px 24px;justify-items:center;align-items:center">
        <RChip variant="flat" color="primary">flat</RChip>
        <RChip variant="elevated" color="primary">elevated</RChip>
        <RChip variant="translucent" color="primary">translucent</RChip>
        <RChip variant="outlined" color="primary">outlined</RChip>
        <RChip variant="text" color="primary">text</RChip>
        <RChip variant="plain" color="primary">plain</RChip>
      </div>
    `,
  }),
};

// ── Tones ───────────────────────────────────────────────────────────

export const Tones: Story = {
  name: "Tones · translucent",
  render: () => ({
    components: { RChip },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px;max-width:520px">
        <RChip variant="translucent" color="primary" prepend-icon="mdi-shape">primary</RChip>
        <RChip variant="translucent" color="secondary" prepend-icon="mdi-shape">secondary</RChip>
        <RChip variant="translucent" color="accent" prepend-icon="mdi-shape">accent</RChip>
        <RChip variant="translucent" color="success" prepend-icon="mdi-check">success</RChip>
        <RChip variant="translucent" color="warning" prepend-icon="mdi-alert">warning</RChip>
        <RChip variant="translucent" color="danger" prepend-icon="mdi-close-octagon">danger</RChip>
        <RChip variant="translucent" color="info" prepend-icon="mdi-information">info</RChip>
        <RChip variant="translucent">neutral</RChip>
      </div>
    `,
  }),
};

export const TonesFlat: Story = {
  name: "Farbtöne · flach",
  render: () => ({
    components: { RChip },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:8px;max-width:520px">
        <RChip variant="flat" color="primary">primary</RChip>
        <RChip variant="flat" color="secondary">secondary</RChip>
        <RChip variant="flat" color="accent">accent</RChip>
        <RChip variant="flat" color="success">success</RChip>
        <RChip variant="flat" color="warning">warning</RChip>
        <RChip variant="flat" color="danger">danger</RChip>
        <RChip variant="flat" color="info">info</RChip>
      </div>
    `,
  }),
};

// ── Shape ───────────────────────────────────────────────────────────

export const Label: Story = {
  name: "Beschriftung (eckige Ecken)",
  render: () => ({
    components: { RChip },
    template: `
      <div style="display:flex;gap:14px;align-items:center">
        <RChip variant="translucent" color="primary">Kapsel (Standard)</RChip>
        <RChip variant="translucent" color="primary" label>Beschriftung · eckig</RChip>
      </div>
    `,
  }),
};

export const RoundedLadder: Story = {
  name: "Abrundung überschreiben",
  render: () => ({
    components: { RChip },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        <RChip variant="translucent" color="primary" :rounded="0">0</RChip>
        <RChip variant="translucent" color="primary" rounded="sm">sm</RChip>
        <RChip variant="translucent" color="primary" rounded="md">md</RChip>
        <RChip variant="translucent" color="primary" rounded="lg">lg</RChip>
        <RChip variant="translucent" color="primary" rounded="xl">xl</RChip>
        <RChip variant="translucent" color="primary" :rounded="20">20px</RChip>
        <RChip variant="translucent" color="primary" rounded="full">full / pill</RChip>
      </div>
    `,
  }),
};

// ── Closable ────────────────────────────────────────────────────────

export const Closable: Story = {
  name: "Schließbar (interaktiv)",
  render: () => ({
    components: { RChip },
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
          <RChip
            v-for="t in tags"
            :key="t.id"
            variant="translucent"
            :color="t.color"
            closable
            @click:close="remove(t.id)"
          >
            {{ t.label }}
          </RChip>
        </div>
        <button
          type="button"
          style="padding:6px 12px;background:var(--r-color-brand-primary);color:white;border:none;border-radius:6px;font:12px/1 sans-serif;cursor:pointer"
          @click="reset"
        >
          Reset
        </button>
      </div>
    `,
  }),
};

// ── Disabled ────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => ({
    components: { RChip },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        <RChip variant="translucent" color="primary" disabled>Deaktiviert durchscheinend</RChip>
        <RChip variant="flat" color="primary" disabled>Deaktiviert flach</RChip>
        <RChip variant="outlined" color="primary" disabled>Deaktiviert umrandet</RChip>
        <RChip variant="translucent" color="primary" closable disabled>Mit Schließen</RChip>
      </div>
    `,
  }),
};

// ── Real-world ──────────────────────────────────────────────────────

export const GalleryTags: Story = {
  name: "Tag-Zeile (Plattform / Sammlung)",
  render: () => ({
    components: { RChip },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <RChip size="x-small" variant="translucent" color="primary">JP</RChip>
          <RChip size="x-small" variant="translucent" color="primary">EU</RChip>
          <RChip size="x-small" variant="translucent" color="primary">USA</RChip>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <RChip size="small" variant="translucent" :rounded="20">Abenteuer</RChip>
          <RChip size="small" variant="translucent" :rounded="20">Jump ’n’ Run</RChip>
          <RChip size="small" variant="translucent" :rounded="20">2D</RChip>
        </div>
      </div>
    `,
  }),
};
