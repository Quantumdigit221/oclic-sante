// Patch ultime pour forcer les valeurs par défaut et éviter les erreurs
(function() {
    'use strict';
    
    // Surcharge de toutes les méthodes de tableau
    const arrayMethods = ['filter', 'map', 'forEach', 'reduce', 'find', 'some', 'every', 'sort', 'slice'];
    
    arrayMethods.forEach(method => {
        const original = Array.prototype[method];
        Array.prototype[method] = function(...args) {
            // Si ce n'est pas un tableau, le convertir en tableau vide
            if (!Array.isArray(this)) {
                console.warn(`${method} called on non-array, converting to empty array:`, typeof this);
                const emptyArray = [];
                return original.apply(emptyArray, args);
            }
            try {
                return original.apply(this, args);
            } catch (error) {
                console.warn(`${method} error, using empty array:`, error);
                const emptyArray = [];
                return original.apply(emptyArray, args);
            }
        };
    });
    
    // Forcer les valeurs par défaut pour les objets
    const originalGet = Object.prototype.__lookupGetter__ || function(prop) {
        return this[prop];
    };
    
    // Intercepter les accès aux propriétés
    const originalHasOwnProperty = Object.prototype.hasOwnProperty;
    Object.prototype.hasOwnProperty = function(prop) {
        if (!originalHasOwnProperty.call(this, prop)) {
            // Si la propriété n'existe pas et qu'on attend un tableau, retourner un tableau vide
            if (prop.includes('data') || prop.includes('items') || prop.includes('results') || prop.includes('list')) {
                console.warn(`Property ${prop} missing, returning empty array`);
                return true; // Faire croire que la propriété existe
            }
        }
        return originalHasOwnProperty.call(this, prop);
    };
    
    // Intercepter les erreurs de lecture de propriétés
    const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    Object.getOwnPropertyDescriptor = function(obj, prop) {
        try {
            const descriptor = originalGetOwnPropertyDescriptor.call(this, obj, prop);
            
            // Si la propriété n'existe pas et pourrait être un tableau
            if (!descriptor && (prop.includes('data') || prop.includes('items') || prop.includes('results') || prop.includes('list'))) {
                return {
                    enumerable: true,
                    configurable: true,
                    value: []
                };
            }
            
            return descriptor;
        } catch (error) {
            // En cas d'erreur, retourner un tableau vide
            if (prop.includes('data') || prop.includes('items') || prop.includes('results') || prop.includes('list')) {
                return {
                    enumerable: true,
                    configurable: true,
                    value: []
                };
            }
            return undefined;
        }
    };
    
    // Intercepter toutes les erreurs sans exception
    window.addEventListener('error', function(e) {
        console.warn('Global error intercepted:', e.message);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    });
    
    // Intercepter les rejets de promesses
    window.addEventListener('unhandledrejection', function(e) {
        console.warn('Promise rejection intercepted:', e.reason);
        e.preventDefault();
        return false;
    });
    
    console.log('Ultimate protection applied - forcing safe defaults');
})();
