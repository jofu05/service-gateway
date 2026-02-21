import { describe, it, expect } from "vitest";
import { sampleCmdbGuidedIncidentFlow } from "@/lib/flow-engine/sample-flow";
import { evaluateCondition } from "@/lib/flow-engine/condition-evaluator";
import type { RuntimeContext } from "@/lib/flow-engine/types";

function makeCtx(answers: Record<string, any> = {}): RuntimeContext {
  return {
    user: { id: "u-1", displayName: "Anna Johansson", roles: ["user"], ad_groups: [] },
    answers,
    lookups: {},
    derived: {},
    cmdb: {},
    ai_suggestions: [],
    logs: [],
    current_step_id: "cmdb-step-1",
    step_history: ["cmdb-step-1"],
  };
}

const flow = sampleCmdbGuidedIncidentFlow;

function resolveTransition(stepId: string, ctx: RuntimeContext): string | null {
  const step = flow.steps.find(s => s.id === stepId);
  if (!step) return null;
  for (const t of step.transitions) {
    if (t.condition && evaluateCondition(t.condition, ctx)) return t.next_step_id;
  }
  const def = step.transitions.find(t => t.is_default);
  return def?.next_step_id ?? null;
}

describe("CMDB Guided Incident Flow", () => {
  it("has correct structure with 6 steps", () => {
    expect(flow.steps).toHaveLength(6);
    expect(flow.flow.start_step_id).toBe("cmdb-step-1");
  });

  it("step 1 transitions to step 2", () => {
    const ctx = makeCtx({ ciType: "device" });
    const next = resolveTransition("cmdb-step-1", ctx);
    expect(next).toBe("cmdb-step-2");
  });

  it("step 2 routes to device track (3a) when ciType=device", () => {
    const ctx = makeCtx({ ciType: "device" });
    const next = resolveTransition("cmdb-step-2", ctx);
    expect(next).toBe("cmdb-step-3a");
  });

  it("step 2 routes to application track (3b) when ciType=application", () => {
    const ctx = makeCtx({ ciType: "application" });
    const next = resolveTransition("cmdb-step-2", ctx);
    expect(next).toBe("cmdb-step-3b");
  });

  it("step 2 routes to system track (3c) when ciType=system", () => {
    const ctx = makeCtx({ ciType: "system" });
    const next = resolveTransition("cmdb-step-2", ctx);
    expect(next).toBe("cmdb-step-3c");
  });

  it("device track (3a) has dynamic deviceInstalledSoftware question", () => {
    const step3a = flow.steps.find(s => s.id === "cmdb-step-3a")!;
    const swQuestion = step3a.questions.find(q => q.id === "installedSoftware")!;
    expect(swQuestion.optionsMode).toBe("dynamic");
    expect(swQuestion.dynamicOptions?.source).toBe("deviceInstalledSoftware");
    expect(swQuestion.dynamicOptions?.dependsOn).toContain("deviceId");
  });

  it("system track (3c) has multiselect for servers, APIs, databases", () => {
    const step3c = flow.steps.find(s => s.id === "cmdb-step-3c")!;
    const serverQ = step3c.questions.find(q => q.id === "systemServers")!;
    const apiQ = step3c.questions.find(q => q.id === "systemApis")!;
    const dbQ = step3c.questions.find(q => q.id === "systemDatabases")!;
    expect(serverQ.input_type).toBe("multiselect");
    expect(apiQ.input_type).toBe("multiselect");
    expect(dbQ.input_type).toBe("multiselect");
    expect(serverQ.dynamicOptions?.source).toBe("systemServers");
    expect(apiQ.dynamicOptions?.source).toBe("systemApis");
    expect(dbQ.dynamicOptions?.source).toBe("systemDatabases");
  });

  it("all tracks lead to review step", () => {
    const ctx = makeCtx();
    expect(resolveTransition("cmdb-step-3a", ctx)).toBe("cmdb-step-review");
    expect(resolveTransition("cmdb-step-3b", ctx)).toBe("cmdb-step-review");
    expect(resolveTransition("cmdb-step-3c", ctx)).toBe("cmdb-step-review");
  });

  it("review step is type review", () => {
    const review = flow.steps.find(s => s.id === "cmdb-step-review")!;
    expect(review.type).toBe("review");
  });

  it("visibility conditions hide irrelevant questions in step 2", () => {
    const step2 = flow.steps.find(s => s.id === "cmdb-step-2")!;
    const deviceQ = step2.questions.find(q => q.id === "deviceId")!;
    const appQ = step2.questions.find(q => q.id === "applicationId")!;
    const sysQ = step2.questions.find(q => q.id === "systemId")!;

    const deviceCtx = makeCtx({ ciType: "device" });
    expect(evaluateCondition(deviceQ.visibility_conditions!, deviceCtx)).toBe(true);
    expect(evaluateCondition(appQ.visibility_conditions!, deviceCtx)).toBe(false);
    expect(evaluateCondition(sysQ.visibility_conditions!, deviceCtx)).toBe(false);

    const appCtx = makeCtx({ ciType: "application" });
    expect(evaluateCondition(deviceQ.visibility_conditions!, appCtx)).toBe(false);
    expect(evaluateCondition(appQ.visibility_conditions!, appCtx)).toBe(true);
  });
});
