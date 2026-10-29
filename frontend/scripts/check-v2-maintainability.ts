import { readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(process.cwd(), "src/v2");
const exceptionDocument = resolve(
  process.cwd(),
  "docs/v2-lib-native-control-exceptions.md",
);
const baseline = new Map<string, number>([
  ["lib/forms/RSelect/RSelect.vue", 1800],
  ["components/Gallery/GalleryShell.vue", 1350],
  ["components/GameCard/GameCard.vue", 1100],
  ["views/GameDetails.vue", 800],
  ["views/Scan.vue", 1500],
  ["lib/forms/RTextField/RTextField.vue", 1050],
  ["views/Player/EmulatorJS.vue", 1100],
  ["views/Player/Stream.vue", 1000],
]);

const advice: Record<string, string> = {
  button: "RBtn",
  input: "RTextField",
  select: "RSelect",
  textarea: "RTextField",
};

function template(source: string): string {
  const opening = source.match(/^<template\b[^>]*>/im);
  const closing = source.lastIndexOf("</template>");
  if (!opening || closing === -1 || opening.index === undefined) return "";
  return source
    .slice(opening.index + opening[0].length, closing)
    .replace(/<!--[\s\S]*?-->/g, "");
}

export function documentedExceptions(document: string): Set<string> {
  const exceptions = new Set<string>();
  for (const line of document.split("\n")) {
    const match = line.match(
      /^\|\s*`([^`]+)`\s*\|\s*`(button|input|select|textarea)`\s*\|\s*(\d+)\s*\|/,
    );
    if (match) exceptions.add(`${match[1]}|${match[2]}|${match[3]}`);
  }
  return exceptions;
}

export function findNativeControlViolations(
  path: string,
  source: string,
  exceptions: Set<string>,
): string[] {
  const openingTemplate = source.search(/^<template\b[^>]*>/im);
  if (openingTemplate === -1) return [];
  const prefixLines = source.slice(0, openingTemplate).split("\n").length - 1;
  const control = /<(button|input|select|textarea)\b/gi;
  const violations: string[] = [];
  const cleanedTemplate = template(source);

  for (const match of cleanedTemplate.matchAll(control)) {
    const tag = match[1].toLowerCase();
    const line =
      prefixLines + cleanedTemplate.slice(0, match.index).split("\n").length;
    if (exceptions.has(`${path}|${tag}|${line}`)) continue;
    violations.push(
      `${path}:${line} native <${tag}>; use ${advice[tag]} or document an exact semantic exception`,
    );
  }
  return violations;
}

function walk(dir: string, files: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) walk(path, files);
    else if (
      /\.(vue|ts)$/.test(entry.name) &&
      !/\.(test|stories)\./.test(entry.name)
    )
      files.push(path);
  }
}

export function runMaintainabilityCheck(): string[] {
  const violations: string[] = [];
  const files: string[] = [];
  const exceptions = documentedExceptions(
    readFileSync(exceptionDocument, "utf8"),
  );
  walk(root, files);

  for (const file of files) {
    const rel = relative(root, file).replaceAll("\\", "/");
    const source = readFileSync(file, "utf8");
    const lines = source.split("\n").length;
    const allowed = baseline.get(rel) ?? 900;
    if (lines > allowed)
      violations.push(rel + ": " + lines + " lines exceeds " + allowed);

    if (
      !rel.startsWith("data/adapters/") &&
      /@\/(stores|services)(?:\/api)?\//.test(source)
    ) {
      violations.push(rel + ": direct legacy store/service import");
    }
    if (rel.startsWith("lib/") && file.endsWith(".vue")) {
      violations.push(...findNativeControlViolations(rel, source, exceptions));
    }
  }
  return violations;
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const violations = runMaintainabilityCheck();
  if (violations.length > 0) {
    console.error("V2 maintainability gate failed:");
    for (const violation of violations) console.error("- " + violation);
    process.exit(1);
  }
  console.log("V2 maintainability gate passed.");
}
