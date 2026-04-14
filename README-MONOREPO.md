# O'CLIC SANTE - Monorepo

## 📁 Structure du Monorepo

```
o-clic-sante/
├── packages/
│   ├── frontend/          # Application React/Vite
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── store.tsx
│   │   │   └── ...
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── backend/           # API Node.js/Express
│   │   ├── src/
│   │   │   ├── server.js
│   │   │   └── lib/
│   │   └── package.json
│   └── shared/            # Types et utilitaires partagés
│       ├── src/
│       │   └── types.ts
│       └── package.json
├── package.json           # Configuration du monorepo
└── README-MONOREPO.md
```

## 🚀 Scripts disponibles

### Développement
- `npm run dev` - Lance frontend (port 3004) + backend (port 3001)
- `npm run dev:frontend` - Lance uniquement le frontend
- `npm run dev:backend` - Lance uniquement le backend

### Build
- `npm run build` - Build tous les packages
- `npm run build:frontend` - Build uniquement le frontend
- `npm run build:backend` - Build uniquement le backend

### Production
- `npm run start` - Démarre le backend en production
- `npm run test` - Lance les tests de tous les packages
- `npm run lint` - Lance le linting de tous les packages

## 🔧 Installation

```bash
# Installation des dépendances de tous les packages
npm install

# Installation des dépendances de production
npm run install:prod
```

## 🌐 Accès à l'application

- **Frontend**: http://127.0.0.1:3004
- **Backend API**: http://localhost:3001
- **Base de données**: MySQL (sante_saas)

## 👤 Comptes utilisateurs

Tous les comptes utilisent le mot de passe: `demo123`

### Super Admin
- `superadmin@sante.sn` - Accès tous centres
- `admin@sante-saas.sn` - Accès tous centres

### Admin Centre
- `admin@centre1.sn` - Centre Principal
- `admin@kaolack.sn` - Kaolack
- `admin@pikine.sn` - Pikine
- `admin@thies.sn` - Thiès

### Autres rôles
- Docteurs: `doctor1@{centre}.sn`
- Pharmaciens: `pharma1@{centre}.sn`
- Réceptionnistes: `patient1@{centre}.sn`

## 📦 Workspaces

Ce monorepo utilise npm workspaces pour gérer les dépendances partagées:

- `@o-clic-sante/frontend` - Application React
- `@o-clic-sante/backend` - API Express
- `@o-clic-sante/shared` - Types et utilitaires partagés

## 🛠️ Technologies

### Frontend
- React 19
- Vite 6
- TypeScript
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express
- TypeScript
- MySQL2
- Sequelize

### Shared
- TypeScript
- Types partagés

## 🔄 Développement

Pour ajouter un nouveau package:

1. Créer le dossier dans `packages/`
2. Ajouter un `package.json` avec le nom `@o-clic-sante/package-name`
3. Ajouter les dépendances partagées avec `"@o-clic-sante/shared": "workspace:*"`
4. Lancer `npm install` à la racine

## 🐛 Débogage

- Logs frontend: Console du navigateur
- Logs backend: Terminal où `npm run dev:backend` est lancé
- Base de données: Utiliser les scripts dans le dossier racine (`list_users.js`, `test_login.js`, etc.)
