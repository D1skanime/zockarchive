import setupApi from "@/v2/data/adapters/legacy/services/api/setup";
import storageApi from "@/v2/data/adapters/legacy/services/api/storage";
import type { Platform } from "@/v2/data/adapters/legacy/stores/platforms";

/** Resolve readiness from durable direct-folder assignments, not all platforms. */
export async function getDirectFolderMappingReadiness(
  platforms: readonly Platform[],
) {
  const { data: assignments } = await setupApi.getFolderAssignments();
  const mappedPlatformSlugs = new Set(
    assignments.folders
      .filter(
        (folder) =>
          folder.disposition === "platform" && folder.mapping_id !== null,
      )
      .map((folder) => folder.platform_slug)
      .filter((slug): slug is string => slug !== null),
  );
  return storageApi.getMappingsReadiness(
    platforms
      .filter((platform) => mappedPlatformSlugs.has(platform.slug))
      .map((platform) => platform.id),
  );
}
