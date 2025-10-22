import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IncidentTable, Incident } from "@/components/IncidentTable";
import { useIncidents } from "@/hooks/useIncidents";
import { Search } from "lucide-react";

export default function History() {
  const { hardwareIncidents, softwareIncidents } = useIncidents();
  const allIncidents = [...hardwareIncidents, ...softwareIncidents];

  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
  });

  const filteredIncidents = allIncidents.filter((incident) => {
    const matchesSearch =
      incident.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      incident.location.toLowerCase().includes(filters.search.toLowerCase());

    const matchesType =
      filters.type === "all" ||
      (filters.type === "hardware" && hardwareIncidents.includes(incident)) ||
      (filters.type === "software" && softwareIncidents.includes(incident));

    const matchesStatus =
      filters.status === "all" || incident.status === filters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Historique Global</h1>
        <p className="text-muted-foreground">
          Consulter l'ensemble des incidents enregistrés
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres de recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type d'incident</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="hardware">Matériel</SelectItem>
                  <SelectItem value="software">Logiciel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Résolu">Résolu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Tous les incidents ({filteredIncidents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentTable incidents={filteredIncidents} />
        </CardContent>
      </Card>
    </div>
  );
}
