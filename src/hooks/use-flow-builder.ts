import { useState, useCallback } from "react";
import type { FlowTree, FlowStep, FlowQuestion, FlowAction, TransitionRule, StepType, InputType, ActionType, ActionTrigger, ConditionExpression } from "@/lib/flow-engine/types";
import { v4Fallback } from "@/lib/flow-engine/utils";

export function useFlowBuilder(initial?: FlowTree) {
  const [flow, setFlow] = useState<FlowTree>(initial ?? createEmptyFlow());
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const selectedStep = flow.steps.find(s => s.id === selectedStepId) ?? null;

  const updateFlow = useCallback((updater: (prev: FlowTree) => FlowTree) => {
    setFlow(prev => {
      const next = updater(prev);
      setIsDirty(true);
      return next;
    });
  }, []);

  const addStep = useCallback((type: StepType = "questions") => {
    const newStep: FlowStep = {
      id: `step-${v4Fallback().slice(0, 8)}`,
      title: "Nytt steg",
      description: "",
      type,
      questions: [],
      pre_actions: [],
      post_actions: [],
      transitions: [],
      ui: { columns: 1 },
    };
    updateFlow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    setSelectedStepId(newStep.id);
    return newStep.id;
  }, [updateFlow]);

  const updateStep = useCallback((stepId: string, updates: Partial<FlowStep>) => {
    updateFlow(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, ...updates } : s),
    }));
  }, [updateFlow]);

  const deleteStep = useCallback((stepId: string) => {
    updateFlow(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== stepId),
    }));
    if (selectedStepId === stepId) setSelectedStepId(null);
  }, [updateFlow, selectedStepId]);

  const addQuestion = useCallback((stepId: string, inputType: InputType = "text") => {
    const q: FlowQuestion = {
      id: `q-${v4Fallback().slice(0, 8)}`,
      label: "Ny fråga",
      required: false,
      input_type: inputType,
    };
    updateStep(stepId, {
      questions: [...(flow.steps.find(s => s.id === stepId)?.questions ?? []), q],
    });
    return q.id;
  }, [flow.steps, updateStep]);

  const updateQuestion = useCallback((stepId: string, questionId: string, updates: Partial<FlowQuestion>) => {
    updateFlow(prev => ({
      ...prev,
      steps: prev.steps.map(s =>
        s.id === stepId
          ? { ...s, questions: s.questions.map(q => q.id === questionId ? { ...q, ...updates } : q) }
          : s
      ),
    }));
  }, [updateFlow]);

  const deleteQuestion = useCallback((stepId: string, questionId: string) => {
    updateFlow(prev => ({
      ...prev,
      steps: prev.steps.map(s =>
        s.id === stepId
          ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
          : s
      ),
    }));
  }, [updateFlow]);

  const addTransition = useCallback((stepId: string) => {
    const t: TransitionRule = {
      id: `tr-${v4Fallback().slice(0, 8)}`,
      next_step_id: "",
      is_default: true,
    };
    updateStep(stepId, {
      transitions: [...(flow.steps.find(s => s.id === stepId)?.transitions ?? []), t],
    });
  }, [flow.steps, updateStep]);

  const addAction = useCallback((stepId: string, trigger: ActionTrigger, type: ActionType = "lookup") => {
    const a: FlowAction = {
      id: `act-${v4Fallback().slice(0, 8)}`,
      name: "Ny action",
      type,
      trigger,
      input_template: {},
      output_mapping: {},
      error_handling: { strategy: "skip" },
    };
    const step = flow.steps.find(s => s.id === stepId);
    if (!step) return;
    if (trigger === "pre_step") {
      updateStep(stepId, { pre_actions: [...step.pre_actions, a] });
    } else {
      updateStep(stepId, { post_actions: [...step.post_actions, a] });
    }
  }, [flow.steps, updateStep]);

  const moveQuestion = useCallback((stepId: string, fromIndex: number, toIndex: number) => {
    updateFlow(prev => ({
      ...prev,
      steps: prev.steps.map(s => {
        if (s.id !== stepId) return s;
        const qs = [...s.questions];
        const [moved] = qs.splice(fromIndex, 1);
        qs.splice(toIndex, 0, moved);
        return { ...s, questions: qs };
      }),
    }));
  }, [updateFlow]);

  return {
    flow, setFlow, selectedStepId, setSelectedStepId, selectedStep,
    isDirty, setIsDirty,
    addStep, updateStep, deleteStep,
    addQuestion, updateQuestion, deleteQuestion, moveQuestion,
    addTransition, addAction, updateFlow,
  };
}

function createEmptyFlow(): FlowTree {
  const startId = `step-${v4Fallback().slice(0, 8)}`;
  return {
    flow: {
      id: v4Fallback(),
      name: "Nytt flöde",
      description: "",
      category: "",
      tags: [],
      start_step_id: startId,
      permissions: { roles: ["user"], groups: [] },
      ai_enabled: false,
      ai_mode: "off",
    },
    steps: [
      {
        id: startId,
        title: "Steg 1",
        description: "",
        type: "questions",
        questions: [],
        pre_actions: [],
        post_actions: [],
        transitions: [],
        ui: { columns: 1 },
      },
    ],
  };
}
