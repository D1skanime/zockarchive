import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import RTextField from "@/v2/lib/forms/RTextField/RTextField.vue";
import RBtn from "@/v2/lib/primitives/RBtn/RBtn.vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import RDrawer from "./RDrawer.vue";

const meta: Meta<typeof RDrawer> = {
  title: "Overlays/Zusammengesetzt/RDrawer",
  component: RDrawer,
  parameters: compositionParameters("lib/overlays/RDrawer/RDrawer.stories.ts"),
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
type Story = StoryObj<typeof RDrawer>;

// ── Right-side default ────────────────────────────────────────

export const Default: Story = {
  name: "Standard",
  args: { side: "right", width: 380, icon: "mdi-filter-variant" },
  render: (args) => ({
    components: { RDrawer, RBtn },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div style="height:480px;padding:24px;display:flex;align-items:flex-start">
        <RBtn variant="flat" color="primary" @click="open = true">Schublade öffnen</RBtn>
        <RDrawer v-bind="args" v-model="open">
          <template #header>Filter</template>
          <p style="margin:0 0 12px 0;color:var(--r-color-fg-muted);font-size:13px">
            Schubladeninhalt. Wähle eine Seite, gib eine Breite an und platziere
            deine Steuerelemente im Standard-Slot.
          </p>
          <template #footer>
            <RBtn variant="text" color="danger" @click="open = false">Abbrechen</RBtn>
            <div style="flex:1"></div>
            <RBtn variant="flat" color="primary" @click="open = false">Anwenden</RBtn>
          </template>
        </RDrawer>
      </div>
    `,
  }),
};

// ── Left-side variant ─────────────────────────────────────────

export const LeftSide: Story = {
  name: "Linke Seite",
  args: { side: "left", width: 320, icon: "mdi-menu" },
  render: (args) => ({
    components: { RDrawer, RBtn },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div style="height:480px;padding:24px;display:flex;align-items:flex-start;justify-content:flex-end">
        <RBtn variant="flat" @click="open = true">Linke Schublade öffnen</RBtn>
        <RDrawer v-bind="args" v-model="open">
          <template #header>Navigation</template>
          <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px">
            <li>Startseite</li>
            <li>Bibliothek</li>
            <li>Statistiken</li>
            <li>Einstellungen</li>
          </ul>
        </RDrawer>
      </div>
    `,
  }),
};

// ── Tall content scrolls inside the body ──────────────────────

export const TallContent: Story = {
  name: "Hoher Inhalt (scrollbarer Bereich)",
  args: { side: "right", width: 380, icon: "mdi-format-list-bulleted" },
  render: (args) => ({
    components: { RDrawer, RBtn, RTextField },
    setup: () => ({
      args,
      open: ref(true),
      rows: Array.from({ length: 30 }, (_, i) => `Zeile ${i + 1}`),
    }),
    template: `
      <div style="height:480px;padding:24px">
        <RBtn variant="flat" color="primary" @click="open = true">Öffnen</RBtn>
        <RDrawer v-bind="args" v-model="open">
          <template #header>Lange Liste</template>
          <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px">
            <li v-for="r in rows" :key="r" style="padding:8px 10px;border-radius:6px;background:var(--r-color-surface)">
              {{ r }}
            </li>
          </ul>
          <template #footer>
            <div style="flex:1"></div>
            <RBtn variant="flat" color="primary" @click="open = false">Fertig</RBtn>
          </template>
        </RDrawer>
      </div>
    `,
  }),
};

// ── Persistent (no close on scrim / Escape) ──────────────────

export const Persistent: Story = {
  name: "Dauerhaft",
  args: { side: "right", width: 360, persistent: true, icon: "mdi-lock" },
  render: (args) => ({
    components: { RDrawer, RBtn },
    setup: () => ({ args, open: ref(false) }),
    template: `
      <div style="height:480px;padding:24px">
        <RBtn variant="flat" color="primary" @click="open = true">Dauerhafte Schublade öffnen</RBtn>
        <RDrawer v-bind="args" v-model="open">
          <template #header>Vor dem Verlassen bestätigen</template>
          <p style="margin:0;color:var(--r-color-fg-muted)">
            Klicks auf die Überlagerung und Escape sind gesperrt. Nur die
            Schließen-Schaltfläche oder Abbrechen / Fortfahren beendet die Schublade.
          </p>
          <template #footer>
            <RBtn variant="text" color="danger" @click="open = false">Abbrechen</RBtn>
            <div style="flex:1"></div>
            <RBtn variant="flat" color="primary" @click="open = false">Fortfahren</RBtn>
          </template>
        </RDrawer>
      </div>
    `,
  }),
};
