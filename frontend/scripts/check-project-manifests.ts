import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PROJECT_DESCRIPTION,
  PROJECT_NAME,
  PROJECT_SHORT_NAME,
} from "../src/v2/config/project";

// index.html and site.webmanifest are the reviewed install-surface owners.
const directory = process.argv[2];
assert(
  directory,
  "Usage: node --import tsx scripts/check-project-manifests.ts <output-directory>",
);
const output = resolve(directory);
const html = readFileSync(resolve(output, "index.html"), "utf8");
assert.match(html, new RegExp("<title>\\s*" + PROJECT_NAME + "\\s*</title>"));
assert.match(html, new RegExp("<span>\\s*" + PROJECT_NAME + "\\s*</span>"));
assert(
  !/PGDP|RomM|pgdp_logo/.test(html),
  "Built HTML retains obsolete display identity",
);

const manifestLinks = [...html.matchAll(/<link\b[^>]*>/gi)]
  .map(([tag]) => {
    const attrs = Object.fromEntries(
      [...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(
        ([, key, value]) => [key.toLowerCase(), value],
      ),
    );
    return attrs.rel?.toLowerCase().split(/\s+/).includes("manifest")
      ? attrs.href
      : undefined;
  })
  .filter((href): href is string => Boolean(href));

assert.deepEqual(manifestLinks, ["/site.webmanifest"]);
assert(
  !existsSync(resolve(output, "manifest.webmanifest")),
  "VitePWA must not generate a competing manifest",
);

const manifest = JSON.parse(
  readFileSync(resolve(output, "site.webmanifest"), "utf8"),
);
assert.equal(manifest.name, PROJECT_NAME, "site.webmanifest name");
assert.equal(
  manifest.short_name,
  PROJECT_SHORT_NAME,
  "site.webmanifest short_name",
);
assert.equal(
  manifest.description,
  PROJECT_DESCRIPTION,
  "site.webmanifest description",
);
assert.deepEqual(manifest.icons, [
  {
    src: "/android-chrome-192x192.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "/android-chrome-512x512.png",
    sizes: "512x512",
    type: "image/png",
  },
]);
assert.equal(manifest.theme_color, "#123c78", "site.webmanifest theme color");
assert.equal(
  manifest.background_color,
  "#f3f7fd",
  "site.webmanifest background color",
);
process.stdout.write(
  "Built HTML and the single approved install manifest matches " +
    PROJECT_NAME +
    " / " +
    PROJECT_SHORT_NAME +
    "\n",
);
