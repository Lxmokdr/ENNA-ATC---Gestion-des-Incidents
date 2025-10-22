import { User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-border bg-card">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-foreground">
            Système de Gestion des Incidents
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent"></span>
          </Button>
          
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Agent ENNA</span>
          </div>
        </div>
      </div>
    </header>
  );
}
