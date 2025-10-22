import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncidentFormProps {
  onSubmit: (data: IncidentFormData) => void;
  type: "hardware" | "software";
  title?: string;
}

export interface IncidentFormData {
  date: string;
  time: string;
  description: string;
  category: string;
  location: string;
  status: string;
  softwareType?: string;
  // Hardware specific fields
  equipmentName?: string;
  partition?: string;
  serviceName?: string;
  anomaly?: string;
  actionTaken?: string;
  stateAfterIntervention?: string;
  recommendation?: string;
  downtime?: string;
}

export function IncidentForm({ onSubmit, type, title }: IncidentFormProps) {
  const [formData, setFormData] = useState<IncidentFormData>({
    date: "",
    time: "",
    description: "",
    category: "",
    location: "",
    status: "En attente",
    softwareType: "",
    equipmentName: "",
    partition: "",
    serviceName: "",
    anomaly: "",
    actionTaken: "",
    stateAfterIntervention: "",
    recommendation: "",
    downtime: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      date: "",
      time: "",
      description: "",
      category: "",
      location: "",
      status: "En attente",
      softwareType: "",
      equipmentName: "",
      partition: "",
      serviceName: "",
      anomaly: "",
      actionTaken: "",
      stateAfterIntervention: "",
      recommendation: "",
      downtime: "",
    });
  };

  const hardwareCategories = ["Alimentation", "Communication", "Réseau", "Autre"];
  const softwareCategories = ["Affichage Radar", "Base de données", "Serveur", "Autre"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Ajouter un incident"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Heure (GMT)</Label>
              <Input
                id="time"
                type="time"
                value={formData.time || new Date().toISOString().split("T")[1].substring(0, 5)}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                required
              />
            </div>
          </div>

          {type === "hardware" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="equipmentName">Nom de l'équipement</Label>
                <Input
                  id="equipmentName"
                  placeholder="Ex: Serveur principal - Rack 1"
                  value={formData.equipmentName}
                  onChange={(e) =>
                    setFormData({ ...formData, equipmentName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partition">Partition</Label>
                  <Input
                    id="partition"
                    placeholder="Ex: Partition A"
                    value={formData.partition}
                    onChange={(e) =>
                      setFormData({ ...formData, partition: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Nom de service</Label>
                  <Input
                    id="serviceName"
                    placeholder="Ex: Service de surveillance"
                    value={formData.serviceName}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez l'incident en détail..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={4}
            />
          </div>

          {type === "hardware" && (
            <div className="space-y-2">
              <Label htmlFor="anomaly">Anomalie observée</Label>
              <Textarea
                id="anomaly"
                placeholder="Décrivez l'anomalie observée..."
                value={formData.anomaly}
                onChange={(e) =>
                  setFormData({ ...formData, anomaly: e.target.value })
                }
                required
                rows={3}
              />
            </div>
          )}

          {type === "software" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="softwareType">Type de logiciel</Label>
                <Input
                  id="softwareType"
                  placeholder="Ex: Système de surveillance radar"
                  value={formData.softwareType}
                  onChange={(e) =>
                    setFormData({ ...formData, softwareType: e.target.value })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="anomaly">Anomalie observée</Label>
                <Textarea
                  id="anomaly"
                  placeholder="Décrivez l'anomalie observée..."
                  value={formData.anomaly}
                  onChange={(e) =>
                    setFormData({ ...formData, anomaly: e.target.value })
                  }
                  required
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {(type === "hardware" ? hardwareCategories : softwareCategories).map(
                  (cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              placeholder="Ex: Tour de contrôle - Niveau 2"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
          </div>

          {type === "hardware" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="actionTaken">Action réalisée</Label>
                <Textarea
                  id="actionTaken"
                  placeholder="Décrivez les actions réalisées..."
                  value={formData.actionTaken}
                  onChange={(e) =>
                    setFormData({ ...formData, actionTaken: e.target.value })
                  }
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stateAfterIntervention">État après intervention</Label>
                <Textarea
                  id="stateAfterIntervention"
                  placeholder="Décrivez l'état après intervention..."
                  value={formData.stateAfterIntervention}
                  onChange={(e) =>
                    setFormData({ ...formData, stateAfterIntervention: e.target.value })
                  }
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendation">Recommandation</Label>
                <Textarea
                  id="recommendation"
                  placeholder="Recommandations pour éviter ce type d'incident..."
                  value={formData.recommendation}
                  onChange={(e) =>
                    setFormData({ ...formData, recommendation: e.target.value })
                  }
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="downtime">Durée de la panne</Label>
                <Input
                  id="downtime"
                  placeholder="Ex: 2h 30min"
                  value={formData.downtime}
                  onChange={(e) =>
                    setFormData({ ...formData, downtime: e.target.value })
                  }
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Résolu">Résolu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Enregistrer l'incident
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
