import type { SaveBackupSchema } from "@/__generated__";
import api from "@/services/api";

export type SaveBackup = SaveBackupSchema;

export type CreateSaveBackupInput = {
  romId: number;
  backupName: string;
  sourceFolder: string;
  restorePath: string;
  archive: Blob;
  onProgress?: (percent: number) => void;
};

async function createBackup(input: CreateSaveBackupInput) {
  const form = new FormData();
  form.append("rom_id", String(input.romId));
  form.append("backup_name", input.backupName);
  form.append("source_folder", input.sourceFolder);
  form.append("restore_path", input.restorePath);
  form.append("archive", input.archive, "save-backup.zip");
  return api.post<SaveBackup>("/save-backups", form, {
    onUploadProgress: ({ loaded, total }) => {
      if (total) input.onProgress?.(Math.round((loaded / total) * 100));
    },
  });
}

async function listBackups(romId: number) {
  return api.get<SaveBackup[]>(`/save-backups/rom/${romId}`);
}

async function updateRestorePath(id: number, restorePath: string) {
  const form = new FormData();
  form.append("restore_path", restorePath);
  return api.put<SaveBackup>(`/save-backups/${id}/restore-path`, form);
}

async function deleteBackup(id: number) {
  return api.delete(`/save-backups/${id}`);
}

export default { createBackup, deleteBackup, listBackups, updateRestorePath };
