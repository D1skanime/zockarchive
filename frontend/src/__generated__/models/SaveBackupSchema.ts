/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SaveBackupSchema = {
    id: number;
    backup_id: string;
    rom_id: number;
    backup_name: string;
    archive_name: string;
    source_folder: string;
    restore_path: string;
    platform: string;
    file_count: number;
    total_size_bytes: number;
    archive_size_bytes: number;
    sha256: string;
    status: string;
    manifest: Array<Record<string, any>>;
    download_path: string;
    created_at: string;
    updated_at: string;
};
