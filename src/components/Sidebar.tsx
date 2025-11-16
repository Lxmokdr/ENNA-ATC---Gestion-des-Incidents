import { NavLink } from "react-router-dom";
import { Home, Cpu, HardDrive, FileText, History, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: Home },
  { name: "Incidents Hardware", href: "/hardware", icon: Cpu },
  { name: "Incidents Software", href: "/software", icon: HardDrive },
  { name: "Équipements", href: "/equipment", icon: Server },
  { name: "Historique Global", href: "/history", icon: History },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-25 items-center justify-center border-b border-sidebar-border bg-sidebar-accent">
          <div className="flex items-center gap-2 p-2">
            <div className="h-16 w-16 rounded-lg flex items-center justify-center bg-white">
              <img src="/enna.png" alt="ENNA Logo" className="h-16 w-16 object-contain" />
            </div>
            <span className="text-sidebar-foreground font-bold text-xl">ENNA ATC</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/60 text-center">
            Système de Gestion des Incidents
          </p>
        </div>
      </div>
    </aside>
  );
}
