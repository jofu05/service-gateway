import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pobApi, PobTicket } from "@/lib/mock-api";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

const statusColor: Record<string, string> = {
  open: "bg-info text-info-foreground",
  in_progress: "bg-warning text-warning-foreground",
  resolved: "bg-success text-success-foreground",
  closed: "bg-muted text-muted-foreground",
};
const statusLabel: Record<string, string> = {
  open: "Öppen", in_progress: "Pågående", resolved: "Löst", closed: "Stängd",
};

export default function MyTickets() {
  const { data: tickets, isLoading } = useQuery({ queryKey: ["tickets"], queryFn: () => pobApi.getTickets() });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = tickets?.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-heading font-bold">Mina ärenden</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Sök ärenden..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla statusar</SelectItem>
            <SelectItem value="open">Öppna</SelectItem>
            <SelectItem value="in_progress">Pågående</SelectItem>
            <SelectItem value="resolved">Lösta</SelectItem>
            <SelectItem value="closed">Stängda</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Laddar...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Inga ärenden hittades</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((t: PobTicket) => (
            <Link key={t.id} to={`/tickets/${t.id}`}>
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                      <Badge variant="secondary" className={statusColor[t.status] + " text-xs"}>{statusLabel[t.status]}</Badge>
                      <Badge variant="outline" className="text-xs">{t.category}</Badge>
                    </div>
                    <p className="font-medium truncate">{t.title}</p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{t.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("sv-SE")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.priority}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
