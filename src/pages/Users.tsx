// React imports
import { useState, useEffect } from "react";

// Third-party imports
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";

// Local service imports
import { apiClient, User } from "@/services/api";

// Local component imports
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

// UI component imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROLE_OPTIONS = [
  { value: 'service_maintenance', label: 'Service Maintenance' },
  { value: 'service_integration', label: 'Service Integration et Développement' },
  { value: 'chef_departement', label: 'Chef de Département' },
  { value: 'superadmin', label: 'Super Admin' },
];

interface UserFormData {
  username: string;
  password: string;
  role: 'service_maintenance' | 'service_integration' | 'chef_departement' | 'superadmin';
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    password: "",
    role: "service_maintenance",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      setUsers(response.results || []);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du chargement des utilisateurs");
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const updateData: any = {
          username: formData.username,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await apiClient.updateUser(isEditing, updateData);
        toast.success("Utilisateur modifié avec succès");
      } else {
        await apiClient.createUser({
          username: formData.username,
          password: formData.password,
          role: formData.role,
        });
        toast.success("Utilisateur créé avec succès");
      }
      await loadUsers();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || `Erreur lors de ${isEditing ? 'la modification' : "la création"} de l'utilisateur`);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditing(user.id);
    setFormData({
      username: user.username,
      password: "", // Don't pre-fill password
      role: user.role,
    });
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      try {
        await apiClient.deleteUser(selectedUser.id);
        toast.success("Utilisateur supprimé avec succès");
        await loadUsers();
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la suppression de l'utilisateur");
      } finally {
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      }
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({
      username: "",
      password: "",
      role: "service_maintenance",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground">
          Créer, modifier et supprimer des utilisateurs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                disabled={isEditing !== null}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Mot de passe {isEditing ? "(laisser vide pour ne pas modifier)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!isEditing}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 caractères
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, role: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {isEditing ? "Modifier" : "Créer"}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Liste des utilisateurs
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nom d'utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>
                          {ROLE_OPTIONS.find(r => r.value === user.role)?.label || user.role}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline">Modifier</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user)}
                              className="flex items-center gap-2 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Supprimer</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${selectedUser?.username}" ? Cette action est irréversible.`}
      />
    </div>
  );
}
