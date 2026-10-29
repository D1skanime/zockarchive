import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RListItem from "../RListItem/RListItem.vue";
import RList from "./RList.vue";

const meta: Meta<typeof RList> = {
  title: "Struktur/Grundbaustein/RList",
  component: RList,
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

type Story = StoryObj<typeof RList>;

// Reusable wrap so stories share the framing chrome.
const SHELL = `style="width:280px;border:1px solid var(--r-color-border);border-radius:var(--r-radius-md);background:var(--r-color-bg-elevated)"`;

// ── Defaults ────────────────────────────────────────────────────────

export const Navigation: Story = {
  render: (args) => ({
    components: { RList, RListItem },
    setup: () => ({ args }),
    template: `
      <div ${SHELL}>
        <RList v-bind="args">
          <RListItem prepend-icon="mdi-home" title="Startseite" active />
          <RListItem prepend-icon="mdi-controller" title="Plattformen" />
          <RListItem prepend-icon="mdi-bookmark-box-multiple" title="Sammlungen" />
          <RListItem prepend-icon="mdi-magnify" title="Suche" />
          <RListItem prepend-icon="mdi-cog" title="Einstellungen" />
        </RList>
      </div>
    `,
  }),
};

// ── Density ─────────────────────────────────────────────────────────

export const Density: Story = {
  name: "Dichtekomprimierung",
  render: () => ({
    components: { RList, RListItem },
    template: `
      <div style="display:flex;gap:18px">
        <div ${SHELL}>
          <RList density="default">
            <RListItem prepend-icon="mdi-home" title="Standard" />
            <RListItem prepend-icon="mdi-controller" title="Dichte" />
            <RListItem prepend-icon="mdi-magnify" title="Geräumig" />
          </RList>
        </div>
        <div ${SHELL}>
          <RList density="comfortable">
            <RListItem prepend-icon="mdi-home" title="Komfortabel" />
            <RListItem prepend-icon="mdi-controller" title="Dichte" />
            <RListItem prepend-icon="mdi-magnify" title="Mitteldicht" />
          </RList>
        </div>
        <div ${SHELL}>
          <RList density="compact">
            <RListItem prepend-icon="mdi-home" title="Kompakt" />
            <RListItem prepend-icon="mdi-controller" title="Dichte" />
            <RListItem prepend-icon="mdi-magnify" title="Dichte Zeilen" />
          </RList>
        </div>
      </div>
    `,
  }),
};

// ── Active tone ─────────────────────────────────────────────────────

export const ActiveColor: Story = {
  name: "Aktiver Farbton (color-Eigenschaft)",
  render: () => ({
    components: { RList, RListItem },
    template: `
      <div style="display:flex;gap:18px">
        <div ${SHELL}>
          <RList color="primary">
            <RListItem prepend-icon="mdi-home" title="primary" active />
            <RListItem prepend-icon="mdi-controller" title="Aktiver Farbton" />
          </RList>
        </div>
        <div ${SHELL}>
          <RList color="success">
            <RListItem prepend-icon="mdi-home" title="success" active />
            <RListItem prepend-icon="mdi-controller" title="Aktiver Farbton" />
          </RList>
        </div>
        <div ${SHELL}>
          <RList color="danger">
            <RListItem prepend-icon="mdi-home" title="danger" active />
            <RListItem prepend-icon="mdi-controller" title="Aktiver Farbton" />
          </RList>
        </div>
      </div>
    `,
  }),
};

// ── Background paint ────────────────────────────────────────────────

export const SelfPainted: Story = {
  name: "Eigenständig gefärbte Liste (bgColor)",
  render: () => ({
    components: { RList, RListItem },
    template: `
      <RList bg-color="var(--r-color-bg-elevated)" style="width:280px;border:1px solid var(--r-color-border)">
        <RListItem prepend-icon="mdi-account" title="Mit gesetztem bgColor" />
        <RListItem prepend-icon="mdi-bell" title="Kein äußerer Wrapper nötig" />
        <RListItem prepend-icon="mdi-cog" title="Liste färbt sich selbst" />
      </RList>
    `,
  }),
};

// ── Real-world ──────────────────────────────────────────────────────

export const SidebarNav: Story = {
  name: "Seitennavigation (Einstellungsleiste)",
  render: () => ({
    components: { RList, RListItem },
    template: `
      <div ${SHELL}>
        <RList>
          <RListItem prepend-icon="mdi-account-circle" title="Benutzerprofil" />
          <RListItem prepend-icon="mdi-palette" title="Benutzeroberfläche" active />
          <RListItem prepend-icon="mdi-key-variant" title="Client-API-Token" />
          <RListItem prepend-icon="mdi-shield-account" title="Verwaltung" />
          <RListItem prepend-icon="mdi-folder-multiple-outline" title="Bibliotheksverwaltung" />
          <RListItem prepend-icon="mdi-database" title="Metadatenquellen" />
        </RList>
      </div>
    `,
  }),
};

export const UserMenu: Story = {
  name: "Benutzermenü (mit Untertitel)",
  render: () => ({
    components: { RList, RListItem },
    template: `
      <div ${SHELL}>
        <RList density="comfortable">
          <RListItem
            prepend-avatar="/assets/isotipo.svg"
            title="RomM Admin"
            subtitle="Admin · zuletzt vor 3 Min. gesehen"
          />
          <RListItem prepend-icon="mdi-account" title="Dein Profil" />
          <RListItem prepend-icon="mdi-cog" title="Einstellungen" />
          <RListItem prepend-icon="mdi-theme-light-dark" title="Farbschema wechseln" append-icon="mdi-chevron-right" />
          <RListItem prepend-icon="mdi-logout" title="Abmelden" />
        </RList>
      </div>
    `,
  }),
};
