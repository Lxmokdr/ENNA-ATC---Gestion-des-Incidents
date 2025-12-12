// React imports
import { useState, useMemo } from "react";

// Third-party imports
import { Search, HardDrive } from "lucide-react";

// Local hook imports
import { useIncidents } from "@/hooks/useIncidents";

// Local component imports
import { IncidentTable } from "@/components/IncidentTable";

// UI component imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HistorySoftware() {
  const { softwareIncidents } = useIncidents();
  const [filters, setFilters] = useState({
    search: "",
  });

  const filteredIncidents = useMemo(() => {
    return softwareIncidents.filter((incident) => {
      const searchText = filters.search.toLowerCase();
      const matchesSearch =
        (incident.description || '').toLowerCase().includes(searchText) ||
        (incident.sujet || '').toLowerCase().includes(searchText) ||
        (incident.server || '').toLowerCase().includes(searchText) ||
        (incident.type_d_anomalie || '').toLowerCase().includes(searchText);

      return matchesSearch;
    });
  }, [softwareIncidents, filters.search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Historique Software</h1>
        <p className="text-muted-foreground">
          Consulter l'historique des incidents logiciels
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres de recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher par description, sujet, serveur, type d'anomalie..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Incidents Logiciels ({filteredIncidents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentTable incidents={filteredIncidents} />
        </CardContent>
      </Card>
    </div>
  );
}
