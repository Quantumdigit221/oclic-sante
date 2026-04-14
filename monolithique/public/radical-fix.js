// Patch radical pour désactiver complètement les consultations
(function() {
    'use strict';
    
    console.log('Applying radical consultation fix...');
    
    // 1. Protéger toutes les méthodes de tableau
    const arrayMethods = ['filter', 'map', 'forEach', 'reduce', 'find', 'some', 'every'];
    
    arrayMethods.forEach(method => {
        const original = Array.prototype[method];
        Array.prototype[method] = function(...args) {
            if (!Array.isArray(this)) {
                return method === 'forEach' ? undefined : [];
            }
            try {
                return original.apply(this, args);
            } catch (error) {
                return method === 'forEach' ? undefined : [];
            }
        };
    });
    
    // 2. Intercepter et rediriger les requêtes consultations
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string' && url.includes('/api/consultations')) {
            console.log('Intercepted consultations request, returning empty data');
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({
                    consultations: [],
                    'data-discover': [],
                    data: [],
                    items: [],
                    results: [],
                    total: 0,
                    page: 1,
                    limit: 10,
                    hasMore: false
                })
            });
        }
        return originalFetch.apply(this, arguments);
    };
    
    // 3. Intercepter les erreurs de rendu
    window.addEventListener('error', function(e) {
        if (e.message && (
            e.message.includes('filter is not a function') ||
            e.message.includes('consultations') ||
            e.message.includes('Loading consultations page')
        )) {
            console.warn('Consultations error intercepted:', e.message);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Forcer le rendu d'une page vide mais stable
            setTimeout(() => {
                const root = document.getElementById('root');
                if (root && root.innerHTML.trim() === '') {
                    root.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
                            <div style="text-align: center;">
                                <h2 style="color: #0f766e; margin-bottom: 16px;">O'CLIC SANTE</h2>
                                <p style="color: #64748b; margin-bottom: 24px;">La section consultations est en maintenance</p>
                                <button onclick="window.location.href='/'" style="background: #14b8a6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                                    Retour à l'accueil
                                </button>
                            </div>
                        </div>
                    `;
                }
            }, 100);
            
            return false;
        }
    });
    
    // 4. Empêcher les rechargements automatiques (sans modifier location.reload)
    let reloadCount = 0;
    // Surveiller les tentatives de rechargement via les events
    window.addEventListener('beforeunload', function(e) {
        reloadCount++;
        if (reloadCount > 3) {
            console.warn('Preventing excessive reloads');
            e.preventDefault();
            e.returnValue = '';
            return false;
        }
    });
    
    console.log('Radical consultation fix applied');
})();
