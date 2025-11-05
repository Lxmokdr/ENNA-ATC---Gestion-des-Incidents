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
import { Edit, Trash2, FileText, Printer } from "lucide-react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useState } from "react";
import { Report } from "@/services/api";

export interface Incident {
  id: number;
  incident_type: 'hardware' | 'software';
  date: string;
  time: string;
  description: string;
  // Hardware fields
  nom_de_equipement?: string;
  partition?: string;
  numero_de_serie?: string;
  anomalie_observee?: string;
  action_realisee?: string;
  piece_de_rechange_utilisee?: string;
  etat_de_equipement_apres_intervention?: string;
  recommendation?: string;
  // Software fields
  simulateur?: boolean;
  salle_operationnelle?: boolean;
  game?: string;
  group?: string;
  exercice?: string;
  secteur?: string;
  position_STA?: string;
  position_logique?: string;
  type_d_anomalie?: string;
  indicatif?: string;
  mode_radar?: string;
  FL?: string;
  longitude?: string;
  latitude?: string;
  code_SSR?: string;
  sujet?: string;
  commentaires?: string;
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
  
  const handlePrint = async (incident: Incident) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Determine incident type for title and fields
    const isHardware = incident.incident_type === 'hardware';
    const incidentTypeLabel = isHardware ? 'Matériel' : 'Logiciel';
    
    // Try to fetch report for software incidents
    let report: Report | null = null;
    if (!isHardware && onAddReport) {
      try {
        const { apiClient } = await import('@/services/api');
        const reportsResponse = await apiClient.getReports({ incident: incident.id });
        if (reportsResponse.results && reportsResponse.results.length > 0) {
          report = reportsResponse.results[0];
        }
      } catch (err) {
        console.error('Error loading report:', err);
      }
    }
    
