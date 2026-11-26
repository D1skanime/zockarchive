import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UpdateRom } from "@/v2/data/adapters/legacy/services/api/rom";
import type { DetailedRom } from "@/v2/data/adapters/legacy/stores/roms";
import { useEditRomUpdate } from "./index";

const mocks = vi.hoisted(() => ({
  route: { name: "rom" as string | undefined },
  updateRom: vi.fn(),
  storeUpdate: vi.fn(),
  snackbarSuccess: vi.fn(),
  snackbarError: vi.fn(),
  recoverProviderMediaConflict: vi.fn(),
  translate: vi.fn((key: string, values?: { detail?: string }) =>
    values?.detail ? `${key}: ${values.detail}` : key,
  ),
}));

const romStore = {
  currentRom: undefined as DetailedRom | undefined,
  update: mocks.storeUpdate,
};

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: mocks.translate }),
}));
vi.mock("vue-router", () => ({ useRoute: () => mocks.route }));
vi.mock("@/v2/composables/useSnackbar", () => ({
  useSnackbar: () => ({
    success: mocks.snackbarSuccess,
    error: mocks.snackbarError,
  }),
}));
vi.mock("@/v2/composables/useOwnedMediaRefresh", () => ({
  useOwnedMediaRefresh: () => ({
    recoverProviderMediaConflict: mocks.recoverProviderMediaConflict,
  }),
}));
vi.mock("@/v2/data/adapters/legacy/services/api/rom", () => ({
  default: { updateRom: mocks.updateRom },
}));
vi.mock("@/v2/data/adapters/legacy/stores/roms", () => ({
  default: () => romStore,
}));

const savedRom = { id: 19, name: "Saved ROM" } as DetailedRom;
const recoveredRom = { id: 19, name: "Canonical ROM" } as DetailedRom;

function createUpdateRom(overrides: Partial<UpdateRom> = {}): UpdateRom {
  return {
    id: 19,
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
    platform_slug: "ps3",
    platform_fs_slug: "ps3",
    platform_custom_name: null,
    platform_display_name: "PlayStation 3",
    fs_name: "saved-rom.iso",
    fs_name_no_tags: "saved-rom",
    fs_name_no_ext: "saved-rom",
    fs_extension: "iso",
    fs_path: "/roms/ps3",
    fs_size_bytes: 1024,
    name: "Saved ROM",
    name_sort_key: "saved rom",
    slug: "saved-rom",
    summary: null,
    alternative_names: [],
    youtube_video_id: null,
    metadatum: {
      rom_id: 19,
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
    full_path: "/roms/ps3/saved-rom.iso",
    created_at: "2026-11-26T00:00:00Z",
    updated_at: "2026-11-26T00:00:00Z",
    missing_from_fs: false,
    has_notes: false,
    rom_user: {
      id: 1,
      user_id: 1,
      rom_id: 19,
      created_at: "2026-11-26T00:00:00Z",
      updated_at: "2026-11-26T00:00:00Z",
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
    ...overrides,
  };
}

describe("useEditRomUpdate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.route.name = "rom";
    romStore.currentRom = undefined;
    mocks.recoverProviderMediaConflict.mockResolvedValue({
      status: "not-provider-media-conflict",
    });
  });

  it("persists a successful update and synchronizes the detail ROM", async () => {
    mocks.updateRom.mockResolvedValue({ data: savedRom });
    const onRomUpdated = vi.fn();
    const onSettled = vi.fn();
    const update = useEditRomUpdate({
      getActiveRomId: () => 19,
      onRomUpdated,
      onSettled,
    });
    const options = { rom: createUpdateRom({ name: "Saved ROM" }) };

    const submission = update.submitUpdate(options, "rom-updated-successfully");

    expect(update.saving.value).toBe(true);
    await submission;

    expect(mocks.updateRom).toHaveBeenCalledWith(options);
    expect(onRomUpdated).toHaveBeenCalledWith(savedRom);
    expect(mocks.storeUpdate).toHaveBeenCalledWith(savedRom);
    expect(romStore.currentRom).toBe(savedRom);
    expect(mocks.snackbarSuccess).toHaveBeenCalledWith(
      "rom-updated-successfully",
      { icon: "mdi-check-bold" },
    );
    expect(mocks.snackbarError).not.toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(update.saving.value).toBe(false);
  });

  it("recovers a durable update after a provider-media conflict", async () => {
    const mediaConflict = {
      response: { data: { detail: "Provider media publication failed" } },
    };
    mocks.updateRom.mockRejectedValue(mediaConflict);
    mocks.recoverProviderMediaConflict.mockResolvedValue({
      status: "recovered",
      rom: recoveredRom,
    });
    const onRomUpdated = vi.fn();
    const onSettled = vi.fn();
    const update = useEditRomUpdate({
      getActiveRomId: () => 19,
      onRomUpdated,
      onSettled,
    });

    await update.submitUpdate(
      { rom: createUpdateRom({ igdb_id: 7376 }) },
      "unused-success",
    );

    expect(mocks.recoverProviderMediaConflict).toHaveBeenCalledWith(
      19,
      mediaConflict,
    );
    expect(onRomUpdated).toHaveBeenCalledWith(recoveredRom);
    expect(mocks.storeUpdate).toHaveBeenCalledWith(recoveredRom);
    expect(romStore.currentRom).toBe(recoveredRom);
    expect(mocks.snackbarError).toHaveBeenCalledWith(
      "rom.match-media-publication-failed: Provider media publication failed",
      { icon: "mdi-close-circle" },
    );
    expect(mocks.snackbarSuccess).not.toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(update.saving.value).toBe(false);
  });

  it("reports a generic update error without claiming canonical recovery", async () => {
    const updateFailure = { response: { data: { detail: "Update rejected" } } };
    mocks.updateRom.mockRejectedValue(updateFailure);
    const onRomUpdated = vi.fn();
    const onSettled = vi.fn();
    const update = useEditRomUpdate({
      getActiveRomId: () => 19,
      onRomUpdated,
      onSettled,
    });

    await update.submitUpdate(
      { rom: createUpdateRom({ name: "Rejected ROM" }) },
      "unused-success",
    );

    expect(mocks.recoverProviderMediaConflict).toHaveBeenCalledWith(
      19,
      updateFailure,
    );
    expect(onRomUpdated).not.toHaveBeenCalled();
    expect(mocks.storeUpdate).not.toHaveBeenCalled();
    expect(romStore.currentRom).toBeUndefined();
    expect(mocks.snackbarError).toHaveBeenCalledWith("Update rejected", {
      icon: "mdi-close-circle",
    });
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(update.saving.value).toBe(false);
  });
});
