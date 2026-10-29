import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, userEvent } from "storybook/test";
import { computed, ref } from "vue";
import RCheckbox from "./RCheckbox.vue";
import type { RCheckboxState } from "./types";

// Permission-matrix vocabulary: empty -> full (primary check) -> own
// (accent person). A fourth danger state shows the 4-state override flavour.
const GRANT_STATES: RCheckboxState[] = [
  { value: "none" },
  { value: "full", color: "primary" },
  { value: "own", color: "accent", icon: "mdi-account" },
];
const OVERRIDE_STATES: RCheckboxState[] = [
  { value: "inherit" },
  { value: "grant", color: "primary" },
  { value: "grant_own", color: "accent", icon: "mdi-account" },
  { value: "revoke", color: "danger", icon: "mdi-close" },
];

const meta: Meta<typeof RCheckbox> = {
  title: "Formulare/Grundbaustein/RCheckbox",
  component: RCheckbox,
  argTypes: {
    label: { control: "text" },
    subtitle: { control: "text" },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"],
    },
    shape: {
      control: "inline-radio",
      options: ["square", "rounded", "circle"],
    },
    color: { control: "text" },
    variant: {
      control: "inline-radio",
      options: ["box", "card"],
    },
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
    bare: { control: "boolean" },
    error: { control: "boolean" },
    errorMessages: { control: "text" },
  },
  render: (args) => ({
    components: { RCheckbox },
    setup: () => {
      const value = ref(false);
      return { args, value };
    },
    template: `<RCheckbox v-model="value" v-bind="args" />`,
  }),
};

export default meta;
type Story = StoryObj<typeof RCheckbox>;

// ── Defaults ────────────────────────────────────────────────────────

export const Default: Story = {
  args: { label: "Angemeldet bleiben" },
};

export const Checked: Story = {
  args: { label: "Beim nächsten Mal automatisch anmelden" },
  render: (args) => ({
    components: { RCheckbox },
    setup: () => {
      const value = ref(true);
      return { args, value };
    },
    template: `<RCheckbox v-model="value" v-bind="args" />`,
  }),
};

export const Indeterminate: Story = {
  args: { label: "Einige Elemente ausgewählt", indeterminate: true },
};

export const NoLabel: Story = {
  render: () => ({
    components: { RCheckbox },
    setup: () => ({ value: ref(false) }),
    template: `<RCheckbox v-model="value" aria-label="Akzeptieren" />`,
  }),
};

// ── Multi-state ─────────────────────────────────────────────────────

// `states` opts into an N-value control on its own `stateValue` model,
// leaving the boolean `modelValue` path untouched. Clicking cycles through
// the ordered list (first = empty); a state with a `color` fills the box
// and with an `icon` shows that glyph (else the check tick).
export const MultiState: Story = {
  name: "Mehrere Zustände (keine / vollständig / eigene)",
  render: () => ({
    components: { RCheckbox },
    setup() {
      const state = ref<string>("none");
      return { state, GRANT_STATES };
    },
    template: `
      <div style="display:flex;flex-direction:column;align-items:flex-start;gap:12px;font:12px/1.4 sans-serif;color:var(--r-color-fg-muted)">
        <RCheckbox
          v-model:state-value="state"
          :states="GRANT_STATES"
          aria-label="Berechtigung"
          label="Zum Wechseln klicken: keine → vollständig → eigene"
        />
        <span>Aktueller Wert: <strong>{{ state }}</strong></span>
      </div>
    `,
  }),
  play: async ({ canvasElement, step }) => {
    const label = canvasElement.querySelector(".r-checkbox") as HTMLElement;
    const wrap = canvasElement.querySelector(".r-checkbox-wrap") as HTMLElement;

    await step("none → full (check, primary)", async () => {
      await userEvent.click(label);
      await expect(wrap.classList.contains("r-checkbox--multi-active")).toBe(
        true,
      );
      await expect(wrap.classList.contains("r-checkbox--multi-check")).toBe(
        true,
      );
    });
    await step("full → own (account, accent)", async () => {
      await userEvent.click(label);
      await expect(wrap.classList.contains("r-checkbox--multi-icon")).toBe(
        true,
      );
    });
    await step("own → none (empty)", async () => {
      await userEvent.click(label);
      await expect(wrap.classList.contains("r-checkbox--multi-active")).toBe(
        false,
      );
    });
  },
};

