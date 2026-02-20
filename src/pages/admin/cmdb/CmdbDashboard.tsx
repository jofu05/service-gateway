import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Monitor, Server, Database, Globe, Users, Laptop, AppWindow,
  Search, ArrowRight
} from "lucide-react";
import * as admin from "@/lib/cmdb/admin";

interface DashboardStats {
  users: number;
  devices: number;
  systems: number;
  servers: number;
  databases: number;
  apis: number;
  applications: number;
}

export default function CmdbDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const [users, devices, systems, servers, databases, apis, applications] = await Promise.all([
        admin.getAllUsers(),
        admin.getAllDevices(),
        admin.getAllSystems(),
        admin.getAllServers(),
        admin.getAllDatabases(),
        admin.getAllApis(),
        admin.getAllApplications(),
      ]);
      setStats({
        users: users.length,
        devices: devices.length,
        systems: systems.length,
        servers: servers.length,
        databases: databases.length,
        apis: apis.length,
        applications: applications.length,
      });
    })();
  }, []);

  const tiles = [
    { key: "users", label: "Användare", icon: Users, path: "/admin/cmdb/users", color: "text-primary" },
    { key: "devices", label: "Enheter", icon: Laptop, path: "/admin/cmdb/devices", color: "text-accent" },
    { key: "systems", label: "System", icon: Monitor, path: "/admin/cmdb/systems", color: "text-info" },
    { key: "servers", label: "Servrar", icon: Server, path: "/admin/cmdb/servers", color: "text-warning" },
    { key: "databases", label: "Databaser", icon: Database, path: "/admin/cmdb/databases", color: "text-emerald-500" },
    { key: "apis", label: "API:er", icon: Globe, path: "/admin/cmdb/apis", color: "text-rose-500" },
    { key: "applications", label: "Applikationer", icon: AppWindow, path: "/admin/cmdb/applications", color: "text-violet-500" },
  ] as const;

  const filtered = search
    ? tiles.filter(t => t.label.toLowerCase().includes(search.toLowerCase()))
    : tiles;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">CMDB</h1>
        <p className="text-muted-foreground text-sm">Hantera konfigurationsobjekt – användare, enheter, system och infrastruktur</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Sök i CMDB..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(tile => {
          const Icon = tile.icon;
          const count = stats?.[tile.key as keyof DashboardStats] ?? "—";
          return (
            <Card
              key={tile.key}
              className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              onClick={() => navigate(tile.path)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-muted ${tile.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-heading">{count}</p>
                <p className="text-sm text-muted-foreground">{tile.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
