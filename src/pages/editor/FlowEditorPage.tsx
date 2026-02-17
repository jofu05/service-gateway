import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import FlowBuilderEditor from "./FlowBuilderEditor";
import { useFlowVersion, useSaveFlowVersion } from "@/hooks/use-flow-crud";
import type { FlowTree } from "@/lib/flow-engine/types";

export default function FlowEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: versionRow, isLoading } = useFlowVersion(id);
  const saveMutation = useSaveFlowVersion();

  const initialTree = versionRow?.tree_json as unknown as FlowTree | undefined;
  const currentVersion = versionRow?.version ?? 1;

  const handleSave = async (tree: FlowTree) => {
    if (!id) return;
    try {
      await saveMutation.mutateAsync({ flowId: id, tree, version: currentVersion });
      toast.success("Flöde sparat!");
    } catch (e: any) {
      toast.error("Kunde inte spara: " + e.message);
    }
  };

  if (id && isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <FlowBuilderEditor
      key={id ?? "new"}
      flowId={id}
      initialTree={initialTree ?? undefined}
      onSave={handleSave}
      isSaving={saveMutation.isPending}
      onPreview={() => navigate("/editor/flows/preview")}
    />
  );
}
