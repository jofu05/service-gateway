import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, step, answers, flow_name } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (action === "suggestions") {
      return await handleSuggestions(step, answers, flow_name, LOVABLE_API_KEY);
    }
    if (action === "summary") {
      return await handleSummary(answers, flow_name, LOVABLE_API_KEY);
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("flow-ai error:", e);
    const status = e instanceof Response ? e.status : 500;
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

async function handleSuggestions(
  step: { title: string; questions: { id: string; label: string; required: boolean }[] },
  answers: Record<string, unknown>,
  flowName: string,
  apiKey: string,
) {
  const systemPrompt = `Du är en AI-assistent i ett svenskspråkigt ärendehanteringssystem (IT-serviceportal).
Du analyserar användarens svar och ger kontextuella förslag.

Regler:
- Svara ALLTID på svenska.
- Ge konkreta, hjälpsamma förslag.
- Inkludera confidence (0-1) för varje förslag.
- Var kortfattad.`;

  const userPrompt = `Flöde: "${flowName}"
Steg: "${step.title}"

Frågor i steget:
${step.questions.map((q) => `- ${q.id} (${q.label})${q.required ? " [obligatorisk]" : ""}`).join("\n")}

Nuvarande svar:
${JSON.stringify(answers, null, 2)}

Ge förslag baserat på svaren. Om beskrivningen nämner nyckelord, föreslå kategori. Identifiera saknade obligatoriska fält.`;

  const body = {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "provide_suggestions",
          description: "Return AI suggestions for the current step",
          parameters: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["category", "field_value", "checklist", "action"],
                    },
                    target_question_id: { type: "string" },
                    suggested_value: { type: "string" },
                    message: { type: "string" },
                    confidence: { type: "number" },
                    reason: { type: "string" },
                  },
                  required: ["type", "message", "confidence", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["suggestions"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "provide_suggestions" } },
  };

  const resp = await callGateway(body, apiKey);
  const data = await resp.json();

  // Extract from tool call
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  let suggestions: unknown[] = [];
  if (toolCall?.function?.arguments) {
    try {
      const parsed = JSON.parse(toolCall.function.arguments);
      suggestions = parsed.suggestions || [];
    } catch {
      console.error("Failed to parse tool call arguments");
    }
  }

  // Add IDs
  const withIds = (suggestions as Record<string, unknown>[]).map((s, i) => ({
    ...s,
    id: `ai-${Date.now()}-${i}`,
  }));

  return new Response(JSON.stringify({ suggestions: withIds }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleSummary(
  answers: Record<string, unknown>,
  flowName: string,
  apiKey: string,
) {
  const systemPrompt = `Du är en AI-assistent i ett ärendehanteringssystem. Sammanfatta ärendet kortfattat på svenska.`;

  const userPrompt = `Flöde: "${flowName}"

Alla ifyllda svar:
${JSON.stringify(answers, null, 2)}

Skriv en tydlig sammanfattning av ärendet. Lista de viktigaste punkterna.`;

  const body = {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "provide_summary",
          description: "Return a summary of the ticket",
          parameters: {
            type: "object",
            properties: {
              summary_text: { type: "string" },
              key_points: {
                type: "array",
                items: { type: "string" },
              },
              suggested_title: { type: "string" },
              suggested_priority: {
                type: "string",
                enum: ["Låg", "Medium", "Hög", "Kritisk"],
              },
            },
            required: ["summary_text", "key_points"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "provide_summary" } },
  };

  const resp = await callGateway(body, apiKey);
  const data = await resp.json();

  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  let summary = { summary_text: "", key_points: [] as string[] };
  if (toolCall?.function?.arguments) {
    try {
      summary = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse summary arguments");
    }
  }

  const suggestion = {
    id: `ai-summary-${Date.now()}`,
    type: "summary",
    message: `${summary.summary_text}\n\n${(summary.key_points || []).map((p: string) => `• ${p}`).join("\n")}`,
    confidence: 1.0,
    reason: "AI-genererad sammanfattning",
    ...(summary.suggested_title ? { suggested_title: summary.suggested_title } : {}),
    ...(summary.suggested_priority ? { suggested_priority: summary.suggested_priority } : {}),
  };

  return new Response(JSON.stringify({ suggestions: [suggestion] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callGateway(body: unknown, apiKey: string): Promise<Response> {
  const resp = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    if (resp.status === 429) {
      throw Object.assign(new Error("Rate limit – försök igen om en stund"), { status: 429 });
    }
    if (resp.status === 402) {
      throw Object.assign(new Error("Krediter slut – fyll på i Lovable-inställningarna"), { status: 402 });
    }
    const t = await resp.text();
    console.error("Gateway error:", resp.status, t);
    throw new Error("AI-gateway-fel");
  }

  return resp;
}
