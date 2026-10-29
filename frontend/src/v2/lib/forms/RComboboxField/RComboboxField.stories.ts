import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import RComboboxField from "./RComboboxField.vue";

const meta: Meta<typeof RComboboxField> = {
  title: "Formulare/Grundbaustein/RComboboxField",
  component: RComboboxField,
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    prefixLabel: {
      control: "inline-radio",
      options: [null, "stacked", "inline"],
    },
    variant: {
      control: "inline-radio",
      options: ["outlined", "filled", "underlined", "plain"],
    },
    density: {
      control: "inline-radio",
      options: ["default", "comfortable", "compact"],
    },
    disabled: { control: "boolean" },
    closableChips: { control: "boolean" },
    noSuggestions: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof RComboboxField>;

// ── Free-text, no suggestions ─────────────────────────────────

export const FreeText: Story = {
  name: "Freitext (keine Einträge)",
  render: () => ({
    components: { RComboboxField },
    setup: () => ({ value: ref<string[]>([]) }),
    template: `
      <div style="width:320px;padding:24px">
        <RComboboxField
          v-model="value"
          label="Unternehmen"
          prefix-label="stacked"
          variant="outlined"
          placeholder="Zum Hinzufügen eingeben und Eingabe oder Komma drücken"
        />
        <p style="margin-top:12px;font:12px monospace;color:var(--r-color-fg-muted)">
          {{ value }}
        </p>
      </div>
    `,
  }),
};

// ── With autocomplete suggestions ─────────────────────────────

export const WithSuggestions: Story = {
  name: "Mit Autovervollständigungsvorschlägen",
  render: () => ({
    components: { RComboboxField },
    setup: () => ({
      value: ref<string[]>([]),
      items: [
        "Single player",
        "Multiplayer",
        "Co-operative",
        "Split screen",
        "Massively multiplayer online (MMO)",
        "Battle Royale",
      ],
    }),
    template: `
      <div style="width:320px;padding:24px">
        <RComboboxField
          v-model="value"
          :items="items"
          label="Spielmodi"
          prefix-label="stacked"
          variant="outlined"
          placeholder="Auswählen oder eingeben"
          hint="Vorschläge werden beim Tippen gefiltert. Eigene Werte werden übernommen."
        />
      </div>
    `,
  }),
};

// ── Pre-loaded with values ────────────────────────────────────

export const Preloaded: Story = {
  name: "Vorbelegter Wert",
  render: () => ({
    components: { RComboboxField },
    setup: () => ({
      value: ref<string[]>(["Nintendo", "Konami", "Capcom"]),
    }),
    template: `
      <div style="width:340px;padding:24px">
        <RComboboxField
          v-model="value"
          label="Unternehmen"
          prefix-label="stacked"
          variant="outlined"
        />
      </div>
    `,
  }),
};

// ── Compact density ──────────────────────────────────────────

export const Compact: Story = {
  render: () => ({
    components: { RComboboxField },
    setup: () => ({ value: ref<string[]>(["Action", "RPG"]) }),
    template: `
      <div style="width:280px;padding:24px">
        <RComboboxField
          v-model="value"
          label="Genres"
          density="compact"
          prefix-label="inline"
          variant="outlined"
        />
      </div>
    `,
  }),
};

// ── Error state ──────────────────────────────────────────────

export const WithError: Story = {
  name: "Fehlerzustand",
  render: () => ({
    components: { RComboboxField },
    setup: () => ({ value: ref<string[]>([]) }),
    template: `
      <div style="width:320px;padding:24px">
        <RComboboxField
          v-model="value"
          label="Erforderliche Schlagwörter"
          prefix-label="stacked"
          variant="outlined"
          error-messages="Mindestens ein Schlagwort ist erforderlich."
        />
      </div>
    `,
  }),
};

// ── Disabled ─────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => ({
    components: { RComboboxField },
    setup: () => ({ value: ref<string[]>(["Gesperrt", "Schreibgeschützt"]) }),
    template: `
      <div style="width:320px;padding:24px">
        <RComboboxField
          v-model="value"
          label="Gesperrtes Feld"
          prefix-label="stacked"
          variant="outlined"
          disabled
        />
      </div>
    `,
  }),
};

// ── Non-removable chips ──────────────────────────────────────

export const NonRemovable: Story = {
  name: "Nicht entfernbare Chips",
  render: () => ({
    components: { RComboboxField },
    setup: () => ({ value: ref<string[]>(["Fixiert", "Schlagwort"]) }),
    template: `
      <div style="width:320px;padding:24px">
        <RComboboxField
          v-model="value"
          label="Fixierte Schlagwörter"
          prefix-label="stacked"
          variant="outlined"
          :closable-chips="false"
        />
      </div>
    `,
  }),
};
