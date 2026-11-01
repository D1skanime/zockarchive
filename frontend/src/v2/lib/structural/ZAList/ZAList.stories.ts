import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ZAListItem from "../ZAListItem/ZAListItem.vue";
import ZAList from "./ZAList.vue";

const meta: Meta<typeof ZAList> = {
  title: "Struktur/Grundbaustein/ZAList",
  component: ZAList,
  argTypes: {
    density: {
      control: "select",
      options: ["default", "comfortable", "compact"],
    },
    rounded: { control: "text" },
    color: { control: "text" },
    bgColor: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof ZAList>;

// Reusable wrap so stories share the framing chrome.
const SHELL = `style="width:280px;border:1px solid var(--r-color-border);border-radius:var(--r-radius-md);background:var(--r-color-bg-elevated)"`;

// ── Defaults ────────────────────────────────────────────────────────

export const Navigation: Story = {
  render: (args) => ({
    components: { ZAList, ZAListItem },
    setup: () => ({ args }),
    template: `
      <div ${SHELL}>
        <ZAList v-bind="args">
          <ZAListItem prepend-icon="mdi-home" title="Startseite" active />
          <ZAListItem prepend-icon="mdi-controller" title="Plattformen" />
          <ZAListItem prepend-icon="mdi-bookmark-box-multiple" title="Sammlungen" />
          <ZAListItem prepend-icon="mdi-magnify" title="Suche" />
          <ZAListItem prepend-icon="mdi-cog" title="Einstellungen" />
        </ZAList>
      </div>
    `,
  }),
};

// ── Density ─────────────────────────────────────────────────────────

export const Density: Story = {
  name: "Dichtekomprimierung",
  render: () => ({
    components: { ZAList, ZAListItem },
    template: `
      <div style="display:flex;gap:18px">
        <div ${SHELL}>
          <ZAList density="default">
            <ZAListItem prepend-icon="mdi-home" title="Standard" />
            <ZAListItem prepend-icon="mdi-controller" title="Dichte" />
            <ZAListItem prepend-icon="mdi-magnify" title="Geräumig" />
          </ZAList>
        </div>
        <div ${SHELL}>
          <ZAList density="comfortable">
            <ZAListItem prepend-icon="mdi-home" title="Komfortabel" />
            <ZAListItem prepend-icon="mdi-controller" title="Dichte" />
            <ZAListItem prepend-icon="mdi-magnify" title="Mitteldicht" />
          </ZAList>
        </div>
        <div ${SHELL}>
          <ZAList density="compact">
            <ZAListItem prepend-icon="mdi-home" title="Kompakt" />
            <ZAListItem prepend-icon="mdi-controller" title="Dichte" />
            <ZAListItem prepend-icon="mdi-magnify" title="Dichte Zeilen" />
          </ZAList>
        </div>
      </div>
    `,
  }),
};

// ── Active tone ─────────────────────────────────────────────────────

export const ActiveColor: Story = {
  name: "Aktiver Farbton (color-Eigenschaft)",
  render: () => ({
    components: { ZAList, ZAListItem },
    template: `
      <div style="display:flex;gap:18px">
        <div ${SHELL}>
          <ZAList color="primary">
            <ZAListItem prepend-icon="mdi-home" title="primary" active />
            <ZAListItem prepend-icon="mdi-controller" title="Aktiver Farbton" />
          </ZAList>
        </div>
        <div ${SHELL}>
          <ZAList color="success">
            <ZAListItem prepend-icon="mdi-home" title="success" active />
            <ZAListItem prepend-icon="mdi-controller" title="Aktiver Farbton" />
          </ZAList>
        </div>
        <div ${SHELL}>
          <ZAList color="danger">
            <ZAListItem prepend-icon="mdi-home" title="danger" active />
            <ZAListItem prepend-icon="mdi-controller" title="Aktiver Farbton" />
          </ZAList>
        </div>
      </div>
    `,
  }),
};

// ── Background paint ────────────────────────────────────────────────

export const SelfPainted: Story = {
  name: "Eigenständig gefärbte Liste (bgColor)",
  render: () => ({
    components: { ZAList, ZAListItem },
    template: `
      <ZAList bg-color="var(--r-color-bg-elevated)" style="width:280px;border:1px solid var(--r-color-border)">
        <ZAListItem prepend-icon="mdi-account" title="Mit gesetztem bgColor" />
        <ZAListItem prepend-icon="mdi-bell" title="Kein äußerer Wrapper nötig" />
        <ZAListItem prepend-icon="mdi-cog" title="Liste färbt sich selbst" />
      </ZAList>
    `,
  }),
};

// ── Real-world ──────────────────────────────────────────────────────

export const SidebarNav: Story = {
  name: "Seitennavigation (Einstellungsleiste)",
  render: () => ({
    components: { ZAList, ZAListItem },
    template: `
      <div ${SHELL}>
        <ZAList>
          <ZAListItem prepend-icon="mdi-account-circle" title="Benutzerprofil" />
          <ZAListItem prepend-icon="mdi-palette" title="Benutzeroberfläche" active />
          <ZAListItem prepend-icon="mdi-key-variant" title="Client-API-Token" />
          <ZAListItem prepend-icon="mdi-shield-account" title="Verwaltung" />
          <ZAListItem prepend-icon="mdi-folder-multiple-outline" title="Bibliotheksverwaltung" />
          <ZAListItem prepend-icon="mdi-database" title="Metadatenquellen" />
        </ZAList>
      </div>
    `,
  }),
};

export const UserMenu: Story = {
  name: "Benutzermenü (mit Untertitel)",
  render: () => ({
    components: { ZAList, ZAListItem },
    template: `
      <div ${SHELL}>
        <ZAList density="comfortable">
          <ZAListItem
            prepend-avatar="/assets/isotipo.svg"
            title="RomM Admin"
            subtitle="Admin · zuletzt vor 3 Min. gesehen"
          />
          <ZAListItem prepend-icon="mdi-account" title="Dein Profil" />
          <ZAListItem prepend-icon="mdi-cog" title="Einstellungen" />
          <ZAListItem prepend-icon="mdi-theme-light-dark" title="Farbschema wechseln" append-icon="mdi-chevron-right" />
          <ZAListItem prepend-icon="mdi-logout" title="Abmelden" />
        </ZAList>
      </div>
    `,
  }),
};
