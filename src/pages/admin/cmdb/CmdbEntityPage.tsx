import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, PlusCircle, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import * as admin from "@/lib/cmdb/admin";
import * as repo from "@/lib/cmdb/repository";

type EntityType = "users" | "devices" | "systems" | "servers" | "databases" | "apis" | "applications";

const ENTITY_CONFIG: Record<EntityType, {
  title: string;
  fields: { key: string; label: string; type?: "text" | "select"; options?: string[] }[];
  fetchAll: () => Promise<any[]>;
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  remove: (id: string) => Promise<boolean>;
  idKey: string;
  displayKey: string;
}> = {
  users: {
    title: "Användare",
    fields: [
      { key: "displayName", label: "Namn" },
      { key: "email", label: "E-post" },
      { key: "department", label: "Avdelning" },
      { key: "title", label: "Titel" },
      { key: "manager", label: "Chef" },
    ],
    fetchAll: admin.getAllUsers,
    create: (d) => admin.createUser(d),
    update: (id, d) => admin.updateUser(id, d),
    remove: (id) => admin.deleteUser(id),
    idKey: "userId",
    displayKey: "displayName",
  },
  devices: {
    title: "Enheter",
    fields: [
      { key: "name", label: "Namn" },
      { key: "type", label: "Typ", type: "select", options: ["laptop", "desktop", "mobile", "tablet"] },
      { key: "manufacturer", label: "Tillverkare" },
      { key: "model", label: "Modell" },
      { key: "serialNumber", label: "Serienummer" },
      { key: "os", label: "OS" },
      { key: "status", label: "Status", type: "select", options: ["active", "decommissioned", "repair"] },
      { key: "assignedUserId", label: "Tilldelad användare" },
    ],
    fetchAll: admin.getAllDevices,
    create: (d) => admin.createDevice({ ...d, primaryUserId: d.assignedUserId || "" }),
    update: (id, d) => admin.updateDevice(id, d),
    remove: (id) => admin.deleteDevice(id),
    idKey: "id",
    displayKey: "name",
  },
  systems: {
    title: "System",
    fields: [
      { key: "name", label: "Namn" },
      { key: "description", label: "Beskrivning" },
      { key: "owner", label: "Ägare" },
      { key: "manager", label: "Förvaltare" },
      { key: "operationsLead", label: "Driftansvarig" },
      { key: "criticality", label: "Kritikalitet", type: "select", options: ["low", "medium", "high", "critical"] },
      { key: "status", label: "Status", type: "select", options: ["active", "deprecated", "planned"] },
    ],
    fetchAll: admin.getAllSystems,
    create: (d) => admin.createSystem(d),
    update: (id, d) => admin.updateSystem(id, d),
    remove: (id) => admin.deleteSystem(id),
    idKey: "id",
    displayKey: "name",
  },
  servers: {
    title: "Servrar",
    fields: [
      { key: "name", label: "Namn" },
      { key: "systemId", label: "System-ID" },
      { key: "environment", label: "Miljö", type: "select", options: ["prod", "test", "dev"] },
      { key: "os", label: "OS" },
      { key: "ip", label: "IP-adress" },
      { key: "status", label: "Status", type: "select", options: ["running", "stopped", "maintenance"] },
    ],
    fetchAll: admin.getAllServers,
    create: (d) => admin.createServer(d),
    update: (id, d) => admin.updateServer(id, d),
    remove: (id) => admin.deleteServer(id),
    idKey: "id",
    displayKey: "name",
  },
  databases: {
    title: "Databaser",
    fields: [
      { key: "name", label: "Namn" },
      { key: "type", label: "Databastyp" },
      { key: "systemId", label: "System-ID" },
      { key: "serverId", label: "Server-ID" },
      { key: "environment", label: "Miljö", type: "select", options: ["prod", "test", "dev"] },
      { key: "sizeGb", label: "Storlek (GB)" },
    ],
    fetchAll: admin.getAllDatabases,
    create: (d) => admin.createDatabase({ ...d, sizeGb: Number(d.sizeGb) || 0 }),
    update: (id, d) => admin.updateDatabase(id, { ...d, sizeGb: d.sizeGb != null ? Number(d.sizeGb) : undefined }),
    remove: (id) => admin.deleteDatabase(id),
    idKey: "id",
    displayKey: "name",
  },
  apis: {
    title: "API:er",
    fields: [
      { key: "name", label: "Namn" },
      { key: "systemId", label: "System-ID" },
      { key: "url", label: "URL" },
      { key: "type", label: "Typ", type: "select", options: ["REST", "SOAP", "GraphQL"] },
      { key: "status", label: "Status", type: "select", options: ["active", "deprecated"] },
    ],
    fetchAll: admin.getAllApis,
    create: (d) => admin.createApi(d),
    update: (id, d) => admin.updateApi(id, d),
    remove: (id) => admin.deleteApi(id),
    idKey: "id",
    displayKey: "name",
  },
  applications: {
    title: "Applikationer",
    fields: [
      { key: "name", label: "Namn" },
      { key: "systemId", label: "System-ID" },
      { key: "description", label: "Beskrivning" },
      { key: "owner", label: "Ägare" },
      { key: "manager", label: "Förvaltare" },
      { key: "operationsLead", label: "Driftansvarig" },
      { key: "url", label: "URL" },
    ],
    fetchAll: admin.getAllApplications,
    create: (d) => admin.createApplication(d),
    update: (id, d) => admin.updateApplication(id, d),
    remove: (id) => admin.deleteApplication(id),
    idKey: "id",
    displayKey: "name",
  },
};

