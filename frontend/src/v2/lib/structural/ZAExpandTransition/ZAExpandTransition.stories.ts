import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ZATextField from "@/v2/lib/forms/ZATextField/ZATextField.vue";
import ZABtn from "@/v2/lib/primitives/ZABtn/ZABtn.vue";
import ZACard from "@/v2/lib/primitives/ZACard/ZACard.vue";
import ZAExpandTransition from "./ZAExpandTransition.vue";

const meta: Meta<typeof ZAExpandTransition> = {
  title: "Struktur/Grundbaustein/ZAExpandTransition",
  component: ZAExpandTransition,
  argTypes: {
    appear: { control: "boolean" },
    duration: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ZAExpandTransition>;

// ── v-if — mount/unmount ─────────────────────────────────────────

export const VIf: Story = {
  name: "v-if (ein-/aushängen)",
  render: (args) => ({
    components: { ZAExpandTransition, ZABtn, ZACard },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div style="padding:40px;display:flex;flex-direction:column;gap:12px;max-width:420px">
        <ZABtn variant="translucent" @click="open = !open">
          Details {{ open ? 'ausblenden' : 'anzeigen' }}
        </ZABtn>
        <ZAExpandTransition v-bind="args">
          <ZACard v-if="open" variant="elevated">
            <div style="padding:14px;font:13px sans-serif">
              <p style="margin:0 0 8px"><strong>Inhalt mit variabler Höhe</strong></p>
              <p style="margin:0;line-height:1.5">
                Der Wrapper misst beim Einblenden <code>scrollHeight</code>
                und animiert von 0 zu diesem Wert. Beim Ausblenden geschieht
                dies umgekehrt, sodass der Bereich unabhängig von seiner Höhe
                sanft einklappt.
              </p>
            </div>
          </ZACard>
        </ZAExpandTransition>
      </div>
    `,
  }),
};

// ── v-show — display toggle ─────────────────────────────────────

export const VShow: Story = {
  name: "v-show (Anzeige umschalten)",
  render: () => ({
    components: { ZAExpandTransition, ZABtn, ZACard },
    setup: () => ({ open: ref(true) }),
    template: `
      <div style="padding:40px;display:flex;flex-direction:column;gap:12px;max-width:420px">
        <ZABtn variant="translucent" @click="open = !open">
          Bereich {{ open ? 'ausblenden' : 'anzeigen' }}
        </ZABtn>
        <ZAExpandTransition>
          <ZACard v-show="open" variant="elevated">
            <div style="padding:14px;font:13px sans-serif">
              Das Element bleibt im DOM, nur <code>display</code> wechselt.
              Nutze v-show, wenn erneutes Einhängen teuer wäre, etwa bei
              einem iframe, Video oder aufwendigem Formularzustand.
            </div>
          </ZACard>
        </ZAExpandTransition>
      </div>
    `,
  }),
};

// ── Conditional sibling sections ─────────────────────────────────

export const TwoPanels: Story = {
  name: "Moduswechsel (Anmeldestil)",
  render: () => ({
    components: { ZAExpandTransition, ZABtn, ZACard, ZATextField },
    setup: () => ({ forgotMode: ref(false) }),
    template: `
      <div style="padding:40px;display:flex;flex-direction:column;gap:8px;max-width:380px">
        <ZAExpandTransition>
          <div v-show="!forgotMode" style="display:flex;flex-direction:column;gap:10px">
            <ZATextField label="Benutzername" prefix-label="stacked" />
            <ZATextField label="Passwort" type="password" prefix-label="stacked" />
            <ZABtn variant="text" size="small" @click="forgotMode = true">
              Passwort vergessen?
            </ZABtn>
          </div>
        </ZAExpandTransition>

        <ZAExpandTransition>
          <div v-show="forgotMode" style="display:flex;flex-direction:column;gap:10px">
            <ZATextField label="E-Mail" prefix-label="stacked" />
            <ZABtn variant="text" size="small" @click="forgotMode = false">
              ← Zurück zur Anmeldung
            </ZABtn>
          </div>
        </ZAExpandTransition>
      </div>
    `,
  }),
};

// ── Initial mount animation ──────────────────────────────────────

export const Appear: Story = {
  name: "appear (beim Einhängen animieren)",
  args: { appear: true },
  render: (args) => ({
    components: { ZAExpandTransition, ZACard },
    setup: () => ({ args }),
    template: `
      <div style="padding:40px;max-width:420px">
        <ZAExpandTransition v-bind="args">
          <ZACard variant="elevated">
            <div style="padding:14px;font:13px sans-serif">
              Mit <code>appear</code> wird das Element bereits beim ersten
              Rendern animiert, nützlich für Landingpages oder Onboarding-Karten.
            </div>
          </ZACard>
        </ZAExpandTransition>
      </div>
    `,
  }),
};

// ── Custom duration ──────────────────────────────────────────────

export const CustomDuration: Story = {
  name: "Benutzerdefinierte Dauer",
  args: { duration: "500ms" },
  render: (args) => ({
    components: { ZAExpandTransition, ZABtn, ZACard },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div style="padding:40px;display:flex;flex-direction:column;gap:12px;max-width:420px">
        <ZABtn variant="translucent" @click="open = !open">Umschalten</ZABtn>
        <ZAExpandTransition v-bind="args">
          <ZACard v-if="open" variant="elevated">
            <div style="padding:14px;font:13px sans-serif">
              Langsame Erweiterung in 500 ms, übergib einen beliebigen CSS-Zeitwert
              an die Eigenschaft <code>duration</code>.
            </div>
          </ZACard>
        </ZAExpandTransition>
      </div>
    `,
  }),
};
