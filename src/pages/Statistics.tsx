import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pobApi } from "@/lib/mock-api";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileDown, TrendingUp, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = [
  "hsl(211, 65%, 38%)",
  "hsl(165, 45%, 40%)",
  "hsl(35, 80%, 55%)",
  "hsl(280, 45%, 50%)",
];

export default function Statistics() {
  const { data: stats, isLoading } = useQuery({ queryKey: ["stats"], queryFn: () => pobApi.getStats() });

  if (isLoading || !stats) return <p className="text-muted-foreground">Laddar statistik...</p>;

  const exportCSV = () => {
    const rows = [["Kategori", "Antal"], ...stats.byCategory.map(c => [c.category, String(c.count)])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "statistik.csv"; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Statistik</h1>
        <Button variant="outline" size="sm" onClick={exportCSV}><FileDown className="mr-1 h-4 w-4" /> Exportera CSV</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"><Hash className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="text-2xl font-heading font-bold">{stats.totalTickets}</p>
              <p className="text-sm text-muted-foreground">Totalt antal ärenden</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center"><Clock className="h-6 w-6 text-accent" /></div>
            <div>
              <p className="text-2xl font-heading font-bold">{stats.avgResolutionDays}</p>
              <p className="text-sm text-muted-foreground">Snitt handläggningstid (dagar)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center"><TrendingUp className="h-6 w-6 text-warning" /></div>
            <div>
              <p className="text-2xl font-heading font-bold">{stats.byMonth[stats.byMonth.length - 1]?.count ?? 0}</p>
              <p className="text-sm text-muted-foreground">Ärenden denna månad</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-heading">Ärenden per månad</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(211, 65%, 38%)" radius={[4, 4, 0, 0]} name="Antal" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading">Per kategori</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.byCategory} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="category" label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {stats.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
