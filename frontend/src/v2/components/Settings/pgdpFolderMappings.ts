import storageApi from "@/v2/data/adapters/legacy/services/api/storage";
import type { Platform } from "@/v2/data/adapters/legacy/stores/platforms";

export interface PgdPFolderMappingRow {
  fsSlug: string;
  slug?: string;
  displayName?: string;
  type: "auto";
}

export async function loadPgdPFolderMappings(
  platforms: readonly Platform[],
  directFolderPaths: ReadonlySet<string> = new Set(),
  directPlatformSlugs: ReadonlySet<string> = new Set(),
): Promise<PgdPFolderMappingRow[]> {
  const rows = await Promise.all(
    platforms
      // Direct Games folders are exclusively administered by the setup
      // projection. Skip their platform request entirely because an explicit
      // exclusion intentionally has no active storage mapping.
      .filter(
        (platform) =>
          platform.id > 0 &&
          !directPlatformSlugs.has(platform.slug) &&
          !directFolderPaths.has(platform.slug) &&
          !directFolderPaths.has(platform.fs_slug),
      )
      .map(async (platform) => {
        try {
          const { data } = await storageApi.getMapping(platform.id);
          return {
            fsSlug: data.relative_path,
            slug: platform.slug,
            displayName: platform.display_name || platform.name,
            type: "auto" as const,
          };
        } catch {
          return null;
        }
      }),
  );

  return (
    rows
      .filter((row): row is NonNullable<typeof row> => row !== null)
      // Direct children are administered by the setup disposition projection.
      // Keep them out of the generic mapping table so an excluded child cannot
      // be presented as an automatically detected platform mapping.
      .filter((row) => !directFolderPaths.has(row.fsSlug))
      .sort((a, b) => a.fsSlug.localeCompare(b.fsSlug))
  );
}
