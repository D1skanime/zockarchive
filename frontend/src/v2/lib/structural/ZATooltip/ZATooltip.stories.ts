import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, waitFor, within } from "storybook/test";
import { ref } from "vue";
import ZABtn from "@/v2/lib/primitives/ZABtn/ZABtn.vue";
import ZAIcon from "@/v2/lib/primitives/ZAIcon/ZAIcon.vue";
import ZATooltip from "./ZATooltip.vue";
import { firePointerEnter, fireTap } from "./storyInteractionEvents";

const meta: Meta<typeof ZATooltip> = {
  title: "Struktur/Grundbaustein/ZATooltip",
  component: ZATooltip,
  argTypes: {
    text: { control: "text" },
    location: {
      control: "select",
      options: [
        "top",
        "bottom",
        "start",
        "end",
        "top start",
        "top end",
        "bottom start",
        "bottom end",
      ],
    },
    openDelay: { control: "number" },
    closeDelay: { control: "number" },
    offset: { control: "number" },
    contentClass: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof ZATooltip>;

export const Default: Story = {
  name: "Standard · Slot-Auslöser",
  args: { text: "Speichern Sie Ihren Fortschritt", location: "top" },
  render: (args) => ({
    components: { ZATooltip, ZABtn },
    setup: () => ({ args }),
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <ZATooltip v-bind="args">
          <template #activator="{ props }">
          <ZABtn v-bind="props" prepend-icon="mdi-content-save">Speichern</ZABtn>
          </template>
        </ZATooltip>
      </div>
    `,
  }),
};

export const ParentAttach: Story = {
  name: "An Elternelement anhängen (ohne Slot)",
  render: () => ({
    components: { ZATooltip, ZABtn },
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <ZABtn icon="mdi-delete" variant="translucent" aria-label="Diesen Eintrag löschen">
          <ZATooltip activator="parent" text="Diesen Eintrag löschen" location="top" />
        </ZABtn>
      </div>
    `,
  }),
};

export const PlacementCardinals: Story = {
  name: "Positionierung · Himmelsrichtungen",
  render: () => ({
    components: { ZATooltip, ZABtn },
    template: `
      <div style="padding:80px;display:flex;gap:24px;flex-wrap:wrap;justify-content:center">
        <ZATooltip text="Tooltip oben" location="top">
          <template #activator="{ props }">
            <ZABtn v-bind="props" icon="mdi-arrow-up" aria-label="Tooltip oben" />
          </template>
        </ZATooltip>
        <ZATooltip text="Tooltip am Ende" location="end">
          <template #activator="{ props }">
            <ZABtn v-bind="props" icon="mdi-arrow-right" aria-label="Tooltip am Ende" />
          </template>
        </ZATooltip>
        <ZATooltip text="Tooltip unten" location="bottom">
          <template #activator="{ props }">
            <ZABtn v-bind="props" icon="mdi-arrow-down" aria-label="Tooltip unten" />
          </template>
        </ZATooltip>
        <ZATooltip text="Tooltip am Anfang" location="start">
          <template #activator="{ props }">
            <ZABtn v-bind="props" icon="mdi-arrow-left" aria-label="Tooltip am Anfang" />
          </template>
        </ZATooltip>
      </div>
    `,
  }),
};

export const PlacementDiagonals: Story = {
  name: "Positionierung · Diagonalen",
  render: () => ({
    components: { ZATooltip, ZABtn },
    template: `
      <div style="padding:80px;display:grid;grid-template-columns:repeat(4,auto);gap:24px;justify-content:center">
        <ZATooltip text="top-start" location="top start">
          <template #activator="{ props }">
            <ZABtn v-bind="props" size="small">top-start</ZABtn>
          </template>
        </ZATooltip>
        <ZATooltip text="top-end" location="top end">
          <template #activator="{ props }">
            <ZABtn v-bind="props" size="small">top-end</ZABtn>
          </template>
        </ZATooltip>
        <ZATooltip text="bottom-start" location="bottom start">
          <template #activator="{ props }">
            <ZABtn v-bind="props" size="small">bottom-start</ZABtn>
          </template>
        </ZATooltip>
        <ZATooltip text="bottom-end" location="bottom end">
          <template #activator="{ props }">
            <ZABtn v-bind="props" size="small">bottom-end</ZABtn>
          </template>
        </ZATooltip>
      </div>
    `,
  }),
};

export const FlipNearEdge: Story = {
  name: "Automatisches Umklappen am Fensterrand",
  render: () => ({
    components: { ZATooltip, ZABtn },
    template: `
      <div style="height:400px;display:flex;justify-content:space-between;align-items:flex-start;padding:8px">
        <ZATooltip text="Am linken Rand wechselt der gewünschte Anfang zum Ende" location="start">
          <template #activator="{ props }">
            <ZABtn v-bind="props" prepend-icon="mdi-arrow-left">Zeige auf mich</ZABtn>
          </template>
        </ZATooltip>
        <ZATooltip text="Am rechten Rand wechselt das gewünschte Ende zum Anfang" location="end">
          <template #activator="{ props }">
            <ZABtn v-bind="props" prepend-icon="mdi-arrow-right">Zeige auf mich</ZABtn>
          </template>
        </ZATooltip>
      </div>
    `,
  }),
};

export const LongText: Story = {
  name: "Langer Text",
  args: {
    text: "Durchsucht den gewählten Bibliothekspfad, ordnet neue ROMs den konfigurierten Metadatenanbietern zu und aktualisiert das Artwork vorhandener Einträge.",
    location: "top",
  },
  render: (args) => ({
    components: { ZATooltip, ZABtn },
    setup: () => ({ args }),
    template: `
      <div style="padding:80px;display:flex;justify-content:center">
        <ZATooltip v-bind="args">
          <template #activator="{ props }">
            <ZABtn v-bind="props" prepend-icon="mdi-refresh">Vollständiger Scan</ZABtn>
          </template>
        </ZATooltip>
      </div>
    `,
  }),
};

export const CustomContent: Story = {
  name: "Benutzerdefinierter Slot-Inhalt",
  render: () => ({
    components: { ZATooltip, ZABtn, ZAIcon },
    template: `
      <div style="padding:80px;display:flex;justify-content:center">
        <ZATooltip location="top">
          <template #activator="{ props }">
            <ZABtn v-bind="props" icon="mdi-keyboard" aria-label="Tastenkürzel">Tastenkürzel</ZABtn>
          </template>
          <div style="display:flex;flex-direction:column;gap:4px">
            <div style="display:flex;align-items:center;gap:8px">
              <ZAIcon icon="mdi-keyboard-space" size="x-small" />
              <span>Palette öffnen</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:var(--r-color-fg-muted)">
              <ZAIcon icon="mdi-apple-keyboard-command" size="x-small" />
              <span>+ K zum Fokussieren</span>
            </div>
          </div>
        </ZATooltip>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  name: "Deaktiviert (ohne Wirkung)",
  args: {
    text: "Sie sollten mich nicht sehen",
    location: "top",
    disabled: true,
  },
  render: (args) => ({
    components: { ZATooltip, ZABtn },
    setup: () => ({ args }),
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <ZATooltip v-bind="args">
          <template #activator="{ props }">
            <ZABtn v-bind="props" variant="translucent">Zeige auf mich, nichts passiert</ZABtn>
          </template>
        </ZATooltip>
      </div>
    `,
  }),
};

export const Delays: Story = {
  name: "Öffnungs- und Schließverzögerungen",
  render: () => ({
    components: { ZATooltip, ZABtn },
    template: `
      <div style="padding:60px;display:flex;gap:18px;justify-content:center;flex-wrap:wrap">
        <ZATooltip text="sofort (0 ms)" :open-delay="0" location="top">
          <template #activator="{ props }">
            <ZABtn v-bind="props">0 ms</ZABtn>
          </template>
        </ZATooltip>
        <ZATooltip text="Standard 300 ms" location="top">
          <template #activator="{ props }">
            <ZABtn v-bind="props">300 ms</ZABtn>
          </template>
        </ZATooltip>
        <ZATooltip text="langsam 800 ms" :open-delay="800" location="top">
          <template #activator="{ props }">
            <ZABtn v-bind="props">800 ms</ZABtn>
          </template>
        </ZATooltip>
        <ZATooltip text="verzögertes Schließen · 600 ms" :close-delay="600" location="top">
          <template #activator="{ props }">
            <ZABtn v-bind="props">verzögert</ZABtn>
          </template>
        </ZATooltip>
      </div>
    `,
  }),
};

export const Controlled: Story = {
  name: "Gesteuert (v-model)",
  render: () => ({
    components: { ZATooltip, ZABtn },
    setup: () => {
      const open = ref(false);
      return { open };
    },
    template: `
      <div style="padding:60px;display:flex;flex-direction:column;gap:24px;align-items:center">
        <ZATooltip v-model="open" text="Die Schaltfläche darunter schaltet um, Hover bewirkt hier nichts." location="top">
          <template #activator="{ props }">
            <ZABtn v-bind="props" prepend-icon="mdi-cursor-default-outline">Hover-Ziel</ZABtn>
          </template>
        </ZATooltip>
        <ZABtn :variant="open ? 'flat' : 'translucent'" @click="open = !open">
          {{ open ? "Tooltip ausblenden" : "Tooltip anzeigen" }}
        </ZABtn>
      </div>
    `,
  }),
};

export const OffsetLadder: Story = {
  name: "Abstandsstufen",
  render: () => ({
    components: { ZATooltip, ZABtn },
    template: `
      <div style="padding:80px;display:flex;gap:18px;justify-content:center;flex-wrap:wrap">
        <ZATooltip text="Abstand 0 (bündig)" :offset="0" location="top">
          <template #activator="{ props }">
            <ZABtn v-bind="props">0</ZABtn>
          </template>
        </ZATooltip>
        <ZATooltip text="Abstand 6 (Standard)" location="top">
          <template #activator="{ props }">
            <ZABtn v-bind="props">6</ZABtn>
          </template>
        </ZATooltip>
        <ZATooltip text="Abstand 14 (weit)" :offset="14" location="top">
          <template #activator="{ props }">
            <ZABtn v-bind="props">14</ZABtn>
          </template>
        </ZATooltip>
      </div>
    `,
  }),
};

export const IconBarRealWorld: Story = {
  name: "Symbol-Werkzeugleiste (Praxisbeispiel)",
  render: () => ({
    components: { ZATooltip, ZABtn },
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <div style="display:flex;gap:4px;padding:6px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:10px">
          <ZATooltip text="Filter" location="bottom">
            <template #activator="{ props }">
              <ZABtn v-bind="props" icon="mdi-filter" variant="text" aria-label="Filter" />
            </template>
          </ZATooltip>
          <ZATooltip text="Sortieren" location="bottom">
            <template #activator="{ props }">
              <ZABtn v-bind="props" icon="mdi-sort-variant" variant="text" aria-label="Sortieren" />
            </template>
          </ZATooltip>
          <ZATooltip text="Suche" location="bottom">
            <template #activator="{ props }">
              <ZABtn v-bind="props" icon="mdi-magnify" variant="text" aria-label="Suche" />
            </template>
          </ZATooltip>
          <ZATooltip text="Weitere Aktionen" location="bottom">
            <template #activator="{ props }">
              <ZABtn v-bind="props" icon="mdi-dots-vertical" variant="text" aria-label="Weitere Aktionen" />
            </template>
          </ZATooltip>
        </div>
      </div>
    `,
  }),
};

export const TouchGating: Story = {
  name: "Berührungsbegrenzung (play)",
  args: { text: "Tooltip-Inhalt", location: "top", openDelay: 0 },
  render: (args) => ({
    components: { ZATooltip, ZABtn },
    setup: () => ({ args }),
    template: `
      <div class="r-v2 r-v2-dark" style="padding:48px;display:flex;justify-content:center;background:#07070f">
        <ZATooltip v-bind="args">
          <template #activator="{ props }">
            <ZABtn v-bind="props">Hover-Ziel</ZABtn>
          </template>
        </ZATooltip>
      </div>
    `,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    // The tooltip teleports to <body>, outside canvasElement.
    const body = within(document.body);
    const activator = canvas.getByRole("button", { name: /hover-ziel/i });

    await step("a touch hover does NOT reveal the tooltip", async () => {
      firePointerEnter(activator, "touch");
      await new Promise((r) => setTimeout(r, 50));
      expect(body.queryByRole("tooltip")).toBeNull();
    });

    await step("a mouse hover reveals it", async () => {
      firePointerEnter(activator, "mouse");
      const tip = await body.findByRole("tooltip");
      expect(tip).toHaveTextContent("Tooltip-Inhalt");
    });

    await step("a click dismisses it", async () => {
      activator.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await waitFor(() => expect(body.queryByRole("tooltip")).toBeNull());
    });
  },
};

export const OpenOnTap: Story = {
  name: "Per Tippen öffnen (play)",
  args: {
    text: "Tooltip-Inhalt",
    location: "top",
    openOnTap: true,
    openDelay: 0,
  },
  render: (args) => ({
    components: { ZATooltip, ZABtn },
    setup: () => ({ args }),
    template: `
      <div class="r-v2 r-v2-dark" style="padding:48px;display:flex;justify-content:center;background:#07070f">
        <ZATooltip v-bind="args">
          <template #activator="{ props }">
            <ZABtn v-bind="props">Tippen-Ziel</ZABtn>
          </template>
        </ZATooltip>
      </div>
    `,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const activator = canvas.getByRole("button", { name: /tippen-ziel/i });

    await step("a touch tap reveals the tooltip", async () => {
      fireTap(activator, "touch");
      const tip = await body.findByRole("tooltip");
      expect(tip).toHaveTextContent("Tooltip-Inhalt");
    });

    await step("a second touch tap toggles it closed", async () => {
      fireTap(activator, "touch");
      await waitFor(() => expect(body.queryByRole("tooltip")).toBeNull());
    });

    await step("a mouse click opens it", async () => {
      fireTap(activator, "mouse");
      expect(await body.findByRole("tooltip")).toBeInTheDocument();
    });

    await step(
      "a second mouse click keeps it open (no toggle-closed)",
      async () => {
        fireTap(activator, "mouse");
        expect(body.queryByRole("tooltip")).not.toBeNull();
      },
    );
  },
};

export const FormHelper: Story = {
  name: "Formularfeld-Hilfe (am Elternelement)",
  render: () => ({
    components: { ZATooltip },
    template: `
      <div style="padding:32px;display:flex;flex-direction:column;gap:8px;width:320px;margin:0 auto">
        <label style="display:flex;align-items:center;gap:6px;font:12px sans-serif;color:var(--r-color-fg-muted)">
          API-Token
          <span
            style="display:inline-flex;width:14px;height:14px;align-items:center;justify-content:center;border-radius:50%;border:1px solid var(--r-color-border-strong);color:var(--r-color-fg-muted);font-size:10px;cursor:help"
          >
            ?
            <ZATooltip activator="parent" location="top" text="Token werden bei der Erstellung nur einmal gezeigt, bewahren Sie Ihren sicher auf." />
          </span>
        </label>
        <div style="padding:8px 10px;border:1px solid var(--r-color-border);border-radius:6px;background:var(--r-color-bg-elevated);font:13px/1.4 monospace;color:var(--r-color-fg-muted)">
          xxxxx-xxxxx-xxxxx-xxxxx
        </div>
      </div>
    `,
  }),
};
