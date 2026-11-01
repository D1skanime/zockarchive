import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ZAIcon from "@/v2/lib/primitives/ZAIcon/ZAIcon.vue";
import ZASelect from "./ZASelect.vue";

const ROLES = [
  { title: "Administrator", value: "admin" },
  { title: "Redakteur", value: "editor" },
  { title: "Betrachter", value: "viewer" },
  { title: "Gast", value: "guest", disabled: true },
];

const PLATFORMS = [
  { title: "Nintendo 64", value: "n64" },
  { title: "Super Nintendo", value: "snes" },
  { title: "PlayStation 1", value: "psx" },
  { title: "PlayStation 2", value: "ps2" },
  { title: "Sega Genesis", value: "gen" },
  { title: "Game Boy", value: "gb" },
  { title: "Game Boy Advance", value: "gba" },
  { title: "Nintendo DS", value: "nds" },
  { title: "Nintendo Switch", value: "switch" },
  { title: "Xbox 360", value: "x360" },
  { title: "PC", value: "pc" },
];

const meta: Meta<typeof ZASelect> = {
  title: "Formulare/Grundbaustein/ZASelect",
  component: ZASelect,
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["outlined", "filled", "underlined", "plain"],
    },
    density: {
      control: "inline-radio",
      options: ["default", "comfortable", "compact"],
    },
    prefixLabel: {
      control: "inline-radio",
      options: [undefined, "stacked", "inline"],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    multiple: { control: "boolean" },
    chips: { control: "boolean" },
    closableChips: { control: "boolean" },
    chipTone: {
      control: "select",
      options: [
        "neutral",
        "brand",
        "accent",
        "success",
        "danger",
        "warning",
        "info",
        "plain",
      ],
    },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    loading: { control: "boolean" },
    searchable: { control: "boolean" },
    error: { control: "boolean" },
    errorMessages: { control: "text" },
  },
  render: (args) => ({
    components: { ZASelect },
    setup: () => {
      const value = ref<unknown>(args.multiple ? [] : null);
      return { args, value, items: PLATFORMS };
    },
    template: `
      <div style="width:340px">
        <ZASelect v-model="value" :items="items" v-bind="args" />
      </div>
    `,
  }),
};

export default meta;

type Story = StoryObj<typeof ZASelect>;

// ── Defaults ────────────────────────────────────────────────────────

export const Default: Story = {
  args: { placeholder: "Plattform auswählen" },
};

export const Preselected: Story = {
  render: () => ({
    components: { ZASelect },
    setup: () => ({ value: ref("psx"), items: PLATFORMS }),
    template: `<div style="width:340px"><ZASelect v-model="value" :items="items" placeholder="Plattform auswählen" /></div>`,
  }),
};

// ── Variants ────────────────────────────────────────────────────────

export const VariantLadder: Story = {
  name: "Variantenübersicht",
  render: () => ({
    components: { ZASelect },
    setup: () => ({
      outlined: ref("psx"),
      filled: ref("psx"),
      underlined: ref("psx"),
      plain: ref("psx"),
      items: PLATFORMS,
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:340px">
        <ZASelect v-model="outlined" :items="items" variant="outlined" placeholder="umrandet (Standard)" />
        <ZASelect v-model="filled" :items="items" variant="filled" placeholder="gefüllt" />
        <ZASelect v-model="underlined" :items="items" variant="underlined" placeholder="unterstrichen" />
        <ZASelect v-model="plain" :items="items" variant="plain" placeholder="schlicht" />
      </div>
    `,
  }),
};

// ── Densities ──────────────────────────────────────────────────────

export const DensityLadder: Story = {
  name: "Dichteübersicht",
  render: () => ({
    components: { ZASelect },
    setup: () => ({
      a: ref(""),
      b: ref(""),
      c: ref(""),
      items: PLATFORMS,
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;width:340px">
        <ZASelect v-model="a" :items="items" density="default" placeholder="Standard · 48px" />
        <ZASelect v-model="b" :items="items" density="comfortable" placeholder="komfortabel · 40px" />
        <ZASelect v-model="c" :items="items" density="compact" placeholder="kompakt · 32px" />
      </div>
    `,
  }),
};

// ── Labels ──────────────────────────────────────────────────────────

export const StackedLabel: Story = {
  name: "Beschriftung · gestapelt",
  args: {
    prefixLabel: "stacked",
    label: "Standardplattform",
    placeholder: "Eine auswählen",
  },
};

export const InlineLabel: Story = {
  name: "Beschriftung · inline",
  args: {
    prefixLabel: "inline",
    label: "Plattform",
    placeholder: "Eine auswählen",
  },
};

// ── States ──────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    label: "Plattform",
    prefixLabel: "stacked",
    disabled: true,
    placeholder: "Gesperrt",
    modelValue: "psx",
  },
};

