import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Database, User, MessageSquare, Copy, Braces, Monitor, GripVertical, Search } from "lucide-react";
import { toast } from "sonner";
import { useState, useCallback, useMemo } from "react";
import type { FlowTree } from "@/lib/flow-engine/types";
import { getAvailableVariables, type AvailableVariable } from "@/lib/flow-engine/utils";
import { CATEGORY_META } from "./SmartVariableInput";

interface DraggableDataPanelProps {
  flowTree: FlowTree;
  currentStepId?: string;
}

export default function DraggableDataPanel({ flowTree, currentStepId }: DraggableDataPanelProps) {
  const [search, setSearch] = useState("");
  const variables = useMemo(() => getAvailableVariables(flowTree, currentStepId), [flowTree, currentStepId]);

  const filtered = useMemo(() => {
    if (!search) return variables;
    const lower = search.toLowerCase();
    return variables.filter(
      v => v.label.toLowerCase().includes(lower) || v.path.toLowerCase().includes(lower)
    );
  }, [variables, search]);

  const grouped = useMemo(() =>
    filtered.reduce<Record<string, AvailableVariable[]>>((acc, v) => {
      (acc[v.category] ??= []).push(v);
      return acc;
    }, {}),
    [filtered]
  );

  const handleDragStart = useCallback((e: React.DragEvent, variable: AvailableVariable) => {
    e.dataTransfer.setData("text/variable-path", variable.path);
    e.dataTransfer.setData("text/plain", `{{${variable.path}}}`);
    e.dataTransfer.effectAllowed = "copy";
    // Custom drag image
    const ghost = document.createElement("div");
    ghost.textContent = `{{${variable.path}}}`;
    ghost.className = "fixed -top-[1000px] text-xs font-mono bg-primary text-primary-foreground px-2 py-1 rounded";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => ghost.remove(), 0);
  }, []);

  const copyVariable = (path: string) => {
    navigator.clipboard.writeText(`{{${path}}}`);
    toast.success("Variabel kopierad!");
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
          <Braces className="h-3.5 w-3.5" />
          Tillgängliga data
        </CardTitle>
        <div className="relative mt-1.5">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Sök variabler..."
            className="h-7 text-[11px] pl-6"
          />
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-3">
            {Object.entries(grouped).map(([cat, vars]) => {
              const meta = CATEGORY_META[cat as AvailableVariable["category"]];
              return (
                <div key={cat}>
                  <div className={`flex items-center gap-1.5 mb-1 text-[11px] font-medium ${meta.color.split(" ")[1]}`}>
                    {meta.icon}
                    {meta.label}
                  </div>
                  <div className="space-y-0.5">
                    {vars.map(v => (
                      <div
                        key={v.path}
                        draggable
                        onDragStart={e => handleDragStart(e, v)}
                        onClick={() => copyVariable(v.path)}
                        className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-muted/50 flex items-center gap-1.5 group cursor-grab active:cursor-grabbing select-none"
                        title={`Dra till textfält eller klicka för att kopiera {{${v.path}}}`}
                      >
                        <GripVertical className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0" />
                        <span className="truncate flex-1">{v.label}</span>
                        <code className="text-[10px] text-muted-foreground font-mono opacity-0 group-hover:opacity-100 shrink-0">
                          {v.path}
                        </code>
                        <Copy className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                {search ? "Inga matchande variabler" : "Lägg till frågor i tidigare steg för att se tillgängliga data"}
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
