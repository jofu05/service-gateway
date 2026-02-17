import { useState } from "react";
import { useFlowRuntime } from "@/hooks/use-flow-runtime";
import type { FlowTree, FlowQuestion, AiSuggestion } from "@/lib/flow-engine/types";
import { evaluateCondition } from "@/lib/flow-engine/condition-evaluator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, ArrowRight, Send, Loader2, AlertCircle,
  Sparkles, CheckCircle2, X, ChevronRight, HelpCircle
} from "lucide-react";
import { toast } from "sonner";

interface FlowWizardProps {
  flowTree: FlowTree;
  onSubmit?: (answers: Record<string, any>) => void;
  onClose?: () => void;
}

export default function FlowWizard({ flowTree, onSubmit, onClose }: FlowWizardProps) {
  const runtime = useFlowRuntime(flowTree);
  const { ctx, currentStep, isFirstStep, isReviewStep, progress, isRunningActions, actionErrors } = runtime;
  const [showAiPanel, setShowAiPanel] = useState(flowTree.flow.ai_enabled);

  const handleSubmit = () => {
    onSubmit?.(ctx.answers);
    toast.success("Ärende inskickat!");
  };

  if (!currentStep) {
    return <div className="p-8 text-center text-muted-foreground">Flödet kunde inte laddas</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-heading font-semibold">{flowTree.flow.name}</span>
          <span className="text-muted-foreground">{currentStep.title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main wizard area */}
        <div className={showAiPanel ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">{currentStep.title}</CardTitle>
              {currentStep.description && (
                <p className="text-sm text-muted-foreground">{currentStep.description}</p>
              )}
              {currentStep.helptext && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-info/10 text-info text-sm mt-2">
                  <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{currentStep.helptext}</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isRunningActions && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted mb-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Kör åtgärder...</span>
                </div>
              )}

              {actionErrors.length > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 mb-4">
                  {actionErrors.map((err, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {isReviewStep ? (
                <ReviewView answers={ctx.answers} flowTree={flowTree} />
              ) : (
                <div className={`grid gap-4 ${currentStep.ui.columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                  {currentStep.questions.map(q => {
                    if (q.visibility_conditions && !evaluateCondition(q.visibility_conditions, ctx)) return null;
                    return (
                      <QuestionField
                        key={q.id}
                        question={q}
                        value={ctx.answers[q.id]}
                        onChange={v => runtime.setAnswer(q.id, v)}
                        lookups={ctx.lookups}
                      />
                    );
                  })}
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={runtime.goBack}
                  disabled={isFirstStep || isRunningActions}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Tillbaka
                </Button>

                <div className="flex gap-2">
                  {flowTree.flow.ai_enabled && (
                    <Button variant="ghost" size="sm" onClick={() => setShowAiPanel(!showAiPanel)}>
                      <Sparkles className="mr-1 h-4 w-4" /> AI
                    </Button>
                  )}
                  {isReviewStep ? (
                    <Button onClick={handleSubmit} disabled={isRunningActions}>
                      <Send className="mr-1 h-4 w-4" /> Skicka in
                    </Button>
                  ) : (
                    <Button onClick={() => runtime.goNext()} disabled={isRunningActions}>
                      Nästa <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestion Panel */}
        {showAiPanel && (
          <div className="lg:col-span-1">
            <AiSuggestionPanel
              suggestions={ctx.ai_suggestions}
              onAccept={runtime.acceptSuggestion}
              onDismiss={runtime.dismissSuggestion}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionField({ question, value, onChange, lookups }: {
  question: FlowQuestion;
  value: any;
  onChange: (v: any) => void;
  lookups: Record<string, any>;
}) {
  const val = value ?? question.default_value ?? "";

  // Resolve dynamic options
  let options = question.options || [];
  if (question.dynamic_options) {
    const lookupData = lookups[question.dynamic_options.action_id] || [];
    if (Array.isArray(lookupData)) {
      options = lookupData.map((item: any) => ({
        value: item[question.dynamic_options!.value_key] || item.id,
        label: item[question.dynamic_options!.label_key] || item.label,
      }));
    }
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {question.label}
        {question.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {question.description && (
        <p className="text-xs text-muted-foreground">{question.description}</p>
      )}

      {question.input_type === "text" && (
        <Input value={val} onChange={e => onChange(e.target.value)} placeholder={question.label} />
      )}
      {question.input_type === "textarea" && (
        <Textarea value={val} onChange={e => onChange(e.target.value)} placeholder={question.label} rows={3} />
      )}
      {question.input_type === "number" && (
        <Input type="number" value={val} onChange={e => onChange(e.target.value)} min={question.validation?.min} max={question.validation?.max} />
      )}
      {question.input_type === "date" && (
        <Input type="date" value={val} onChange={e => onChange(e.target.value)} />
      )}
      {(question.input_type === "select" || question.input_type === "autocomplete") && (
        <Select value={val} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="Välj..." /></SelectTrigger>
          <SelectContent>
            {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      {question.input_type === "radio" && (
        <div className="space-y-1">
          {options.map(o => (
            <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name={question.id} checked={val === o.value} onChange={() => onChange(o.value)} className="text-primary" />
              {o.label}
            </label>
          ))}
        </div>
      )}
      {question.input_type === "checkbox" && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={!!val} onChange={e => onChange(e.target.checked)} className="rounded" />
          {question.label}
        </label>
      )}
      {question.input_type === "multiselect" && (
        <div className="space-y-1">
          {options.map(o => (
            <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={Array.isArray(val) && val.includes(o.value)}
                onChange={e => {
                  const current = Array.isArray(val) ? val : [];
                  onChange(e.target.checked ? [...current, o.value] : current.filter((v: string) => v !== o.value));
                }}
                className="rounded"
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
      {question.input_type === "file" && (
        <Input type="file" onChange={e => onChange(e.target.files?.[0]?.name || "")} />
      )}
    </div>
  );
}

function ReviewView({ answers, flowTree }: { answers: Record<string, any>; flowTree: FlowTree }) {
  const allQuestions = flowTree.steps.flatMap(s => s.questions);
  const filledAnswers = Object.entries(answers).filter(([, v]) => v != null && v !== "");

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-semibold text-sm">Sammanfattning</h3>
      {filledAnswers.map(([key, value]) => {
        const q = allQuestions.find(q => q.id === key);
        return (
          <div key={key} className="flex items-start justify-between py-2 border-b border-border/50">
            <span className="text-sm font-medium">{q?.label || key}</span>
            <span className="text-sm text-muted-foreground text-right max-w-[60%]">{String(value)}</span>
          </div>
        );
      })}
      {filledAnswers.length === 0 && (
        <p className="text-sm text-muted-foreground">Inga svar att visa</p>
      )}
    </div>
  );
}

function AiSuggestionPanel({ suggestions, onAccept, onDismiss }: {
  suggestions: AiSuggestion[];
  onAccept: (s: AiSuggestion) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI-förslag
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Inga förslag just nu</p>
        )}
        {suggestions.map(s => (
          <div
            key={s.id}
            className={`p-3 rounded-lg border text-sm ${
              s.accepted ? "bg-success/5 border-success/30" : "bg-muted/50"
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <Badge variant="outline" className="text-[10px] px-1">{s.type}</Badge>
                  <span className="text-[10px] text-muted-foreground">{Math.round(s.confidence * 100)}%</span>
                </div>
                <p className="text-sm whitespace-pre-line">{s.message}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{s.reason}</p>
              </div>
            </div>
            {!s.accepted && (
              <div className="flex gap-1 mt-2">
                {s.suggested_value != null && (
                  <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => onAccept(s)}>
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Acceptera
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => onDismiss(s.id)}>
                  <X className="mr-1 h-3 w-3" /> Avfärda
                </Button>
              </div>
            )}
            {s.accepted && (
              <div className="flex items-center gap-1 mt-1 text-success text-xs">
                <CheckCircle2 className="h-3 w-3" /> Accepterat
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
