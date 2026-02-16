import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

const mockLogs = [
  { id: "1", actor: "anna.svensson@kommun.se", action: "flow.publish", entity: "IT-Support ärende v2", date: "2025-01-10 14:32" },
  { id: "2", actor: "erik.nilsson@kommun.se", action: "role.assign", entity: "user → editor", date: "2025-01-09 09:15" },
  { id: "3", actor: "system", action: "integration.error", entity: "POST /tickets", date: "2025-01-08 11:45" },
  { id: "4", actor: "anna.svensson@kommun.se", action: "flow.create", entity: "Beställning av utrustning", date: "2025-01-07 16:20" },
  { id: "5", actor: "admin@kommun.se", action: "settings.update", entity: "API base URL", date: "2025-01-06 10:00" },
];

const actionColors: Record<string, string> = {
  "flow.publish": "bg-success/10 text-success",
  "flow.create": "bg-info/10 text-info",
  "role.assign": "bg-warning/10 text-warning",
  "integration.error": "bg-destructive/10 text-destructive",
  "settings.update": "bg-accent/10 text-accent",
};

export default function AuditLogs() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-heading font-bold flex items-center gap-2"><FileText className="h-6 w-6" /> Loggar</h1>
      <Card>
        <CardHeader><CardTitle className="font-heading">Revisionslogg</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Badge variant="secondary" className={actionColors[log.action] + " text-xs shrink-0 mt-0.5"}>
                  {log.action}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm"><span className="font-medium">{log.actor}</span> — {log.entity}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
