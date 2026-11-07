/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Bounded, server-owned selection of a scan operation result page.
 */
export type ScanOperationResultQuery = {
    include_items?: boolean;
    offset?: number;
    limit?: number;
    search?: (string | null);
    platform_id?: (number | null);
    outcome?: 'all' | 'action-required' | 'unidentified' | 'failed' | 'warning' | 'completed' | 'indexed' | 'skipped';
};
