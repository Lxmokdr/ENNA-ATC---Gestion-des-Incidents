import { AlertTriangle, Cpu, HardDrive } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIncidents } from "@/hooks/useIncidents";

export default function AdminDashboard() {
  const { hardwareIncidents, softwareIncidents, stats, loading } = useIncidents();
  const allIncidents = [...hardwareIncidents, ...softwareIncidents];
  const totalIncidents = stats?.total_incidents || hardwareIncidents.length + softwareIncidents.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Tableau de bord Chef de service
        </h1>
        <p className="text-muted-foreground">
          Vue d'ensemble complète des incidents techniques et statistiques
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total des incidents"
          value={totalIncidents}
          icon={AlertTriangle}
          variant="primary"
          trend="Dernière mise à jour: aujourd'hui"
        />
        <StatCard
          title="Incidents Matériels"
          value={stats?.hardware_incidents || hardwareIncidents.length}
          icon={Cpu}
          variant="accent"
        />
        <StatCard
          title="Incidents Logiciels"
          value={stats?.software_incidents || softwareIncidents.length}
          icon={HardDrive}
          variant="warning"
        />
        <StatCard
          title="Temps d'arrêt matériel"
          value={stats?.hardware_downtime_minutes || 0}
          icon={AlertTriangle}
          variant="warning"
          trend={stats?.hardware_downtime_minutes ? `${Math.floor(stats.hardware_downtime_minutes / 60)}h ${stats.hardware_downtime_minutes % 60}min` : "0h 0min"}
        />
      </div>

      {/* Charts and Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Matériel</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.hardware_incidents || hardwareIncidents.length} incidents
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{
                      width: `${totalIncidents > 0 ? ((stats?.hardware_incidents || hardwareIncidents.length) / totalIncidents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Logiciel</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.software_incidents || softwareIncidents.length} incidents
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${totalIncidents > 0 ? ((stats?.software_incidents || softwareIncidents.length) / totalIncidents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temps d'arrêt par catégorie matérielle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">
                  {stats?.hardware_downtime_minutes && stats.hardware_downtime_minutes > 0 
                    ? `Total: ${Math.floor(stats.hardware_downtime_minutes / 60)}h ${stats.hardware_downtime_minutes % 60}min`
                    : "Aucun temps d'arrêt matériel enregistré"
                  }
                </p>
                {stats?.hardware_incidents && stats.hardware_incidents > 0 && (
                  <p className="text-xs mt-1">
                    Moyenne par incident: {Math.round(stats.hardware_downtime_minutes / stats.hardware_incidents)}min
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["Alimentation", "Communication", "Réseau", "Affichage Radar", "Base de données", "Serveur"].map((category) => {
              const count = allIncidents.filter((i) => i.category === category).length;
              const percentage =
                allIncidents.length > 0 ? (count / allIncidents.length) * 100 : 0;

              if (count === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allIncidents
              .slice(0, 8)
              .map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{incident.id}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {incident.category}
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {incident.incident_type === 'hardware' ? 'Matériel' : 'Logiciel'}
                      </span>
                    </div>
                    <p className="text-sm">{incident.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {incident.location} • {incident.date} à {incident.time}
                    </p>
                  </div>
                </div>
              ))}
            {allIncidents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun incident récent
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
