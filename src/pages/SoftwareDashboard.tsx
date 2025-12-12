import { useState, useMemo } from "react";
import { HardDrive, Calendar, AlertTriangle, Server, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useIncidents } from "@/hooks/useIncidents";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SoftwareDashboard() {
  const { softwareIncidents, stats, loading } = useIncidents();
  const [sortBy, setSortBy] = useState<string>("date-desc");
  
  const sortedIncidents = useMemo(() => {
    return [...softwareIncidents].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime();
        case "date-asc":
          return new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime();
        case "serveur-asc":
          const srvA = a.server || '';
          const srvB = b.server || '';
          return srvA.localeCompare(srvB);
        case "serveur-desc":
          const srvA2 = a.server || '';
          const srvB2 = b.server || '';
          return srvB2.localeCompare(srvA2);
        case "sujet-asc":
          const sujetA = a.sujet || '';
          const sujetB = b.sujet || '';
          return sujetA.localeCompare(sujetB);
        case "sujet-desc":
          const sujetA2 = a.sujet || '';
          const sujetB2 = b.sujet || '';
          return sujetB2.localeCompare(sujetA2);
        default:
          return 0;
      }
    });
  }, [softwareIncidents, sortBy]);

  // Prepare chart data
  const incidentsByDay = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        day: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        incidents: 0
      };
    });

    softwareIncidents.forEach(incident => {
      const incidentDate = incident.date || incident.created_at?.split('T')[0];
      if (incidentDate) {
        const dayData = last30Days.find(d => d.date === incidentDate);
        if (dayData) {
          dayData.incidents++;
        }
      }
    });

    return last30Days;
  }, [softwareIncidents]);

  // Calculate server statistics
  const serverStats = useMemo(() => {
    const stats: Record<string, number> = {};
    softwareIncidents.forEach(inc => {
      if (inc.server) {
        stats[inc.server] = (stats[inc.server] || 0) + 1;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [softwareIncidents]);

  const mostCommonServer = serverStats[0];
  const totalWithReports = useMemo(() => {
    // This would need to be calculated if we have access to reports count
    return 0;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Tableau de bord - Incidents Logiciels
        </h1>
        <p className="text-muted-foreground">
          Vue d'ensemble des incidents logiciels et statistiques
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total incidents logiciels"
          value={stats?.software_incidents || softwareIncidents.length}
          icon={HardDrive}
          variant="warning"
          trend={stats?.software_last_7_days !== undefined ? `Dont ${stats.software_last_7_days} ces 7 derniers jours` : undefined}
        />
        <StatCard
          title="Logiciel - 30 derniers jours"
          value={stats?.software_last_30_days || 0}
          icon={Calendar}
          variant="warning"
        />
        <StatCard
          title="Serveur le plus touché"
          value={mostCommonServer ? `${mostCommonServer[0]} (${mostCommonServer[1]})` : "N/A"}
          icon={Server}
          variant="accent"
        />
        <StatCard
          title="Partition la plus touchée"
          value={(() => {
            const partitionCounts: Record<string, number> = {};
            softwareIncidents.forEach(inc => {
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

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Incidents Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des incidents (30 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incidentsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Incidents"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Server Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Répartition par serveur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serverStats.slice(0, 10).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Server Breakdown */}
      {serverStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition par serveur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {serverStats.map(([server, count]) => (
                <div key={server} className="text-center p-3 rounded-lg border border-border bg-muted/30">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">{server}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Software Incidents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Incidents logiciels récents</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-software" className="text-sm">Trier par:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-software" className="w-[200px]">
                  <SelectValue placeholder="Trier..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (plus récent)</SelectItem>
                  <SelectItem value="date-asc">Date (plus ancien)</SelectItem>
                  <SelectItem value="serveur-asc">Serveur (A-Z)</SelectItem>
                  <SelectItem value="serveur-desc">Serveur (Z-A)</SelectItem>
                  <SelectItem value="sujet-asc">Sujet (A-Z)</SelectItem>
                  <SelectItem value="sujet-desc">Sujet (Z-A)</SelectItem>
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
                    {incident.server && (
                      <>
                        <span className="text-sm font-medium">
                          Serveur: {incident.server}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                      </>
                    )}
                    {incident.sujet && (
                      <span className="text-sm font-medium">
                        {incident.sujet}
                      </span>
                    )}
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
                    {incident.type_d_anomalie && (
                      <> • Type d'anomalie: {incident.type_d_anomalie}</>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {sortedIncidents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun incident logiciel
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

