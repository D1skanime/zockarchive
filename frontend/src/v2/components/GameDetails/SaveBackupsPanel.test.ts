import { flushPromises, mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import SaveBackupsPanel from "./SaveBackupsPanel.vue";

const saveBackupApi = vi.hoisted(() => ({
  deleteBackup: vi.fn(),
  listBackups: vi.fn(),
}));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@v2/lib", () => ({
  ZABtn: { template: "<button><slot /></button>" },
  ZASpinner: { template: "<span data-spinner />" },
}));
vi.mock("@/services/api/saveBackup", () => ({ default: saveBackupApi }));
vi.mock("@/v2/composables/useConfirm", () => ({
  useConfirm: () => vi.fn(),
}));
vi.mock("@/v2/composables/useSnackbar", () => ({
  useSnackbar: () => ({ success: vi.fn(), error: vi.fn() }),
}));
vi.mock("@/v2/components/GameDetails/PcSaveBackupLauncher.vue", () => ({
  default: { template: "<div data-backup-launcher />" },
}));
vi.mock("@/v2/components/GameDetails/SaveRestoreDialog.vue", () => ({
  default: { template: "<div />" },
}));

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

  it("uses the dedicated PC launcher instead of a second backup button", () => {
    expect(panel).toContain('v-else-if="backups.length === 0"');
    expect(panel).toContain("PcSaveBackupLauncher");
    expect(panel).not.toContain("SaveBackupDialog");
  });

  it("keeps the backup heading and uploaded backup in separate layout rows", async () => {
    saveBackupApi.listBackups.mockResolvedValue({
      data: [
        {
          id: 1,
          backup_name: "Backup",
          archive_name: "backup.zip",
          created_at: "2026-01-01T00:00:00Z",
          file_count: 1,
          total_size_bytes: 4,
          restore_path: "C:\\Saves",
          download_path: "/download/1",
        },
      ],
    });
    const wrapper = mount(SaveBackupsPanel, {
      props: { romId: 1, isPc: true },
    });
    await flushPromises();

    const heading = wrapper.get(".r-v2-save-backups__head");
    const item = wrapper.get(".r-v2-save-backups__item");
    expect(heading.text()).toContain("rom.save-backup-list-title");
    expect(item.text()).toContain("Backup");
    expect(
      heading.element.compareDocumentPosition(item.element) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
  });
});
