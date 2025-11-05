import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIncidents } from "@/hooks/useIncidents";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface IncidentFormData {
  date: string;
  time: string;
  description: string;
  category: string;
  location: string;
  downtime?: number;
  softwareType?: string;
  equipmentName?: string;
  partition?: string;
  serviceName?: string;
  anomaly?: string;
  actionTaken?: string;
  stateAfterIntervention?: string;
  recommendation?: string;
}

export default function EditIncident() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hardwareIncidents, softwareIncidents, updateHardwareIncident, updateSoftwareIncident } = useIncidents();

  const incident = [...hardwareIncidents, ...softwareIncidents].find(i => i.id === Number(id));
  const isHardware = incident?.incident_type === 'hardware';

  const [formData, setFormData] = useState<IncidentFormData>({
    date: "",
    time: "",
    description: "",
    category: "",
    location: "",
    downtime: 0,
    softwareType: "",
    equipmentName: "",
    partition: "",
    serviceName: "",
    anomaly: "",
    actionTaken: "",
    stateAfterIntervention: "",
    recommendation: "",
  });

  useEffect(() => {
    if (incident) {
      setFormData({
        date: incident.date,
        time: incident.time,
        description: incident.description,
        category: incident.category,
        location: incident.location,
        downtime: incident.downtime || 0,
        softwareType: incident.software_type || "",
        equipmentName: incident.equipment_name || "",
        partition: incident.partition || "",
        serviceName: incident.service_name || "",
        anomaly: incident.anomaly || "",
        actionTaken: incident.action_taken || "",
        stateAfterIntervention: incident.state_after_intervention || "",
        recommendation: incident.recommendation || "",
      });
    }
  }, [incident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) return;

    try {
      if (isHardware) {
        await updateHardwareIncident(Number(id), formData);
        toast.success("Incident matériel modifié avec succès");
      } else {
        await updateSoftwareIncident(Number(id), formData);
        toast.success("Incident logiciel modifié avec succès");
      }
      navigate(-1);
    } catch (error) {
      toast.error("Erreur lors de la modification de l'incident");
    }
  };

  if (!incident) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
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

  const hardwareCategories = ["Alimentation", "Communication", "Réseau", "Autre"];
  const softwareCategories = ["Affichage Radar", "Base de données", "Serveur", "Autre"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Modifier l'incident #{incident.id}
          </h1>
          <p className="text-muted-foreground">
            {isHardware ? "Incident matériel" : "Incident logiciel"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modifier l'incident</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Heure</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez l'incident en détail"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(isHardware ? hardwareCategories : softwareCategories).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  placeholder="Ex: Salle serveur, Tour de contrôle"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {isHardware ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="downtime">Durée de la panne (minutes)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="downtime"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Ex: 150"
                      value={formData.downtime !== undefined ? formData.downtime.toString() : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setFormData({ ...formData, downtime: 0 });
                        } else {
                          const numValue = parseInt(value, 10);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setFormData({ ...formData, downtime: numValue });
                          }
                        }
                      }}
                      required
                    />
                    <div className="flex items-center text-sm text-muted-foreground">
                      min
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Entrez la durée en minutes (ex: 120 pour 2h, 90 pour 1h30)
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="equipmentName">Nom de l'équipement</Label>
                    <Input
                      id="equipmentName"
                      placeholder="Ex: Serveur principal"
                      value={formData.equipmentName}
                      onChange={(e) =>
                        setFormData({ ...formData, equipmentName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partition">Partition</Label>
                    <Input
                      id="partition"
                      placeholder="Ex: Partition A"
                      value={formData.partition}
                      onChange={(e) =>
                        setFormData({ ...formData, partition: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceName">Nom du service</Label>
                  <Input
                    id="serviceName"
                    placeholder="Ex: Service de contrôle aérien"
                    value={formData.serviceName}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anomaly">Anomalie observée</Label>
                  <Textarea
                    id="anomaly"
                    placeholder="Décrivez l'anomalie observée"
                    value={formData.anomaly}
                    onChange={(e) =>
                      setFormData({ ...formData, anomaly: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actionTaken">Action entreprise</Label>
                  <Textarea
                    id="actionTaken"
                    placeholder="Décrivez les actions entreprises"
                    value={formData.actionTaken}
                    onChange={(e) =>
                      setFormData({ ...formData, actionTaken: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stateAfterIntervention">État après intervention</Label>
                  <Textarea
                    id="stateAfterIntervention"
                    placeholder="Décrivez l'état après intervention"
                    value={formData.stateAfterIntervention}
                    onChange={(e) =>
                      setFormData({ ...formData, stateAfterIntervention: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendation">Recommandation</Label>
                  <Textarea
                    id="recommendation"
                    placeholder="Recommandations pour éviter ce type d'incident"
                    value={formData.recommendation}
                    onChange={(e) =>
                      setFormData({ ...formData, recommendation: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="softwareType">Type de logiciel</Label>
                <Input
                  id="softwareType"
                  placeholder="Ex: MySQL, PostgreSQL, Apache"
                  value={formData.softwareType}
                  onChange={(e) =>
                    setFormData({ ...formData, softwareType: e.target.value })
                  }
                />
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Modifier l'incident
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
