import type { FlowTree, FlowAiConfig } from "./types";

export const sampleIncidentFlow: FlowTree = {
  flow: {
    id: "flow-incident-1",
    name: "IT-Support ärende",
    description: "Standardflöde för IT-supportärenden",
    category: "IT-Support",
    tags: ["incident", "support"],
    start_step_id: "step-1",
    permissions: { roles: ["user", "editor", "admin"], groups: [] },
    ai_enabled: true,
    ai_mode: "suggestions",
  },
  steps: [
    {
      id: "step-1",
      title: "Beskriv problemet",
      description: "Beskriv vad som hänt och vilken utrustning det gäller",
      type: "questions",
      questions: [
        {
          id: "title",
          label: "Rubrik",
          description: "Kort sammanfattning av problemet",
          required: true,
          input_type: "text",
          validation: { min: 5, max: 200 },
          mapping_key: "title",
        },
        {
          id: "problemDescription",
          label: "Beskrivning",
          description: "Beskriv problemet i detalj",
          required: true,
          input_type: "textarea",
          validation: { min: 10 },
          mapping_key: "description",
        },
        {
          id: "category",
          label: "Kategori",
          required: true,
          input_type: "select",
          options: [
            { value: "IT-Support", label: "IT-Support" },
            { value: "Behörighet", label: "Behörighet" },
            { value: "Beställning", label: "Beställning" },
            { value: "Nätverk", label: "Nätverk" },
          ],
          mapping_key: "category",
        },
      ],
      pre_actions: [],
      post_actions: [],
      transitions: [
        {
          id: "t1-network",
          condition: { type: "equals", field: "answers.category", value: "Nätverk" },
          next_step_id: "step-network",
        },
        {
          id: "t1-default",
          next_step_id: "step-2",
          is_default: true,
        },
      ],
      ui: { columns: 1 },
    },
    {
      id: "step-network",
      title: "Nätverksinformation",
      description: "Specifik information om nätverksproblemet",
      type: "questions",
      questions: [
        {
          id: "networkType",
          label: "Typ av nätverk",
          required: true,
          input_type: "radio",
          options: [
            { value: "vpn", label: "VPN" },
            { value: "wifi", label: "Wi-Fi" },
            { value: "lan", label: "Trådat nätverk" },
          ],
        },
        {
          id: "location",
          label: "Plats",
          required: false,
          input_type: "autocomplete",
          dynamic_options: { action_id: "lookup-locations", label_key: "label", value_key: "id" },
        },
      ],
      pre_actions: [
        {
          id: "lookup-locations",
          name: "Hämta platser",
          type: "lookup",
          trigger: "pre_step",
          input_template: { type: "locations" },
          output_mapping: { "lookups.locations": "result" },
          error_handling: { strategy: "skip", user_message: "Kunde inte hämta platser" },
        },
      ],
      post_actions: [],
      transitions: [{ id: "tn-default", next_step_id: "step-2", is_default: true }],
      ui: { columns: 1 },
    },
    {
      id: "step-2",
      title: "Prioritet och detaljer",
      description: "Ange prioritet och ytterligare information",
      type: "questions",
      questions: [
        {
          id: "priority",
          label: "Prioritet",
          required: true,
          input_type: "select",
          options: [
            { value: "Låg", label: "Låg" },
            { value: "Medium", label: "Medium" },
            { value: "Hög", label: "Hög" },
            { value: "Kritisk", label: "Kritisk" },
          ],
          mapping_key: "priority",
        },
        {
          id: "affectedUsers",
          label: "Antal berörda användare",
          required: false,
          input_type: "number",
          validation: { min: 1, max: 10000 },
        },
        {
          id: "attachment",
          label: "Bifoga fil (valfritt)",
          required: false,
          input_type: "file",
        },
      ],
      pre_actions: [],
      post_actions: [
        {
          id: "enrich-category",
          name: "Föreslå kategori",
          type: "enrichment",
          trigger: "post_step",
          input_template: { text: "{{answers.problemDescription}}" },
          output_mapping: { "derived.suggestedCategory": "result.suggested_category" },
          error_handling: { strategy: "skip" },
        },
      ],
      transitions: [{ id: "t2-default", next_step_id: "step-review", is_default: true }],
      ui: { columns: 2 },
    },
    {
      id: "step-review",
      title: "Granska och skicka",
      description: "Kontrollera att allt stämmer innan du skickar in ärendet",
      type: "review",
      questions: [],
      pre_actions: [],
      post_actions: [],
      transitions: [],
      ui: { columns: 1 },
    },
  ],
};

export const sampleAiConfig: FlowAiConfig = {
  hooks_enabled: {
    on_step_open: true,
    on_answer_change: true,
    on_review: true,
  },
  system_prompt: "Du är en hjälpsam IT-support assistent för kommunens ärendehantering.",
  policies: {
    max_suggestions_per_step: 5,
    require_user_accept: true,
  },
};
