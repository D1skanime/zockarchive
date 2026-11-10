import type { Meta, StoryObj } from "@storybook/vue3-vite";
import type { IGDBRelatedGame } from "@/__generated__";
import type { SimilarGameLibraryEntry } from "@/v2/composables/useSimilarGameLibraryResolution";
import type { DetailedRom } from "@/v2/data/adapters/legacy/stores/roms";
import { compositionParameters } from "@/v2/storybook/compositionInventory";
import OverviewTab from "./OverviewTab.vue";

const cover = (id: number) =>
  `https://placehold.co/316x440/2d2147/ffffff?text=Spiel+${id}`;

function game(id: number, name: string): IGDBRelatedGame {
  return {
    id,
    name,
    slug: `story-game-${id}`,
    type: "game",
    cover_url: cover(id),
  };
}

function local(
  id: number,
  name: string,
  romId = id + 1000,
): SimilarGameLibraryEntry {
  return { game: game(id, name), status: "local", romId };
}

function status(
  id: number,
  name: string,
  value: "pending" | "absent" | "error",
): SimilarGameLibraryEntry {
  return { game: game(id, name), status: value };
}

const storyRom: DetailedRom = {
  id: 42,
  igdb_id: null,
  sgdb_id: null,
  moby_id: null,
  ss_id: null,
  ra_id: null,
  launchbox_id: null,
  hasheous_id: null,
  tgdb_id: null,
  flashpoint_id: null,
  hltb_id: null,
  gamelist_id: null,
  libretro_id: null,
  steam_id: null,
  name: "Story-Spiel",
  platform_id: 1,
  platform_slug: "pc",
  platform_fs_slug: "pc",
  platform_custom_name: null,
  platform_display_name: "PC",
  fs_name: "story-game",
  fs_name_no_tags: "story-game",
  fs_name_no_ext: "story-game",
  fs_extension: ".zip",
  fs_path: "/roms/story-game.zip",
  fs_size_bytes: 0,
  name_sort_key: "story spiel",
  slug: "story-spiel",
  summary: null,
  alternative_names: [],
  youtube_video_id: null,
  url_cover: null,
  metadatum: {
    rom_id: 42,
    genres: [],
    franchises: [],
    collections: [],
    companies: [],
    main_developer: null,
    game_modes: [],
    age_ratings: [],
    player_count: "",
    first_release_date: null,
    pc_release_date: null,
    average_rating: null,
  },
  igdb_metadata: null,
  moby_metadata: null,
  ss_metadata: null,
  launchbox_metadata: null,
  hasheous_metadata: null,
  flashpoint_metadata: null,
  hltb_metadata: null,
  gamelist_metadata: null,
  manual_metadata: null,
  path_cover_small: null,
  path_cover_large: null,
  has_manual: false,
  has_soundtrack: false,
  path_manual: null,
  url_manual: null,
  path_video: null,
  is_unidentified: false,
  is_identified: true,
  revision: null,
  regions: [],
  languages: [],
  tags: [],
  crc_hash: null,
  md5_hash: null,
  sha1_hash: null,
  ra_hash: null,
  has_simple_single_file: true,
  has_nested_single_file: false,
  has_multiple_files: false,
  full_path: "/roms/story-game.zip",
  created_at: "2026-11-10T00:00:00Z",
  updated_at: "2026-11-10T00:00:00Z",
  missing_from_fs: false,
  has_notes: false,
  rom_user: {
    id: 42,
    user_id: 1,
    rom_id: 42,
    created_at: "2026-11-10T00:00:00Z",
    updated_at: "2026-11-10T00:00:00Z",
    last_played: null,
    is_main_sibling: true,
    backlogged: false,
    now_playing: false,
    hidden: false,
    rating: 0,
    difficulty: 0,
    completion: 0,
    status: null,
  },
  merged_screenshots: [],
  merged_ra_metadata: null,
  files: [],
  sibling_roms: [],
  steam_metadata: null,
  user_saves: [],
  user_states: [],
  all_user_saves: [],
  all_user_states: [],
  user_screenshots: [],
  all_user_screenshots: [],
  user_collections: [],
  all_user_notes: [],
};

