import FlowBuilderEditor from "./FlowBuilderEditor";
import { useNavigate } from "react-router-dom";

export default function FlowEditorPage() {
  const navigate = useNavigate();

  return (
    <FlowBuilderEditor
      onSave={(tree) => console.log("Saving flow:", tree)}
      onPreview={() => navigate("/editor/flows/preview")}
    />
  );
}
