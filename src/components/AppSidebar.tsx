import {
  LayoutDashboard, PlusCircle, ListTodo, BarChart3,
  GitBranch, Settings, FileText, Shield, LogOut, User, Zap, Monitor
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const portalItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Skapa ärende", url: "/create", icon: PlusCircle },
  { title: "Mina ärenden", url: "/tickets", icon: ListTodo },
  { title: "Statistik", url: "/stats", icon: BarChart3 },
];

const editorItems = [
  { title: "Flöden", url: "/editor/flows", icon: GitBranch },
];

const adminItems = [
  { title: "CMDB", url: "/admin/cmdb", icon: Monitor },
  { title: "Åtgärder", url: "/admin/actions", icon: Zap },
  { title: "Roller & grupper", url: "/admin/roles", icon: Shield },
  { title: "Loggar", url: "/admin/logs", icon: FileText },
  { title: "Inställningar", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { hasRole, displayName, signOut, user } = useAuth();
  const showEditor = hasRole("editor") || hasRole("admin");
  const showAdmin = hasRole("admin");

  return (
    <Sidebar className="border-r-0">
      <div className="p-4 pb-2">
        <h1 className="text-lg font-heading font-bold text-sidebar-primary">
          Kommunportalen
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-0.5">Ärendehantering</p>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {portalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/"} className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showEditor && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
              Redaktör
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {editorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {showAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="h-4 w-4 text-sidebar-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {displayName || user?.email || "Användare"}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logga ut
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
