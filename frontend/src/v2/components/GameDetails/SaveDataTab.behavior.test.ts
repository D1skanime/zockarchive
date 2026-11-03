import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactive } from "vue";
import type { DetailedRomSchema, UserSaveSchema } from "@/__generated__";
import SaveDataTab from "./SaveDataTab.vue";

const state = vi.hoisted(() => ({
  auth: { user: { id: 1 } },
  roms: { currentRom: null, update: vi.fn() },
}));
const replace = vi.fn();
const route = reactive({
  path: "/rom/1",
  query: { tab: "save-data", subtab: "saves" } as Record<string, string>,
});

vi.mock("pinia", () => ({
  storeToRefs: (store: typeof state.auth) => ({ user: { value: store.user } }),
}));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("vue-router", () => ({
  useRoute: () => route,
  useRouter: () => ({ replace }),
}));
vi.mock("@v2/lib", () => ({
  ZABtn: { template: "<button><slot /></button>" },
  ZAIcon: { template: "<span />" },
  ZADropzone: {
    name: "ZADropzone",
    props: ["inputLabel"],
    template:
      '<div data-dropzone :data-input-label="inputLabel"><slot /></div>',
  },
}));
vi.mock("@/v2/data/adapters/legacy/stores/auth", () => ({
  default: () => state.auth,
}));
vi.mock("@/v2/data/adapters/legacy/stores/roms", () => ({
  default: () => state.roms,
}));
vi.mock("@/v2/data/adapters/legacy/services/api/rom", () => ({
  default: { getRom: vi.fn() },
}));
vi.mock("@/v2/data/adapters/legacy/services/api/save", () => ({
  default: {
    uploadSaves: vi.fn(),
    deleteSaves: vi.fn(),
    setSaveVisibility: vi.fn(),
  },
}));
vi.mock("@/v2/data/adapters/legacy/services/api/state", () => ({
  default: {
    uploadStates: vi.fn(),
    deleteStates: vi.fn(),
    setStateVisibility: vi.fn(),
  },
}));
vi.mock("@/v2/composables/useConfirm", () => ({
  useConfirm: () => vi.fn(),
}));
vi.mock("@/v2/composables/useSnackbar", () => ({
  useSnackbar: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() }),
}));
vi.mock("@/v2/components/GameDetails/PcSaveBackupsSection.vue", () => ({
  default: {
    template:
      "<section data-pc-backups><h3>rom.save-backup-list-title</h3><article>Backup</article></section>",
  },
}));
vi.mock("@/v2/components/shared/AssetList.vue", () => ({
  default: {
    props: ["assets"],
    template: "<div data-asset-list>{{ assets.length }}</div>",
  },
}));
vi.mock("@/v2/components/shared/AssetStrip.vue", () => ({
  default: {
    props: ["assets"],
    template: "<div data-asset-strip>{{ assets.length }}</div>",
  },
}));

function save(fileName: string): UserSaveSchema {
  return {
    id: 4,
    user_id: 1,
    file_name: fileName,
    file_name_no_tags: fileName,
    file_name_no_ext: "slot",
    file_extension: ".sav",
    file_path: fileName,
    file_size_bytes: 4,
    full_path: `/saves/${fileName}`,
    download_path: `/download/${fileName}`,
    missing_from_fs: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    rom_id: 1,
    emulator: null,
    screenshot: null,
    username: "test-user",
  };
}

function rom(platformFsSlug: string, platformSlug: string): DetailedRomSchema {
  return {
    id: 1,
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
    platform_id: 1,
    platform_fs_slug: platformFsSlug,
    platform_slug: platformSlug,
    platform_custom_name: null,
    platform_display_name: platformSlug,
    fs_name: "game",
    fs_name_no_tags: "game",
    fs_name_no_ext: "game",
    fs_extension: ".zip",
    fs_path: "/games/game.zip",
    fs_size_bytes: 1,
    name: "Game",
    name_sort_key: "Game",
    slug: "game",
    summary: null,
    alternative_names: [],
    youtube_video_id: null,
    metadatum: {
      rom_id: 1,
      genres: [],
      franchises: [],
      collections: [],
      companies: [],
      main_developer: null,
      game_modes: [],
      age_ratings: [],
      player_count: "1",
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
    url_cover: null,
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
    full_path: "/games/game.zip",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    missing_from_fs: false,
    has_notes: false,
    rom_user: {
      id: 1,
      user_id: 1,
      rom_id: 1,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
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
}

function render(selectedRom: DetailedRomSchema) {
  return mount(SaveDataTab, { props: { rom: selectedRom } });
}

beforeEach(() => {
  replace.mockReset();
  route.query = { tab: "save-data", subtab: "saves" };
});

describe("SaveDataTab platform-specific navigation", () => {
  it("hides emulator states for PC games and redirects stale state selections", async () => {
    route.query = { tab: "save-data", subtab: "states" };
    const wrapper = render(rom("pc", "win"));
    await flushPromises();

    expect(wrapper.findAll('[role="tab"]')).toHaveLength(1);
    expect(wrapper.text()).not.toContain("rom.states-tab");
    expect(
      wrapper.find('[data-input-label="rom.upload-states"]').exists(),
    ).toBe(false);
    expect(wrapper.find(".r-v2-saves__section-title").exists()).toBe(false);
    expect(replace).toHaveBeenCalledWith({
      path: "/rom/1",
      query: { tab: "save-data", subtab: "saves" },
    });
    wrapper.unmount();
  });

  it("keeps states and classic save files available for non-PC games", async () => {
    const consoleRom = rom("console", "snes");
    consoleRom.all_user_saves = [save("slot.sav")];
    const wrapper = render(consoleRom);

    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2);
    expect(wrapper.get("[data-asset-list]").text()).toBe("1");
    await wrapper.findAll('[role="tab"]')[1].trigger("click");
    expect(
      wrapper.find('[data-input-label="rom.upload-states"]').exists(),
    ).toBe(true);
    wrapper.unmount();
  });

  it("keeps existing PC save files visible without restoring state uploads", () => {
    const pcRom = rom("pc", "win");
    pcRom.all_user_saves = [save("slot.sav")];
    const wrapper = render(pcRom);

    expect(wrapper.findAll('[role="tab"]')).toHaveLength(1);
    expect(wrapper.get("[data-asset-list]").text()).toBe("1");
    expect(
      wrapper.find('[data-input-label="rom.upload-states"]').exists(),
    ).toBe(false);
    wrapper.unmount();
  });
});
