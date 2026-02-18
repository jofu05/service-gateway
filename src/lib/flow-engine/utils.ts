import type { RuntimeContext, FlowStep, FlowTree } from "./types";

/** Simple fallback UUID generator (no crypto dependency) */
export function v4Fallback(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * Resolves template variables like {{answers.deviceType}} in a text string.
 */
export function resolveText(text: string, ctx: RuntimeContext): string {
  if (!text) return text;
  return text.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    const parts = path.split(".");
    let current: any = ctx;
    for (const p of parts) {
      if (current == null) return match;
      current = current[p];
    }
    if (current == null) return match;
    return String(current);
  });
}

export interface AvailableVariable {
  path: string;
  label: string;
  category: "user" | "answers" | "lookups" | "derived";
}

/**
 * Returns all available variables for a flow, useful for the variable picker and data panel.
 */
export function getAvailableVariables(flowTree: FlowTree, upToStepId?: string): AvailableVariable[] {
  const vars: AvailableVariable[] = [
    { path: "user.displayName", label: "Användarnamn", category: "user" },
    { path: "user.id", label: "Användar-ID", category: "user" },
    { path: "user.roles", label: "Roller", category: "user" },
    { path: "user.ad_groups", label: "AD-grupper", category: "user" },
  ];

  const steps = flowTree.steps;
  // Include the current step's questions so they can be used in transition rules
  const stopIdx = upToStepId ? steps.findIndex(s => s.id === upToStepId) : -1;
  const stopIndex = stopIdx >= 0 ? stopIdx + 1 : steps.length;

  for (let i = 0; i < Math.min(stopIndex, steps.length); i++) {
    const step = steps[i];
    for (const q of step.questions) {
      if (q.input_type === "info") continue;
      vars.push({
        path: `answers.${q.id}`,
        label: `${q.label} (Steg ${i + 1})`,
        category: "answers",
      });
    }
  }

  return vars;
}

/**
 * Returns a flat list of all questions with their step context, useful for field selectors.
 */
export function getAllQuestions(flowTree: FlowTree): Array<{ questionId: string; label: string; stepTitle: string; stepIndex: number }> {
  return flowTree.steps.flatMap((step, i) =>
    step.questions
      .filter(q => q.input_type !== "info")
      .map(q => ({
        questionId: q.id,
        label: q.label,
        stepTitle: step.title,
        stepIndex: i,
      }))
  );
}
