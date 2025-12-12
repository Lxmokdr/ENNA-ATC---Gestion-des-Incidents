import { useState, useMemo } from "react";
import { AlertTriangle, Cpu, HardDrive, Clock, TrendingUp, Calendar, ArrowUpDown, Server } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useIncidents } from "@/hooks/useIncidents";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type PeriodType = 'week' | 'month' | 'year';

export default function AdminDashboard() {
  const { hardwareIncidents, softwareIncidents, stats, loading } = useIncidents();
  
  const [hardwareSortBy, setHardwareSortBy] = useState<string>("date-desc");
  const [softwareSortBy, setSoftwareSortBy] = useState<string>("date-desc");
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Get available years from incidents
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    [...hardwareIncidents, ...softwareIncidents].forEach(incident => {
      const date = new Date(incident.date || incident.created_at || Date.now());
      years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }, [hardwareIncidents, softwareIncidents]);
  
  const currentYear = new Date().getFullYear();
  const isCurrentYear = selectedYear === currentYear;
  
  // Filter incidents by selected year and maintenance type
  const filteredHardwareIncidents = useMemo(() => {
    return hardwareIncidents.filter(incident => {
      const incidentDate = new Date(incident.date || incident.created_at || Date.now());
      const incidentYear = incidentDate.getFullYear();
      
      // Filter by year
      if (incidentYear !== selectedYear) {
        return false;
      }
      
      // For previous years, only show corrective maintenance
      if (!isCurrentYear && incident.maintenance_type !== 'corrective') {
        return false;
      }
      
      return true;
    });
  }, [hardwareIncidents, selectedYear, isCurrentYear]);
  
  const filteredSoftwareIncidents = useMemo(() => {
    return softwareIncidents.filter(incident => {
      const incidentDate = new Date(incident.date || incident.created_at || Date.now());
      const incidentYear = incidentDate.getFullYear();
      return incidentYear === selectedYear;
    });
  }, [softwareIncidents, selectedYear]);
  
  const sortedHardwareIncidents = useMemo(() => {
    return [...filteredHardwareIncidents].sort((a, b) => {
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
  }, [filteredHardwareIncidents, hardwareSortBy]);
  
  const sortedSoftwareIncidents = useMemo(() => {
    return [...filteredSoftwareIncidents].sort((a, b) => {
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
  }, [filteredSoftwareIncidents, softwareSortBy]);
  
  // Calculate statistics using filtered incidents
  const incidentsWithDowntime = useMemo(() => {
    return filteredHardwareIncidents.filter(i => i.duree_arret && i.duree_arret > 0);
  }, [filteredHardwareIncidents]);
  
  const serverStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredSoftwareIncidents.forEach(inc => {
      if (inc.server) {
        stats[inc.server] = (stats[inc.server] || 0) + 1;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [filteredSoftwareIncidents]);
  
  const hardwareServerStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredHardwareIncidents.forEach(inc => {
      // For hardware, we can use partition as server equivalent, or extract server from equipment name
      const server = inc.partition || 'Non spécifié';
      stats[server] = (stats[server] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [filteredHardwareIncidents]);

  const softwareServerStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredSoftwareIncidents.forEach(inc => {
      if (inc.server) {
        stats[inc.server] = (stats[inc.server] || 0) + 1;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [filteredSoftwareIncidents]);

  const maintenanceTypeStats = useMemo(() => {
    const stats = { preventive: 0, corrective: 0 };
    filteredHardwareIncidents.forEach(inc => {
      if (inc.maintenance_type === 'preventive') {
        stats.preventive++;
      } else if (inc.maintenance_type === 'corrective') {
        stats.corrective++;
      }
    });
    return stats;
  }, [filteredHardwareIncidents]);
  
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

    filteredHardwareIncidents.forEach(incident => {
      const incidentDate = incident.date || incident.created_at?.split('T')[0];
      if (incidentDate) {
        const dayData = last30Days.find(d => d.date === incidentDate);
        if (dayData) {
          dayData.hardware++;
          dayData.total++;
        }
      }
    });
    
    filteredSoftwareIncidents.forEach(incident => {
      const incidentDate = incident.date || incident.created_at?.split('T')[0];
      if (incidentDate) {
        const dayData = last30Days.find(d => d.date === incidentDate);
        if (dayData) {
          dayData.software++;
          dayData.total++;
        }
      }
    });

    return last30Days;
  }, [filteredHardwareIncidents, filteredSoftwareIncidents]);

  // Bar chart data for top servers (separated by hardware/software)
  const topHardwareServersData = useMemo(() => {
    const servers: Record<string, number> = {};
    filteredHardwareIncidents.forEach(inc => {
      const server = inc.partition || 'Non spécifié';
      servers[server] = (servers[server] || 0) + 1;
    });
    return Object.entries(servers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [filteredHardwareIncidents]);

  const topSoftwareServersData = useMemo(() => {
    const servers: Record<string, number> = {};
    filteredSoftwareIncidents.forEach(inc => {
      if (inc.server) {
        servers[inc.server] = (servers[inc.server] || 0) + 1;
      }
    });
    return Object.entries(servers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [filteredSoftwareIncidents]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const months: Record<string, { hardware: number; software: number }> = {};
    filteredHardwareIncidents.forEach(incident => {
      const date = new Date(incident.date || incident.created_at || Date.now());
      const monthKey = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      if (!months[monthKey]) {
        months[monthKey] = { hardware: 0, software: 0 };
      }
      months[monthKey].hardware++;
    });
    filteredSoftwareIncidents.forEach(incident => {
      const date = new Date(incident.date || incident.created_at || Date.now());
      const monthKey = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      if (!months[monthKey]) {
        months[monthKey] = { hardware: 0, software: 0 };
      }
      months[monthKey].software++;
    });
    return Object.entries(months)
      .map(([month, data]) => ({ month, ...data, total: data.hardware + data.software }))
      .slice(-6); // Last 6 months
  }, [filteredHardwareIncidents, filteredSoftwareIncidents]);

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

  // Helper function to get period key from date
  const getPeriodKey = (date: Date, period: PeriodType): string => {
    if (period === 'week') {
      const year = date.getFullYear();
      const week = getWeekNumber(date);
      // Get the Monday of the week for better sorting
      const monday = getMondayOfWeek(date);
      const month = monday.toLocaleDateString('fr-FR', { month: 'short' });
      return `${year}-S${week.toString().padStart(2, '0')} (${month})`;
    } else if (period === 'month') {
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    } else {
      return date.getFullYear().toString();
    }
  };

  // Helper function to get Monday of the week
  const getMondayOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Total incidents by period
  const incidentsByPeriod = useMemo(() => {
    const periodMap: Record<string, { total: number; hardware: number; software: number }> = {};
    
    filteredHardwareIncidents.forEach(incident => {
      const incidentDate = new Date(incident.date || incident.created_at || Date.now());
      const periodKey = getPeriodKey(incidentDate, periodType);
      
      if (!periodMap[periodKey]) {
        periodMap[periodKey] = { total: 0, hardware: 0, software: 0 };
      }
      
      periodMap[periodKey].total++;
      periodMap[periodKey].hardware++;
    });
    
    filteredSoftwareIncidents.forEach(incident => {
      const incidentDate = new Date(incident.date || incident.created_at || Date.now());
      const periodKey = getPeriodKey(incidentDate, periodType);
      
      if (!periodMap[periodKey]) {
        periodMap[periodKey] = { total: 0, hardware: 0, software: 0 };
      }
      
      periodMap[periodKey].total++;
      periodMap[periodKey].software++;
    });

    return Object.entries(periodMap)
      .map(([period, data]) => ({ period, ...data }))
      .sort((a, b) => {
        // Sort by period key (works for year, month, and week formats)
        return a.period.localeCompare(b.period);
      });
  }, [filteredHardwareIncidents, filteredSoftwareIncidents, periodType]);

  // Incidents by equipment
  const incidentsByEquipment = useMemo(() => {
    const equipmentMap: Record<string, number> = {};
    
    filteredHardwareIncidents.forEach(incident => {
      const equipmentName = incident.nom_de_equipement || 'Non spécifié';
      equipmentMap[equipmentName] = (equipmentMap[equipmentName] || 0) + 1;
    });

    return Object.entries(equipmentMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15) // Top 15 equipment
      .map(([name, value]) => ({ name, value }));
  }, [filteredHardwareIncidents]);

  // Software incidents by anomaly type (grouped by period)
  const softwareIncidentsByAnomaly = useMemo(() => {
    const anomalyMap: Record<string, Record<string, number>> = {};
    
    filteredSoftwareIncidents.forEach(incident => {
      const anomalyType = incident.type_d_anomalie || 'Non spécifié';
      const incidentDate = new Date(incident.date || incident.created_at || Date.now());
      const periodKey = getPeriodKey(incidentDate, periodType);
      
      if (!anomalyMap[anomalyType]) {
        anomalyMap[anomalyType] = {};
      }
      
      anomalyMap[anomalyType][periodKey] = (anomalyMap[anomalyType][periodKey] || 0) + 1;
    });

    // Get all unique periods
    const allPeriods = new Set<string>();
    Object.values(anomalyMap).forEach(periodData => {
      Object.keys(periodData).forEach(period => allPeriods.add(period));
    });
    const sortedPeriods = Array.from(allPeriods).sort();

    // Transform to chart data format
    const chartData = sortedPeriods.map(period => {
      const data: Record<string, any> = { period };
      Object.keys(anomalyMap).forEach(anomalyType => {
        data[anomalyType] = anomalyMap[anomalyType][period] || 0;
      });
      return data;
    });

    return {
      chartData,
      anomalyTypes: Object.keys(anomalyMap).sort(),
      anomalyCounts: Object.entries(anomalyMap).map(([type, periods]) => ({
        type,
        total: Object.values(periods).reduce((sum, count) => sum + count, 0)
      })).sort((a, b) => b.total - a.total)
    };
  }, [filteredSoftwareIncidents, periodType]);

  // Corrective incidents comparison across years (using ALL incidents, not filtered)
  const correctiveIncidentsByYear = useMemo(() => {
    const yearMap: Record<number, number> = {};
    
    hardwareIncidents.forEach(incident => {
      if (incident.maintenance_type === 'corrective') {
        const incidentDate = new Date(incident.date || incident.created_at || Date.now());
        const year = incidentDate.getFullYear();
        yearMap[year] = (yearMap[year] || 0) + 1;
      }
    });

    return Object.entries(yearMap)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);
  }, [hardwareIncidents]);

  // Corrective incidents comparison across servers (using ALL incidents, not filtered)
  const correctiveIncidentsByServer = useMemo(() => {
    const serverMap: Record<string, number> = {};
    
    hardwareIncidents.forEach(incident => {
      if (incident.maintenance_type === 'corrective') {
        const server = incident.partition || 'Non spécifié';
        serverMap[server] = (serverMap[server] || 0) + 1;
      }
    });

    return Object.entries(serverMap)
      .map(([server, count]) => ({ server, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15 servers
  }, [hardwareIncidents]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Vue d'ensemble complète des incidents techniques et statistiques
        </p>
      </div>

      {/* Hardware Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="h-6 w-6" />
            Incidents Matériels
          </h2>
        </div>

        {/* Hardware Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Incidents Matériels"
            value={filteredHardwareIncidents.length}
            icon={Cpu}
            variant="accent"
            trend={!isCurrentYear ? "Uniquement maintenance corrective" : undefined}
          />
          <StatCard
            title="Temps d'arrêt total"
            value={stats?.hardware_downtime_minutes && stats.hardware_downtime_minutes > 0 ? stats.hardware_downtime_minutes : 0}
            icon={Clock}
            variant="warning"
            trend={stats?.hardware_downtime_minutes && stats.hardware_downtime_minutes > 0 ? `${Math.floor(stats.hardware_downtime_minutes / 60)}h ${stats.hardware_downtime_minutes % 60}min` : "Aucune donnée"}
          />
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
        </div>

        {/* Hardware Secondary Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="30 derniers jours"
            value={stats?.hardware_last_30_days || 0}
            icon={Calendar}
            variant="accent"
          />
          {isCurrentYear && (
            <StatCard
              title="Maintenance Préventive"
              value={maintenanceTypeStats.preventive}
              icon={TrendingUp}
              variant="accent"
              trend={`${filteredHardwareIncidents.length > 0 ? Math.round((maintenanceTypeStats.preventive / filteredHardwareIncidents.length) * 100) : 0}% des incidents matériels`}
            />
          )}
          <StatCard
            title="Maintenance Corrective"
            value={maintenanceTypeStats.corrective}
            icon={AlertTriangle}
            variant="warning"
            trend={`${filteredHardwareIncidents.length > 0 ? Math.round((maintenanceTypeStats.corrective / filteredHardwareIncidents.length) * 100) : 0}% des incidents matériels`}
          />
        </div>
      </div>

      {/* Software Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <HardDrive className="h-6 w-6" />
            Incidents Logiciels
          </h2>
        </div>

        {/* Software Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Incidents Logiciels"
            value={filteredSoftwareIncidents.length}
            icon={HardDrive}
            variant="warning"
          />
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Période d'analyse
            </CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label htmlFor="year-select" className="text-sm">Année:</Label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger id="year-select" className="w-[150px]">
                    <SelectValue placeholder="Année..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year} {year === currentYear ? '(actuelle)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="period-select" className="text-sm">Grouper par:</Label>
                <Select value={periodType} onValueChange={(value) => setPeriodType(value as PeriodType)}>
                  <SelectTrigger id="period-select" className="w-[180px]">
                    <SelectValue placeholder="Période..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Semaine</SelectItem>
                    <SelectItem value="month">Mois</SelectItem>
                    <SelectItem value="year">Année</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {!isCurrentYear && (
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium">Note:</span> Pour les années précédentes, seuls les incidents de maintenance corrective sont affichés pour les incidents matériels.
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Hardware Incidents by Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Incidents Matériels par {periodType === 'week' ? 'semaine' : periodType === 'month' ? 'mois' : 'année'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={incidentsByPeriod}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hardware" fill="#3b82f6" name="Matériel" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Software Incidents by Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Incidents Logiciels par {periodType === 'week' ? 'semaine' : periodType === 'month' ? 'mois' : 'année'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={incidentsByPeriod}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="software" fill="#f59e0b" name="Logiciel" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hardware Charts Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Cpu className="h-6 w-6" />
          Graphiques - Matériel
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Hardware Incidents Over Time - Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Évolution des incidents matériels (30 derniers jours)
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
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend - Hardware */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tendance mensuelle - Matériel (6 derniers mois)
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
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Software Charts Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HardDrive className="h-6 w-6" />
          Graphiques - Logiciel
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Software Incidents Over Time - Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Évolution des incidents logiciels (30 derniers jours)
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
                    dataKey="software" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Logiciel"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend - Software */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tendance mensuelle - Logiciel (6 derniers mois)
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
                  <Bar dataKey="software" fill="#f59e0b" name="Logiciel" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Software Incidents by Anomaly Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Incidents logiciels par type d'anomalie ({periodType === 'week' ? 'par semaine' : periodType === 'month' ? 'par mois' : 'par année'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {softwareIncidentsByAnomaly.anomalyTypes.length > 0 ? (
            <div className="space-y-6">
              {/* Stacked Bar Chart */}
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={softwareIncidentsByAnomaly.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {softwareIncidentsByAnomaly.anomalyTypes.map((anomalyType, index) => (
                    <Bar 
                      key={anomalyType}
                      dataKey={anomalyType} 
                      stackId="a"
                      fill={COLORS[index % COLORS.length]}
                      name={anomalyType}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              
              {/* Summary Table */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Résumé par type d'anomalie</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {softwareIncidentsByAnomaly.anomalyCounts.map((item) => (
                    <div key={item.type} className="text-center p-3 rounded-lg border border-border bg-muted/30">
                      <div className="text-2xl font-bold">{item.total}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucun incident logiciel avec type d'anomalie enregistré
            </p>
          )}
        </CardContent>
      </Card>

      {/* Hardware Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Hardware Servers - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Top 10 Serveurs - Incidents Matériels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topHardwareServersData}>
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

        {/* Incidents by Equipment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Incidents par équipement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incidentsByEquipment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={200}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Software Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Software Servers - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Top 10 Serveurs - Incidents Logiciels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSoftwareServersData}>
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

      {/* Comparison Charts for Corrective Incidents */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" />
          Comparaisons - Maintenance Corrective
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Corrective Incidents by Year */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Incidents Correctifs par Année
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={correctiveIncidentsByYear}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Année', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: "Nombre d'incidents", angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#ef4444" name="Incidents Correctifs" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Corrective Incidents by Server */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Incidents Correctifs par Serveur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={correctiveIncidentsByServer} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="server" 
                    type="category" 
                    width={150}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#ef4444" name="Incidents Correctifs" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hardware Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Statistiques Matériel - Répartition par Serveur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hardwareServerStats.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Répartition par serveur</h4>
                <div className="grid grid-cols-2 gap-2">
                  {hardwareServerStats.slice(0, 6).map(([server, count]) => (
                    <div key={server} className="text-center p-2 rounded-lg border border-border bg-muted/30">
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs text-muted-foreground">{server}</div>
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
            Statistiques Logiciel - Répartition par Serveur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {softwareServerStats.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Répartition par serveur</h4>
                <div className="grid grid-cols-2 gap-2">
                  {softwareServerStats.slice(0, 6).map(([server, count]) => (
                    <div key={server} className="text-center p-2 rounded-lg border border-border bg-muted/30">
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs text-muted-foreground">{server}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
