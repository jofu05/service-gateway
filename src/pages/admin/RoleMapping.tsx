import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface RoleMap {
  id: string;
  adGroup: string;
  appRole: string;
}

const initialMappings: RoleMap[] = [
  { id: "1", adGroup: "AD-AllUsers", appRole: "user" },
  { id: "2", adGroup: "AD-IT-Editors", appRole: "editor" },
  { id: "3", adGroup: "AD-IT-Admins", appRole: "admin" },
  { id: "4", adGroup: "AD-TeamLeads", appRole: "manager" },
];

export default function RoleMapping() {
  const [mappings, setMappings] = useState<RoleMap[]>(initialMappings);
  const [newGroup, setNewGroup] = useState("");
  const [newRole, setNewRole] = useState("");

  const addMapping = () => {
    if (!newGroup || !newRole) return;
    setMappings(m => [...m, { id: String(Date.now()), adGroup: newGroup, appRole: newRole }]);
    setNewGroup(""); setNewRole("");
    toast.success("Mappning tillagd");
  };

  const removeMapping = (id: string) => {
    setMappings(m => m.filter(x => x.id !== id));
    toast.success("Mappning borttagen");
  };

  const roleColors: Record<string, string> = {
    user: "bg-info/10 text-info", manager: "bg-warning/10 text-warning",
    editor: "bg-accent/10 text-accent", admin: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-heading font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> Roller & grupper</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">AD-grupper → App-roller</CardTitle>
          <CardDescription>Mappa Active Directory-grupper till roller i portalen</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>AD-grupp</TableHead>
                <TableHead>App-roll</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-sm">{m.adGroup}</TableCell>
                  <TableCell><Badge className={roleColors[m.appRole]}>{m.appRole}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => removeMapping(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex gap-2 mt-4">
            <Input placeholder="AD-grupp" value={newGroup} onChange={e => setNewGroup(e.target.value)} className="flex-1" />
            <Input placeholder="Roll (user/editor/admin)" value={newRole} onChange={e => setNewRole(e.target.value)} className="w-48" />
            <Button onClick={addMapping}><PlusCircle className="mr-1 h-4 w-4" /> Lägg till</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
