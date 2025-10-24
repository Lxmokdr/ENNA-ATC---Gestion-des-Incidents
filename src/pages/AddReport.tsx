import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIncidents } from "@/hooks/useIncidents";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AddReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { softwareIncidents, addReport, getReports } = useIncidents();
  const [reports, setReports] = useState<any[]>([]);

  const incident = softwareIncidents.find((i) => i.id === Number(id));
  const [formData, setFormData] = useState({
    anomaly: "",
    analysis: "",
    conclusion: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsLoading(true);
        
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn("Report loading timeout - setting loading to false");
          setIsLoading(false);
        }, 10000); // 10 second timeout
        
        const incidentReports = await getReports(Number(id));
        clearTimeout(timeoutId);
        setReports(incidentReports);
        
        // If there's already a report, populate the form for editing
        if (incidentReports.length > 0) {
          const existingReport = incidentReports[0];
          setFormData({
            anomaly: existingReport.anomaly || "",
            analysis: existingReport.analysis || "",
            conclusion: existingReport.conclusion || "",
          });
          setIsEditing(true);
        } else {
          // Reset form if no report exists
          setFormData({
            anomaly: "",
            analysis: "",
            conclusion: "",
          });
          setIsEditing(false);
        }
      } catch (error) {
        console.error("Error loading reports:", error);
        // Set empty state on error
        setReports([]);
        setFormData({
          anomaly: "",
          analysis: "",
          conclusion: "",
        });
        setIsEditing(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, [id, getReports]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) return;
    setReportDialogOpen(true);
  };

  const handleReportConfirm = async () => {
    if (!incident) return;

    try {
      await addReport(Number(id), formData);
      if (isEditing) {
        toast.success("Rapport modifié avec succès");
      } else {
        toast.success("Rapport ajouté avec succès");
        setIsEditing(true);
      }
      
      // Refresh reports
      const incidentReports = await getReports(Number(id));
      setReports(incidentReports);
    } catch (error) {
      toast.error(isEditing ? "Erreur lors de la modification du rapport" : "Erreur lors de l'ajout du rapport");
    }
  };

  if (!incident) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/software")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Incident non trouvé
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (incident.incident_type !== 'software') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Les rapports ne peuvent être créés que pour les incidents logiciels.
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Cet incident est de type {incident.incident_type}.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/software")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux incidents
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? "Modifier le rapport" : "Ajouter un rapport"}
        </h1>
        <p className="text-muted-foreground">
          Incident #{incident.id}: {incident.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'incident</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Date</Label>
              <p className="font-medium">{incident.date}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Heure (GMT)</Label>
              <p className="font-medium">{incident.time}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Catégorie</Label>
              <p className="font-medium">{incident.category}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Localisation</Label>
              <p className="font-medium">{incident.location}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-muted-foreground">Description</Label>
              <p className="font-medium">{incident.description}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-muted-foreground">Anomalie observée</Label>
              <p className="font-medium">{incident.anomaly}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Modifier le rapport" : "Nouveau rapport"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Chargement...</div>
            </div>
          ) : (
            <form key={isEditing ? 'editing' : 'creating'} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anomaly">Anomalie observée (pré-remplie depuis l'incident)</Label>
              <Textarea
                id="anomaly"
                placeholder="Décrivez l'anomalie observée..."
                value={formData.anomaly}
                onChange={(e) =>
                  setFormData({ ...formData, anomaly: e.target.value })
                }
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="analysis">Analyse</Label>
              <Textarea
                id="analysis"
                placeholder="Analyse technique de l'incident..."
                value={formData.analysis}
                onChange={(e) =>
                  setFormData({ ...formData, analysis: e.target.value })
                }
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conclusion">Conclusion</Label>
              <Textarea
                id="conclusion"
                placeholder="Conclusion et recommandations..."
                value={formData.conclusion}
                onChange={(e) =>
                  setFormData({ ...formData, conclusion: e.target.value })
                }
                required
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">
              {isEditing ? "Modifier le rapport" : "Ajouter le rapport"}
            </Button>
          </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rapport de l'incident</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun rapport pour cet incident. Créez-en un ci-dessus.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead className="w-40">Date</TableHead>
                    <TableHead>Anomalie</TableHead>
                    <TableHead>Conclusion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>#{report.id}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {report.anomaly}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {report.conclusion}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Confirmation Dialog */}
      <ConfirmationDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        title={isEditing ? "Modifier le rapport" : "Ajouter le rapport"}
        description={`Êtes-vous sûr de vouloir ${isEditing ? "modifier" : "ajouter"} le rapport pour l'incident #${incident?.id} ?`}
        confirmText={isEditing ? "Modifier" : "Ajouter"}
        cancelText="Annuler"
        onConfirm={handleReportConfirm}
        variant="default"
      />
    </div>
  );
}
