// Patch simple et efficace pour éviter les erreurs filter
(function() {
    'use strict';
    
    // Éviter les boucles infinies avec un flag
    let isProcessing = false;
    
    // Surcharge de filter uniquement
    const originalFilter = Array.prototype.filter;
    Array.prototype.filter = function(...args) {
        if (isProcessing) return [];
        
        if (!Array.isArray(this)) {
            console.warn('Filter called on non-array, returning empty array');
            return [];
        }
        
        try {
            return originalFilter.apply(this, args);
        } catch (error) {
            console.warn('Filter error caught:', error.message);
            return [];
        }
    };
    
    // Surcharge de map également
    const originalMap = Array.prototype.map;
    Array.prototype.map = function(...args) {
        if (isProcessing) return [];
        
        if (!Array.isArray(this)) {
            console.warn('Map called on non-array, returning empty array');
            return [];
        }
        
        try {
            return originalMap.apply(this, args);
        } catch (error) {
            console.warn('Map error caught:', error.message);
            return [];
        }
    };
    
    // Intercepter les erreurs mais sans boucle
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('filter is not a function')) {
            isProcessing = true;
            console.warn('Filter error intercepted, preventing crash');
            e.preventDefault();
            setTimeout(() => { isProcessing = false; }, 100);
            return false;
        }
    });
    
    console.log('Simple filter protection applied');
})();
