export type StoryTextCategory =
  | "docs-description"
  | "play-step"
  | "play-step-dynamic"
  | "story-data"
  | "story-name"
  | "template-attribute"
  | "template-attribute-dynamic"
  | "template-text"
  | "template-interpolation";

export interface VisibleStoryTextCandidate {
  category: StoryTextCategory;
  file: string;
  location: string;
  text: string;
}

export interface StoryTextDecision {
  category: StoryTextCategory;
  file: string;
  location: string;
  reason?: string;
  text: string;
  status: "german" | "proper-name";
}

export interface StoryTextDecisionIssue {
  decision: StoryTextDecision;
  kind: "duplicate" | "stale";
}

const visibleDataKeys = new Set([
  "alt",
  "aria-label",
  "description",
  "error",
  "hint",
  "label",
  "placeholder",
  "subtitle",
  "text",
  "title",
]);
const templateAttributes = new Set([
  "alt",
  "aria-label",
  "label",
  "placeholder",
  "subtitle",
  "text",
  "title",
]);

function lineAt(source: string, offset: number): string {
  return `Zeile ${source.slice(0, offset).split("\n").length}`;
}

function unquote(value: string): string {
  return value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

/** Inventories static presentation copy independently of language detection. */
export function getVisibleStoryTextCandidates(
  source: string,
  file: string,
): VisibleStoryTextCandidate[] {
  const candidates: VisibleStoryTextCandidate[] = [];
  const add = (category: StoryTextCategory, text: string, offset: number) => {
    const normalized = unquote(text);
    if (normalized)
      candidates.push({
        category,
        file,
        location: lineAt(source, offset),
        text: normalized,
      });
  };

  const propertyPattern = /\b([A-Za-z][\w-]*):\s*(["'`])([\s\S]*?)\2/g;
  for (const match of source.matchAll(propertyPattern)) {
    const key = match[1];
    if (key === "name") add("story-name", match[3], match.index ?? 0);
    else if (key === "description")
      add("docs-description", match[3], match.index ?? 0);
    else if (visibleDataKeys.has(key))
      add("story-data", match[3], match.index ?? 0);
  }
  for (const description of source.matchAll(
    /\bdescription:\s*\{[\s\S]*?\b(?:story|component):\s*(["'`])([\s\S]*?)\1/g,
  ))
    add("docs-description", description[2], description.index ?? 0);

  // Storybook shows step labels in the Interactions panel, so they need the
  // same explicit review as text rendered in the story canvas. A dynamic
  // expression cannot be ledger-approved because its runtime value is unknown.
  const staticStepOffsets = new Set<number>();
  for (const step of source.matchAll(/\bstep\(\s*(["'])([\s\S]*?)\1\s*,/g)) {
    staticStepOffsets.add(step.index ?? 0);
    add("play-step", step[2], step.index ?? 0);
  }
  for (const step of source.matchAll(/\bstep\(\s*`([^`$]*)`\s*,/g)) {
    staticStepOffsets.add(step.index ?? 0);
    add("play-step", step[1], step.index ?? 0);
  }
  for (const step of source.matchAll(/\bstep\(\s*([\s\S]*?)\s*,/g)) {
    if (!staticStepOffsets.has(step.index ?? 0))
      add(
        "play-step-dynamic",
        `Dynamisches step()-Label: ${step[1].trim()}`,
        step.index ?? 0,
      );
  }

  // Story setup data often uses a bare string array for rendered suggestions,
  // chips, or select items. Those values are visible even without a key/value
  // property and therefore need individual ledger decisions.
  for (const array of source.matchAll(
    /\b(?:items|suggestions|options|values):\s*\[([\s\S]*?)\]/g,
  )) {
    const base = (array.index ?? 0) + array[0].indexOf(array[1]);
    for (const value of array[1].matchAll(
      /(?:^|,)\s*(["'])([^"']+)\1(?=\s*(?:,|$))/g,
    ))
      add(
        "story-data",
        value[2],
        base + (value.index ?? 0) + value[0].indexOf(value[2]),
      );
  }

  // Controlled input stories commonly seed visible chips with `ref([...])`.
  // Include typed refs as well: Vue renders these initial values just like
  // direct `items` arrays when the ref is bound through v-model.
  for (const array of source.matchAll(
    /\bref(?:<[^>]+>)?\(\s*\[([\s\S]*?)\]\s*\)/g,
  )) {
    const base = (array.index ?? 0) + array[0].indexOf(array[1]);
    for (const value of array[1].matchAll(
      /(?:^|,)\s*(["'])([^"']+)\1(?=\s*(?:,|$))/g,
    ))
      add(
        "story-data",
        value[2],
        base + (value.index ?? 0) + value[0].indexOf(value[2]),
      );
  }

  const templatePattern = /\btemplate:\s*`([\s\S]*?)`/g;
  for (const template of source.matchAll(templatePattern)) {
    const markup = template[1];
    const base = (template.index ?? 0) + template[0].indexOf(markup);
    for (const attribute of markup.matchAll(
      /(:?)([\w-]+)=(?:"([^"]*)"|'([^']*)')/g,
    )) {
      const [, binding, name, doubleQuoted, singleQuoted] = attribute;
      if (!templateAttributes.has(name)) continue;
      const value = doubleQuoted ?? singleQuoted ?? "";
      add(
        binding === ":" ? "template-attribute-dynamic" : "template-attribute",
        binding === ":" ? `Dynamischer ${name}-Attributwert: ${value}` : value,
        base + (attribute.index ?? 0),
      );
    }
    for (const textNode of markup.matchAll(/>([^<{}][^<]*?)</g))
      add(
        "template-text",
        textNode[1].replace(/\s+/g, " "),
        base + (textNode.index ?? 0),
      );
    for (const interpolation of markup.matchAll(/{{\s*([^}]+?)\s*}}/g))
      add(
        "template-interpolation",
        `{{ ${interpolation[1].trim()} }}`,
        base + (interpolation.index ?? 0),
      );
  }
  return candidates;
}

export function findUnreviewedVisibleStoryText(
  source: string,
  file: string,
  decisions: readonly StoryTextDecision[],
): VisibleStoryTextCandidate[] {
  return getVisibleStoryTextCandidates(source, file).filter(
    (candidate) =>
      candidate.category === "play-step-dynamic" ||
      !decisions.some(
        (decision) =>
          decision.file === candidate.file &&
          decision.location === candidate.location &&
          decision.category === candidate.category &&
          decision.text === candidate.text,
      ),
  );
}

function candidateKey(candidate: VisibleStoryTextCandidate): string {
  return [
    candidate.file,
    candidate.location,
    candidate.category,
    candidate.text,
  ].join("\u0000");
}

/**
 * Keeps the human-reviewed ledger an exact inventory of currently extracted
 * visible text. Decisions cannot silently remain after source copy changes,
 * and a single candidate cannot gain ambiguous duplicate approvals.
 */
export function findInvalidStoryTextDecisions(
  candidates: readonly VisibleStoryTextCandidate[],
  decisions: readonly StoryTextDecision[],
): StoryTextDecisionIssue[] {
  const candidateKeys = new Set(candidates.map(candidateKey));
  const seenDecisionKeys = new Set<string>();
  const issues: StoryTextDecisionIssue[] = [];

  for (const decision of decisions) {
    const key = candidateKey(decision);
    if (seenDecisionKeys.has(key)) {
      issues.push({ decision, kind: "duplicate" });
      continue;
    }
    seenDecisionKeys.add(key);
    if (!candidateKeys.has(key)) issues.push({ decision, kind: "stale" });
  }

  return issues;
}