    // Helper to escape HTML
    const escapeHtml = (text: string | undefined | null) => {
      if (!text) return 'N/A';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    // Helper to format field groups
    const renderFieldGroup = (label: string, fields: Array<{label: string, value: any}>) => {
      return `
        <tr>
          <th colspan="2" style="text-align: left; background-color: #f0f0f0; color: #333;">${label}</th>
        </tr>
        ${fields.map(field => `
          <tr>
            <td class="label">${field.label}</td>
            <td class="value">${escapeHtml(field.value)}</td>
          </tr>
        `).join('')}
      `;
    };
    
    // Create HTML content matching form layout
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Incident ${incidentTypeLabel} #${incident.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              max-width: 1200px; 
              margin: 0 auto;
              background: #fff;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #007bff;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #007bff;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .actions {
              margin-bottom: 20px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
              display: flex;
              gap: 10px;
              align-items: center;
            }
            .actions button {
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            }
            .actions button:hover {
              background: #0056b3;
            }
            .actions button.secondary {
              background: #6c757d;
            }
            .actions button.secondary:hover {
              background: #545b62;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th {
              background-color: #007bff;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #0056b3;
            }
            td {
              padding: 12px;
              border: 1px solid #ddd;
              vertical-align: top;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .label {
              font-weight: bold;
              color: #333;
              width: 35%;
              background-color: #f8f9fa;
            }
            .value {
              color: #555;
              word-wrap: break-word;
            }
            .description-field {
              white-space: pre-wrap;
              line-height: 1.6;
            }
            .report-section {
              margin-top: 30px;
              page-break-before: auto;
            }
            .report-section h2 {
              color: #007bff;
              border-bottom: 2px solid #007bff;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            @media print {
              body { padding: 10px; }
              .actions { display: none !important; }
              .header { page-break-after: avoid; }
              table { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Incident ${incidentTypeLabel} #${incident.id}</h1>
            <p>École Nationale de l'Aviation Civile (ENNA)</p>
            <p>Document généré le ${new Date().toLocaleString('fr-FR')}</p>
          </div>
          
          <div class="actions">
            <button onclick="window.print()">Imprimer l'incident</button>
            ${!isHardware ? `
              ${report ? `
                <button class="secondary" onclick="printReport()">Imprimer le rapport</button>
                <button class="secondary" onclick="window.open('/software/report/${incident.id}', '_blank')">Modifier le rapport</button>
              ` : `
                <button class="secondary" onclick="window.open('/software/report/${incident.id}', '_blank')">Ajouter un rapport</button>
              `}
            ` : ''}
          </div>
          
          <table>
            <tr>
              <th colspan="2" style="text-align: center; font-size: 18px;">INFORMATIONS GÉNÉRALES</th>
            </tr>
            ${renderFieldGroup('', [
              { label: 'ID de l\'Incident', value: incident.id },
              { label: 'Date', value: incident.date },
              { label: 'Heure (GMT)', value: incident.time }
            ])}
            ${isHardware ? `
              ${renderFieldGroup('ÉQUIPEMENT', [
                { label: 'Nom de l\'équipement', value: incident.nom_de_equipement },
                { label: 'Partition', value: incident.partition },
                { label: 'Numéro de série', value: incident.numero_de_serie }
              ])}
              ${renderFieldGroup('DESCRIPTION', [
                { label: 'Description', value: incident.description },
                { label: 'Anomalie observée', value: incident.anomalie_observee }
              ])}
              ${renderFieldGroup('INTERVENTION', [
                { label: 'Action réalisée', value: incident.action_realisee },
                { label: 'Pièce de rechange utilisée', value: incident.piece_de_rechange_utilisee },
                { label: 'État de l\'équipement après intervention', value: incident.etat_de_equipement_apres_intervention },
                { label: 'Recommandation', value: incident.recommendation }
              ])}
            ` : `
              ${renderFieldGroup('CONFIGURATION', [
                { label: 'Simulateur', value: incident.simulateur === true ? 'Oui' : incident.simulateur === false ? 'Non' : 'Non spécifié' },
                { label: 'Salle opérationnelle', value: incident.salle_operationnelle === true ? 'Oui' : incident.salle_operationnelle === false ? 'Non' : 'Non spécifié' },
                { label: 'Game', value: incident.game },
                { label: 'Partition', value: incident.partition },
                { label: 'Group', value: incident.group },
                { label: 'Exercice', value: incident.exercice },
                { label: 'Secteur', value: incident.secteur }
              ])}
              ${renderFieldGroup('POSITION', [
                { label: 'Position STA', value: incident.position_STA },
                { label: 'Position logique', value: incident.position_logique }
              ])}
              ${renderFieldGroup('ANOMALIE', [
                { label: 'Type d\'anomalie', value: incident.type_d_anomalie },
                { label: 'Indicatif', value: incident.indicatif },
                { label: 'Mode radar', value: incident.mode_radar },
                { label: 'FL (ou altitude)', value: incident.FL }
              ])}
              ${renderFieldGroup('COORDONNÉES', [
                { label: 'Longitude', value: incident.longitude },
                { label: 'Latitude', value: incident.latitude },
                { label: 'Code SSR', value: incident.code_SSR }
              ])}
              ${renderFieldGroup('DESCRIPTION', [
                { label: 'Sujet', value: incident.sujet },
                { label: 'Description', value: incident.description },
                { label: 'Commentaires', value: incident.commentaires }
              ])}
            `}
          </table>
          
          ${!isHardware && report ? `
            <div class="report-section">
              <h2>RAPPORT D'INCIDENT</h2>
              <table id="report-table">
                <tr>
                  <th colspan="2" style="text-align: center;">DÉTAILS DU RAPPORT</th>
                </tr>
                ${renderFieldGroup('', [
                  { label: 'Date du rapport', value: report.date },
                  { label: 'Heure du rapport', value: report.time },
                  { label: 'Anomalie', value: report.anomaly }
                ])}
                <tr>
                  <td class="label">Analyse</td>
                  <td class="value description-field">${escapeHtml(report.analysis)}</td>
                </tr>
                <tr>
                  <td class="label">Conclusion</td>
                  <td class="value description-field">${escapeHtml(report.conclusion)}</td>
                </tr>
              </table>
            </div>
          ` : ''}
          
          <script>
            function printReport() {
              const reportTable = document.getElementById('report-table');
              if (!reportTable) return;
              
              const printContent = document.head.outerHTML + 
                '<body>' + 
                '<div class="header"><h1>Rapport d\'Incident Logiciel #${incident.id}</h1><p>École Nationale de l\'Aviation Civile (ENNA)</p></div>' +
                reportTable.outerHTML +
                '</body>';
              
              const reportWindow = window.open('', '_blank');
              if (reportWindow) {
                reportWindow.document.write(printContent);
                reportWindow.document.close();
                reportWindow.onload = () => reportWindow.print();
              }
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
            {incidents.some(incident => incident.incident_type === 'hardware') && (
              <TableHead className="w-40">Équipement</TableHead>
            )}
            {incidents.some(incident => incident.incident_type === 'software') && (
              <TableHead className="w-40">Sujet</TableHead>
            )}
            <TableHead className="w-40 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
                {incidents.some(i => i.incident_type === 'hardware') && (
                  <TableCell className="max-w-md truncate">
                    {incident.incident_type === 'hardware' ? (incident.nom_de_equipement || "-") : "-"}
                  </TableCell>
                )}
                {incidents.some(i => i.incident_type === 'software') && (
                  <TableCell className="max-w-md truncate">
                    {incident.incident_type === 'software' ? (incident.sujet || "-") : "-"}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrint(incident)}
                      className="flex items-center gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span className="hidden sm:inline">Imprimer</span>
                    </Button>
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
