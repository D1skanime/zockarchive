import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DetailedRom } from "@/stores/roms";

const mocks = vi.hoisted(() => ({
  refreshOwnedMedia: vi.fn(),
  refreshRom: vi.fn(),
  isAxiosError: vi.fn(),
}));

vi.mock("axios", () => ({ default: { isAxiosError: mocks.isAxiosError } }));
vi.mock("@/v2/data/adapters/legacy/services/api/rom", () => ({
  default: { refreshOwnedMedia: mocks.refreshOwnedMedia },
}));
vi.mock("@/v2/data/adapters/legacy/stores/roms", () => ({
  default: () => ({ refreshRom: mocks.refreshRom }),
}));

const apiRom = { id: 19, name: "API ROM" } as DetailedRom;
const canonicalRom = { id: 19, name: "Canonical ROM" } as DetailedRom;

describe("useOwnedMediaRefresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAxiosError.mockReturnValue(false);
  });

  it("returns the API ROM unchanged after a successful refresh", async () => {
    mocks.refreshOwnedMedia.mockResolvedValue({ data: apiRom });
    const { useOwnedMediaRefresh } = await import("./index");

    await expect(
      useOwnedMediaRefresh().settleOwnedMediaRefresh(19, "version-1"),
    ).resolves.toEqual({ status: "success", rom: apiRom });
    expect(mocks.refreshOwnedMedia).toHaveBeenCalledWith({
      romId: 19,
      expectedVersion: "version-1",
    });
    expect(mocks.refreshRom).not.toHaveBeenCalled();
  });

  it("recovers canonical state only for provider-media 409 conflicts", async () => {
    const error = {
      response: {
        status: 409,
        data: { detail: "Provider media publication failed" },
      },
    };
    mocks.refreshOwnedMedia.mockRejectedValue(error);
    mocks.isAxiosError.mockReturnValue(true);
    mocks.refreshRom.mockResolvedValue(canonicalRom);
    const { useOwnedMediaRefresh } = await import("./index");

    await expect(
      useOwnedMediaRefresh().settleOwnedMediaRefresh(19, "version-2"),
    ).resolves.toEqual({
      status: "provider-media-conflict",
      rom: canonicalRom,
      error,
    });
    expect(mocks.refreshRom).toHaveBeenCalledWith(19);
  });

  it("keeps unrelated errors untouched without reloading canonical state", async () => {
    const error = {
      response: { status: 409, data: { detail: "Version conflict" } },
    };
    mocks.refreshOwnedMedia.mockRejectedValue(error);
    mocks.isAxiosError.mockReturnValue(true);
    const { useOwnedMediaRefresh } = await import("./index");

    await expect(
      useOwnedMediaRefresh().settleOwnedMediaRefresh(19, "version-3"),
    ).resolves.toEqual({ status: "error", error });
    expect(mocks.refreshRom).not.toHaveBeenCalled();
  });

  it("preserves the provider error when canonical reload fails", async () => {
    const error = {
      response: {
        status: 409,
        data: { detail: "Provider media storage failed" },
      },
    };
    mocks.refreshOwnedMedia.mockRejectedValue(error);
    mocks.isAxiosError.mockReturnValue(true);
    mocks.refreshRom.mockRejectedValue(new Error("offline"));
    const { useOwnedMediaRefresh } = await import("./index");

    await expect(
      useOwnedMediaRefresh().settleOwnedMediaRefresh(19, "version-4"),
    ).resolves.toEqual({ status: "error", error });
  });
});
