import type { FlowAction, RuntimeContext, RuntimeLogEntry } from "./types";
import { pobApi } from "@/lib/mock-api";
import { cmdbGateway } from "@/lib/cmdb";

/**
 * Resolves template strings like "{{answers.searchText}}" against context
 */
function resolveTemplate(template: string, ctx: RuntimeContext): string {
  return template.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
    const parts = path.split(".");
    let current: any = ctx;
    for (const p of parts) {
      if (current == null) return "";
      current = current[p];
    }
    return String(current ?? "");
  });
}

function resolveInputs(inputTemplate: Record<string, string>, ctx: RuntimeContext): Record<string, any> {
  const resolved: Record<string, any> = {};
  for (const [key, tmpl] of Object.entries(inputTemplate)) {
    resolved[key] = resolveTemplate(tmpl, ctx);
  }
  return resolved;
}

function setPath(obj: any, path: string, value: any) {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * Mock action runner. In production, this calls the adapter API.
 */
export async function runAction(
  action: FlowAction,
  ctx: RuntimeContext
): Promise<{ success: boolean; result?: any; error?: string }> {
  const inputs = resolveInputs(action.input_template, ctx);

  const logEntry: RuntimeLogEntry = {
    timestamp: new Date().toISOString(),
    type: "action_run",
    step_id: ctx.current_step_id,
    detail: `Running action: ${action.name} (${action.type})`,
    meta: { action_id: action.id, inputs },
  };
  ctx.logs.push(logEntry);

  try {
    let result: any;

    switch (action.type) {
      case "lookup": {
        const lookupType = inputs.type || inputs.lookupType || "locations";

        // CMDB lookups
        if (lookupType === "cmdb.devices") {
          result = await cmdbGateway.getUserDevices(inputs.userId || undefined);
          break;
        }
        if (lookupType === "cmdb.systems") {
          result = inputs.query
            ? await cmdbGateway.searchSystems(inputs.query)
            : await cmdbGateway.getAllSystems();
          break;
        }
        if (lookupType === "cmdb.systemTree") {
          result = await cmdbGateway.getSystemTree(inputs.systemId || "sys-1");
          break;
        }
        if (lookupType === "cmdb.applications") {
          result = await cmdbGateway.getAllApplications();
          break;
        }
        if (lookupType === "cmdb.application") {
          result = await cmdbGateway.getApplication(inputs.applicationId || "app-1");
          break;
        }

        result = await pobApi.getLookups(lookupType);
        break;
      }
      case "validation": {
        // Simple mock validation
        const errors: string[] = [];
        for (const [field, rule] of Object.entries(inputs)) {
          if (rule === "required" && !ctx.answers[field]) {
            errors.push(`${field} är obligatoriskt`);
          }
        }
        result = { valid: errors.length === 0, errors };
        if (errors.length > 0) return { success: false, error: errors.join(", ") };
        break;
      }
      case "enrichment": {
        // Mock enrichment - suggest category based on text
        const text = (inputs.text || "").toLowerCase();
        let category = "IT-Support";
        if (text.includes("behörighet") || text.includes("åtkomst")) category = "Behörighet";
        if (text.includes("bestäl") || text.includes("licens")) category = "Beställning";
        if (text.includes("nät") || text.includes("vpn")) category = "Nätverk";
        result = { suggested_category: category, confidence: 0.8 };
        break;
      }
      case "automation": {
        // Mock automation
        result = await pobApi.createTicket({
          title: inputs.title || "Nytt ärende",
          description: inputs.description || "",
          category: inputs.category || "IT-Support",
          priority: inputs.priority || "Medium",
        });
        break;
      }
      case "notification": {
        // Mock notification
        result = { sent: true, message: inputs.message || "Notis skickad" };
        break;
      }
      default:
        return { success: false, error: `Unknown action type: ${action.type}` };
    }

    // Apply output mapping
    for (const [targetPath, sourceKey] of Object.entries(action.output_mapping)) {
      const value = typeof sourceKey === "string" && sourceKey.startsWith("result.")
        ? sourceKey.split(".").slice(1).reduce((obj: any, key) => obj?.[key], result)
        : result;
      setPath(ctx, targetPath, value);
    }

    return { success: true, result };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    ctx.logs.push({
      timestamp: new Date().toISOString(),
      type: "action_error",
      step_id: ctx.current_step_id,
      detail: `Action failed: ${action.name}: ${errorMsg}`,
      meta: { action_id: action.id },
    });
    return { success: false, error: errorMsg };
  }
}