const description = {
  text: null,
  source: "none",
  resolvedLocale: null,
  requestedLocale: "de",
  match: "empty",
};

const overviewProps = {
  rom: storyRom,
  parentRomId: 42,
  description,
  sections: [],
  playerCount: null,
  userCollections: [],
  hltb: null,
  lastPlayed: null,
  revision: null,
  screenshots: [],
  expansions: [],
  dlcs: [],
  localDlcCandidates: [],
  localExpansionCandidates: [],
  remakes: [],
  remasters: [],
};

const mixed: SimilarGameLibraryEntry[] = [
  local(101, "Lokaler Auftakt", 501),
  status(102, "Externe Empfehlung", "absent"),
  status(103, "Noch offene Empfehlung", "pending"),
  local(104, "Lokales Abenteuer", 504),
  status(105, "Weitere externe Empfehlung", "absent"),
  status(106, "Fehlerhafte Empfehlung", "error"),
];

const localOnly: SimilarGameLibraryEntry[] = [
  local(201, "Bibliothekstreffer Eins", 601),
  local(204, "Bibliothekstreffer Zwei", 604),
];

const promoted: SimilarGameLibraryEntry[] = [
  status(301, "Extern Eins", "absent"),
  status(302, "Extern Zwei", "absent"),
  status(303, "Extern Drei", "absent"),
  status(304, "Extern Vier", "absent"),
  status(305, "Extern Fünf", "absent"),
  status(306, "Extern Sechs", "absent"),
  status(307, "Extern Sieben", "absent"),
  local(308, "Lokaler Treffer nach Position sieben", 708),
];

function visibleLocalEntries(entries: SimilarGameLibraryEntry[]) {
  return entries.filter((entry) => entry.status === "local").slice(0, 6);
}

const meta: Meta<typeof OverviewTab> = {
  title: "Im Einsatz/Spieldetails/Ähnliche Spiele",
  component: OverviewTab,
  parameters: compositionParameters(
    "components/GameDetails/RelatedGamesGrid.stories.ts",
  ),
  decorators: [
    () => ({
      template:
        '<div style="width:min(1120px, calc(100vw - 32px))"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

function renderOverview(similarGames: SimilarGameLibraryEntry[]) {
  return () => ({
    components: { OverviewTab },
    setup: () => ({ props: { ...overviewProps, similarGames } }),
    template: '<OverviewTab v-bind="props" />',
  });
}

export const AnGemischteEmpfehlungen: Story = {
  name: "An: gemischte Empfehlungen",
  render: renderOverview(mixed),
};

export const AusNurBibliothekstreffer: Story = {
  name: "Aus: nur Bibliothekstreffer",
  render: renderOverview(localOnly),
};

export const AusTrefferNachPositionSieben: Story = {
  name: "Aus: Treffer nach Position sieben",
  render: renderOverview(visibleLocalEntries(promoted)),
};

export const AusAufloesungLaeuft: Story = {
  name: "Aus: Auflösung läuft",
  render: renderOverview(
    visibleLocalEntries([
      local(401, "Bereits bestätigter Treffer", 801),
      status(402, "Noch nicht aufgelöste Empfehlung", "pending"),
    ]),
  ),
};

export const AusKeineBibliothekstreffer: Story = {
  name: "Aus: keine Bibliothekstreffer",
  render: renderOverview([]),
};

export const AusLookupFehler: Story = {
  name: "Aus: Lookup-Fehler",
  render: renderOverview(
    visibleLocalEntries([
      local(501, "Bestätigter Treffer trotz Fehler", 901),
      status(502, "Fehlerhafte Abfrage", "error"),
    ]),
  ),
};
