import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pobApi } from "@/lib/mock-api";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare } from "lucide-react";

const statusColor: Record<string, string> = {
  open: "bg-info text-info-foreground",
  in_progress: "bg-warning text-warning-foreground",
  resolved: "bg-success text-success-foreground",
  closed: "bg-muted text-muted-foreground",
};
const statusLabel: Record<string, string> = {
  open: "Öppen", in_progress: "Pågående", resolved: "Löst", closed: "Stängd",
};

export default function TicketDetail() {
  const { id } = useParams();
  const { data: ticket, isLoading } = useQuery({ queryKey: ["ticket", id], queryFn: () => pobApi.getTicket(id!) });

  if (isLoading) return <p className="text-muted-foreground">Laddar...</p>;
  if (!ticket) return <p className="text-muted-foreground">Ärende hittades inte</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Link to="/tickets">
        <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Tillbaka</Button>
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-mono text-muted-foreground">{ticket.id}</span>
          <Badge className={statusColor[ticket.status]}>{statusLabel[ticket.status]}</Badge>
          <Badge variant="outline">{ticket.priority}</Badge>
        </div>
        <h1 className="text-2xl font-heading font-bold">{ticket.title}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="font-heading text-lg">Beskrivning</CardTitle></CardHeader>
          <CardContent><p>{ticket.description}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">Detaljer</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Kategori</span><span>{ticket.category}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Skapad</span><span>{new Date(ticket.createdAt).toLocaleDateString("sv-SE")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Uppdaterad</span><span>{new Date(ticket.updatedAt).toLocaleDateString("sv-SE")}</span></div>
            {ticket.assignedTo && <div className="flex justify-between"><span className="text-muted-foreground">Tilldelad</span><span>{ticket.assignedTo}</span></div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Kommentarer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ticket.comments.length === 0 ? (
            <p className="text-muted-foreground text-sm">Inga kommentarer ännu</p>
          ) : (
            <div className="space-y-4">
              {ticket.comments.map((c, i) => (
                <div key={i} className="border-l-2 border-primary/20 pl-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{c.author}</span>
                    <span className="text-xs text-muted-foreground">{new Date(c.date).toLocaleDateString("sv-SE")}</span>
                  </div>
                  <p className="text-sm mt-1">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
