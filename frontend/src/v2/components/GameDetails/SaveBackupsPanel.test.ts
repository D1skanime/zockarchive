import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const panel = readFileSync(
  resolve(process.cwd(), "src/v2/components/GameDetails/SaveBackupsPanel.vue"),
  "utf8",
);
const dialog = readFileSync(
  resolve(process.cwd(), "src/v2/components/GameDetails/SaveBackupDialog.vue"),
  "utf8",
);
const restore = readFileSync(
  resolve(process.cwd(), "src/v2/components/GameDetails/SaveRestoreDialog.vue"),
  "utf8",
);

describe("PC save backup UI contracts", () => {
  it("manages saved archives through the dedicated API", () => {
    expect(panel).toContain("saveBackupApi.listBackups");
    expect(panel).toContain("saveBackupApi.deleteBackup");
    expect(panel).toContain("download_path");
    expect(panel).toContain("requireTyped: backup.backup_name");
  });

  it("keeps folder-relative files and provides manual restore guidance", () => {
    expect(dialog).toContain("webkitRelativePath");
    expect(dialog).toContain("zipSync(entries)");
    expect(restore).toContain("save-backup-step-close");
    expect(restore).toContain("save-backup-step-copy");
  });

  it("keeps the folder-backup entry point visible before any legacy saves exist", () => {
    expect(panel).toContain('v-else-if="backups.length === 0"');
    expect(panel).toContain('t("rom.save-backup")');
  });
});
