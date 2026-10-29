import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RBtn from "@/v2/lib/primitives/RBtn/RBtn.vue";
import RIcon from "@/v2/lib/primitives/RIcon/RIcon.vue";
import RToolbar from "./RToolbar.vue";

const meta: Meta<typeof RToolbar> = {
  title: "Struktur/Grundbaustein/RToolbar",
  component: RToolbar,
  argTypes: {
    title: { control: "text" },
    color: { control: "text" },
    density: {
      control: "select",
      options: ["default", "comfortable", "compact"],
    },
    flat: { control: "boolean" },
    height: { control: "text" },
    rounded: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof RToolbar>;

// ── Defaults ────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Standard",
  args: { title: "Plattformen" },
  render: (args) => ({
    components: { RToolbar },
    setup: () => ({ args }),
    template: `
      <div style="width:720px;border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
        <RToolbar v-bind="args" />
      </div>
    `,
  }),
};

export const WithActions: Story = {
  name: "Titel mit angehängten Aktionen",
  args: { title: "Plattformen" },
  render: (args) => ({
    components: { RToolbar, RBtn },
    setup: () => ({ args }),
    template: `
      <div style="width:720px;border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
        <RToolbar v-bind="args">
          <template #append>
            <RBtn variant="text" prepend-icon="mdi-filter">Filter</RBtn>
            <RBtn variant="text" prepend-icon="mdi-sort">Sortieren</RBtn>
          </template>
        </RToolbar>
      </div>
    `,
  }),
};

export const WithPrepend: Story = {
  name: "Vorangestellt (Zurück-Schaltfläche)",
  args: { title: "Super Mario Bros." },
  render: (args) => ({
    components: { RToolbar, RBtn },
    setup: () => ({ args }),
    template: `
      <div style="width:720px;border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
        <RToolbar v-bind="args">
          <template #prepend>
            <RBtn icon="mdi-arrow-left" variant="text" aria-label="Zurück" />
          </template>
          <template #append>
            <RBtn icon="mdi-pencil" variant="text" aria-label="Bearbeiten" />
            <RBtn icon="mdi-dots-vertical" variant="text" aria-label="Mehr" />
          </template>
        </RToolbar>
      </div>
    `,
  }),
};

// ── Density ─────────────────────────────────────────────────────────

export const DensityLadder: Story = {
  name: "Dichtestufen",
  render: () => ({
    components: { RToolbar, RBtn },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;width:720px">
        <div style="border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
          <RToolbar title="Standard · 64px">
            <template #append>
              <RBtn variant="text" size="small">Aktion</RBtn>
            </template>
          </RToolbar>
        </div>
        <div style="border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
          <RToolbar density="comfortable" title="Komfortabel · 56px">
            <template #append>
              <RBtn variant="text" size="small">Aktion</RBtn>
            </template>
          </RToolbar>
        </div>
        <div style="border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
          <RToolbar density="compact" title="Kompakt · 48px">
            <template #append>
              <RBtn variant="text" size="small">Aktion</RBtn>
            </template>
          </RToolbar>
        </div>
      </div>
    `,
  }),
};

// ── Variants ────────────────────────────────────────────────────────

export const Flat: Story = {
  name: "Flach (ohne untere Trennlinie)",
  args: { title: "Einstellungen", flat: true },
  render: (args) => ({
    components: { RToolbar, RBtn },
    setup: () => ({ args }),
    template: `
      <div style="width:720px">
        <RToolbar v-bind="args">
          <template #append>
            <RBtn variant="text">Zurücksetzen</RBtn>
            <RBtn color="primary">Speichern</RBtn>
          </template>
        </RToolbar>
        <div style="padding:24px;color:var(--r-color-fg-muted);font:12px/1.4 sans-serif">
          Die Werkzeugleiste schließt bündig an den Inhalt an, ohne feine Trennlinie.
        </div>
      </div>
    `,
  }),
};

export const Colored: Story = {
  name: "Farbige Werkzeugleisten",
  render: () => ({
    components: { RToolbar, RBtn },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;width:720px">
        <RToolbar color="primary" title="Primär">
          <template #append>
            <RBtn variant="text" prepend-icon="mdi-bell" aria-label="Benachrichtigungen" />
            <RBtn variant="text" prepend-icon="mdi-account-circle" aria-label="Konto" />
          </template>
        </RToolbar>
        <RToolbar color="success" title="Erfolg, Scan abgeschlossen">
          <template #prepend>
            <RBtn icon="mdi-check-circle" variant="text" aria-label="ok" />
          </template>
        </RToolbar>
        <RToolbar color="danger" title="Verbindung verloren">
          <template #append>
            <RBtn variant="text">Erneut versuchen</RBtn>
          </template>
        </RToolbar>
      </div>
    `,
  }),
};

// ── Rounded + height ────────────────────────────────────────────────

export const RoundedAndHeight: Story = {
  name: "Abgerundet mit benutzerdefinierter Höhe",
  render: () => ({
    components: { RToolbar, RBtn },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;width:720px">
        <RToolbar rounded="lg" title="rounded='lg'">
          <template #append>
            <RBtn variant="text" prepend-icon="mdi-cog">Einstellungen</RBtn>
          </template>
        </RToolbar>
        <RToolbar :height="80" title="height=80 (höher)">
          <template #append>
            <RBtn color="primary" prepend-icon="mdi-plus">Hinzufügen</RBtn>
          </template>
        </RToolbar>
      </div>
    `,
  }),
};

// ── Real-world ──────────────────────────────────────────────────────

export const GalleryHeader: Story = {
  name: "Galerie-Kopfzeile (Praxisbeispiel)",
  render: () => ({
    components: { RToolbar, RBtn, RIcon },
    template: `
      <div style="width:720px;border-radius:12px;overflow:hidden;border:1px solid var(--r-color-border);background:var(--r-color-bg-elevated)">
        <RToolbar title="Nintendo 64" flat>
          <template #prepend>
            <RBtn icon="mdi-arrow-left" variant="text" aria-label="Zurück" />
          </template>
          <template #append>
            <RBtn variant="text" prepend-icon="mdi-magnify" aria-label="Suche" />
            <RBtn variant="text" prepend-icon="mdi-filter">Filter</RBtn>
            <RBtn variant="text" prepend-icon="mdi-sort-variant">Sortieren</RBtn>
            <RBtn icon="mdi-dots-vertical" variant="text" aria-label="Mehr" />
          </template>
        </RToolbar>
        <div style="padding:20px;color:var(--r-color-fg-muted);font:13px/1.5 sans-serif">
          128 ROMs · 4 fehlen · letzter Scan vor 3 Stunden
        </div>
      </div>
    `,
  }),
};

export const DialogTitleRow: Story = {
  name: "Dialog-Titelzeile",
  render: () => ({
    components: { RToolbar, RBtn },
    template: `
      <div style="width:480px;border-radius:12px;overflow:hidden;border:1px solid var(--r-color-border);background:var(--r-color-bg-elevated);box-shadow:0 12px 30px color-mix(in srgb, black 30%, transparent)">
        <RToolbar density="compact" title="ROM bearbeiten" flat>
          <template #append>
            <RBtn icon="mdi-close" variant="text" aria-label="Schließen" />
          </template>
        </RToolbar>
        <div style="padding:18px 16px;color:var(--r-color-fg-muted);font:13px/1.5 sans-serif">
          Dialoginhalt, die Werkzeugleiste dient als Titelzeile.
        </div>
      </div>
    `,
  }),
};
