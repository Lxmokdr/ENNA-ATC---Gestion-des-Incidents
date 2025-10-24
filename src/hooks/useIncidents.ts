import { useState, useEffect, useCallback } from "react";
import { apiClient, Incident, Report, IncidentStats } from "@/services/api";
import { IncidentFormData } from "@/components/IncidentForm";

export function useIncidents() {
  const [hardwareIncidents, setHardwareIncidents] = useState<Incident[]>([]);
  const [softwareIncidents, setSoftwareIncidents] = useState<Incident[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load incidents on mount
  useEffect(() => {
    loadIncidents();
    loadStats();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError(null);

      const [hardwareResponse, softwareResponse] = await Promise.all([
        apiClient.getIncidents({ type: 'hardware' }),
        apiClient.getIncidents({ type: 'software' })
      ]);

      setHardwareIncidents(hardwareResponse.results);
      setSoftwareIncidents(softwareResponse.results);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des incidents");
      console.error("Error loading incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await apiClient.getIncidentStats();
      setStats(statsData);
    } catch (err: any) {
      console.error("Error loading stats:", err);
    }
  };

  const addHardwareIncident = async (data: IncidentFormData) => {
    try {
      const incidentData = {
        incident_type: 'hardware' as const,
        date: data.date,
        time: data.time,
        description: data.description,
        category: data.category,
        location: data.location,
        equipment_name: data.equipmentName,
        partition: data.partition,
        service_name: data.serviceName,
        anomaly: data.anomaly,
        action_taken: data.actionTaken,
        state_after_intervention: data.stateAfterIntervention,
        recommendation: data.recommendation,
        downtime: data.downtime || 0,
      };

      const newIncident = await apiClient.createIncident(incidentData);
      setHardwareIncidents(prev => [newIncident, ...prev]);
      loadStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de l'incident matériel");
      throw err;
    }
  };

  const addSoftwareIncident = async (data: IncidentFormData) => {
    try {
      const incidentData = {
        incident_type: 'software' as const,
        date: data.date,
        time: data.time,
        description: data.description,
        category: data.category,
        location: data.location,
        service_name: data.serviceName,
        software_type: data.softwareType,
        anomaly: data.anomaly,
        action_taken: data.actionTaken,
        state_after_intervention: data.stateAfterIntervention,
        recommendation: data.recommendation,
      };

      const newIncident = await apiClient.createIncident(incidentData);
      setSoftwareIncidents(prev => [newIncident, ...prev]);
      loadStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de l'incident logiciel");
      throw err;
    }
  };

  const deleteHardwareIncident = async (id: number) => {
    try {
      await apiClient.deleteIncident(id);
      setHardwareIncidents(prev => prev.filter(i => i.id !== id));
      loadStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression de l'incident");
      throw err;
    }
  };

  const updateHardwareIncident = async (id: number, data: IncidentFormData) => {
    try {
      const incidentData = {
        incident_type: 'hardware' as const,
        date: data.date,
        time: data.time,
        description: data.description,
        category: data.category,
        location: data.location,
        equipment_name: data.equipmentName,
        partition: data.partition,
        service_name: data.serviceName,
        anomaly: data.anomaly,
        action_taken: data.actionTaken,
        state_after_intervention: data.stateAfterIntervention,
        recommendation: data.recommendation,
        downtime: data.downtime || 0,
      };

      const updatedIncident = await apiClient.updateIncident(id, incidentData);
      setHardwareIncidents(prev => prev.map(i => i.id === id ? updatedIncident : i));
      loadStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour de l'incident");
      throw err;
    }
  };

  const updateSoftwareIncident = async (id: number, data: IncidentFormData) => {
    try {
      const incidentData = {
        incident_type: 'software' as const,
        date: data.date,
        time: data.time,
        description: data.description,
        category: data.category,
        location: data.location,
        service_name: data.serviceName,
        software_type: data.softwareType,
        anomaly: data.anomaly,
        action_taken: data.actionTaken,
        state_after_intervention: data.stateAfterIntervention,
        recommendation: data.recommendation,
      };

      const updatedIncident = await apiClient.updateIncident(id, incidentData);
      setSoftwareIncidents(prev => prev.map(i => i.id === id ? updatedIncident : i));
      loadStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour de l'incident");
      throw err;
    }
  };

  const deleteSoftwareIncident = async (id: number) => {
    try {
      await apiClient.deleteIncident(id);
      setSoftwareIncidents(prev => prev.filter(i => i.id !== id));
      setReports(prev => prev.filter(r => r.incident !== id));
      loadStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression de l'incident");
      throw err;
    }
  };

  const addReport = async (
    incidentId: number,
    data: { anomaly: string; analysis: string; conclusion: string }
  ) => {
    try {
      const reportData = {
        incident: incidentId,
        date: new Date().toISOString().split("T")[0],
        anomaly: data.anomaly,
        analysis: data.analysis,
        conclusion: data.conclusion,
      };

      const report = await apiClient.createReport(reportData);
      
      // Update reports state - either add new or update existing
      setReports(prev => {
        const existingIndex = prev.findIndex(r => r.incident === incidentId);
        if (existingIndex >= 0) {
          // Update existing report
          const updated = [...prev];
          updated[existingIndex] = report;
          return updated;
        } else {
          // Add new report
          return [report, ...prev];
        }
      });
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création/modification du rapport");
      throw err;
    }
  };

  const getReports = useCallback(async (incidentId: number) => {
    try {
      const response = await apiClient.getReports({ incident: incidentId });
      return response.results;
    } catch (err: any) {
      console.error("Error loading reports:", err);
      return [];
    }
  }, []);

  const refreshIncidents = () => {
    loadIncidents();
    loadStats();
  };

  return {
    hardwareIncidents,
    softwareIncidents,
    reports,
    stats,
    loading,
    error,
    addHardwareIncident,
    addSoftwareIncident,
    updateHardwareIncident,
    updateSoftwareIncident,
    deleteHardwareIncident,
    deleteSoftwareIncident,
    addReport,
    getReports,
    refreshIncidents,
  };
}