// The override flavour cycles through four states — inherit, grant
// (primary), grant-own (accent), revoke (danger).
export const MultiStateLadder: Story = {
  name: "Mehrere Zustände (4-stufige Überschreibung)",
  render: () => ({
    components: { RCheckbox },
    setup() {
      const inherit = ref("inherit");
      const grant = ref("grant");
      const grantOwn = ref("grant_own");
      const revoke = ref("revoke");
      return { inherit, grant, grantOwn, revoke, OVERRIDE_STATES };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:10px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <RCheckbox v-model:state-value="inherit" :states="OVERRIDE_STATES" label="vererben, Gruppe entscheidet" />
        <RCheckbox v-model:state-value="grant" :states="OVERRIDE_STATES" label="gewähren, Zugriff erzwingen (primär)" />
        <RCheckbox v-model:state-value="grantOwn" :states="OVERRIDE_STATES" label="eigene gewähren, eigene Elemente erlauben (Akzent)" />
        <RCheckbox v-model:state-value="revoke" :states="OVERRIDE_STATES" label="entziehen, Zugriff verweigern (Gefahr)" />
      </div>
    `,
  }),
};

// ── Sizes ───────────────────────────────────────────────────────────

export const SizeLadder: Story = {
  name: "Größenübersicht (xs / sm / md / lg)",
  render: () => ({
    components: { RCheckbox },
    setup: () => {
      const xs = ref(true);
      const sm = ref(true);
      const md = ref(true);
      const lg = ref(true);
      return { xs, sm, md, lg };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:10px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <RCheckbox v-model="xs" size="xs" label="xs — 12 px" />
        <RCheckbox v-model="sm" size="sm" label="sm — 16 px" />
        <RCheckbox v-model="md" size="md" label="md — 18 px (default)" />
        <RCheckbox v-model="lg" size="lg" label="lg — 22 px" />
      </div>
    `,
  }),
};

// ── Shapes ──────────────────────────────────────────────────────────

export const ShapeLadder: Story = {
  name: "Formenübersicht (eckig / abgerundet / Kreis)",
  render: () => ({
    components: { RCheckbox },
    setup: () => {
      const a = ref(true);
      const b = ref(true);
      const c = ref(true);
      return { a, b, c };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:10px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <RCheckbox v-model="a" shape="square" label="eckig (Standard · 4 px Radius)" />
        <RCheckbox v-model="b" shape="rounded" label="abgerundet (8 px Radius)" />
        <RCheckbox v-model="c" shape="circle" label="Kreis (50 %, wie ein Optionsfeld)" />
      </div>
    `,
  }),
};

// ── Colors ──────────────────────────────────────────────────────────

export const ColorLadder: Story = {
  name: "Farbübersicht",
  render: () => ({
    components: { RCheckbox },
    setup: () => {
      const states = ref([
        { color: "primary", label: "primary (default)", checked: true },
        { color: "secondary", label: "secondary", checked: true },
        { color: "accent", label: "accent", checked: true },
        { color: "success", label: "success", checked: true },
        { color: "warning", label: "warning", checked: true },
        { color: "danger", label: "danger", checked: true },
        { color: "info", label: "info", checked: true },
        { color: "romm-gold", label: "romm-gold (legacy)", checked: true },
      ]);
      return { states };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:10px">
        <RCheckbox
          v-for="s in states"
          :key="s.color"
          v-model="s.checked"
          :color="s.color"
          :label="s.label"
        />
      </div>
    `,
  }),
};

// ── States ──────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { label: "Deaktiviertes Kontrollkästchen", disabled: true },
};

export const DisabledChecked: Story = {
  args: { label: "Deaktiviert und ausgewählt", disabled: true },
  render: (args) => ({
    components: { RCheckbox },
    setup: () => {
      const value = ref(true);
      return { args, value };
    },
    template: `<RCheckbox v-model="value" v-bind="args" />`,
  }),
};

export const Error: Story = {
  args: { label: "Ich stimme den Bedingungen zu" },
  render: (args) => ({
    components: { RCheckbox },
    setup: () => {
      const value = ref(false);
      return { args, value };
    },
    template: `<RCheckbox v-model="value" v-bind="args" :error="true" error-messages="Dieses Feld ist erforderlich" />`,
  }),
};

// ── Subtitle ────────────────────────────────────────────────────────

export const WithSubtitle: Story = {
  name: "Mit Untertitel",
  args: {
    label: "Wöchentliche Zusammenfassung senden",
    subtitle:
      "Wir senden Ihnen freitags eine Zusammenfassung neuer ROMs und Scans.",
  },
  render: (args) => ({
    components: { RCheckbox },
    setup: () => {
      const value = ref(false);
      return { args, value };
    },
    template: `<RCheckbox v-model="value" v-bind="args" />`,
  }),
};

// ── Card variant ────────────────────────────────────────────────────

export const CardVariant: Story = {
  name: "Kartenvariante",
  render: () => ({
    components: { RCheckbox },
    setup: () => {
      const a = ref(true);
      const b = ref(false);
      const c = ref(false);
      return { a, b, c };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:10px;width:360px">
        <RCheckbox
          v-model="a"
          variant="card"
          label="Token in die Zwischenablage kopieren"
          subtitle="Wird nur einmal angezeigt, sicher aufbewahren."
        />
        <RCheckbox
          v-model="b"
          variant="card"
          label="Gerät koppeln"
          subtitle="QR-Code mit dem Smartphone scannen."
        />
        <RCheckbox
          v-model="c"
          variant="card"
          label="Link per E-Mail senden"
          subtitle="Wird an Ihre registrierte Adresse gesendet."
        />
      </div>
    `,
  }),
};

export const CardVariantColored: Story = {
  name: "Kartenvariante · Erfolgston",
  render: () => ({
    components: { RCheckbox },
    setup: () => {
      const a = ref(true);
      const b = ref(false);
      return { a, b };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:10px;width:360px">
        <RCheckbox
          v-model="a"
          variant="card"
          color="success"
          label="Bestätigte E-Mail"
          subtitle="Required to recover your account."
        />
        <RCheckbox
          v-model="b"
          variant="card"
          color="success"
          label="Two-factor enabled"
          subtitle="Adds a one-time code at sign-in."
        />
      </div>
    `,
  }),
};

// ── Bare ────────────────────────────────────────────────────────────

// `bare` strips the row's vertical breathing padding and the box↔label
// gap. The box stays the same; only the surrounding chrome is removed.
// Used when the consumer owns the layout (overlay corners, list-row
// columns, dense table cells) and wants the checkbox to sit flush.
export const Bare: Story = {
  name: "Ohne Außenabstand",
  render: () => ({
    components: { RCheckbox },
    setup: () => {
      const normal = ref(true);
      const bare = ref(true);
      return { normal, bare };
    },
    template: `
      <div style="display:flex;gap:24px;align-items:flex-start;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;gap:8px;padding:12px;border:1px dashed var(--r-color-border);border-radius:6px">
          <span>Standard (mit Außenabstand)</span>
          <RCheckbox v-model="normal" label="Standardzeile" />
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;padding:12px;border:1px dashed var(--r-color-border);border-radius:6px">
          <span>ohne Außenabstand (bündig)</span>
          <RCheckbox v-model="bare" bare label="Bündige Zeile" />
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Verwenden Sie `bare`, wenn der Verbraucher das umgebende Layout besitzt, etwa eine GameCard-Overlayecke oder eine Checkbox-Spalte in einer Listenzeile.",
      },
    },
  },
};

// ── Motion ──────────────────────────────────────────────────────────

export const Toggle: Story = {
  name: "Umschaltanimation",
  render: () => ({
    components: { RCheckbox },
    setup: () => {
      const value = ref(false);
      return { value };
    },
    template: `
      <div style="display:flex;flex-direction:column;align-items:flex-start;gap:14px;font:12px/1.4 sans-serif;color:var(--r-color-fg-muted)">
        <RCheckbox v-model="value" label="Klicken Sie mich, das Symbol federt ein" />
        <span>Das Häkchen skaliert mit derselben Überschwingung wie RSwitch von 0 → 1.</span>
      </div>
    `,
  }),
};

// ── Group ───────────────────────────────────────────────────────────

export const Group: Story = {
  render: () => ({
    components: { RCheckbox },
    setup: () => {
      const a = ref(true);
      const b = ref(false);
      const c = ref(false);
      return { a, b, c };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:4px">
        <RCheckbox v-model="a" label="Option A" hide-details />
        <RCheckbox v-model="b" label="Option B" hide-details />
        <RCheckbox v-model="c" label="Option C (longer label that wraps to test alignment)" hide-details />
      </div>
    `,
  }),
};

// ── Real-world — "select all" indeterminate ─────────────────────────

export const SelectAll: Story = {
  name: "Alle auswählen (unbestimmte Kopfzeile)",
  render: () => ({
    components: { RCheckbox },
    setup() {
      const items = ref([
        { id: 1, name: "platforms.read", checked: true },
        { id: 2, name: "platforms.write", checked: false },
        { id: 3, name: "roms.read", checked: true },
        { id: 4, name: "roms.write", checked: false },
        { id: 5, name: "users.read", checked: false },
      ]);

      const allChecked = computed(() => items.value.every((i) => i.checked));
      const anyChecked = computed(() => items.value.some((i) => i.checked));
      const headerIndeterminate = computed(
        () => anyChecked.value && !allChecked.value,
      );

      function toggleAll(v: boolean) {
        items.value.forEach((i) => {
          i.checked = v;
        });
      }

      return { items, allChecked, headerIndeterminate, toggleAll };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:8px;width:320px;padding:16px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:10px">
        <RCheckbox
          :model-value="allChecked"
          :indeterminate="headerIndeterminate"
          label="Alle Berechtigungen auswählen"
          hide-details
          @update:model-value="toggleAll"
        />
        <div style="height:1px;background:var(--r-color-border);margin:4px 0"></div>
        <RCheckbox
          v-for="item in items"
          :key="item.id"
          v-model="item.checked"
          :label="item.name"
          hide-details
        />
      </div>
    `,
  }),
};
