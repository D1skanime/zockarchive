import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  "src/v2/components/GameDetails/ArtworkSubtab.vue",
  "utf8",
);

const locale = (name: string) =>
  JSON.parse(
    readFileSync("src/locales/" + name + "/rom.json", "utf8"),
  ) as Record<string, string>;

describe("ArtworkSubtab owned artwork management", () => {
  it("keeps artwork candidates distinct from ordered background placements", () => {
    expect(source).toContain("ownedArtwork");
    expect(source).toContain("backgrounds");
    expect(source).toContain("hasPlacement");
    expect(source).toContain("togglePlacement");
    expect(source).toContain("replaceOwnedMediaPlacements");
    expect(source).toContain('t("rom.backgrounds")');
    expect(source).toContain("t('rom.add-as-background')");
    expect(source).toContain("t('rom.remove-as-background')");
    expect(source).toContain("t('rom.add-to-overview')");
    expect(source).toContain("t('rom.remove-from-overview')");
    expect(source).toContain("togglePlacement(item, 'overview')");
  });

  it("uses the owned-media upload and deletion lifecycle", () => {
    expect(source).toContain("ZADropzone");
    expect(source).toContain('const canManage = useCan("rom.edit", scope)');
    expect(source).not.toContain('useCan("rom.delete", scope)');
    expect(source).toContain("uploadOwnedMedia");
    expect(source).toContain('role: "artwork"');
    expect(source).toContain("item.origin === 'upload'");
    expect(source).toContain('tone="danger"');
    expect(source).toContain("deleteOwnedMedia");
    expect(source).toContain("romsStore.refreshRom");
  });

  it("restores authoritative state before reporting an ordering conflict", () => {
    expect(source).toContain("response?.status === 409");
    expect(source).toContain("await refreshCanonical()");
    expect(source).toContain("common.move-up");
    expect(source).toContain("common.move-down");
  });

  it("renders artwork controls with the documented shared media composites", () => {
    expect(source).toContain("MediaManagementCard");
    expect(source).toContain("MediaManagementAction");
    expect(source).toContain("MediaUploadControl");
    expect(source).toContain('icon="mdi-view-dashboard-outline"');
    expect(source).toContain('icon="mdi-image-outline"');
    expect(source).toContain('icon="mdi-delete-outline"');
    expect(source).toContain('@click="deleteArtwork(item)"');
    expect(source).not.toContain("r-v2-art__preview");
  });

  it("uses localized artwork upload labels instead of exposing the i18n key", () => {
    expect(source.match(/t\(["']rom\.upload-artwork["']\)/g)).toHaveLength(3);
    expect(locale("en_US")["upload-artwork"]).toBe("Upload artwork");
    expect(locale("de_DE")["upload-artwork"]).toBe("Artwork hochladen");
  });

  it("passes the localized close label to the artwork lightbox", () => {
    expect(source).toContain(":close-label=\"t('common.close')\"");
  });
});
