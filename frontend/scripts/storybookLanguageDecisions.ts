import decisions from "./storybook-language-decisions.json";
import type { StoryTextDecision } from "./storybookLanguageGuard";

/**
 * Explicit review ledger for static visible story copy. Entries are keyed by
 * file, category and exact text, so new copy cannot inherit a prior approval.
 */
export const storyTextDecisions =
  decisions satisfies readonly StoryTextDecision[];
