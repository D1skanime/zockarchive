import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ZATextField from "@/v2/lib/forms/ZATextField/ZATextField.vue";
import ZABtn from "@/v2/lib/primitives/ZABtn/ZABtn.vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import ZADrawer from "./ZADrawer.vue";

const meta: Meta<typeof ZADrawer> = {
  title: "Overlays/Zusammengesetzt/ZADrawer",
  component: ZADrawer,
  parameters: compositionParameters(
    "lib/overlays/ZADrawer/ZADrawer.stories.ts",
  ),
  argTypes: {
    side: { control: "inline-radio", options: ["left", "right"] },
    width: { control: "text" },
    persistent: { control: "boolean" },
    hideClose: { control: "boolean" },
    scrollContent: { control: "boolean" },
    icon: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ZADrawer>;

// ── Right-side default ────────────────────────────────────────

export const Default: Story = {
  name: "Standard",
  args: { side: "right", width: 380, icon: "mdi-filter-variant" },
  render: (args) => ({
    components: { ZADrawer, ZABtn },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div style="height:480px;padding:24px;display:flex;align-items:flex-start">
        <ZABtn variant="flat" color="primary" @click="open = true">Schublade öffnen</ZABtn>
        <ZADrawer v-bind="args" v-model="open">
          <template #header>Filter</template>
          <p style="margin:0 0 12px 0;color:var(--r-color-fg-muted);font-size:13px">
            Schubladeninhalt. Wähle eine Seite, gib eine Breite an und platziere
            deine Steuerelemente im Standard-Slot.
          </p>
          <template #footer>
            <ZABtn variant="text" color="danger" @click="open = false">Abbrechen</ZABtn>
            <div style="flex:1"></div>
            <ZABtn variant="flat" color="primary" @click="open = false">Anwenden</ZABtn>
          </template>
        </ZADrawer>
      </div>
    `,
  }),
};

// ── Left-side variant ─────────────────────────────────────────

export const LeftSide: Story = {
  name: "Linke Seite",
  args: { side: "left", width: 320, icon: "mdi-menu" },
  render: (args) => ({
    components: { ZADrawer, ZABtn },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div style="height:480px;padding:24px;display:flex;align-items:flex-start;justify-content:flex-end">
        <ZABtn variant="flat" @click="open = true">Linke Schublade öffnen</ZABtn>
        <ZADrawer v-bind="args" v-model="open">
          <template #header>Navigation</template>
          <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px">
            <li>Startseite</li>
            <li>Bibliothek</li>
            <li>Statistiken</li>
            <li>Einstellungen</li>
          </ul>
        </ZADrawer>
      </div>
    `,
  }),
};

// ── Tall content scrolls inside the body ──────────────────────

export const TallContent: Story = {
  name: "Hoher Inhalt (scrollbarer Bereich)",
  args: { side: "right", width: 380, icon: "mdi-format-list-bulleted" },
  render: (args) => ({
    components: { ZADrawer, ZABtn, ZATextField },
    setup: () => ({
      args,
      open: ref(true),
      rows: Array.from({ length: 30 }, (_, i) => `Zeile ${i + 1}`),
    }),
    template: `
      <div style="height:480px;padding:24px">
        <ZABtn variant="flat" color="primary" @click="open = true">Öffnen</ZABtn>
        <ZADrawer v-bind="args" v-model="open">
          <template #header>Lange Liste</template>
          <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px">
            <li v-for="r in rows" :key="r" style="padding:8px 10px;border-radius:6px;background:var(--r-color-surface)">
              {{ r }}
            </li>
          </ul>
          <template #footer>
            <div style="flex:1"></div>
            <ZABtn variant="flat" color="primary" @click="open = false">Fertig</ZABtn>
          </template>
        </ZADrawer>
      </div>
    `,
  }),
};

// ── Persistent (no close on scrim / Escape) ──────────────────

export const Persistent: Story = {
  name: "Dauerhaft",
  args: { side: "right", width: 360, persistent: true, icon: "mdi-lock" },
  render: (args) => ({
    components: { ZADrawer, ZABtn },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div style="height:480px;padding:24px">
        <ZABtn variant="flat" color="primary" @click="open = true">Dauerhafte Schublade öffnen</ZABtn>
        <ZADrawer v-bind="args" v-model="open">
          <template #header>Vor dem Verlassen bestätigen</template>
          <p style="margin:0;color:var(--r-color-fg-muted)">
            Klicks auf die Überlagerung und Escape sind gesperrt. Nur die
            Schließen-Schaltfläche oder Abbrechen / Fortfahren beendet die Schublade.
          </p>
          <template #footer>
            <ZABtn variant="text" color="danger" @click="open = false">Abbrechen</ZABtn>
            <div style="flex:1"></div>
            <ZABtn variant="flat" color="primary" @click="open = false">Fortfahren</ZABtn>
          </template>
        </ZADrawer>
      </div>
    `,
  }),
};
