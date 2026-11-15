import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Platform } from "@/v2/data/adapters/legacy/stores/platforms";
import { getDirectFolderMappingReadiness } from "./directFolderMappingReadiness";

const mocks = vi.hoisted(() => ({
  getFolderAssignments: vi.fn(),
  getMappingsReadiness: vi.fn(),
}));

vi.mock("@/v2/data/adapters/legacy/services/api/setup", () => ({
  default: { getFolderAssignments: mocks.getFolderAssignments },
}));
vi.mock("@/v2/data/adapters/legacy/services/api/storage", () => ({
  default: { getMappingsReadiness: mocks.getMappingsReadiness },
}));

function platform(id: number, slug: string): Platform {
  return {
    id,
    slug,
    fs_slug: slug,
    name: slug,
    display_name: slug,
    rom_count: 0,
    igdb_slug: null,
    moby_slug: null,
    hltb_slug: null,
    libretro_slug: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    fs_size_bytes: 0,
    is_unidentified: false,
    is_identified: true,
    missing_from_fs: false,
    firmware_count: 0,
  };
}

describe("direct folder mapping readiness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses only active persisted direct platform assignments", async () => {
    const readiness = { ready: true, mappings: [] };
    mocks.getFolderAssignments.mockResolvedValue({
      data: {
        folders: [
          { disposition: "platform", mapping_id: 4, platform_slug: "win" },
          { disposition: "excluded", mapping_id: null, platform_slug: null },
          { disposition: "platform", mapping_id: null, platform_slug: "ps2" },
        ],
      },
    });
    mocks.getMappingsReadiness.mockResolvedValue(readiness);

    await expect(
      getDirectFolderMappingReadiness([
        platform(1, "win"),
        platform(2, "wii"),
        platform(3, "ps2"),
      ]),
    ).resolves.toBe(readiness);
    expect(mocks.getMappingsReadiness).toHaveBeenCalledWith([1]);
  });

  it("preserves setup and readiness errors for the scan caller", async () => {
    const failure = new Error("assignments unavailable");
    mocks.getFolderAssignments.mockRejectedValue(failure);

    await expect(
      getDirectFolderMappingReadiness([platform(1, "win")]),
    ).rejects.toBe(failure);
    expect(mocks.getMappingsReadiness).not.toHaveBeenCalled();
  });
});
