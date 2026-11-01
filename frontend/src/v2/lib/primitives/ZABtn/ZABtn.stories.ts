import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ZABtn from "./ZABtn.vue";

const meta: Meta<typeof ZABtn> = {
  title: "Grundelemente/Grundbaustein/ZABtn",
  component: ZABtn,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["flat", "text", "elevated", "translucent", "outlined", "plain"],
    },
    color: { control: "text" },
    size: {
      control: "select",
      options: ["x-small", "small", "default", "large", "x-large"],
    },
    density: {
      control: "select",
      options: ["default", "comfortable", "compact"],
    },
    rounded: { control: "text" },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
    },
    icon: { control: "text" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    block: { control: "boolean" },
    border: { control: "boolean" },
    surface: { control: "boolean" },
    prependIcon: { control: "text" },
    appendIcon: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof ZABtn>;

// ── Defaults ────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => ({
    components: { ZABtn },
    setup: () => ({ args }),
    template: `<ZABtn v-bind="args">Klick mich</ZABtn>`,
  }),
};

export const Primary: Story = {
  args: { color: "primary" },
  render: (args) => ({
    components: { ZABtn },
    setup: () => ({ args }),
    template: `<ZABtn v-bind="args">Primäre Aktion</ZABtn>`,
  }),
};

// ── Variants ────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,auto);gap:14px 18px;justify-items:start">
        <ZABtn variant="flat" color="primary">flat</ZABtn>
        <ZABtn variant="elevated" color="primary">elevated</ZABtn>
        <ZABtn variant="translucent" color="primary">translucent</ZABtn>
        <ZABtn variant="outlined" color="primary">outlined</ZABtn>
        <ZABtn variant="text" color="primary">text</ZABtn>
        <ZABtn variant="plain" color="primary">plain</ZABtn>
      </div>
    `,
  }),
};

// ── Size ladder ─────────────────────────────────────────────────────

export const SizeLadder: Story = {
  name: "Größenabstufung",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;align-items:flex-end;gap:14px">
        <ZABtn size="x-small" color="primary">x-small</ZABtn>
        <ZABtn size="small" color="primary">small</ZABtn>
        <ZABtn size="default" color="primary">default</ZABtn>
        <ZABtn size="large" color="primary">large</ZABtn>
        <ZABtn size="x-large" color="primary">x-large</ZABtn>
      </div>
    `,
  }),
};

export const Density: Story = {
  name: "Dichte-Abstufung",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;align-items:center;gap:14px">
        <ZABtn density="default" color="primary">default</ZABtn>
        <ZABtn density="comfortable" color="primary">comfortable</ZABtn>
        <ZABtn density="compact" color="primary">compact</ZABtn>
      </div>
    `,
  }),
};

// ── Tones ───────────────────────────────────────────────────────────

export const Tones: Story = {
  name: "Farbtöne · flach",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        <ZABtn color="primary">primary</ZABtn>
        <ZABtn color="secondary">secondary</ZABtn>
        <ZABtn color="accent">accent</ZABtn>
        <ZABtn color="success">success</ZABtn>
        <ZABtn color="warning">warning</ZABtn>
        <ZABtn color="danger">danger</ZABtn>
        <ZABtn color="info">info</ZABtn>
        <ZABtn>neutral</ZABtn>
      </div>
    `,
  }),
};

export const TonesTranslucent: Story = {
  name: "Farbtöne · durchscheinend",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        <ZABtn variant="translucent" color="primary">primary</ZABtn>
        <ZABtn variant="translucent" color="secondary">secondary</ZABtn>
        <ZABtn variant="translucent" color="accent">accent</ZABtn>
        <ZABtn variant="translucent" color="success">success</ZABtn>
        <ZABtn variant="translucent" color="warning">warning</ZABtn>
        <ZABtn variant="translucent" color="danger">danger</ZABtn>
        <ZABtn variant="translucent" color="info">info</ZABtn>
      </div>
    `,
  }),
};

// ── Icons ───────────────────────────────────────────────────────────

export const WithIcons: Story = {
  name: "Vorangestellte / angehängte Symbole",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        <ZABtn color="primary" prepend-icon="mdi-login">Anmelden</ZABtn>
        <ZABtn color="success" prepend-icon="mdi-content-save">Speichern</ZABtn>
        <ZABtn variant="outlined" append-icon="mdi-open-in-new">Dokumentation öffnen</ZABtn>
        <ZABtn variant="translucent" color="primary" prepend-icon="mdi-filter" append-icon="mdi-menu-down">Filtern</ZABtn>
      </div>
    `,
  }),
};

