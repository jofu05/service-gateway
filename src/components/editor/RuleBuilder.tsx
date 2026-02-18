import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { ConditionExpression, FlowTree } from "@/lib/flow-engine/types";
import { getAvailableVariables } from "@/lib/flow-engine/utils";

const OPERATORS: { value: ConditionExpression["type"]; label: string }[] = [
  { value: "equals", label: "är lika med" },
  { value: "not_equals", label: "är inte lika med" },
  { value: "contains", label: "innehåller" },
  { value: "exists", label: "är inte tomt" },
  { value: "gt", label: "större än" },
  { value: "lt", label: "mindre än" },
  { value: "gte", label: "större eller lika" },
  { value: "lte", label: "mindre eller lika" },
  { value: "has_role", label: "användare har roll" },
  { value: "in_group", label: "användare tillhör grupp" },
];

const VALUE_OPERATORS = ["equals", "not_equals", "contains", "gt", "lt", "gte", "lte", "has_role", "in_group"];

interface RuleBuilderProps {
  condition?: ConditionExpression;
  onChange: (condition: ConditionExpression | undefined) => void;
  flowTree: FlowTree;
  currentStepId?: string;
  compact?: boolean;
}

export default function RuleBuilder({ condition, onChange, flowTree, currentStepId, compact }: RuleBuilderProps) {
  const variables = getAvailableVariables(flowTree, currentStepId);

  if (!condition) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-xs w-full border-dashed"
        onClick={() => onChange({ type: "equals", field: "", value: "" })}
      >
        <PlusCircle className="mr-1 h-3 w-3" /> Lägg till villkor
      </Button>
    );
  }

  // Compound conditions (and/or)
  if (condition.type === "and" || condition.type === "or") {
    return (
      <CompoundRule
        condition={condition}
        onChange={onChange}
        flowTree={flowTree}
        currentStepId={currentStepId}
        variables={variables}
      />
    );
  }

  // Simple condition
  return (
    <div className={`space-y-2 ${compact ? "" : "p-3 border rounded-lg bg-muted/30"}`}>
      <SimpleRule
        condition={condition}
        onChange={onChange}
        variables={variables}
        flowTree={flowTree}
      />
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] h-6 px-2"
          onClick={() =>
            onChange({ type: "and", children: [condition, { type: "equals", field: "", value: "" }] })
          }
        >
          + OCH
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] h-6 px-2"
          onClick={() =>
            onChange({ type: "or", children: [condition, { type: "equals", field: "", value: "" }] })
          }
        >
          + ELLER
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] h-6 px-2 text-destructive"
          onClick={() => onChange(undefined)}
        >
          Ta bort
        </Button>
      </div>
    </div>
  );
}

function SimpleRule({ condition, onChange, variables, flowTree }: {
  condition: ConditionExpression;
  onChange: (c: ConditionExpression) => void;
  variables: ReturnType<typeof getAvailableVariables>;
  flowTree: FlowTree;
}) {
  const needsValue = VALUE_OPERATORS.includes(condition.type);

  const fieldOptions = variables.map(v => ({
    value: v.path,
    label: v.label,
  }));

  // Resolve options for the selected field if it's a question with predefined choices
  const fieldOptions2 = (() => {
    if (!condition.field?.startsWith("answers.")) return null;
    const qId = condition.field.replace("answers.", "");
    for (const step of flowTree.steps) {
      const q = step.questions.find(q => q.id === qId);
      if (q?.options && q.options.length > 0) return q.options;
    }
    return null;
  })();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-medium text-muted-foreground shrink-0">När</span>

      <Select value={condition.field || ""} onValueChange={f => onChange({ ...condition, field: f, value: "" })}>
        <SelectTrigger className="h-7 text-xs w-auto min-w-[140px]">
          <SelectValue placeholder="Välj fält..." />
        </SelectTrigger>
        <SelectContent>
          {fieldOptions.map(o => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={condition.type} onValueChange={t => onChange({ ...condition, type: t as any })}>
        <SelectTrigger className="h-7 text-xs w-auto min-w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPERATORS.map(o => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {needsValue && (
        fieldOptions2 ? (
          <Select value={condition.value ?? ""} onValueChange={v => onChange({ ...condition, value: v })}>
            <SelectTrigger className="h-7 text-xs w-auto min-w-[120px]">
              <SelectValue placeholder="Välj värde..." />
            </SelectTrigger>
            <SelectContent>
              {fieldOptions2.map(o => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={condition.value ?? ""}
            onChange={e => onChange({ ...condition, value: e.target.value })}
            placeholder="Värde..."
            className="h-7 text-xs w-auto min-w-[100px] max-w-[160px]"
          />
        )
      )}
    </div>
  );
}

function CompoundRule({ condition, onChange, flowTree, currentStepId, variables }: {
  condition: ConditionExpression;
  onChange: (c: ConditionExpression | undefined) => void;
  flowTree: FlowTree;
  currentStepId?: string;
  variables: ReturnType<typeof getAvailableVariables>;
}) {
  const children = condition.children ?? [];
  const isAnd = condition.type === "and";

  const updateChild = (index: number, child: ConditionExpression) => {
    const newChildren = [...children];
    newChildren[index] = child;
    onChange({ ...condition, children: newChildren });
  };

  const removeChild = (index: number) => {
    const newChildren = children.filter((_, i) => i !== index);
    if (newChildren.length === 0) {
      onChange(undefined);
    } else if (newChildren.length === 1) {
      onChange(newChildren[0]);
    } else {
      onChange({ ...condition, children: newChildren });
    }
  };

  const addChild = () => {
    onChange({
      ...condition,
      children: [...children, { type: "equals", field: "", value: "" }],
    });
  };

  return (
    <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="outline" className="text-[10px] uppercase">
          {isAnd ? "Alla villkor" : "Något villkor"}
        </Badge>
        <Select
          value={condition.type}
          onValueChange={t => onChange({ ...condition, type: t as "and" | "or" })}
        >
          <SelectTrigger className="h-6 text-[11px] w-auto min-w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="and">OCH (alla)</SelectItem>
            <SelectItem value="or">ELLER (något)</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] h-6 px-2 ml-auto text-destructive"
          onClick={() => onChange(undefined)}
        >
          Ta bort alla
        </Button>
      </div>

      {children.map((child, i) => (
        <div key={i} className="flex items-start gap-1">
          <div className="flex-1">
            {child.type === "and" || child.type === "or" ? (
              <CompoundRule
                condition={child}
                onChange={c => {
                  if (c) updateChild(i, c);
                  else removeChild(i);
                }}
                flowTree={flowTree}
                currentStepId={currentStepId}
                variables={variables}
              />
            ) : (
              <SimpleRule
                condition={child}
                onChange={c => updateChild(i, c)}
                variables={variables}
                flowTree={flowTree}
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive shrink-0"
            onClick={() => removeChild(i)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}

      <Button variant="ghost" size="sm" className="text-xs h-6" onClick={addChild}>
        <PlusCircle className="mr-1 h-3 w-3" /> Lägg till villkor
      </Button>
    </div>
  );
}
