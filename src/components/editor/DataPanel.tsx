import DraggableDataPanel from "./DraggableDataPanel";
import type { FlowTree } from "@/lib/flow-engine/types";

interface DataPanelProps {
  flowTree: FlowTree;
  currentStepId?: string;
}

export default function DataPanel({ flowTree, currentStepId }: DataPanelProps) {
  return <DraggableDataPanel flowTree={flowTree} currentStepId={currentStepId} />;
}
