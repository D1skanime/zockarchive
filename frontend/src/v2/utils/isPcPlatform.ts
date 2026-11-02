import type { DetailedRomSchema } from "@/__generated__";

const PC_PLATFORM_SLUGS = new Set(["dos", "win", "win3x", "win9x"]);

export function isPcPlatform(
  rom: Pick<DetailedRomSchema, "platform_fs_slug" | "platform_slug">,
): boolean {
  return (
    rom.platform_fs_slug === "pc" || PC_PLATFORM_SLUGS.has(rom.platform_slug)
  );
}
