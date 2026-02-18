import { useMemo, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PlusCircle, MessageSquare, Info, Zap, ClipboardCheck,
  GitBranch, Filter, Plus, GripVertical
} from "lucide-react";
import type { FlowStep, FlowTree, StepType, TransitionRule } from "@/lib/flow-engine/types";

const STEP_TYPE_CONFIG: Record<StepType, { icon: typeof MessageSquare; label: string; color: string; bgColor: string }> = {
  questions: { icon: MessageSquare, label: "Frågor", color: "text-primary", bgColor: "bg-primary/10" },
  info: { icon: Info, label: "Information", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  action: { icon: Zap, label: "Åtgärd", color: "text-amber-500", bgColor: "bg-amber-500/10" },
  review: { icon: ClipboardCheck, label: "Granska", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
};

const NODE_W = 220;
const NODE_H = 90;
const H_GAP = 40;
const V_GAP = 70;

interface TreeNode {
  step: FlowStep;
  children: TreeNode[];
  transition?: TransitionRule;
  x: number;
  y: number;
  width: number;
}

interface FlowCanvasProps {
  flow: FlowTree;
  selectedStepId: string | null;
  onSelectStep: (id: string) => void;
  onAddStep: () => void;
  onMoveStep?: (fromIndex: number, toIndex: number) => void;
}

function buildTree(flow: FlowTree): TreeNode | null {
  const stepMap = new Map(flow.steps.map(s => [s.id, s]));
  const startStep = stepMap.get(flow.flow.start_step_id);
  if (!startStep) return null;

  const visited = new Set<string>();

  function build(stepId: string, transition?: TransitionRule): TreeNode | null {
    if (visited.has(stepId)) return null;
    const step = stepMap.get(stepId);
    if (!step) return null;
    visited.add(stepId);

    const children: TreeNode[] = [];

    if (step.transitions.length > 0) {
      for (const t of step.transitions) {
        if (t.next_step_id) {
          const child = build(t.next_step_id, t);
          if (child) children.push(child);
        }
      }
    } else {
      const idx = flow.steps.findIndex(s => s.id === stepId);
      if (idx >= 0 && idx < flow.steps.length - 1) {
        const nextStep = flow.steps[idx + 1];
        const child = build(nextStep.id, undefined);
        if (child) children.push(child);
      }
    }

    return { step, children, transition, x: 0, y: 0, width: 0 };
  }

  return build(flow.flow.start_step_id);
}

function layoutTree(node: TreeNode, depth: number = 0, xOffset: number = 0): number {
  node.y = depth * (NODE_H + V_GAP);

  if (node.children.length === 0) {
    node.width = NODE_W;
    node.x = xOffset;
    return NODE_W;
  }

  let totalWidth = 0;
  for (let i = 0; i < node.children.length; i++) {
    const childWidth = layoutTree(node.children[i], depth + 1, xOffset + totalWidth);
    totalWidth += childWidth;
    if (i < node.children.length - 1) totalWidth += H_GAP;
  }

  node.width = Math.max(NODE_W, totalWidth);
  const firstChild = node.children[0];
  const lastChild = node.children[node.children.length - 1];
  node.x = (firstChild.x + lastChild.x) / 2;

  return node.width;
}

function getConditionLabel(t: TransitionRule, flow: FlowTree): string {
  if (t.is_default) return "Standard";
  if (!t.condition) return "→";

  const c = t.condition;
  if (c.field?.startsWith("answers.")) {
    const qId = c.field.replace("answers.", "");
    for (const step of flow.steps) {
      const q = step.questions.find(q => q.id === qId);
      if (q) {
        const optLabel = q.options?.find(o => o.value === c.value)?.label ?? c.value;
        if (c.type === "equals") return `${q.label} = "${optLabel}"`;
        if (c.type === "not_equals") return `${q.label} ≠ "${optLabel}"`;
        if (c.type === "contains") return `${q.label} ∋ "${optLabel}"`;
        return `${q.label} ${c.type} ${optLabel}`;
      }
    }
  }

  if (c.type === "has_role") return `Roll: ${c.value}`;
  if (c.type === "in_group") return `Grupp: ${c.value}`;

  return c.field ? `${c.field} ${c.type} ${c.value ?? ""}` : "Villkor";
}

function flattenTree(node: TreeNode): TreeNode[] {
  const result: TreeNode[] = [node];
  for (const child of node.children) {
    result.push(...flattenTree(child));
  }
  return result;
}

function collectEdges(node: TreeNode): Array<{ from: TreeNode; to: TreeNode; transition?: TransitionRule }> {
  const edges: Array<{ from: TreeNode; to: TreeNode; transition?: TransitionRule }> = [];
  for (const child of node.children) {
    edges.push({ from: node, to: child, transition: child.transition });
    edges.push(...collectEdges(child));
  }
  return edges;
}

export default function FlowCanvas({ flow, selectedStepId, onSelectStep, onAddStep, onMoveStep }: FlowCanvasProps) {
  const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);
  const [draggingStepId, setDraggingStepId] = useState<string | null>(null);

  const treeKey = useMemo(() => {
    return JSON.stringify(flow.steps.map(s => ({
      id: s.id,
      t: s.transitions,
      q: s.questions.length,
      title: s.title,
    }))) + flow.flow.start_step_id;
  }, [flow]);

  const tree = useMemo(() => {
    const root = buildTree(flow);
    if (root) {
      layoutTree(root);
      const allNodes = flattenTree(root);
      const minX = Math.min(...allNodes.map(n => n.x));
      if (minX < 0) {
        for (const n of allNodes) n.x -= minX;
      }
    }
    return root;
  }, [treeKey]);

  const handleDragStart = useCallback((e: React.DragEvent, stepId: string) => {
    setDraggingStepId(stepId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", stepId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (stepId !== draggingStepId) {
      setDragOverStepId(stepId);
    }
  }, [draggingStepId]);

  const handleDragLeave = useCallback(() => {
    setDragOverStepId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStepId: string) => {
    e.preventDefault();
    setDragOverStepId(null);
    setDraggingStepId(null);
    const sourceStepId = e.dataTransfer.getData("text/plain");
    if (!sourceStepId || sourceStepId === targetStepId || !onMoveStep) return;

    const fromIndex = flow.steps.findIndex(s => s.id === sourceStepId);
    const toIndex = flow.steps.findIndex(s => s.id === targetStepId);
    if (fromIndex >= 0 && toIndex >= 0) {
      onMoveStep(fromIndex, toIndex);
    }
  }, [flow.steps, onMoveStep, draggingStepId]);

  const handleDragEnd = useCallback(() => {
    setDraggingStepId(null);
    setDragOverStepId(null);
  }, []);

  if (!tree) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Inga steg i flödet ännu.</p>
        <Button variant="outline" onClick={onAddStep}>
          <PlusCircle className="mr-2 h-4 w-4" /> Lägg till första steget
        </Button>
      </div>
    );
  }

  const allNodes = flattenTree(tree);
  const edges = collectEdges(tree);

  const PADDING = 60;
  const canvasWidth = Math.max(...allNodes.map(n => n.x + NODE_W)) + PADDING * 2;
  const canvasHeight = Math.max(...allNodes.map(n => n.y + NODE_H)) + PADDING + 80;

  return (
    <div className="relative overflow-auto min-h-[500px]">
      <div style={{ width: canvasWidth, height: canvasHeight, position: "relative" }}>
        {/* SVG edges */}
        <svg
          width={canvasWidth}
          height={canvasHeight}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {edges.map((edge, i) => {
            const x1 = edge.from.x + PADDING + NODE_W / 2;
            const y1 = edge.from.y + PADDING + NODE_H;
            const x2 = edge.to.x + PADDING + NODE_W / 2;
            const y2 = edge.to.y + PADDING;
            const midY = (y1 + y2) / 2;

            const hasCondition = edge.transition?.condition != null;
            const isDefault = edge.transition?.is_default;

            return (
              <g key={i}>
                <path
                  d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                  fill="none"
                  stroke={hasCondition ? "hsl(var(--primary))" : "hsl(var(--border))"}
                  strokeWidth={hasCondition ? 2.5 : 2}
                  strokeDasharray={isDefault ? "6 3" : "none"}
                  className="transition-colors"
                />
                <polygon
                  points={`${x2 - 5},${y2 - 8} ${x2 + 5},${y2 - 8} ${x2},${y2}`}
                  fill={hasCondition ? "hsl(var(--primary))" : "hsl(var(--border))"}
                />
                {edge.transition && (hasCondition || isDefault) && (
                  <foreignObject
                    x={Math.min(x1, x2) - 10}
                    y={midY - 12}
                    width={Math.abs(x2 - x1) + 20}
                    height={24}
                  >
                    <div className="flex justify-center">
                      <span className={`
                        text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap
                        ${hasCondition
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-muted text-muted-foreground border border-border"
                        }
                      `}>
                        {getConditionLabel(edge.transition, flow)}
                      </span>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>

        {/* Start indicator */}
        <div
          className="absolute flex items-center gap-2"
          style={{
            left: tree.x + PADDING + NODE_W / 2 - 40,
            top: PADDING - 40,
          }}
        >
          <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center shadow-md">
            <GitBranch className="h-3.5 w-3.5 text-accent-foreground" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">Start</span>
        </div>

        {/* Step nodes */}
        {allNodes.map((node) => {
          const { step } = node;
          const config = STEP_TYPE_CONFIG[step.type];
          const Icon = config.icon;
          const isSelected = step.id === selectedStepId;
          const stepIndex = flow.steps.findIndex(s => s.id === step.id);
          const hasConditions = step.transitions.some(t => t.condition);
          const hasActions = step.pre_actions.length + step.post_actions.length > 0;
          const isBranching = step.transitions.filter(t => t.next_step_id).length > 1;
          const isDragOver = dragOverStepId === step.id;
          const isDragging = draggingStepId === step.id;

          return (
            <div
              key={step.id}
              draggable
              onDragStart={(e) => handleDragStart(e, step.id)}
              onDragOver={(e) => handleDragOver(e, step.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, step.id)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectStep(step.id)}
              className={`
                absolute transition-all duration-200 rounded-xl border-2 p-3 text-left cursor-grab active:cursor-grabbing
                ${isDragging ? "opacity-40 scale-95" : ""}
                ${isDragOver
                  ? "border-primary border-dashed bg-primary/5 ring-2 ring-primary/30 shadow-xl z-20"
                  : isSelected
                    ? "border-primary shadow-lg shadow-primary/10 bg-card ring-2 ring-primary/20 z-10"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 z-[1]"
                }
              `}
              style={{
                left: node.x + PADDING,
                top: node.y + PADDING,
                width: NODE_W,
                minHeight: NODE_H,
              }}
            >
              {/* Drag handle */}
              <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
              </div>

              {/* Step number */}
              <div className="absolute -top-2.5 -left-2">
                <div className={`
                  h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm
                  ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                `}>
                  {stepIndex + 1}
                </div>
              </div>

              {/* Branching indicator */}
              {isBranching && (
                <div className="absolute -top-2 right-2">
                  <Badge className="text-[9px] h-4 bg-primary/10 text-primary border border-primary/20 gap-0.5">
                    <GitBranch className="h-2.5 w-2.5" />
                    {step.transitions.filter(t => t.next_step_id).length}
                  </Badge>
                </div>
              )}

              <div className="flex items-start gap-2">
                <div className={`${config.bgColor} rounded-lg p-1.5 shrink-0`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs leading-tight truncate">{step.title}</h3>
                  {step.description && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{step.description}</p>
                  )}
                  {/* Show questions summary */}
                  {step.questions.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {step.questions.slice(0, 3).map(q => (
                        <div key={q.id} className="text-[9px] text-muted-foreground truncate flex items-center gap-1">
                          <span className="text-foreground/60">•</span>
                          <span className="truncate">{q.label}</span>
                          {q.options && q.options.length > 0 && (
                            <span className="text-primary/60 shrink-0">({q.options.length} val)</span>
                          )}
                        </div>
                      ))}
                      {step.questions.length > 3 && (
                        <span className="text-[9px] text-muted-foreground/60">+{step.questions.length - 3} till</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    <Badge variant="outline" className="text-[9px] h-4 gap-0.5 px-1">
                      <Icon className="h-2 w-2" />
                      {config.label}
                    </Badge>
                    {hasConditions && (
                      <Badge variant="outline" className="text-[9px] h-4 gap-0.5 px-1 border-primary/50 text-primary">
                        <Filter className="h-2 w-2" />
                      </Badge>
                    )}
                    {hasActions && (
                      <Badge variant="outline" className="text-[9px] h-4 gap-0.5 px-1 border-amber-500/50 text-amber-500">
                        <Zap className="h-2 w-2" />
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add step button at leaves */}
        {allNodes.filter(n => n.children.length === 0).map((leaf) => (
          <div
            key={`add-${leaf.step.id}`}
            className="absolute flex flex-col items-center"
            style={{
              left: leaf.x + PADDING + NODE_W / 2 - 14,
              top: leaf.y + PADDING + NODE_H + 10,
            }}
          >
            <div className="w-0.5 h-4 bg-border" />
            <button
              onClick={onAddStep}
              className="h-7 w-7 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all"
              title="Lägg till steg"
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}

        {/* End indicators */}
        {allNodes
          .filter(n => n.children.length === 0)
          .map((leaf) => (
            <div
              key={`end-${leaf.step.id}`}
              className="absolute flex items-center gap-1.5"
              style={{
                left: leaf.x + PADDING + NODE_W / 2 - 30,
                top: leaf.y + PADDING + NODE_H + 50,
              }}
            >
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border-2 border-muted-foreground/20">
                <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Slut</span>
            </div>
          ))}
      </div>
    </div>
  );
}
