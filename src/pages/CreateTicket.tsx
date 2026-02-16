import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pobApi } from "@/lib/mock-api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Send, CheckCircle } from "lucide-react";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ category: "", title: "", description: "", priority: "Medium", location: "" });
  const [ticketId, setTicketId] = useState("");

  const { data: categories } = useQuery({ queryKey: ["lookups", "categories"], queryFn: () => pobApi.getLookups("categories") });
  const { data: locations } = useQuery({ queryKey: ["lookups", "locations"], queryFn: () => pobApi.getLookups("locations") });

  const createMutation = useMutation({
    mutationFn: () => pobApi.createTicket(form),
    onSuccess: (data) => {
      setTicketId(data.ticketId);
      setStep(3);
      toast.success("Ärende skapat!");
    },
    onError: () => toast.error("Kunde inte skapa ärende"),
  });

  const steps = ["Kategori", "Detaljer", "Granska", "Klart"];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-heading font-bold mb-6">Skapa ärende</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Välj kategori</CardTitle>
            <CardDescription>Vad gäller ditt ärende?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {categories?.map(c => (
                <Button
                  key={c.id}
                  variant={form.category === c.label ? "default" : "outline"}
                  className="h-auto py-4 justify-start"
                  onClick={() => setForm(f => ({ ...f, category: c.label }))}
                >
                  {c.label}
                </Button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!form.category}>
                Nästa <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Beskriv ärendet</CardTitle>
            <CardDescription>Fyll i detaljer om ditt ärende</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Rubrik</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Kort beskrivning" />
            </div>
            <div>
              <Label>Beskrivning</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Beskriv problemet eller beställningen i detalj" rows={4} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Prioritet</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Låg">Låg</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hög">Hög</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plats</Label>
                <Select value={form.location} onValueChange={v => setForm(f => ({ ...f, location: v }))}>
                  <SelectTrigger><SelectValue placeholder="Välj plats" /></SelectTrigger>
                  <SelectContent>
                    {locations?.map(l => <SelectItem key={l.id} value={l.label}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Tillbaka
              </Button>
              <Button onClick={() => setStep(2)} disabled={!form.title || !form.description}>
                Nästa <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Granska</CardTitle>
            <CardDescription>Kontrollera att allt stämmer innan du skickar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Kategori</span><span className="font-medium">{form.category}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Rubrik</span><span className="font-medium">{form.title}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Prioritet</span><span className="font-medium">{form.priority}</span></div>
              {form.location && <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Plats</span><span className="font-medium">{form.location}</span></div>}
              <div className="py-2"><span className="text-muted-foreground">Beskrivning</span><p className="mt-1">{form.description}</p></div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Tillbaka
              </Button>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                <Send className="mr-1 h-4 w-4" /> {createMutation.isPending ? "Skickar..." : "Skicka ärende"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="text-center">
          <CardContent className="py-12">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">Ärende skapat!</h2>
            <p className="text-muted-foreground mb-1">Ditt ärende har registrerats med nummer:</p>
            <p className="text-2xl font-mono font-bold text-primary mb-6">{ticketId}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/tickets")}>Mina ärenden</Button>
              <Button onClick={() => { setStep(0); setForm({ category: "", title: "", description: "", priority: "Medium", location: "" }); }}>Skapa nytt</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
