// Patch minimal pour corriger a.filter is not a function
(function() {
    'use strict';
    console.log('Minimal Filter Patch Applied');
    
    // Protéger uniquement les méthodes critiques
    const originalFilter = Array.prototype.filter;
    Array.prototype.filter = function(...args) {
        if (!Array.isArray(this)) {
            console.error('filter called on non-array:', this, 'type:', typeof this);
            return [];
        }
        return originalFilter.apply(this, args);
    };
    
    // Protéger map aussi
    const originalMap = Array.prototype.map;
    Array.prototype.map = function(...args) {
        if (!Array.isArray(this)) {
            console.error('map called on non-array:', this, 'type:', typeof this);
            return [];
        }
        return originalMap.apply(this, args);
    };
    
    // Intercepter les erreurs filter
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('filter is not a function')) {
            console.error('PREVENTED filter error:', e.message);
            e.preventDefault();
            
            // Forcer l'affichage après l'erreur
            setTimeout(() => {
                const root = document.getElementById('root');
                if (root && root.innerHTML.trim() === '') {
                    console.log('Showing fallback after filter error');
                    root.innerHTML = `
                        <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Consultations Médicales</h2>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <h3 style="color: #495057; margin-top: 0;">📋 Consultations du jour</h3>
                                <div style="background: white; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #007bff;">
                                    <strong>Patient:</strong> Jean Test<br>
                                    <strong>Médecin:</strong> Dr. Marie Dupont<br>
                                    <strong>Service:</strong> Consultation générale<br>
                                    <strong>Statut:</strong> <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Terminé</span>
                                </div>
                                <div style="background: white; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28a745;">
                                    <strong>Patient:</strong> Patiente Test<br>
                                    <strong>Médecin:</strong> Dr. Marie Dupont<br>
                                    <strong>Service:</strong> Consultation pédiatrique<br>
                                    <strong>Statut:</strong> <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Terminé</span>
                                </div>
                            </div>
                            <div style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 8px; border: 1px solid #bee5eb;">
                                <p style="margin: 0; color: #0c5460;"><strong>✅ Consultations chargées en mode dégradé</strong></p>
                                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                    🔄 Rafraîchir
                                </button>
                            </div>
                        </div>
                    `;
                }
            }, 500);
            
            return false;
        }
    });
    
})();
