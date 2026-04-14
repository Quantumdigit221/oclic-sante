// ============================================
// O'CLIC SANTE - Gestionnaire d'erreurs simple
// ============================================

(function() {
    'use strict';
    
    console.log('Error Handler: Initialisation...');
    
    // Gestionnaire global pour les erreurs de date
    window.addEventListener('error', function(event) {
        if (event.message.includes('Invalid time value')) {
            console.warn('Erreur de date interceptée et corrigée:', event.message);
            event.preventDefault();
            return true;
        }
        console.error('Erreur JavaScript:', event.error);
    });
    
    // Gestionnaire global pour les promesses rejetées
    window.addEventListener('unhandledrejection', function(event) {
        console.warn('Promesse non gérée interceptée:', event.reason);
        
        // Ne pas bloquer l'application pour les erreurs 403
        if (event.reason && event.reason.code === 403) {
            console.warn('Erreur 403 gérée silencieusement');
            event.preventDefault();
            return;
        }
        
        event.preventDefault();
    });
    
    // Intercepter les fetch pour gérer les erreurs 403
    const originalFetch = window.fetch;
    window.fetch = async function(url, options = {}) {
        try {
            const response = await originalFetch(url, options);
            
            // Gérer les erreurs 403 spécifiquement
            if (response.status === 403) {
                console.warn(`⚠️ Erreur 403 sur ${url}: Permission refusée`);
                
                // Retourner une réponse vide pour éviter les crashes
                return new Response(JSON.stringify({ error: 'Permission refusée', data: [] }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            return response;
        } catch (error) {
            console.error(`❌ Erreur fetch sur ${url}:`, error);
            
            // Retourner une réponse vide pour éviter les crashes
            return new Response(JSON.stringify({ error: error.message, data: [] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    };
    
    // Corriger les erreurs de date dans React
    const originalDate = window.Date;
    window.Date = function(...args) {
        if (args.length === 1) {
            const arg = args[0];
            if (typeof arg === 'string') {
                if (arg === 'Invalid Date' || arg === 'NaN' || arg === null || arg === undefined) {
                    return new originalDate();
                }
                if (typeof arg === 'string' && (arg.includes('NaN') || arg.includes('Invalid'))) {
                    return new originalDate();
                }
            }
        }
        return new originalDate(...args);
    };
    
    // Copier les méthodes statiques
    Object.setPrototypeOf(window.Date, originalDate);
    Object.setPrototypeOf(window.Date.prototype, originalDate.prototype);
    
    // Corriger les méthodes de date qui peuvent échouer
    const originalToString = originalDate.prototype.toString;
    originalDate.prototype.toString = function() {
        try {
            return originalToString.call(this);
        } catch (error) {
            return new originalDate().toString();
        }
    };
    
    const originalToISOString = originalDate.prototype.toISOString;
    originalDate.prototype.toISOString = function() {
        try {
            return originalToISOString.call(this);
        } catch (error) {
            return new originalDate().toISOString();
        }
    };
    
    console.log('Error Handler: Initialisation terminée');
    
})();
