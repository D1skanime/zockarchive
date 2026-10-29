import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import RBtn from "@/v2/lib/primitives/RBtn/RBtn.vue";
import RTextField from "./RTextField.vue";

const meta: Meta<typeof RTextField> = {
  title: "Formulare/Grundbaustein/RTextField",
  component: RTextField,
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
    type: { control: "text" },
    label: { control: "text" },
    placeholder: { control: "text" },
    color: { control: "text" },
    prependInnerIcon: { control: "text" },
    appendInnerIcon: { control: "text" },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    loading: { control: "boolean" },
    hint: { control: "text" },
    subtitle: { control: "text" },
    error: { control: "boolean" },
    errorMessages: { control: "text" },
  },
  render: (args) => ({
    components: { RTextField },
    setup: () => {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div style="width: 360px">
        <RTextField v-model="value" v-bind="args" />
      </div>
    `,
  }),
};

export default meta;

type Story = StoryObj<typeof RTextField>;

// ── Defaults ────────────────────────────────────────────────────────

export const Default: Story = {
  args: { placeholder: "username" },
};

export const WithIcon: Story = {
  args: { placeholder: "ROMs suchen", prependInnerIcon: "mdi-magnify" },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "••••••••",
    prependInnerIcon: "mdi-lock",
    appendInnerIcon: "mdi-eye",
  },
};

// ── Variants ────────────────────────────────────────────────────────

export const VariantLadder: Story = {
  name: "Variantenübersicht",
  render: () => ({
    components: { RTextField },
    setup: () => ({
      outlined: ref("outlined"),
      filled: ref("filled"),
      underlined: ref("underlined"),
      plain: ref("plain"),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:360px">
        <RTextField v-model="outlined" variant="outlined" placeholder="outlined (default)" prepend-inner-icon="mdi-account" />
        <RTextField v-model="filled" variant="filled" placeholder="filled" prepend-inner-icon="mdi-account" />
        <RTextField v-model="underlined" variant="underlined" placeholder="underlined" prepend-inner-icon="mdi-account" />
        <RTextField v-model="plain" variant="plain" placeholder="plain" prepend-inner-icon="mdi-account" />
      </div>
    `,
  }),
};

// ── Densities ──────────────────────────────────────────────────────

