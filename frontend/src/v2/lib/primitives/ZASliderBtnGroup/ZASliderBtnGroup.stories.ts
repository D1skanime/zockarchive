import type { Meta, StoryObj } from "@storybook/vue3";
import { ref } from "vue";
import ZASliderBtnGroup from "./ZASliderBtnGroup.vue";

// Storybook's Meta<typeof Component> struggles with <script setup generic>,
// so we widen the component type here — runtime behaviour is unaffected.
const meta: Meta = {
  title: "Grundelemente/Grundbaustein/ZASliderBtnGroup",
  // Cast needed: <script setup generic> types aren't compatible with
  // Storybook's ConcreteComponent constraint.
  component: ZASliderBtnGroup as unknown as Meta["component"],
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["segmented", "tab"],
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    disabled: { control: "boolean" },
    ariaLabel: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Segmentierte Steuerung mit gleitender Anzeige. Verbraucher steuern die aktive ID über `v-model`; für Navigationsreiter dürfen Einträge einen `to`-Pfad angeben und als Router-Links gerendert werden.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const Segmented: Story = {
  args: { variant: "segmented" },
  render: (args) => ({
    components: { ZASliderBtnGroup },
    setup() {
      const layout = ref<"grid" | "list">("grid");
      return { args, layout };
    },
    template: `
      <ZASliderBtnGroup
        v-bind="args"
        :model-value="layout"
        :items="[
          { id: 'grid', icon: 'mdi-view-grid-outline', ariaLabel: 'Raster', title: 'Raster' },
          { id: 'list', icon: 'mdi-view-list', ariaLabel: 'Liste', title: 'Liste' },
        ]"
        @update:model-value="(v) => (layout = v)"
      />
    `,
  }),
};

export const Tab: Story = {
  args: { variant: "tab" },
  render: (args) => ({
    components: { ZASliderBtnGroup },
    setup() {
      const active = ref<"home" | "favorites" | "platforms">("home");
      return { args, active };
    },
    template: `
      <ZASliderBtnGroup
        v-bind="args"
        :model-value="active"
        :items="[
          { id: 'home', label: 'Startseite' },
          { id: 'favorites', label: 'Favoriten' },
          { id: 'platforms', label: 'Plattformen' },
        ]"
        @update:model-value="(v) => (active = v)"
      />
    `,
  }),
};

// Vertical tab pill — same aesthetic and sliding indicator as the
// horizontal tab variant, just stacked.
export const VerticalTab: Story = {
  args: { variant: "tab", orientation: "vertical" },
  render: (args) => ({
    components: { ZASliderBtnGroup },
    setup() {
      const tool = ref<"scan" | "upload" | "patcher">("scan");
      return { args, tool };
    },
    template: `
      <div style="display: inline-block;">
        <ZASliderBtnGroup
          v-bind="args"
          :model-value="tool"
          :items="[
            { id: 'scan', icon: 'mdi-magnify-scan', label: 'Durchsuchen', ariaLabel: 'Durchsuchen' },
            { id: 'upload', icon: 'mdi-cloud-upload-outline', label: 'Hochladen', ariaLabel: 'Hochladen' },
            { id: 'patcher', icon: 'mdi-file-cog-outline', label: 'Patcher', ariaLabel: 'Patcher' },
          ]"
          style="min-width: 200px;"
          @update:model-value="(v) => (tool = v)"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Die vertikale Ausrichtung stapelt Einträge in einer Spalte, während die Anzeige entlang der Y-Achse gleitet. Die visuelle Sprache entspricht dem horizontalen Reiter.",
      },
    },
  },
};

// Vertical segmented — icon-only column with the indicator following
// the active item. Useful as a side rail for view switchers.
export const VerticalSegmented: Story = {
  args: { variant: "segmented", orientation: "vertical" },
  render: (args) => ({
    components: { ZASliderBtnGroup },
    setup() {
      const view = ref<"grid" | "list" | "compact">("grid");
      return { args, view };
    },
    template: `
      <ZASliderBtnGroup
        v-bind="args"
        :model-value="view"
        :items="[
          { id: 'grid', icon: 'mdi-view-grid-outline', ariaLabel: 'Raster', title: 'Raster' },
          { id: 'list', icon: 'mdi-view-list', ariaLabel: 'Liste', title: 'Liste' },
          { id: 'compact', icon: 'mdi-view-sequential', ariaLabel: 'Kompakt', title: 'Kompakt' },
        ]"
        @update:model-value="(v) => (view = v)"
      />
    `,
  }),
};

export const Disabled: Story = {
  args: { variant: "segmented" },
  render: (args) => ({
    components: { ZASliderBtnGroup },
    setup() {
      const group = ref<"none" | "letter">("none");
      return { args, group };
    },
    template: `
      <ZASliderBtnGroup
        v-bind="args"
        :model-value="group"
        :items="[
          { id: 'none', icon: 'mdi-view-agenda-outline', ariaLabel: 'Flach' },
          { id: 'letter', icon: 'mdi-alphabetical-variant', ariaLabel: 'Nach Buchstaben', disabled: true },
        ]"
        @update:model-value="(v) => (group = v)"
      />
    `,
  }),
};
