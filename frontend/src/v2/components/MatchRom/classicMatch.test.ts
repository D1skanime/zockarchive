import { describe, expect, it } from "vitest";
import type { SimpleRom } from "@/v2/data/adapters/legacy/stores/roms";
import {
  createClassicMatchPayload,
  isUnchangedClassicMatchPayload,
} from "./classicMatch";
import type { MatchSearchRom } from "./types";

function target(overrides: Partial<SimpleRom> = {}): SimpleRom {
  return {
    id: 19,
    igdb_id: 1,
    steam_id: 2,
    sgdb_id: 3,
    ss_id: 4,
    moby_id: 5,
    flashpoint_id: "flashpoint",
    launchbox_id: 6,
    libretro_id: "libretro",
    ra_id: 7,
    hasheous_id: 8,
    tgdb_id: 9,
    hltb_id: 10,
    name: "Target",
    name_sort_key: "target",
    slug: "target",
    summary: "Retained summary",
    url_cover: "https://existing.example/cover.jpg",
    manual_metadata: { name: "Manual title" },
    ...overrides,
  } as SimpleRom;
}

function matched(overrides: Partial<MatchSearchRom> = {}): MatchSearchRom {
  return {
    name: "Matched title",
    platform_id: 1,
    is_unidentified: false,
    is_identified: true,
    igdb_id: 42,
    steam_id: 570,
    ss_id: 73,
    moby_id: 99,
    flashpoint_id: "matched-flashpoint",
    launchbox_id: 101,
    libretro_id: "matched-libretro",
    slug: "matched-title",
    ...overrides,
  };
}

describe("createClassicMatchPayload", () => {
  it("normalizes provider IDs, clears manual metadata, and prefers selected cover", () => {
    const result = createClassicMatchPayload(
      target(),
      matched({ igdb_id: 0, steam_id: 570 }),
      {
        name: "Steam",
        logo_path: "/steam.svg",
        url_cover: "https://images.example/t_cover_big/selected.jpg",
      },
    );

    expect(result).toMatchObject({
      igdb_id: null,
      steam_id: 570,
      ss_id: 73,
      moby_id: 99,
      flashpoint_id: "matched-flashpoint",
      launchbox_id: 101,
      libretro_id: "matched-libretro",
      name: "Matched title",
      slug: "matched-title",
      summary: "Retained summary",
      manual_metadata: null,
      url_cover: "https://images.example/t_1080p/selected.jpg",
      name_sort_key: "target",
      ra_id: 7,
    });
  });

  it("uses provider covers in fallback order and upgrades IGDB cover size", () => {
    const result = createClassicMatchPayload(
      target(),
      matched({
        igdb_url_cover: undefined,
        steam_url_cover: "https://images.example/t_cover_big/steam.jpg",
        ss_url_cover: "https://images.example/ss.jpg",
      }),
      undefined,
    );

    expect(result.url_cover).toBe("https://images.example/t_1080p/steam.jpg");
  });
});

describe("isUnchangedClassicMatchPayload", () => {
  it("recognizes an identical complete payload", () => {
    const payload = target();

    expect(isUnchangedClassicMatchPayload(payload, { ...payload })).toBe(true);
  });

  it.each([
    ["provider ID", { igdb_id: 999 }],
    ["display metadata", { name: "Changed title" }],
    ["cover URL", { url_cover: "https://changed.example/cover.jpg" }],
    ["manual metadata", { manual_metadata: null }],
  ])("detects a changed %s", (_category, change) => {
    const payload = target();

    expect(
      isUnchangedClassicMatchPayload(payload, { ...payload, ...change }),
    ).toBe(false);
  });
});
