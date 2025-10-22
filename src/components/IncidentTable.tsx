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

export interface Incident {
  id: number;
  date: string;
  time: string;
  description: string;
  category: string;
  location: string;
  status: "En attente" | "En cours" | "Résolu";
  softwareType?: string;
  equipmentName?: string;
  partition?: string;
  serviceName?: string;
  anomaly?: string;
  actionTaken?: string;
  stateAfterIntervention?: string;
  recommendation?: string;
  downtime?: string;
}

interface IncidentTableProps {
  incidents: Incident[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onAddReport?: (id: number) => void;
  showReportButton?: boolean;
}

export function IncidentTable({ 
  incidents, 
  onEdit, 
  onDelete, 
  onAddReport,
  showReportButton = false 
}: IncidentTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Résolu":
        return "bg-success text-success-foreground";
      case "En cours":
        return "bg-warning text-warning-foreground";
      case "En attente":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
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
            <TableHead className="w-32">Statut</TableHead>
            <TableHead className="w-40 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
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
                <TableCell>
                  <Badge className={getStatusColor(incident.status)}>
                    {incident.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {showReportButton && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddReport?.(incident.id)}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Ajouter Rapport</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(incident.id)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Modifier</span>
                    </Button>
                    {!showReportButton && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete?.(incident.id)}
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
    </div>
  );
}
