import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ZAVirtualScroller from "./ZAVirtualScroller.vue";

const meta: Meta<typeof ZAVirtualScroller> = {
  title: "Struktur/Grundbaustein/ZAVirtualScroller",
  component: ZAVirtualScroller,
  argTypes: {
    overscan: { control: "number" },
    height: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof ZAVirtualScroller>;

const longList = Array.from({ length: 5000 }, (_, i) => ({
  id: i,
  label: `Zeile ${i + 1}`,
}));

export const FiveThousandRows: Story = {
  args: {
    items: longList,
    getItemHeight: () => 44,
    overscan: 25,
    height: 480,
  },
  render: (args) => ({
    components: { ZAVirtualScroller },
    setup: () => ({ args }),
    template: `
      <div style="width: 320px; border: 1px solid var(--r-color-border); border-radius: var(--r-radius-md); background: var(--r-color-bg-elevated)">
        <ZAVirtualScroller v-bind="args">
          <template #default="{ item, index }">
            <div style="display:flex;align-items:center;padding:0 var(--r-space-3);height:44px;border-bottom:1px solid var(--r-color-border);font-size:var(--r-font-size-sm);">
              <span style="opacity:0.5;width:48px">#{{ index }}</span>
              <span>{{ item.label }}</span>
            </div>
          </template>
        </ZAVirtualScroller>
      </div>
    `,
  }),
};

// Prepend + sticky — verifies the two layout slots: a hero block that
// scrolls naturally with the list, and a toolbar that pins to the top
// once the user scrolls past the hero. Native CSS sticky drives the
// pin — no JS scroll tracking.
export const PrependAndStickyToolbar: Story = {
  args: {
    items: longList,
    getItemHeight: () => 44,
    overscan: 25,
    height: 480,
  },
  render: (args) => ({
    components: { ZAVirtualScroller },
    setup: () => ({ args }),
    template: `
      <div style="width: 360px; border: 1px solid var(--r-color-border); border-radius: var(--r-radius-md); background: var(--r-color-bg-elevated)">
        <ZAVirtualScroller v-bind="args">
          <template #prepend>
            <div style="padding: var(--r-space-4); background: var(--r-color-bg-subtle); border-bottom: 1px solid var(--r-color-border);">
              <div style="font-weight: var(--r-font-weight-bold); font-size: var(--r-font-size-lg);">Kopfbereich</div>
              <div style="opacity: 0.7; font-size: var(--r-font-size-sm)">Scrollt mit der Liste</div>
            </div>
          </template>
          <template #sticky>
            <div style="display:flex;align-items:center;height:48px;padding:0 var(--r-space-3);background: var(--r-color-bg-elevated);border-bottom: 1px solid var(--r-color-border);font-size:var(--r-font-size-sm);font-weight: var(--r-font-weight-semibold);">
              Fixierte Werkzeugleiste (bleibt beim Scrollen sichtbar)
            </div>
          </template>
          <template #default="{ item, index }">
            <div style="display:flex;align-items:center;padding:0 var(--r-space-3);height:44px;border-bottom:1px solid var(--r-color-border);font-size:var(--r-font-size-sm);">
              <span style="opacity:0.5;width:48px">#{{ index }}</span>
              <span>{{ item.label }}</span>
            </div>
          </template>
        </ZAVirtualScroller>
      </div>
    `,
  }),
};

// Variable per-row heights — exercises binary search and exact offsets.
const variableList = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  label: `Zeile ${i + 1}`,
  size: i % 5 === 0 ? "tall" : "short",
}));

export const VariableHeights: Story = {
  args: {
    items: variableList,
    getItemHeight: (item: unknown) =>
      (item as { size: string }).size === "tall" ? 80 : 32,
    overscan: 12,
    height: 480,
  },
  render: (args) => ({
    components: { ZAVirtualScroller },
    setup: () => ({ args }),
    template: `
      <div style="width: 320px; border: 1px solid var(--r-color-border); border-radius: var(--r-radius-md); background: var(--r-color-bg-elevated)">
        <ZAVirtualScroller v-bind="args">
          <template #default="{ item, index }">
            <div :style="{
              display: 'flex',
              alignItems: 'center',
              padding: '0 var(--r-space-3)',
              height: item.size === 'tall' ? '80px' : '32px',
              borderBottom: '1px solid var(--r-color-border)',
              fontSize: 'var(--r-font-size-sm)',
              fontWeight: item.size === 'tall' ? 'var(--r-font-weight-semibold)' : 'normal',
            }">
              <span style="opacity:0.5;width:48px">#{{ index }}</span>
              <span>{{ item.label }} ({{ item.size === 'tall' ? 'hoch' : 'niedrig' }})</span>
            </div>
          </template>
        </ZAVirtualScroller>
      </div>
    `,
  }),
};
