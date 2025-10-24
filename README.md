# ENNA ATC - Système de Gestion des Incidents

![ENNA ATC](https://img.shields.io/badge/ENNA-ATC-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-18-339933)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

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

### 📋 Système de Rapports
- **Rapports détaillés** pour les incidents logiciels uniquement
- **Champs spécialisés** : Anomalie, Analyse, Conclusion
- **Modification en place** des rapports existants
- **Un rapport par incident** (relation 1:1)
- **Interface de création/modification** intuitive

### 📈 Tableau de Bord Administrateur
- **Statistiques en temps réel** :
  - Nombre total d'incidents
  - Répartition par type (matériel/logiciel)
  - Durée totale de panne
  - Durée moyenne de panne
- **Graphiques interactifs** avec distribution des incidents
- **Incidents récents** avec aperçu rapide
- **Calculs automatiques** des métriques

### 🎨 Interface Utilisateur
- **Design moderne** avec Tailwind CSS
- **Composants Shadcn/ui** pour une expérience premium
- **Responsive design** pour tous les appareils
- **Navigation intuitive** avec sidebar
- **Feedback utilisateur** avec toasts et confirmations
- **Thème sombre/clair** (préparé)

## 🛠️ Architecture Technique

### Frontend (React + TypeScript)
```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base
│   ├── IncidentForm.tsx    # Formulaire incidents
│   ├── IncidentTable.tsx   # Tableau incidents
│   └── ConfirmationDialog.tsx # Dialogues de confirmation
├── pages/              # Pages de l'application
│   ├── Login.tsx           # Page de connexion
│   ├── AdminDashboard.tsx  # Tableau de bord principal
│   ├── HardwareIncidents.tsx # Gestion incidents matériels
│   ├── SoftwareIncidents.tsx # Gestion incidents logiciels
│   ├── AddReport.tsx       # Ajout/modification rapports
│   └── EditIncident.tsx    # Modification incidents
├── hooks/              # Hooks personnalisés
│   └── useIncidents.ts     # Logique métier incidents
├── services/           # Services API
│   └── api.ts              # Client API centralisé
└── lib/                # Utilitaires
    └── utils.ts            # Fonctions utilitaires
```

### Backend (Node.js + Express + SQLite)
```
backend-simple/
├── server.js           # Serveur principal Express
├── enna.db            # Base de données SQLite
├── db-viewer.js       # Visualiseur CLI de la DB
├── db-web-viewer.js   # Visualiseur web de la DB
└── package.json       # Dépendances backend
```

### Base de Données
```sql
-- Tables principales
users                  # Utilisateurs et authentification
hardware_incidents     # Incidents matériels
software_incidents     # Incidents logiciels
reports               # Rapports (liés aux incidents logiciels)
```

## 🚀 Installation & Démarrage Rapide

### Prérequis
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Git** (pour cloner le projet)

### 1. Cloner le Projet
```bash
git clone <repository-url>
cd ENNA
```

### 2. Installation des Dépendances

#### Frontend
```bash
# Installer les dépendances React
npm install
```

#### Backend
```bash
# Installer les dépendances Node.js
cd backend-simple
npm install
cd ..
```

### 3. Démarrage de l'Application

#### Option A : Démarrage Automatique (Recommandé)
```bash
# Script de démarrage complet
./start.sh
```

#### Option B : Démarrage Manuel

**Terminal 1 - Backend :**
```bash
cd backend-simple
node server.js
```
✅ Backend disponible sur `http://localhost:8000`

**Terminal 2 - Frontend :**
```bash
npm run dev
```
✅ Frontend disponible sur `http://localhost:8080`

**Terminal 3 - Visualiseur DB (Optionnel) :**
```bash
cd backend-simple
node db-web-viewer.js
```
✅ Visualiseur DB disponible sur `http://localhost:3001`

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
POST   /api/auth/login/          # Connexion utilisateur
POST   /api/auth/logout/         # Déconnexion
GET    /api/auth/profile/        # Profil utilisateur
PUT    /api/auth/profile/        # Modification profil
POST   /api/auth/change-password/ # Changement mot de passe
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

### Rapports
```http
GET    /api/reports/                      # Liste des rapports
GET    /api/reports/?incident=:id         # Rapports d'un incident
POST   /api/reports/                      # Créer/modifier un rapport
```

### Utilisateurs
```http
GET    /api/users/                        # Liste des utilisateurs
POST   /api/users/                        # Créer un utilisateur
PUT    /api/users/:id                     # Modifier un utilisateur
DELETE /api/users/:id                     # Supprimer un utilisateur
```

## 🎯 Guide d'Utilisation

### 1. Connexion
1. Ouvrir `http://localhost:8080`
2. Utiliser un compte par défaut (voir section Comptes)
3. Mot de passe : `01010101`

### 2. Navigation
- **Dashboard** : Vue d'ensemble et statistiques
- **Incidents Matériels** : Gestion des incidents hardware
- **Incidents Logiciels** : Gestion des incidents software
- **Profil** : Gestion du compte utilisateur

### 3. Création d'Incident
1. Aller dans la section appropriée (Matériel/Logiciel)
2. Remplir le formulaire avec les informations requises
3. Cliquer sur "Créer l'incident"
4. L'incident apparaît immédiatement dans la liste

### 4. Ajout de Rapport (Logiciels uniquement)
1. Aller dans "Incidents Logiciels"
2. Cliquer sur "Ajouter Rapport" pour un incident
3. Remplir les champs : Anomalie, Analyse, Conclusion
4. Sauvegarder le rapport

### 5. Modification/Suppression
1. Utiliser les boutons "Modifier" ou "Supprimer" dans le tableau
2. Confirmer l'action dans le dialogue
3. Les modifications sont appliquées immédiatement

## 🔍 Outils de Développement

### Visualiseur de Base de Données
```bash
# Interface web
http://localhost:3001

# Interface CLI
cd backend-simple
node db-viewer.js
```

### Scripts de Développement
```bash
# Frontend
npm run dev          # Développement avec hot-reload
npm run build        # Build de production
npm run preview      # Prévisualisation du build

# Backend
cd backend-simple
node server.js       # Serveur de développement
node db-viewer.js    # Visualiseur CLI
node db-web-viewer.js # Visualiseur web
```

## 🔒 Sécurité

- **JWT Tokens** avec expiration (24h)
- **Hachage bcrypt** des mots de passe
- **Validation stricte** des données
- **CORS configuré** pour la sécurité
- **Sanitisation** des entrées utilisateur
- **Protection CSRF** intégrée

## 📊 Base de Données

### Schéma Principal
```sql
-- Utilisateurs
users (id, username, password, role, is_active, created_at)

-- Incidents Matériels
hardware_incidents (
  id, date, time, description, category, location,
  equipment_name, partition, downtime,
  anomaly, action_taken, state_after_intervention, recommendation,
  created_by_id, assigned_to_id, created_at, updated_at
)

-- Incidents Logiciels
software_incidents (
  id, date, time, description, category, location,
  service_name, software_type,
  anomaly, action_taken, state_after_intervention, recommendation,
  created_by_id, assigned_to_id, created_at, updated_at
)

-- Rapports (Logiciels uniquement)
reports (
  id, software_incident_id, date,
  anomaly, analysis, conclusion,
  created_by_id, created_at, updated_at
)
```

## 🚀 Déploiement

### Variables d'Environnement
```bash
# Backend
PORT=8000
JWT_SECRET=your-secret-key
DB_PATH=./enna.db

# Frontend
VITE_API_URL=http://localhost:8000/api
```

### Build de Production
```bash
# Frontend
npm run build
# Les fichiers sont dans dist/

# Backend
# Copier le dossier backend-simple
# Installer les dépendances
npm install --production
```

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Standards de Code
- **TypeScript** strict
- **ESLint** + **Prettier** configurés
- **Conventions** de nommage cohérentes
- **Tests** unitaires (à implémenter)
- **Documentation** des fonctions complexes

## 📝 Changelog

### Version 2.0.0 (Actuelle)
- ✅ Séparation des incidents matériels/logiciels
- ✅ Système de rapports pour incidents logiciels
- ✅ Tableau de bord unifié
- ✅ Confirmation des actions critiques
- ✅ Gestion des dates/heures automatique
- ✅ Visualiseur de base de données
- ✅ Interface utilisateur modernisée

### Version 1.0.0
- ✅ Authentification de base
- ✅ CRUD incidents simple
- ✅ Interface React basique

## 🐛 Dépannage

### Problèmes Courants

**Backend ne démarre pas :**
```bash
# Vérifier le port 8000
lsof -i :8000
# Tuer le processus si nécessaire
kill -9 <PID>
```

**Frontend ne se connecte pas :**
```bash
# Vérifier que le backend est démarré
curl http://localhost:8000/api/health/
```

**Base de données corrompue :**
```bash
# Supprimer et recréer
rm backend-simple/enna.db
cd backend-simple
node server.js
```

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation** : [Wiki du projet](https://github.com/your-repo/wiki)
- **Email** : support@enna-atc.com

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---

**ENNA ATC** - Système de Gestion des Incidents Techniques  
*Développé pour l'École Nationale de l'Aviation Civile*

![ENNA Logo](https://via.placeholder.com/200x80/0066CC/FFFFFF?text=ENNA+ATC)