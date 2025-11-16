import { useState, useMemo } from "react";
import { AlertTriangle, Cpu, HardDrive, Clock, TrendingUp, Calendar, ArrowUpDown, Server } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useIncidents } from "@/hooks/useIncidents";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { hardwareIncidents, softwareIncidents, stats, loading } = useIncidents();
  
  const [hardwareSortBy, setHardwareSortBy] = useState<string>("date-desc");
  const [softwareSortBy, setSoftwareSortBy] = useState<string>("date-desc");
  
  const sortedHardwareIncidents = useMemo(() => {
    return [...hardwareIncidents].sort((a, b) => {
      switch (hardwareSortBy) {
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
  }, [hardwareIncidents, hardwareSortBy]);
  
  const sortedSoftwareIncidents = useMemo(() => {
    return [...softwareIncidents].sort((a, b) => {
      switch (softwareSortBy) {
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
  }, [softwareIncidents, softwareSortBy]);
  
  // Calculate statistics
  const incidentsWithDowntime = useMemo(() => {
    return hardwareIncidents.filter(i => i.duree_arret && i.duree_arret > 0);
  }, [hardwareIncidents]);
  
  const serverStats = useMemo(() => {
    const stats: Record<string, number> = {};
    softwareIncidents.forEach(inc => {
      if (inc.server) {
        stats[inc.server] = (stats[inc.server] || 0) + 1;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [softwareIncidents]);
  
  const hardwarePartitionStats = useMemo(() => {
    const stats: Record<string, number> = {};
    hardwareIncidents.forEach(inc => {
      if (inc.partition) {
        stats[inc.partition] = (stats[inc.partition] || 0) + 1;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [hardwareIncidents]);
  
  const softwarePartitionStats = useMemo(() => {
    const stats: Record<string, number> = {};
    softwareIncidents.forEach(inc => {
      if (inc.partition) {
        stats[inc.partition] = (stats[inc.partition] || 0) + 1;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [softwareIncidents]);
  
  const totalIncidents = stats?.total_incidents || hardwareIncidents.length + softwareIncidents.length;

  // Prepare data for charts
  const incidentsByDay = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        day: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        hardware: 0,
        software: 0,
        total: 0
      };
    });

    [...hardwareIncidents, ...softwareIncidents].forEach(incident => {
      const incidentDate = incident.date || incident.created_at?.split('T')[0];
      if (incidentDate) {
        const dayData = last30Days.find(d => d.date === incidentDate);
        if (dayData) {
          if (incident.incident_type === 'hardware') {
            dayData.hardware++;
          } else {
            dayData.software++;
          }
          dayData.total++;
        }
      }
    });

    return last30Days;
  }, [hardwareIncidents, softwareIncidents]);

  // Pie chart data for incident types
  const incidentTypeData = [
    { name: 'Matériel', value: hardwareIncidents.length, color: '#3b82f6' },
    { name: 'Logiciel', value: softwareIncidents.length, color: '#f59e0b' }
  ];

  // Bar chart data for top partitions
  const topPartitionsData = useMemo(() => {
    const allPartitions: Record<string, number> = {};
    [...hardwareIncidents, ...softwareIncidents].forEach(inc => {
      if (inc.partition) {
        allPartitions[inc.partition] = (allPartitions[inc.partition] || 0) + 1;
      }
    });
    return Object.entries(allPartitions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [hardwareIncidents, softwareIncidents]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const months: Record<string, { hardware: number; software: number }> = {};
    [...hardwareIncidents, ...softwareIncidents].forEach(incident => {
      const date = new Date(incident.date || incident.created_at || Date.now());
      const monthKey = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      if (!months[monthKey]) {
        months[monthKey] = { hardware: 0, software: 0 };
      }
      if (incident.incident_type === 'hardware') {
        months[monthKey].hardware++;
      } else {
        months[monthKey].software++;
      }
    });
    return Object.entries(months)
      .map(([month, data]) => ({ month, ...data, total: data.hardware + data.software }))
      .slice(-6); // Last 6 months
  }, [hardwareIncidents, softwareIncidents]);

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

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
          trend="Tous types confondus"
        />
        <StatCard
          title="Incidents Matériels"
          value={stats?.hardware_incidents || hardwareIncidents.length}
          icon={Cpu}
          variant="accent"
          trend={stats?.hardware_last_7_days !== undefined ? `Dont ${stats.hardware_last_7_days} ces 7 derniers jours` : undefined}
        />
        <StatCard
          title="Incidents Logiciels"
          value={stats?.software_incidents || softwareIncidents.length}
          icon={HardDrive}
          variant="warning"
          trend={stats?.software_last_7_days !== undefined ? `Dont ${stats.software_last_7_days} ces 7 derniers jours` : undefined}
        />
        <StatCard
          title="Temps d'arrêt total"
          value={stats?.hardware_downtime_minutes && stats.hardware_downtime_minutes > 0 ? stats.hardware_downtime_minutes : 0}
          icon={Clock}
          variant="warning"
          trend={stats?.hardware_downtime_minutes && stats.hardware_downtime_minutes > 0 ? `${Math.floor(stats.hardware_downtime_minutes / 60)}h ${stats.hardware_downtime_minutes % 60}min` : "Aucune donnée"}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Durée moyenne d'arrêt"
          value={stats?.hardware_avg_downtime_minutes && stats.hardware_avg_downtime_minutes > 0 ? stats.hardware_avg_downtime_minutes : 0}
          icon={TrendingUp}
          variant="accent"
          trend={stats?.hardware_avg_downtime_minutes && stats.hardware_avg_downtime_minutes > 0 ? `${Math.floor(stats.hardware_avg_downtime_minutes / 60)}h ${stats.hardware_avg_downtime_minutes % 60}min` : "N/A"}
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
        <StatCard
          title="Matériel - 30 derniers jours"
          value={stats?.hardware_last_30_days || 0}
          icon={Calendar}
          variant="accent"
        />
        <StatCard
          title="Logiciel - 30 derniers jours"
          value={stats?.software_last_30_days || 0}
          icon={Calendar}
          variant="warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Incidents Over Time - Line Chart */}
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
                  dataKey="hardware" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Matériel"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="software" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Logiciel"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Total"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incident Types Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Répartition par type d'incident
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incidentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incidentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* More Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Partitions - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Top 10 Partitions (incidents)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPartitionsData}>
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
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tendance mensuelle (6 derniers mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hardware" fill="#3b82f6" name="Matériel" radius={[8, 8, 0, 0]} />
                <Bar dataKey="software" fill="#f59e0b" name="Logiciel" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hardware Statistics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Statistiques Matériel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hardwarePartitionStats.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Répartition par partition</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {hardwarePartitionStats.slice(0, 6).map(([partition, count]) => (
                      <div key={partition} className="text-center p-2 rounded-lg border border-border bg-muted/30">
                        <div className="text-lg font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground">{partition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Software Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Statistiques Logiciel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serverStats.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Répartition par serveur</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {serverStats.slice(0, 6).map(([server, count]) => (
                      <div key={server} className="text-center p-2 rounded-lg border border-border bg-muted/30">
                        <div className="text-lg font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground">{server}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {softwarePartitionStats.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Répartition par partition</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {softwarePartitionStats.slice(0, 6).map(([partition, count]) => (
                      <div key={partition} className="text-center p-2 rounded-lg border border-border bg-muted/30">
                        <div className="text-lg font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground">{partition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hardware Incidents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Incidents Matériels Récents
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-hardware" className="text-sm">Trier par:</Label>
              <Select value={hardwareSortBy} onValueChange={setHardwareSortBy}>
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
            {sortedHardwareIncidents.slice(0, 10).map((incident) => (
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
            {sortedHardwareIncidents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun incident matériel
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Software Incidents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Incidents Logiciels Récents
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-software" className="text-sm">Trier par:</Label>
              <Select value={softwareSortBy} onValueChange={setSoftwareSortBy}>
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
            {sortedSoftwareIncidents.slice(0, 10).map((incident) => (
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
                    {incident.game && (
                      <> • Game: {incident.game}</>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {sortedSoftwareIncidents.length === 0 && (
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
