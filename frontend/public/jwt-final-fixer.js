// O'CLIC SANTE - JWT Final Fixer
(function() {
    'use strict';
    console.log('JWT-FIXER: Active');

    // Intercept fetch to add token and handle 401
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        let [resource, config] = args;
        const token = localStorage.getItem('token');

        if (token && typeof resource === 'string' && resource.startsWith('/api')) {
            config = config || {};
            config.headers = config.headers || {};
            if (!config.headers['Authorization']) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const response = await originalFetch(resource, config);
        
        if (response.status === 401 && !window.location.hash.includes('/auth')) {
            console.warn('JWT-FIXER: 401 Unauthorized. Redirecting to login.');
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            window.location.hash = '#/auth';
        }
        
        return response;
    };
})();
