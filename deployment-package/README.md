# 🚀 Package de Déploiement O'CLIC SANTE
## Domaine: sante.quantum221.com

### 📦 Contenu du Package

```
deployment-package/
├── 📁 frontend/              # Build optimisé pour production
│   ├── index.html
│   ├── assets/
│   └── ... (fichiers statiques)
├── 📁 backend/               # Backend configuré pour Hostinger
│   ├── src/
│   ├── package.json
│   └── server-hostinger.js
├── 📁 database/              # Scripts SQL pour la base de données
│   └── database-setup-hostinger.sql
├── ⚙️ .htaccess             # Configuration Apache
├── 🔧 deploy-instructions.md  # Instructions détaillées
└── 📋 checklist.md          # Checklist de déploiement
```

### 🎯 Instructions Rapides

#### 1. Prérequis Hostinger
- ✅ Plan Business Cloud ou supérieur
- ✅ Base de données MySQL active
- ✅ Domaine `sante.quantum221.com` configuré
- ✅ Accès SSH/File Manager

#### 2. Étapes de Déploiement

1. **Base de Données**
   ```sql
   -- Importer via phpMyAdmin
   -- database-setup-hostinger.sql
   ```

2. **Configuration Backend**
   ```bash
   # Uploader le backend dans /api/
   # Configurer .env.production
   # Installer les dépendances
   npm install --production
   ```

3. **Configuration Frontend**
   ```bash
   # Uploader le build dans /
   # Copier .htaccess à la racine
   # Configurer les variables d'environnement
   ```

4. **Tests**
   - API: `https://sante.quantum221.com/api/health`
   - Frontend: `https://sante.quantum221.com`

### 🔧 Configuration Clé

#### Variables d'Environnement (.env.production)
```env
NODE_ENV=production
DB_HOST=localhost
DB_NAME=oclic_sante_db
DB_USER=votre_user_mysql
DB_PASSWORD=votre_password
API_BASE_URL=https://sante.quantum221.com/api
VITE_APP_URL=https://sante.quantum221.com
```

#### .htaccess
- Redirection HTTPS automatique
- Proxy API vers `/api`
- Support React Router
- Compression Gzip
- Cache statique

### 🚨 Points de Surveillance

- **Performance**: Temps de chargement < 3s
- **API**: Réponse < 500ms
- **Base**: Requêtes < 100ms
- **Sécurité**: HTTPS obligatoire

### 📞 Support

- Logs: `/api/logs/`
- Monitoring: Hostinger Dashboard
- Backup: Quotidien automatique

---
**O'CLIC SANTE** - Plateforme Médicale Complète
🌐 https://sante.quantum221.com