export const IconOnly: Story = {
  name: "Schaltflächen nur mit Symbol",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;align-items:center;gap:10px">
        <ZABtn icon="mdi-pencil" variant="text" aria-label="Bearbeiten" />
        <ZABtn icon="mdi-delete" variant="text" color="danger" aria-label="Löschen" />
        <ZABtn icon="mdi-heart" variant="translucent" color="primary" aria-label="Favorit" />
        <ZABtn icon="mdi-refresh" variant="outlined" aria-label="Aktualisieren" />
        <ZABtn icon="mdi-plus" color="primary" aria-label="Hinzufügen" />
      </div>
    `,
  }),
};

export const IconSizeLadder: Story = {
  name: "Nur Symbol · Größenstufen",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;align-items:center;gap:10px">
        <ZABtn icon="mdi-star" size="x-small" color="primary" aria-label="x-small" />
        <ZABtn icon="mdi-star" size="small" color="primary" aria-label="small" />
        <ZABtn icon="mdi-star" size="default" color="primary" aria-label="default" />
        <ZABtn icon="mdi-star" size="large" color="primary" aria-label="large" />
        <ZABtn icon="mdi-star" size="x-large" color="primary" aria-label="x-large" />
      </div>
    `,
  }),
};

// Icon-mode button with custom default-slot content. When `icon` is
// set as a flag (boolean / empty / `true`) and a default slot is
// provided, the slot replaces the icon glyph. Used for composite icon
// content like GameCard's platform badge, where the "icon" is an
// ZAPlatformIcon SVG rather than an MDI codepoint.
export const IconSlotCustom: Story = {
  name: "Symbolmodus · benutzerdefinierter Slot-Inhalt",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;align-items:center;gap:10px">
        <ZABtn icon variant="translucent" color="primary" aria-label="Bildschaltfläche" style="width:auto;min-width:0;padding:3px">
          <img src="https://placehold.co/22x22/A66/fff?text=P" alt="Plattform" style="display:block;width:22px;height:22px;border-radius:3px" />
        </ZABtn>
        <ZABtn icon variant="text" aria-label="Emoji-Schaltfläche" style="width:auto;min-width:0;padding:3px">
          <span style="font-size:18px;line-height:1">🎮</span>
        </ZABtn>
        <ZABtn icon variant="outlined" aria-label="Gemischter Inhalt" style="width:auto;min-width:0;padding:3px 8px">
          <span style="display:inline-flex;align-items:center;gap:4px;font-size:12px">⭐ <span>9</span></span>
        </ZABtn>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Übergeben Sie `icon` als Kennzeichen und legen Sie benutzerdefinierten Inhalt in den Standard-Slot. ZABtn rendert ihn in `.r-btn__icon-slot` mit `line-height: 0`, damit Unterlängen die Zentrierung nicht verschieben.",
      },
    },
  },
};

// ── Rounded ─────────────────────────────────────────────────────────

export const Rounded: Story = {
  name: "Abrundungsstufen",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
        <ZABtn :rounded="0" color="primary">0</ZABtn>
        <ZABtn rounded="sm" color="primary">sm</ZABtn>
        <ZABtn rounded="md" color="primary">md (default)</ZABtn>
        <ZABtn rounded="lg" color="primary">lg</ZABtn>
        <ZABtn rounded="xl" color="primary">xl</ZABtn>
        <ZABtn rounded="full" color="primary">full / pill</ZABtn>
      </div>
    `,
  }),
};

// ── Loading ─────────────────────────────────────────────────────────

export const LoadingState: Story = {
  name: "Wird geladen (interaktiv)",
  render: () => ({
    components: { ZABtn },
    setup() {
      const loading = ref(false);
      function run() {
        loading.value = true;
        setTimeout(() => {
          loading.value = false;
        }, 1800);
      }
      return { loading, run };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;align-items:flex-start">
        <ZABtn color="primary" :loading="loading" prepend-icon="mdi-content-save" @click="run">
          Änderungen speichern
        </ZABtn>
        <ZABtn variant="outlined" :loading="loading" @click="run">Absenden</ZABtn>
        <span style="font:12px/1.4 sans-serif;color:var(--r-color-fg-muted)">
          Nach dem Klick erscheint der Ladekreis nach 200 ms, ohne das Layout zu verschieben.
        </span>
      </div>
    `,
  }),
};

// ── Block / disabled ────────────────────────────────────────────────

