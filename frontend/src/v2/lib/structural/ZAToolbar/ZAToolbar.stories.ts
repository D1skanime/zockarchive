import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ZABtn from "@/v2/lib/primitives/ZABtn/ZABtn.vue";
import ZAIcon from "@/v2/lib/primitives/ZAIcon/ZAIcon.vue";
import ZAToolbar from "./ZAToolbar.vue";

const meta: Meta<typeof ZAToolbar> = {
  title: "Struktur/Grundbaustein/ZAToolbar",
  component: ZAToolbar,
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

type Story = StoryObj<typeof ZAToolbar>;

// ── Defaults ────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Standard",
  args: { title: "Plattformen" },
  render: (args) => ({
    components: { ZAToolbar },
    setup: () => ({ args }),
    template: `
      <div style="width:720px;border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
        <ZAToolbar v-bind="args" />
      </div>
    `,
  }),
};

export const WithActions: Story = {
  name: "Titel mit angehängten Aktionen",
  args: { title: "Plattformen" },
  render: (args) => ({
    components: { ZAToolbar, ZABtn },
    setup: () => ({ args }),
    template: `
      <div style="width:720px;border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
        <ZAToolbar v-bind="args">
          <template #append>
            <ZABtn variant="text" prepend-icon="mdi-filter">Filter</ZABtn>
            <ZABtn variant="text" prepend-icon="mdi-sort">Sortieren</ZABtn>
          </template>
        </ZAToolbar>
      </div>
    `,
  }),
};

export const WithPrepend: Story = {
  name: "Vorangestellt (Zurück-Schaltfläche)",
  args: { title: "Super Mario Bros." },
  render: (args) => ({
    components: { ZAToolbar, ZABtn },
    setup: () => ({ args }),
    template: `
      <div style="width:720px;border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
        <ZAToolbar v-bind="args">
          <template #prepend>
            <ZABtn icon="mdi-arrow-left" variant="text" aria-label="Zurück" />
          </template>
          <template #append>
            <ZABtn icon="mdi-pencil" variant="text" aria-label="Bearbeiten" />
            <ZABtn icon="mdi-dots-vertical" variant="text" aria-label="Mehr" />
          </template>
        </ZAToolbar>
      </div>
    `,
  }),
};

// ── Density ─────────────────────────────────────────────────────────

export const DensityLadder: Story = {
  name: "Dichtestufen",
  render: () => ({
    components: { ZAToolbar, ZABtn },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;width:720px">
        <div style="border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
          <ZAToolbar title="Standard · 64px">
            <template #append>
              <ZABtn variant="text" size="small">Aktion</ZABtn>
            </template>
          </ZAToolbar>
        </div>
        <div style="border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
          <ZAToolbar density="comfortable" title="Komfortabel · 56px">
            <template #append>
              <ZABtn variant="text" size="small">Aktion</ZABtn>
            </template>
          </ZAToolbar>
        </div>
        <div style="border-radius:8px;overflow:hidden;border:1px solid var(--r-color-border)">
          <ZAToolbar density="compact" title="Kompakt · 48px">
            <template #append>
              <ZABtn variant="text" size="small">Aktion</ZABtn>
            </template>
          </ZAToolbar>
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
    components: { ZAToolbar, ZABtn },
    setup: () => ({ args }),
    template: `
      <div style="width:720px">
        <ZAToolbar v-bind="args">
          <template #append>
            <ZABtn variant="text">Zurücksetzen</ZABtn>
            <ZABtn color="primary">Speichern</ZABtn>
          </template>
        </ZAToolbar>
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
    components: { ZAToolbar, ZABtn },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;width:720px">
        <ZAToolbar color="primary" title="Primär">
          <template #append>
            <ZABtn variant="text" prepend-icon="mdi-bell" aria-label="Benachrichtigungen" />
            <ZABtn variant="text" prepend-icon="mdi-account-circle" aria-label="Konto" />
          </template>
        </ZAToolbar>
        <ZAToolbar color="success" title="Erfolg, Scan abgeschlossen">
          <template #prepend>
            <ZABtn icon="mdi-check-circle" variant="text" aria-label="ok" />
          </template>
        </ZAToolbar>
        <ZAToolbar color="danger" title="Verbindung verloren">
          <template #append>
            <ZABtn variant="text">Erneut versuchen</ZABtn>
          </template>
        </ZAToolbar>
      </div>
    `,
  }),
};

// ── Rounded + height ────────────────────────────────────────────────

export const RoundedAndHeight: Story = {
  name: "Abgerundet mit benutzerdefinierter Höhe",
  render: () => ({
    components: { ZAToolbar, ZABtn },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;width:720px">
        <ZAToolbar rounded="lg" title="rounded='lg'">
          <template #append>
            <ZABtn variant="text" prepend-icon="mdi-cog">Einstellungen</ZABtn>
          </template>
        </ZAToolbar>
        <ZAToolbar :height="80" title="height=80 (höher)">
          <template #append>
            <ZABtn color="primary" prepend-icon="mdi-plus">Hinzufügen</ZABtn>
          </template>
        </ZAToolbar>
      </div>
    `,
  }),
};

// ── Real-world ──────────────────────────────────────────────────────

export const GalleryHeader: Story = {
  name: "Galerie-Kopfzeile (Praxisbeispiel)",
  render: () => ({
    components: { ZAToolbar, ZABtn, ZAIcon },
    template: `
      <div style="width:720px;border-radius:12px;overflow:hidden;border:1px solid var(--r-color-border);background:var(--r-color-bg-elevated)">
        <ZAToolbar title="Nintendo 64" flat>
          <template #prepend>
            <ZABtn icon="mdi-arrow-left" variant="text" aria-label="Zurück" />
          </template>
          <template #append>
            <ZABtn variant="text" prepend-icon="mdi-magnify" aria-label="Suche" />
            <ZABtn variant="text" prepend-icon="mdi-filter">Filter</ZABtn>
            <ZABtn variant="text" prepend-icon="mdi-sort-variant">Sortieren</ZABtn>
            <ZABtn icon="mdi-dots-vertical" variant="text" aria-label="Mehr" />
          </template>
        </ZAToolbar>
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
    components: { ZAToolbar, ZABtn },
    template: `
      <div style="width:480px;border-radius:12px;overflow:hidden;border:1px solid var(--r-color-border);background:var(--r-color-bg-elevated);box-shadow:0 12px 30px color-mix(in srgb, black 30%, transparent)">
        <ZAToolbar density="compact" title="ROM bearbeiten" flat>
          <template #append>
            <ZABtn icon="mdi-close" variant="text" aria-label="Schließen" />
          </template>
        </ZAToolbar>
        <div style="padding:18px 16px;color:var(--r-color-fg-muted);font:13px/1.5 sans-serif">
          Dialoginhalt, die Werkzeugleiste dient als Titelzeile.
        </div>
      </div>
    `,
  }),
};
