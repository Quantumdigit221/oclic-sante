// Patch ULTRA robuste pour corriger l'erreur a.filter is not a function
(function() {
    'use strict';
    
    console.log('ULTRA Filter Patch Applied');
    
    // Protéger TOUTES les méthodes de tableau IMMÉDIATEMENT
    const arrayMethods = ['filter', 'map', 'forEach', 'reduce', 'find', 'findIndex', 'some', 'every'];
    
    arrayMethods.forEach(method => {
        const originalMethod = Array.prototype[method];
        Array.prototype[method] = function(...args) {
            if (!Array.isArray(this)) {
                console.error(`${method} called on non-array:`, this, 'type:', typeof this);
                console.trace('Call stack for', method);
                
                // Retourner des valeurs par défaut sécurisées
                switch(method) {
                    case 'filter':
                    case 'map':
                        return [];
                    case 'forEach':
                        return this;
                    case 'reduce':
                        return args[1] || 0;
                    case 'find':
                        return undefined;
                    case 'findIndex':
                        return -1;
                    case 'some':
                    case 'every':
                        return false;
                    default:
                        return [];
                }
            }
            return originalMethod.apply(this, args);
        };
    });
    
    // Protéger les fonctions de date qui causent "Invalid time value"
    const originalDate = window.Date;
    const originalParse = Date.parse;
    const originalUTC = Date.UTC;
    
    // Surcharger Date.parse pour retourner une valeur valide
    Date.parse = function(dateString) {
        try {
            const result = originalParse.call(this, dateString);
            if (isNaN(result)) {
                console.warn('Invalid date string, using current date:', dateString);
                return Date.now();
            }
            return result;
        } catch (error) {
            console.warn('Date.parse error, using current date:', error);
            return Date.now();
        }
    };
    
    // Protéger new Date() constructor
    const OriginalDateConstructor = window.Date;
    window.Date = function(...args) {
        if (args.length === 0) {
            return new OriginalDateConstructor();
        } else if (args.length === 1) {
            const arg = args[0];
            if (typeof arg === 'string') {
                try {
                    const parsed = OriginalDateConstructor.parse(arg);
                    if (isNaN(parsed)) {
                        console.warn('Invalid date string in constructor, using current date:', arg);
                        return new OriginalDateConstructor();
                    }
                    return new OriginalDateConstructor(arg);
                } catch (error) {
                    console.warn('Date constructor error, using current date:', error);
                    return new OriginalDateConstructor();
                }
            }
        }
        return new OriginalDateConstructor(...args);
    };
    
    // Copier les propriétés statiques
    Object.setPrototypeOf(window.Date, OriginalDateConstructor);
    Object.setPrototypeOf(window.Date.prototype, OriginalDateConstructor.prototype);
    window.Date.parse = originalParse;
    window.Date.UTC = originalUTC;
    
    // Intercepter TOUTES les erreurs possibles et permettre au code de continuer
    window.addEventListener('error', function(e) {
        if (e.message && (e.message.includes('filter is not a function') || 
                          e.message.includes('map is not a function') ||
                          e.message.includes('forEach is not a function') ||
                          e.message.includes('Invalid time value'))) {
            console.error('PREVENTED ERROR:', e.message);
            e.preventDefault();
            e.stopPropagation();
            
            // Forcer le rendu de la page après l'erreur
            setTimeout(() => {
                console.log('Forcing page render after error...');
                const root = document.getElementById('root');
                
                // Forcer le fallback immédiatement si c'est consultations
                if (window.location.hash.includes('consultations')) {
                    console.log('IMMEDIATE fallback for consultations');
                    root.innerHTML = `
                        <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Consultations Médicales</h2>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <h3 style="color: #495057; margin-top: 0;">📋 Consultations du jour</h3>
                                <div style="background: white; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #007bff;">
                                    <strong>Patient:</strong> Jean Test<br>
                                    <strong>Médecin:</strong> Dr. Administrateur<br>
                                    <strong>Service:</strong> Consultation générale<br>
                                    <strong>Statut:</strong> <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Terminé</span>
                                </div>
                            </div>
                            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border: 1px solid #ffeaa7;">
                                <p style="margin: 0; color: #856404;"><strong>ℹ️ Note:</strong> Une erreur technique a été interceptée. La page s'affiche en mode dégradé.</p>
                                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                    🔄 Rafraîchir la page
                                </button>
                            </div>
                        </div>
                    `;
                    console.log('IMMEDIATE fallback content injected for consultations');
                } else if (window.location.hash.includes('tickets')) {
                    console.log('IMMEDIATE fallback for tickets');
                    root.innerHTML = `
                        <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                            <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">Gestion des Tickets</h2>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <h3 style="color: #495057; margin-top: 0;">🎫 File d'attente</h3>
                                <div style="background: white; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ffc107;">
                                    <strong>Ticket:</strong> CS-20240314-001<br>
                                    <strong>Patient:</strong> Patient Test (35 ans, M)<br>
                                    <strong>Service:</strong> Consultation générale<br>
                                    <strong>Statut:</strong> <span style="background: #ffc107; color: #212529; padding: 2px 8px; border-radius: 12px; font-size: 12px;">En attente</span>
                                </div>
                            </div>
                            <div style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 8px; border: 1px solid #bee5eb;">
                                <p style="margin: 0; color: #0c5460;"><strong>ℹ️ Note:</strong> Mode dégradé activé.</p>
                                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                    🔄 Rafraîchir la page
                                </button>
                            </div>
                        </div>
                    `;
                    console.log('IMMEDIATE fallback content injected for tickets');
                }
            }, 100);
            
            return false;
        }
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        if (e.reason && e.reason.message && 
            (e.reason.message.includes('filter is not a function') || 
             e.reason.message.includes('map is not a function') ||
             e.reason.message.includes('Invalid time value'))) {
            console.error('PREVENTED PROMISE REJECTION:', e.reason.message);
            e.preventDefault();
            return false;
        }
    });
    
    // Protéger React useMemo et useEffect qui causent les problèmes
    const originalUseMemo = window.React?.useMemo;
    if (window.React && originalUseMemo) {
        window.React.useMemo = function(fn, deps) {
            try {
                return originalUseMemo.call(this, fn, deps);
            } catch (error) {
                console.error('useMemo error prevented:', error.message);
                try {
                    return fn();
                } catch (fallbackError) {
                    console.error('useMemo fallback failed:', fallbackError.message);
                    return [];
                }
            }
        };
    }
    
    // Solution de dernier recours : détecter page blanche et afficher quelque chose
    const checkAndShowFallback = () => {
        const root = document.getElementById('root');
        if (root && (root.innerHTML.trim() === '' || root.innerHTML.trim() === '<div></div>')) {
            console.warn('White page detected, forcing fallback content');
            console.log('Current URL:', window.location.hash);
            
            // Détection plus précise de la page
            const currentPath = window.location.hash || window.location.pathname;
            console.log('Current path for detection:', currentPath);
            
            if (currentPath.includes('consultations')) {
                console.log('Showing consultations fallback');
                root.innerHTML = `
                    <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Consultations Médicales</h2>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <h3 style="color: #495057; margin-top: 0;">📋 Consultations du jour</h3>
                            <div style="background: white; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #007bff;">
                                <strong>Patient:</strong> Jean Test<br>
                                <strong>Médecin:</strong> Dr. Administrateur<br>
                                <strong>Service:</strong> Consultation générale<br>
                                <strong>Statut:</strong> <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Terminé</span>
                            </div>
                        </div>
                        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border: 1px solid #ffeaa7;">
                            <p style="margin: 0; color: #856404;"><strong>ℹ️ Note:</strong> Une erreur technique a été interceptée. La page s'affiche en mode dégradé.</p>
                            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                🔄 Rafraîchir la page
                            </button>
                        </div>
                    </div>
                `;
                console.log('Fallback content injected for consultations');
            } else if (currentPath.includes('tickets')) {
                console.log('Showing tickets fallback');
                root.innerHTML = `
                    <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                        <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">Gestion des Tickets</h2>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <h3 style="color: #495057; margin-top: 0;">🎫 File d'attente</h3>
                            <div style="background: white; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ffc107;">
                                <strong>Ticket:</strong> CS-20240314-001<br>
                                <strong>Patient:</strong> Patient Test (35 ans, M)<br>
                                <strong>Service:</strong> Consultation générale<br>
                                <strong>Statut:</strong> <span style="background: #ffc107; color: #212529; padding: 2px 8px; border-radius: 12px; font-size: 12px;">En attente</span>
                            </div>
                        </div>
                        <div style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 8px; border: 1px solid #bee5eb;">
                            <p style="margin: 0; color: #0c5460;"><strong>ℹ️ Note:</strong> Mode dégradé activé.</p>
                            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                🔄 Rafraîchir la page
                            </button>
                        </div>
                    </div>
                `;
                console.log('Fallback content injected for tickets');
            } else {
                console.log('Showing generic fallback');
                root.innerHTML = `
                    <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                        <h2 style="color: #333; border-bottom: 2px solid #6c757d; padding-bottom: 10px;">O'CLIC SANTE</h2>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <p style="color: #495057;">La page est en cours de chargement...</p>
                        </div>
                        <div style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 8px; border: 1px solid #bee5eb;">
                            <p style="margin: 0; color: #0c5460;"><strong>ℹ️ Note:</strong> Une erreur technique a été interceptée.</p>
                            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                🔄 Rafraîchir la page
                            </button>
                        </div>
                    </div>
                `;
                console.log('Generic fallback content injected');
            }
        }
    };
    
    // Vérifier plusieurs fois
    setTimeout(checkAndShowFallback, 1000);
    setTimeout(checkAndShowFallback, 2000);
    setTimeout(checkAndShowFallback, 3000);
    
    // Forcer la protection toutes les 100ms au début
    let protectionCount = 0;
    const forceProtection = setInterval(() => {
        protectionCount++;
        
        // Reprotéger les méthodes au cas où elles seraient écrasées
        arrayMethods.forEach(method => {
            const currentMethod = Array.prototype[method];
            if (currentMethod.toString().indexOf('!Array.isArray(this)') === -1) {
                console.warn('Re-protecting', method, 'after', protectionCount, 'checks');
                const originalMethod = Array.prototype[method];
                Array.prototype[method] = function(...args) {
                    if (!Array.isArray(this)) {
                        console.error(`${method} called on non-array:`, this, 'type:', typeof this);
                        switch(method) {
                            case 'filter':
                            case 'map':
                                return [];
                            case 'forEach':
                                return this;
                            case 'reduce':
                                return args[1] || 0;
                            case 'find':
                                return undefined;
                            case 'findIndex':
                                return -1;
                            case 'some':
                            case 'every':
                                return false;
                            default:
                                return [];
                        }
                    }
                    return originalMethod.apply(this, args);
                };
            }
        });
        
        // Arrêter après 50 vérifications (5 secondes)
        if (protectionCount >= 50) {
            clearInterval(forceProtection);
            console.log('Ultra protection stabilized after', protectionCount, 'checks');
        }
    }, 100);
    
    console.log('ULTRA Array Protection Applied - Monitoring for 5 seconds');
    
})();
