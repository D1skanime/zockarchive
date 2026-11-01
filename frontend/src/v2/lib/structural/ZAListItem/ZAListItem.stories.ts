import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ZAList from "../ZAList/ZAList.vue";
import ZAListItem from "./ZAListItem.vue";

const meta: Meta<typeof ZAListItem> = {
  title: "Struktur/Grundbaustein/ZAListItem",
  component: ZAListItem,
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
    prependIcon: { control: "text" },
    appendIcon: { control: "text" },
    prependAvatar: { control: "text" },
    active: { control: "boolean" },
    disabled: { control: "boolean" },
    rounded: { control: "text" },
  },
  render: (args) => ({
    components: { ZAList, ZAListItem },
    setup: () => ({ args }),
    template: `
      <div style="width:300px;border:1px solid var(--r-color-border);border-radius:var(--r-radius-md);background:var(--r-color-bg-elevated)">
        <ZAList>
          <ZAListItem v-bind="args" />
        </ZAList>
      </div>
    `,
  }),
};

export default meta;

type Story = StoryObj<typeof ZAListItem>;

// Shared wrap snippet to keep the demos consistent.
const SHELL = `style="width:300px;border:1px solid var(--r-color-border);border-radius:var(--r-radius-md);background:var(--r-color-bg-elevated)"`;

// ── Defaults ────────────────────────────────────────────────────────

export const Default: Story = {
  args: { title: "Einfacher Eintrag" },
};

export const WithIcon: Story = {
  args: { title: "Mit vorangestelltem Symbol", prependIcon: "mdi-play" },
};

export const TwoLine: Story = {
  args: {
    title: "Zweizeilige Zeile",
    subtitle: "Untertitel steht hier",
    prependIcon: "mdi-star",
  },
};

export const Active: Story = {
  args: { title: "Aktiver Zustand", prependIcon: "mdi-cog", active: true },
};

export const Disabled: Story = {
  args: {
    title: "Deaktivierter Eintrag",
    subtitle: "Zeigerereignisse unterdrückt",
    prependIcon: "mdi-lock",
    disabled: true,
  },
};

// ── Prepend zone ────────────────────────────────────────────────────

export const PrependVariants: Story = {
  name: "Vorangestellt · Symbol / Avatar / Slot",
  render: () => ({
    components: { ZAList, ZAListItem },
    template: `
      <div ${SHELL}>
        <ZAList>
          <ZAListItem prepend-icon="mdi-account" title="Vorangestelltes Symbol" />
          <ZAListItem prepend-avatar="/assets/isotipo.svg" title="Vorangestellter Avatar" />
          <ZAListItem title="Benutzerdefinierter vorangestellter Slot">
            <template #prepend>
              <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;background:var(--r-color-success);color:white;font:600 11px/1 sans-serif">7</span>
            </template>
          </ZAListItem>
        </ZAList>
      </div>
    `,
  }),
};

export const AppendIcon: Story = {
  name: "Angehängtes Symbol (Chevron rechts)",
  render: () => ({
    components: { ZAList, ZAListItem },
    template: `
      <div ${SHELL}>
        <ZAList>
          <ZAListItem prepend-icon="mdi-account" title="Profil" append-icon="mdi-chevron-right" />
          <ZAListItem prepend-icon="mdi-bell" title="Benachrichtigungen" append-icon="mdi-chevron-right" />
          <ZAListItem prepend-icon="mdi-cog" title="Einstellungen" append-icon="mdi-chevron-right" />
        </ZAList>
      </div>
    `,
  }),
};

// ── Interactive ────────────────────────────────────────────────────

export const Interactive: Story = {
  name: "Klickbehandlung (interaktiv)",
  render: () => ({
    components: { ZAList, ZAListItem },
    setup() {
      const log = ref<string[]>([]);
      function fire(name: string) {
        log.value = [...log.value, `Geklickt: ${name}`].slice(-4);
      }
      return { log, fire };
    },
    template: `
      <div style="display:flex;gap:20px;align-items:flex-start">
        <div ${SHELL}>
          <ZAList>
            <ZAListItem prepend-icon="mdi-pencil" title="Bearbeiten" @click="fire('Bearbeiten')" />
            <ZAListItem prepend-icon="mdi-content-copy" title="Duplizieren" @click="fire('Duplizieren')" />
            <ZAListItem prepend-icon="mdi-share-variant" title="Teilen" @click="fire('Teilen')" />
            <ZAListItem prepend-icon="mdi-delete" title="Löschen" @click="fire('Löschen')" />
          </ZAList>
        </div>
        <div style="font:12px/1.5 monospace;color:var(--r-color-fg-muted);min-width:160px">
          <div style="margin-bottom:6px;color:var(--r-color-fg-faint)">Protokoll:</div>
          <div v-for="(l, i) in log" :key="i">{{ l }}</div>
          <div v-if="!log.length">(noch keine Klicks)</div>
        </div>
      </div>
    `,
  }),
};

export const NonInteractive: Story = {
  name: "Nur Anzeige (ohne Hover)",
  render: () => ({
    components: { ZAList, ZAListItem },
    template: `
      <div ${SHELL}>
        <ZAList>
          <ZAListItem prepend-icon="mdi-information" title="Schreibgeschützte Zeile" subtitle="Hover färbt nicht ein" />
          <ZAListItem prepend-icon="mdi-format-list-bulleted" title="Keine Klickbehandlung" subtitle="Kein to / href / @click" />
        </ZAList>
      </div>
    `,
  }),
};

// ── Polymorphic ─────────────────────────────────────────────────────

export const AsLink: Story = {
  name: "Polymorph (href / to)",
  render: () => ({
    components: { ZAList, ZAListItem },
    template: `
      <div ${SHELL}>
        <ZAList>
          <ZAListItem
            href="https://romm.app"
            target="_blank"
            prepend-icon="mdi-link-variant"
            append-icon="mdi-open-in-new"
            title="Externer Link (&lt;a&gt;)"
            subtitle="öffnet in neuem Tab"
          />
          <ZAListItem
            href="#"
            prepend-icon="mdi-account"
            title="Deaktivierter Anker"
            subtitle="href entfernt, Tastatur ohne Wirkung"
            disabled
          />
        </ZAList>
      </div>
    `,
  }),
};

// ── Gallery ─────────────────────────────────────────────────────────

export const Gallery: Story = {
  render: () => ({
    components: { ZAList, ZAListItem },
    template: `
      <div ${SHELL}>
        <ZAList>
          <ZAListItem title="Einfacher Eintrag" />
          <ZAListItem prepend-icon="mdi-play" title="Mit vorangestelltem Symbol" />
          <ZAListItem prepend-icon="mdi-star" title="Zweizeilige Zeile" subtitle="Untertitel steht hier" />
          <ZAListItem prepend-icon="mdi-cog" title="Aktiver Zustand" active />
          <ZAListItem prepend-icon="mdi-lock" title="Deaktiviert" disabled />
          <ZAListItem
            prepend-avatar="/assets/isotipo.svg"
            title="Mit Avatar"
            append-icon="mdi-chevron-right"
          />
        </ZAList>
      </div>
    `,
  }),
};