export const Block: Story = {
  args: { block: true, prependIcon: "mdi-send", color: "primary" },
  render: (args) => ({
    components: { ZABtn },
    setup: () => ({ args }),
    template: `<div style="width:360px"><ZABtn v-bind="args">Absenden</ZABtn></div>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        <ZABtn disabled>deaktiviert flach</ZABtn>
        <ZABtn variant="outlined" disabled>deaktiviert umrandet</ZABtn>
        <ZABtn variant="translucent" color="primary" disabled>deaktiviert durchscheinend</ZABtn>
        <ZABtn variant="text" color="danger" disabled>deaktivierter Text</ZABtn>
        <ZABtn icon="mdi-delete" variant="text" disabled aria-label="deaktiviertes Symbol" />
      </div>
    `,
  }),
};

// ── Border modifier ─────────────────────────────────────────────────

export const BorderModifier: Story = {
  name: "Rahmenmodifikator (Auslöser im Chip-Stil)",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
        <ZABtn variant="translucent" color="primary" border>durchscheinend + Rahmen</ZABtn>
        <ZABtn variant="text" color="primary" border>Text + Rahmen</ZABtn>
        <ZABtn variant="translucent" color="accent" border rounded="full">Auslöser-Pille</ZABtn>
      </div>
    `,
  }),
};

// ── Polymorphic root ────────────────────────────────────────────────

export const AsLink: Story = {
  name: "Polymorph (href / to)",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
        <ZABtn href="https://romm.app" target="_blank" append-icon="mdi-open-in-new" color="primary">
          Externer Link (&lt;a&gt;)
        </ZABtn>
        <span style="font:12px/1.4 sans-serif;color:var(--r-color-fg-muted)">
          Mit <code>to</code> rendert ZABtn einen <code>&lt;router-link&gt;</code>. Ohne Router ist er in dieser Story unsichtbar, die Eigenschaft wird aber akzeptiert.
        </span>
      </div>
    `,
  }),
};

// ── Real-world stacks ───────────────────────────────────────────────

export const Toolbar: Story = {
  name: "Werkzeugleistenzeile",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:inline-flex;align-items:center;gap:6px;padding:6px 8px;background:var(--r-color-surface);border-radius:10px">
        <ZABtn icon="mdi-format-bold" variant="text" size="small" aria-label="Fett" />
        <ZABtn icon="mdi-format-italic" variant="text" size="small" aria-label="Kursiv" />
        <ZABtn icon="mdi-format-underline" variant="text" size="small" aria-label="Unterstrichen" />
        <span style="width:1px;height:18px;background:var(--r-color-border);margin:0 4px"></span>
        <ZABtn icon="mdi-format-list-bulleted" variant="text" size="small" aria-label="Liste" />
        <ZABtn icon="mdi-format-quote-close" variant="text" size="small" aria-label="Zitat" />
        <ZABtn icon="mdi-link-variant" variant="text" size="small" aria-label="Link" />
      </div>
    `,
  }),
};

export const FormActions: Story = {
  name: "Zeile mit Formularaktionen",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;gap:10px;justify-content:flex-end;padding:14px;background:var(--r-color-bg-elevated);border-radius:10px;width:420px">
        <ZABtn variant="text">Abbrechen</ZABtn>
        <ZABtn variant="outlined">Entwurf speichern</ZABtn>
        <ZABtn color="primary" prepend-icon="mdi-send">Veröffentlichen</ZABtn>
      </div>
    `,
  }),
};

// Surface modifier — pairs an outlined icon-only ZABtn with an
// `ZASliderBtnGroup` segmented cluster so both share the same tinted
// chrome. Used in `GalleryToolbar` for filter / kebab buttons.
export const SurfaceWithSlider: Story = {
  name: "Flächenmodifikator (Symbolschaltfläche neben dem Regler)",
  render: () => ({
    components: { ZABtn },
    template: `
      <div style="display:flex;gap:8px;align-items:center;padding:16px;background:var(--r-color-bg);width:max-content">
        <ZABtn variant="outlined" surface icon="mdi-filter-variant" rounded="circle" aria-label="Filter" />
        <div style="display:inline-flex;align-items:center;gap:2px;padding:2px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:999px;font-size:11px;color:var(--r-color-fg-muted)">
          <span style="padding:4px 10px">Beispiel-Reglerhülle zum Vergleich</span>
        </div>
        <ZABtn variant="outlined" surface icon="mdi-dots-vertical" rounded="circle" aria-label="Mehr" />
      </div>
      <p style="margin:8px 0 0 16px;font:12px monospace;color:var(--r-color-fg-muted);max-width:480px">
        \`surface\` paints --r-color-bg-elevated so the disc-shaped icon
        button reads as a sibling of the segmented slider next to it.
      </p>
    `,
  }),
};
