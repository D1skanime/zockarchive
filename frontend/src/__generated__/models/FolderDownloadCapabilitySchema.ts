/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Safe aggregate for a shared-download source with recorded size evidence.
 */
export type FolderDownloadCapabilitySchema = {
    source_kind: 'file' | 'folder';
    member_count: number;
    total_size_bytes: number;
};
