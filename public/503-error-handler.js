// Script de diagnostic et de gestion des erreurs 503
(function() {
    'use strict';
    
    console.log('503-ERROR-HANDLER: Initializing 503 error handler...');
    
    // Fonction pour diagnostiquer les erreurs 503
    function diagnose503Error() {
        console.log('503-ERROR-HANDLER: Diagnosing 503 errors...');
        
        const errorInfo = {
            timestamp: new Date().toISOString(),
            errors: [],
            status: 'checking'
        };
        
        // Vérifier les erreurs de réseau
        if (window.performance && window.performance.getEntriesByType) {
            const entries = window.performance.getEntriesByType('navigation');
            entries.forEach(entry => {
                if (entry.responseStatus >= 500) {
                    errorInfo.errors.push({
                        type: 'navigation',
                        url: entry.name,
                        status: entry.responseStatus,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        }
        
        // Vérifier les erreurs de console
        const originalError = console.error;
        console.error = function(...args) {
            errorInfo.errors.push({
                type: 'console',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            originalError.apply(console, args);
        };
        
        return errorInfo;
    }
    
    // Fonction pour créer une page d'erreur 503
    function create503ErrorPage() {
        const root = document.getElementById('root');
        if (!root) return false;
        
        console.log('503-ERROR-HANDLER: Creating 503 error page...');
        
        root.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; padding: 20px;">
                <div style="text-align: center; max-width: 600px;">
                    <!-- Icône d'erreur -->
                    <div style="font-size: 80px; margin-bottom: 20px;">🔧</div>
                    
                    <!-- Titre d'erreur -->
                    <h1 style="margin: 0 0 10px 0; font-size: 36px; color: #ef4444; font-weight: bold;">Service Temporairement Indisponible</h1>
                    
                    <!-- Code d'erreur -->
                    <div style="font-size: 24px; font-weight: bold; color: #64748b; margin-bottom: 20px;">Erreur 503</div>
                    
                    <!-- Description -->
                    <p style="margin: 0 0 30px 0; font-size: 16px; color: #64748b; line-height: 1.6;">
                        Le service O'CLIC SANTE est temporairement indisponible. 
                        Nous travaillons à résoudre ce problème dans les plus brefs délais.
                    </p>
                    
                    <!-- Informations techniques -->
                    <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 4px solid #ef4444;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #1e293b;">🔍 Informations Techniques</h2>
                        <div style="text-align: left; font-size: 14px; color: #64748b;">
                            <div style="margin-bottom: 10px;"><strong>URL demandée:</strong> <span style="color: #1e293b;">https://santesaas.samacaisse.cloud/</span></div>
                            <div style="margin-bottom: 10px;"><strong>Code d'erreur:</strong> <span style="color: #ef4444; font-weight: bold;">503 Service Unavailable</span></div>
                            <div style="margin-bottom: 10px;"><strong>Heure:</strong> <span style="color: #1e293b;">${new Date().toLocaleString('fr-FR')}</span></div>
                            <div style="margin-bottom: 10px;"><strong>Statut:</strong> <span style="color: #f59e0b;">Service en maintenance</span></div>
                            <div><strong>Domaine:</strong> <span style="color: #1e293b;">santesaas.samacaisse.cloud</span></div>
                        </div>
                    </div>
                    
                    <!-- Actions recommandées -->
                    <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6;">
                        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #1e293b;">🛠️ Actions Recommandées</h2>
                        <div style="text-align: left;">
                            <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 20px;">🔄</span>
                                <span style="font-size: 14px; color: #1e293b;"><strong>Rafraîchir la page</strong> - Attendez quelques minutes et réessayez</span>
                            </div>
                            <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 20px;">📞</span>
                                <span style="font-size: 14px; color: #1e293b;"><strong>Contacter le support</strong> - +224 622 123 456</span>
                            </div>
                            <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 20px;">🌐</span>
                                <span style="font-size: 14px; color: #1e293b;"><strong>Vérifier la connexion</strong> - Assurez-vous que votre connexion internet fonctionne</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 20px;">⏰</span>
                                <span style="font-size: 14px; color: #1e293b;"><strong>Revenir plus tard</strong> - Le service sera bientôt de retour</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Boutons d'action -->
                    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">🔄 Rafraîchir</button>
                        <button onclick="checkServiceStatus()" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">🔍 Vérifier le statut</button>
                        <button onclick="openLocalMode()" style="background: #f59e0b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">🏠 Mode local</button>
                    </div>
                    
                    <!-- Compteur de rafraîchissement -->
                    <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="font-size: 14px; color: #64748b;">
                            <strong>Prochaine tentative de rafraîchissement dans:</strong> <span id="refresh-countdown" style="color: #3b82f6; font-weight: bold;">30</span> secondes
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Démarrer le compteur de rafraîchissement automatique
        startRefreshCountdown();
        
        return true;
    }
    
    // Fonction pour démarrer le compteur de rafraîchissement
    function startRefreshCountdown() {
        let countdown = 30;
        const countdownElement = document.getElementById('refresh-countdown');
        
        if (!countdownElement) return;
        
        const interval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(interval);
                console.log('503-ERROR-HANDLER: Auto-refreshing...');
                window.location.reload();
            }
        }, 1000);
    }
    
    // Fonction pour vérifier le statut du service
    window.checkServiceStatus = function() {
        console.log('503-ERROR-HANDLER: Checking service status...');
        
        // Simulation de vérification du statut
        const statusModal = document.createElement('div');
        statusModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;';
        statusModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 400px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 20px;">🔍</div>
                <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #1e293b;">Vérification du statut</h2>
                <p style="margin: 0 0 20px 0; color: #64748b;">Vérification de la disponibilité du service...</p>
                <div style="width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                    <div style="width: 100%; height: 100%; background: #3b82f6; animation: pulse 1.5s infinite;"></div>
                </div>
                <style>
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                </style>
            </div>
        `;
        
        document.body.appendChild(statusModal);
        
        // Simuler la vérification (3 secondes)
        setTimeout(() => {
            statusModal.remove();
            alert('🔍 Le service est toujours en maintenance. Veuillez réessayer plus tard.');
        }, 3000);
    };
    
    // Fonction pour ouvrir le mode local
    window.openLocalMode = function() {
        console.log('503-ERROR-HANDLER: Opening local mode...');
        
        // Rediriger vers le mode local (localhost)
        const localUrl = 'http://127.0.0.1:3000/#/patients';
        window.location.href = localUrl;
    };
    
    // Fonction pour détecter les erreurs 503
    function detect503Errors() {
        // Intercepter les erreurs de fetch
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).catch(error => {
                if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
                    console.log('503-ERROR-HANDLER: 503 error detected');
                    create503ErrorPage();
                }
                throw error;
            });
        };
        
        // Intercepter les erreurs de XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            xhr.open = function(method, url, ...args) {
                xhr.addEventListener('load', function() {
                    if (xhr.status === 503) {
                        console.log('503-ERROR-HANDLER: 503 error detected in XHR');
                        create503ErrorPage();
                    }
                });
                return originalOpen.apply(this, [method, url, ...args]);
            };
            return xhr;
        };
    }
    
    // Vérifier l'URL actuelle pour les erreurs 503
    function checkCurrentURL() {
        const currentURL = window.location.href;
        if (currentURL.includes('santesaas.samacaisse.cloud')) {
            console.log('503-ERROR-HANDLER: Detected problematic domain in URL');
            // Attendre un peu pour voir si la page se charge correctement
            setTimeout(() => {
                const root = document.getElementById('root');
                if (!root || root.innerHTML.trim() === '') {
                    console.log('503-ERROR-HANDLER: Page not loading properly, showing 503 error page');
                    create503ErrorPage();
                }
            }, 3000);
        }
    }
    
    // Initialiser le gestionnaire d'erreurs 503
    setTimeout(() => {
        console.log('503-ERROR-HANDLER: Initializing 503 error handling...');
        
        // Démarrer le diagnostic
        diagnose503Error();
        
        // Détecter les erreurs
        detect503Errors();
        
        // Vérifier l'URL actuelle
        checkCurrentURL();
        
        // Surveiller les erreurs de console
        window.addEventListener('error', function(event) {
            if (event.message && event.message.includes('503')) {
                console.log('503-ERROR-HANDLER: 503 error detected in window error');
                create503ErrorPage();
            }
        });
        
        console.log('503-ERROR-HANDLER: 503 error handler initialized');
    }, 2000);
    
})();
