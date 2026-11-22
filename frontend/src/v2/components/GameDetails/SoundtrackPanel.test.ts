import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const panelSource = readFileSync(
  "src/v2/components/GameDetails/SoundtrackPanel.vue",
  "utf8",
);
const localPlaylistSource = readFileSync(
  "src/v2/components/GameDetails/useLocalSoundtrackPlaylist.ts",
  "utf8",
);

describe("SoundtrackPanel owned-media queue", () => {
  it("uses only owned soundtrack candidates and their ordered placements", () => {
    expect(panelSource).toContain('item.role === "soundtrack"');
    expect(panelSource).toContain("soundtrackPlacement(item)");
    expect(panelSource).toContain("loadPlaylistForRom");
    expect(panelSource).toContain("mediaId: item.id");
    expect(panelSource).not.toContain("getSoundtrackMetadata");
    expect(panelSource).not.toMatch(/\/soundtracks(?:\/|`|'|")/);
  });

  it("uploads and atomically reorders only through typed owned-media methods", () => {
    expect(panelSource).toContain("uploadOwnedMedia");
    expect(panelSource).toContain("replaceOwnedMediaPlacements");
    expect(panelSource).toContain('role: "soundtrack"');
    expect(panelSource).toContain("mediaIds: reordered");
    expect(panelSource).toContain("await refreshCanonical()");
  });

  it("offers local and owned soundtrack files as background-music candidates", () => {
    expect(localPlaylistSource).toContain('file.category === "soundtrack"');
    expect(localPlaylistSource).toContain(
      "isSupportedSoundtrackFile(file.file_name)",
    );
    expect(localPlaylistSource).toContain("local_background_audio_file_ids");
    expect(localPlaylistSource).toContain("replaceLocalBackgroundAudio");
    expect(panelSource).toContain("useLocalSoundtrackPlaylist");
    expect(panelSource).toContain("MediaUploadControl");
    expect(panelSource).toContain("soundtrackAccept");
    expect(panelSource).toContain("toggleLocalBackgroundAudio");
    expect(panelSource).toContain("owned_background_audio_media_ids");
    expect(panelSource).toContain("replaceOwnedBackgroundAudio");
    expect(panelSource).toContain("toggleOwnedBackgroundAudio");
  });

  it("stops active tracks before confirmed owned deletion and retains decode retry", () => {
    expect(panelSource).toContain(
      "if (activeOwnedTrackId.value === item.id) player.stop()",
    );
    expect(panelSource).toContain(
      'const canManage = useCan("rom.edit", scope)',
    );
    expect(panelSource).not.toContain('useCan("rom.delete", scope)');
    expect(panelSource).toContain('tone: "danger"');
    expect(panelSource).toContain("deleteOwnedMedia");
    expect(panelSource).toContain("player.hasError");
    expect(panelSource).toContain("retryActiveTrack");
  });

  it("keeps owned-track deletion in both soundtrack list sections", () => {
    const includedSection = panelSource.slice(
      panelSource.indexOf('aria-labelledby="included-soundtrack-heading"'),
      panelSource.indexOf('aria-labelledby="available-uploads-heading"'),
    );
    const availableSection = panelSource.slice(
      panelSource.indexOf('aria-labelledby="available-uploads-heading"'),
    );

    for (const section of [includedSection, availableSection]) {
      expect(section).toContain('v-if="canManage"');
      expect(section).toContain('icon="mdi-delete-outline"');
      expect(section).toContain('@click="deleteTrack(item)"');
    }
  });

  it("has permission-gated, labelled linear controls", () => {
    expect(panelSource).toContain("useCan");
    expect(panelSource).toContain("canManage");
    expect(panelSource).toContain("aria-label");
    expect(panelSource).toContain("t('rom.move-up')");
    expect(panelSource).toContain("t('rom.move-down')");
  });
});
