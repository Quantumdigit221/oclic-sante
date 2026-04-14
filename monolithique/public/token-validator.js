// TOKEN VALIDATOR - Vérifier le bootstrap token existant
(function() {
    'use strict';
    
    console.log('🔍 TOKEN-VALIDATOR: Checking bootstrap token...');
    
    // Récupérer le bootstrap token
    const bootstrapToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsIm5hbWUiOiJBZG1pbiBPQ0xJQyBTQU5URSIsImVtYWlsIjoiYWRtaW5Ab2NsaWMtc2FudGUuY29tIiwicm9sZSI6ImFkbWluIiwidGVuYW50SWQiOiJjZW50ZXItMDAxIiwiY2VudGVySWQiOiJjZW50ZXItMDAxIiwiaWF0IjoxNzc0NzQzMTY2LCJleHAiOjE4MDYyNzkxNjZ9.z7w1_F4d91NZBUW3hT0mLhceeXQZ1sW1KgZHLTmCCTs';
    
    // Décoder le token
    function decodeJWT(token) {
        try {
            const parts = token.split('.');
            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            const signature = parts[2];
            
            return { header, payload, signature };
        } catch (error) {
            console.error('🔍 TOKEN-VALIDATOR: Error decoding token:', error);
            return null;
        }
    }
    
    // Vérifier l'expiration
    function checkExpiration(payload) {
        if (!payload.exp) return { valid: true, message: 'No expiration' };
        
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = payload.exp;
        const isExpired = now >= expiresAt;
        
        return {
            valid: !isExpired,
            expired: isExpired,
            now: new Date(now * 1000),
            expiresAt: new Date(expiresAt * 1000),
            timeLeft: expiresAt - now,
            message: isExpired ? 'EXPIRED' : 'VALID'
        };
    }
    
    // Tester le token
    async function testToken(token) {
        try {
            const response = await fetch('/api/services?centerId=center-001', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`🔍 TOKEN-VALIDATOR: Test response: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('🔍 TOKEN-VALIDATOR: ✅ Bootstrap token WORKS!', data.slice(0, 3));
                return true;
            } else {
                const error = await response.text();
                console.error('🔍 TOKEN-VALIDATOR: ❌ Bootstrap token FAILED:', error);
                return false;
            }
        } catch (error) {
            console.error('🔍 TOKEN-VALIDATOR: Network error:', error);
            return false;
        }
    }
    
    // Analyser le bootstrap token
    const decoded = decodeJWT(bootstrapToken);
    if (decoded) {
        const expiration = checkExpiration(decoded.payload);
        
        console.log('🔍 TOKEN-VALIDATOR: Bootstrap token analysis:', {
            header: decoded.header,
            payload: decoded.payload,
            expiration: expiration,
            signatureLength: decoded.signature.length
        });
        
        // Tester le token
        testToken(bootstrapToken).then(works => {
            if (works) {
                console.log('🔍 TOKEN-VALIDATOR: ✅ Bootstrap token is VALID - no changes needed!');
            } else {
                console.log('🔍 TOKEN-VALIDATOR: ❌ Bootstrap token is INVALID - need new token');
            }
        });
    }
    
})();
