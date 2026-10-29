import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import RDateField from "./RDateField.vue";

const meta: Meta<typeof RDateField> = {
  title: "Formulare/Grundbaustein/RDateField",
  component: RDateField,
  argTypes: {
    firstDayOfWeek: {
      control: "inline-radio",
      options: [0, 1, 2, 3, 4, 5, 6],
    },
    hideFooter: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof RDateField>;

export const Default: Story = {
  render: () => ({
    components: { RDateField },
    setup: () => ({ value: ref<Date | null>(null) }),
    template: `
      <div style="width:280px;padding:24px">
        <RDateField
          v-model="value"
          label="Veröffentlicht am"
          variant="outlined"
          prefix-label="stacked"
        />
        <p style="margin-top:12px;font:12px monospace;color:var(--r-color-fg-muted)">
          Datum: {{ value?.toISOString() ?? 'null' }}<br>
          Zeitstempel: {{ value?.getTime() ?? 'null' }}
        </p>
      </div>
    `,
  }),
};

export const Preloaded: Story = {
  name: "Vorbelegt (Zeitstempel)",
  render: () => ({
    components: { RDateField },
    setup: () => ({
      value: ref<number | Date | null>(1_700_000_000_000),
    }),
    template: `
      <div style="width:280px;padding:24px">
        <RDateField
          v-model="value"
          label="Veröffentlicht am"
          variant="outlined"
          prefix-label="stacked"
        />
      </div>
    `,
  }),
};

export const Compact: Story = {
  render: () => ({
    components: { RDateField },
    setup: () => ({ value: ref<Date | null>(null) }),
    template: `
      <div style="width:240px;padding:24px">
        <RDateField
          v-model="value"
          label="Datum"
          density="compact"
          variant="outlined"
          prefix-label="inline"
        />
      </div>
    `,
  }),
};

export const SundayFirst: Story = {
  name: "Woche beginnt am Sonntag",
  render: () => ({
    components: { RDateField },
    setup: () => ({ value: ref<Date | null>(null) }),
    template: `
      <div style="width:280px;padding:24px">
        <RDateField
          v-model="value"
          label="US-Format"
          variant="outlined"
          prefix-label="stacked"
          :first-day-of-week="0"
        />
      </div>
    `,
  }),
};

export const WithBounds: Story = {
  name: "Minimum / Maximum",
  render: () => ({
    components: { RDateField },
    setup: () => ({
      value: ref<Date | null>(null),
      min: new Date(2026, 4, 1),
      max: new Date(2026, 5, 30),
    }),
    template: `
      <div style="width:280px;padding:24px">
        <RDateField
          v-model="value"
          label="Nur Mai bis Juni 2026"
          variant="outlined"
          prefix-label="stacked"
          :min="min"
          :max="max"
        />
      </div>
    `,
  }),
};

export const NoFooter: Story = {
  name: "Ohne Fußzeile",
  render: () => ({
    components: { RDateField },
    setup: () => ({ value: ref<Date | null>(null) }),
    template: `
      <div style="width:280px;padding:24px">
        <RDateField
          v-model="value"
          label="Keine Schnellzugriffe"
          variant="outlined"
          prefix-label="stacked"
          hide-footer
        />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { RDateField },
    setup: () => ({ value: ref(new Date("2026-05-14")) }),
    template: `
      <div style="width:280px;padding:24px">
        <RDateField
          v-model="value"
          label="Gesperrtes Datum"
          variant="outlined"
          prefix-label="stacked"
          disabled
        />
      </div>
    `,
  }),
};
