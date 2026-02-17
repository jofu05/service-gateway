import type { ConditionExpression, RuntimeContext } from "./types";

/**
 * Resolves a dotted path like "answers.location" from context
 */
function resolvePath(ctx: RuntimeContext, path: string): any {
  const parts = path.split(".");
  let current: any = ctx;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Evaluates a condition expression against the current runtime context
 */
export function evaluateCondition(condition: ConditionExpression, ctx: RuntimeContext): boolean {
  switch (condition.type) {
    case "and":
      return (condition.children ?? []).every(c => evaluateCondition(c, ctx));
    case "or":
      return (condition.children ?? []).some(c => evaluateCondition(c, ctx));
    case "not":
      return !(condition.children ?? []).every(c => evaluateCondition(c, ctx));
    case "equals":
      return resolvePath(ctx, condition.field!) === condition.value;
    case "not_equals":
      return resolvePath(ctx, condition.field!) !== condition.value;
    case "contains": {
      const val = resolvePath(ctx, condition.field!);
      if (typeof val === "string") return val.includes(condition.value);
      if (Array.isArray(val)) return val.includes(condition.value);
      return false;
    }
    case "exists":
      return resolvePath(ctx, condition.field!) != null;
    case "gt":
      return Number(resolvePath(ctx, condition.field!)) > Number(condition.value);
    case "lt":
      return Number(resolvePath(ctx, condition.field!)) < Number(condition.value);
    case "gte":
      return Number(resolvePath(ctx, condition.field!)) >= Number(condition.value);
    case "lte":
      return Number(resolvePath(ctx, condition.field!)) <= Number(condition.value);
    case "has_role":
      return ctx.user.roles.includes(condition.value);
    case "in_group":
      return ctx.user.ad_groups.includes(condition.value);
    case "string_match": {
      const val = resolvePath(ctx, condition.field!);
      if (typeof val !== "string") return false;
      const pattern = condition.value;
      // Guard against ReDoS: reject overly long or dangerous patterns
      if (typeof pattern !== "string" || pattern.length > 100) return false;
      const dangerous = /\(([^)]*[+*])\)[+*]|\(\?[^)]*\)\{/;
      if (dangerous.test(pattern)) return false;
      try {
        return new RegExp(pattern).test(val);
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
}
