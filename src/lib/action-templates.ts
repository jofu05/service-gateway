import type { FlowAction, ActionType, ActionTrigger, ActionErrorHandling } from "@/lib/flow-engine/types";
import { supabase } from "@/integrations/supabase/client";

export interface ActionTemplate extends FlowAction {
  description: string;
  global: boolean;
  created_at: string;
}

export const ACTION_TYPES: { value: ActionType; label: string; description: string }[] = [
  { value: "lookup", label: "Datahämtning", description: "Hämta data från externt system" },
  { value: "automation", label: "Automatisering", description: "Skapa ärende eller utför åtgärd" },
  { value: "validation", label: "Validering", description: "Validera indata mot regler" },
  { value: "enrichment", label: "Berikning", description: "Berika data med AI eller logik" },
  { value: "notification", label: "Notifiering", description: "Skicka notis eller e-post" },
];

export const TRIGGER_TYPES: { value: ActionTrigger; label: string }[] = [
  { value: "pre_step", label: "Före steg" },
  { value: "post_step", label: "Efter steg" },
  { value: "on_change", label: "Vid ändring" },
  { value: "manual", label: "Manuell" },
];

export const ERROR_STRATEGIES: { value: ActionErrorHandling["strategy"]; label: string }[] = [
  { value: "retry", label: "Försök igen" },
  { value: "skip", label: "Hoppa över" },
  { value: "stop", label: "Stoppa flödet" },
];

// Convert DB row to ActionTemplate
function rowToTemplate(row: any): ActionTemplate {
  const errorConfig = (row.error_config as any) || {};
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    type: (row.type || "lookup") as ActionType,
    trigger: "pre_step" as ActionTrigger,
    input_template: (row.input_template as Record<string, any>) || {},
    output_mapping: (row.output_mapping as Record<string, any>) || {},
    error_handling: {
      strategy: errorConfig.strategy || "retry",
      max_retries: errorConfig.max_retries,
      user_message: errorConfig.user_message,
    },
    global: true,
    created_at: row.created_at?.split("T")[0] || "",
  };
}

// In-memory cache with listeners
let _actions: ActionTemplate[] = [];
let _loaded = false;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach(fn => fn());
}

export async function fetchActionTemplates(): Promise<ActionTemplate[]> {
  const { data, error } = await supabase
    .from("action_templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching action templates:", error);
    return _actions;
  }

  _actions = (data || []).map(rowToTemplate);
  _loaded = true;
  notify();
  return _actions;
}

export function getActionTemplates(): ActionTemplate[] {
  if (!_loaded) {
    fetchActionTemplates();
  }
  return _actions;
}

export async function createActionTemplate(template: ActionTemplate): Promise<ActionTemplate | null> {
  const { data, error } = await supabase
    .from("action_templates")
    .insert({
      name: template.name,
      description: template.description,
      type: template.type,
      method: "POST",
      endpoint: "",
      input_template: template.input_template as any,
      output_mapping: template.output_mapping as any,
      error_config: {
        strategy: template.error_handling.strategy,
        max_retries: template.error_handling.max_retries,
        user_message: template.error_handling.user_message,
        retry: template.error_handling.strategy === "retry",
      } as any,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating action template:", error);
    return null;
  }

  const created = rowToTemplate(data);
  _actions = [created, ..._actions];
  notify();
  return created;
}

export async function updateActionTemplate(id: string, template: Partial<ActionTemplate>): Promise<boolean> {
  const updates: any = {};
  if (template.name !== undefined) updates.name = template.name;
  if (template.description !== undefined) updates.description = template.description;
  if (template.type !== undefined) updates.type = template.type;
  if (template.input_template !== undefined) updates.input_template = template.input_template;
  if (template.output_mapping !== undefined) updates.output_mapping = template.output_mapping;
  if (template.error_handling !== undefined) {
    updates.error_config = {
      strategy: template.error_handling.strategy,
      max_retries: template.error_handling.max_retries,
      user_message: template.error_handling.user_message,
      retry: template.error_handling.strategy === "retry",
    };
  }

  const { error } = await supabase
    .from("action_templates")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating action template:", error);
    return false;
  }

  _actions = _actions.map(a => a.id === id ? { ...a, ...template } : a);
  notify();
  return true;
}

export async function deleteActionTemplate(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("action_templates")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting action template:", error);
    return false;
  }

  _actions = _actions.filter(a => a.id !== id);
  notify();
  return true;
}

// Keep subscribe for cross-component sync
export function subscribeActionTemplates(fn: () => void): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

// Legacy compat - no-op for setActionTemplates
export function setActionTemplates(_actions_: ActionTemplate[]): void {
  // No longer used - kept for compat
}
