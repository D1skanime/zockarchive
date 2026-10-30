import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import "./ZAAlert.stories.css";
import ZAAlert from "./ZAAlert.vue";

const meta: Meta<typeof ZAAlert> = {
  title: "Grundelemente/Zusammengesetzt/ZAAlert",
  component: ZAAlert,
  parameters: compositionParameters(
    "lib/primitives/ZAAlert/ZAAlert.stories.ts",
  ),
  argTypes: {
    type: {
      control: "select",
      options: [undefined, "success", "info", "warning", "error"],
    },
    variant: {
      control: "select",
      options: ["flat", "elevated", "translucent", "outlined", "text"],
    },
    density: {
      control: "select",
      options: ["default", "comfortable", "compact"],
    },
    rounded: { control: "text" },
    closable: { control: "boolean" },
    title: { control: "text" },
    text: { control: "text" },
    icon: { control: "text" },
  },
  render: (args) => ({
    components: { ZAAlert },
    setup: () => ({ args }),
    template: `<div style="width:480px"><ZAAlert v-bind="args" /></div>`,
  }),
};

export default meta;

type Story = StoryObj<typeof ZAAlert>;

// ── Tones ───────────────────────────────────────────────────────────

export const Success: Story = {
  args: { type: "success", text: "Der Link zum Zurücksetzen wurde versendet." },
};

export const Info: Story = {
  args: { type: "info", text: "Die Bibliothek wird durchsucht." },
};

export const Warning: Story = {
  args: {
    type: "warning",
    title: "Hash-Berechnung deaktiviert",
    text: "ROMs werden bei diesem Scan nicht mit einem Fingerabdruck versehen.",
  },
};

export const Error: Story = {
  args: { type: "error", text: "Der Server ist nicht erreichbar." },
};

