import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted, onUnmounted, ref } from "vue";
import ZAProgressCircular from "./ZAProgressCircular.vue";

const meta: Meta<typeof ZAProgressCircular> = {
  title: "Grundelemente/Grundbaustein/ZAProgressCircular",
  component: ZAProgressCircular,
  argTypes: {
    indeterminate: { control: "boolean" },
    size: { control: "number" },
    width: { control: "number" },
    color: { control: "text" },
    label: { control: "text" },
    modelValue: { control: { type: "range", min: 0, max: 100 } },
  },
};

export default meta;

type Story = StoryObj<typeof ZAProgressCircular>;

// ── Defaults ────────────────────────────────────────────────────────

export const Indeterminate: Story = {
  args: { indeterminate: true, size: 32 },
};

export const Determinate: Story = {
  args: {
    indeterminate: false,
    modelValue: 65,
    size: 64,
    width: 4,
    label: "Download-Fortschritt",
  },
};

// ── Size ladder ─────────────────────────────────────────────────────

export const SizeLadder: Story = {
  name: "Größenabstufung · unbestimmt",
  render: () => ({
    components: { ZAProgressCircular },
    template: `
      <div style="display:flex;align-items:flex-end;gap:24px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular indeterminate :size="16" :width="2" />
          <span>16 / 2</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular indeterminate :size="24" :width="2" />
          <span>24 / 2</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular indeterminate :size="36" :width="3" />
          <span>36 / 3</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular indeterminate :size="56" :width="4" />
          <span>56 / 4</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular indeterminate :size="80" :width="6" />
          <span>80 / 6</span>
        </div>
      </div>
    `,
  }),
};

export const DeterminateLadder: Story = {
  name: "Bestimmt · abgestufte Werte",
  render: () => ({
    components: { ZAProgressCircular },
    template: `
      <div style="display:flex;align-items:flex-end;gap:24px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular :indeterminate="false" :model-value="0" :size="48" :width="4" label="Fortschritt" />
          <span>0%</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular :indeterminate="false" :model-value="25" :size="48" :width="4" label="Fortschritt" />
          <span>25%</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular :indeterminate="false" :model-value="50" :size="48" :width="4" label="Fortschritt" />
          <span>50%</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular :indeterminate="false" :model-value="75" :size="48" :width="4" label="Fortschritt" />
          <span>75%</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular :indeterminate="false" :model-value="100" :size="48" :width="4" label="Fortschritt" />
          <span>100%</span>
        </div>
      </div>
    `,
  }),
};

// ── Tones ───────────────────────────────────────────────────────────

export const Tones: Story = {
  render: () => ({
    components: { ZAProgressCircular },
    template: `
      <div style="display:grid;grid-template-columns:repeat(4,auto);gap:24px 32px;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular color="primary" :size="40" :width="3" />
          <span>Primär</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular color="secondary" :size="40" :width="3" />
          <span>Sekundär</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular color="accent" :size="40" :width="3" />
          <span>Akzent</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular color="success" :size="40" :width="3" />
          <span>Erfolg</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular color="warning" :size="40" :width="3" />
          <span>Warnung</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular color="danger" :size="40" :width="3" />
          <span>Gefahr</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular color="info" :size="40" :width="3" />
          <span>Information</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular color="romm-gold" :size="40" :width="3" />
          <span>RomM-Gold</span>
        </div>
      </div>
    `,
  }),
};

// ── Slot ─────────────────────────────────────────────────────────────

export const WithLabel: Story = {
  name: "Standard-Slot (Prozentbeschriftung)",
  render: () => ({
    components: { ZAProgressCircular },
    template: `
      <div style="display:flex;gap:24px;align-items:flex-end;font:11px/1.2 sans-serif;color:var(--r-color-fg-muted)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular :indeterminate="false" :model-value="35" :size="64" :width="4">
            35%
          </ZAProgressCircular>
          <span>numerisch</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <ZAProgressCircular :indeterminate="false" :model-value="80" :size="80" :width="5" color="success">
            <span style="font-size:14px">80%</span>
          </ZAProgressCircular>
          <span>größer + eigene Schriftgröße</span>
        </div>
      </div>
    `,
  }),
};

// ── Live progress ───────────────────────────────────────────────────

export const Animated: Story = {
  name: "Animierter Fortschritt (Live-Aktualisierung)",
  render: () => ({
    components: { ZAProgressCircular },
    setup() {
      const value = ref(0);
      let timer: ReturnType<typeof setInterval> | undefined;
      onMounted(() => {
        timer = setInterval(() => {
          value.value = (value.value + 5) % 105;
          if (value.value > 100) value.value = 0;
        }, 400);
      });
      onUnmounted(() => {
        if (timer) clearInterval(timer);
      });
      return { value };
    },
    template: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;font:12px/1.4 sans-serif;color:var(--r-color-fg-muted)">
        <ZAProgressCircular :indeterminate="false" :model-value="value" :size="80" :width="5" color="primary">
          <span style="font-size:14px;font-weight:600">{{ value }}%</span>
        </ZAProgressCircular>
          <span>Der Wert steigt alle 400 ms, beachten Sie den weichen Füllübergang.</span>
      </div>
    `,
  }),
};

// ── Comparison ──────────────────────────────────────────────────────

export const InContext: Story = {
  name: "Direkt in Schaltflächen / Dialogen",
  render: () => ({
    components: { ZAProgressCircular },
    template: `
      <div style="display:flex;flex-direction:column;gap:18px;font:13px/1.4 sans-serif;color:var(--r-color-fg)">
        <button
          type="button"
          style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:var(--r-color-brand-primary);color:white;border:none;border-radius:6px;font-weight:600;cursor:wait;align-self:flex-start"
          disabled
        >
          <ZAProgressCircular indeterminate :size="14" :width="2" color="white" />
          Wird übermittelt…
        </button>
        <div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--r-color-surface);border-radius:12px;align-self:flex-start">
          <ZAProgressCircular indeterminate :size="36" :width="3" color="primary" />
          <div style="display:flex;flex-direction:column;gap:2px">
            <span style="font-weight:600">Metadaten werden geladen</span>
            <span style="color:var(--r-color-fg-muted);font-size:11px">Dies kann einige Sekunden dauern …</span>
          </div>
        </div>
      </div>
    `,
  }),
};
