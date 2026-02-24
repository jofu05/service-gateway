import type { AiSuggestion, RuntimeContext, FlowStep } from "./types";
import { v4Fallback } from "./utils";

/**
 * Deterministic suggestion helpers (AI disabled).
 */

export async function getStepSuggestions(
  step: FlowStep,
  ctx: RuntimeContext,
  _flowName?: string,
): Promise<AiSuggestion[]> {
  return getFallbackSuggestions(step, ctx);
}

export async function getReviewSummary(
  ctx: RuntimeContext,
  _flowName?: string,
): Promise<AiSuggestion[]> {
  return getFallbackSummary(ctx);
}

// --- Fallback logic (previously the only logic) ---

function getFallbackSuggestions(step: FlowStep, ctx: RuntimeContext): AiSuggestion[] {
  const suggestions: AiSuggestion[] = [];
  const answers = ctx.answers;
  const descText = (answers.description || answers.problemDescription || "").toLowerCase();

  if (descText && !answers.category) {
    let cat = "IT-Support";
    let confidence = 0.6;
    if (descText.includes("vpn") || descText.includes("nät")) { cat = "Nätverk"; confidence = 0.85; }
    if (descText.includes("behörighet") || descText.includes("åtkomst")) { cat = "Behörighet"; confidence = 0.82; }
    if (descText.includes("bestäl") || descText.includes("licens")) { cat = "Beställning"; confidence = 0.78; }

    suggestions.push({
      id: v4Fallback(),
      type: "category",
      target_question_id: "category",
      suggested_value: cat,
      message: `Baserat på din beskrivning föreslår vi kategorin "${cat}"`,
      confidence,
      reason: "Nyckelord hittade i beskrivningen",
    });
  }

  const requiredFields = step.questions.filter((q) => q.required);
  const missing = requiredFields.filter((q) => !answers[q.id]);
  if (missing.length > 0) {
    suggestions.push({
      id: v4Fallback(),
      type: "checklist",
      message: `Saknad information: ${missing.map((q) => q.label).join(", ")}`,
      confidence: 1.0,
      reason: "Obligatoriska fält som inte fyllts i",
    });
  }

  return suggestions;
}

function getFallbackSummary(ctx: RuntimeContext): AiSuggestion[] {
  const answerCount = Object.keys(ctx.answers).filter(
    (k) => ctx.answers[k] != null && ctx.answers[k] !== "",
  ).length;

  const summary = Object.entries(ctx.answers)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `• ${k}: ${v}`)
    .join("\n");

  return [
    {
      id: v4Fallback(),
      type: "summary",
      message: `Sammanfattning av ditt ärende (${answerCount} fält ifyllda):\n${summary}`,
      confidence: 1.0,
      reason: "Automatisk sammanfattning (fallback)",
    },
  ];
}
