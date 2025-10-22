import { useState } from "react";
import { Incident } from "@/components/IncidentTable";
import { IncidentFormData } from "@/components/IncidentForm";

interface Report {
  id: number;
  incidentId: number;
  date: string;
  anomaly: string;
  analysis: string;
  conclusion: string;
}

const mockHardwareIncidents: Incident[] = [
  {
    id: 1,
    date: "2025-10-20",
    time: "14:30",
    description: "Panne d'alimentation secteur - Tour de contrôle",
    category: "Alimentation",
    location: "Tour principale - Niveau 3",
    status: "Résolu",
  },
  {
    id: 2,
    date: "2025-10-21",
    time: "09:15",
    description: "Défaillance du système de communication radio",
    category: "Communication",
    location: "Salle technique - Poste 2",
    status: "En cours",
  },
];

const mockSoftwareIncidents: Incident[] = [
  {
    id: 3,
    date: "2025-10-21",
    time: "11:45",
    description: "Erreur d'affichage radar - Piste non visible",
    category: "Affichage Radar",
    location: "Poste de contrôle A1",
    status: "En attente",
  },
  {
    id: 4,
    date: "2025-10-22",
    time: "08:00",
    description: "Base de données de plans de vol inaccessible",
    category: "Base de données",
    location: "Serveur principal",
    status: "En cours",
  },
];

export function useIncidents() {
  const [hardwareIncidents, setHardwareIncidents] = useState<Incident[]>(mockHardwareIncidents);
  const [softwareIncidents, setSoftwareIncidents] = useState<Incident[]>(mockSoftwareIncidents);
  const [reports, setReports] = useState<Report[]>([]);
  const [nextId, setNextId] = useState(5);

  const addHardwareIncident = (data: IncidentFormData) => {
    const newIncident: Incident = {
      id: nextId,
      date: data.date,
      time: data.time,
      description: data.description,
      category: data.category,
      location: data.location,
      status: data.status as "En attente" | "En cours" | "Résolu",
      equipmentName: data.equipmentName,
      partition: data.partition,
      serviceName: data.serviceName,
      anomaly: data.anomaly,
      actionTaken: data.actionTaken,
      stateAfterIntervention: data.stateAfterIntervention,
      recommendation: data.recommendation,
      downtime: data.downtime,
    };
    setHardwareIncidents([...hardwareIncidents, newIncident]);
    setNextId(nextId + 1);
  };

  const addSoftwareIncident = (data: IncidentFormData) => {
    const newIncident: Incident = {
      id: nextId,
      date: data.date,
      time: data.time,
      description: data.description,
      category: data.category,
      location: data.location,
      status: data.status as "En attente" | "En cours" | "Résolu",
      softwareType: data.softwareType,
      anomaly: data.anomaly,
    };
    setSoftwareIncidents([...softwareIncidents, newIncident]);
    setNextId(nextId + 1);
  };

  const deleteHardwareIncident = (id: number) => {
    setHardwareIncidents(hardwareIncidents.filter((i) => i.id !== id));
  };

  const deleteSoftwareIncident = (id: number) => {
    setSoftwareIncidents(softwareIncidents.filter((i) => i.id !== id));
    setReports(reports.filter((r) => r.incidentId !== id));
  };

  const addReport = (
    incidentId: number,
    data: { anomaly: string; analysis: string; conclusion: string }
  ) => {
    const newReport: Report = {
      id: reports.length + 1,
      incidentId,
      date: new Date().toISOString().split("T")[0],
      ...data,
    };
    setReports([...reports, newReport]);
  };

  const getReports = (incidentId: number) => {
    return reports.filter((r) => r.incidentId === incidentId);
  };

  return {
    hardwareIncidents,
    softwareIncidents,
    addHardwareIncident,
    addSoftwareIncident,
    deleteHardwareIncident,
    deleteSoftwareIncident,
    addReport,
    getReports,
  };
}
