import FlowWizard from "@/components/flow/FlowWizard";
import { sampleIncidentFlow } from "@/lib/flow-engine/sample-flow";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function FlowPreviewPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/editor/flows")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Tillbaka till flöden
        </Button>
        <span className="text-sm text-muted-foreground">Förhandsgranskning</span>
      </div>
      <FlowWizard
        flowTree={sampleIncidentFlow}
        onSubmit={(answers) => {
          console.log("Submitted:", answers);
          navigate("/editor/flows");
        }}
        onClose={() => navigate("/editor/flows")}
      />
    </div>
  );
}
