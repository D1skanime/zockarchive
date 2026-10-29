import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import RTag from "@/v2/lib/primitives/RTag/RTag.vue";
import RCollapsible from "./RCollapsible.vue";

const meta: Meta<typeof RCollapsible> = {
  title: "Struktur/Grundbaustein/RCollapsible",
  component: RCollapsible,
  argTypes: {
    title: { control: "text" },
    icon: { control: "text" },
    defaultOpen: { control: "boolean" },
    disabled: { control: "boolean" },
    attached: { control: "boolean" },
  },
  render: (args) => ({
    components: { RCollapsible },
    setup: () => {
      const open = ref(args.defaultOpen ?? false);
      return { args, open };
    },
    template: `
      <RCollapsible v-model="open" v-bind="args">
        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: var(--r-color-fg-secondary);">
          Dies ist der Inhalt des Bereichs. Ein Klick auf die Kopfzeile wechselt den Öffnungszustand.
          Der Grid-Row-Trick interpoliert die Höhe ohne Pixel zu messen.
        </p>
      </RCollapsible>
    `,
  }),
};

export default meta;
type Story = StoryObj<typeof RCollapsible>;

export const Default: Story = {
  name: "Standard",
  args: { title: "Weitere Details" },
};

export const Open: Story = {
  name: "Bereits geöffnet",
  args: { title: "Bereits geöffnet", defaultOpen: true },
};

export const WithIcon: Story = {
  name: "Mit vorangestelltem Symbol",
  args: {
    title: "Mit vorangestelltem Symbol",
    icon: "mdi-information-outline",
  },
};

// `#header-append` slot — content between the title and the chevron.
// Used by ScanPlatform for ROM-count / firmware / "not identified"
// chips, but generic enough for any badge / counter use.
export const WithHeaderAppend: Story = {
  name: "Kopfzeilen-Anhang (Chips)",
  render: () => ({
    components: { RCollapsible, RTag },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="max-width: 380px">
        <RCollapsible v-model="open" title="Super Nintendo" icon="mdi-controller">
          <template #header-append>
            <RTag tone="brand" size="x-small" text="142" />
            <RTag tone="warning" size="x-small" icon="mdi-memory" text="3" />
          </template>
          <p style="margin: 0; font-size: 13px; color: var(--r-color-fg-secondary);">
            Slot-Inhalt steht zwischen Titel und Chevron, ideal für Zähler,
            Status-Chips oder Schnellaktionen in der Kopfzeile.
          </p>
        </RCollapsible>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  name: "Deaktiviert",
  args: { title: "Gesperrt", disabled: true },
};

// Headless mode — no internal header, panel driven entirely by an
// external trigger (here a button rendered alongside).
export const Headless: Story = {
  render: () => ({
    components: { RCollapsible },
    setup: () => {
      const open = ref(false);
      return { open };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px; max-width: 320px;">
        <button
          type="button"
          @click="open = !open"
          style="
            appearance: none; border: none; cursor: pointer;
            text-align: left;
            padding: 8px 12px;
            border-radius: var(--r-radius-md);
            background: color-mix(in srgb, var(--r-color-brand-primary) 18%, transparent);
            color: var(--r-color-brand-primary);
            font-family: inherit; font-size: 12px; font-weight: 500;
          "
        >
          Externer Auslöser ({{ open ? 'geöffnet' : 'geschlossen' }})
        </button>
        <RCollapsible :model-value="open">
          <div style="padding: 12px; font-size: 12px; color: var(--r-color-fg-secondary);">
            Headless: Die übergeordnete Komponente steuert den Wechsel, das Grundelement animiert nur.
          </div>
        </RCollapsible>
      </div>
    `,
  }),
};

// Attached mode — drops the top radius/border so the panel sits flush
// with the trigger above it.
export const Attached: Story = {
  render: () => ({
    components: { RCollapsible },
    setup: () => {
      const open = ref(true);
      return { open };
    },
    template: `
      <div style="display: flex; flex-direction: column; max-width: 320px;">
        <button
          type="button"
          @click="open = !open"
          style="
            appearance: none; border: 1px solid var(--r-color-border); cursor: pointer;
            text-align: left;
            padding: 10px 14px;
            border-radius: var(--r-radius-md) var(--r-radius-md) 0 0;
            background: var(--r-color-bg-elevated);
            color: var(--r-color-fg);
            font-family: inherit; font-size: 13px; font-weight: 600;
            border-bottom: none;
          "
        >
          Auslöserzeile (nur oben abgerundet)
        </button>
        <RCollapsible :model-value="open" attached>
          <div style="padding: 12px 14px; font-size: 12px; color: var(--r-color-fg-secondary);">
            Angedockt: Der Bereich behält die untere Rundung und verschmilzt visuell mit dem Auslöser.
          </div>
        </RCollapsible>
      </div>
    `,
  }),
};
