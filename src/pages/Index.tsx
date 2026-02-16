import { PlusCircle, ListTodo, BarChart3, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { pobApi, PobTicket } from "@/lib/mock-api";
import { useQuery } from "@tanstack/react-query";

const statusColor: Record<string, string> = {
  open: "bg-info text-info-foreground",
  in_progress: "bg-warning text-warning-foreground",
  resolved: "bg-success text-success-foreground",
  closed: "bg-muted text-muted-foreground",
};

const statusLabel: Record<string, string> = {
  open: "Öppen",
  in_progress: "Pågående",
  resolved: "Löst",
  closed: "Stängd",
};

export default function Index() {
  const { displayName } = useAuth();
  const { data: tickets } = useQuery({ queryKey: ["tickets"], queryFn: () => pobApi.getTickets() });

  const recentTickets = tickets?.slice(0, 4) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">
          Välkommen{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">Här är en översikt av dina ärenden</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/create">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20 hover:border-primary/40">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-heading font-semibold">Skapa ärende</p>
                <p className="text-sm text-muted-foreground">Nytt ärende eller beställning</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/tickets">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20 hover:border-primary/40">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <ListTodo className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-heading font-semibold">Mina ärenden</p>
                <p className="text-sm text-muted-foreground">Se och följ dina ärenden</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/stats">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20 hover:border-primary/40">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="font-heading font-semibold">Statistik</p>
                <p className="text-sm text-muted-foreground">Översikt och nyckeltal</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Senaste ärenden
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <p className="text-muted-foreground text-sm">Inga ärenden ännu.</p>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((t: PobTicket) => (
                <Link key={t.id} to={`/tickets/${t.id}`} className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                        <Badge variant="secondary" className={statusColor[t.status] + " text-xs"}>
                          {statusLabel[t.status]}
                        </Badge>
                      </div>
                      <p className="font-medium truncate mt-0.5">{t.title}</p>
                    </div>
                    <span className="text-xs text-muted-foreground ml-4 shrink-0">
                      {new Date(t.updatedAt).toLocaleDateString("sv-SE")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
