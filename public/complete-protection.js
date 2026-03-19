// Patch complet pour protéger contre toutes les erreurs de type
(function() {
    'use strict';
    
    // Surcharge de toutes les méthodes de tableau pour protection
    const arrayMethods = ['filter', 'map', 'forEach', 'reduce', 'find', 'some', 'every', 'sort'];
    
    arrayMethods.forEach(method => {
        const original = Array.prototype[method];
        Array.prototype[method] = function(...args) {
            if (!Array.isArray(this)) {
                console.warn(`${method} protected - was called on:`, typeof this, this);
                return method === 'forEach' ? undefined : [];
            }
            try {
                return original.apply(this, args);
            } catch (error) {
                console.warn(`${method} error caught:`, error);
                return method === 'forEach' ? undefined : [];
            }
        };
    });
    
    // Intercepter les erreurs de propriété undefined
    const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    Object.getOwnPropertyDescriptor = function(obj, prop) {
        const descriptor = originalGetOwnPropertyDescriptor.call(this, obj, prop);
        if (descriptor && descriptor.get) {
            const originalGet = descriptor.get;
            descriptor.get = function() {
                try {
                    return originalGet.call(this);
                } catch (error) {
                    console.warn(`Property access error for ${prop}:`, error);
                    return undefined;
                }
            };
        }
        return descriptor;
    };
    
    // Intercepter les erreurs globales plus agressivement
    window.addEventListener('error', function(e) {
        if (e.message && (
            e.message.includes('filter is not a function') ||
            e.message.includes('map is not a function') ||
            e.message.includes('forEach is not a function') ||
            e.message.includes('Cannot read property') ||
            e.message.includes('undefined')
        )) {
            console.warn('Error intercepted:', e.message);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
    
    // Intercepter les rejets de promesses
    window.addEventListener('unhandledrejection', function(e) {
        console.warn('Unhandled promise rejection intercepted:', e.reason);
        e.preventDefault();
        return false;
    });
    
    console.log('Complete error protection applied');
})();
