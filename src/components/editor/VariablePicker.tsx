import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Braces, User, MessageSquare, Database } from "lucide-react";
import type { FlowTree } from "@/lib/flow-engine/types";
import { getAvailableVariables, type AvailableVariable } from "@/lib/flow-engine/utils";

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
 */
export function TextWithVariables({ value, onChange, placeholder, flowTree, currentStepId, multiline }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  flowTree: FlowTree;
  currentStepId?: string;
  multiline?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleInsert = (variable: string) => {
    const el = inputRef.current;
    if (el) {
      const start = el.selectionStart ?? value.length;
      const end = el.selectionEnd ?? value.length;
      const newValue = value.slice(0, start) + variable + value.slice(end);
      onChange(newValue);
      // Restore cursor
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + variable.length;
        el.focus();
      }, 0);
    } else {
      onChange(value + variable);
    }
  };

  // Highlight variables in text
  const hasVariables = value.includes("{{");

  return (
    <div className="space-y-1">
      <div className="relative">
        {multiline ? (
          <textarea
            ref={inputRef as any}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        ) : (
          <input
            ref={inputRef as any}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        )}
      </div>
      <div className="flex items-center justify-between">
        <VariablePicker flowTree={flowTree} currentStepId={currentStepId} onInsert={handleInsert} />
        {hasVariables && (
          <Badge variant="outline" className="text-[10px]">
            <Braces className="mr-0.5 h-2.5 w-2.5" /> Dynamisk text
          </Badge>
        )}
      </div>
    </div>
  );
}
