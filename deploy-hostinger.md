# Guide de Déploiement O'CLIC SANTE sur Hostinger
## Domaine: sante.quantum221.com

### 📋 Prérequis Hostinger
- Plan Business Cloud ou supérieur (support Node.js)
- Base de données MySQL incluse
- Accès SSH/File Manager
- Domaine configuré: sante.quantum221.com

### 🗂️ Structure des Fichiers sur Hostinger

```
public_html/
├── index.html                    # Frontend build
├── assets/                       # Fichiers statiques Vite
├── api/                          # Dossier backend
│   ├── package.json
│   ├── src/
│   │   └── server.js
│   └── node_modules/
├── .htaccess                     # Configuration Apache
└── database/                     # Config DB (via phpMyAdmin)
```

### 🔧 Étapes de Déploiement

#### 1. Build du Frontend
```bash
cd "c:\xampp\htdocs\santé saas"
npm run build:frontend
```

#### 2. Configuration Backend pour Production
- Modifier le backend pour écouter sur le port 3001
- Configurer les variables d'environnement
- Adapter les chemins de fichiers

#### 3. Configuration Base de Données
- Créer la base MySQL sur Hostinger
- Importer le schéma depuis `backend/database/`
- Configurer les accès dans `.env.production`

#### 4. Upload des Fichiers
- Upload du frontend dans `public_html/`
- Upload du backend dans `public_html/api/`
- Configuration du `.htaccess`

#### 5. Tests et Validation
- Test de l'API: `https://sante.quantum221.com/api/health`
- Test du frontend: `https://sante.quantum221.com`
- Vérification des fonctionnalités clés

### ⚙️ Configurations Techniques

#### .htaccess (Frontend)
```apache
# Rediriger les requêtes API vers le backend
RewriteEngine On
RewriteRule ^api/(.*)$ api/index.php [QSA,L]

# Fallback vers React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Vite Config (Production)
- Base URL: `/`
- API Proxy: `/api`
- Build optimisé pour production

#### Variables d'Environnement
```
NODE_ENV=production
DB_HOST=localhost
DB_NAME=oclic_sante_db
API_BASE_URL=https://sante.quantum221.com/api
```

### 🔐 Sécurité
- HTTPS obligatoire (SSL Hostinger)
- Variables d'environnement sécurisées
- CORS configuré pour le domaine
- Authentication JWT robuste

### 📊 Monitoring
- Logs d'erreurs activés
- Monitoring des performances
- Backup automatique de la base

### 🚀 Post-Déploiement
- Tests complets de toutes les fonctionnalités
- Monitoring des performances
- Documentation utilisateur
- Plan de maintenance

### 🆘 Support et Dépannage
- Logs d'erreurs: `/api/logs/`
- Backup automatique quotidien
- Contact support Hostinger si besoin
