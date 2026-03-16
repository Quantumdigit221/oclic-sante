# 🏥 O'CLIC SANTE - APPLICATION MONOLITHIQUE
## sante.quantum221.com

### 📋 Architecture Monolithique

Cette version combine **Frontend React + Backend Node.js** dans une seule application :

```
monolithique/
├── 📁 src/
│   └── server.js           # Serveur Express + API
├── 📁 public/              # Frontend React build
│   ├── index.html
│   ├── assets/
│   └── LOGO.png
├── 📄 package.json         # Dépendances
├── 🔧 .env                 # Variables d'environnement
└── 📖 README.md            # Documentation
```

### 🚀 Avantages de l'Architecture Monolithique

- ✅ **Déploiement simple** : Un seul dossier à uploader
- ✅ **Pas de CORS** : Frontend et Backend sur même domaine
- ✅ **Facile à maintenir** : Une seule codebase
- ✅ **Performance** : Communication intra-processus
- ✅ **Hébergement simple** : Compatible avec tous les hébergeurs

### 🔧 Fonctionnalités Incluses

#### API Endpoints
- `GET /api/health` - Health check
- `POST /api/login` - Authentification admin
- `GET /api/auth/verify` - Vérification token
- `GET /api/tickets` - Gestion tickets
- `GET /api/services` - Services médicaux
- `GET /api/medicines` - Pharmacologie
- `GET /api/patients` - Patients
- `GET /api/consultations` - Consultations

#### Frontend React
- 🏥 Dashboard médical complet
- 📋 File d'attente intelligente
- 💊 Gestion pharmacie
- 🩺 Consultations médicales
- 📄 Impression ordonnances
- 📱 Responsive mobile

### 🚀 DéPLOIEMENT HOSTINGER (2 minutes)

#### Étape 1 : Upload
```bash
# Via File Manager Hostinger
1. Uploader tout le dossier monolithique/ à la racine
2. Renommer en o-clic-sante/ (optionnel)
```

#### Étape 2 : Configuration
```bash
# Via SSH Hostinger
cd /public_html
npm install --production
npm start
```

#### Étape 3 : Test
```bash
# Vérifier l'application
https://sante.quantum221.com/api/health
https://sante.quantum221.com
```

### 🔐 Accès par Défaut

**Identifiants Super Admin :**
- **Email** : `admin@sante.quantum221.com`
- **Mot de passe** : `admin123`
- **Rôle** : `SUPER_ADMIN`

### 📊 Configuration Production

#### Variables d'Environnement (.env)
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=votre_secret_jwt_long_et_securise
APP_URL=https://sante.quantum221.com
```

#### Port Configuration
- **Développement** : Port 3000
- **Production** : Port 3000 (ou configuré via .env)
- **Hostinger** : Compatible avec tous les ports

### 🧪 Tests de Validation

#### Test 1 : API Health
```bash
curl https://sante.quantum221.com/api/health
# Réponse attendue :
{
  "status": "OK",
  "message": "O'CLIC SANTE API - Monolithique",
  "timestamp": "2024-03-14T20:00:00.000Z"
}
```

#### Test 2 : Login
```bash
curl -X POST https://sante.quantum221.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sante.quantum221.com","password":"admin123"}'
```

#### Test 3 : Frontend
- Accès : https://sante.quantum221.com
- Login : admin@sante.quantum221.com / admin123
- Dashboard : Accessible

### 🛠️ Personnalisation

#### Ajouter de nouvelles routes API
```javascript
// Dans src/server.js
app.get('/api/nouvelle-route', (req, res) => {
  res.json({ message: 'Nouvelle route fonctionnelle' });
});
```

#### Modifier le frontend
1. Modifier les fichiers dans `frontend/src/`
2. Rebuild : `npm run build:frontend`
3. Copier `frontend/dist/*` vers `monolithique/public/`
4. Re-déployer

### 📈 Monitoring et Logs

#### Logs serveur
```bash
# Voir les logs en temps réel
tail -f /var/log/nodejs/o-clic-sante.log
```

#### Monitoring API
- Health checks automatiques
- Logs des requêtes API
- Erreurs détaillées en développement

### 🔧 Maintenance

#### Mises à jour
1. Arrêter le serveur : `pkill node`
2. Uploader les nouveaux fichiers
3. Redémarrer : `npm start`

#### Backup
- Base de données : Export SQL quotidien
- Fichiers : Backup hebdomadaire du dossier
- Configuration : Sauvegarder .env

---

**O'CLIC SANTE** - Solution Monolithique Complète ✅
🌐 https://sante.quantum221.com
📞 Déploiement garanti en 2 minutes
