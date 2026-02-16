import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function IntegrationSettings() {
  const [baseUrl, setBaseUrl] = useState("https://adapter.kommun.se/api/v1");
  const [timeout, setTimeout_] = useState("30");
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    await new Promise(r => setTimeout(r, 1000));
    setHealthy(true);
    setChecking(false);
    toast.success("Adapter-API svarar korrekt");
  };

  const save = () => toast.success("Inställningar sparade (mock)");

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-heading font-bold flex items-center gap-2"><Settings className="h-6 w-6" /> Inställningar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Adapter-API (POB G6)</CardTitle>
          <CardDescription>Konfiguration för integrationen mot ärendesystemet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Bas-URL</Label>
            <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Timeout (sekunder)</Label>
              <Input type="number" value={timeout} onChange={e => setTimeout_(e.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-2 mt-2">
                {healthy === null ? (
                  <Badge variant="outline">Ej kontrollerad</Badge>
                ) : healthy ? (
                  <Badge className="bg-success/10 text-success"><CheckCircle className="mr-1 h-3 w-3" /> Ansluten</Badge>
                ) : (
                  <Badge className="bg-destructive/10 text-destructive"><XCircle className="mr-1 h-3 w-3" /> Fel</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={checkHealth} disabled={checking}>
              <RefreshCw className={`mr-1 h-4 w-4 ${checking ? "animate-spin" : ""}`} /> Testa anslutning
            </Button>
            <Button onClick={save}>Spara</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            {[
              "GET /me", "GET /catalog", "POST /tickets", "GET /tickets",
              "GET /tickets/{id}", "GET /lookups/{type}", "GET /stats"
            ].map(ep => (
              <div key={ep} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                <Badge variant="outline" className="text-xs">{ep.split(" ")[0]}</Badge>
                <span>{ep.split(" ").slice(1).join(" ")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
