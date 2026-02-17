import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, GitBranch, Pencil, Eye, Copy } from "lucide-react";
import { toast } from "sonner";

interface Flow {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "draft" | "published" | "archived";
  version: number;
  updatedAt: string;
}

const mockFlows: Flow[] = [
  { id: "1", name: "IT-Support ärende", description: "Standardflöde för IT-supportärenden", category: "IT-Support", status: "published", version: 2, updatedAt: "2025-01-10" },
  { id: "2", name: "Beställning av utrustning", description: "Flöde för att beställa IT-utrustning", category: "Beställning", status: "draft", version: 1, updatedAt: "2025-01-15" },
  { id: "3", name: "Behörighetsansökan", description: "Ansökan om systemåtkomst", category: "Behörighet", status: "published", version: 3, updatedAt: "2025-01-08" },
];

const statusColors: Record<string, string> = {
  draft: "bg-warning/10 text-warning border-warning/30",
  published: "bg-success/10 text-success border-success/30",
  archived: "bg-muted text-muted-foreground",
};
const statusLabels: Record<string, string> = { draft: "Utkast", published: "Publicerad", archived: "Arkiverad" };

export default function FlowList() {
  const [flows] = useState<Flow[]>(mockFlows);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreate = () => {
    toast.success("Flöde skapat (mock)");
    setDialogOpen(false);
    navigate("/editor/flows/new");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Flöden</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/editor/flows/preview")}>
            <Eye className="mr-1 h-4 w-4" /> Testa flöde
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-1 h-4 w-4" /> Nytt flöde</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Skapa nytt flöde</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Namn</Label><Input placeholder="Namn på flödet" /></div>
                <div><Label>Beskrivning</Label><Textarea placeholder="Beskriv flödet" /></div>
                <div><Label>Kategori</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Välj kategori" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT-Support">IT-Support</SelectItem>
                      <SelectItem value="Beställning">Beställning</SelectItem>
                      <SelectItem value="Behörighet">Behörighet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full">Skapa</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        {flows.map(f => (
          <Card key={f.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-heading font-semibold">{f.name}</p>
                  <Badge variant="outline" className={statusColors[f.status]}>{statusLabels[f.status]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{f.description}</p>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{f.category}</span>
                  <span>v{f.version}</span>
                  <span>Uppdaterad {f.updatedAt}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/editor/flows/${f.id}`)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/editor/flows/preview")}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