export default function CmdbEntityPage() {
  const { entity } = useParams<{ entity: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const entityType = entity as EntityType;
  const config = ENTITY_CONFIG[entityType];

  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!config) return;
    const data = await config.fetchAll();
    setItems(data);
  }, [entityType]);

  useEffect(() => { load(); }, [load]);

  if (!config) {
    return <div className="p-6 text-muted-foreground">Okänd entitetstyp</div>;
  }

  const filtered = items.filter(item =>
    !search || config.fields.some(f =>
      String(item[f.key] ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const openCreate = () => {
    setFormData({});
    setIsCreating(true);
    setEditItem(null);
  };

  const openEdit = (item: any) => {
    const data: Record<string, string> = {};
    config.fields.forEach(f => { data[f.key] = String(item[f.key] ?? ""); });
    setFormData(data);
    setEditItem(item);
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (editItem) {
      const id = editItem[config.idKey];
      await config.update(id, formData);
      toast.success("Uppdaterad");
    } else {
      await config.create(formData);
      toast.success("Skapad");
    }
    setIsCreating(false);
    setEditItem(null);
    load();
  };

  const handleDelete = async (item: any) => {
    if (!isAdmin) {
      toast.error("Endast administratörer kan ta bort objekt");
      return;
    }
    const id = item[config.idKey];
    await config.remove(id);
    toast.success("Borttagen");
    load();
  };

  // Show max 5 columns in table
  const visibleFields = config.fields.slice(0, 5);

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/cmdb")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-heading font-bold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} objekt</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Sök..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button size="sm" onClick={openCreate}>
          <PlusCircle className="mr-1 h-4 w-4" /> Skapa ny
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleFields.map(f => (
                    <TableHead key={f.key} className="text-xs">{f.label}</TableHead>
                  ))}
                  <TableHead className="text-xs w-24">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, i) => (
                  <TableRow key={item[config.idKey] || i}>
                    {visibleFields.map(f => (
                      <TableCell key={f.key} className="text-sm">
                        {f.type === "select" ? (
                          <Badge variant="outline" className="text-xs">{item[f.key]}</Badge>
                        ) : (
                          <span className="truncate max-w-[200px] block">{String(item[f.key] ?? "—")}</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={visibleFields.length + 1} className="text-center text-muted-foreground py-8">
                      Inga objekt hittades
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Redigera" : "Skapa ny"} {config.title.toLowerCase()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {config.fields.map(f => (
              <div key={f.key}>
                <Label className="text-xs">{f.label}</Label>
                {f.type === "select" ? (
                  <Select value={formData[f.key] || ""} onValueChange={v => setFormData(p => ({ ...p, [f.key]: v }))}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Välj..." /></SelectTrigger>
                    <SelectContent>
                      {f.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={formData[f.key] || ""}
                    onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                    className="h-8 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>Avbryt</Button>
            <Button onClick={handleSave}>{editItem ? "Spara" : "Skapa"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
