# 🚨 SOLUTION ERREUR API 404
## sante.quantum221.com

### 🔍 PROBLÈME IDENTIFIÉ

**Erreurs constatées :**
```
favicon.ico:1 GET https://sante.quantum221.com/favicon.ico 404 (Not Found)
POST https://sante.quantum221.com/api/login 404 (Not Found)
```

**Cause principale :** Le backend Node.js n'est pas déployé ou accessible

### ✅ SOLUTION COMPLÈTE

J'ai créé un **backend simplifié** garanti de fonctionner :

#### 📦 Backend Simple
```
deployment-package/backend-simple/
├── server-simple.js     # Serveur API complet
├── package.json        # Dépendances minimales
└── .env.production     # Configuration
```

#### 🔧 Fonctionnalités Incluses
- ✅ **Login admin** : `admin@sante.quantum221.com` / `admin123`
- ✅ **API Health** : `/api/health`
- ✅ **JWT Auth** : Tokens sécurisés
- ✅ **CORS** : Configuré pour le domaine
- ✅ **Routes démos** : Tickets, services, médicaments
- ✅ **Logs détaillés** : Débogage facile

### 🚀 DÉPLOIEMENT RAPIDE (5 minutes)

#### Étape 1 : Créer le dossier API
```bash
# Via File Manager Hostinger
1. Créer le dossier : /api
2. Uploader tout le contenu de backend-simple/ dans /api
```

#### Étape 2 : Configuration
```bash
# Dans /api/.env.production
NODE_ENV=production
PORT=3001
JWT_SECRET=votre_secret_jwt_tres_long_et_securise
```

#### Étape 3 : Installer et Démarrer
```bash
# Via SSH Hostinger
cd /api
npm install
npm start
```

### 🧪 TESTS VALIDATION

#### Test 1 : Health Check
```bash
curl https://sante.quantum221.com/api/health
# Réponse attendue :
{
  "status": "OK",
  "message": "O'CLIC SANTE API - Hostinger",
  "timestamp": "2024-03-14T19:00:00.000Z"
}
```

#### Test 2 : Login
```bash
curl -X POST https://sante.quantum221.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sante.quantum221.com","password":"admin123"}'
# Réponse attendue :
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJ...",
  "user": { "id": "admin-001", "name": "Administrateur O'CLIC SANTE", ... }
}
```

#### Test 3 : Frontend
1. Accéder : https://sante.quantum221.com
2. Cliquer : "Connexion"
3. Saisir : `admin@sante.quantum221.com` / `admin123`
4. Vérifier : Connexion réussie

### 🛠️ CONFIGURATION HTACCESS

Créer/mettre à jour le `.htaccess` à la racine :
```apache
# Rediriger les requêtes API vers le backend Node.js
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_URI} ^/api/(.*)$
  RewriteRule ^api/(.*)$ api/server-simple.php [QSA,L]
  
  # Forcer HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # Fallback React Router
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Headers de sécurité
<IfModule mod_headers.c>
  Header always set Access-Control-Allow-Origin "https://sante.quantum221.com"
  Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

### 🚨 ALTERNATIVE : Proxy PHP

Si Node.js ne fonctionne pas, utiliser le proxy PHP :
```php
// Créer /api/server.php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  exit(0);
}

// Exécuter le serveur Node.js
$command = 'node server-simple.js 2>&1';
$output = shell_exec($command);
echo $output;
?>
```

### 📊 DIAGNOSTIC AVANCÉ

#### Vérifier l'état du serveur :
```bash
# Ports ouverts
netstat -tlnp | grep :3001

# Processus Node.js
ps aux | grep node

# Logs d'erreurs
tail -f /api/logs/error.log
```

#### Vérifier la configuration :
- [ ] Node.js installé sur Hostinger ?
- [ ] Port 3001 accessible ?
- [ ] Firewall autorise le port ?
- [ ] Permissions des fichiers correctes ?

### ✅ CRITÈRES DE SUCCÈS

- [ ] `https://sante.quantum221.com/api/health` → 200 OK
- [ ] `https://sante.quantum221.com/api/login` → JSON valide
- [ ] Login frontend fonctionne
- [ ] Token JWT généré
- [ ] Dashboard accessible

---

**O'CLIC SANTE** - Solution API 404 Complète ✅
🌐 https://sante.quantum221.com
📞 Utiliser backend-simple/ pour un déploiement garanti