export const Loading: Story = {
  args: { placeholder: "Plattformen werden geladen…", loading: true },
};

export const WithError: Story = {
  args: {
    placeholder: "Plattform auswählen",
    error: true,
    errorMessages: "Erforderlich",
  },
};

export const Validation: Story = {
  name: "Regeln · Live-Validierung",
  render: () => ({
    components: { ZASelect },
    setup: () => {
      const value = ref<string | null>(null);
      const rules = [
        (v: unknown) => (v != null && v !== "" ? true : "Plattform auswählen"),
      ];
      return { value, rules, items: PLATFORMS };
    },
    template: `
      <div style="width:340px;display:flex;flex-direction:column;gap:8px">
        <ZASelect v-model="value" :items="items" prefix-label="stacked" label="Plattform" :rules="rules" placeholder="Eine auswählen" />
        <div style="font:11px sans-serif;color:var(--r-color-fg-muted)">Ohne Auswahl öffnen und schließen. Der Fehler erscheint beim Verlassen.</div>
      </div>
    `,
  }),
};

// ── Clearable ──────────────────────────────────────────────────────

export const Clearable: Story = {
  parameters: { a11y: { test: "error" } },
  render: () => ({
    components: { ZASelect },
    setup: () => ({ value: ref("psx"), items: PLATFORMS }),
    template: `<div style="width:340px"><ZASelect v-model="value" :items="items" placeholder="Löschbar" clearable /></div>`,
  }),
};

// ── Multiple ───────────────────────────────────────────────────────

export const Multiple: Story = {
  name: "Mehrfachauswahl (Chips)",
  render: () => ({
    components: { ZASelect },
    setup: () => ({ value: ref(["psx", "snes"]), items: PLATFORMS }),
    template: `<div style="width:480px"><ZASelect v-model="value" :items="items" multiple chips closable-chips placeholder="Plattformen auswählen" /></div>`,
  }),
};

// Without `chips` the selections render as one run of text. The comma
// separator must read "A, B" — a space on both sides means the separator
// picked up the value row's flex gap.
export const MultipleText: Story = {
  name: "Mehrfachauswahl (ohne Chips)",
  render: () => ({
    components: { ZASelect },
    setup: () => ({ value: ref(["psx", "snes"]), items: PLATFORMS }),
    template: `<div style="width:480px"><ZASelect v-model="value" :items="items" multiple placeholder="Plattformen auswählen" /></div>`,
  }),
};

