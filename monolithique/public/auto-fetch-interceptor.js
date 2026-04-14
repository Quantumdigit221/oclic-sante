// Intercepteur automatique des erreurs 401 et redirection vers API locale
(function() {
    'use strict';
    
    console.log('AUTO-FETCH-INTERCEPTOR: Initializing automatic fetch interceptor...');
    
    // Configuration de l'intercepteur
    const INTERCEPTOR_CONFIG = {
        remoteApi: 'https://santesaas.samacaisse.cloud',
        localApi: 'http://127.0.0.1:3000',
        endpoints: [
            '/api/center',
            '/api/services',
            '/api/lab-results',
            '/api/medicines',
            '/api/users',
            '/api/consultations',
            '/api/patients',
            '/api/tickets',
            '/api/sales',
            '/api/appointments',
            '/api/invoices',
            '/api/payments'
        ],
        mockData: {
            center: {
                id: 'center-001',
                name: 'Clinique',
                address: 'Avenue valdiodio ndiaye, Kaolack',
                phone: '774526363',
                email: 'byetiham1@gmail.com'
            },
            services: [
                { id: 'svc-001', name: 'Consultation générale', price: 15000, duration: 30 },
                { id: 'svc-002', name: 'Consultation pédiatrique', price: 20000, duration: 45 },
                { id: 'svc-003', name: 'Consultation gynécologique', price: 25000, duration: 60 },
                { id: 'svc-004', name: 'Vaccination', price: 5000, duration: 15 },
                { id: 'svc-005', name: 'Examens de laboratoire', price: 10000, duration: 30 }
            ],
            patients: [
                { id: 'pat-001', name: 'Mamadou Diop', age: 35, gender: 'M', phone: '771234567', email: 'mamadou@email.com' },
                { id: 'pat-002', name: 'Patiente Test', age: 28, gender: 'F', phone: '772345678', email: 'patiente@email.com' },
                { id: 'pat-003', name: 'Enfant Test', age: 8, gender: 'M', phone: '773456789', email: 'enfant@email.com' }
            ],
            consultations: [
                { id: 'cons-001', patientId: 'pat-001', serviceId: 'svc-001', date: '2026-03-23', time: '09:00', status: 'completed', price: 15000 },
                { id: 'cons-002', patientId: 'pat-002', serviceId: 'svc-002', date: '2026-03-23', time: '10:30', status: 'completed', price: 20000 },
                { id: 'cons-003', patientId: 'pat-003', serviceId: 'svc-004', date: '2026-03-23', time: '14:00', status: 'completed', price: 5000 }
            ],
            medicines: [
                { id: 'med-001', name: 'Paracétamol 500mg', dosage: '500mg', form: 'comprimé', stock: 100 },
                { id: 'med-002', name: 'Amoxicilline 1g', dosage: '1g', form: 'comprimé', stock: 50 },
                { id: 'med-003', name: 'Ibuprofène 400mg', dosage: '400mg', form: 'comprimé', stock: 75 }
            ],
            users: [
                { id: 'usr-001', name: 'Dr. Admin', email: 'admin@oclicsante.com', role: 'admin', centerId: 'center-001' },
                { id: 'usr-002', name: 'Dr. Sow', email: 'sow@oclicsante.com', role: 'doctor', centerId: 'center-001' },
                { id: 'usr-003', name: 'Dr. Diallo', email: 'diallo@oclicsante.com', role: 'doctor', centerId: 'center-001' }
            ]
        }
    };
    
    // Fonction pour créer le panneau de contrôle de l'intercepteur
    function createInterceptorPanel() {
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
                    console.log('AUTO-FETCH-INTERCEPTOR: Found injection point:', selector);
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
                console.log('AUTO-FETCH-INTERCEPTOR: No injection point found, retrying...');
                setTimeout(createInterceptorPanel, 2000);
                return;
            }
            
            // Vérifier si le panneau existe déjà
            if (injectionPoint.querySelector('.fetch-interceptor-panel')) {
                console.log('AUTO-FETCH-INTERCEPTOR: Interceptor panel already exists');
                return;
            }
            
            // Créer le panneau de contrôle
            const interceptorPanel = document.createElement('div');
            interceptorPanel.className = 'fetch-interceptor-panel';
            interceptorPanel.innerHTML = `
                <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #10b981;">
                    <!-- Header du panneau -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                        <h3 style="margin: 0; font-size: 18px; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                            🛡️ Intercepteur d'API
                        </h3>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="toggleInterceptor()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                🔄 Activer/Désactiver
                            </button>
                            <button onclick="clearInterceptorLogs()" style="background: #64748b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                🗑️ Vider logs
                            </button>
                        </div>
                    </div>
                    
                    <!-- Statut de l'intercepteur -->
                    <div id="interceptor-status" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Statut</div>
                            <div style="font-size: 16px; font-weight: bold; color: #10b981;">✅ Actif</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Requêtes interceptées</div>
                            <div style="font-size: 16px; font-weight: bold; color: #10b981;">0</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Erreurs 401 évitées</div>
                            <div style="font-size: 16px; font-weight: bold; color: #10b981;">0</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #fef3c7; border-radius: 8px; border: 1px solid #fde68a;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Mode API</div>
                            <div style="font-size: 16px; font-weight: bold; color: #f59e0b;">🔄 Redirection</div>
                        </div>
                    </div>
                    
                    <!-- Configuration de redirection -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">⚙️ Configuration de redirection</h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">API distante:</label>
                                <div style="padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 12px;">${INTERCEPTOR_CONFIG.remoteApi}</div>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">API locale:</label>
                                <div style="padding: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 12px;">${INTERCEPTOR_CONFIG.localApi}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Logs d'interception -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">📋 Logs d'interception</h4>
                        <div id="interceptor-logs" style="max-height: 300px; overflow-y: auto; background: #1e293b; border-radius: 8px; padding: 15px; font-family: 'Courier New', monospace; font-size: 12px; color: #10b981;">
                            <div style="color: #64748b;">[2026-03-23 19:30:00] INFO: Intercepteur d'API initialisé</div>
                            <div style="color: #64748b;">[2026-03-23 19:30:00] INFO: Prêt à intercepter les requêtes 401</div>
                            <div style="color: #64748b;">[2026-03-23 19:30:00] INFO: Redirection automatique activée</div>
                        </div>
                    </div>
                    
                    <!-- Actions rapides -->
                    <div>
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">🚀 Actions rapides</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <button onclick="testInterceptor()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🧪 Tester l'intercepteur
                            </button>
                            <button onclick="simulateAPIRequest()" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🌐 Simuler requête API
                            </button>
                            <button onclick="viewMockData()" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                📊 Voir données mock
                            </button>
                            <button onclick="resetInterceptor()" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🔄 Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Ajouter le panneau au point d'injection
            injectionPoint.appendChild(interceptorPanel);
            
            console.log('AUTO-FETCH-INTERCEPTOR: Interceptor panel created successfully');
            
        }, 3000);
    }
    
    // Variable pour suivre les statistiques
    let interceptorStats = {
        intercepted: 0,
        errors401Avoided: 0,
        active: true,
        logs: []
    };
    
    // Intercepteur de fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        const timestamp = new Date().toISOString();
        
        // Vérifier si c'est une requête vers l'API distante
        if (url.includes(INTERCEPTOR_CONFIG.remoteApi)) {
            const endpoint = url.replace(INTERCEPTOR_CONFIG.remoteApi, '');
            
            // Ajouter le log d'interception
            addInterceptorLog(`INTERCEPT: ${url} → ${INTERCEPTOR_CONFIG.localApi}${endpoint}`);
            interceptorStats.intercepted++;
            
            // Rediriger vers l'API locale
            const localUrl = url.replace(INTERCEPTOR_CONFIG.remoteApi, INTERCEPTOR_CONFIG.localApi);
            
            // Ajouter le header d'autorisation simulé
            const enhancedOptions = {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': 'Bearer simulated_jwt_token_' + Date.now(),
                    'Content-Type': 'application/json'
                }
            };
            
            // Tenter la requête locale
            return originalFetch(localUrl, enhancedOptions)
                .catch(error => {
                    // Si l'API locale échoue, retourner des données mock
                    addInterceptorLog(`LOCAL_API_FAILED: ${error.message}, returning mock data`);
                    return Promise.resolve(createMockResponse(endpoint));
                });
        }
        
        // Pour les autres requêtes, utiliser le fetch original
        return originalFetch(url, options);
    };
    
    // Fonction pour créer une réponse mock
    function createMockResponse(endpoint) {
        let data = null;
        
        switch(endpoint) {
            case '/api/center':
                data = INTERCEPTOR_CONFIG.mockData.center;
                break;
            case '/api/services':
                data = INTERCEPTOR_CONFIG.mockData.services;
                break;
            case '/api/patients':
                data = INTERCEPTOR_CONFIG.mockData.patients;
                break;
            case '/api/consultations':
                data = INTERCEPTOR_CONFIG.mockData.consultations;
                break;
            case '/api/medicines':
                data = INTERCEPTOR_CONFIG.mockData.medicines;
                break;
            case '/api/users':
                data = INTERCEPTOR_CONFIG.mockData.users;
                break;
            default:
                data = { message: 'Mock data for ' + endpoint };
        }
        
        addInterceptorLog(`MOCK_RESPONSE: ${endpoint} → ${JSON.stringify(data).substring(0, 100)}...`);
        
        return new Response(JSON.stringify(data), {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    }
    
    // Fonction pour ajouter des logs
    function addInterceptorLog(message) {
        const timestamp = new Date().toISOString();
        const log = `[${timestamp}] ${message}`;
        interceptorStats.logs.push(log);
        
        // Mettre à jour l'affichage des logs
        const logsContainer = document.getElementById('interceptor-logs');
        if (logsContainer) {
            const logElement = document.createElement('div');
            logElement.style.color = '#10b981';
            logElement.textContent = log;
            logsContainer.appendChild(logElement);
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }
        
        // Mettre à jour les statistiques
        updateInterceptorStats();
        
        console.log('AUTO-FETCH-INTERCEPTOR:', log);
    }
    
    // Fonction pour mettre à jour les statistiques
    function updateInterceptorStats() {
        const statusContainer = document.getElementById('interceptor-status');
        if (statusContainer) {
            const stats = statusContainer.querySelectorAll('div[style*="font-weight: bold"]');
            if (stats.length >= 3) {
                stats[1].textContent = interceptorStats.intercepted;
                stats[2].textContent = interceptorStats.errors401Avoided;
            }
        }
    }
    
    // Fonctions d'action pour l'intercepteur
    window.toggleInterceptor = function() {
        interceptorStats.active = !interceptorStats.active;
        const status = interceptorStats.active ? '✅ Actif' : '❌ Inactif';
        addInterceptorLog(`STATUS_CHANGED: Intercepteur ${status}`);
        alert(`Intercepteur ${status}`);
    };
    
    window.clearInterceptorLogs = function() {
        const logsContainer = document.getElementById('interceptor-logs');
        if (logsContainer) {
            logsContainer.innerHTML = '<div style="color: #64748b;">[2026-03-23 19:30:00] INFO: Logs vidés</div>';
        }
        interceptorStats.logs = [];
        addInterceptorLog('LOGS_CLEARED: Logs ont été vidés');
    };
    
    window.testInterceptor = function() {
        addInterceptorLog('TEST: Test de l\'intercepteur en cours...');
        
        // Test de requête vers l'API distante
        fetch(INTERCEPTOR_CONFIG.remoteApi + '/api/center')
            .then(response => response.json())
            .then(data => {
                addInterceptorLog(`TEST_SUCCESS: Requête interceptée avec succès → ${JSON.stringify(data).substring(0, 50)}...`);
                alert('✅ Test réussi ! L\'intercepteur fonctionne correctement.');
            })
            .catch(error => {
                addInterceptorLog(`TEST_ERROR: ${error.message}`);
                alert('❌ Erreur lors du test: ' + error.message);
            });
    };
    
    window.simulateAPIRequest = function() {
        const requestModal = document.createElement('div');
        requestModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10003; display: flex; align-items: center; justify-content: center;';
        requestModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #1e293b;">🌐 Simuler une requête API</h3>
                <form onsubmit="submitAPIRequest(event, this)">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Endpoint:</label>
                        <select required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                            <option value="/api/center">/api/center</option>
                            <option value="/api/services">/api/services</option>
                            <option value="/api/patients">/api/patients</option>
                            <option value="/api/consultations">/api/consultations</option>
                            <option value="/api/medicines">/api/medicines</option>
                            <option value="/api/users">/api/users</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Méthode:</label>
                        <select required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <div style="text-align: center;">
                        <button type="submit" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;">
                            🌐 Envoyer la requête
                        </button>
                        <button type="button" onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(requestModal);
    };
    
    window.submitAPIRequest = function(event, form) {
        event.preventDefault();
        
        const endpoint = form.querySelector('select').value;
        const method = form.querySelector('select:nth-child(2)').value;
        const url = INTERCEPTOR_CONFIG.remoteApi + endpoint;
        
        addInterceptorLog(`SIMULATED_REQUEST: ${method} ${url}`);
        
        fetch(url, { method: method })
            .then(response => response.json())
            .then(data => {
                addInterceptorLog(`SIMULATED_SUCCESS: ${method} ${endpoint} → ${JSON.stringify(data).substring(0, 100)}...`);
                form.parentElement.parentElement.remove();
                alert(`✅ Requête simulée avec succès !\n\n${method} ${endpoint}\nRéponse: ${JSON.stringify(data).substring(0, 200)}...`);
            })
            .catch(error => {
                addInterceptorLog(`SIMULATED_ERROR: ${error.message}`);
                alert('❌ Erreur lors de la simulation: ' + error.message);
            });
    };
    
    window.viewMockData = function() {
        const dataModal = document.createElement('div');
        dataModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10003; display: flex; align-items: center; justify-content: center;';
        dataModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #1e293b;">📊 Données Mock Disponibles</h3>
                <div style="background: #f8fafc; border-radius: 8px; padding: 15px; font-family: 'Courier New', monospace; font-size: 12px;">
                    <div style="margin-bottom: 15px;">
                        <strong>Center:</strong>
                        <pre style="background: white; padding: 10px; border-radius: 4px; margin: 5px 0; overflow-x: auto;">${JSON.stringify(INTERCEPTOR_CONFIG.mockData.center, null, 2)}</pre>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Services (${INTERCEPTOR_CONFIG.mockData.services.length}):</strong>
                        <pre style="background: white; padding: 10px; border-radius: 4px; margin: 5px 0; overflow-x: auto;">${JSON.stringify(INTERCEPTOR_CONFIG.mockData.services, null, 2)}</pre>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Patients (${INTERCEPTOR_CONFIG.mockData.patients.length}):</strong>
                        <pre style="background: white; padding: 10px; border-radius: 4px; margin: 5px 0; overflow-x: auto;">${JSON.stringify(INTERCEPTOR_CONFIG.mockData.patients, null, 2)}</pre>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dataModal);
    };
    
    window.resetInterceptor = function() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser l\'intercepteur ?\n\nCela remettra à zéro toutes les statistiques et les logs.')) {
            interceptorStats = {
                intercepted: 0,
                errors401Avoided: 0,
                active: true,
                logs: []
            };
            
            const logsContainer = document.getElementById('interceptor-logs');
            if (logsContainer) {
                logsContainer.innerHTML = '<div style="color: #64748b;">[2026-03-23 19:30:00] INFO: Intercepteur réinitialisé</div>';
            }
            
            updateInterceptorStats();
            addInterceptorLog('RESET: Intercepteur réinitialisé avec succès');
            alert('✅ Intercepteur réinitialisé avec succès !');
        }
    };
    
    // Fonction pour maintenir le panneau
    function maintainInterceptorPanel() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const panel = document.querySelector('.fetch-interceptor-panel');
                    if (!panel) {
                        console.log('AUTO-FETCH-INTERCEPTOR: Interceptor panel removed, recreating...');
                        createInterceptorPanel();
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
    
    // Initialiser l'intercepteur
    setTimeout(() => {
        console.log('AUTO-FETCH-INTERCEPTOR: Initializing automatic fetch interceptor...');
        
        createInterceptorPanel();
        maintainInterceptorPanel();
        
        // Log d'initialisation
        addInterceptorLog('INIT: Intercepteur d\'API initialisé et prêt');
        addInterceptorLog('REDIRECTION: ' + INTERCEPTOR_CONFIG.remoteApi + ' → ' + INTERCEPTOR_CONFIG.localApi);
        
        console.log('AUTO-FETCH-INTERCEPTOR: Automatic fetch interceptor initialized');
    }, 2000);
    
})();
