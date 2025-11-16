import { useState, useEffect, useCallback } from "react";
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
import { apiClient, Equipment } from "@/services/api";
import { toast } from "sonner";

interface IncidentFormProps {
  onSubmit: (data: IncidentFormData) => void;
  type: "hardware" | "software";
  title?: string;
  initialData?: Partial<IncidentFormData>;
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

export function IncidentForm({ onSubmit, type, title, initialData }: IncidentFormProps) {
  const [modeRadarCategory, setModeRadarCategory] = useState<string>("");
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [availableSerialNumbers, setAvailableSerialNumbers] = useState<string[]>([]);
  const [formData, setFormData] = useState<IncidentFormData>({
    date: initialData?.date || "",
    time: initialData?.time || "",
    description: initialData?.description || "",
    nom_de_equipement: initialData?.nom_de_equipement || "",
    partition: initialData?.partition || "",
    numero_de_serie: initialData?.numero_de_serie || "",
    anomalie_observee: initialData?.anomalie_observee || "",
    action_realisee: initialData?.action_realisee || "",
    piece_de_rechange_utilisee: initialData?.piece_de_rechange_utilisee || "",
    etat_de_equipement_apres_intervention: initialData?.etat_de_equipement_apres_intervention || "",
      recommendation: initialData?.recommendation || "",
      duree_arret: initialData?.duree_arret || undefined,
      simulateur: initialData?.simulateur || false,
      salle_operationnelle: initialData?.salle_operationnelle || false,
      server: initialData?.server || "",
      game: initialData?.game || "",
    group: initialData?.group || "",
    exercice: initialData?.exercice || "",
    secteur: initialData?.secteur || "",
    position_STA: initialData?.position_STA || "",
    position_logique: initialData?.position_logique || "",
    type_d_anomalie: initialData?.type_d_anomalie || "",
    indicatif: initialData?.indicatif || "",
    mode_radar: initialData?.mode_radar || "",
    FL: initialData?.FL || "",
    longitude: initialData?.longitude || "",
    latitude: initialData?.latitude || "",
    code_SSR: initialData?.code_SSR || "",
    sujet: initialData?.sujet || "",
    commentaires: initialData?.commentaires || "",
  });

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData?.date, initialData?.time, initialData?.description, initialData?.numero_de_serie, initialData?.nom_de_equipement, initialData?.partition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Only reset form if not editing (no initialData)
    if (!initialData) {
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
    }
  };

  // Fetch equipment details when serial number is selected/entered
  const fetchEquipmentBySerial = useCallback(async (serialNumber: string) => {
    if (!serialNumber || serialNumber.trim().length === 0) {
      setFormData(prev => ({
        ...prev,
        nom_de_equipement: "",
        partition: "",
      }));
      return;
    }

    setEquipmentLoading(true);
    try {
      const trimmedSerial = serialNumber.trim();
      const result = await apiClient.getEquipment({ num_serie: trimmedSerial });
      
      // Backend returns Equipment object directly when searching by exact num_serie
      let equipment: Equipment | null = null;
      
      // Check if result is a direct Equipment object
      if (result && typeof result === 'object') {
        if ('nom_equipement' in result) {
          // Direct Equipment object
          equipment = result as Equipment;
        } else if ('results' in result) {
          // Wrapped in results array (shouldn't happen for num_serie, but handle it)
          const resultsObj = result as { results: Equipment[] | string[] };
          if (Array.isArray(resultsObj.results) && resultsObj.results.length > 0) {
            const firstItem = resultsObj.results[0];
            if (typeof firstItem === 'object' && firstItem !== null && 'nom_equipement' in firstItem) {
              equipment = firstItem as Equipment;
            }
          }
        }
      }
      
      if (equipment && equipment.nom_equipement) {
        // Update form data with equipment details
        setFormData(prev => ({
          ...prev,
          nom_de_equipement: equipment.nom_equipement,
          partition: equipment.partition || "",
        }));
      } else {
        // No equipment found - clear fields
        setFormData(prev => ({
          ...prev,
          nom_de_equipement: "",
          partition: "",
        }));
      }
    } catch (error: any) {
      console.error('Error fetching equipment by serial number:', error);
      // Equipment not found - clear fields
      setFormData(prev => ({
        ...prev,
        nom_de_equipement: "",
        partition: "",
      }));
    } finally {
      setEquipmentLoading(false);
    }
  }, []);

