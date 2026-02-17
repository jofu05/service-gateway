import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, User, MessageSquare, Copy, Braces } from "lucide-react";
import { toast } from "sonner";
import type { FlowTree } from "@/lib/flow-engine/types";
import { getAvailableVariables, type AvailableVariable } from "@/lib/flow-engine/utils";

interface DataPanelProps {
  flowTree: FlowTree;
  currentStepId?: string;
}

const CATEGORY_META: Record<AvailableVariable["category"], { label: string; icon: React.ReactNode; color: string }> = {
  user: { label: "Användardata", icon: <User className="h-3.5 w-3.5" />, color: "text-primary" },
  answers: { label: "Svar från frågor", icon: <MessageSquare className="h-3.5 w-3.5" />, color: "text-accent" },
  lookups: { label: "Uppslagna värden", icon: <Database className="h-3.5 w-3.5" />, color: "text-warning" },
  derived: { label: "Beräknade värden", icon: <Database className="h-3.5 w-3.5" />, color: "text-info" },
};

export default function DataPanel({ flowTree, currentStepId }: DataPanelProps) {
  const variables = getAvailableVariables(flowTree, currentStepId);

  const grouped = variables.reduce<Record<string, AvailableVariable[]>>((acc, v) => {
    (acc[v.category] ??= []).push(v);
    return acc;
  }, {});

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
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-3">
            {Object.entries(grouped).map(([cat, vars]) => {
              const meta = CATEGORY_META[cat as AvailableVariable["category"]];
              return (
                <div key={cat}>
                  <div className={`flex items-center gap-1.5 mb-1 text-[11px] font-medium ${meta.color}`}>
                    {meta.icon}
                    {meta.label}
                  </div>
                  <div className="space-y-0.5">
                    {vars.map(v => (
                      <button
                        key={v.path}
                        onClick={() => copyVariable(v.path)}
                        className="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted/50 flex items-center justify-between group"
                        title={`Kopiera {{${v.path}}}`}
                      >
                        <span className="truncate">{v.label}</span>
                        <Copy className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {variables.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Lägg till frågor i tidigare steg för att se tillgängliga data
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
