import { useNavigate } from "react-router-dom";
import { IncidentForm, IncidentFormData } from "@/components/IncidentForm";
import { IncidentTable } from "@/components/IncidentTable";
import { useIncidents } from "@/hooks/useIncidents";
import { toast } from "sonner";

export default function HardwareIncidents() {
  const navigate = useNavigate();
  const { hardwareIncidents, addHardwareIncident, deleteHardwareIncident } = useIncidents();

  const handleSubmit = (data: IncidentFormData) => {
    addHardwareIncident(data);
    toast.success("Incident matériel ajouté avec succès");
  };

  const handleEdit = (id: number) => {
    navigate(`/incident/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    deleteHardwareIncident(id);
    toast.success("Incident supprimé");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Gestion des Incidents Hardware
        </h1>
        <p className="text-muted-foreground">
          Enregistrer et suivre les incidents liés au matériel (Hardware)
        </p>
      </div>

      <IncidentForm
        onSubmit={handleSubmit}
        type="hardware"
        title="Nouveau incident hardware"
      />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Historique des incidents hardware
        </h2>
        <IncidentTable
          incidents={hardwareIncidents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
