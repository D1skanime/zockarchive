import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  "src/v2/components/GameDetails/PcDlcMediaTab.vue",
  "utf8",
);
const presentationSource = readFileSync(
  "src/v2/components/GameDetails/pcDlcMediaPresentation.ts",
  "utf8",
);

describe("PcDlcMediaTab", () => {
  it("uses only nested component-owned media endpoints", () => {
    expect(source).toContain("/pc-components/${props.component.id}/media");
    expect(source).toContain("expected_version");
    expect(source).toContain("useConfirm");
    expect(source).not.toContain("source_relative_path");
    expect(source).toContain("const activeRoles");
    expect(source).toContain("const uploadRole");
    expect(source).toContain("filteredMedia");
    expect(source).toContain("placement");
  });

  it("renders owned media previews in the parent-style fullscreen gallery", () => {
    expect(source).toMatch(/import \{[\s\S]*ZACarousel,[\s\S]*ZADropzone,/);
    expect(source).toContain("MediaManagementCard");
    expect(
      readFileSync(
        "src/v2/components/GameDetails/MediaManagementAction.vue",
        "utf8",
      ),
    ).toContain("ZABtn");
    expect(source).toContain("function mediaContentUrl(mediaId: number)");
    expect(source).toContain("return `/api${endpoint}/${mediaId}/content`");
    expect(source).toContain("lightboxOpen");
    expect(source).toContain("fullscreen");
    expect(source).toContain("show-thumbnails");
    expect(source).toContain(":close-label=\"t('common.close')\"");
  });

  it("keeps placement controls permission-gated and component-scoped", () => {
    expect(source).toContain('useCan("rom.edit"');
    expect(source).toContain("/placement");
    expect(presentationSource).toContain('"rom.add-to-overview"');
    expect(presentationSource).toContain('"rom.remove-from-overview"');
  });

  it("renders localized media role and useful source labels", () => {
    expect(source).toContain("function mediaRoleLabel");
    expect(source).toContain("function mediaSourceLabel");
    expect(source).toContain("t(`rom.pc-media-role-${item.role}`)");
    expect(source).toContain('t("rom.pc-media-source-provider")');
    expect(source).toContain('t("rom.pc-media-source-uploaded")');
    expect(source).toMatch(/\{\{\s*mediaRoleLabel\(item\)\s*\}\}/);
    expect(source).toMatch(/\{\{\s*mediaSourceLabel\(item\)\s*\}\}/);
    expect(source).not.toContain("<strong>{{ item.role }}</strong>");
    expect(source).not.toContain("<span>{{ item.mime_type }}</span>");
  });

  it("uses the shared media navigation while preserving typed upload roles", () => {
    expect(source).toContain("validDlcMediaSubtabs");
    expect(presentationSource).toContain('"manual"');
    expect(presentationSource).toContain('"screenshots"');
    expect(presentationSource).toContain('"artwork"');
    expect(presentationSource).toContain('"soundtrack"');
    expect(source).toContain("const subtabDefs");
    expect(source).toContain('body.append("role", uploadRole.value)');
    expect(source).toContain("ZATabNav");
    expect(source).toContain('orientation="vertical"');
    expect(presentationSource).toContain("createDlcMediaSubtabDefs");
    expect(presentationSource).toContain(
      "controls: `pc-dlc-media-panel-${id}`",
    );
  });

  it("uses a DLC-specific gallery empty state instead of main-game artwork copy", () => {
    expect(source).toContain('t("rom.pc-media-empty-gallery")');
    expect(source).not.toContain(":title=\"t('rom.artwork-empty')\"");
  });

  it("awaits canonical reconciliation before reporting deletion success", () => {
    expect(source).toMatch(
      /await api\.delete[\s\S]+await reconcile\(\)[\s\S]+pc-media-deleted/,
    );
  });
});
