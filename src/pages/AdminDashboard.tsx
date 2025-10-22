import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIncidents } from "@/hooks/useIncidents";

export default function AdminDashboard() {
  const { hardwareIncidents, softwareIncidents } = useIncidents();
  const allIncidents = [...hardwareIncidents, ...softwareIncidents];

  const pendingCount = allIncidents.filter((i) => i.status === "En attente").length;
  const inProgressCount = allIncidents.filter((i) => i.status === "En cours").length;
  const resolvedCount = allIncidents.filter((i) => i.status === "Résolu").length;

  const resolutionRate =
    allIncidents.length > 0
      ? ((resolvedCount / allIncidents.length) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Tableau de bord Chef de Service
        </h1>
        <p className="text-muted-foreground">
          Vue synthétique pour la gestion et le suivi
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Total incidents"
          value={allIncidents.length}
          icon={AlertTriangle}
          variant="primary"
        />
        <StatCard
          title="En attente"
          value={pendingCount}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="En cours"
          value={inProgressCount}
          icon={TrendingUp}
          variant="accent"
        />
        <StatCard
          title="Résolus"
          value={resolvedCount}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Charts and Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Taux de résolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative h-40 w-40">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      className="stroke-muted"
                      strokeWidth="10"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="stroke-success"
                      strokeWidth="10"
                      strokeDasharray={`${(Number(resolutionRate) / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{resolutionRate}%</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {resolvedCount} incidents résolus sur {allIncidents.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allIncidents.slice(0, 8).map((incident) => (
              <div
                key={incident.id}
                className="flex items-start justify-between rounded-lg border border-border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">#{incident.id}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {incident.category}
                    </span>
                  </div>
                  <p className="text-sm">{incident.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {incident.location} • {incident.date} à {incident.time}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                    incident.status === "Résolu"
                      ? "bg-success/10 text-success"
                      : incident.status === "En cours"
                      ? "bg-warning/10 text-warning"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {incident.status}
                </span>
              </div>
            ))}
            {allIncidents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucune activité récente
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