export const AllTypes: Story = {
  name: "Alle Typen · transparent",
  render: () => ({
    components: { ZAAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:480px">
        <ZAAlert type="success" text="Der Link zum Zurücksetzen wurde an Ihre E-Mail-Adresse gesendet." />
        <ZAAlert type="info" text="Die Bibliothek wird durchsucht." />
        <ZAAlert type="warning" text="Die Hash-Berechnung ist deaktiviert, ROMs erhalten keinen Fingerabdruck." />
        <ZAAlert type="error" text="Der Server ist nicht erreichbar." />
      </div>
    `,
  }),
};

// ── Variants ────────────────────────────────────────────────────────

export const Variants: Story = {
  name: "Varianten · gleicher Typ",
  render: () => ({
    components: { ZAAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:480px">
        <ZAAlert type="warning" variant="translucent" text="Durchscheinend · dezente Tönung" />
        <ZAAlert type="warning" variant="flat" text="Flach · einfarbige Füllung, weißer Text" />
        <ZAAlert type="warning" variant="elevated" text="Erhöht · flach mit Schlagschatten" />
        <ZAAlert type="warning" variant="outlined" text="Umrandet · nur Rahmen" />
        <ZAAlert type="warning" variant="text" text="Text · keine Fläche, nur farbiger Text" />
      </div>
    `,
  }),
};

// ── Density ────────────────────────────────────────────────────────

export const Density: Story = {
  name: "Dichte-Abstufung",
  render: () => ({
    components: { ZAAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:480px">
        <ZAAlert type="info" density="default" text="Standard · großzügiger Abstand für wichtige Hinweise" />
        <ZAAlert type="info" density="comfortable" text="Komfortabel · ausgewogene Mitte" />
        <ZAAlert type="info" density="compact" text="Kompakt · für Validierung direkt im Formular" />
      </div>
    `,
  }),
};

// ── Title + body ────────────────────────────────────────────────────

export const TitleAndBody: Story = {
  name: "Titel und Inhalts-Slot",
  render: () => ({
    components: { ZAAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:480px">
        <ZAAlert type="error">
          <template #title>Konfigurationsdatei nicht eingebunden</template>
          Der RomM-Container konnte seine Konfigurationsdatei nicht lesen. Hier vorgenommene
          Einstellungsänderungen bleiben erst nach dem Einbinden des Volumes erhalten.
        </ZAAlert>
        <ZAAlert type="warning">
          <template #title>Konfigurationsdatei nicht beschreibbar</template>
          Die Konfigurationsdatei ist eingebunden, aber schreibgeschützt. Änderungen gelten
          nur für diese Sitzung.
        </ZAAlert>
      </div>
    `,
  }),
};

// ── Icon ───────────────────────────────────────────────────────────

export const CustomIcon: Story = {
  name: "Symbol überschreiben / ausblenden",
  render: () => ({
    components: { ZAAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:480px;font:12px/1.4 sans-serif;color:var(--r-color-fg-muted)">
        <ZAAlert type="info" text="Standard · wählt automatisch mdi-information." />
        <ZAAlert type="info" icon="mdi-rocket-launch" text="Benutzerdefiniertes Symbol." />
        <ZAAlert type="info" :icon="false" text="Symbol ausgeblendet · reines Textbanner." />
      </div>
    `,
  }),
};

export const PrependSlot: Story = {
  name: "Vorangestellter Slot (benutzerdefiniert)",
  render: () => ({
    components: { ZAAlert },
    template: `
      <ZAAlert type="info" density="compact" style="width:420px">
        <template #prepend>
          <div class="r-alert-story-spinner" />
        </template>
        Nintendo 64 wird durchsucht … 42 / 128 ROMs
      </ZAAlert>
    `,
  }),
};

// ── Closable ───────────────────────────────────────────────────────

export const Closable: Story = {
  name: "Schließbar (interaktiv)",
  render: () => ({
    components: { ZAAlert },
    setup() {
      const visible = ref(true);
      function reset() {
        visible.value = false;
        setTimeout(() => {
          visible.value = true;
        }, 250);
      }
      return { visible, reset };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;width:480px;align-items:flex-start">
        <ZAAlert
          v-model="visible"
          type="success"
          title="Token erstellt"
          text="Kopieren Sie ihn jetzt, er wird danach nicht erneut angezeigt."
          closable
        />
        <button
          type="button"
          style="padding:6px 12px;background:var(--r-color-brand-primary);color:white;border:none;border-radius:6px;font:12px/1 sans-serif;cursor:pointer"
          @click="reset"
        >
          Erneut anzeigen
        </button>
      </div>
    `,
  }),
};

// ── Real-world ──────────────────────────────────────────────────────

export const PatcherStatus: Story = {
  name: "Patcher-Status (Praxisbeispiel)",
  render: () => ({
    components: { ZAAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:480px">
        <ZAAlert type="error" density="compact" text="Patch-Datei kann nicht geladen werden: ungültiges Format." />
        <ZAAlert type="info" density="compact" text="Patch wird angewendet: patience.xdelta auf Game.bin" />
      </div>
    `,
  }),
};

export const FormValidation: Story = {
  name: "Formularvalidierung (direkt)",
  render: () => ({
    components: { ZAAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:10px;width:380px;padding:18px;background:var(--r-color-bg-elevated);border-radius:12px">
        <input
          type="text"
          placeholder="Neues Passwort"
          style="padding:8px 12px;background:var(--r-color-surface);border:1px solid var(--r-color-border);border-radius:6px;color:var(--r-color-fg);font:13px/1 sans-serif"
        />
        <input
          type="text"
          placeholder="Passwort bestätigen"
          style="padding:8px 12px;background:var(--r-color-surface);border:1px solid var(--r-color-danger);border-radius:6px;color:var(--r-color-fg);font:13px/1 sans-serif"
        />
        <ZAAlert type="error" density="compact" :icon="false" text="Die Passwörter stimmen nicht überein" />
      </div>
    `,
  }),
};
