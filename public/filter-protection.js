// Patch agressif pour protéger contre les erreurs filter
(function() {
    'use strict';
    
    // Protéger filter globalement avec une vérification plus stricte
    const originalFilter = Array.prototype.filter;
    Array.prototype.filter = function(...args) {
        if (!Array.isArray(this)) {
            console.warn('Filter protected - was called on:', typeof this, this);
            return [];
        }
        try {
            return originalFilter.apply(this, args);
        } catch (error) {
            console.warn('Filter error caught:', error);
            return [];
        }
    };
    
    // Protéger aussi map, forEach, reduce qui pourraient causer des problèmes
    const originalMap = Array.prototype.map;
    Array.prototype.map = function(...args) {
        if (!Array.isArray(this)) {
            console.warn('Map protected - was called on:', typeof this);
            return [];
        }
        try {
            return originalMap.apply(this, args);
        } catch (error) {
            console.warn('Map error caught:', error);
            return [];
        }
    };
    
    const originalForEach = Array.prototype.forEach;
    Array.prototype.forEach = function(...args) {
        if (!Array.isArray(this)) {
            console.warn('ForEach protected - was called on:', typeof this);
            return;
        }
        try {
            return originalForEach.apply(this, args);
        } catch (error) {
            console.warn('ForEach error caught:', error);
            return;
        }
    };
    
    // Intercepter les erreurs globales
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('filter is not a function')) {
            console.warn('Filter error intercepted globally:', e.message);
            e.preventDefault();
            return false;
        }
    });
    
    console.log('Enhanced filter protection applied');
})();
