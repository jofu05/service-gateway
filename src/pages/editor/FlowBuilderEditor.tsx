import { useFlowBuilder } from "@/hooks/use-flow-builder";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  PlusCircle, Trash2, ArrowRight, Settings2,
  Eye, Save, ChevronRight, ChevronDown, Zap, GitBranch,
  Filter, MessageSquare, X, Settings
} from "lucide-react";
import { toast } from "sonner";
import type { FlowStep, FlowQuestion, FlowTree, InputType, StepType } from "@/lib/flow-engine/types";
import { useState } from "react";
import RuleBuilder from "@/components/editor/RuleBuilder";
import { TextWithVariables } from "@/components/editor/VariablePicker";
import FlowCanvas from "@/components/editor/FlowCanvas";

const INPUT_TYPES: { value: InputType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textområde" },
  { value: "number", label: "Nummer" },
  { value: "date", label: "Datum" },
  { value: "select", label: "Dropdown" },
  { value: "multiselect", label: "Flerval" },
  { value: "checkbox", label: "Kryssruta" },
  { value: "radio", label: "Radioknapp" },
  { value: "file", label: "Fil" },
  { value: "autocomplete", label: "Autocomplete" },
  { value: "info", label: "Informationstext" },
];

const STEP_TYPES: { value: StepType; label: string }[] = [
  { value: "questions", label: "Frågor" },
  { value: "info", label: "Information" },
  { value: "action", label: "Åtgärd" },
  { value: "review", label: "Granska" },
];

interface FlowBuilderEditorProps {
  flowId?: string;
  initialTree?: FlowTree;
  onSave?: (tree: FlowTree) => void;
  isSaving?: boolean;
  onPreview?: (tree: FlowTree) => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  versionStatus?: string;
}

