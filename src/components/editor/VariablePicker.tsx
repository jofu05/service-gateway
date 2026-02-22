import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Braces, User, MessageSquare, Database, Monitor } from "lucide-react";
import type { FlowTree } from "@/lib/flow-engine/types";
import { getAvailableVariables, type AvailableVariable } from "@/lib/flow-engine/utils";
import SmartVariableInput from "./SmartVariableInput";

interface VariablePickerProps {
  flowTree: FlowTree;
  currentStepId?: string;
  onInsert: (variableTemplate: string) => void;
}

const CATEGORY_META: Record<AvailableVariable["category"], { label: string; icon: React.ReactNode }> = {
  user: { label: "Användardata", icon: <User className="h-3 w-3" /> },
  answers: { label: "Svar", icon: <MessageSquare className="h-3 w-3" /> },
  lookups: { label: "Uppslagna värden", icon: <Database className="h-3 w-3" /> },
  derived: { label: "Beräknade värden", icon: <Database className="h-3 w-3" /> },
  cmdb: { label: "CMDB", icon: <Monitor className="h-3 w-3" /> },
};

export default function VariablePicker({ flowTree, currentStepId, onInsert }: VariablePickerProps) {
  const [open, setOpen] = useState(false);
  const variables = getAvailableVariables(flowTree, currentStepId);

  const grouped = variables.reduce<Record<string, AvailableVariable[]>>((acc, v) => {
    (acc[v.category] ??= []).push(v);
    return acc;
  }, {});

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground">
          <Braces className="mr-1 h-3 w-3" /> Infoga variabel
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-2 border-b">
          <p className="text-xs font-medium">Välj en variabel att infoga</p>
          <p className="text-[11px] text-muted-foreground">Klicka för att lägga till i texten</p>
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-1">
            {Object.entries(grouped).map(([cat, vars]) => {
              const meta = CATEGORY_META[cat as AvailableVariable["category"]];
              return (
                <div key={cat} className="mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-muted-foreground uppercase">
                    {meta.icon}
                    {meta.label}
                  </div>
                  {vars.map(v => (
                    <button
                      key={v.path}
                      className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-muted/50 flex items-center justify-between group"
                      onClick={() => {
                        onInsert(`{{${v.path}}}`);
                        setOpen(false);
                      }}
                    >
                      <span>{v.label}</span>
                      <code className="text-[10px] text-muted-foreground group-hover:text-foreground font-mono">
                        {`{{${v.path}}}`}
                      </code>
                    </button>
                  ))}
                </div>
              );
            })}
            {variables.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Inga variabler tillgängliga</p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

/**
 * A text input with an integrated variable picker button.
 * Now uses SmartVariableInput with autocomplete, visual tags, and drag-drop support.
 */
export function TextWithVariables({ value, onChange, placeholder, flowTree, currentStepId, multiline }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  flowTree: FlowTree;
  currentStepId?: string;
  multiline?: boolean;
}) {
  return (
    <SmartVariableInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      flowTree={flowTree}
      currentStepId={currentStepId}
      multiline={multiline}
    />
  );
}