export const DensityLadder: Story = {
  name: "Dichteübersicht",
  render: () => ({
    components: { RTextField },
    setup: () => ({
      a: ref(""),
      b: ref(""),
      c: ref(""),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;width:360px">
        <RTextField v-model="a" density="default" placeholder="default · 48px" prepend-inner-icon="mdi-account" />
        <RTextField v-model="b" density="comfortable" placeholder="comfortable · 40px (default)" prepend-inner-icon="mdi-account" />
        <RTextField v-model="c" density="compact" placeholder="compact · 32px" prepend-inner-icon="mdi-account" />
      </div>
    `,
  }),
};

// ── Labels ──────────────────────────────────────────────────────────

export const StackedLabel: Story = {
  name: "Beschriftung · gestapelt (Formulare)",
  args: {
    prefixLabel: "stacked",
    label: "Anzeigename",
    placeholder: "Jane Doe",
    hint: "Wird in Chats neben Ihrem Avatar angezeigt.",
  },
};

export const InlineLabel: Story = {
  name: "Beschriftung · inline (Suchleisten)",
  args: {
    prefixLabel: "inline",
    label: "Suche",
    placeholder: "ROM finden…",
  },
};

export const WithSubtitle: Story = {
  name: "Untertitel · Pfad unter dem Feld",
  render: () => ({
    components: { RTextField },
    setup: () => ({
      filename: ref("Super Mario World (USA).sfc"),
    }),
    template: `
      <div style="width:420px">
        <RTextField
          v-model="filename"
          prefix-label="stacked"
          label="Dateiname"
        >
          <template #subtitle>
            <span style="font-size:13px;line-height:1">📁</span>
            /romm/library/snes/Super Mario World (USA).sfc
          </template>
        </RTextField>
      </div>
    `,
  }),
};

// ── States ──────────────────────────────────────────────────────────

export const WithHint: Story = {
  args: {
    label: "E-Mail-Adresse",
    placeholder: "your@email.com",
    hint: "Wir kontaktieren Sie nur zu Kontovorgängen.",
    prependInnerIcon: "mdi-email",
  },
};

export const WithError: Story = {
  args: {
    label: "E-Mail-Adresse",
    placeholder: "your@email.com",
    error: true,
    errorMessages: "Muss eine gültige E-Mail-Adresse sein",
    prependInnerIcon: "mdi-email",
  },
};

export const Validation: Story = {
  name: "Regeln · Live-Validierung",
  render: () => ({
    components: { RTextField },
    setup: () => {
      const value = ref("");
      const rules = [
        (v: unknown) =>
          !!v && String(v).length > 0 ? true : "Feld ist erforderlich",
        (v: unknown) =>
          String(v).length >= 3 ? true : "Mindestens 3 Zeichen erforderlich",
        (v: unknown) =>
          /^[a-z0-9_]+$/.test(String(v)) || !v
            ? true
            : "Nur Kleinbuchstaben, Ziffern und Unterstriche",
      ];
      return { value, rules };
    },
    template: `
      <div style="width:360px;display:flex;flex-direction:column;gap:8px">
        <RTextField
          v-model="value"
          prefix-label="stacked"
          label="Benutzername"
          placeholder="snake_case_only"
          :rules="rules"
        />
        <div style="font:11px sans-serif;color:var(--r-color-fg-muted)">
          Verlassen Sie das leere Feld und beginnen Sie dann zu tippen.
        </div>
      </div>
    `,
  }),
};

export const Loading: Story = {
  args: {
    placeholder: "Suche läuft…",
    loading: true,
    prependInnerIcon: "mdi-magnify",
  },
};

export const Disabled: Story = {
  args: {
    label: "Gesperrt",
    prefixLabel: "stacked",
    placeholder: "Schreibgeschützt",
    modelValue: "Deaktivierter Wert",
    disabled: true,
  },
};

export const Readonly: Story = {
  args: {
    label: "Token",
    prefixLabel: "stacked",
    modelValue: "xxxxx-xxxxx-xxxxx",
    readonly: true,
    appendInnerIcon: "mdi-content-copy",
  },
};

// ── Clearable ──────────────────────────────────────────────────────

export const Clearable: Story = {
  render: () => ({
    components: { RTextField },
    setup: () => ({ value: ref("Etwas eingeben und dann löschen") }),
    template: `
      <div style="width:360px">
        <RTextField
          v-model="value"
          prepend-inner-icon="mdi-pencil"
          clearable
          placeholder="Löschbares Eingabefeld"
        />
      </div>
    `,
  }),
};

// ── Color tones ────────────────────────────────────────────────────

export const ColorLadder: Story = {
  name: "Fokusfarbenübersicht",
  render: () => ({
    components: { RTextField },
    setup: () => ({
      primary: ref(""),
      success: ref(""),
      warning: ref(""),
      danger: ref(""),
      info: ref(""),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:14px;width:360px">
        <RTextField v-model="primary" color="primary" placeholder="primary (default)" prefix-label="stacked" label="primary" />
        <RTextField v-model="success" color="success" placeholder="success" prefix-label="stacked" label="success" />
        <RTextField v-model="warning" color="warning" placeholder="warning" prefix-label="stacked" label="warning" />
        <RTextField v-model="danger" color="danger" placeholder="danger" prefix-label="stacked" label="danger" />
        <RTextField v-model="info" color="info" placeholder="info" prefix-label="stacked" label="info" />
      </div>
    `,
  }),
};

// ── Real-world ─────────────────────────────────────────────────────

export const LoginForm: Story = {
  name: "Anmeldung (unterstrichen)",
  render: () => ({
    components: { RTextField, RBtn },
    setup: () => ({
      user: ref(""),
      pass: ref(""),
      show: ref(false),
    }),
    template: `
      <div style="width:320px;display:flex;flex-direction:column;gap:16px;padding:24px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:12px">
        <RTextField
          v-model="user"
          label="Benutzername"
          variant="underlined"
          placeholder="username"
          prepend-inner-icon="mdi-account"
        />
        <RTextField
          v-model="pass"
          label="Passwort"
          variant="underlined"
          :type="show ? 'text' : 'password'"
          placeholder="password"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
          :append-inner-tooltip="show ? 'Passwort ausblenden' : 'Passwort anzeigen'"
          @click:append-inner="show = !show"
        />
        <RBtn block color="primary">Anmelden</RBtn>
      </div>
    `,
  }),
};

export const StackedForm: Story = {
  name: "Einstellungsformular (gestapelt)",
  render: () => ({
    components: { RTextField, RBtn },
    setup: () => ({
      name: ref("Lucas Carter"),
      email: ref("lucas@romm.dev"),
      api: ref(""),
    }),
    template: `
      <div style="width:380px;display:flex;flex-direction:column;gap:14px;padding:20px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:12px">
        <RTextField v-model="name" prefix-label="stacked" label="Anzeigename" placeholder="So sehen Sie andere" />
        <RTextField v-model="email" prefix-label="stacked" label="E-Mail" placeholder="sie@beispiel.de" hint="Nur zur Wiederherstellung verwendet." />
        <RTextField v-model="api" prefix-label="stacked" label="API-Schlüssel" placeholder="API-Schlüssel einfügen" clearable />
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
          <RBtn variant="text">Abbrechen</RBtn>
          <RBtn color="primary">Änderungen speichern</RBtn>
        </div>
      </div>
    `,
  }),
};

export const InlineSearch: Story = {
  name: "Inline-Suchleiste",
  render: () => ({
    components: { RTextField },
    setup: () => ({ q: ref("") }),
    template: `
      <div style="width:480px">
        <RTextField
          v-model="q"
          prefix-label="inline"
          label="Filtern"
          placeholder="Zum Filtern von ROMs tippen"
          clearable
        />
      </div>
    `,
  }),
};

// ── Multiline (`<textarea>`) ──────────────────────────────────

export const Multiline: Story = {
  name: "Mehrzeilig (Textbereich)",
  render: () => ({
    components: { RTextField },
    setup: () => ({ text: ref("") }),
    template: `
      <div style="width:480px">
        <RTextField
          v-model="text"
          label="Notizen"
          prefix-label="stacked"
          placeholder="Hier eine längere Notiz schreiben…"
          multiline
          :rows="4"
        />
      </div>
    `,
  }),
};

export const MultilineMono: Story = {
  name: "Mehrzeilig (Mono / JSON-Editor)",
  render: () => ({
    components: { RTextField },
    setup: () => ({
      text: ref(
        JSON.stringify(
          { name: "Mega Man X", platform: "snes", year: 1993 },
          null,
          2,
        ),
      ),
    }),
    template: `
      <div style="width:480px">
        <RTextField
          v-model="text"
          label="Rohdaten"
          prefix-label="stacked"
          variant="outlined"
          multiline
          :rows="8"
          hide-details
          spellcheck="false"
          style="--mono: var(--r-font-family-mono)"
        />
      </div>
    `,
  }),
};
