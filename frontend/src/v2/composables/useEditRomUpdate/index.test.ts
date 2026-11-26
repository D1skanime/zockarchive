import { beforeEach, describe, expect, it, vi } from "vitest";
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
    const options = { rom: { name: "Saved ROM" } };

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

    await update.submitUpdate({ rom: { igdb_id: 7376 } }, "unused-success");

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
      { rom: { name: "Rejected ROM" } },
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
