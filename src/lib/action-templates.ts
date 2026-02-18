import type { FlowAction, ActionType, ActionTrigger, ActionErrorHandling } from "@/lib/flow-engine/types";

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

export const DEFAULT_ACTION_TEMPLATES: ActionTemplate[] = [
  {
    id: "act-1",
    name: "Hämta platser",
    description: "Hämtar tillgängliga platser/kontor från POB",
    type: "lookup",
    trigger: "pre_step",
    input_template: { type: "locations" },
    output_mapping: { "lookups.locations": "result" },
    error_handling: { strategy: "retry", max_retries: 3, user_message: "Kunde inte hämta platser" },
    global: true,
    created_at: "2025-01-15",
  },
  {
    id: "act-2",
    name: "Kategorisera ärende",
    description: "AI-baserad kategorisering utifrån beskrivning",
    type: "enrichment",
    trigger: "on_change",
    trigger_question_id: "description",
    input_template: { text: "{{answers.description}}" },
    output_mapping: { "derived.suggestedCategory": "result.suggested_category" },
    error_handling: { strategy: "skip" },
    global: true,
    created_at: "2025-02-01",
  },
  {
    id: "act-3",
    name: "Skapa ärende i POB",
    description: "Skapar ett nytt ärende i ärendesystemet",
    type: "automation",
    trigger: "post_step",
    input_template: {
      title: "{{answers.title}}",
      description: "{{answers.description}}",
      category: "{{answers.category}}",
      priority: "{{answers.priority}}",
    },
    output_mapping: { "derived.ticketId": "result.id" },
    error_handling: { strategy: "stop", user_message: "Kunde inte skapa ärendet" },
    global: true,
    created_at: "2025-02-10",
  },
  {
    id: "act-4",
    name: "Skicka bekräftelse",
    description: "Skickar bekräftelsenotis till användaren",
    type: "notification",
    trigger: "post_step",
    input_template: { message: "Ditt ärende {{derived.ticketId}} har skapats" },
    output_mapping: {},
    error_handling: { strategy: "skip" },
    global: false,
    created_at: "2025-03-05",
  },
];

// Simple in-memory store with listeners for cross-component sync
let _actions: ActionTemplate[] = [...DEFAULT_ACTION_TEMPLATES];
const _listeners = new Set<() => void>();

export function getActionTemplates(): ActionTemplate[] {
  return _actions;
}

export function setActionTemplates(actions: ActionTemplate[]): void {
  _actions = actions;
  _listeners.forEach(fn => fn());
}

export function addActionTemplate(action: ActionTemplate): void {
  _actions = [..._actions, action];
  _listeners.forEach(fn => fn());
}

export function updateActionTemplate(id: string, updates: Partial<ActionTemplate>): void {
  _actions = _actions.map(a => a.id === id ? { ...a, ...updates } : a);
  _listeners.forEach(fn => fn());
}

export function deleteActionTemplate(id: string): void {
  _actions = _actions.filter(a => a.id !== id);
  _listeners.forEach(fn => fn());
}

export function subscribeActionTemplates(fn: () => void): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
