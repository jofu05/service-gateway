import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePublishedFlows, usePublishedFlowTree } from "@/hooks/use-flow-crud";
import { Loader2, ArrowLeft, FileText } from "lucide-react";
import FlowWizard from "@/components/flow/FlowWizard";
import { toast } from "sonner";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const { data: flows, isLoading: flowsLoading } = usePublishedFlows();
  const { data: flowTree, isLoading: treeLoading } = usePublishedFlowTree(selectedFlowId ?? undefined);

  // Flow selection screen
  if (!selectedFlowId) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-heading font-bold mb-6">Skapa ärende</h1>
        {flowsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : flows && flows.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {flows.map(f => (
              <Card
                key={f.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedFlowId(f.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {f.name}
                  </CardTitle>
                  {f.description && <CardDescription className="text-xs">{f.description}</CardDescription>}
                </CardHeader>
                {f.category && (
                  <CardContent className="pt-0">
                    <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{f.category}</span>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Inga publicerade flöden tillgängliga.</p>
              <p className="text-sm mt-1">En administratör behöver publicera ett flöde först.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Loading flow tree
  if (treeLoading || !flowTree) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => setSelectedFlowId(null)} className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Välj annat flöde
        </Button>
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  // Wizard
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => setSelectedFlowId(null)} className="mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Välj annat flöde
      </Button>
      <FlowWizard
        flowTree={flowTree}
        onSubmit={(answers) => {
          toast.success("Ärende inskickat!");
          navigate("/tickets");
        }}
        onClose={() => setSelectedFlowId(null)}
      />
    </div>
  );
}
