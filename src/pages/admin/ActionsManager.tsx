import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Zap, Plus, Pencil, Trash2, Search, Copy,
  ArrowUpDown, AlertTriangle, Play, Eye, Loader2
} from "lucide-react";
import { toast } from "sonner";
import type { ActionType, ActionTrigger, ActionErrorHandling } from "@/lib/flow-engine/types";
import {
  type ActionTemplate,
  ACTION_TYPES, TRIGGER_TYPES, ERROR_STRATEGIES,
  getActionTemplates, subscribeActionTemplates,
  fetchActionTemplates, createActionTemplate, updateActionTemplate, deleteActionTemplate,
} from "@/lib/action-templates";

const emptyAction: ActionTemplate = {
  id: "",
  name: "",
  description: "",
  type: "lookup",
  trigger: "pre_step",
  input_template: {},
  output_mapping: {},
  error_handling: { strategy: "retry", max_retries: 3 },
  global: true,
  created_at: new Date().toISOString().split("T")[0],
};

function typeBadge(type: ActionType) {
  const map: Record<ActionType, { class: string; label: string }> = {
    lookup: { class: "bg-info/10 text-info border-info/20", label: "Datahämtning" },
    automation: { class: "bg-primary/10 text-primary border-primary/20", label: "Automatisering" },
    validation: { class: "bg-warning/10 text-warning border-warning/20", label: "Validering" },
    enrichment: { class: "bg-accent/10 text-accent border-accent/20", label: "Berikning" },
    notification: { class: "bg-success/10 text-success border-success/20", label: "Notifiering" },
  };
  const m = map[type];
  return <Badge variant="outline" className={m.class}>{m.label}</Badge>;
}

function triggerLabel(trigger: ActionTrigger) {
  return TRIGGER_TYPES.find(t => t.value === trigger)?.label ?? trigger;
}