export const MultipleOverflow: Story = {
  name: "Mehrfachauswahl · dynamischer Überlauf",
  render: () => ({
    components: { ZASelect },
    setup: () => ({
      narrow: ref(["psx", "snes", "n64", "gba", "switch"]),
      wide: ref(["psx", "snes", "n64", "gba", "switch"]),
      items: PLATFORMS,
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:18px">
        <div style="width:240px">
          <ZASelect v-model="narrow" :items="items" multiple chips closable-chips placeholder="Plattformen auswählen" />
        </div>
        <div style="width:520px">
          <ZASelect v-model="wide" :items="items" multiple chips closable-chips placeholder="Plattformen auswählen" />
        </div>
        <div style="font:11px sans-serif;color:var(--r-color-fg-muted);max-width:520px">
          Dieselben 5 Auswahlen bei unterschiedlicher Breite. Die schmale Ansicht fasst früher zu „+N“ zusammen. Ändern Sie die Breite des Storybook-Fensters, um die Aktualisierung zu sehen.
        </div>
      </div>
    `,
  }),
};

// ── Searchable ─────────────────────────────────────────────────────

// `searchable` filters items internally without any v-model:search
// binding. Drop in the prop and the menu gets a search field that
// filters the list as you type. (Previously this required the parent
// to wire v-model:search to a ref + manually filter `items`.)
export const Searchable: Story = {
  render: () => ({
    components: { ZASelect },
    setup: () => ({ value: ref<string | null>(null), items: PLATFORMS }),
    template: `<div style="width:340px"><ZASelect v-model="value" :items="items" searchable search-placeholder="Plattformen filtern" placeholder="Plattform auswählen" /></div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Interner Suchzustand, keine `v-model:search`-Bindung erforderlich. Eltern, die auf die Anfrage reagieren möchten, können weiterhin `v-model:search` binden; die Synchronisierung erfolgt in beide Richtungen.",
      },
    },
  },
};

export const SearchableExternal: Story = {
  name: "Durchsuchbar · externes v-model:search",
  render: () => ({
    components: { ZASelect },
    setup: () => {
      const value = ref<string | null>(null);
      const search = ref("");
      return { value, search, items: PLATFORMS };
    },
    template: `
      <div style="width:340px;display:flex;flex-direction:column;gap:8px">
        <ZASelect v-model="value" v-model:search="search" :items="items" searchable search-placeholder="Plattformen filtern" placeholder="Plattform auswählen" />
        <span style="font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">Externe Suchanfrage: <code>{{ search || '∅' }}</code></span>
      </div>
    `,
  }),
};

// ── Chip tone ──────────────────────────────────────────────────────

// `chipTone` controls how the selection chips render in multi mode.
// Default `brand` paints a brand-coloured pill; `plain` strips the
// pill background entirely (used by PlatformSelect to let icons read
// without surrounding colour); the rest pick a semantic tone.
export const ChipTones: Story = {
  name: "Chip-Farben (Mehrfachauswahl)",
  render: () => ({
    components: { ZASelect },
    setup: () => ({
      a: ref<string[]>(["psx", "snes"]),
      b: ref<string[]>(["psx", "snes"]),
      c: ref<string[]>(["psx", "snes"]),
      d: ref<string[]>(["psx", "snes"]),
      e: ref<string[]>(["psx", "snes"]),
      items: PLATFORMS,
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:340px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div><span>Marke (Standard)</span><ZASelect v-model="a" :items="items" multiple chips chip-tone="brand" placeholder="Plattformen" /></div>
        <div><span>schlicht (ohne Füllung)</span><ZASelect v-model="b" :items="items" multiple chips chip-tone="plain" placeholder="Plattformen" /></div>
        <div><span>neutral</span><ZASelect v-model="c" :items="items" multiple chips chip-tone="neutral" placeholder="Plattformen" /></div>
        <div><span>Erfolg</span><ZASelect v-model="d" :items="items" multiple chips chip-tone="success" placeholder="Plattformen" /></div>
        <div><span>Gefahr</span><ZASelect v-model="e" :items="items" multiple chips chip-tone="danger" placeholder="Plattformen" /></div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Verwenden Sie `chip-tone="plain"`, wenn Chips selbst genug visuelles Gewicht haben, etwa bei Chips nur mit Plattform-Symbolen.',
      },
    },
  },
};

// ── Chip slot ──────────────────────────────────────────────────────

// Use the `#chip` slot to fully control chip content — replace the
// default label/title with a custom layout (icon, avatar, mini-card).
// The slot receives the active item; styling falls back to chipTone.
export const ChipSlotIconOnly: Story = {
  name: "#chip-Slot · Chips nur mit Symbol",
  render: () => ({
    components: { ZASelect, ZAIcon },
    setup: () => ({
      value: ref<string[]>(["psx", "snes", "n64"]),
      items: PLATFORMS,
    }),
    template: `
      <div style="width:340px">
        <ZASelect v-model="value" :items="items" multiple chips chip-tone="plain" placeholder="Plattformen">
          <template #chip="{ item }">
            <span style="display:inline-flex;align-items:center;gap:6px">
              <ZAIcon
                :icon="item.value === 'psx' ? 'mdi-playstation' : item.value === 'snes' ? 'mdi-nintendo-switch' : item.value === 'n64' ? 'mdi-nintendo-game-boy' : 'mdi-gamepad-square-outline'"
                size="x-small"
              />
              <span style="font-size:11px">{{ item.title }}</span>
            </span>
          </template>
        </ZASelect>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Der `#chip`-Slot ersetzt nur den Chip-Inhalt, `chip-tone` steuert weiterhin den Pillen-Hintergrund. PlatformSelect nutzt dieses Muster, um Plattform-Symbole, bei Bedarf nur Symbole mit Tooltip, als kompakte Chips anzuzeigen.",
      },
    },
  },
};

// ── Custom slots ───────────────────────────────────────────────────

export const CustomSelectionSlot: Story = {
  name: "#selection-Slot · eigene Anzeige",
  render: () => ({
    components: { ZASelect, ZAIcon },
    setup: () => ({ value: ref("admin"), items: ROLES }),
    template: `
      <div style="width:340px">
        <ZASelect v-model="value" :items="items" prefix-label="stacked" label="Rolle">
          <template #selection="{ item }">
            <span style="display:inline-flex;align-items:center;gap:6px">
              <ZAIcon :icon="item.value === 'admin' ? 'mdi-shield-crown' : item.value === 'editor' ? 'mdi-pencil' : item.value === 'viewer' ? 'mdi-eye' : 'mdi-account'" size="x-small" />
              {{ item.title }}
            </span>
          </template>
        </ZASelect>
      </div>
    `,
  }),
};

export const CustomItemSlot: Story = {
  name: "#item-Slot · eigene Zeilen",
  render: () => ({
    components: { ZASelect, ZAIcon },
    setup: () => ({ value: ref("editor"), items: ROLES }),
    template: `
      <div style="width:340px">
        <ZASelect v-model="value" :items="items" prefix-label="stacked" label="Rolle">
          <template #item="{ item, props, selected, active }">
            <li v-bind="props" :style="{
              display:'flex',
              alignItems:'center',
              gap:'10px',
              padding:'9px 12px',
              borderRadius:'9px',
              marginBottom:'2px',
              cursor:'pointer',
              background: active || selected ? 'var(--r-color-surface)' : 'transparent',
              color: selected
                ? 'var(--r-color-brand-primary)'
                : active
                  ? 'var(--r-color-fg)'
                  : 'var(--r-color-fg-secondary)',
              transition: 'background var(--r-motion-fast) var(--r-motion-ease-out), color var(--r-motion-fast) var(--r-motion-ease-out)',
            }">
              <ZAIcon :icon="item.value === 'admin' ? 'mdi-shield-crown' : item.value === 'editor' ? 'mdi-pencil' : item.value === 'viewer' ? 'mdi-eye' : 'mdi-account'" size="x-small" />
              <span style="flex:1">{{ item.title }}</span>
              <ZAIcon v-if="selected" icon="mdi-check" size="x-small" />
            </li>
          </template>
        </ZASelect>
      </div>
    `,
  }),
};

// ── Real-world ────────────────────────────────────────────────────

export const FormRow: Story = {
  name: "Formularzeile (Praxisbeispiel)",
  render: () => ({
    components: { ZASelect },
    setup: () => ({
      role: ref("editor"),
      platform: ref("psx"),
      roles: ROLES,
      platforms: PLATFORMS,
    }),
    template: `
      <div style="width:380px;display:flex;flex-direction:column;gap:14px;padding:20px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:12px">
        <ZASelect v-model="role" :items="roles" prefix-label="stacked" label="Rolle" />
        <ZASelect v-model="platform" :items="platforms" prefix-label="stacked" label="Standardplattform" searchable />
      </div>
    `,
  }),
};
