# ENNA Project Structure

## Overview

```
ENNA/
├── backend/                 # Django REST Framework backend
│   ├── api/                # Main Django app
│   │   ├── models.py      # Database models
│   │   ├── views.py        # API views/ViewSets
│   │   ├── serializers.py # DRF serializers
│   │   ├── urls.py        # API routes
│   │   └── management/    # Management commands
│   ├── enna_backend/      # Django project config
│   │   ├── settings.py    # Main settings
│   │   └── urls.py        # Root URLs
│   ├── scripts/           # Utility scripts
│   │   ├── create_test_data.sh
│   │   ├── run_django.sh
│   │   ├── run_migrations_final.sh
│   │   └── archive/       # Archived migration scripts
│   ├── docs/              # Backend documentation
│   ├── manage.py          # Django CLI
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment template
│
├── src/                    # React frontend
│   ├── components/        # React components
│   │   ├── ui/           # Shadcn UI components
│   │   ├── IncidentForm.tsx
│   │   ├── IncidentTable.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client
│   └── lib/             # Utilities
│
├── docs/                  # Project documentation
│   ├── POSTGRESQL_MIGRATION.md
│   └── archive/         # Archived docs
│
├── public/               # Static assets
├── package.json         # Frontend dependencies
├── vite.config.ts       # Vite configuration
└── README.md            # Main project README
```

## Key Directories

### Backend (`backend/`)

- **`api/`**: Main Django application containing models, views, serializers
- **`enna_backend/`**: Django project configuration
- **`scripts/`**: Utility scripts for common tasks
- **`docs/`**: Backend-specific documentation

### Frontend (`src/`)

- **`components/`**: Reusable React components
- **`pages/`**: Page-level components
- **`hooks/`**: Custom React hooks for state management
- **`services/`**: API client and external service integrations

### Documentation (`docs/`)

- Project-wide documentation
- Migration guides
- Architecture documentation

## File Organization Principles

1. **Separation of Concerns**: Backend and frontend are clearly separated
2. **Modular Structure**: Components and features are organized by domain
3. **Documentation**: All documentation is centralized in `docs/`
4. **Scripts**: Utility scripts are organized in `scripts/` with archived items in subdirectories
5. **Configuration**: Environment and config files are at appropriate levels

## Naming Conventions

- **Python**: snake_case for files and functions
- **TypeScript/React**: PascalCase for components, camelCase for functions
- **Scripts**: lowercase with hyphens (e.g., `create_test_data.sh`)
- **Documentation**: UPPERCASE with underscores (e.g., `POSTGRESQL_MIGRATION.md`)

