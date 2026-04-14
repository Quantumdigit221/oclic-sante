# 🚀 DÉPLOIEMENT RAPIDE O'CLIC SANTE
## sante.quantum221.com - Hostinger

### 📋 ÉTAPES IMMÉDIATES (15 minutes)

#### 1. 🏥 Base de Données (5 min)
```sql
-- Via phpMyAdmin Hostinger:
1. Créer la base: oclic_sante_db
2. Importer: database-setup-hostinger.sql
3. Vérifier: 9 tables + données par défaut
```

#### 2. 🖥️ Backend API (5 min)
```bash
# Via File Manager Hostinger:
1. Créer dossier: /api
2. Uploader tout le contenu de backend/ dans /api
3. Créer .env.production avec vos identifiants MySQL
4. Exécuter: npm install --production
```

#### 3. 🌐 Frontend (5 min)
```bash
# Via File Manager Hostinger:
1. Uploader tout le contenu de frontend/ à la racine
2. Uploader .htaccess à la racine
3. Vérifier: index.html accessible
```

### ⚙️ CONFIGURATION CLÉ

#### Variables d'Environnement (.env.production)
```env
DB_HOST=localhost
DB_NAME=oclic_sante_db
DB_USER=votre_user_mysql
DB_PASSWORD=votre_password_mysql
API_BASE_URL=https://sante.quantum221.com/api
JWT_SECRET=votre_secret_jwt_32_caracteres_minimum
```

### 🧪 TESTS CRITIQUES

#### API
```bash
# Test immédiat:
curl https://sante.quantum221.com/api/health
# Doit retourner: {"status":"OK","message":"O'CLIC SANTE API - Hostinger"}
```

#### Frontend
```bash
# Navigateur:
https://sante.quantum221.com
# Doit afficher la page d'accueil O'CLIC SANTE
```

### 🚨 POINTS DE VIGILANCE

1. **HTTPS**: Vérifier le cadenas vert
2. **Base**: Vérifier phpMyAdmin connexion
3. **API**: Test /api/health avant tout
4. **Frontend**: Vérifier console navigateur (F12)

### 📞 SUPPORT RAPIDE

#### Erreurs Communes
- **500 Internal Server**: Vérifier .env.production
- **Database Connection**: Vérifier identifiants MySQL
- **404 Not Found**: Vérifier .htaccess
- **CORS Error**: Vérifier configuration API

#### Logs à Vérifier
- `/api/logs/` (logs backend)
- Console navigateur (erreurs frontend)
- phpMyAdmin (erreurs base)

### ✅ VALIDATION FINALE

#### Checklist Critique
- [ ] https://sante.quantum221.com accessible
- [ ] https://sante.quantum221.com/api/health → 200 OK
- [ ] Login admin fonctionne
- [ ] Création ticket fonctionne
- [ ] Consultation complète fonctionne

### 🎯 SUCCÈS GARANTI

Si toutes les étapes sont suivies:
- ✅ Site en ligne en 15 minutes
- ✅ Fonctionnalités médicales opérationnelles
- ✅ Sécurité HTTPS activée
- ✅ Base de données fonctionnelle

---

**O'CLIC SANTE** - Déploiement Garanti Hostinger 🚀
🌐 https://sante.quantum221.com
📞 Support: consulter DEPLOYMENT-CHECKLIST.md
