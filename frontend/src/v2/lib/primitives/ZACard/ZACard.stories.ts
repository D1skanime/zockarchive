import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ZACard from "./ZACard.vue";

const meta: Meta<typeof ZACard> = {
  title: "Grundelemente/Grundbaustein/ZACard",
  component: ZACard,
  argTypes: {
    variant: {
      control: "select",
      options: ["flat", "elevated", "translucent", "outlined", "text", "plain"],
    },
    color: { control: "text" },
    elevation: { control: "number" },
    rounded: { control: "text" },
    title: { control: "text" },
    subtitle: { control: "text" },
    loading: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof ZACard>;

// ── Defaults ────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => ({
    components: { ZACard },
    setup: () => ({ args }),
    template: `
      <ZACard v-bind="args" style="width: 360px; padding: var(--r-space-5);">
        Hier steht Inhalt. ZACard hat einen dezenten Rahmen und einen erhöhten
        Hintergrund aus den v2-Tokens.
      </ZACard>
    `,
  }),
};

export const WithTitle: Story = {
  args: { title: "Letzte Scans", subtitle: "Letzte 24 Stunden" },
  render: (args) => ({
    components: { ZACard },
    setup: () => ({ args }),
    template: `
      <ZACard v-bind="args" style="width: 360px;">
        <div style="padding: 12px 20px 18px; color: var(--r-color-fg-muted); font: 13px/1.4 sans-serif;">
          3 Plattformen durchsucht · 18 neue ROMs · 4 fehlen.
        </div>
      </ZACard>
    `,
  }),
};

// ── Variants ────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => ({
    components: { ZACard },
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;width:720px">
        <ZACard variant="flat" style="padding:18px"><strong>flach</strong> · Standardfläche + Rand</ZACard>
        <ZACard variant="elevated" style="padding:18px"><strong>erhöht</strong> · Fläche + Schatten</ZACard>
        <ZACard variant="translucent" color="primary" style="padding:18px"><strong>durchscheinend</strong> · getönt</ZACard>
        <ZACard variant="outlined" style="padding:18px"><strong>umrandet</strong> · nur Rand</ZACard>
        <ZACard variant="text" color="primary" style="padding:18px"><strong>Text</strong> · nur eingefärbter Text</ZACard>
        <ZACard variant="plain" style="padding:18px"><strong>schlicht</strong> · ohne Gestaltung</ZACard>
      </div>
    `,
  }),
};

// ── Tones ───────────────────────────────────────────────────────────

export const Tones: Story = {
  name: "Tones · translucent",
  render: () => ({
    components: { ZACard },
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;width:720px">
        <ZACard variant="translucent" color="primary" style="padding:14px">primary</ZACard>
        <ZACard variant="translucent" color="secondary" style="padding:14px">secondary</ZACard>
        <ZACard variant="translucent" color="accent" style="padding:14px">accent</ZACard>
        <ZACard variant="translucent" color="success" style="padding:14px">success</ZACard>
        <ZACard variant="translucent" color="warning" style="padding:14px">warning</ZACard>
        <ZACard variant="translucent" color="danger" style="padding:14px">danger</ZACard>
        <ZACard variant="translucent" color="info" style="padding:14px">info</ZACard>
        <ZACard variant="translucent" style="padding:14px">neutral</ZACard>
      </div>
    `,
  }),
};

// ── Elevation ───────────────────────────────────────────────────────

