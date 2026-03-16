@echo off
echo ============================================
echo O'CLIC SANTE - Installation Base de Donnees
echo ============================================

echo.
echo 1. Verification de MySQL...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL n'est pas installe ou non accessible
    echo 📥 Veuillez installer MySQL depuis: https://dev.mysql.com/downloads/mysql/
    pause
    exit /b 1
)

echo ✅ MySQL est accessible

echo.
echo 2. Creation de la base de donnees...
mysql -u root -p < database/schema.sql
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de la creation de la base de donnees
    pause
    exit /b 1
)

echo ✅ Base de donnees cree avec succes

echo.
echo 3. Verification de la configuration .env...
if not exist .env (
    echo ❌ Fichier .env non trouve
    echo 📝 Creation du fichier .env...
    copy .env.example .env
    echo ✅ Fichier .env cree - veuillez le configurer
) else (
    echo ✅ Fichier .env trouve
)

echo.
echo 4. Installation des dependances Node.js...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dependances
    pause
    exit /b 1
)

echo ✅ Dependances installees

echo.
echo ============================================
echo 🎉 Installation terminee avec succes!
echo ============================================
echo.
echo 📋 Prochaines etapes:
echo 1. Configurez le fichier .env avec vos identifiants MySQL
echo 2. Demarrez le serveur: npm run dev-db
echo 3. Accedez a l'application: http://localhost:3000
echo.
echo Identifiants par defaut:
echo Email: admin@sante.quantum221.com
echo Mot de passe: admin123
echo.
pause
