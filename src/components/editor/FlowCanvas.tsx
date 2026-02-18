import { useRef, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PlusCircle, MessageSquare, Info, Zap, ClipboardCheck,
  ArrowDown, Filter, GitBranch
} from "lucide-react";
import type { FlowStep, FlowTree, StepType } from "@/lib/flow-engine/types";

const STEP_TYPE_CONFIG: Record<StepType, { icon: typeof MessageSquare; label: string; color: string; bgColor: string }> = {
  questions: { icon: MessageSquare, label: "Frågor", color: "text-primary", bgColor: "bg-primary/10" },
  info: { icon: Info, label: "Information", color: "text-info", bgColor: "bg-info/10" },
  action: { icon: Zap, label: "Åtgärd", color: "text-warning", bgColor: "bg-warning/10" },
  review: { icon: ClipboardCheck, label: "Granska", color: "text-accent", bgColor: "bg-accent/10" },
};

interface FlowCanvasProps {
  flow: FlowTree;
  selectedStepId: string | null;
  onSelectStep: (id: string) => void;
  onAddStep: () => void;
}

export default function FlowCanvas({ flow, selectedStepId, onSelectStep, onAddStep }: FlowCanvasProps) {
  const steps = flow.steps;

  // Build transition map for arrows
  const transitionMap = useMemo(() => {
    const map: Array<{ fromIndex: number; toIndex: number; hasCondition: boolean }> = [];
    steps.forEach((step, fromIdx) => {
      step.transitions.forEach(t => {
        const toIdx = steps.findIndex(s => s.id === t.next_step_id);
        if (toIdx >= 0) {
          map.push({ fromIndex: fromIdx, toIndex: toIdx, hasCondition: !!t.condition });
        }
      });
    });
    return map;
  }, [steps]);

  return (
    <div className="relative flex flex-col items-center py-6 px-4 min-h-[500px]">
      {/* Start indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shadow-md">
          <GitBranch className="h-4 w-4 text-accent-foreground" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">Start</span>
      </div>

      {steps.map((step, i) => {
        const config = STEP_TYPE_CONFIG[step.type];
        const Icon = config.icon;
        const isSelected = step.id === selectedStepId;
        const hasConditions = step.transitions.some(t => t.condition);
        const hasActions = step.pre_actions.length + step.post_actions.length > 0;
        const isStart = flow.flow.start_step_id === step.id;

        // Check for non-sequential transitions (branches)
        const branches = step.transitions.filter(t => {
          const targetIdx = steps.findIndex(s => s.id === t.next_step_id);
          return targetIdx >= 0 && targetIdx !== i + 1;
        });

        return (
          <div key={step.id} className="flex flex-col items-center w-full max-w-md">
            {/* Connector arrow from previous */}
            {i > 0 && (
              <div className="flex flex-col items-center my-1">
                <div className="w-0.5 h-4 bg-border" />
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground -mt-1" />
              </div>
            )}

            {/* Step node */}
            <button
              onClick={() => onSelectStep(step.id)}
              className={`
                w-full relative group transition-all duration-200 rounded-xl border-2 p-4 text-left
                hover:shadow-lg hover:-translate-y-0.5
                ${isSelected
                  ? "border-primary shadow-lg shadow-primary/10 bg-card ring-2 ring-primary/20"
                  : "border-border bg-card hover:border-primary/40"
                }
              `}
            >
              {/* Step number badge */}
              <div className="absolute -top-3 -left-2">
                <div className={`
                  h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm
                  ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                `}>
                  {i + 1}
                </div>
              </div>

              {/* Start badge */}
              {isStart && (
                <div className="absolute -top-2.5 right-2">
                  <Badge className="text-[9px] h-5 bg-accent text-accent-foreground border-0">
                    START
                  </Badge>
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className={`${config.bgColor} rounded-lg p-2 shrink-0`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight truncate">{step.title}</h3>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{step.description}</p>
                  )}

                  {/* Meta info row */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] h-5 gap-1">
                      <Icon className="h-2.5 w-2.5" />
                      {config.label}
                    </Badge>
                    {step.questions.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {step.questions.length} {step.questions.length === 1 ? "fråga" : "frågor"}
                      </Badge>
                    )}
                    {hasConditions && (
                      <Badge variant="outline" className="text-[10px] h-5 gap-1 border-accent/50 text-accent">
                        <Filter className="h-2.5 w-2.5" /> Villkor
                      </Badge>
                    )}
                    {hasActions && (
                      <Badge variant="outline" className="text-[10px] h-5 gap-1 border-warning/50 text-warning">
                        <Zap className="h-2.5 w-2.5" /> {step.pre_actions.length + step.post_actions.length}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Selection indicator */}
                <div className={`
                  w-2 h-2 rounded-full shrink-0 mt-1 transition-colors
                  ${isSelected ? "bg-primary" : "bg-transparent group-hover:bg-primary/30"}
                `} />
              </div>

              {/* Branch indicators */}
              {branches.length > 0 && (
                <div className="mt-2 pt-2 border-t border-dashed border-border/60">
                  {branches.map((t, ti) => {
                    const targetStep = steps.find(s => s.id === t.next_step_id);
                    return (
                      <div key={ti} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <GitBranch className="h-2.5 w-2.5 text-accent" />
                        <span>
                          {t.condition ? "Om villkor →" : "→"} {targetStep?.title ?? "?"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </button>
          </div>
        );
      })}

      {/* Add step button */}
      <div className="flex flex-col items-center mt-1">
        <div className="w-0.5 h-4 bg-border" />
        <Button
          variant="outline"
          size="sm"
          onClick={onAddStep}
          className="rounded-full border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all gap-1.5 mt-1"
        >
          <PlusCircle className="h-4 w-4" /> Lägg till steg
        </Button>
      </div>

      {/* End indicator */}
      <div className="flex items-center gap-2 mt-4">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border-2 border-muted-foreground/20">
          <div className="h-3 w-3 rounded-full bg-muted-foreground/40" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slut</span>
      </div>
    </div>
  );
}
