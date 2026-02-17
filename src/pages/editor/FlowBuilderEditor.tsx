import { useFlowBuilder } from "@/hooks/use-flow-builder";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  PlusCircle, Trash2, GripVertical, ArrowRight, Settings2,
  Eye, Save, ChevronRight, Zap, HelpCircle, GitBranch
} from "lucide-react";
import { toast } from "sonner";
import type { FlowStep, FlowQuestion, FlowTree, InputType, StepType } from "@/lib/flow-engine/types";
import { useState } from "react";

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
  const [viewMode, setViewMode] = useState<"graph" | "list">("list");

  const handleSave = () => {
    onSave?.(flow);
    builder.setIsDirty(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{flow.flow.name}</h1>
          <p className="text-sm text-muted-foreground">{flow.flow.description || "Ingen beskrivning"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onPreview?.(flow)}>
            <Eye className="mr-1 h-4 w-4" /> Förhandsgranska
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
          <Button size="sm" variant="outline" onClick={handleSave} disabled={!builder.isDirty || isSaving}>
            <Save className="mr-1 h-4 w-4" /> {isSaving ? "Sparar..." : "Spara"}
          </Button>
        </div>
      </div>

      {/* Flow settings */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Namn</Label>
              <Input
                value={flow.flow.name}
                onChange={e => builder.updateFlow(prev => ({ ...prev, flow: { ...prev.flow, name: e.target.value } }))}
              />
            </div>
            <div>
              <Label>Kategori</Label>
              <Input
                value={flow.flow.category}
                onChange={e => builder.updateFlow(prev => ({ ...prev, flow: { ...prev.flow, category: e.target.value } }))}
              />
            </div>
            <div>
              <Label>AI-läge</Label>
              <Select
                value={flow.flow.ai_mode}
                onValueChange={v => builder.updateFlow(prev => ({
                  ...prev,
                  flow: { ...prev.flow, ai_mode: v as any, ai_enabled: v !== "off" },
                }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Av</SelectItem>
                  <SelectItem value="suggestions">Förslag</SelectItem>
                  <SelectItem value="assist">Assistans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main editor area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Step list */}
        <div className="lg:col-span-1 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground">Steg</h2>
            <Button variant="outline" size="sm" onClick={() => builder.addStep()}>
              <PlusCircle className="mr-1 h-3 w-3" /> Lägg till
            </Button>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="space-y-1 pr-2">
              {flow.steps.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => setSelectedStepId(step.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedStepId === step.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{step.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {STEP_TYPES.find(t => t.value === step.type)?.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{step.questions.length} frågor</span>
                      </div>
                    </div>
                    {step.transitions.length > 0 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Step editor */}
        <div className="lg:col-span-2">
          {selectedStep ? (
            <StepEditor step={selectedStep} builder={builder} allSteps={flow.steps} />
          ) : (
            <Card className="h-[500px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <GitBranch className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Välj ett steg för att redigera</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StepEditor({ step, builder, allSteps }: {
  step: FlowStep;
  builder: ReturnType<typeof useFlowBuilder>;
  allSteps: FlowStep[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <Input
              value={step.title}
              onChange={e => builder.updateStep(step.id, { title: e.target.value })}
              className="text-lg font-heading font-semibold border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Stegtitel"
            />
            <Input
              value={step.description}
              onChange={e => builder.updateStep(step.id, { description: e.target.value })}
              className="text-sm text-muted-foreground border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Beskrivning..."
            />
          </div>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => builder.deleteStep(step.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Select value={step.type} onValueChange={v => builder.updateStep(step.id, { type: v as StepType })}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STEP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={String(step.ui.columns)}
            onValueChange={v => builder.updateStep(step.id, { ui: { ...step.ui, columns: Number(v) as 1 | 2 } })}
          >
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 kolumn</SelectItem>
              <SelectItem value="2">2 kolumner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="questions">
          <TabsList className="w-full">
            <TabsTrigger value="questions" className="flex-1">Frågor ({step.questions.length})</TabsTrigger>
            <TabsTrigger value="actions" className="flex-1">Actions ({step.pre_actions.length + step.post_actions.length})</TabsTrigger>
            <TabsTrigger value="transitions" className="flex-1">Övergångar ({step.transitions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-3">
            <ScrollArea className="h-[340px]">
              <div className="space-y-2 pr-2">
                {step.questions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={idx}
                    onUpdate={updates => builder.updateQuestion(step.id, q.id, updates)}
                    onDelete={() => builder.deleteQuestion(step.id, q.id)}
                    onMoveUp={idx > 0 ? () => builder.moveQuestion(step.id, idx, idx - 1) : undefined}
                    onMoveDown={idx < step.questions.length - 1 ? () => builder.moveQuestion(step.id, idx, idx + 1) : undefined}
                  />
                ))}
                {step.questions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Inga frågor ännu</p>
                )}
              </div>
            </ScrollArea>
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => builder.addQuestion(step.id)}>
              <PlusCircle className="mr-1 h-3 w-3" /> Lägg till fråga
            </Button>
          </TabsContent>

          <TabsContent value="actions" className="mt-3">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase mb-1">Pre-actions (körs vid stegöppning)</h4>
                {step.pre_actions.map(a => (
                  <div key={a.id} className="flex items-center gap-2 p-2 border rounded-md text-sm mb-1">
                    <Zap className="h-3 w-3 text-warning" />
                    <span className="flex-1">{a.name}</span>
                    <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => builder.addAction(step.id, "pre_step")}>
                  <PlusCircle className="mr-1 h-3 w-3" /> Lägg till pre-action
                </Button>
              </div>
              <Separator />
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase mb-1">Post-actions (körs vid "Nästa")</h4>
                {step.post_actions.map(a => (
                  <div key={a.id} className="flex items-center gap-2 p-2 border rounded-md text-sm mb-1">
                    <Zap className="h-3 w-3 text-info" />
                    <span className="flex-1">{a.name}</span>
                    <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => builder.addAction(step.id, "post_step")}>
                  <PlusCircle className="mr-1 h-3 w-3" /> Lägg till post-action
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transitions" className="mt-3">
            <div className="space-y-2">
              {step.transitions.map(t => (
                <div key={t.id} className="flex items-center gap-2 p-2 border rounded-md text-sm">
                  <ChevronRight className="h-3 w-3 text-primary" />
                  <span className="flex-1">
                    {t.is_default ? "Standard" : "Villkorad"} → {allSteps.find(s => s.id === t.next_step_id)?.title || t.next_step_id || "(ej valt)"}
                  </span>
                  {t.condition && (
                    <Badge variant="outline" className="text-[10px]">{t.condition.type}: {t.condition.field}</Badge>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => builder.addTransition(step.id)}>
                <PlusCircle className="mr-1 h-3 w-3" /> Lägg till övergång
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function QuestionCard({ question, index, onUpdate, onDelete, onMoveUp, onMoveDown }: {
  question: FlowQuestion;
  index: number;
  onUpdate: (u: Partial<FlowQuestion>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-3 bg-card">
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
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
          <Settings2 className="h-3 w-3" />
        </button>
        <button onClick={onDelete} className="text-destructive/60 hover:text-destructive">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t space-y-2">
          <div>
            <Label className="text-xs">Beskrivning</Label>
            <Input
              value={question.description || ""}
              onChange={e => onUpdate({ description: e.target.value })}
              placeholder="Hjälptext"
              className="h-7 text-xs"
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
