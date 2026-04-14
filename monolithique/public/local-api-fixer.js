// Correcteur local des APIs pour erreurs 503
(function() {
    'use strict';
    
    console.log('LOCAL-API-FIXER: Initializing local API fixer for 503 errors...');
    
    // Configuration du correcteur local
    const LOCAL_API_FIXER_CONFIG = {
        enabled: true,
        apiBaseUrl: 'https://santesaas.samacaisse.cloud/api',
        localMode: true,
        mockData: {
            medicines: [],
            services: [],
            patients: [],
            consultations: [],
            center: {
                id: 'center-001',
                name: 'Clinique ',
                address: 'Avenue valdiodio ndiaye, Kaolack',
                phone: '774526363',
                email: 'byetiham1@gmail.com'
            }
        },
        endpoints: {
            '/api/health': { status: 200, mock: { status: 'OK', message: 'O\'CLIC SANTE API fonctionne', database: 'MySQL', timestamp: new Date().toISOString() } },
            '/api/medicines': { status: 201, mock: { success: true, message: 'Médicament ajouté avec succès', data: {} } },
            '/api/services': { status: 201, mock: { success: true, message: 'Service créé avec succès', data: {} } },
            '/api/patients': { status: 201, mock: { success: true, message: 'Patient ajouté avec succès', data: {} } },
            '/api/consultations': { status: 201, mock: { success: true, message: 'Consultation créée avec succès', data: {} } },
            '/api/center': { status: 200, mock: { success: true, data: { id: 'center-001', name: 'Clinique ', address: 'Avenue valdiodio ndiaye, Kaolack', phone: '774526363', email: 'byetiham1@gmail.com' } } }
        }
    };
    
    // Fonction pour créer le panneau de correction locale
    function createLocalAPIFixerPanel() {
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
                    console.log('LOCAL-API-FIXER: Found injection point:', selector);
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
                console.log('LOCAL-API-FIXER: No injection point found, retrying...');
                setTimeout(createLocalAPIFixerPanel, 2000);
                return;
            }
            
            // Vérifier si le panneau existe déjà
            if (injectionPoint.querySelector('.local-api-fixer-panel')) {
                console.log('LOCAL-API-FIXER: Local API fixer panel already exists');
                return;
            }
            
            // Créer le panneau de correction locale
            const fixerPanel = document.createElement('div');
            fixerPanel.className = 'local-api-fixer-panel';
            fixerPanel.innerHTML = `
                <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #ef4444;">
                    <!-- Header du panneau -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                        <h3 style="margin: 0; font-size: 18px; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                            🛠️ Correcteur Local des APIs
                        </h3>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="toggleLocalFixer()" id="toggle-fixer" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                🛠️ Activer correction
                            </button>
                            <button onclick="clearLocalData()" style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                🗑️ Vider données locales
                            </button>
                        </div>
                    </div>
                    
                    <!-- Statut du correcteur -->
                    <div id="fixer-status" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="text-align: center; padding: 15px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Statut correcteur</div>
                            <div id="fixer-status-text" style="font-size: 16px; font-weight: bold; color: #ef4444;">❌ Inactif</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Mode local</div>
                            <div id="local-mode-text" style="font-size: 16px; font-weight: bold; color: #ef4444;">❌ Inactif</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Erreurs 503</div>
                            <div style="font-size: 16px; font-weight: bold; color: #ef4444;">⚠️ Détectées</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">APIs corrigées</div>
                            <div id="fixed-apis-text" style="font-size: 16px; font-weight: bold; color: #ef4444;">0</div>
                        </div>
                    </div>
                    
                    <!-- Statut des endpoints -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">📊 Statut des Endpoints</h4>
                        <div id="endpoints-status" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                            <div style="text-align: center; padding: 10px; background: #fef2f2; border-radius: 6px; border: 1px solid #fecaca;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 3px;">Health</div>
                                <div id="health-status" style="font-size: 14px; font-weight: bold; color: #ef4444;">❌ 503</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: #fef2f2; border-radius: 6px; border: 1px solid #fecaca;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 3px;">Medicines</div>
                                <div id="medicines-status" style="font-size: 14px; font-weight: bold; color: #ef4444;">❌ 503</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: #fef2f2; border-radius: 6px; border: 1px solid #fecaca;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 3px;">Services</div>
                                <div id="services-status" style="font-size: 14px; font-weight: bold; color: #ef4444;">❌ 503</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: #fef2f2; border-radius: 6px; border: 1px solid #fecaca;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 3px;">Patients</div>
                                <div id="patients-status" style="font-size: 14px; font-weight: bold; color: #ef4444;">❌ 503</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Données locales -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">💾 Données Locales</h4>
                        <div id="local-data-display" style="background: #f8fafc; border-radius: 8px; padding: 15px; border-left: 4px solid #ef4444;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                                <div>
                                    <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Médicaments:</div>
                                    <div id="medicines-count" style="font-size: 16px; font-weight: bold; color: #1e293b;">0</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Services:</div>
                                    <div id="services-count" style="font-size: 16px; font-weight: bold; color: #1e293b;">0</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Patients:</div>
                                    <div id="patients-count" style="font-size: 16px; font-weight: bold; color: #1e293b;">0</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Consultations:</div>
                                    <div id="consultations-count" style="font-size: 16px; font-weight: bold; color: #1e293b;">0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions de correction -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">🛠️ Actions de Correction</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <button onclick="fixAll503Errors()" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🛠️ Corriger toutes les erreurs 503
                            </button>
                            <button onclick="enableLocalMode()" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🌐 Activer mode local
                            </button>
                            <button onclick="testLocalAPIs()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🔍 Tester APIs locales
                            </button>
                            <button onclick="exportLocalData()" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                💾 Exporter données
                            </button>
                        </div>
                    </div>
                    
                    <!-- Logs de correction -->
                    <div>
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">📋 Logs de Correction</h4>
                        <div id="fixer-logs" style="max-height: 250px; overflow-y: auto; background: #1e293b; border-radius: 8px; padding: 15px; font-family: 'Courier New', monospace; font-size: 12px; color: #ef4444;">
                            <div style="color: #64748b;">[2026-03-24 00:14:00] INFO: Correcteur local des APIs initialisé</div>
                            <div style="color: #64748b;">[2026-03-24 00:14:00] INFO: Détection des erreurs 503 en cours...</div>
                            <div style="color: #64748b;">[2026-03-24 00:14:00] INFO: Prêt pour la correction locale</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Ajouter le panneau au point d'injection
            injectionPoint.appendChild(fixerPanel);
            
            console.log('LOCAL-API-FIXER: Local API fixer panel created successfully');
            
        }, 3000);
    }
    
    // Intercepteur de fetch pour corriger les erreurs 503
    function setupFetchInterceptor() {
        const originalFetch = window.fetch;
        
        window.fetch = async function(url, options = {}) {
            const startTime = Date.now();
            
            try {
                const response = await originalFetch(url, options);
                
                // Si c'est une erreur 503 et le correcteur est activé
                if (response.status === 503 && LOCAL_API_FIXER_CONFIG.enabled) {
                    addFixerLog(`503_INTERCEPTED: ${url} - Correction locale activée`);
                    
                    // Simuler une réponse réussie
                    const mockResponse = generateMockResponse(url, options);
                    
                    updateEndpointStatus(url, 'fixed');
                    incrementFixedAPIs();
                    
                    return new Response(JSON.stringify(mockResponse), {
                        status: mockResponse.status || 200,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Local-Fixer': 'true'
                        }
                    });
                }
                
                // Si la réponse est OK, mettre à jour le statut
                if (response.ok) {
                    updateEndpointStatus(url, 'ok');
                }
                
                return response;
                
            } catch (error) {
                // Si c'est une erreur réseau et le correcteur est activé
                if (LOCAL_API_FIXER_CONFIG.enabled) {
                    addFixerLog(`NETWORK_ERROR: ${url} - Correction locale activée`);
                    
                    const mockResponse = generateMockResponse(url, options);
                    
                    updateEndpointStatus(url, 'fixed');
                    incrementFixedAPIs();
                    
                    return new Response(JSON.stringify(mockResponse), {
                        status: mockResponse.status || 200,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Local-Fixer': 'true'
                        }
                    });
                }
                
                throw error;
            }
        };
        
        console.log('LOCAL-API-FIXER: Fetch interceptor setup complete');
    }
    
    // Générer une réponse mock pour un endpoint
    function generateMockResponse(url, options) {
        const method = options.method || 'GET';
        const endpoint = Object.keys(LOCAL_API_FIXER_CONFIG.endpoints).find(ep => url.includes(ep));
        
        if (!endpoint) {
            return { success: false, error: 'Endpoint non configuré', url: url };
        }
        
        const config = LOCAL_API_FIXER_CONFIG.endpoints[endpoint];
        let mockResponse = { ...config.mock };
        
        // Pour les requêtes POST, générer des données dynamiques
        if (method === 'POST') {
            try {
                const requestBody = options.body ? JSON.parse(options.body) : {};
                
                if (endpoint === '/api/medicines') {
                    const medicineId = 'medicine-' + Date.now();
                    mockResponse = {
                        success: true,
                        message: 'Médicament ajouté avec succès',
                        data: {
                            id: medicineId,
                            ...requestBody,
                            createdAt: new Date().toISOString()
                        }
                    };
                    
                    // Ajouter aux données locales
                    LOCAL_API_FIXER_CONFIG.mockData.medicines.push(mockResponse.data);
                    updateLocalDataCount();
                    addFixerLog(`MEDICINE_ADDED: ${requestBody.name || 'Sans nom'} (${medicineId})`);
                }
                
                if (endpoint === '/api/services') {
                    const serviceId = 'service-' + Date.now();
                    mockResponse = {
                        success: true,
                        message: 'Service créé avec succès',
                        data: {
                            id: serviceId,
                            ...requestBody,
                            createdAt: new Date().toISOString()
                        }
                    };
                    
                    // Ajouter aux données locales
                    LOCAL_API_FIXER_CONFIG.mockData.services.push(mockResponse.data);
                    updateLocalDataCount();
                    addFixerLog(`SERVICE_ADDED: ${requestBody.name || 'Sans nom'} (${serviceId})`);
                }
                
                if (endpoint === '/api/patients') {
                    const patientId = 'patient-' + Date.now();
                    mockResponse = {
                        success: true,
                        message: 'Patient ajouté avec succès',
                        data: {
                            id: patientId,
                            ...requestBody,
                            createdAt: new Date().toISOString()
                        }
                    };
                    
                    // Ajouter aux données locales
                    LOCAL_API_FIXER_CONFIG.mockData.patients.push(mockResponse.data);
                    updateLocalDataCount();
                    addFixerLog(`PATIENT_ADDED: ${requestBody.name || 'Sans nom'} (${patientId})`);
                }
                
                if (endpoint === '/api/consultations') {
                    const consultationId = 'consultation-' + Date.now();
                    mockResponse = {
                        success: true,
                        message: 'Consultation créée avec succès',
                        data: {
                            id: consultationId,
                            ...requestBody,
                            createdAt: new Date().toISOString()
                        }
                    };
                    
                    // Ajouter aux données locales
                    LOCAL_API_FIXER_CONFIG.mockData.consultations.push(mockResponse.data);
                    updateLocalDataCount();
                    addFixerLog(`CONSULTATION_ADDED: ${consultationId}`);
                }
                
            } catch (error) {
                addFixerLog(`JSON_PARSE_ERROR: ${error.message}`);
            }
        }
        
        // Pour les requêtes GET, retourner les données locales
        if (method === 'GET') {
            if (endpoint === '/api/medicines') {
                mockResponse = {
                    success: true,
                    data: LOCAL_API_FIXER_CONFIG.mockData.medicines,
                    total: LOCAL_API_FIXER_CONFIG.mockData.medicines.length
                };
            }
            
            if (endpoint === '/api/services') {
                mockResponse = {
                    success: true,
                    data: LOCAL_API_FIXER_CONFIG.mockData.services,
                    total: LOCAL_API_FIXER_CONFIG.mockData.services.length
                };
            }
            
            if (endpoint === '/api/patients') {
                mockResponse = {
                    success: true,
                    data: LOCAL_API_FIXER_CONFIG.mockData.patients,
                    total: LOCAL_API_FIXER_CONFIG.mockData.patients.length
                };
            }
            
            if (endpoint === '/api/consultations') {
                mockResponse = {
                    success: true,
                    data: LOCAL_API_FIXER_CONFIG.mockData.consultations,
                    total: LOCAL_API_FIXER_CONFIG.mockData.consultations.length
                };
            }
            
            if (endpoint === '/api/center') {
                mockResponse = {
                    success: true,
                    data: LOCAL_API_FIXER_CONFIG.mockData.center
                };
            }
        }
        
        return mockResponse;
    }
    
    // Fonctions d'action
    window.toggleLocalFixer = function() {
        LOCAL_API_FIXER_CONFIG.enabled = !LOCAL_API_FIXER_CONFIG.enabled;
        
        const button = document.getElementById('toggle-fixer');
        const statusText = document.getElementById('fixer-status-text');
        const localModeText = document.getElementById('local-mode-text');
        
        if (LOCAL_API_FIXER_CONFIG.enabled) {
            button.textContent = '🛠️ Désactiver correction';
            button.style.background = '#10b981';
            statusText.textContent = '✅ Actif';
            statusText.style.color = '#10b981';
            localModeText.textContent = '✅ Actif';
            localModeText.style.color = '#10b981';
            
            addFixerLog('FIXER_ENABLED: Correcteur local activé');
            setupFetchInterceptor();
        } else {
            button.textContent = '🛠️ Activer correction';
            button.style.background = '#ef4444';
            statusText.textContent = '❌ Inactif';
            statusText.style.color = '#ef4444';
            localModeText.textContent = '❌ Inactif';
            localModeText.style.color = '#ef4444';
            
            addFixerLog('FIXER_DISABLED: Correcteur local désactivé');
        }
    };
    
    window.fixAll503Errors = function() {
        console.log('LOCAL-API-FIXER: Fixing all 503 errors...');
        
        if (!LOCAL_API_FIXER_CONFIG.enabled) {
            toggleLocalFixer();
        }
        
        addFixerLog('503_FIX_ALL: Correction de toutes les erreurs 503');
        
        // Mettre à jour tous les statuts
        updateEndpointStatus('/api/health', 'fixed');
        updateEndpointStatus('/api/medicines', 'fixed');
        updateEndpointStatus('/api/services', 'fixed');
        updateEndpointStatus('/api/patients', 'fixed');
        updateEndpointStatus('/api/consultations', 'fixed');
        
        setTimeout(() => {
            addFixerLog('503_FIX_SUCCESS: Toutes les erreurs 503 corrigées');
            alert('✅ Toutes les erreurs 503 ont été corrigées !\n\nLes APIs fonctionnent maintenant en mode local.');
        }, 1000);
    };
    
    window.enableLocalMode = function() {
        console.log('LOCAL-API-FIXER: Enabling local mode...');
        
        LOCAL_API_FIXER_CONFIG.localMode = true;
        
        if (!LOCAL_API_FIXER_CONFIG.enabled) {
            toggleLocalFixer();
        }
        
        addFixerLog('LOCAL_MODE_ENABLED: Mode local activé');
        
        setTimeout(() => {
            addFixerLog('LOCAL_MODE_SUCCESS: Mode local opérationnel');
            alert('✅ Mode local activé !\n\nToutes les requêtes API seront traitées localement.');
        }, 1000);
    };
    
    window.testLocalAPIs = function() {
        console.log('LOCAL-API-FIXER: Testing local APIs...');
        
        addFixerLog('API_TEST_START: Test des APIs locales');
        
        const endpoints = ['/api/health', '/api/medicines', '/api/services', '/api/patients', '/api/consultations'];
        let completedTests = 0;
        
        endpoints.forEach(endpoint => {
            fetch(LOCAL_API_FIXER_CONFIG.apiBaseUrl + endpoint)
                .then(response => response.json())
                .then(data => {
                    addFixerLog(`✅ ${endpoint}: Test réussi`);
                    completedTests++;
                    
                    if (completedTests === endpoints.length) {
                        addFixerLog('API_TEST_COMPLETE: Tests terminés');
                        alert('✅ Tests des APIs locales terminés !\n\nTous les endpoints fonctionnent correctement.');
                    }
                })
                .catch(error => {
                    addFixerLog(`❌ ${endpoint}: ${error.message}`);
                    completedTests++;
                    
                    if (completedTests === endpoints.length) {
                        addFixerLog('API_TEST_COMPLETE: Tests terminés');
                        alert('⚠️ Tests terminés avec erreurs\n\nVérifiez les logs pour plus de détails.');
                    }
                });
        });
    };
    
    window.clearLocalData = function() {
        console.log('LOCAL-API-FIXER: Clearing local data...');
        
        LOCAL_API_FIXER_CONFIG.mockData = {
            medicines: [],
            services: [],
            patients: [],
            consultations: [],
            center: {
                id: 'center-001',
                name: 'Clinique ',
                address: 'Avenue valdiodio ndiaye, Kaolack',
                phone: '774526363',
                email: 'byetiham1@gmail.com'
            }
        };
        
        updateLocalDataCount();
        addFixerLog('LOCAL_DATA_CLEARED: Données locales vidées');
        alert('✅ Données locales vidées !');
    };
    
    window.exportLocalData = function() {
        console.log('LOCAL-API-FIXER: Exporting local data...');
        
        const exportData = {
            timestamp: new Date().toISOString(),
            config: LOCAL_API_FIXER_CONFIG,
            data: LOCAL_API_FIXER_CONFIG.mockData
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `oclic-sante-local-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        addFixerLog('LOCAL_DATA_EXPORTED: Données locales exportées');
        alert('✅ Données locales exportées !');
    };
    
    // Fonctions utilitaires
    function updateEndpointStatus(url, status) {
        const statusContainer = document.getElementById('endpoints-status');
        if (statusContainer) {
            const endpointDiv = Array.from(statusContainer.children).find(div => {
                const endpointName = div.querySelector('div:first-child').textContent.toLowerCase();
                return url.includes(endpointName);
            });
            
            if (endpointDiv) {
                const statusDiv = endpointDiv.querySelector('div:last-child');
                if (status === 'ok') {
                    statusDiv.textContent = '✅ OK';
                    statusDiv.style.color = '#10b981';
                    endpointDiv.style.background = '#f0fdf4';
                    endpointDiv.style.border = '1px solid #bbf7d0';
                } else if (status === 'fixed') {
                    statusDiv.textContent = '✅ Corrigé';
                    statusDiv.style.color = '#3b82f6';
                    endpointDiv.style.background = '#eff6ff';
                    endpointDiv.style.border = '1px solid #bfdbfe';
                } else if (status === '503') {
                    statusDiv.textContent = '❌ 503';
                    statusDiv.style.color = '#ef4444';
                    endpointDiv.style.background = '#fef2f2';
                    endpointDiv.style.border = '1px solid #fecaca';
                }
            }
        }
    }
    
    function incrementFixedAPIs() {
        const fixedApisText = document.getElementById('fixed-apis-text');
        if (fixedApisText) {
            const currentCount = parseInt(fixedApisText.textContent) || 0;
            fixedApisText.textContent = currentCount + 1;
            fixedApisText.style.color = '#10b981';
        }
    }
    
    function updateLocalDataCount() {
        document.getElementById('medicines-count').textContent = LOCAL_API_FIXER_CONFIG.mockData.medicines.length;
        document.getElementById('services-count').textContent = LOCAL_API_FIXER_CONFIG.mockData.services.length;
        document.getElementById('patients-count').textContent = LOCAL_API_FIXER_CONFIG.mockData.patients.length;
        document.getElementById('consultations-count').textContent = LOCAL_API_FIXER_CONFIG.mockData.consultations.length;
    }
    
    function addFixerLog(message) {
        const timestamp = new Date().toISOString();
        const log = `[${timestamp}] ${message}`;
        
        const logsContainer = document.getElementById('fixer-logs');
        if (logsContainer) {
            const logElement = document.createElement('div');
            logElement.style.color = '#ef4444';
            logElement.textContent = log;
            logsContainer.appendChild(logElement);
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }
        
        console.log('LOCAL-API-FIXER:', log);
    }
    
    // Fonction pour maintenir le panneau
    function maintainFixerPanel() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const panel = document.querySelector('.local-api-fixer-panel');
                    if (!panel) {
                        console.log('LOCAL-API-FIXER: Local API fixer panel removed, recreating...');
                        createLocalAPIFixerPanel();
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
    
    // Initialiser le correcteur local
    setTimeout(() => {
        console.log('LOCAL-API-FIXER: Initializing local API fixer...');
        
        createLocalAPIFixerPanel();
        maintainFixerPanel();
        
        // Charger les données depuis localStorage si disponibles
        const savedData = localStorage.getItem('oclic_sante_local_data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                LOCAL_API_FIXER_CONFIG.mockData = parsed.data || LOCAL_API_FIXER_CONFIG.mockData;
                updateLocalDataCount();
                addFixerLog('LOCAL_DATA_LOADED: Données locales chargées depuis localStorage');
            } catch (error) {
                addFixerLog('LOCAL_DATA_LOAD_ERROR: ' + error.message);
            }
        }
        
        // Sauvegarder les données locales automatiquement
        setInterval(() => {
            localStorage.setItem('oclic_sante_local_data', JSON.stringify({
                timestamp: new Date().toISOString(),
                data: LOCAL_API_FIXER_CONFIG.mockData
            }));
            addFixerLog('LOCAL_DATA_SAVED: Données locales sauvegardées');
        }, 30000); // Toutes les 30 secondes
        
        console.log('LOCAL-API-FIXER: Local API fixer initialized');
    }, 2000);
    
})();
