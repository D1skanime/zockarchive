import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ZADivider from "./ZADivider.vue";

const meta: Meta<typeof ZADivider> = {
  title: "Grundelemente/Grundbaustein/ZADivider",
  component: ZADivider,
  argTypes: {
    vertical: { control: "boolean" },
    inset: { control: "boolean" },
    thickness: { control: "text" },
  },
  render: (args) => ({
    components: { ZADivider },
    setup: () => ({ args }),
    template: `<div style="width:320px"><ZADivider v-bind="args" /></div>`,
  }),
};

export default meta;

type Story = StoryObj<typeof ZADivider>;

export const Default: Story = {};

// ── Variants ─────────────────────────────────────────────────────────

export const WithText: Story = {
  name: "Mit Text (Standard-Slot)",
  render: (args) => ({
    components: { ZADivider },
    setup: () => ({ args }),
    template: `
      <div style="width:320px;color:var(--r-color-fg)">
        <ZADivider v-bind="args">oder</ZADivider>
      </div>
    `,
  }),
};

export const Vertical: Story = {
  args: { vertical: true },
  render: (args) => ({
    components: { ZADivider },
    setup: () => ({ args }),
    template: `
      <div style="height:60px;display:flex;align-items:center;gap:16px;color:var(--r-color-fg)">
        <span>Links</span>
        <ZADivider v-bind="args" />
        <span>Rechts</span>
      </div>
    `,
  }),
};

export const VerticalWithText: Story = {
  name: "Vertikal mit Text",
  args: { vertical: true },
  render: (args) => ({
    components: { ZADivider },
    setup: () => ({ args }),
    template: `
      <div style="height:120px;display:flex;align-items:stretch;gap:16px;color:var(--r-color-fg)">
        <div style="display:flex;align-items:center;padding:0 16px;background:var(--r-color-surface);border-radius:8px">Oben</div>
        <ZADivider v-bind="args">oder</ZADivider>
        <div style="display:flex;align-items:center;padding:0 16px;background:var(--r-color-surface);border-radius:8px">Unten</div>
      </div>
    `,
  }),
};

// ── Thickness ─────────────────────────────────────────────────────────

export const ThicknessLadder: Story = {
  name: "Stärkenabstufung",
  render: () => ({
    components: { ZADivider },
    template: `
      <div style="width:320px;display:flex;flex-direction:column;gap:18px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div>
          <ZADivider :thickness="1" />
          <div style="margin-top:6px">Stärke: 1 (Standard)</div>
        </div>
        <div>
          <ZADivider :thickness="2" />
          <div style="margin-top:6px">Stärke: 2</div>
        </div>
        <div>
          <ZADivider :thickness="4" />
          <div style="margin-top:6px">Stärke: 4</div>
        </div>
        <div>
          <ZADivider :thickness="8" />
          <div style="margin-top:6px">Stärke: 8</div>
        </div>
      </div>
    `,
  }),
};

export const ThicknessWithText: Story = {
  name: "Stärke · mit Text",
  render: () => ({
    components: { ZADivider },
    template: `
      <div style="width:320px;display:flex;flex-direction:column;gap:18px;color:var(--r-color-fg)">
        <ZADivider :thickness="1">1px</ZADivider>
        <ZADivider :thickness="2">2px</ZADivider>
        <ZADivider :thickness="4">4px</ZADivider>
      </div>
    `,
  }),
};

// ── Inset ────────────────────────────────────────────────────────────

export const FullWidth: Story = {
  name: "Volle Breite (über den Innenabstand hinaus)",
  args: { fullWidth: true },
  render: (args) => ({
    components: { ZADivider },
    setup: () => ({ args }),
    template: `
      <div style="width:320px;background:var(--r-color-surface);border:1px solid var(--r-color-border);border-radius:12px;padding:18px 16px;font:13px/1.4 sans-serif;color:var(--r-color-fg)">
        <div style="padding-block:6px">Der obere Abschnitt liegt innerhalb des 16-px-Innenabstands</div>
        <ZADivider v-bind="args" />
        <div style="padding-block:6px">Unterer Abschnitt · die Trennlinie reicht von Kante zu Kante</div>
      </div>
    `,
  }),
};

export const Inset: Story = {
  args: { inset: true },
  render: (args) => ({
    components: { ZADivider },
    setup: () => ({ args }),
    template: `
      <div style="width:320px;background:var(--r-color-surface);border-radius:8px;overflow:hidden;font:13px/1.4 sans-serif;color:var(--r-color-fg)">
        <div style="display:flex;align-items:center;gap:16px;padding:10px 16px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--r-color-brand-primary)"></div>
          <span>Listeneintrag eins</span>
        </div>
        <ZADivider v-bind="args" />
        <div style="display:flex;align-items:center;gap:16px;padding:10px 16px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--r-color-brand-accent)"></div>
          <span>Listeneintrag zwei</span>
        </div>
        <ZADivider v-bind="args" />
        <div style="display:flex;align-items:center;gap:16px;padding:10px 16px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--r-color-success)"></div>
          <span>Listeneintrag drei</span>
        </div>
      </div>
    `,
  }),
};

// ── Real-world examples ─────────────────────────────────────────────

export const InCard: Story = {
  name: "In einer Karte (Abschnittstrennung)",
  render: () => ({
    components: { ZADivider },
    template: `
      <div style="width:360px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:12px;overflow:hidden;font:13px/1.4 sans-serif;color:var(--r-color-fg)">
        <div style="padding:14px 16px;font-weight:600">Anzeigeeinstellungen</div>
        <ZADivider />
        <div style="padding:14px 16px;color:var(--r-color-fg-muted)">Thema, Dichte, Boxart-Stil …</div>
        <ZADivider />
        <div style="padding:14px 16px;color:var(--r-color-fg-muted)">Statistikübersicht auf der Startseite anzeigen.</div>
      </div>
    `,
  }),
};

export const ConsumerOverride: Story = {
  name: 'Stilüberschreibung im Verbraucher (Login-"oder")',
  render: () => ({
    components: { ZADivider },
    template: `
      <div style="width:320px;display:flex;flex-direction:column;gap:8px;padding:24px;background:var(--r-color-bg);border-radius:12px">
        <div style="height:40px;background:var(--r-color-surface);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--r-color-fg-muted)">Benutzername</div>
        <div style="height:40px;background:var(--r-color-surface);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--r-color-fg-muted)">Passwort</div>
        <div style="height:36px;border-radius:6px;background:var(--r-color-brand-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:600">Anmelden</div>
        <ZADivider style="margin: 12px 0; color: var(--r-color-fg-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">
          oder
        </ZADivider>
        <div style="height:36px;border-radius:6px;background:var(--r-color-surface);color:var(--r-color-fg);display:flex;align-items:center;justify-content:center;font-weight:500">Mit OIDC fortfahren</div>
      </div>
    `,
  }),
};

export const Toolbar: Story = {
  name: "Vertikal in einer Werkzeugleiste",
  render: () => ({
    components: { ZADivider },
    template: `
      <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;background:var(--r-color-surface);border-radius:8px;color:var(--r-color-fg);font:13px/1 sans-serif">
        <span>Datei</span>
        <ZADivider vertical />
        <span>Bearbeiten</span>
        <ZADivider vertical />
        <span>Ansicht</span>
        <ZADivider vertical />
        <span>Hilfe</span>
      </div>
    `,
  }),
};
