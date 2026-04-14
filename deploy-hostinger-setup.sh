#!/bin/bash

# Script de déploiement O'CLIC SANTE sur Hostinger
# Domaine: sante.quantum221.com

echo "🚀 Déploiement O'CLIC SANTE sur Hostinger..."

# 1. Build du frontend
echo "📦 Build du frontend..."
cd frontend
npm run build

# 2. Préparation du backend pour production
echo "⚙️ Configuration du backend..."
cd ../backend
# Créer un fichier server.php pour Hostinger
cat > server.php << 'EOF'
<?php
// Proxy PHP pour Node.js backend sur Hostinger
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Exécuter le serveur Node.js
$command = 'node src/server.js 2>&1';
$output = shell_exec($command);
echo $output;
?>
EOF

# 3. Créer le .htaccess pour le frontend
cd ..
cat > .htaccess << 'EOF'
# Configuration O'CLIC SANTE - Hostinger

# Activer la réécriture d'URL
RewriteEngine On

# Rediriger les requêtes API vers le backend Node.js
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ api/server.php [QSA,L]

# Forcer HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Fallback vers React Router (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Headers de sécurité
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression Gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache des fichiers statiques
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/ico "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType font/woff "access plus 1 month"
    ExpiresByType font/woff2 "access plus 1 month"
</IfModule>
EOF

echo "✅ Configuration terminée !"
echo "📁 Fichiers prêts pour l'upload sur Hostinger:"
echo "   - frontend/dist/ → public_html/"
echo "   - backend/ → public_html/api/"
echo "   - .htaccess → public_html/"
echo ""
echo "🔧 Prochaines étapes:"
echo "   1. Upload les fichiers sur Hostinger"
echo "   2. Configurer la base de données MySQL"
echo "   3. Mettre à jour .env.production"
echo "   4. Tester l'application"