export default function FlowBuilderEditor({ flowId, initialTree, onSave, isSaving, onPreview, onPublish, isPublishing, versionStatus }: FlowBuilderEditorProps) {
  const builder = useFlowBuilder(initialTree);
  const { flow, selectedStep, selectedStepId, setSelectedStepId } = builder;
  const [showSettings, setShowSettings] = useState(false);

  const handleSave = () => {
    onSave?.(flow);
    builder.setIsDirty(false);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col animate-fade-in">
      {/* Compact header toolbar */}
      <div className="flex items-center justify-between border-b bg-card px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <GitBranch className="h-5 w-5 text-primary shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base font-heading font-bold truncate">{flow.flow.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{flow.flow.description || "Ingen beskrivning"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} className="gap-1.5">
            <Settings className="h-4 w-4" /> Inställningar
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm" onClick={() => onPreview?.(flow)} className="gap-1.5">
            <Eye className="h-4 w-4" /> Förhandsgranska
          </Button>
          {onPublish && (
            <Button
              variant={versionStatus === "published" ? "secondary" : "default"}
              size="sm"
              onClick={onPublish}
              disabled={isPublishing || builder.isDirty}
            >
              {isPublishing ? "Publicerar..." : versionStatus === "published" ? "✓ Publicerad" : "Publicera"}
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={!builder.isDirty || isSaving} className="gap-1.5">
            <Save className="h-4 w-4" /> {isSaving ? "Sparar..." : "Spara"}
          </Button>
        </div>
      </div>

      {/* Flow settings panel (collapsible) */}
      {showSettings && (
        <div className="border-b bg-muted/30 px-4 py-3 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-w-3xl">
            <div>
              <Label className="text-xs">Namn</Label>
              <Input
                value={flow.flow.name}
                onChange={e => builder.updateFlow(prev => ({ ...prev, flow: { ...prev.flow, name: e.target.value } }))}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Beskrivning</Label>
              <Input
                value={flow.flow.description}
                onChange={e => builder.updateFlow(prev => ({ ...prev, flow: { ...prev.flow, description: e.target.value } }))}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Kategori</Label>
              <Input
                value={flow.flow.category}
                onChange={e => builder.updateFlow(prev => ({ ...prev, flow: { ...prev.flow, category: e.target.value } }))}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">AI-läge</Label>
              <Select
                value={flow.flow.ai_mode}
                onValueChange={v => builder.updateFlow(prev => ({
                  ...prev,
                  flow: { ...prev.flow, ai_mode: v as any, ai_enabled: v !== "off" },
                }))}
              >
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Av</SelectItem>
                  <SelectItem value="suggestions">Förslag</SelectItem>
                  <SelectItem value="assist">Assistans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Main area: Canvas + Side panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 overflow-auto bg-muted/20">
          <ScrollArea className="h-full">
            <FlowCanvas
              flow={flow}
              selectedStepId={selectedStepId}
              onSelectStep={setSelectedStepId}
              onAddStep={() => builder.addStep()}
            />
          </ScrollArea>
        </div>

        {/* Step editor side panel */}
        {selectedStep && (
          <div className="w-[480px] border-l bg-card shrink-0 flex flex-col overflow-hidden animate-in slide-in-from-right-5 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {flow.steps.findIndex(s => s.id === selectedStepId) + 1}
                </span>
                <h2 className="font-heading font-semibold text-sm">Redigera steg</h2>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedStepId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                <StepEditor step={selectedStep} builder={builder} allSteps={flow.steps} flowTree={flow} />
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}

function StepEditor({ step, builder, allSteps, flowTree }: {
  step: FlowStep;
  builder: ReturnType<typeof useFlowBuilder>;
  allSteps: FlowStep[];
  flowTree: FlowTree;
}) {
  return (
    <div className="space-y-4">
      {/* Step header fields */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Stegtitel</Label>
          <TextWithVariables
            value={step.title}
            onChange={v => builder.updateStep(step.id, { title: v })}
            placeholder="Stegtitel (stöder {{variabler}})"
            flowTree={flowTree}
            currentStepId={step.id}
          />
        </div>
        <div>
          <Label className="text-xs">Beskrivning</Label>
          <TextWithVariables
            value={step.description}
            onChange={v => builder.updateStep(step.id, { description: v })}
            placeholder="Beskrivning"
            flowTree={flowTree}
            currentStepId={step.id}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-xs">Typ</Label>
            <Select value={step.type} onValueChange={v => builder.updateStep(step.id, { type: v as StepType })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STEP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-24">
            <Label className="text-xs">Kolumner</Label>
            <Select
              value={String(step.ui.columns)}
              onValueChange={v => builder.updateStep(step.id, { ui: { ...step.ui, columns: Number(v) as 1 | 2 } })}
            >
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => builder.deleteStep(step.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Hjälptext</Label>
          <TextWithVariables
            value={step.helptext || ""}
            onChange={v => builder.updateStep(step.id, { helptext: v })}
            placeholder="Hej {{user.displayName}}, fyll i nedan..."
            flowTree={flowTree}
            currentStepId={step.id}
          />
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="questions">
        <TabsList className="w-full">
          <TabsTrigger value="questions" className="flex-1 gap-1">
            <MessageSquare className="h-3 w-3" />
            Frågor ({step.questions.length})
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex-1 gap-1">
            <Filter className="h-3 w-3" />
            Regler ({step.transitions.filter(t => t.condition).length})
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex-1 gap-1">
            <Zap className="h-3 w-3" />
            Åtgärder ({step.pre_actions.length + step.post_actions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-3 space-y-2">
          {step.questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              onUpdate={updates => builder.updateQuestion(step.id, q.id, updates)}
              onDelete={() => builder.deleteQuestion(step.id, q.id)}
              onMoveUp={idx > 0 ? () => builder.moveQuestion(step.id, idx, idx - 1) : undefined}
              onMoveDown={idx < step.questions.length - 1 ? () => builder.moveQuestion(step.id, idx, idx + 1) : undefined}
              flowTree={flowTree}
              currentStepId={step.id}
            />
          ))}
          {step.questions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Inga frågor ännu</p>
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={() => builder.addQuestion(step.id)}>
            <PlusCircle className="mr-1 h-3 w-3" /> Lägg till fråga
          </Button>
        </TabsContent>

        <TabsContent value="rules" className="mt-3">
          <TransitionEditor
            step={step}
            allSteps={allSteps}
            flowTree={flowTree}
            onAddTransition={() => builder.addTransition(step.id)}
            onUpdateTransition={(tId, updates) => {
              builder.updateStep(step.id, {
                transitions: step.transitions.map(t => t.id === tId ? { ...t, ...updates } : t),
              });
            }}
            onDeleteTransition={(tId) => {
              builder.updateStep(step.id, {
                transitions: step.transitions.filter(t => t.id !== tId),
              });
            }}
          />
        </TabsContent>

        <TabsContent value="actions" className="mt-3 space-y-3">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase mb-1">Vid stegöppning</h4>
            {step.pre_actions.map(a => (
              <div key={a.id} className="flex items-center gap-2 p-2 border rounded-md text-sm mb-1">
                <Zap className="h-3 w-3 text-warning" />
                <span className="flex-1">{a.name}</span>
                <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => builder.addAction(step.id, "pre_step")}>
              <PlusCircle className="mr-1 h-3 w-3" /> Lägg till
            </Button>
          </div>
          <Separator />
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase mb-1">Vid "Nästa"</h4>
            {step.post_actions.map(a => (
              <div key={a.id} className="flex items-center gap-2 p-2 border rounded-md text-sm mb-1">
                <Zap className="h-3 w-3 text-info" />
                <span className="flex-1">{a.name}</span>
                <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => builder.addAction(step.id, "post_step")}>
              <PlusCircle className="mr-1 h-3 w-3" /> Lägg till
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TransitionEditor({ step, allSteps, flowTree, onAddTransition, onUpdateTransition, onDeleteTransition }: {
  step: FlowStep;
  allSteps: FlowStep[];
  flowTree: FlowTree;
  onAddTransition: () => void;
  onUpdateTransition: (id: string, updates: any) => void;
  onDeleteTransition: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Bestäm vad som händer när användaren klickar "Nästa". Utan regler går flödet till nästa steg i ordningen.
      </p>

      {step.transitions.map((t, i) => (
        <div key={t.id} className="border rounded-lg p-3 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <Badge variant={t.is_default ? "secondary" : "outline"} className="text-[11px]">
              {t.is_default ? "Standard" : `Regel ${i + 1}`}
            </Badge>
            <div className="flex items-center gap-1">
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={t.is_default || false}
                  onChange={e => onUpdateTransition(t.id, { is_default: e.target.checked, condition: e.target.checked ? undefined : t.condition })}
                  className="rounded"
                />
                Standard
              </label>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive/60 hover:text-destructive" onClick={() => onDeleteTransition(t.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!t.is_default && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">När detta villkor uppfylls:</Label>
              <RuleBuilder
                condition={t.condition}
                onChange={c => onUpdateTransition(t.id, { condition: c })}
                flowTree={flowTree}
                currentStepId={step.id}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground shrink-0">Gå till:</span>
            <Select value={t.next_step_id || ""} onValueChange={v => onUpdateTransition(t.id, { next_step_id: v })}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Välj steg..." />
              </SelectTrigger>
              <SelectContent>
                {allSteps.filter(s => s.id !== step.id).map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    Steg {allSteps.indexOf(s) + 1}: {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full" onClick={onAddTransition}>
        <PlusCircle className="mr-1 h-3 w-3" /> Lägg till navigeringsregel
      </Button>
    </div>
  );
}

function QuestionCard({ question, index, onUpdate, onDelete, onMoveUp, onMoveDown, flowTree, currentStepId }: {
  question: FlowQuestion;
  index: number;
  onUpdate: (u: Partial<FlowQuestion>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  flowTree: FlowTree;
  currentStepId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasVisibility = !!question.visibility_conditions;

  return (
    <div className={`border rounded-lg p-3 bg-card ${hasVisibility ? "border-l-2 border-l-accent" : ""}`}>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          {onMoveUp && <button onClick={onMoveUp} className="text-muted-foreground hover:text-foreground text-xs">▲</button>}
          {onMoveDown && <button onClick={onMoveDown} className="text-muted-foreground hover:text-foreground text-xs">▼</button>}
        </div>
        <div className="flex-1 min-w-0">
          <Input
            value={question.label}
            onChange={e => onUpdate({ label: e.target.value })}
            className="h-7 text-sm border-none p-0 focus-visible:ring-0"
          />
        </div>
        <Select value={question.input_type} onValueChange={v => onUpdate({ input_type: v as InputType })}>
          <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {INPUT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={question.required}
            onChange={e => onUpdate({ required: e.target.checked })}
            className="rounded"
          />
          Obl.
        </label>
        {hasVisibility && (
          <Badge variant="outline" className="text-[10px] border-accent text-accent">
            <Filter className="mr-0.5 h-2.5 w-2.5" /> Villkor
          </Badge>
        )}
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <Settings2 className="h-3 w-3" />}
        </button>
        <button onClick={onDelete} className="text-destructive/60 hover:text-destructive">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div>
            <Label className="text-xs">Beskrivning / hjälptext</Label>
            <TextWithVariables
              value={question.description || ""}
              onChange={v => onUpdate({ description: v })}
              placeholder="Hjälptext (stöder {{variabler}})"
              flowTree={flowTree}
              currentStepId={currentStepId}
            />
          </div>
          <div>
            <Label className="text-xs">Standardvärde</Label>
            <TextWithVariables
              value={question.default_value ?? ""}
              onChange={v => onUpdate({ default_value: v })}
              placeholder="T.ex. {{answers.q-xxx}} eller fast värde"
              flowTree={flowTree}
              currentStepId={currentStepId}
            />
          </div>
          <div>
            <Label className="text-xs">Mapping-nyckel (POB)</Label>
            <Input
              value={question.mapping_key || ""}
              onChange={e => onUpdate({ mapping_key: e.target.value })}
              placeholder="t.ex. title, description"
              className="h-7 text-xs"
            />
          </div>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground w-full">
              <Filter className="h-3 w-3" />
              Visa frågan bara om...
              <ChevronRight className="h-3 w-3 ml-auto" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <RuleBuilder
                condition={question.visibility_conditions}
                onChange={c => onUpdate({ visibility_conditions: c })}
                flowTree={flowTree}
                currentStepId={currentStepId}
                compact
              />
            </CollapsibleContent>
          </Collapsible>

          {(question.input_type === "select" || question.input_type === "radio" || question.input_type === "multiselect" || question.input_type === "checkbox") && (
            <div className="space-y-2">
              <Label className="text-xs">Alternativ</Label>
              {(question.options || []).map((opt, oi) => (
                <div key={oi} className="flex items-start gap-1.5 bg-muted/50 rounded-md p-2">
                  <div className="flex-1 space-y-1">
                    <Input
                      value={opt.label}
                      onChange={e => {
                        const opts = [...(question.options || [])];
                        opts[oi] = { ...opts[oi], label: e.target.value, value: e.target.value };
                        onUpdate({ options: opts });
                      }}
                      placeholder="Alternativtext"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={opt.helptext || ""}
                      onChange={e => {
                        const opts = [...(question.options || [])];
                        opts[oi] = { ...opts[oi], helptext: e.target.value };
                        onUpdate({ options: opts });
                      }}
                      placeholder="Hjälptext (valfritt)"
                      className="h-6 text-[11px] text-muted-foreground border-dashed"
                    />
                    <Input
                      type="number"
                      value={opt.cost ?? ""}
                      onChange={e => {
                        const opts = [...(question.options || [])];
                        opts[oi] = { ...opts[oi], cost: e.target.value ? Number(e.target.value) : undefined };
                        onUpdate({ options: opts });
                      }}
                      placeholder="Kostnad (valfritt)"
                      className="h-6 text-[11px] text-muted-foreground border-dashed"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const opts = (question.options || []).filter((_, j) => j !== oi);
                      onUpdate({ options: opts });
                    }}
                    className="text-destructive/60 hover:text-destructive mt-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs w-full"
                onClick={() => {
                  const opts = [...(question.options || []), { value: "", label: "", helptext: "", cost: undefined }];
                  onUpdate({ options: opts });
                }}
              >
                <PlusCircle className="mr-1 h-3 w-3" /> Lägg till alternativ
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
