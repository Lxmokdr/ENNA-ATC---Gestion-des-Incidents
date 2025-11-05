import { useState, useMemo } from "react";
import { Cpu, Clock, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useIncidents } from "@/hooks/useIncidents";

export default function HardwareDashboard() {
  const { hardwareIncidents, stats, loading } = useIncidents();
  const [sortBy, setSortBy] = useState<string>("date-desc");
  
  const sortedIncidents = useMemo(() => {
    return [...hardwareIncidents].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime();
        case "date-asc":
          return new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime();
        case "equipement-asc":
          const eqA = a.nom_de_equipement || '';
          const eqB = b.nom_de_equipement || '';
          return eqA.localeCompare(eqB);
        case "equipement-desc":
          const eqA2 = a.nom_de_equipement || '';
          const eqB2 = b.nom_de_equipement || '';
          return eqB2.localeCompare(eqA2);
        case "duree-asc":
          const durA = a.duree_arret || 0;
          const durB = b.duree_arret || 0;
          return durA - durB;
        case "duree-desc":
          const durA2 = a.duree_arret || 0;
          const durB2 = b.duree_arret || 0;
          return durB2 - durA2;
        default:
          return 0;
      }
    });
  }, [hardwareIncidents, sortBy]);

  const incidentsWithDowntime = useMemo(() => {
    return hardwareIncidents.filter(i => i.duree_arret && i.duree_arret > 0);
  }, [hardwareIncidents]);

  const totalDowntime = useMemo(() => {
    return incidentsWithDowntime.reduce((sum, i) => sum + (i.duree_arret || 0), 0);
  }, [incidentsWithDowntime]);

  const avgDowntime = useMemo(() => {
    return incidentsWithDowntime.length > 0 
      ? Math.round(totalDowntime / incidentsWithDowntime.length) 
      : 0;
  }, [incidentsWithDowntime, totalDowntime]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Tableau de bord - Incidents Matériels
        </h1>
        <p className="text-muted-foreground">
          Vue d'ensemble des incidents matériels et statistiques
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total incidents matériels"
          value={stats?.hardware_incidents || hardwareIncidents.length}
          icon={Cpu}
          variant="accent"
          trend={stats?.hardware_last_7_days !== undefined ? `Dont ${stats.hardware_last_7_days} ces 7 derniers jours` : undefined}
        />
        <StatCard
          title="Temps d'arrêt total"
          value={stats?.hardware_downtime_minutes && stats.hardware_downtime_minutes > 0 ? stats.hardware_downtime_minutes : totalDowntime}
          icon={Clock}
          variant="warning"
          trend={stats?.hardware_downtime_minutes && stats.hardware_downtime_minutes > 0 
            ? `${Math.floor(stats.hardware_downtime_minutes / 60)}h ${stats.hardware_downtime_minutes % 60}min` 
            : totalDowntime > 0 
              ? `${Math.floor(totalDowntime / 60)}h ${totalDowntime % 60}min`
              : "Aucune donnée"}
        />
        <StatCard
          title="Durée moyenne d'arrêt"
          value={stats?.hardware_avg_downtime_minutes && stats.hardware_avg_downtime_minutes > 0 ? stats.hardware_avg_downtime_minutes : avgDowntime}
          icon={TrendingUp}
          variant="accent"
          trend={stats?.hardware_avg_downtime_minutes && stats.hardware_avg_downtime_minutes > 0 
            ? `${Math.floor(stats.hardware_avg_downtime_minutes / 60)}h ${stats.hardware_avg_downtime_minutes % 60}min` 
            : avgDowntime > 0
              ? `${Math.floor(avgDowntime / 60)}h ${avgDowntime % 60}min`
              : "N/A"}
        />
        <StatCard
          title="Incidents avec arrêt"
          value={stats?.hardware_incidents_with_downtime || incidentsWithDowntime.length}
          icon={AlertTriangle}
          variant="primary"
          trend={stats?.hardware_downtime_percentage !== undefined 
            ? `${stats.hardware_downtime_percentage}% des incidents matériels` 
            : hardwareIncidents.length > 0
              ? `${Math.round((incidentsWithDowntime.length / hardwareIncidents.length) * 100)}% des incidents`
              : undefined}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Matériel - 7 derniers jours"
          value={stats?.hardware_last_7_days || 0}
          icon={Calendar}
          variant="accent"
        />
        <StatCard
          title="Matériel - 30 derniers jours"
          value={stats?.hardware_last_30_days || 0}
          icon={Calendar}
          variant="accent"
        />
        <StatCard
          title="Partition la plus touchée"
          value={(() => {
            const partitionCounts: Record<string, number> = {};
            hardwareIncidents.forEach(inc => {
              if (inc.partition) {
                partitionCounts[inc.partition] = (partitionCounts[inc.partition] || 0) + 1;
              }
            });
            const mostCommon = Object.entries(partitionCounts).sort((a, b) => b[1] - a[1])[0];
            return mostCommon ? `${mostCommon[0]} (${mostCommon[1]})` : "N/A";
          })()}
          icon={AlertTriangle}
          variant="primary"
        />
      </div>

      {/* Recent Hardware Incidents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Incidents matériels récents</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-hardware" className="text-sm">Trier par:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-hardware" className="w-[200px]">
                  <SelectValue placeholder="Trier..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (plus récent)</SelectItem>
                  <SelectItem value="date-asc">Date (plus ancien)</SelectItem>
                  <SelectItem value="equipement-asc">Équipement (A-Z)</SelectItem>
                  <SelectItem value="equipement-desc">Équipement (Z-A)</SelectItem>
                  <SelectItem value="duree-asc">Durée d'arrêt (croissant)</SelectItem>
                  <SelectItem value="duree-desc">Durée d'arrêt (décroissant)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedIncidents.slice(0, 10).map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">#{incident.id}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm font-medium">
                      {incident.nom_de_equipement || "Équipement non spécifié"}
                    </span>
                    {incident.partition && (
                      <>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          Partition: {incident.partition}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm">{incident.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {incident.date} à {incident.time}
                    {incident.duree_arret && incident.duree_arret > 0 && (
                      <> • Durée d'arrêt: {Math.floor(incident.duree_arret / 60)}h {incident.duree_arret % 60}min</>
                    )}
                    {incident.numero_de_serie && (
                      <> • S/N: {incident.numero_de_serie}</>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {sortedIncidents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun incident matériel
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

