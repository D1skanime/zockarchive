const englishStoryNameTerms = [
  /\b(?:basic|colou?red|compact|controlled|custom|default|density|disabled|empty|flat|gallery|grid|header|icon|ladder|loading|long-form|open|parent|placement|primary|rounded|row|searchable|secondary|size|state|title|toolbar|tooltip|touch|with|without)\b/i,
  /\b(?:actions?|append|attach|border|close|content|flip|height|label|offset|real-world|toggle)\b/i,
];

/**
 * Finds explicit Storybook display names that retain English catalogue copy.
 * Component identifiers and prop values are intentionally outside this guard.
 */
export function findEnglishStoryNames(source: string): string[] {
  return [...source.matchAll(/\bname:\s*["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((name) => englishStoryNameTerms.some((term) => term.test(name)));
}
