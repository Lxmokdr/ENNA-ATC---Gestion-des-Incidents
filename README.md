# ENNA ATC - Système de Gestion des Incidents

## Description du projet

Système de gestion des incidents techniques pour l'École Nationale de l'Aviation Civile (ENNA) - Air Traffic Control (ATC).

## Fonctionnalités

- **Gestion des incidents Hardware** : Enregistrement et suivi des incidents matériels
- **Gestion des incidents Software** : Enregistrement et suivi des incidents logiciels
- **Rapports d'incidents** : Génération de rapports détaillés pour les incidents software
- **Historique global** : Consultation de tous les incidents
- **Tableau de bord administrateur** : Vue d'ensemble des statistiques

## Technologies utilisées

- **Vite** - Build tool et serveur de développement
- **TypeScript** - Langage de programmation typé
- **React** - Bibliothèque UI
- **shadcn/ui** - Composants UI modernes
- **Tailwind CSS** - Framework CSS utilitaire
- **React Router** - Routage côté client
- **React Query** - Gestion des données et cache

## Installation et développement

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn

### Installation

```sh
# Cloner le repository
git clone <URL_DU_REPOSITORY>

# Naviguer vers le dossier du projet
cd ENNA

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run preview` - Prévisualise l'application compilée
- `npm run lint` - Vérifie le code avec ESLint

## Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base
│   ├── IncidentForm.tsx    # Formulaire d'incidents
│   ├── IncidentTable.tsx   # Tableau des incidents
│   ├── Layout.tsx          # Layout principal
│   ├── Sidebar.tsx         # Barre latérale
│   └── StatCard.tsx        # Carte de statistiques
├── pages/              # Pages de l'application
│   ├── Dashboard.tsx       # Tableau de bord principal
│   ├── HardwareIncidents.tsx  # Gestion incidents hardware
│   ├── SoftwareIncidents.tsx  # Gestion incidents software
│   ├── AddReport.tsx        # Ajout de rapports
│   ├── History.tsx          # Historique des incidents
│   └── AdminDashboard.tsx   # Tableau de bord admin
├── hooks/              # Hooks personnalisés
│   └── useIncidents.ts     # Hook de gestion des incidents
└── lib/                # Utilitaires
    └── utils.ts            # Fonctions utilitaires
```

## Déploiement

L'application peut être déployée sur n'importe quelle plateforme supportant les applications React/Vite :

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Docker

```sh
# Build pour la production
npm run build

# Les fichiers compilés se trouvent dans le dossier 'dist'
```
# ENNA-ATC---Gestion-des-Incidents
