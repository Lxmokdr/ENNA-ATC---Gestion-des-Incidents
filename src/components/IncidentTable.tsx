import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, FileText } from "lucide-react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useState } from "react";

export interface Incident {
  id: number;
  incident_type: 'hardware' | 'software';
  date: string;
  time: string;
  description: string;
  category: string;
  location: string;
  softwareType?: string;
  equipmentName?: string;
  partition?: string;
  serviceName?: string;
  anomaly?: string;
  actionTaken?: string;
  stateAfterIntervention?: string;
  recommendation?: string;
  downtime?: number;
}

interface IncidentTableProps {
  incidents: Incident[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onAddReport?: (id: number) => void;
  showReportButton?: boolean;
  reports?: any[];
}

export function IncidentTable({ 
  incidents, 
  onEdit, 
  onDelete, 
  onAddReport,
  showReportButton = false,
  reports = []
}: IncidentTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const handleDeleteClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedIncident) {
      onDelete?.(selectedIncident.id);
    }
  };

  const handleEditConfirm = () => {
    if (selectedIncident) {
      onEdit?.(selectedIncident.id);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-32">Date</TableHead>
            <TableHead className="w-24">Heure</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-32">Catégorie</TableHead>
            <TableHead className="w-32">Localisation</TableHead>
            {incidents.some(incident => incident.incident_type === 'hardware') && (
              <TableHead className="w-24">Durée</TableHead>
            )}
            <TableHead className="w-40 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={incidents.some(incident => incident.incident_type === 'hardware') ? 8 : 7} className="text-center text-muted-foreground py-8">
                Aucun incident enregistré
              </TableCell>
            </TableRow>
          ) : (
            incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell className="font-medium">#{incident.id}</TableCell>
                <TableCell>{incident.date}</TableCell>
                <TableCell>{incident.time}</TableCell>
                <TableCell className="max-w-md truncate">{incident.description}</TableCell>
                <TableCell>{incident.category}</TableCell>
                <TableCell>{incident.location}</TableCell>
                {incidents.some(i => i.incident_type === 'hardware') && (
                  <TableCell>
                    {incident.incident_type === 'hardware' && incident.downtime 
                      ? `${Math.floor(incident.downtime / 60)}h ${incident.downtime % 60}min` 
                      : "-"}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {showReportButton && incident.incident_type === 'software' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddReport?.(incident.id)}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {reports.some(r => r.incident === incident.id) ? "Modifier Rapport" : "Ajouter Rapport"}
                        </span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(incident)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Modifier</span>
                    </Button>
                    {!showReportButton && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(incident)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer l'incident"
        description={`Êtes-vous sûr de vouloir supprimer l'incident #${selectedIncident?.id} ? Cette action est irréversible et supprimera également tous les rapports associés.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
      
      <ConfirmationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Modifier l'incident"
        description={`Êtes-vous sûr de vouloir modifier l'incident #${selectedIncident?.id} ? Vous serez redirigé vers la page de modification.`}
        confirmText="Modifier"
        cancelText="Annuler"
        onConfirm={handleEditConfirm}
        variant="default"
      />
    </div>
  );
}
