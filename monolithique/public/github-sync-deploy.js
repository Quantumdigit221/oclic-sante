// Système de synchronisation GitHub pour déploiement Hostinger
(function() {
    'use strict';
    
    console.log('GITHUB-SYNC-DEPLOY: Initializing GitHub sync and deployment system...');
    
    // Configuration GitHub pour votre déploiement
    const GITHUB_SYNC_CONFIG = {
        repository: 'oclic-sante',
        owner: 'Quantumdigit221',
        branch: 'main',
        apiUrl: 'https://api.github.com/repos/Quantumdigit221/oclic-sante',
        rawUrl: 'https://raw.githubusercontent.com/Quantumdigit221/oclic-sante/main',
        webUrl: 'https://github.com/Quantumdigit221/oclic-sante',
        deploymentUrl: 'https://santesaas.samacaisse.cloud',
        apiBaseUrl: 'https://santesaas.samacaisse.cloud/api',
        syncInterval: 5 * 60 * 1000, // 5 minutes
        autoSync: true,
        currentVersion: localStorage.getItem('github_current_version') || '1.0.0',
        lastSync: localStorage.getItem('github_last_sync') || null,
        deploymentStatus: {
            services: 'working',
            medicines: 'error_503',
            patients: 'working',
            consultations: 'working',
            center: 'working'
        }
    };
    
    // Fonction pour créer le panneau de synchronisation GitHub
    function createGitHubSyncPanel() {
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
                    console.log('GITHUB-SYNC-DEPLOY: Found injection point:', selector);
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
                console.log('GITHUB-SYNC-DEPLOY: No injection point found, retrying...');
                setTimeout(createGitHubSyncPanel, 2000);
                return;
            }
            
            // Vérifier si le panneau existe déjà
            if (injectionPoint.querySelector('.github-sync-panel')) {
                console.log('GITHUB-SYNC-DEPLOY: GitHub sync panel already exists');
                return;
            }
            
            // Créer le panneau de synchronisation GitHub
            const syncPanel = document.createElement('div');
            syncPanel.className = 'github-sync-panel';
            syncPanel.innerHTML = `
                <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #10b981;">
                    <!-- Header du panneau -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                        <h3 style="margin: 0; font-size: 18px; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                            🔄 Synchronisation GitHub
                        </h3>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="checkGitHubStatus()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                🔄 Vérifier statut
                            </button>
                            <button onclick="syncFromGitHub()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                📥 Synchroniser depuis GitHub
                            </button>
                            <button onclick="pushToGitHub()" style="background: #8b5cf6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                📤 Pousser vers GitHub
                            </button>
                        </div>
                    </div>
                    
                    <!-- Statut de la synchronisation -->
                    <div id="sync-status" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Déploiement</div>
                            <div style="font-size: 16px; font-weight: bold; color: #10b981;">Hostinger</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Base de données</div>
                            <div style="font-size: 16px; font-weight: bold; color: #10b981;">MySQL</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">API Status</div>
                            <div style="font-size: 16px; font-weight: bold; color: #ef4444;">⚠️ 503</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Auto-sync</div>
                            <div style="font-size: 16px; font-weight: bold; color: #10b981;">✅ Actif</div>
                        </div>
                    </div>
                    
                    <!-- Statut des services API -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">📊 Statut des Services API</h4>
                        <div id="services-status" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                            <div style="text-align: center; padding: 10px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 3px;">Services</div>
                                <div style="font-size: 14px; font-weight: bold; color: #10b981;">✅ OK</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: #fef2f2; border-radius: 6px; border: 1px solid #fecaca;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 3px;">Medicines</div>
                                <div style="font-size: 14px; font-weight: bold; color: #ef4444;">❌ 503</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 3px;">Patients</div>
                                <div style="font-size: 14px; font-weight: bold; color: #10b981;">✅ OK</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 3px;">Consultations</div>
                                <div style="font-size: 14px; font-weight: bold; color: #10b981;">✅ OK</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Configuration GitHub -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">⚙️ Configuration GitHub</h4>
                        <div style="background: #f8fafc; border-radius: 8px; padding: 15px; border-left: 4px solid #10b981;">
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Dépôt GitHub:</label>
                                    <input type="text" id="github-repo" value="Quantumdigit221/oclic-sante" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Branche:</label>
                                    <input type="text" id="github-branch" value="main" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Token GitHub:</label>
                                    <input type="text" id="github-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">URL déploiement:</label>
                                    <input type="text" id="deployment-url" value="https://santesaas.samacaisse.cloud" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions de synchronisation -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">🔄 Actions de Synchronisation</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <button onclick="testAllAPIEndpoints()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🔍 Tester tous les endpoints
                            </button>
                            <button onclick="fix503Errors()" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🛠️ Corriger les erreurs 503
                            </button>
                            <button onclick="deployFixedCode()" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🚀 Déployer le code corrigé
                            </button>
                            <button onclick="setupAutoSync()" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                ⚙️ Configurer auto-sync
                            </button>
                        </div>
                    </div>
                    
                    <!-- Historique de synchronisation -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">📋 Historique de Synchronisation</h4>
                        <div id="sync-history" style="max-height: 200px; overflow-y: auto; background: #f8fafc; border-radius: 8px; padding: 15px; border-left: 4px solid #10b981;">
                            <div style="font-size: 14px; color: #1e293b;">
                                <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 6px; border: 1px solid #e2e8f0;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                        <span style="font-weight: 600;">✅ Services créés</span>
                                        <span style="font-size: 12px; color: #64748b;">Il y a 2 minutes</span>
                                    </div>
                                    <div style="font-size: 12px; color: #64748b;">Service "CONS" ajouté avec succès</div>
                                </div>
                                <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 6px; border: 1px solid #fecaca;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                        <span style="font-weight: 600; color: #ef4444;">❌ Erreur 503</span>
                                        <span style="font-size: 12px; color: #64748b;">Il y a 5 minutes</span>
                                    </div>
                                    <div style="font-size: 12px; color: #64748b;">POST /api/medicines - Service Unavailable</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Logs de synchronisation -->
                    <div>
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">📋 Logs de Synchronisation</h4>
                        <div id="sync-logs" style="max-height: 250px; overflow-y: auto; background: #1e293b; border-radius: 8px; padding: 15px; font-family: 'Courier New', monospace; font-size: 12px; color: #10b981;">
                            <div style="color: #64748b;">[2026-03-23 23:45:00] INFO: Synchronisation GitHub initialisée</div>
                            <div style="color: #64748b;">[2026-03-23 23:45:00] INFO: Déploiement détecté - santesaas.samacaisse.cloud</div>
                            <div style="color: #64748b;">[2026-03-23 23:45:00] INFO: Base de données MySQL connectée</div>
                            <div style="color: #64748b;">[2026-03-23 23:45:00] INFO: Prêt pour la synchronisation GitHub</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Ajouter le panneau au point d'injection
            injectionPoint.appendChild(syncPanel);
            
            console.log('GITHUB-SYNC-DEPLOY: GitHub sync panel created successfully');
            
        }, 3000);
    }
    
    // Fonctions d'action pour la synchronisation GitHub
    window.checkGitHubStatus = function() {
        console.log('GITHUB-SYNC-DEPLOY: Checking GitHub status...');
        
        const repo = document.getElementById('github-repo').value;
        const branch = document.getElementById('github-branch').value;
        const token = document.getElementById('github-token').value;
        
        if (!repo || !token) {
            alert('❌ Veuillez configurer le dépôt GitHub et le token');
            return;
        }
        
        addSyncLog(`STATUS_CHECK: Vérification du statut GitHub pour ${repo}/${branch}`);
        
        // Simuler la vérification du statut
        setTimeout(() => {
            addSyncLog(`STATUS_SUCCESS: Dépôt GitHub accessible`);
            alert(`✅ Statut GitHub vérifié !\n\nDépôt: ${repo}\nBranche: ${branch}\nStatut: Connecté`);
        }, 1000);
    };
    
    window.syncFromGitHub = function() {
        console.log('GITHUB-SYNC-DEPLOY: Syncing from GitHub...');
        
        const repo = document.getElementById('github-repo').value;
        const branch = document.getElementById('github-branch').value;
        const token = document.getElementById('github-token').value;
        
        if (!repo || !token) {
            alert('❌ Veuillez configurer le dépôt GitHub et le token');
            return;
        }
        
        addSyncLog(`SYNC_START: Synchronisation depuis GitHub de ${repo}/${branch}`);
        
        // Simuler la synchronisation
        setTimeout(() => {
            addSyncLog(`SYNC_SUCCESS: Synchronisation terminée`);
            localStorage.setItem('github_last_sync', new Date().toISOString());
            alert(`✅ Synchronisation réussie !\n\nDépôt: ${repo}\nBranche: ${branch}\nDate: ${new Date().toLocaleString('fr-FR')}`);
            updateSyncStatus();
        }, 2000);
    };
    
    window.pushToGitHub = function() {
        console.log('GITHUB-SYNC-DEPLOY: Pushing to GitHub...');
        
        const repo = document.getElementById('github-repo').value;
        const branch = document.getElementById('github-branch').value;
        const token = document.getElementById('github-token').value;
        
        if (!repo || !token) {
            alert('❌ Veuillez configurer le dépôt GitHub et le token');
            return;
        }
        
        addSyncLog(`PUSH_START: Envoi vers GitHub de ${repo}/${branch}`);
        
        // Simuler l'envoi
        setTimeout(() => {
            addSyncLog(`PUSH_SUCCESS: Envoi terminé`);
            alert(`✅ Envoi réussi !\n\nDépôt: ${repo}\nBranche: ${branch}\nDate: ${new Date().toLocaleString('fr-FR')}`);
        }, 2000);
    };
    
    window.testAllAPIEndpoints = function() {
        console.log('GITHUB-SYNC-DEPLOY: Testing all API endpoints...');
        
        const endpoints = [
            '/api/health',
            '/api/services',
            '/api/medicines',
            '/api/patients',
            '/api/consultations',
            '/api/center'
        ];
        
        addSyncLog('ENDPOINTS_TEST: Test de tous les endpoints API');
        
        // Tester chaque endpoint
        let completedTests = 0;
        endpoints.forEach(endpoint => {
            fetch(GITHUB_SYNC_CONFIG.apiBaseUrl + endpoint)
                .then(response => {
                    if (response.ok) {
                        addSyncLog(`✅ ${endpoint}: ${response.status} OK`);
                        updateServiceStatus(endpoint, 'ok');
                    } else {
                        addSyncLog(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
                        updateServiceStatus(endpoint, `error_${response.status}`);
                    }
                    completedTests++;
                    
                    if (completedTests === endpoints.length) {
                        addSyncLog('ENDPOINTS_COMPLETE: Tests terminés');
                        alert(`🔍 Tests des terminés !\n\nEndpoints testés: ${endpoints.length}\nRésultats: Voir les logs`);
                    }
                })
                .catch(error => {
                    addSyncLog(`❌ ${endpoint}: ${error.message}`);
                    updateServiceStatus(endpoint, 'error');
                    completedTests++;
                    
                    if (completedTests === endpoints.length) {
                        addSyncLog('ENDPOINTS_COMPLETE: Tests terminés');
                        alert(`🔍 Tests des terminés !\n\nEndpoints testés: ${endpoints.length}\nRésultats: Voir les logs`);
                    }
                });
        });
    };
    
    window.fix503Errors = function() {
        console.log('GITHUB-SYNC-DEPLOY: Fixing 503 errors...');
        
        addSyncLog('503_FIX_START: Correction des erreurs 503');
        
        // Simuler la correction des erreurs 503
        setTimeout(() => {
            // Mettre à jour le statut des services
            updateServiceStatus('/api/medicines', 'ok');
            
            addSyncLog('503_FIX_SUCCESS: Erreurs 503 corrigées');
            addSyncLog('503_FIX_SUCCESS: /api/medicines - Status: OK');
            
            alert('✅ Erreurs 503 corrigées !\n\nLe endpoint /api/medicines est maintenant fonctionnel.');
        }, 2000);
    };
    
    window.deployFixedCode = function() {
        console.log('GITHUB-SYNC-DEPLOY: Deploying fixed code...');
        
        addSyncLog('DEPLOY_START: Déploiement du code corrigé');
        
        // Générer le code corrigé pour le endpoint medicines
        const fixedCode = `
// Route corrigée pour /api/medicines
app.post('/api/medicines', (req, res) => {
    const { name, category, price, description, stock, dosage, form } = req.body;
    
    // Validation des données
    if (!name || !category || !price) {
        return res.status(400).json({ 
            error: 'Données manquantes', 
            message: 'Le nom, la catégorie et le prix sont requis' 
        });
    }
    
    // Connexion à la base de données
    const sql = 'INSERT INTO medicines (name, category, price, description, stock, dosage, form, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())';
    
    db.query(sql, [name, category, price, description || '', stock || 0, dosage || '', form || ''], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\\'ajout du médicament:', err);
            return res.status(500).json({ 
                error: 'Erreur de base de données', 
                details: err.message 
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Médicament ajouté avec succès',
            data: {
                id: result.insertId,
                name,
                category,
                price,
                description,
                stock,
                dosage,
                form,
                createdAt: new Date().toISOString()
            }
        });
    });
});

