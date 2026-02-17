// ===== FLOW ENGINE DATA MODEL =====

// --- Core Flow ---
export interface FlowDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  start_step_id: string;
  permissions: { roles: string[]; groups: string[] };
  ai_enabled: boolean;
  ai_mode: "off" | "suggestions" | "assist";
}

// --- Step ---
export type StepType = "questions" | "info" | "action" | "review";

export interface StepLayout {
  columns: 1 | 2;
  sections?: { label: string; questionIds: string[] }[];
}

export interface FlowStep {
  id: string;
  title: string;
  description: string;
  helptext?: string;
  type: StepType;
  questions: FlowQuestion[];
  pre_actions: FlowAction[];
  post_actions: FlowAction[];
  transitions: TransitionRule[];
  ui: StepLayout;
}

// --- Question ---
export type InputType =
  | "text" | "textarea" | "number" | "date"
  | "select" | "multiselect" | "checkbox" | "radio"
  | "file" | "autocomplete" | "user" | "ci" | "location";

export interface QuestionValidation {
  regex?: string;
  min?: number;
  max?: number;
  custom_rules?: { expression: string; message: string }[];
}

export interface FlowQuestion {
  id: string;
  label: string;
  description?: string;
  required: boolean;
  default_value?: any;
  input_type: InputType;
  options?: { value: string; label: string; helptext?: string }[];
  validation?: QuestionValidation;
  dynamic_options?: { action_id: string; label_key: string; value_key: string };
  visibility_conditions?: ConditionExpression;
  computed?: { action_id: string; output_key: string };
  mapping_key?: string;
}

// --- Action ---
export type ActionType = "lookup" | "automation" | "validation" | "enrichment" | "notification";
export type ActionTrigger = "pre_step" | "post_step" | "on_change" | "manual";

export interface ActionErrorHandling {
  strategy: "retry" | "skip" | "stop";
  user_message?: string;
  max_retries?: number;
}

export interface FlowAction {
  id: string;
  name: string;
  type: ActionType;
  trigger: ActionTrigger;
  trigger_question_id?: string; // for on_change
  input_template: Record<string, string>; // e.g. { "query": "{{answers.searchText}}" }
  output_mapping: Record<string, string>; // e.g. { "answers.locationId": "result.id" }
  error_handling: ActionErrorHandling;
}

// --- Transition ---
export interface ConditionExpression {
  type: "and" | "or" | "equals" | "not_equals" | "contains" | "exists" | "gt" | "lt" | "gte" | "lte" | "has_role" | "in_group" | "string_match";
  field?: string;
  value?: any;
  children?: ConditionExpression[];
}

export interface TransitionRule {
  id: string;
  condition?: ConditionExpression;
  next_step_id: string;
  is_default?: boolean;
}

// --- Runtime Context ---
export interface AiSuggestion {
  id: string;
  type: "category" | "field_value" | "checklist" | "action" | "summary";
  target_question_id?: string;
  suggested_value?: any;
  message: string;
  confidence: number;
  reason: string;
  accepted?: boolean;
}

export interface RuntimeContext {
  user: {
    id: string;
    displayName: string;
    roles: string[];
    ad_groups: string[];
  };
  answers: Record<string, any>;
  lookups: Record<string, any>;
  derived: Record<string, any>;
  ai_suggestions: AiSuggestion[];
  logs: RuntimeLogEntry[];
  current_step_id: string;
  step_history: string[];
}

export interface RuntimeLogEntry {
  timestamp: string;
  type: "step_enter" | "step_leave" | "action_run" | "action_error" | "validation" | "ai_suggestion";
  step_id: string;
  detail: string;
  meta?: any;
}

// --- Full tree stored in flow_versions.tree_json ---
export interface FlowTree {
  flow: FlowDefinition;
  steps: FlowStep[];
}

// --- AI config stored in flow_versions.ai_config_json ---
export interface FlowAiConfig {
  hooks_enabled: {
    on_step_open: boolean;
    on_answer_change: boolean;
    on_review: boolean;
  };
  system_prompt?: string;
  policies?: {
    max_suggestions_per_step: number;
    require_user_accept: boolean;
  };
}
