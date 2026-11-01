import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onBeforeUnmount, onMounted } from "vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import ZATable from "./ZATable.vue";
import type { ZATableColumn } from "./types";

// Cast through `Meta` because ZATable is a generic component (`<T>`) —
// Vue's compiled type narrows T to `unknown` here, which Storybook's
// Meta<typeof ZATable> can't reconcile with our concrete DemoRow stories.
const meta: Meta = {
  title: "Daten/Zusammengesetzt/ZATable",
  // ZATable is generic, so its component-typed shape doesn't fit
  // Storybook's `component` slot. The cast is narrow + intentional.
  component: ZATable as never,
  parameters: compositionParameters("lib/data/ZATable/ZATable.stories.ts"),
  argTypes: {
    loading: { control: "boolean" },
    sortKey: { control: "text" },
    sortDir: {
      control: "select",
      options: ["asc", "desc"],
    },
    clickableRows: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj;

interface DemoRow {
  id: number;
  name: string;
  size: string;
  added: string;
  rating: number;
}

const COLUMNS: ZATableColumn[] = [
  {
    key: "name",
    label: "Titel",
    sortable: true,
    width: "minmax(0, 1.6fr)",
  },
  {
    key: "size",
    label: "Größe",
    sortable: true,
    width: "120px",
    skeletonWidth: 60,
  },
  {
    key: "added",
    label: "Hinzugefügt",
    sortable: true,
    width: "140px",
    skeletonWidth: 80,
  },
  {
    key: "rating",
    label: "Bewertung",
    sortable: true,
    width: "80px",
    skeletonWidth: 30,
  },
];

const ITEMS: DemoRow[] = [
  {
    id: 1,
    name: "Super Mario Bros.",
    size: "32 KB",
    added: "2024-01-12",
    rating: 9.4,
  },
  {
    id: 2,
    name: "Mega Man X",
    size: "1.2 MB",
    added: "2024-02-04",
    rating: 9.1,
  },
  {
    id: 3,
    name: "Chrono Trigger",
    size: "4.0 MB",
    added: "2024-02-21",
    rating: 9.8,
  },
  {
    id: 4,
    name: "Streets of Rage 2",
    size: "1.5 MB",
    added: "2024-03-09",
    rating: 8.7,
  },
];

export const Default: Story = {
  name: "Standard",
  args: {
    columns: COLUMNS,
    items: ITEMS,
    itemKey: "id",
    sortKey: "name",
    sortDir: "asc",
    clickableRows: true,
  },
  render: (args) => ({
    components: { ZATable },
    setup: () => ({ args }),
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 32px; background: #07070f;">
        <ZATable v-bind="args" />
      </div>
    `,
  }),
};

export const Loading: Story = {
  name: "Laden",
  args: {
    columns: COLUMNS,
    items: [] as DemoRow[],
    itemKey: "id",
    loading: true,
  },
  render: (args) => ({
    components: { ZATable },
    setup: () => ({ args }),
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 32px; background: #07070f;">
        <ZATable v-bind="args" />
      </div>
    `,
  }),
};

export const Empty: Story = {
  name: "Leer",
  args: {
    columns: COLUMNS,
    items: [] as DemoRow[],
    itemKey: "id",
    emptyIcon: "mdi-folder-search-outline",
    emptyMessage: "Keine Einträge vorhanden",
  },
  render: (args) => ({
    components: { ZATable },
    setup: () => ({ args }),
    template: `
      <div class="r-v2 r-v2-dark" style="padding: 32px; background: #07070f;">
        <ZATable v-bind="args" />
      </div>
    `,
  }),
};

// Mobile card-stack — on `xs` each row reflows into a stacked card with the
// column label as a per-cell caption (no `minWidth` set). The reflow keys off
// `<html data-bp~="xs">`, which Storybook doesn't install, so this story pins
// the attribute for its lifetime and restores it on teardown. Framed at a
// phone-ish width to mirror the real viewport.
export const MobileCardStack: Story = {
  name: "Mobile Kartenansicht",
  args: {
    columns: COLUMNS,
    items: ITEMS,
    itemKey: "id",
    sortKey: "name",
    sortDir: "asc",
  },
  render: (args) => ({
    components: { ZATable },
    setup: () => {
      const prev = document.documentElement.dataset.bp;
      onMounted(() => {
        document.documentElement.dataset.bp = "xs sm-and-down md-and-down";
      });
      onBeforeUnmount(() => {
        if (prev === undefined) delete document.documentElement.dataset.bp;
        else document.documentElement.dataset.bp = prev;
      });
      return { args };
    },
    template: `
      <div
        class="r-v2 r-v2-dark"
        style="padding: 24px; width: 380px; background: #07070f;"
      >
        <ZATable v-bind="args" />
      </div>
    `,
  }),
};