  // Load all available serial numbers on mount for hardware incidents
  useEffect(() => {
    if (type === "hardware") {
      const loadAllSerialNumbers = async () => {
        try {
          setEquipmentLoading(true);
          // Get all equipment and extract unique serial numbers
          const result = await apiClient.getEquipment();
          if (result && typeof result === 'object' && 'results' in result && Array.isArray(result.results)) {
            const equipmentList = result.results.filter((item): item is Equipment => 
              typeof item === 'object' && item !== null && 'nom_equipement' in item
            );
            // Get unique serial numbers (only from current equipment with etat = 'actuel')
            const currentEquipment = equipmentList.filter(eq => eq.etat === 'actuel' && eq.num_serie);
            const uniqueSerials = Array.from(new Set(currentEquipment.map(eq => eq.num_serie).filter(Boolean))) as string[];
            setAvailableSerialNumbers(uniqueSerials.sort());
          } else {
            setAvailableSerialNumbers([]);
          }
        } catch (error: any) {
          console.error('Error loading serial numbers:', error);
          setAvailableSerialNumbers([]);
        } finally {
          setEquipmentLoading(false);
        }
      };
      loadAllSerialNumbers();
    } else {
      setAvailableSerialNumbers([]);
    }
  }, [type]);

  // Handle serial number selection from dropdown
  const handleSerialNumberSelect = (serialNumber: string) => {
    // Don't process if it's the placeholder value
    if (serialNumber === "__no_equipment__" || !serialNumber) {
      return;
    }
    const currentSerial = formData.numero_de_serie;
    setFormData(prev => ({
      ...prev,
      numero_de_serie: serialNumber,
    }));
    // Automatically fetch equipment details when serial number is selected
    // Only if it's different from current value (to avoid refetching when editing)
    if (serialNumber && serialNumber.trim().length > 0 && serialNumber !== currentSerial) {
      fetchEquipmentBySerial(serialNumber);
    }
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
                <Label htmlFor="numero_de_serie">Numéro de série *</Label>
                {equipmentLoading && availableSerialNumbers.length === 0 ? (
                  <div className="flex items-center gap-2">
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Chargement des équipements..." />
                      </SelectTrigger>
                    </Select>
                  </div>
                ) : (
                  <Select
                    value={formData.numero_de_serie && availableSerialNumbers.includes(formData.numero_de_serie) 
                      ? formData.numero_de_serie 
                      : ""}
                    onValueChange={handleSerialNumberSelect}
                    required
                    disabled={equipmentLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un numéro de série" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSerialNumbers.length === 0 ? (
                        <SelectItem value="__no_equipment__" disabled>
                          Aucun équipement disponible
                        </SelectItem>
                      ) : (
                        availableSerialNumbers.map((serial) => (
                          <SelectItem key={serial} value={serial}>
                            {serial}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                {equipmentLoading && formData.numero_de_serie && (
                  <p className="text-xs text-muted-foreground">Chargement de l'équipement...</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Sélectionnez un numéro de série pour remplir automatiquement les champs
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom_de_equipement">Nom de l'équipement *</Label>
                  <Input
                    id="nom_de_equipement"
                    value={formData.nom_de_equipement || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, nom_de_equipement: e.target.value })
                    }
                    required
                    readOnly={!!formData.nom_de_equipement && formData.nom_de_equipement.length > 0}
                    placeholder="Rempli automatiquement"
                    className={formData.nom_de_equipement ? "bg-muted" : ""}
                  />
                  {formData.nom_de_equipement && (
                    <p className="text-xs text-green-600">✓ Rempli automatiquement</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partition">Partition *</Label>
                  <Input
                    id="partition"
                    value={formData.partition || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, partition: e.target.value })
                    }
                    required
                    readOnly={!!formData.partition && formData.partition.length > 0}
                    placeholder="Rempli automatiquement"
                    className={formData.partition ? "bg-muted" : ""}
                  />
                  {formData.partition && (
                    <p className="text-xs text-green-600">✓ Rempli automatiquement</p>
                  )}
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
