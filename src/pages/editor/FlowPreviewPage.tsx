import FlowWizard from "@/components/flow/FlowWizard";
import { sampleIncidentFlow } from "@/lib/flow-engine/sample-flow";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { FlowTree } from "@/lib/flow-engine/types";

export default function FlowPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flowTree: FlowTree = (location.state as any)?.flowTree ?? sampleIncidentFlow;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Tillbaka till editorn
        </Button>
        <span className="text-sm text-muted-foreground">Förhandsgranskning</span>
      </div>
      <FlowWizard
        flowTree={flowTree}
        onSubmit={(answers) => {
          console.log("Submitted:", answers);
          navigate(-1);
        }}
        onClose={() => navigate(-1)}
      />
    </div>
  );
}
