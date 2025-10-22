import { AlertTriangle, Cpu, HardDrive } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIncidents } from "@/hooks/useIncidents";

export default function Dashboard() {
  const { hardwareIncidents, softwareIncidents } = useIncidents();

  const totalIncidents = hardwareIncidents.length + softwareIncidents.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble des incidents techniques
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total des incidents"
          value={totalIncidents}
          icon={AlertTriangle}
          variant="primary"
          trend="Dernière mise à jour: aujourd'hui"
        />
        <StatCard
          title="Incidents Matériels"
          value={hardwareIncidents.length}
          icon={Cpu}
          variant="accent"
        />
        <StatCard
          title="Incidents Logiciels"
          value={softwareIncidents.length}
          icon={HardDrive}
          variant="warning"
        />
      </div>

      {/* Charts */}
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
                    {hardwareIncidents.length} incidents
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{
                      width: `${totalIncidents > 0 ? (hardwareIncidents.length / totalIncidents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Logiciel</span>
                  <span className="text-sm text-muted-foreground">
                    {softwareIncidents.length} incidents
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${totalIncidents > 0 ? (softwareIncidents.length / totalIncidents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut des incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["En attente", "En cours", "Résolu"].map((status) => {
                const count = [...hardwareIncidents, ...softwareIncidents].filter(
                  (i) => i.status === status
                ).length;
                const percentage = totalIncidents > 0 ? (count / totalIncidents) * 100 : 0;
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{status}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          status === "Résolu"
                            ? "bg-success"
                            : status === "En cours"
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
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

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...hardwareIncidents, ...softwareIncidents]
              .slice(0, 5)
              .map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{incident.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {incident.location} • {incident.date} à {incident.time}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
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
            {totalIncidents === 0 && (
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
