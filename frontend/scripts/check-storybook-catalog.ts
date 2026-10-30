import { existsSync, readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join, relative } from "node:path";
import {
  compositionInventory,
  phase39BrandDocsId,
  primitiveDocs,
} from "../src/v2/storybook/compositionInventory";
import { storyTextDecisions } from "./storybookLanguageDecisions";
import {
  findNonGermanDecisions,
  findUnreviewedVisibleStoryText,
} from "./storybookLanguageGuard";

const root = join(import.meta.dirname, "..");
const stories = globSync("src/v2/**/*.stories.ts", { cwd: root });
const allowedGroups = new Set([
  "Grundelemente",
  "Formulare",
  "Struktur",
  "Daten",
  "Menüs",
  "Overlays",
  "Medien",
  "Player",
  "Geteilt",
  "Marke",
  "Im Einsatz",
]);

function fail(message: string): never {
  throw new Error(`Storybook catalog: ${message}`);
}

const nonGermanDecisions = findNonGermanDecisions(storyTextDecisions);
if (nonGermanDecisions.length > 0) {
  fail(
    `German review entries failed independent language detection: ${nonGermanDecisions
      .map(({ file, location, text }) => `${file} ${location}: ${text}`)
      .join(", ")}`,
  );
}

for (const story of stories) {
  const source = readFileSync(join(root, story), "utf8");
  const title = source.match(
    /const meta[\s\S]*?title:\s*["']([^"']+)["']/,
  )?.[1];
  if (!title) fail(`${story} has no static title`);
  const unreviewedText = findUnreviewedVisibleStoryText(
    source,
    story,
    storyTextDecisions,
  );
  if (unreviewedText.length > 0) {
    fail(
      `${story} has unreviewed visible text: ${unreviewedText.map(({ category, location, text }) => `${location} (${category}): ${text}`).join(", ")}`,
    );
  }
  if (story === "src/v2/components/shared/BrandMotionPreview.stories.ts")
    continue;

  const [group, segment] = title.split("/");
  if (!allowedGroups.has(group) || !segment) {
    fail(`${story} uses invalid German taxonomy title ${title}`);
  }
  if (
    [
      "Primitives",
      "Forms",
      "Structural",
      "Data",
      "Menus",
      "Media",
      "Shared",
      "Brand",
    ].includes(group)
  ) {
    fail(`${story} retains an English taxonomy group`);
  }
  const inventoryPath = relative(join(root, "src/v2"), join(root, story));
  const record =
    compositionInventory[inventoryPath as keyof typeof compositionInventory];
  const hasDeclaration = source.includes("compositionParameters(");
  if (record && title.includes("/Zusammengesetzt/") && !hasDeclaration)
    fail(`${story} is missing its inventory declaration`);
  if (!record && hasDeclaration)
    fail(`${story} has an unexpected inventory declaration`);
}

if (!stories.some((story) => story.endsWith("BrandMotionPreview.stories.ts"))) {
  fail("protected Phase 39 story is missing");
}

const indexDir = process.argv.indexOf("--index-dir");
if (indexDir >= 0) {
  const index = JSON.parse(
    readFileSync(join(root, process.argv[indexDir + 1], "index.json"), "utf8"),
  ) as { entries: Record<string, unknown> };
  const ids = new Set(Object.keys(index.entries));
  for (const entry of Object.values(compositionInventory)) {
    for (const primitive of entry.primitives) {
      if (!ids.has(primitiveDocs(primitive)))
        fail(`missing emitted docs target ${primitiveDocs(primitive)}`);
    }
  }
  if (!ids.has(phase39BrandDocsId))
    fail("protected Phase 39 docs target is absent or retitled");
}

if (!existsSync(join(root, "src/v2/storybook/compositionInventory.ts"))) {
  fail("composition inventory is missing");
}
