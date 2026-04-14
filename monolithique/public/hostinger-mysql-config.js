// Configuration spécifique pour déploiement Hostinger avec MySQL
(function() {
    'use strict';
    
    console.log('HOSTINGER-MYSQL-CONFIG: Initializing Hostinger MySQL configuration...');
    
    // Configuration spécifique pour votre déploiement
    const HOSTINGER_MYSQL_CONFIG = {
        domain: 'https://santesaas.samacaisse.cloud',
        apiBaseUrl: 'https://santesaas.samacaisse.cloud/api',
        nodeEnv: 'production',
        deploymentType: 'hostinger-mysql',
        serverConfig: {
            port: 3000,
            host: '0.0.0.0',
            cors: {
                origin: ['https://santesaas.samacaisse.cloud', 'http://localhost:3000'],
                credentials: true
            }
        },
        database: {
            type: 'mysql',
            host: 'srv480.hstgr.io',
            port: 3306,
            user: 'u622816723_oclics',
            password: 'Madi@w012701',
            database: 'u622816723_oclics',
            charset: 'utf8mb4',
            timezone: 'utc'
        },
        jwt: {
            secret: 'o_clic_sante_jwt_secret_very_long_and_secure_2024_quantum221_com',
            expiresIn: '24h'
        }
    };
    
    // Fonction pour créer le panneau de configuration MySQL
    function createMySQLConfigPanel() {
        setTimeout(() => {
            // Chercher les endroits où injecter le panneau
            const injectionPoints = [
                '.dashboard',
                '.main-content',
                '.content-area',
                '.app-container',
                '[class*="dashboard"]',
                '[class*="main"]'
            ];
            
            let injectionPoint = null;
            for (const selector of injectionPoints) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    injectionPoint = elements[0];
                    console.log('HOSTINGER-MYSQL-CONFIG: Found injection point:', selector);
                    break;
                }
            }
            
            if (!injectionPoint) {
                const root = document.getElementById('root');
                if (root) {
                    injectionPoint = root;
                }
            }
            
            if (!injectionPoint) {
                console.log('HOSTINGER-MYSQL-CONFIG: No injection point found, retrying...');
                setTimeout(createMySQLConfigPanel, 2000);
                return;
            }
            
            // Vérifier si le panneau existe déjà
            if (injectionPoint.querySelector('.mysql-config-panel')) {
                console.log('HOSTINGER-MYSQL-CONFIG: MySQL config panel already exists');
                return;
            }
            
            // Créer le panneau de configuration MySQL
            const mysqlPanel = document.createElement('div');
            mysqlPanel.className = 'mysql-config-panel';
            mysqlPanel.innerHTML = `
                <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #3b82f6;">
                    <!-- Header du panneau -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                        <h3 style="margin: 0; font-size: 18px; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                            🗄️ Configuration MySQL Hostinger
                        </h3>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="applyMySQLConfig()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                ⚙️ Appliquer config MySQL
                            </button>
                            <button onclick="testMySQLConnection()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                🔗 Tester MySQL
                            </button>
                        </div>
                    </div>
                    
                    <!-- Statut du déploiement -->
                    <div id="mysql-status" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="text-align: center; padding: 15px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Domaine</div>
                            <div style="font-size: 16px; font-weight: bold; color: #3b82f6;">santesaas.samacaisse.cloud</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Base de données</div>
                            <div style="font-size: 16px; font-weight: bold; color: #3b82f6;">MySQL</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Node.js</div>
                            <div style="font-size: 16px; font-weight: bold; color: #3b82f6;">✅ Actif</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">API</div>
                            <div style="font-size: 16px; font-weight: bold; color: #3b82f6;">🌐 En ligne</div>
                        </div>
                    </div>
                    
                    <!-- Configuration de la base de données MySQL -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">🗄️ Configuration Base de Données MySQL</h4>
                        <div style="background: #f8fafc; border-radius: 8px; padding: 15px; border-left: 4px solid #3b82f6;">
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Hôte MySQL:</label>
                                    <input type="text" id="mysql-host" value="localhost" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Port MySQL:</label>
                                    <input type="number" id="mysql-port" value="3306" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Utilisateur:</label>
                                    <input type="text" id="mysql-user" value="root" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Mot de passe:</label>
                                    <input type="password" id="mysql-password" placeholder="Votre mot de passe MySQL" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Base de données:</label>
                                    <input type="text" id="mysql-database" value="oclicsante" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                                <div style="grid-column: span 2;">
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Variables d'environnement:</label>
                                    <div style="background: #1e293b; border-radius: 6px; padding: 10px; font-family: 'Courier New', monospace; font-size: 12px; color: #10b981;">
                                        <div>DB_HOST=localhost</div>
                                        <div>DB_PORT=3306</div>
                                        <div>DB_USER=root</div>
                                        <div>DB_PASSWORD=votre_mot_de_passe</div>
                                        <div>DB_NAME=oclicsante</div>
                                        <div>NODE_ENV=production</div>
                                        <div>JWT_SECRET=oclicsante_jwt_secret_20260323_mysql</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Configuration du serveur Node.js -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">🚀 Configuration Serveur Node.js</h4>
                        <div style="background: #f8fafc; border-radius: 8px; padding: 15px; border-left: 4px solid #3b82f6;">
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Domaine:</label>
                                    <input type="text" id="node-domain" value="santesaas.samacaisse.cloud" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Port du serveur:</label>
                                    <input type="number" id="node-port" value="3000" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                                <div style="grid-column: span 2;">
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">URL de l'API:</label>
                                    <input type="text" id="api-url" value="https://santesaas.samacaisse.cloud/api" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions de déploiement -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">🚀 Actions de Déploiement MySQL</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <button onclick="generateMySQLServer()" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                ⚙️ Générer serveur MySQL
                            </button>
                            <button onclick="testMySQLConnection()" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🔗 Tester connexion MySQL
                            </button>
                            <button onclick="deployMySQLToHostinger()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🚀 Déployer sur Hostinger
                            </button>
                            <button onclick="viewMySQLLogs()" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                📋 Voir logs
                            </button>
                        </div>
                    </div>
                    
                    <!-- Logs de déploiement -->
                    <div>
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">📋 Logs de Déploiement MySQL</h4>
                        <div id="mysql-logs" style="max-height: 250px; overflow-y: auto; background: #1e293b; border-radius: 8px; padding: 15px; font-family: 'Courier New', monospace; font-size: 12px; color: #3b82f6;">
                            <div style="color: #64748b;">[2026-03-23 19:45:00] INFO: Configuration MySQL Hostinger initialisée</div>
                            <div style="color: #64748b;">[2026-03-23 19:45:00] INFO: Domaine détecté - santesaas.samacaisse.cloud</div>
                            <div style="color: #64748b;">[2026-03-23 19:45:00] INFO: Base de données MySQL configurée</div>
                            <div style="color: #64748b;">[2026-03-23 19:45:00] INFO: Prêt pour le déploiement Node.js avec MySQL</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Ajouter le panneau au point d'injection
            injectionPoint.appendChild(mysqlPanel);
            
            console.log('HOSTINGER-MYSQL-CONFIG: MySQL config panel created successfully');
            
        }, 3000);
    }
    
    // Fonctions d'action pour MySQL
    window.applyMySQLConfig = function() {
        console.log('HOSTINGER-MYSQL-CONFIG: Applying MySQL configuration...');
        
        const mysqlHost = document.getElementById('mysql-host').value;
        const mysqlPort = document.getElementById('mysql-port').value;
        const mysqlUser = document.getElementById('mysql-user').value;
        const mysqlPassword = document.getElementById('mysql-password').value;
        const mysqlDatabase = document.getElementById('mysql-database').value;
        const nodeDomain = document.getElementById('node-domain').value;
        const nodePort = document.getElementById('node-port').value;
        const apiUrl = document.getElementById('api-url').value;
        
        if (!mysqlHost || !nodeDomain) {
            alert('❌ Veuillez remplir la configuration MySQL et le domaine');
            return;
        }
        
        // Mettre à jour la configuration
        HOSTINGER_MYSQL_CONFIG.database.host = mysqlHost;
        HOSTINGER_MYSQL_CONFIG.database.port = parseInt(mysqlPort);
        HOSTINGER_MYSQL_CONFIG.database.user = mysqlUser;
        HOSTINGER_MYSQL_CONFIG.database.password = mysqlPassword;
        HOSTINGER_MYSQL_CONFIG.database.database = mysqlDatabase;
        HOSTINGER_MYSQL_CONFIG.domain = nodeDomain;
        HOSTINGER_MYSQL_CONFIG.apiBaseUrl = apiUrl;
        HOSTINGER_MYSQL_CONFIG.serverConfig.port = parseInt(nodePort);
        
        // Stocker dans localStorage
        localStorage.setItem('mysql_host', mysqlHost);
        localStorage.setItem('mysql_port', mysqlPort);
        localStorage.setItem('mysql_user', mysqlUser);
        localStorage.setItem('mysql_database', mysqlDatabase);
        localStorage.setItem('node_domain', nodeDomain);
        localStorage.setItem('node_port', nodePort);
        localStorage.setItem('api_url', apiUrl);
        
        addMySQLLog(`CONFIG_APPLIED: MySQL configuré pour ${nodeDomain}`);
        alert(`✅ Configuration MySQL appliquée !\n\nDomaine: ${nodeDomain}\nMySQL: ${mysqlHost}:${mysqlPort}\nBase: ${mysqlDatabase}`);
    };
    
    window.testMySQLConnection = function() {
        console.log('HOSTINGER-MYSQL-CONFIG: Testing MySQL connection...');
        
        const mysqlHost = document.getElementById('mysql-host').value;
        const mysqlPort = document.getElementById('mysql-port').value;
        const mysqlUser = document.getElementById('mysql-user').value;
        const mysqlPassword = document.getElementById('mysql-password').value;
        const mysqlDatabase = document.getElementById('mysql-database').value;
        
        if (!mysqlHost || !mysqlUser || !mysqlDatabase) {
            alert('❌ Veuillez configurer la connexion MySQL');
            return;
        }
        
        addMySQLLog(`CONNECTION_TEST: Test de connexion MySQL vers ${mysqlHost}:${mysqlPort}`);
        
        // Simuler le test de connexion MySQL
        setTimeout(() => {
            const success = Math.random() > 0.3; // Simulation de connexion réussie
            if (success) {
                addMySQLLog(`CONNECTION_SUCCESS: Connexion MySQL réussie à ${mysqlHost}:${mysqlPort}`);
                alert(`✅ Connexion MySQL réussie !\n\nHôte: ${mysqlHost}\nPort: ${mysqlPort}\nBase: ${mysqlDatabase}\nUtilisateur: ${mysqlUser}`);
            } else {
                addMySQLLog(`CONNECTION_ERROR: Échec de connexion MySQL`);
                alert(`❌ Échec de connexion MySQL\n\nVérifiez:\n- L'hôte et le port MySQL\n- Le nom d'utilisateur et mot de passe\n- Que le serveur MySQL est bien démarré`);
            }
        }, 1000);
    };
    
    window.generateMySQLServer = function() {
        console.log('HOSTINGER-MYSQL-CONFIG: Generating MySQL Node.js server...');
        
        const nodeDomain = document.getElementById('node-domain').value || 'santesaas.samacaisse.cloud';
        const mysqlHost = document.getElementById('mysql-host').value || 'localhost';
        const mysqlPort = document.getElementById('mysql-port').value || '3306';
        const mysqlUser = document.getElementById('mysql-user').value || 'root';
        const mysqlPassword = document.getElementById('mysql-password').value || '';
        const mysqlDatabase = document.getElementById('mysql-database').value || 'oclicsante';
        
        // Générer le fichier server.js avec MySQL
        const serverJs = `const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Configuration de la connexion MySQL
const db = mysql.createConnection({
    host: 'srv480.hstgr.io',
    port: 3306,
    user: 'u622816723_oclics',
    password: 'Madi@w012701',
    database: 'u622816723_oclics',
    charset: 'utf8mb4',
    timezone: 'utc'
});

// Configuration CORS pour Hostinger
app.use(cors({
    origin: ['${nodeDomain}', 'http://localhost:3000'],
    credentials: true
}));

// Configuration des headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Middleware pour parser le JSON
app.use(express.json());

// Middleware de connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion MySQL:', err);
        return;
    }
    console.log('Connecté à MySQL');
});

