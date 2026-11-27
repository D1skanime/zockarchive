import axios from "axios";
import type { DetailedRom } from "@/stores/roms";
import romApi from "@/v2/data/adapters/legacy/services/api/rom";
import storeRoms from "@/v2/data/adapters/legacy/stores/roms";

type OwnedMediaRefreshSuccess = {
  status: "success";
  rom: DetailedRom;
};

type OwnedMediaRefreshFailure = {
  status: "error";
  error: unknown;
};

export type OwnedMediaRefreshSettlement =
  OwnedMediaRefreshSuccess | OwnedMediaRefreshFailure;

export type SettledOwnedMediaRefresh =
  | OwnedMediaRefreshSuccess
  | { status: "provider-media-conflict"; rom: DetailedRom; error: unknown }
  | OwnedMediaRefreshFailure;

export type ProviderMediaConflictRecovery =
  | { status: "not-provider-media-conflict" }
  | { status: "recovered"; rom: DetailedRom }
  | { status: "recovery-failed"; error: unknown };

function isProviderMediaConflict(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 409)
    return false;
  const detail = error.response.data?.detail;
  return typeof detail === "string" && detail.startsWith("Provider media ");
}

/** Settle one explicit owned-media refresh and optionally recover its canonical ROM. */
export function useOwnedMediaRefresh() {
  const romsStore = storeRoms();

  async function refreshOwnedMedia(
    romId: number,
    expectedVersion: string,
  ): Promise<OwnedMediaRefreshSettlement> {
    try {
      const { data } = await romApi.refreshOwnedMedia({
        romId,
        expectedVersion,
      });
      return { status: "success", rom: data };
    } catch (error: unknown) {
      return { status: "error", error };
    }
  }

  async function recoverProviderMediaConflict(
    romId: number,
    error: unknown,
  ): Promise<ProviderMediaConflictRecovery> {
    if (!isProviderMediaConflict(error)) {
      return { status: "not-provider-media-conflict" };
    }
    try {
      return { status: "recovered", rom: await romsStore.refreshRom(romId) };
    } catch (refreshError: unknown) {
      return { status: "recovery-failed", error: refreshError };
    }
  }

  /** Reload canonical state with the original conflict when publication persisted partially. */
  async function settleOwnedMediaRefresh(
    romId: number,
    expectedVersion: string,
  ): Promise<SettledOwnedMediaRefresh> {
    const refresh = await refreshOwnedMedia(romId, expectedVersion);
    if (refresh.status === "success") return refresh;

    const recovery = await recoverProviderMediaConflict(romId, refresh.error);
    if (recovery.status === "recovered") {
      return {
        status: "provider-media-conflict",
        rom: recovery.rom,
        error: refresh.error,
      };
    }
    return refresh;
  }

  return {
    refreshOwnedMedia,
    recoverProviderMediaConflict,
    settleOwnedMediaRefresh,
  };
}
