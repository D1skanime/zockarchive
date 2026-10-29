export type StoryTextCategory =
  | "docs-description"
  | "story-data"
  | "story-name"
  | "template-attribute"
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

  const templatePattern = /\btemplate:\s*`([\s\S]*?)`/g;
  for (const template of source.matchAll(templatePattern)) {
    const markup = template[1];
    const base = (template.index ?? 0) + template[0].indexOf(markup);
    for (const attribute of markup.matchAll(
      /\b([\w-]+)=(?:"([^"]*)"|'([^']*)')/g,
    )) {
      if (templateAttributes.has(attribute[1]))
        add(
          "template-attribute",
          attribute[2] ?? attribute[3] ?? "",
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
      !decisions.some(
        (decision) =>
          decision.file === candidate.file &&
          decision.location === candidate.location &&
          decision.category === candidate.category &&
          decision.text === candidate.text,
      ),
  );
}