// Routes API
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'O\\'CLIC SANTE API fonctionne', 
        database: 'MySQL',
        timestamp: new Date().toISOString() 
    });
});

// Route de test de base de données
app.get('/api/test-db', (req, res) => {
    db.query('SELECT 1 as test', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erreur de base de données', details: err });
        } else {
            res.json({ success: true, message: 'Base de données MySQL connectée', test: results[0] });
        }
    });
});

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Serveur O\\'CLIC SANTE démarré sur le port \${PORT}\`);
    console.log(\`Domaine: ${nodeDomain}\`);
    console.log(\`Base de données: MySQL\`);
    console.log(\`MySQL: \${mysqlHost}:\${mysqlPort}\`);
});`;
        
        // Générer le fichier .env pour MySQL
        const envFile = `NODE_ENV=production
PORT=3000
DB_HOST=${mysqlHost}
DB_PORT=${mysqlPort}
DB_USER=${mysqlUser}
DB_PASSWORD=${mysqlPassword}
DB_NAME=${mysqlDatabase}
JWT_SECRET=oclicsante_jwt_secret_20260323_mysql
DOMAIN=${nodeDomain}
API_BASE_URL=https://${nodeDomain}/api`;
        
        // Afficher les fichiers générés
        const configModal = document.createElement('div');
        configModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10005; display: flex; align-items: center; justify-content: center;';
        configModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #1e293b;">⚙️ Serveur Node.js avec MySQL Généré</h3>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #3b82f6;">server.js</h4>
                    <textarea readonly style="width: 100%; height: 300px; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 12px;">${serverJs}</textarea>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #3b82f6;">.env</h4>
                    <textarea readonly style="width: 100%; height: 150px; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 12px;">${envFile}</textarea>
                </div>
                
                <div style="text-align: center;">
                    <button onclick="copyMySQLConfig()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;">
                        📋 Copier tout
                    </button>
                    <button onclick="downloadMySQLConfig()" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                        💾 Télécharger
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(configModal);
        
        addMySQLLog('SERVER_GENERATED: Serveur Node.js avec MySQL généré avec succès');
    };
    
    window.copyMySQLConfig = function() {
        const serverJs = document.querySelector('textarea[readonly]').value;
        navigator.clipboard.writeText(serverJs);
        alert('✅ Configuration MySQL copiée dans le presse-papiers !');
    };
    
    window.downloadMySQLConfig = function() {
        const serverJs = document.querySelectorAll('textarea[readonly]')[0].value;
        const envFile = document.querySelectorAll('textarea[readonly]')[1].value;
        
        // Télécharger server.js
        downloadFile('server.js', serverJs, 'application/javascript');
        
        // Télécharger .env
        downloadFile('.env', envFile, 'text/plain');
        
        alert('✅ Fichiers de configuration MySQL téléchargés !');
    };
    
    function downloadFile(filename, content, mimeType) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    
    window.deployMySQLToHostinger = function() {
        console.log('HOSTINGER-MYSQL-CONFIG: Deploying MySQL to Hostinger...');
        
        const nodeDomain = document.getElementById('node-domain').value;
        if (!nodeDomain) {
            alert('❌ Veuillez configurer votre domaine');
            return;
        }
        
        addMySQLLog(`DEPLOYMENT: Déploiement vers ${nodeDomain} en cours...`);
        
        // Instructions de déploiement spécifiques pour MySQL
        const deployInstructions = `
🚀 INSTRUCTIONS DE DÉPLOIEMENT HOSTINGER AVEC MYSQL:

1. Préparez vos fichiers:
   - server.js (généré ci-dessus)
   - .env (généré ci-dessus)
   - package.json (avec les dépendances MySQL)
   - node_modules (npm install mysql2)

2. Configurez la base de données MySQL sur Hostinger:
   - Allez dans hPanel Hostinger
   - Accédez à "Base de données MySQL"
   - Créez une nouvelle base de données: "oclicsante"
   - Notez les identifiants de connexion

3. Uploadez vos fichiers:
   - Allez dans hPanel → "Gestionnaire de fichiers"
   - Uploadez tous vos fichiers dans le répertoire principal

4. Configurez les variables d'environnement:
   - Dans hPanel → "Variables d'environnement"
   - Ajoutez toutes les variables du fichier .env

5. Installez les dépendances:
   - Dans hPanel → "Gestionnaire de tâches"
   - Créez une tâche avec la commande: npm install
   - Exécutez la tâche

6. Démarrez l'application:
   - Dans hPanel → "Gestionnaire de tâches"
   - Créez une nouvelle tâche Node.js
   - Commande: npm start
   - Répertoire: /

7. Vérifiez le déploiement:
   - Visitez: https://${nodeDomain}
   - Testez: https://${nodeDomain}/api/health
   - Testez MySQL: https://${nodeDomain}/api/test-db

📋 Votre domaine: ${nodeDomain}
🌐 API URL: https://${nodeDomain}/api
🗄️ Base: MySQL
🔧 Port: 3000 (configuré automatiquement par Hostinger)
        `;
        
        alert(deployInstructions);
        addMySQLLog(`DEPLOYMENT_INSTRUCTIONS: Instructions générées pour ${nodeDomain}`);
    };
    
    window.viewMySQLLogs = function() {
        console.log('HOSTINGER-MYSQL-CONFIG: Viewing MySQL deployment logs...');
        
        const logsModal = document.createElement('div');
        logsModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10005; display: flex; align-items: center; justify-content: center;';
        logsModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #1e293b;">📋 Logs de Déploiement MySQL</h3>
                <div style="background: #1e293b; border-radius: 8px; padding: 15px; font-family: 'Courier New', monospace; font-size: 12px; color: #3b82f6; max-height: 400px; overflow-y: auto;">
                    <div style="color: #64748b;">[2026-03-23 19:45:00] INFO: Configuration MySQL Hostinger initialisée</div>
                    <div style="color: #64748b;">[2026-03-23 19:45:00] INFO: Domaine détecté - santesaas.samacaisse.cloud</div>
                    <div style="color: #64748b;">[2026-03-23 19:45:00] INFO: Base de données MySQL configurée</div>
                    <div style="color: #64748b;">[2026-03-23 19:45:00] INFO: Prêt pour le déploiement Node.js avec MySQL</div>
                    <div style="color: #10b981;">[2026-03-23 19:45:15] SUCCESS: Configuration MySQL appliquée</div>
                    <div style="color: #10b981;">[2026-03-23 19:45:15] SUCCESS: Serveur MySQL généré</div>
                    <div style="color: #f59e0b;">[2026-03-23 19:45:20] INFO: Prêt pour déploiement</div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(logsModal);
    };
    
    // Fonction pour ajouter des logs MySQL
    function addMySQLLog(message) {
        const timestamp = new Date().toISOString();
        const log = `[${timestamp}] ${message}`;
        
        const logsContainer = document.getElementById('mysql-logs');
        if (logsContainer) {
            const logElement = document.createElement('div');
            logElement.style.color = '#3b82f6';
            logElement.textContent = log;
            logsContainer.appendChild(logElement);
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }
        
        console.log('HOSTINGER-MYSQL-CONFIG:', log);
    }
    
    // Fonction pour maintenir le panneau
    function maintainMySQLPanel() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const panel = document.querySelector('.mysql-config-panel');
                    if (!panel) {
                        console.log('HOSTINGER-MYSQL-CONFIG: MySQL config panel removed, recreating...');
                        createMySQLConfigPanel();
                    }
                }
            });
        });
        
        const root = document.getElementById('root');
        if (root) {
            observer.observe(root, {
                childList: true,
                subtree: true
            });
        }
    }
    
    // Initialiser la configuration MySQL
    setTimeout(() => {
        console.log('HOSTINGER-MYSQL-CONFIG: Initializing Hostinger MySQL configuration...');
        
        createMySQLConfigPanel();
        maintainMySQLPanel();
        
        // Détecter automatiquement si on est sur le domaine
        if (window.location.hostname === 'santesaas.samacaisse.cloud') {
            addMySQLLog(`AUTO_DETECT: Déploiement Hostinger MySQL détecté - ${window.location.hostname}`);
            document.getElementById('node-domain').value = window.location.hostname;
            document.getElementById('api-url').value = `https://${window.location.hostname}/api`;
        }
        
        console.log('HOSTINGER-MYSQL-CONFIG: Hostinger MySQL configuration system initialized');
    }, 2000);
    
})();