export const ElevationLadder: Story = {
  name: "Erhöhungsabstufung",
  render: () => ({
    components: { ZACard },
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:36px;width:720px;padding:24px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <ZACard variant="elevated" :elevation="0" style="width:160px;padding:18px">e=0</ZACard>
          <span>0 (none)</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <ZACard variant="elevated" :elevation="1" style="width:160px;padding:18px">e=1</ZACard>
          <span>1</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <ZACard variant="elevated" :elevation="2" style="width:160px;padding:18px">e=2</ZACard>
          <span>2</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <ZACard variant="elevated" :elevation="4" style="width:160px;padding:18px">e=4</ZACard>
          <span>4</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <ZACard variant="elevated" :elevation="8" style="width:160px;padding:18px">e=8</ZACard>
          <span>8</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <ZACard variant="elevated" :elevation="16" style="width:160px;padding:18px">e=16</ZACard>
          <span>16</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <ZACard variant="elevated" :elevation="24" style="width:160px;padding:18px">e=24</ZACard>
          <span>24</span>
        </div>
      </div>
    `,
  }),
};

// ── Rounded ─────────────────────────────────────────────────────────

export const RoundedLadder: Story = {
  name: "Abrundungsabstufung",
  render: () => ({
    components: { ZACard },
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;width:720px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZACard :rounded="0" style="width:160px;padding:18px">rounded 0</ZACard>
          <span>0</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZACard rounded="sm" style="width:160px;padding:18px">rounded sm</ZACard>
          <span>sm · 4</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZACard rounded="md" style="width:160px;padding:18px">rounded md</ZACard>
          <span>md · 8</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZACard rounded="lg" style="width:160px;padding:18px">rounded lg</ZACard>
          <span>lg · 12 (default)</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZACard rounded="xl" style="width:160px;padding:18px">rounded xl</ZACard>
          <span>xl · 16</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZACard :rounded="24" style="width:160px;padding:18px">rounded 24</ZACard>
          <span>24px</span>
        </div>
      </div>
    `,
  }),
};

// ── Loading ─────────────────────────────────────────────────────────

export const Loading: Story = {
  name: "Ladebalken",
  render: () => ({
    components: { ZACard },
    template: `
      <div style="display:flex;flex-direction:column;gap:18px;width:360px">
        <ZACard loading title="Metadaten werden geladen" subtitle="Verbindung mit IGDB wird hergestellt …">
          <div style="padding:8px 20px 18px;color:var(--r-color-fg-muted);font:12px/1.4 sans-serif">
            Der Karteninhalt bleibt sichtbar, während der Balken oben gleitet.
          </div>
        </ZACard>
        <ZACard loading variant="elevated" :elevation="4" color="primary">
          <div style="padding:18px 20px;font:12px/1.4 sans-serif">
            Der Ladebalken passt sich dem Farbton der Karte an (verwendet <code>--r-card-color</code>, falls vorhanden).
          </div>
        </ZACard>
      </div>
    `,
  }),
};

// ── Real-world ──────────────────────────────────────────────────────

export const AuthCardSim: Story = {
  name: "AuthCard-Nachbildung",
  render: () => ({
    components: { ZACard },
    template: `
      <ZACard variant="elevated" :elevation="4" style="width:320px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:24px">
          <div style="width:80px;height:80px;border-radius:18px;background:var(--r-color-brand-primary);display:flex;align-items:center;justify-content:center;color:white;font:700 22px/1 sans-serif">R</div>
          <h2 style="margin:0;font:600 18px/1.2 sans-serif">Willkommen zurück</h2>
          <p style="margin:0;color:var(--r-color-fg-muted);font:13px/1.4 sans-serif;text-align:center">Melden Sie sich bei Ihrer RomM-Bibliothek an</p>
        </div>
      </ZACard>
    `,
  }),
};

export const SettingsPanel: Story = {
  name: "Einstellungsbereich (Player-Verwendung)",
  render: () => ({
    components: { ZACard },
    template: `
      <ZACard variant="flat" style="width:320px">
        <div style="display:flex;align-items:center;gap:8px;padding:12px 16px;color:var(--r-color-fg-muted);font:11px/1 sans-serif;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border-bottom:1px solid var(--r-color-border)">
          Settings
        </div>
        <div style="padding:14px 16px;font:13px/1.5 sans-serif;color:var(--r-color-fg)">
          <div style="margin-bottom:6px;color:var(--r-color-fg-muted)">Background color</div>
          <div style="display:flex;gap:8px">
            <div style="width:28px;height:28px;border-radius:6px;background:var(--r-color-brand-primary);cursor:pointer"></div>
            <div style="width:28px;height:28px;border-radius:6px;background:var(--r-color-success);cursor:pointer"></div>
            <div style="width:28px;height:28px;border-radius:6px;background:var(--r-color-warning);cursor:pointer"></div>
            <div style="width:28px;height:28px;border-radius:6px;background:var(--r-color-danger);cursor:pointer"></div>
          </div>
        </div>
      </ZACard>
    `,
  }),
};
