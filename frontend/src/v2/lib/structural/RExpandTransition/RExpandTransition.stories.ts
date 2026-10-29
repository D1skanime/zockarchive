import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import RTextField from "@/v2/lib/forms/RTextField/RTextField.vue";
import RBtn from "@/v2/lib/primitives/RBtn/RBtn.vue";
import RCard from "@/v2/lib/primitives/RCard/RCard.vue";
import RExpandTransition from "./RExpandTransition.vue";

const meta: Meta<typeof RExpandTransition> = {
  title: "Struktur/Grundbaustein/RExpandTransition",
  component: RExpandTransition,
  argTypes: {
    appear: { control: "boolean" },
    duration: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof RExpandTransition>;

// ── v-if — mount/unmount ─────────────────────────────────────────

export const VIf: Story = {
  name: "v-if (ein-/aushängen)",
  render: (args) => ({
    components: { RExpandTransition, RBtn, RCard },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div style="padding:40px;display:flex;flex-direction:column;gap:12px;max-width:420px">
        <RBtn variant="translucent" @click="open = !open">
          Details {{ open ? 'ausblenden' : 'anzeigen' }}
        </RBtn>
        <RExpandTransition v-bind="args">
          <RCard v-if="open" variant="elevated">
            <div style="padding:14px;font:13px sans-serif">
              <p style="margin:0 0 8px"><strong>Inhalt mit variabler Höhe</strong></p>
              <p style="margin:0;line-height:1.5">
                Der Wrapper misst beim Einblenden <code>scrollHeight</code>
                und animiert von 0 zu diesem Wert. Beim Ausblenden geschieht
                dies umgekehrt, sodass der Bereich unabhängig von seiner Höhe
                sanft einklappt.
              </p>
            </div>
          </RCard>
        </RExpandTransition>
      </div>
    `,
  }),
};

// ── v-show — display toggle ─────────────────────────────────────

export const VShow: Story = {
  name: "v-show (Anzeige umschalten)",
  render: () => ({
    components: { RExpandTransition, RBtn, RCard },
    setup: () => ({ open: ref(true) }),
    template: `
      <div style="padding:40px;display:flex;flex-direction:column;gap:12px;max-width:420px">
        <RBtn variant="translucent" @click="open = !open">
          Bereich {{ open ? 'ausblenden' : 'anzeigen' }}
        </RBtn>
        <RExpandTransition>
          <RCard v-show="open" variant="elevated">
            <div style="padding:14px;font:13px sans-serif">
              Das Element bleibt im DOM, nur <code>display</code> wechselt.
              Nutze v-show, wenn erneutes Einhängen teuer wäre, etwa bei
              einem iframe, Video oder aufwendigem Formularzustand.
            </div>
          </RCard>
        </RExpandTransition>
      </div>
    `,
  }),
};

// ── Conditional sibling sections ─────────────────────────────────

export const TwoPanels: Story = {
  name: "Moduswechsel (Anmeldestil)",
  render: () => ({
    components: { RExpandTransition, RBtn, RCard, RTextField },
    setup: () => ({ forgotMode: ref(false) }),
    template: `
      <div style="padding:40px;display:flex;flex-direction:column;gap:8px;max-width:380px">
        <RExpandTransition>
          <div v-show="!forgotMode" style="display:flex;flex-direction:column;gap:10px">
            <RTextField label="Benutzername" prefix-label="stacked" />
            <RTextField label="Passwort" type="password" prefix-label="stacked" />
            <RBtn variant="text" size="small" @click="forgotMode = true">
              Passwort vergessen?
            </RBtn>
          </div>
        </RExpandTransition>

        <RExpandTransition>
          <div v-show="forgotMode" style="display:flex;flex-direction:column;gap:10px">
            <RTextField label="E-Mail" prefix-label="stacked" />
            <RBtn variant="text" size="small" @click="forgotMode = false">
              ← Zurück zur Anmeldung
            </RBtn>
          </div>
        </RExpandTransition>
      </div>
    `,
  }),
};

// ── Initial mount animation ──────────────────────────────────────

export const Appear: Story = {
  name: "appear (beim Einhängen animieren)",
  args: { appear: true },
  render: (args) => ({
    components: { RExpandTransition, RCard },
    setup: () => ({ args }),
    template: `
      <div style="padding:40px;max-width:420px">
        <RExpandTransition v-bind="args">
          <RCard variant="elevated">
            <div style="padding:14px;font:13px sans-serif">
              Mit <code>appear</code> wird das Element bereits beim ersten
              Rendern animiert, nützlich für Landingpages oder Onboarding-Karten.
            </div>
          </RCard>
        </RExpandTransition>
      </div>
    `,
  }),
};

// ── Custom duration ──────────────────────────────────────────────

export const CustomDuration: Story = {
  name: "Benutzerdefinierte Dauer",
  args: { duration: "500ms" },
  render: (args) => ({
    components: { RExpandTransition, RBtn, RCard },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div style="padding:40px;display:flex;flex-direction:column;gap:12px;max-width:420px">
        <RBtn variant="translucent" @click="open = !open">Umschalten</RBtn>
        <RExpandTransition v-bind="args">
          <RCard v-if="open" variant="elevated">
            <div style="padding:14px;font:13px sans-serif">
              Langsame Erweiterung in 500 ms, übergib einen beliebigen CSS-Zeitwert
              an die Eigenschaft <code>duration</code>.
            </div>
          </RCard>
        </RExpandTransition>
      </div>
    `,
  }),
};
