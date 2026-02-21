// ===== CMDB Dynamic Options Provider =====
// Resolves dynamic options for flow questions at runtime
import type { CmdbDynamicSource, DynamicOptionsConfig } from "@/lib/flow-engine/types";
import type { RuntimeContext } from "@/lib/flow-engine/types";
import * as gateway from "./gateway";

function resolveParams(params: Record<string, string>, ctx: RuntimeContext): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [key, tmpl] of Object.entries(params)) {
    resolved[key] = tmpl.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
      const parts = path.split(".");
      let current: any = ctx;
      for (const p of parts) {
        if (current == null) return "";
        current = current[p];
      }
      return String(current ?? "");
    });
  }
  return resolved;
}

function resolveLabel(item: any, config: DynamicOptionsConfig): string {
  if (config.labelTemplate) {
    return config.labelTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => String(item[key] ?? ""));
  }
  const labelPath = config.labelPath || "name";
  return String(item[labelPath] ?? item.name ?? item.id ?? "");
}

function resolveValue(item: any, config: DynamicOptionsConfig): string {
  const valuePath = config.valuePath || "id";
  return String(item[valuePath] ?? item.id ?? "");
}

function applyFilters(items: any[], filters: DynamicOptionsConfig["filter"], ctx: RuntimeContext): any[] {
  if (!filters || filters.length === 0) return items;
  return items.filter(item => {
    return filters.every(f => {
      const fieldVal = String(item[f.field] ?? "");
      const filterVal = f.value.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
        const parts = path.split(".");
        let current: any = ctx;
        for (const p of parts) {
          if (current == null) return "";
          current = current[p];
        }
        return String(current ?? "");
      });
      switch (f.op) {
        case "eq": return fieldVal === filterVal;
        case "contains": return fieldVal.toLowerCase().includes(filterVal.toLowerCase());
        case "in": return filterVal.split(",").map(s => s.trim()).includes(fieldVal);
        default: return true;
      }
    });
  });
}

export async function fetchDynamicOptions(
  config: DynamicOptionsConfig,
  ctx: RuntimeContext
): Promise<{ value: string; label: string }[]> {
  const params = config.params ? resolveParams(config.params, ctx) : {};
  let items: any[] = [];

  switch (config.source) {
    case "userDevices":
      // Prefer user-scoped data from ctx.cmdb if available
      if (ctx.cmdb?.devices && (!params.userId || params.userId === ctx.user?.id)) {
        items = ctx.cmdb.devices;
      } else {
        items = await gateway.getUserDevices(params.userId || undefined);
      }
      break;
    case "userSystems":
      if (ctx.cmdb?.systemAccess) {
        items = ctx.cmdb.systemAccess;
      } else {
        items = await gateway.getAllSystems();
      }
      break;
    case "userApplications":
      if (ctx.cmdb?.applications) {
        items = ctx.cmdb.applications;
      } else {
        items = await gateway.getAllApplications();
      }
      break;
    case "deviceInstalledSoftware":
      items = await gateway.getDeviceInstalledSoftware(params.deviceId || "");
      break;
    case "systemServers": {
      const tree = await gateway.getSystemTree(params.systemId || "");
      items = tree?.servers || [];
      break;
    }
    case "systemDatabases": {
      const tree = await gateway.getSystemTree(params.systemId || "");
      const serverDbs = tree?.servers.flatMap(s => s.databases) || [];
      const directDbs = tree?.databases_direct || [];
      items = [...serverDbs, ...directDbs];
      break;
    }
    case "systemApis": {
      const tree = await gateway.getSystemTree(params.systemId || "");
      items = tree?.apis || [];
      break;
    }
  }

  items = applyFilters(items, config.filter, ctx);

  return items.map(item => ({
    value: resolveValue(item, config),
    label: resolveLabel(item, config),
  }));
}

// Cache key for question options
export function optionsCacheKey(questionId: string, params: Record<string, string>): string {
  return `${questionId}:${JSON.stringify(params)}`;
}
