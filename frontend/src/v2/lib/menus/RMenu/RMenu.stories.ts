import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import RMenuItem from "@/v2/lib/menus/RMenuItem/RMenuItem.vue";
import RAvatar from "@/v2/lib/primitives/RAvatar/RAvatar.vue";
import RBtn from "@/v2/lib/primitives/RBtn/RBtn.vue";
import RDivider from "@/v2/lib/primitives/RDivider/RDivider.vue";
import RIcon from "@/v2/lib/primitives/RIcon/RIcon.vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import RMenu from "./RMenu.vue";

const meta: Meta<typeof RMenu> = {
  title: "Menüs/Zusammengesetzt/RMenu",
  component: RMenu,
  parameters: compositionParameters("lib/menus/RMenu/RMenu.stories.ts"),
  argTypes: {
    location: {
      control: "inline-radio",
      options: [
        "top",
        "bottom",
        "start",
        "end",
        "top start",
        "top end",
        "bottom start",
        "bottom end",
      ],
    },
    offset: { control: "number" },
    width: { control: "text" },
    maxHeight: { control: "text" },
    closeOnContentClick: { control: "boolean" },
    openOnHover: { control: "boolean" },
    searchable: { control: "boolean" },
    searchPlaceholder: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof RMenu>;

// ── Defaults ──────────────────────────────────────────────────────

export const Basic: Story = {
  name: "Grundlegend",
  render: (args) => ({
    components: { RMenu, RMenuItem, RBtn },
    setup: () => ({ args }),
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <RMenu v-bind="args">
          <template #activator="{ props }">
            <RBtn v-bind="props" variant="translucent" append-icon="mdi-chevron-down">
              Menü öffnen
            </RBtn>
          </template>
          <RMenuItem icon="mdi-play" label="Spielen" />
          <RMenuItem icon="mdi-download-outline" label="Herunterladen" />
          <RMenuItem icon="mdi-pencil-outline" label="Bearbeiten" />
        </RMenu>
      </div>
    `,
  }),
};

// ── Account menu (real-world) ─────────────────────────────────────

export const AccountMenu: Story = {
  name: "Kontomenü (Praxisbeispiel)",
  render: () => ({
    components: { RMenu, RMenuItem, RBtn, RDivider, RAvatar },
    template: `
      <div style="padding:48px;display:flex;justify-content:flex-end">
        <RMenu location="bottom end" :offset="8" width="240px">
          <template #activator="{ props }">
            <RBtn v-bind="props" variant="translucent" append-icon="mdi-chevron-down">
              <RAvatar size="22" />
              <span style="margin-left:6px">Jane</span>
            </RBtn>
          </template>

          <div style="display:flex;gap:10px;align-items:center;padding:10px 10px 12px">
            <RAvatar size="30" />
            <div style="min-width:0">
              <div style="font:600 13px/1.3 sans-serif">Jane Doe</div>
              <div style="font:600 10.5px/1.3 sans-serif;color:var(--r-color-fg-muted);text-transform:capitalize">Administrator</div>
            </div>
          </div>

          <RDivider />

          <RMenuItem icon="mdi-account-outline" label="Profil" />
          <RMenuItem icon="mdi-palette-outline" label="Erscheinungsbild" />
          <RMenuItem icon="mdi-cog-outline" label="Einstellungen" />

          <RDivider />

          <RMenuItem icon="mdi-logout" variant="danger" label="Abmelden" />
        </RMenu>
      </div>
    `,
  }),
};

// ── Placements ────────────────────────────────────────────────────

export const Placements: Story = {
  name: "Positionen",
  render: () => ({
    components: { RMenu, RMenuItem, RBtn },
    template: `
      <div style="padding:80px;display:grid;grid-template-columns:repeat(4,auto);gap:24px;justify-content:center">
        <RMenu v-for="loc in ['top','bottom','start','end','top start','top end','bottom start','bottom end']" :key="loc" :location="loc">
          <template #activator="{ props }">
            <RBtn v-bind="props" size="small">{{ loc }}</RBtn>
          </template>
          <RMenuItem icon="mdi-arrow-up-right" label="Eins" />
          <RMenuItem icon="mdi-arrow-up-right" label="Zwei" />
          <RMenuItem icon="mdi-arrow-up-right" label="Drei" />
        </RMenu>
      </div>
    `,
  }),
};

// ── Searchable ────────────────────────────────────────────────────

const PLATFORMS = [
  { slug: "n64", name: "Nintendo 64" },
  { slug: "snes", name: "Super Nintendo" },
  { slug: "psx", name: "PlayStation 1" },
  { slug: "ps2", name: "PlayStation 2" },
  { slug: "gen", name: "Sega Genesis" },
  { slug: "gb", name: "Game Boy" },
  { slug: "gba", name: "Game Boy Advance" },
  { slug: "nds", name: "Nintendo DS" },
  { slug: "switch", name: "Nintendo Switch" },
];

export const Searchable: Story = {
  name: "Durchsuchbar + Filter",
  render: () => ({
    components: { RMenu, RMenuItem, RBtn },
    setup() {
      const query = ref("");
      const filtered = ref(PLATFORMS);
      function onSearch(q: string) {
        query.value = q;
        const lc = q.trim().toLowerCase();
        filtered.value = lc
          ? PLATFORMS.filter((p) => p.name.toLowerCase().includes(lc))
          : PLATFORMS;
      }
      return { query, filtered, onSearch };
    },
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <RMenu
          :search="query"
          searchable
          search-placeholder="Plattformen filtern"
          width="260px"
          max-height="320px"
          :close-on-content-click="false"
          @update:search="onSearch"
        >
          <template #activator="{ props }">
            <RBtn v-bind="props" variant="translucent" prepend-icon="mdi-gamepad-variant">
              Plattform auswählen
            </RBtn>
          </template>
          <RMenuItem
            v-for="p in filtered"
            :key="p.slug"
            icon="mdi-gamepad-variant"
            :label="p.name"
          />
          <div v-if="!filtered.length" style="padding:12px;font:12px sans-serif;color:var(--r-color-fg-muted);text-align:center">
            Keine Treffer.
          </div>
        </RMenu>
      </div>
    `,
  }),
};

// ── Scroll on overflow ────────────────────────────────────────────

export const ScrollableMaxHeight: Story = {
  name: "Scrollbar (maximale Höhe)",
  render: () => ({
    components: { RMenu, RMenuItem, RBtn },
    setup: () => ({
      items: Array.from({ length: 30 }, (_, i) => `Eintrag ${i + 1}`),
    }),
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <RMenu width="220px" max-height="240px">
          <template #activator="{ props }">
            <RBtn v-bind="props" variant="translucent">Lange Liste</RBtn>
          </template>
          <RMenuItem v-for="(label, i) in items" :key="i" :label="label" icon="mdi-circle-small" />
        </RMenu>
      </div>
    `,
  }),
};

// ── Sticky menu (close-on-content-click false) ────────────────────

export const StickyMenu: Story = {
  name: "Geöffnet bleiben (bei Inhaltklick nicht schließen)",
  render: () => ({
    components: { RMenu, RMenuItem, RBtn, RDivider },
    setup() {
      const toggles = ref({ sound: true, music: false, vibration: true });
      function flip(k: keyof typeof toggles.value) {
        toggles.value[k] = !toggles.value[k];
      }
      return { toggles, flip };
    },
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <RMenu width="220px" :close-on-content-click="false">
          <template #activator="{ props }">
            <RBtn v-bind="props" variant="translucent" prepend-icon="mdi-tune-variant">
              Optionen
            </RBtn>
          </template>
          <RMenuItem
            :icon="toggles.sound ? 'mdi-volume-high' : 'mdi-volume-off'"
            label="Ton"
            :variant="toggles.sound ? 'active' : 'default'"
            @click="flip('sound')"
          />
          <RMenuItem
            :icon="toggles.music ? 'mdi-music' : 'mdi-music-off'"
            label="Musik"
            :variant="toggles.music ? 'active' : 'default'"
            @click="flip('music')"
          />
          <RMenuItem
            :icon="toggles.vibration ? 'mdi-vibrate' : 'mdi-vibrate-off'"
            label="Vibration"
            :variant="toggles.vibration ? 'active' : 'default'"
            @click="flip('vibration')"
          />
          <RDivider />
          <RMenuItem icon="mdi-keyboard-close" label="Menü schließen" />
        </RMenu>
      </div>
    `,
  }),
};

// ── Open-on-hover ─────────────────────────────────────────────────

export const OpenOnHover: Story = {
  name: "Beim Überfahren öffnen",
  render: () => ({
    components: { RMenu, RMenuItem, RBtn },
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <RMenu open-on-hover>
          <template #activator="{ props }">
            <RBtn v-bind="props" variant="text">Datei</RBtn>
          </template>
          <RMenuItem icon="mdi-file-plus" label="Neu" />
          <RMenuItem icon="mdi-folder-open-outline" label="Öffnen…" />
          <RMenuItem icon="mdi-content-save-outline" label="Speichern" />
        </RMenu>
      </div>
    `,
  }),
};

// ── Disabled activator ────────────────────────────────────────────

export const Disabled: Story = {
  name: "Deaktiviert",
  args: { disabled: true },
  render: (args) => ({
    components: { RMenu, RMenuItem, RBtn },
    setup: () => ({ args }),
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <RMenu v-bind="args">
          <template #activator="{ props }">
            <RBtn v-bind="props" variant="translucent" disabled>Gesperrt</RBtn>
          </template>
          <RMenuItem icon="mdi-circle" label="Öffnet sich nie" />
        </RMenu>
      </div>
    `,
  }),
};

// ── Controlled open ───────────────────────────────────────────────

export const Controlled: Story = {
  name: "Gesteuert (v-model)",
  render: () => ({
    components: { RMenu, RMenuItem, RBtn, RIcon },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="padding:48px;display:flex;flex-direction:column;align-items:center;gap:12px">
        <RMenu v-model="open">
          <template #activator="{ props }">
            <RBtn v-bind="props" variant="translucent">Klickziel</RBtn>
          </template>
          <RMenuItem icon="mdi-information-outline" label="Hallo" />
        </RMenu>
        <RBtn size="small" variant="text" @click="open = !open">
          <RIcon :icon="open ? 'mdi-eye-off' : 'mdi-eye'" size="14" />
          <span style="margin-left:6px">{{ open ? 'Schließen erzwingen' : 'Öffnen erzwingen' }}</span>
        </RBtn>
      </div>
    `,
  }),
};
