import { useState, useCallback, useEffect, useRef } from "react";
import type { FlowTree, FlowStep, RuntimeContext, AiSuggestion } from "@/lib/flow-engine/types";
import { evaluateCondition } from "@/lib/flow-engine/condition-evaluator";
import { runAction } from "@/lib/flow-engine/action-runner";
import { getStepSuggestions, getReviewSummary } from "@/lib/flow-engine/ai-mock";
import { useAuth } from "@/contexts/AuthContext";
import { cmdbGateway } from "@/lib/cmdb";

export function useFlowRuntime(flowTree: FlowTree) {
  const { user, roles, displayName } = useAuth();

  const [ctx, setCtx] = useState<RuntimeContext>(() => ({
    user: {
      id: user?.id ?? "",
      displayName: user?.email ?? "",
      roles: roles,
      ad_groups: [],
    },
    answers: {},
    lookups: {},
    derived: {},
    cmdb: {},
    ai_suggestions: [],
    logs: [],
    current_step_id: flowTree.flow.start_step_id,
    step_history: [flowTree.flow.start_step_id],
  }));

  // Load CMDB data on mount – map Supabase user via email/displayName
  useEffect(() => {
    (async () => {
      try {
        const overview = await cmdbGateway.getMyOverview(
          user?.id,
          user?.email ?? undefined,
          displayName || undefined,
        );
        const primaryDevice = overview.devices.find(d => d.type === "laptop") ?? overview.devices[0] ?? null;
        setCtx(prev => ({
          ...prev,
          cmdb: {
            identity: overview.identity,
            devices: overview.devices,
            primaryDevice,
            deviceCount: overview.devices.length,
            hasDevices: overview.devices.length > 0,
            applications: overview.applications,
            systemAccess: overview.systemAccess,
            permissions: overview.permissions,
            system: overview.systemAccess[0] ?? {},
          },
        }));
      } catch (e) {
        console.error("Failed to load CMDB data:", e);
      }
    })();
  }, [user?.id, user?.email, displayName]);

  const [isRunningActions, setIsRunningActions] = useState(false);
  const [actionErrors, setActionErrors] = useState<string[]>([]);
  const preActionsRan = useRef<Set<string>>(new Set());

  const currentStep = flowTree.steps.find(s => s.id === ctx.current_step_id) ?? null;
  const isFirstStep = ctx.step_history.length <= 1;
  const isReviewStep = currentStep?.type === "review";
  const totalSteps = flowTree.steps.length;
  const currentStepIndex = flowTree.steps.findIndex(s => s.id === ctx.current_step_id);
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  // Run pre-actions when step changes
  useEffect(() => {
    if (!currentStep || preActionsRan.current.has(ctx.current_step_id)) return;
    if (currentStep.pre_actions.length === 0) return;
    
    preActionsRan.current.add(ctx.current_step_id);
    setIsRunningActions(true);
    
    (async () => {
      for (const action of currentStep.pre_actions) {
        const result = await runAction(action, ctx);
        if (!result.success && action.error_handling.strategy === "stop") {
          setActionErrors(prev => [...prev, result.error ?? "Action failed"]);
          break;
        }
      }
      setCtx(prev => ({ ...prev })); // trigger re-render with updated lookups
      setIsRunningActions(false);
    })();
  }, [ctx.current_step_id]);

  // AI suggestions on step open
  useEffect(() => {
    if (!currentStep || !flowTree.flow.ai_enabled) return;
    (async () => {
      const suggestions = currentStep.type === "review"
        ? await getReviewSummary(ctx, flowTree.flow.name)
        : await getStepSuggestions(currentStep, ctx, flowTree.flow.name);
      setCtx(prev => ({ ...prev, ai_suggestions: suggestions }));
    })();
  }, [ctx.current_step_id, flowTree.flow.ai_enabled]);

  const setAnswer = useCallback((questionId: string, value: any) => {
    setCtx(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }));
  }, []);

  const acceptSuggestion = useCallback((suggestion: AiSuggestion) => {
    if (suggestion.target_question_id && suggestion.suggested_value != null) {
      setAnswer(suggestion.target_question_id, suggestion.suggested_value);
    }
    setCtx(prev => ({
      ...prev,
      ai_suggestions: prev.ai_suggestions.map(s =>
        s.id === suggestion.id ? { ...s, accepted: true } : s
      ),
    }));
  }, [setAnswer]);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setCtx(prev => ({
      ...prev,
      ai_suggestions: prev.ai_suggestions.filter(s => s.id !== suggestionId),
    }));
  }, []);

  const validate = useCallback((): string[] => {
    if (!currentStep) return [];
    const errors: string[] = [];
    for (const q of currentStep.questions) {
      const val = ctx.answers[q.id];
      if (q.required && (val == null || val === "")) {
        errors.push(`"${q.label}" är obligatoriskt`);
      }
      if (q.validation) {
        if (q.validation.min != null && typeof val === "string" && val.length < q.validation.min) {
          errors.push(`"${q.label}" måste vara minst ${q.validation.min} tecken`);
        }
        if (q.validation.max != null && typeof val === "string" && val.length > q.validation.max) {
          errors.push(`"${q.label}" får vara max ${q.validation.max} tecken`);
        }
        if (q.validation.regex && typeof val === "string" && !new RegExp(q.validation.regex).test(val)) {
          errors.push(`"${q.label}" har ogiltigt format`);
        }
      }
    }
    return errors;
  }, [currentStep, ctx.answers]);

  const goNext = useCallback(async () => {
    if (!currentStep) return false;
    const errors = validate();
    if (errors.length > 0) {
      setActionErrors(errors);
      return false;
    }
    setActionErrors([]);

    // Run post-actions
    if (currentStep.post_actions.length > 0) {
      setIsRunningActions(true);
      for (const action of currentStep.post_actions) {
        const result = await runAction(action, ctx);
        if (!result.success && action.error_handling.strategy === "stop") {
          setActionErrors([result.error ?? "Action failed"]);
          setIsRunningActions(false);
          return false;
        }
      }
      setIsRunningActions(false);
    }

    // Evaluate transitions
    const nextStepId = resolveTransition(currentStep, ctx, flowTree.steps);
    if (!nextStepId) return false;

    setCtx(prev => ({
      ...prev,
      current_step_id: nextStepId,
      step_history: [...prev.step_history, nextStepId],
      logs: [...prev.logs, {
        timestamp: new Date().toISOString(),
        type: "step_leave",
        step_id: currentStep.id,
        detail: `Left step "${currentStep.title}", going to ${nextStepId}`,
      }],
    }));
    return true;
  }, [currentStep, ctx, validate]);

  const goBack = useCallback(() => {
    if (ctx.step_history.length <= 1) return;
    const newHistory = [...ctx.step_history];
    newHistory.pop();
    const prevStepId = newHistory[newHistory.length - 1];
    setCtx(prev => ({
      ...prev,
      current_step_id: prevStepId,
      step_history: newHistory,
    }));
    setActionErrors([]);
  }, [ctx.step_history]);

  return {
    ctx, currentStep, isFirstStep, isReviewStep, progress,
    isRunningActions, actionErrors, setActionErrors,
    setAnswer, validate, goNext, goBack,
    acceptSuggestion, dismissSuggestion,
  };
}

function resolveTransition(step: FlowStep, ctx: RuntimeContext, allSteps: FlowStep[]): string | null {
  for (const t of step.transitions) {
    if (t.condition && evaluateCondition(t.condition, ctx)) {
      return t.next_step_id;
    }
  }
  const defaultT = step.transitions.find(t => t.is_default);
  if (defaultT?.next_step_id) return defaultT.next_step_id;

  // Fallback: advance to next step in array if no transitions defined
  const currentIndex = allSteps.findIndex(s => s.id === step.id);
  if (currentIndex >= 0 && currentIndex < allSteps.length - 1) {
    return allSteps[currentIndex + 1].id;
  }
  return null;
}