export default function ActionsManager() {
  const [actions, setLocalActions] = useState<ActionTemplate[]>(getActionTemplates());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchActionTemplates().finally(() => setLoading(false));
    const unsub = subscribeActionTemplates(() => setLocalActions(getActionTemplates()));
    return unsub;
  }, []);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAction, setEditAction] = useState<ActionTemplate | null>(null);
  const [detailAction, setDetailAction] = useState<ActionTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState<ActionTemplate>(emptyAction);
  const [inputPairs, setInputPairs] = useState<{ key: string; value: string }[]>([]);
  const [outputPairs, setOutputPairs] = useState<{ key: string; value: string }[]>([]);

  const filtered = actions.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || a.type === filterType;
    return matchSearch && matchType;
  });

  function openCreate() {
    setForm({ ...emptyAction, id: "" });
    setInputPairs([{ key: "", value: "" }]);
    setOutputPairs([{ key: "", value: "" }]);
    setEditAction(null);
    setDialogOpen(true);
  }

  function openEdit(action: ActionTemplate) {
    setForm({ ...action });
    const ip = Object.entries(action.input_template).map(([key, value]) => ({ key, value: String(value) }));
    const op = Object.entries(action.output_mapping).map(([key, value]) => ({ key, value: String(value) }));
    setInputPairs(ip.length ? ip : [{ key: "", value: "" }]);
    setOutputPairs(op.length ? op : [{ key: "", value: "" }]);
    setEditAction(action);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Namn krävs");
      return;
    }
    setSaving(true);
    const inputTemplate: Record<string, string> = {};
    inputPairs.filter(p => p.key.trim()).forEach(p => { inputTemplate[p.key] = p.value; });
    const outputMapping: Record<string, string> = {};
    outputPairs.filter(p => p.key.trim()).forEach(p => { outputMapping[p.key] = p.value; });

    const saved: ActionTemplate = {
      ...form,
      input_template: inputTemplate,
      output_mapping: outputMapping,
    };

    if (editAction) {
      const ok = await updateActionTemplate(saved.id, saved);
      if (ok) toast.success("Åtgärd uppdaterad");
      else toast.error("Kunde inte uppdatera åtgärden");
    } else {
      const created = await createActionTemplate(saved);
      if (created) toast.success("Åtgärd skapad");
      else toast.error("Kunde inte skapa åtgärden");
    }
    setSaving(false);
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await deleteActionTemplate(id);
    if (ok) toast.success("Åtgärd borttagen");
    else toast.error("Kunde inte ta bort åtgärden");
    setDeleteConfirm(null);
  }

  async function handleDuplicate(action: ActionTemplate) {
    const dup: ActionTemplate = {
      ...action,
      id: "",
      name: `${action.name} (kopia)`,
      created_at: new Date().toISOString().split("T")[0],
    };
    const created = await createActionTemplate(dup);
    if (created) toast.success("Åtgärd duplicerad");
    else toast.error("Kunde inte duplicera åtgärden");
  }

  function handleTest(action: ActionTemplate) {
    toast.info(`Testar "${action.name}"...`, { duration: 1500 });
    setTimeout(() => toast.success(`"${action.name}" kördes utan fel (mock)`), 1500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Laddar åtgärder...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" /> Åtgärder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hantera globala och återanvändbara åtgärder för flöden
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" /> Ny åtgärd
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-muted-foreground">Sök</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök åtgärder..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-[180px]">
              <Label className="text-xs text-muted-foreground">Typ</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla typer</SelectItem>
                  {ACTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Namn</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Felhantering</TableHead>
                <TableHead className="text-right">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Inga åtgärder hittades
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(action => (
                  <TableRow key={action.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{action.name}</span>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{typeBadge(action.type)}</TableCell>
                    <TableCell>
                      <span className="text-sm">{triggerLabel(action.trigger)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={action.global ? "default" : "outline"} className="text-xs">
                        {action.global ? "Global" : "Lokal"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        {action.error_handling.strategy === "stop" && (
                          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                        )}
                        {ERROR_STRATEGIES.find(s => s.value === action.error_handling.strategy)?.label}
                        {action.error_handling.max_retries && (
                          <span className="text-muted-foreground text-xs">
                            ({action.error_handling.max_retries}x)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setDetailAction(action)} title="Visa detaljer">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleTest(action)} title="Testa">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicate(action)} title="Duplicera">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(action)} title="Redigera">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(action.id)} title="Ta bort">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailAction} onOpenChange={() => setDetailAction(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">{detailAction?.name}</DialogTitle>
            <DialogDescription>{detailAction?.description}</DialogDescription>
          </DialogHeader>
          {detailAction && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">Typ</span>
                  <div className="mt-1">{typeBadge(detailAction.type)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Trigger</span>
                  <p className="mt-1 font-medium">{triggerLabel(detailAction.trigger)}</p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Input-mall</span>
                <pre className="mt-1 p-3 rounded-md bg-muted text-xs overflow-auto">
                  {JSON.stringify(detailAction.input_template, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-muted-foreground">Output-mappning</span>
                <pre className="mt-1 p-3 rounded-md bg-muted text-xs overflow-auto">
                  {JSON.stringify(detailAction.output_mapping, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-muted-foreground">Felhantering</span>
                <pre className="mt-1 p-3 rounded-md bg-muted text-xs overflow-auto">
                  {JSON.stringify(detailAction.error_handling, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editAction ? "Redigera åtgärd" : "Ny åtgärd"}
            </DialogTitle>
            <DialogDescription>
              {editAction ? "Uppdatera åtgärdens konfiguration" : "Skapa en ny återanvändbar åtgärd"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Namn *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="T.ex. Hämta kategorier" />
              </div>
              <div>
                <Label>Typ</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as ActionType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        <div>
                          <span>{t.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">{t.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Beskrivning</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Beskriv vad åtgärden gör..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Trigger</Label>
                <Select value={form.trigger} onValueChange={v => setForm(f => ({ ...f, trigger: v as ActionTrigger }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.trigger === "on_change" && (
                <div>
                  <Label>Fråge-ID (trigger)</Label>
                  <Input
                    value={form.trigger_question_id || ""}
                    onChange={e => setForm(f => ({ ...f, trigger_question_id: e.target.value }))}
                    placeholder="T.ex. description"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.global}
                onCheckedChange={v => setForm(f => ({ ...f, global: v }))}
              />
              <Label>Global (tillgänglig i alla flöden)</Label>
            </div>

            {/* Input template */}
            <div>
              <Label className="flex items-center gap-1 mb-2">
                Input-mall
                <span className="text-xs text-muted-foreground">(nyckel → värde/template)</span>
              </Label>
              <div className="space-y-2">
                {inputPairs.map((pair, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Nyckel"
                      className="flex-1"
                      value={pair.key}
                      onChange={e => {
                        const updated = [...inputPairs];
                        updated[i] = { ...pair, key: e.target.value };
                        setInputPairs(updated);
                      }}
                    />
                    <Input
                      placeholder="Värde (t.ex. {{answers.field}})"
                      className="flex-[2]"
                      value={pair.value}
                      onChange={e => {
                        const updated = [...inputPairs];
                        updated[i] = { ...pair, value: e.target.value };
                        setInputPairs(updated);
                      }}
                    />
                    <Button variant="ghost" size="icon" onClick={() => setInputPairs(p => p.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setInputPairs(p => [...p, { key: "", value: "" }])}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Lägg till
                </Button>
              </div>
            </div>

            {/* Output mapping */}
            <div>
              <Label className="flex items-center gap-1 mb-2">
                Output-mappning
                <span className="text-xs text-muted-foreground">(mål-sökväg → källa)</span>
              </Label>
              <div className="space-y-2">
                {outputPairs.map((pair, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Mål (t.ex. lookups.data)"
                      className="flex-1"
                      value={pair.key}
                      onChange={e => {
                        const updated = [...outputPairs];
                        updated[i] = { ...pair, key: e.target.value };
                        setOutputPairs(updated);
                      }}
                    />
                    <Input
                      placeholder="Källa (t.ex. result.items)"
                      className="flex-[2]"
                      value={pair.value}
                      onChange={e => {
                        const updated = [...outputPairs];
                        updated[i] = { ...pair, value: e.target.value };
                        setOutputPairs(updated);
                      }}
                    />
                    <Button variant="ghost" size="icon" onClick={() => setOutputPairs(p => p.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setOutputPairs(p => [...p, { key: "", value: "" }])}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Lägg till
                </Button>
              </div>
            </div>

            {/* Error handling */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-heading">Felhantering</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Strategi</Label>
                    <Select
                      value={form.error_handling.strategy}
                      onValueChange={v => setForm(f => ({
                        ...f,
                        error_handling: { ...f.error_handling, strategy: v as ActionErrorHandling["strategy"] }
                      }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ERROR_STRATEGIES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.error_handling.strategy === "retry" && (
                    <div>
                      <Label>Max försök</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={form.error_handling.max_retries || 3}
                        onChange={e => setForm(f => ({
                          ...f,
                          error_handling: { ...f.error_handling, max_retries: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Användarmeddelande vid fel</Label>
                  <Input
                    value={form.error_handling.user_message || ""}
                    onChange={e => setForm(f => ({
                      ...f,
                      error_handling: { ...f.error_handling, user_message: e.target.value }
                    }))}
                    placeholder="Valfritt meddelande som visas vid fel"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Avbryt</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {editAction ? "Spara" : "Skapa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Ta bort åtgärd</DialogTitle>
            <DialogDescription>
              Är du säker? Åtgärden kan användas i befintliga flöden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Avbryt</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Ta bort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
