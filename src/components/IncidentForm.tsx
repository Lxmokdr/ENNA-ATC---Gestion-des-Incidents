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
  // Hardware fields
  nom_de_equipement?: string;
  partition?: string;
  numero_de_serie?: string;
  anomalie_observee?: string;
  action_realisee?: string;
  piece_de_rechange_utilisee?: string;
  etat_de_equipement_apres_intervention?: string;
  recommendation?: string;
  duree_arret?: number;
  // Software fields
  simulateur?: boolean;
  salle_operationnelle?: boolean;
  server?: string;
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

export function IncidentForm({ onSubmit, type, title }: IncidentFormProps) {
  const [modeRadarCategory, setModeRadarCategory] = useState<string>("");
  const [formData, setFormData] = useState<IncidentFormData>({
    date: "",
    time: "",
    description: "",
    nom_de_equipement: "",
    partition: "",
    numero_de_serie: "",
    anomalie_observee: "",
    action_realisee: "",
    piece_de_rechange_utilisee: "",
    etat_de_equipement_apres_intervention: "",
      recommendation: "",
      duree_arret: undefined,
      simulateur: false,
      salle_operationnelle: false,
      server: "",
      game: "",
    group: "",
    exercice: "",
    secteur: "",
    position_STA: "",
    position_logique: "",
    type_d_anomalie: "",
    indicatif: "",
    mode_radar: "",
    FL: "",
    longitude: "",
    latitude: "",
    code_SSR: "",
    sujet: "",
    commentaires: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      date: "",
      time: "",
      description: "",
      nom_de_equipement: "",
      partition: "",
      numero_de_serie: "",
      anomalie_observee: "",
      action_realisee: "",
      piece_de_rechange_utilisee: "",
      etat_de_equipement_apres_intervention: "",
      recommendation: "",
      duree_arret: undefined,
      simulateur: false,
      salle_operationnelle: false,
      server: "",
      game: "",
      group: "",
      exercice: "",
      secteur: "",
      position_STA: "",
      position_logique: "",
      type_d_anomalie: "",
      indicatif: "",
      mode_radar: "",
      FL: "",
      longitude: "",
      latitude: "",
      code_SSR: "",
      sujet: "",
      commentaires: "",
    });
    setModeRadarCategory("");
  };

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
                value={formData.time || (() => {
                  // Always use UTC/GMT time, not local time
                  const now = new Date();
                  const utcHours = String(now.getUTCHours()).padStart(2, '0');
                  const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
                  return `${utcHours}:${utcMinutes}`;
                })()}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                L'heure doit être en GMT/UTC (actuellement: {(() => {
                  const now = new Date();
                  const utcHours = String(now.getUTCHours()).padStart(2, '0');
                  const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
                  return `${utcHours}:${utcMinutes}`;
                })()} GMT)
              </p>
            </div>
          </div>

          {type === "hardware" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nom_de_equipement">Nom de l'équipement</Label>
                <Select
                  value={formData.nom_de_equipement || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, nom_de_equipement: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un équipement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="radar">Radar</SelectItem>
                    <SelectItem value="FDP">FDP</SelectItem>
                    <SelectItem value="AGP">AGP</SelectItem>
                    <SelectItem value="SNMAP">SNMAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partition">Partition</Label>
                  <Input
                    id="partition"
                    placeholder="Ex: Partition A"
                    value={formData.partition || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, partition: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_de_serie">Numéro de série</Label>
                  <Input
                    id="numero_de_serie"
                    placeholder="Ex: SN123456"
                    value={formData.numero_de_serie || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, numero_de_serie: e.target.value })
                    }
                  />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="anomalie_observee">Anomalie observée</Label>
                <Textarea
                  id="anomalie_observee"
                  placeholder="Décrivez l'anomalie observée..."
                  value={formData.anomalie_observee || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, anomalie_observee: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action_realisee">Action réalisée</Label>
                <Textarea
                  id="action_realisee"
                  placeholder="Décrivez les actions réalisées..."
                  value={formData.action_realisee || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, action_realisee: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="piece_de_rechange_utilisee">Pièce de rechange utilisée</Label>
                <Input
                  id="piece_de_rechange_utilisee"
                  placeholder="Ex: Carte réseau, Disque dur..."
                  value={formData.piece_de_rechange_utilisee || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, piece_de_rechange_utilisee: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="etat_de_equipement_apres_intervention">État de l'équipement après intervention</Label>
                <Textarea
                  id="etat_de_equipement_apres_intervention"
                  placeholder="Décrivez l'état après intervention..."
                  value={formData.etat_de_equipement_apres_intervention || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, etat_de_equipement_apres_intervention: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendation">Recommandation</Label>
                <Textarea
                  id="recommendation"
                  placeholder="Recommandations pour éviter ce type d'incident..."
                  value={formData.recommendation || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, recommendation: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duree_arret">Durée d'arrêt (en minutes)</Label>
                <Input
                  id="duree_arret"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ex: 120 pour 2 heures, 90 pour 1h30"
                  value={formData.duree_arret !== undefined ? formData.duree_arret.toString() : ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFormData({ ...formData, duree_arret: undefined });
                    } else {
                      const numValue = parseInt(value, 10);
                      if (!isNaN(numValue) && numValue >= 0) {
                        setFormData({ ...formData, duree_arret: numValue });
                      }
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Entrez la durée de panne en minutes (ex: 120 pour 2h, 90 pour 1h30)
                </p>
              </div>
            </>
          )}

          {type === "software" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="simulateur">Simulateur</Label>
                  <Select
                    value={formData.simulateur === true ? "yes" : formData.simulateur === false ? "no" : ""}
                    onValueChange={(value) => {
                      const boolValue = value === "yes";
                      setFormData({ ...formData, simulateur: boolValue });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Oui</SelectItem>
                      <SelectItem value="no">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salle_operationnelle">Salle opérationnelle</Label>
                  <Select
                    value={formData.salle_operationnelle === true ? "yes" : formData.salle_operationnelle === false ? "no" : ""}
                    onValueChange={(value) => {
                      const boolValue = value === "yes";
                      setFormData({ ...formData, salle_operationnelle: boolValue });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Oui</SelectItem>
                      <SelectItem value="no">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="server">Server</Label>
                <Select
                  value={formData.server || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, server: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un serveur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="radar">Radar</SelectItem>
                    <SelectItem value="FDP">FDP</SelectItem>
                    <SelectItem value="AGP">AGP</SelectItem>
                    <SelectItem value="SNMAP">SNMAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="game">Game</Label>
                  <Input
                    id="game"
                    value={formData.game || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, game: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partition">Partition</Label>
                  <Select
                    value={formData.partition || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, partition: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CCR">CCR</SelectItem>
                      <SelectItem value="ALAP">ALAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group">Group</Label>
                  <Input
                    id="group"
                    value={formData.group || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, group: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exercice">Exercice</Label>
                  <Input
                    id="exercice"
                    value={formData.exercice || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, exercice: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secteur">Secteur</Label>
                <Input
                  id="secteur"
                  value={formData.secteur || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, secteur: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position_STA">Position STA</Label>
                  <Input
                    id="position_STA"
                    value={formData.position_STA || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, position_STA: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position_logique">Position logique</Label>
                  <Input
                    id="position_logique"
                    value={formData.position_logique || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, position_logique: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type_d_anomalie">Type d'anomalie</Label>
                <Select
                  value={formData.type_d_anomalie || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type_d_anomalie: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Systeme">Système</SelectItem>
                    <SelectItem value="aleatoire">Aléatoire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                <div className="space-y-2">
                  <Label htmlFor="mode_radar_category">Mode radar - Catégorie</Label>
                  <Select
                    value={modeRadarCategory || ""}
                    onValueChange={(value) => {
                      setModeRadarCategory(value);
                      setFormData({ ...formData, mode_radar: "" }); // Reset mode_radar when category changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Mono">Mono</SelectItem>
                      <SelectItem value="Bypass">Bypass</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              
                <div className="space-y-2">
                  <Label htmlFor="mode_radar">Mode radar</Label>
                  <Select
                    value={formData.mode_radar || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, mode_radar: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Norm">Norm</SelectItem>
                      <SelectItem value="OS">OS</SelectItem>
                      <SelectItem value="MJ">MJ</SelectItem>
                      <SelectItem value="SD">SD</SelectItem>
                      <SelectItem value="LO">LO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              
          
              
                <div className="space-y-2">
                  <Label htmlFor="indicatif">Indicatif</Label>
                  <Input
                    id="indicatif"
                    value={formData.indicatif || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, indicatif: e.target.value })
                    }
                  />
                </div>

              <div className="space-y-2">
                <Label htmlFor="FL">FL (ou altitude)</Label>
                <Input
                  id="FL"
                  value={formData.FL || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, FL: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={formData.longitude || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={formData.latitude || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code_SSR">Code SSR</Label>
                <Input
                  id="code_SSR"
                  value={formData.code_SSR || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, code_SSR: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sujet">Sujet</Label>
                <Input
                  id="sujet"
                  value={formData.sujet || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sujet: e.target.value })
                  }
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="commentaires">Commentaires</Label>
                <Textarea
                  id="commentaires"
                  placeholder="Commentaires supplémentaires..."
                  value={formData.commentaires || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, commentaires: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full">
            Enregistrer l'incident
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