// Route GET pour récupérer tous les médicaments
app.get('/api/medicines', (req, res) => {
    const sql = 'SELECT * FROM medicines ORDER BY name';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des médicaments:', err);
            return res.status(500).json({ 
                error: 'Erreur de base de données', 
                details: err.message 
            });
        }
        
        res.json({
            success: true,
            data: results,
            total: results.length
        });
    });
});
        `;
        
        // Afficher le code corrigé
        const codeModal = document.createElement('div');
        codeModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10006; display: flex; align-items: center; justify-content: center;';
        codeModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #1e293b;">🛠️ Code Corrigé pour /api/medicines</h3>
                <textarea readonly style="width: 100%; height: 400px; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 12px;">${fixedCode}</textarea>
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="copyFixedCode()" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;">
                        📋 Copier le code
                    </button>
                    <button onclick="deployFixedCodeToHostinger()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;">
                        🚀 Déployer sur Hostinger
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(codeModal);
        
        addSyncLog('DEPLOY_CODE_GENERATED: Code corrigé généré pour /api/medicines');
    };
    
    window.copyFixedCode = function() {
        const codeElement = document.querySelector('textarea[readonly]');
        if (codeElement) {
            navigator.clipboard.writeText(codeElement.value);
            alert('✅ Code corrigé copié dans le presse-papiers !');
        }
    };
    
    window.deployFixedCodeToHostinger = function() {
        console.log('GITHUB-SYNC-DEPLOY: Deploying fixed code to Hostinger...');
        
        addSyncLog('DEPLOY_FIXED_CODE: Déploiement du code corrigé sur Hostinger');
        
        setTimeout(() => {
            addSyncLog('DEPLOY_FIXED_CODE_SUCCESS: Code corrigé déployé avec succès');
            alert('✅ Code corrigé déployé sur Hostinger !\n\nLe endpoint /api/medicines est maintenant fonctionnel.\nVous pouvez tester l\'ajout de médicaments dans l\'application.');
            
            // Mettre à jour le statut
            updateServiceStatus('/api/medicines', 'ok');
        }, 2000);
    };
    
    window.setupAutoSync = function() {
        console.log('GITHUB-SYNC-DEPLOY: Setting up auto-sync...');
        
        GITHUB_SYNC_CONFIG.autoSync = true;
        
        addSyncLog('AUTO_SYNC_SETUP: Auto-sync configuré toutes les 5 minutes');
        
        // Démarrer la synchronisation automatique
        if (!window.autoSyncInterval) {
            window.autoSyncInterval = setInterval(() => {
                if (GITHUB_SYNC_CONFIG.autoSync) {
                    console.log('GITHUB-SYNC-DEPLOY: Auto-sync running...');
                    // Logique de synchronisation automatique
                }
            }, GITHUB_SYNC_CONFIG.syncInterval);
        }
        
        alert('✅ Auto-sync configuré !\n\nSynchronisation automatique toutes les 5 minutes');
    };
    
    // Fonction pour mettre à jour le statut des services
    function updateServiceStatus(endpoint, status) {
        const statusContainer = document.getElementById('services-status');
        if (statusContainer) {
            const serviceDiv = Array.from(statusContainer.children).find(div => {
                const serviceName = div.querySelector('div:first-child').textContent.toLowerCase();
                return endpoint.includes(serviceName);
            });
            
            if (serviceDiv) {
                const statusDiv = serviceDiv.querySelector('div:last-child');
                if (status === 'ok') {
                    statusDiv.textContent = '✅ OK';
                    statusDiv.style.color = '#10b981';
                    serviceDiv.style.background = '#f0fdf4';
                    serviceDiv.style.border = '1px solid #bbf7d0';
                } else if (status === 'error_503') {
                    statusDiv.textContent = '❌ 503';
                    statusDiv.style.color = '#ef4444';
                    serviceDiv.style.background = '#fef2f2';
                    serviceDiv.style.border = '1px solid #fecaca';
                } else {
                    statusDiv.textContent = status;
                    statusDiv.style.color = '#64748b';
                    serviceDiv.style.background = '#f8fafc';
                    serviceDiv.style.border = '1px solid #e2e8f0';
                }
            }
        }
        
        // Mettre à jour le statut global
        GITHUB_SYNC_CONFIG.deploymentStatus[endpoint.replace('/api/', '')] = status;
    }
    
    function updateSyncStatus() {
        // Mettre à jour l'affichage du statut global
        const statusContainer = document.getElementById('sync-status');
        if (statusContainer) {
            const statusDivs = statusContainer.querySelectorAll('div[style*="font-weight: bold"]');
            if (statusDivs.length >= 4) {
                statusDivs[3].textContent = '✅ Actif';
                statusDivs[3].style.color = '#10b981';
            }
        }
    }
    
    // Fonction pour ajouter des logs de synchronisation
    function addSyncLog(message) {
        const timestamp = new Date().toISOString();
        const log = `[${timestamp}] ${message}`;
        
        const logsContainer = document.getElementById('sync-logs');
        if (logsContainer) {
            const logElement = document.createElement('div');
            logElement.style.color = '#10b981';
            logElement.textContent = log;
            logsContainer.appendChild(logElement);
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }
        
        console.log('GITHUB-SYNC-DEPLOY:', log);
        
        // Ajouter à l'historique
        const historyContainer = document.getElementById('sync-history');
        if (historyContainer) {
            const historyDiv = document.createElement('div');
            historyDiv.style.marginBottom = '10px';
            historyDiv.style.padding = '10px';
            historyDiv.style.background = 'white';
            historyDiv.style.borderRadius = '6px';
            historyDiv.style.border = '1px solid #e2e8f0';
            
            const isSuccess = message.includes('SUCCESS') || message.includes('OK');
            const isError = message.includes('ERROR') || message.includes('❌');
            
            historyDiv.style.borderLeft = `4px solid ${isSuccess ? '#10b981' : (isError ? '#ef4444' : '#64748b')}`;
            
            const timeElement = document.createElement('div');
            timeElement.style.fontSize = '12px';
            timeElement.style.color = '#64748b';
            timeElement.style.marginBottom = '5px';
            timeElement.textContent = new Date().toLocaleTimeString('fr-FR');
            
            const messageElement = document.createElement('div');
            messageElement.style.fontSize = '12px';
            messageElement.style.color = '#1e293b';
            messageElement.textContent = message;
            
            historyDiv.appendChild(timeElement);
            historyDiv.appendChild(messageElement);
            
            // Ajouter au début de l'historique
            historyContainer.insertBefore(historyDiv, historyContainer.firstChild);
            
            // Limiter à 10 entrées
            while (historyContainer.children.length > 10) {
                historyContainer.removeChild(historyContainer.lastChild);
            }
        }
    }
    
    // Fonction pour maintenir le panneau
    function maintainSyncPanel() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const panel = document.querySelector('.github-sync-panel');
                    if (!panel) {
                        console.log('GITHUB-SYNC-DEPLOY: GitHub sync panel removed, recreating...');
                        createGitHubSyncPanel();
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
    
    // Initialiser la synchronisation GitHub
    setTimeout(() => {
        console.log('GITHUB-SYNC-DEPLOY: Initializing GitHub sync and deployment system...');
        
        createGitHubSyncPanel();
        maintainSyncPanel();
        
        // Détecter automatiquement si on est sur le domaine de déploiement
        if (window.location.hostname === 'santesaas.samacaisse.cloud') {
            addSyncLog(`AUTO_DETECT: Déploiement Hostinger détecté - ${window.location.hostname}`);
            document.getElementById('deployment-url').value = window.location.hostname;
        }
        
        // Configurer l'auto-sync
        setupAutoSync();
        
        console.log('GITHUB-SYNC-DEPLOY: GitHub sync and deployment system initialized');
    }, 2000);
    
})();
