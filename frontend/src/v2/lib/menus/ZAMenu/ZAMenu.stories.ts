import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import ZAMenuItem from "@/v2/lib/menus/ZAMenuItem/ZAMenuItem.vue";
import ZAAvatar from "@/v2/lib/primitives/ZAAvatar/ZAAvatar.vue";
import ZABtn from "@/v2/lib/primitives/ZABtn/ZABtn.vue";
import ZADivider from "@/v2/lib/primitives/ZADivider/ZADivider.vue";
import ZAIcon from "@/v2/lib/primitives/ZAIcon/ZAIcon.vue";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import ZAMenu from "./ZAMenu.vue";

const meta: Meta<typeof ZAMenu> = {
  title: "Menüs/Zusammengesetzt/ZAMenu",
  component: ZAMenu,
  parameters: compositionParameters("lib/menus/ZAMenu/ZAMenu.stories.ts"),
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
type Story = StoryObj<typeof ZAMenu>;

// ── Defaults ──────────────────────────────────────────────────────

export const Basic: Story = {
  name: "Grundlegend",
  render: (args) => ({
    components: { ZAMenu, ZAMenuItem, ZABtn },
    setup: () => ({ args }),
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <ZAMenu v-bind="args">
          <template #activator="{ props }">
            <ZABtn v-bind="props" variant="translucent" append-icon="mdi-chevron-down">
              Menü öffnen
            </ZABtn>
          </template>
          <ZAMenuItem icon="mdi-play" label="Spielen" />
          <ZAMenuItem icon="mdi-download-outline" label="Herunterladen" />
          <ZAMenuItem icon="mdi-pencil-outline" label="Bearbeiten" />
        </ZAMenu>
      </div>
    `,
  }),
};

// ── Account menu (real-world) ─────────────────────────────────────

export const AccountMenu: Story = {
  name: "Kontomenü (Praxisbeispiel)",
  render: () => ({
    components: { ZAMenu, ZAMenuItem, ZABtn, ZADivider, ZAAvatar },
    template: `
      <div style="padding:48px;display:flex;justify-content:flex-end">
        <ZAMenu location="bottom end" :offset="8" width="240px">
          <template #activator="{ props }">
            <ZABtn v-bind="props" variant="translucent" append-icon="mdi-chevron-down">
              <ZAAvatar size="22" />
              <span style="margin-left:6px">Jane</span>
            </ZABtn>
          </template>

          <div style="display:flex;gap:10px;align-items:center;padding:10px 10px 12px">
            <ZAAvatar size="30" />
            <div style="min-width:0">
              <div style="font:600 13px/1.3 sans-serif">Jane Doe</div>
              <div style="font:600 10.5px/1.3 sans-serif;color:var(--r-color-fg-muted);text-transform:capitalize">Administrator</div>
            </div>
          </div>

          <ZADivider />

          <ZAMenuItem icon="mdi-account-outline" label="Profil" />
          <ZAMenuItem icon="mdi-palette-outline" label="Erscheinungsbild" />
          <ZAMenuItem icon="mdi-cog-outline" label="Einstellungen" />

          <ZADivider />

          <ZAMenuItem icon="mdi-logout" variant="danger" label="Abmelden" />
        </ZAMenu>
      </div>
    `,
  }),
};

// ── Placements ────────────────────────────────────────────────────

export const Placements: Story = {
  name: "Positionen",
  render: () => ({
    components: { ZAMenu, ZAMenuItem, ZABtn },
    template: `
      <div style="padding:80px;display:grid;grid-template-columns:repeat(4,auto);gap:24px;justify-content:center">
        <ZAMenu v-for="loc in ['top','bottom','start','end','top start','top end','bottom start','bottom end']" :key="loc" :location="loc">
          <template #activator="{ props }">
            <ZABtn v-bind="props" size="small">{{ loc }}</ZABtn>
          </template>
          <ZAMenuItem icon="mdi-arrow-up-right" label="Eins" />
          <ZAMenuItem icon="mdi-arrow-up-right" label="Zwei" />
          <ZAMenuItem icon="mdi-arrow-up-right" label="Drei" />
        </ZAMenu>
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
    components: { ZAMenu, ZAMenuItem, ZABtn },
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
        <ZAMenu
          :search="query"
          searchable
          search-placeholder="Plattformen filtern"
          width="260px"
          max-height="320px"
          :close-on-content-click="false"
          @update:search="onSearch"
        >
          <template #activator="{ props }">
            <ZABtn v-bind="props" variant="translucent" prepend-icon="mdi-gamepad-variant">
              Plattform auswählen
            </ZABtn>
          </template>
          <ZAMenuItem
            v-for="p in filtered"
            :key="p.slug"
            icon="mdi-gamepad-variant"
            :label="p.name"
          />
          <div v-if="!filtered.length" style="padding:12px;font:12px sans-serif;color:var(--r-color-fg-muted);text-align:center">
            Keine Treffer.
          </div>
        </ZAMenu>
      </div>
    `,
  }),
};

// ── Scroll on overflow ────────────────────────────────────────────

export const ScrollableMaxHeight: Story = {
  name: "Scrollbar (maximale Höhe)",
  render: () => ({
    components: { ZAMenu, ZAMenuItem, ZABtn },
    setup: () => ({
      items: Array.from({ length: 30 }, (_, i) => `Eintrag ${i + 1}`),
    }),
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <ZAMenu width="220px" max-height="240px">
          <template #activator="{ props }">
            <ZABtn v-bind="props" variant="translucent">Lange Liste</ZABtn>
          </template>
          <ZAMenuItem v-for="(label, i) in items" :key="i" :label="label" icon="mdi-circle-small" />
        </ZAMenu>
      </div>
    `,
  }),
};

// ── Sticky menu (close-on-content-click false) ────────────────────

export const StickyMenu: Story = {
  name: "Geöffnet bleiben (bei Inhaltklick nicht schließen)",
  render: () => ({
    components: { ZAMenu, ZAMenuItem, ZABtn, ZADivider },
    setup() {
      const toggles = ref({ sound: true, music: false, vibration: true });
      function flip(k: keyof typeof toggles.value) {
        toggles.value[k] = !toggles.value[k];
      }
      return { toggles, flip };
    },
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <ZAMenu width="220px" :close-on-content-click="false">
          <template #activator="{ props }">
            <ZABtn v-bind="props" variant="translucent" prepend-icon="mdi-tune-variant">
              Optionen
            </ZABtn>
          </template>
          <ZAMenuItem
            :icon="toggles.sound ? 'mdi-volume-high' : 'mdi-volume-off'"
            label="Ton"
            :variant="toggles.sound ? 'active' : 'default'"
            @click="flip('sound')"
          />
          <ZAMenuItem
            :icon="toggles.music ? 'mdi-music' : 'mdi-music-off'"
            label="Musik"
            :variant="toggles.music ? 'active' : 'default'"
            @click="flip('music')"
          />
          <ZAMenuItem
            :icon="toggles.vibration ? 'mdi-vibrate' : 'mdi-vibrate-off'"
            label="Vibration"
            :variant="toggles.vibration ? 'active' : 'default'"
            @click="flip('vibration')"
          />
          <ZADivider />
          <ZAMenuItem icon="mdi-keyboard-close" label="Menü schließen" />
        </ZAMenu>
      </div>
    `,
  }),
};

// ── Open-on-hover ─────────────────────────────────────────────────

export const OpenOnHover: Story = {
  name: "Beim Überfahren öffnen",
  render: () => ({
    components: { ZAMenu, ZAMenuItem, ZABtn },
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <ZAMenu open-on-hover>
          <template #activator="{ props }">
            <ZABtn v-bind="props" variant="text">Datei</ZABtn>
          </template>
          <ZAMenuItem icon="mdi-file-plus" label="Neu" />
          <ZAMenuItem icon="mdi-folder-open-outline" label="Öffnen…" />
          <ZAMenuItem icon="mdi-content-save-outline" label="Speichern" />
        </ZAMenu>
      </div>
    `,
  }),
};

// ── Disabled activator ────────────────────────────────────────────

export const Disabled: Story = {
  name: "Deaktiviert",
  args: { disabled: true },
  render: (args) => ({
    components: { ZAMenu, ZAMenuItem, ZABtn },
    setup: () => ({ args }),
    template: `
      <div style="padding:48px;display:flex;justify-content:center">
        <ZAMenu v-bind="args">
          <template #activator="{ props }">
            <ZABtn v-bind="props" variant="translucent" disabled>Gesperrt</ZABtn>
          </template>
          <ZAMenuItem icon="mdi-circle" label="Öffnet sich nie" />
        </ZAMenu>
      </div>
    `,
  }),
};

// ── Controlled open ───────────────────────────────────────────────

export const Controlled: Story = {
  name: "Gesteuert (v-model)",
  render: () => ({
    components: { ZAMenu, ZAMenuItem, ZABtn, ZAIcon },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="padding:48px;display:flex;flex-direction:column;align-items:center;gap:12px">
        <ZAMenu v-model="open">
          <template #activator="{ props }">
            <ZABtn v-bind="props" variant="translucent">Klickziel</ZABtn>
          </template>
          <ZAMenuItem icon="mdi-information-outline" label="Hallo" />
        </ZAMenu>
        <ZABtn size="small" variant="text" @click="open = !open">
          <ZAIcon :icon="open ? 'mdi-eye-off' : 'mdi-eye'" size="14" />
          <span style="margin-left:6px">{{ open ? 'Schließen erzwingen' : 'Öffnen erzwingen' }}</span>
        </ZABtn>
      </div>
    `,
  }),
};
