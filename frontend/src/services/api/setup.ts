import api from "@/services/api";
import type { Platform } from "@/stores/platforms";

export const SETUP_EXCLUDED = "__setup_excluded__";

export interface SetupFolder {
  name: string;
  relative_path: string;
  association: "known" | "unknown";
  suggested_platform: string | null;
  excluded?: boolean;
}
export interface SetupPlatformOption {
  slug: string;
  display_name: string;
}
export interface SetupFolderDiscovery {
  root_label: string;
  folders: SetupFolder[];
  platform_options: SetupPlatformOption[];
}
export type SetupFolderDraft = Record<string, string | null>;
export interface SetupFolderAssignment {
  folder_name: string;
  disposition?: "platform" | "excluded";
  platform_slug: string | null;
}
export interface SetupFolderDisposition {
  folder_name: string;
  disposition?: "platform" | "excluded";
  platform_slug: string | null;
  mapping_id: number | null;
  relative_path: string;
}
export interface SetupFolderAdministration extends SetupFolder {
  disposition: "platform" | "excluded";
  platform_slug: string | null;
  mapping_id: number | null;
}
export interface SetupFolderAdministrationResponse {
  root_label: string;
  folders: SetupFolderAdministration[];
  platform_options: SetupPlatformOption[];
}
export interface SetupRecoverySnapshot {
  enrolled: boolean;
  setup_complete: boolean;
  current_step: "account" | "folders" | "complete";
  saved_assignments: SetupFolderDisposition[];
  missing_assignments: SetupFolder[];
  root_health: {
    reachable: boolean;
    readable: boolean;
    non_writable: boolean | null;
  };
  cause_code: string | null;
  next_action: string;
}
export interface SetupFolderAssignmentResponse {
  mappings: SetupFolderDisposition[];
  ready: boolean;
  root_health: {
    reachable: boolean;
    readable: boolean;
    non_writable: boolean | null;
  };
}
export interface ExistingPlatform {
  fs_slug: string;
  rom_count: number;
}
export interface SetupLibraryInfo {
  detected_structure: "struct_a" | "struct_b" | null;
  existing_platforms: ExistingPlatform[];
  supported_platforms: Platform[];
}
function discoverFolders() {
  return api.get<SetupFolderDiscovery>("/setup/folders");
}
function assignFolders(assignments: SetupFolderAssignment[]) {
  return api.post<SetupFolderAssignmentResponse>("/setup/folders/assign", {
    assignments,
  });
}
function getFolderAssignments() {
  return api.get<SetupFolderAdministrationResponse>(
    "/setup/folders/assignments",
  );
}
function getLibraryInfo() {
  return api.get<SetupLibraryInfo>("/setup/library");
}
function getStatus() {
  return api.get<SetupRecoverySnapshot>("/setup/status", { timeout: 5000 });
}
export default {
  discoverFolders,
  assignFolders,
  getFolderAssignments,
  getLibraryInfo,
  getStatus,
};
