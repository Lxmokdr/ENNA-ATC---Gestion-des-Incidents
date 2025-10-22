import { useNavigate } from "react-router-dom";
import { IncidentForm, IncidentFormData } from "@/components/IncidentForm";
import { IncidentTable } from "@/components/IncidentTable";
import { useIncidents } from "@/hooks/useIncidents";
import { toast } from "sonner";

export default function SoftwareIncidents() {
  const navigate = useNavigate();
  const { softwareIncidents, addSoftwareIncident, deleteSoftwareIncident } = useIncidents();

  const handleSubmit = (data: IncidentFormData) => {
    addSoftwareIncident(data);
    toast.success("Incident logiciel ajouté avec succès");
  };

  const handleDelete = (id: number) => {
    deleteSoftwareIncident(id);
    toast.success("Incident supprimé");
  };

  const handleAddReport = (id: number) => {
    navigate(`/software/report/${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Gestion des Incidents Software
        </h1>
        <p className="text-muted-foreground">
          Enregistrer et suivre les incidents liés aux logiciels (Software)
        </p>
      </div>

      <IncidentForm
        onSubmit={handleSubmit}
        type="software"
        title="Nouveau incident software"
      />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Historique des incidents software
        </h2>
        <IncidentTable
          incidents={softwareIncidents}
          onDelete={handleDelete}
          onAddReport={handleAddReport}
          showReportButton
        />
      </div>
    </div>
  );
}
