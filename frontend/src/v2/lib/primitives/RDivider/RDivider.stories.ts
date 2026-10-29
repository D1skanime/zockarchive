import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RDivider from "./RDivider.vue";

const meta: Meta<typeof RDivider> = {
  title: "Grundelemente/Grundbaustein/RDivider",
  component: RDivider,
  argTypes: {
    vertical: { control: "boolean" },
    inset: { control: "boolean" },
    thickness: { control: "text" },
  },
  render: (args) => ({
    components: { RDivider },
    setup: () => ({ args }),
    template: `<div style="width:320px"><RDivider v-bind="args" /></div>`,
  }),
};

export default meta;

type Story = StoryObj<typeof RDivider>;

export const Default: Story = {};

// ── Variants ─────────────────────────────────────────────────────────

export const WithText: Story = {
  name: "Mit Text (Standard-Slot)",
  render: (args) => ({
    components: { RDivider },
    setup: () => ({ args }),
    template: `
      <div style="width:320px;color:var(--r-color-fg)">
        <RDivider v-bind="args">oder</RDivider>
      </div>
    `,
  }),
};

export const Vertical: Story = {
  args: { vertical: true },
  render: (args) => ({
    components: { RDivider },
    setup: () => ({ args }),
    template: `
      <div style="height:60px;display:flex;align-items:center;gap:16px;color:var(--r-color-fg)">
        <span>Links</span>
        <RDivider v-bind="args" />
        <span>Rechts</span>
      </div>
    `,
  }),
};

export const VerticalWithText: Story = {
  name: "Vertikal mit Text",
  args: { vertical: true },
  render: (args) => ({
    components: { RDivider },
    setup: () => ({ args }),
    template: `
      <div style="height:120px;display:flex;align-items:stretch;gap:16px;color:var(--r-color-fg)">
        <div style="display:flex;align-items:center;padding:0 16px;background:var(--r-color-surface);border-radius:8px">Oben</div>
        <RDivider v-bind="args">oder</RDivider>
        <div style="display:flex;align-items:center;padding:0 16px;background:var(--r-color-surface);border-radius:8px">Unten</div>
      </div>
    `,
  }),
};

// ── Thickness ─────────────────────────────────────────────────────────

export const ThicknessLadder: Story = {
  name: "Stärkenabstufung",
  render: () => ({
    components: { RDivider },
    template: `
      <div style="width:320px;display:flex;flex-direction:column;gap:18px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div>
          <RDivider :thickness="1" />
          <div style="margin-top:6px">Stärke: 1 (Standard)</div>
        </div>
        <div>
          <RDivider :thickness="2" />
          <div style="margin-top:6px">Stärke: 2</div>
        </div>
        <div>
          <RDivider :thickness="4" />
          <div style="margin-top:6px">Stärke: 4</div>
        </div>
        <div>
          <RDivider :thickness="8" />
          <div style="margin-top:6px">Stärke: 8</div>
        </div>
      </div>
    `,
  }),
};

export const ThicknessWithText: Story = {
  name: "Stärke · mit Text",
  render: () => ({
    components: { RDivider },
    template: `
      <div style="width:320px;display:flex;flex-direction:column;gap:18px;color:var(--r-color-fg)">
        <RDivider :thickness="1">1px</RDivider>
        <RDivider :thickness="2">2px</RDivider>
        <RDivider :thickness="4">4px</RDivider>
      </div>
    `,
  }),
};

// ── Inset ────────────────────────────────────────────────────────────

export const FullWidth: Story = {
  name: "Volle Breite (über den Innenabstand hinaus)",
  args: { fullWidth: true },
  render: (args) => ({
    components: { RDivider },
    setup: () => ({ args }),
    template: `
      <div style="width:320px;background:var(--r-color-surface);border:1px solid var(--r-color-border);border-radius:12px;padding:18px 16px;font:13px/1.4 sans-serif;color:var(--r-color-fg)">
        <div style="padding-block:6px">Der obere Abschnitt liegt innerhalb des 16-px-Innenabstands</div>
        <RDivider v-bind="args" />
        <div style="padding-block:6px">Unterer Abschnitt · die Trennlinie reicht von Kante zu Kante</div>
      </div>
    `,
  }),
};

export const Inset: Story = {
  args: { inset: true },
  render: (args) => ({
    components: { RDivider },
    setup: () => ({ args }),
    template: `
      <div style="width:320px;background:var(--r-color-surface);border-radius:8px;overflow:hidden;font:13px/1.4 sans-serif;color:var(--r-color-fg)">
        <div style="display:flex;align-items:center;gap:16px;padding:10px 16px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--r-color-brand-primary)"></div>
          <span>List item one</span>
        </div>
        <RDivider v-bind="args" />
        <div style="display:flex;align-items:center;gap:16px;padding:10px 16px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--r-color-brand-accent)"></div>
          <span>List item two</span>
        </div>
        <RDivider v-bind="args" />
        <div style="display:flex;align-items:center;gap:16px;padding:10px 16px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--r-color-success)"></div>
          <span>List item three</span>
        </div>
      </div>
    `,
  }),
};

// ── Real-world examples ─────────────────────────────────────────────

export const InCard: Story = {
  name: "In einer Karte (Abschnittstrennung)",
  render: () => ({
    components: { RDivider },
    template: `
      <div style="width:360px;background:var(--r-color-bg-elevated);border:1px solid var(--r-color-border);border-radius:12px;overflow:hidden;font:13px/1.4 sans-serif;color:var(--r-color-fg)">
        <div style="padding:14px 16px;font-weight:600">Anzeigeeinstellungen</div>
        <RDivider />
        <div style="padding:14px 16px;color:var(--r-color-fg-muted)">Thema, Dichte, Boxart-Stil …</div>
        <RDivider />
        <div style="padding:14px 16px;color:var(--r-color-fg-muted)">Statistikübersicht auf der Startseite anzeigen.</div>
      </div>
    `,
  }),
};

export const ConsumerOverride: Story = {
  name: "Consumer style override (the Login 'or')",
  render: () => ({
    components: { RDivider },
    template: `
      <div style="width:320px;display:flex;flex-direction:column;gap:8px;padding:24px;background:var(--r-color-bg);border-radius:12px">
        <div style="height:40px;background:var(--r-color-surface);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--r-color-fg-muted)">Username field</div>
        <div style="height:40px;background:var(--r-color-surface);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--r-color-fg-muted)">Password field</div>
        <div style="height:36px;border-radius:6px;background:var(--r-color-brand-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:600">Sign in</div>
        <RDivider style="margin: 12px 0; color: var(--r-color-fg-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">
          or
        </RDivider>
        <div style="height:36px;border-radius:6px;background:var(--r-color-surface);color:var(--r-color-fg);display:flex;align-items:center;justify-content:center;font-weight:500">Continue with OIDC</div>
      </div>
    `,
  }),
};

export const Toolbar: Story = {
  name: "Vertikal in einer Werkzeugleiste",
  render: () => ({
    components: { RDivider },
    template: `
      <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;background:var(--r-color-surface);border-radius:8px;color:var(--r-color-fg);font:13px/1 sans-serif">
        <span>Datei</span>
        <RDivider vertical />
        <span>Bearbeiten</span>
        <RDivider vertical />
        <span>Ansicht</span>
        <RDivider vertical />
        <span>Hilfe</span>
      </div>
    `,
  }),
};
