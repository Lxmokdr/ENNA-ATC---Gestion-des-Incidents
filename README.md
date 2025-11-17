# ENNA ATC - Système de Gestion des Incidents

![ENNA ATC](https://img.shields.io/badge/ENNA-ATC-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Django](https://img.shields.io/badge/Django-5.0-092E20)
![Django REST Framework](https://img.shields.io/badge/DRF-3.14-ff1709)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)

Système complet de gestion des incidents techniques pour l'École Nationale de l'Aviation Civile (ENNA). Application web moderne avec interface intuitive pour la gestion des incidents matériels et logiciels.

## 🚀 Fonctionnalités Principales

### 🔐 Authentification & Autorisation
- **Système de rôles** : Technicien, Ingénieur, Chef de Département, Super Utilisateur
- **Authentification sécurisée** avec JWT
- **Gestion des sessions** avec expiration automatique
- **Interface de connexion** moderne et responsive

### 📊 Gestion des Incidents
- **Deux types d'incidents** :
  - **Incidents Matériels** : Équipements, partitions, durée de panne
  - **Incidents Logiciels** : Services, types de logiciels
- **CRUD complet** : Création, lecture, modification, suppression
- **Champs dynamiques** selon le type d'incident
- **Validation en temps réel** des données
- **Confirmation avant suppression** avec dialogues de sécurité

### 🏷️ Gestion des Équipements
- **Enregistrement des équipements** avec numéro de série
- **Historique des incidents** par équipement
- **Suivi des états** (actuel/historique)
- **Gestion des partitions**

### 📋 Système de Rapports
- **Rapports détaillés** pour les incidents logiciels uniquement
- **Champs spécialisés** : Anomalie, Analyse, Conclusion
- **Modification en place** des rapports existants
- **Un rapport par incident** (relation 1:1)

### 📈 Tableaux de Bord
- **Dashboard Administrateur** : Vue d'ensemble et statistiques
- **Dashboard Matériel** : Statistiques incidents matériels
- **Dashboard Logiciel** : Statistiques incidents logiciels
- **Graphiques interactifs** avec distribution des incidents
- **Incidents récents** avec aperçu rapide

### 🎨 Interface Utilisateur
- **Design moderne** avec Tailwind CSS
- **Composants Shadcn/ui** pour une expérience premium
- **Responsive design** pour tous les appareils
- **Navigation intuitive** avec sidebar
- **Feedback utilisateur** avec toasts et confirmations

## 🛠️ Architecture Technique

### Frontend (React + TypeScript + Vite)
```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base (Shadcn)
│   ├── IncidentForm.tsx
│   ├── IncidentTable.tsx
│   └── ConfirmationDialog.tsx
├── pages/              # Pages de l'application
│   ├── Login.tsx
│   ├── AdminDashboard.tsx
│   ├── HardwareDashboard.tsx
│   ├── SoftwareDashboard.tsx
│   ├── HardwareIncidents.tsx
│   ├── SoftwareIncidents.tsx
│   ├── Equipment.tsx
│   ├── History.tsx
│   └── AddReport.tsx
├── hooks/              # Hooks personnalisés
│   ├── useAuth.tsx
│   ├── useIncidents.ts
│   └── useEquipment.ts
├── services/           # Services API
│   └── api.ts
└── lib/                # Utilitaires
    └── utils.ts
```

### Backend (Django REST Framework + PostgreSQL)
```
backend/
├── api/                # Application API
│   ├── models.py      # Modèles de données
│   ├── views.py       # Vues/ViewSets
│   ├── serializers.py # Sérialiseurs DRF
│   ├── urls.py        # Routes API
│   └── management/    # Commandes de gestion
├── enna_backend/      # Configuration Django
│   ├── settings.py
│   └── urls.py
├── scripts/           # Scripts utilitaires
└── docs/              # Documentation
```

## 🚀 Installation & Démarrage Rapide

### Prérequis
- **Node.js** 18+ (pour le frontend)
- **Python** 3.13+ (pour le backend Django)
- **PostgreSQL** 16+ (base de données)
- **npm** ou **yarn**
- **Git**

### 1. Cloner le Projet
```bash
git clone <repository-url>
cd ENNA
```

### 2. Installation Backend

```bash
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Configurer PostgreSQL (voir docs/POSTGRESQL_MIGRATION.md)
# Créer le fichier .env avec les credentials

# Exécuter les migrations
./scripts/run_migrations_final.sh

# Créer les utilisateurs par défaut
python manage.py create_default_users

# Créer des données de test (optionnel)
./scripts/create_test_data.sh
```

### 3. Installation Frontend

```bash
# Depuis la racine du projet
npm install
```

### 4. Démarrage

**Option A : Script automatique**
```bash
./start.sh
```

**Option B : Manuel**

Terminal 1 - Backend:
```bash
cd backend
./scripts/run_django.sh runserver 8000
```

Terminal 2 - Frontend:
```bash
npm run dev
```

✅ Backend: `http://localhost:8000`  
✅ Frontend: `http://localhost:8080`

## 👥 Comptes Utilisateurs

Tous les utilisateurs ont le mot de passe : `01010101`

| Utilisateur | Rôle | Description |
|-------------|------|-------------|
| `technicien1` | Technicien | Utilisateur standard |
| `technicien2` | Technicien | Utilisateur standard |
| `ingenieur1` | Ingénieur | Utilisateur avancé |
| `ingenieur2` | Ingénieur | Utilisateur avancé |
| `chefdep1` | Chef de Département | Gestionnaire |
| `superuser1` | Super Utilisateur | Administrateur |
| `admin` | Super Utilisateur | Administrateur principal |

## 🔧 API Endpoints

### Authentification
```http
POST   /api/auth/login/          # Connexion
POST   /api/auth/logout/         # Déconnexion
GET    /api/auth/profile/        # Profil utilisateur
```

### Incidents
```http
GET    /api/incidents/                    # Liste tous les incidents
GET    /api/incidents/?type=hardware      # Incidents matériels
GET    /api/incidents/?type=software      # Incidents logiciels
POST   /api/incidents/                    # Créer un incident
PUT    /api/incidents/hardware/:id        # Modifier incident matériel
PUT    /api/incidents/software/:id        # Modifier incident logiciel
DELETE /api/incidents/:id                 # Supprimer un incident
GET    /api/incidents/stats/              # Statistiques
GET    /api/incidents/recent/             # Incidents récents
```

### Équipements
```http
GET    /api/equipement/                   # Liste des équipements
POST   /api/equipement/                   # Créer un équipement
PUT    /api/equipement/:id                # Modifier un équipement
DELETE /api/equipement/:id                # Supprimer un équipement
GET    /api/equipement/:id/history/       # Historique des incidents
```

### Rapports
```http
GET    /api/reports/                      # Liste des rapports
POST   /api/reports/                      # Créer/modifier un rapport
```

## 📚 Documentation

- `backend/docs/POSTGRESQL_MIGRATION.md` - Guide de migration PostgreSQL
- `backend/docs/TEST_DATA_AND_HISTORY.md` - Données de test et historique
- `docs/` - Documentation générale du projet

## 🔒 Sécurité

- **JWT Tokens** avec expiration (24h)
- **Hachage bcrypt** des mots de passe
- **Validation stricte** des données
- **CORS configuré** pour la sécurité
- **Variables d'environnement** pour les secrets

## 🚀 Déploiement

### Variables d'Environnement

**Backend (.env):**
```env
DB_NAME=enna_db
DB_USER=enna_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key
```

**Frontend:**
- API URL: `http://localhost:8000/api` (défaut)

### Build de Production

```bash
# Frontend
npm run build
# Fichiers dans dist/

# Backend
# Utiliser gunicorn ou uwsgi pour la production
```

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature
3. **Commit** vos changements
4. **Push** vers la branche
5. **Ouvrir** une Pull Request

## 📝 Changelog

### Version 2.1.0 (Actuelle)
- ✅ Migration vers PostgreSQL
- ✅ Gestion des équipements
- ✅ Historique des incidents par équipement
- ✅ Données de test automatiques
- ✅ Scripts de migration et utilitaires

### Version 2.0.0
- ✅ Séparation des incidents matériels/logiciels
- ✅ Système de rapports
- ✅ Tableaux de bord spécialisés
- ✅ Interface utilisateur modernisée

## 🐛 Dépannage

### Backend ne démarre pas
```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql

# Vérifier les logs
sudo journalctl -u postgresql
```

### Frontend ne se connecte pas
```bash
# Vérifier que le backend est démarré
curl http://localhost:8000/api/health/
```

### Problèmes de migration
Voir `backend/docs/POSTGRESQL_MIGRATION.md` pour les instructions détaillées.
