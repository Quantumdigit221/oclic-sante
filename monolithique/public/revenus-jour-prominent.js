// Composant Proéminent Dynamique pour les Revenus du Jour
(function() {
    'use strict';
    
    console.log('REVENUS-PROMINENT: Initializing dynamic view...');
    
    let totalRevenue = 0;
    let transactionCount = 0;

    async function updateProminentRevenue() {
        try {
            console.log('REVENUS-PROMINENT: Fetching daily status...');
            const response = await fetch('/api/stats');
            const data = await response.json();
            
            totalRevenue = data.total_revenue_today || 0;
            transactionCount = data.total_patients_today || 0;
            
            const revenueElement = document.querySelector('.prominent-total-revenue');
            const countElement = document.querySelector('.prominent-transaction-count');
            
            if (revenueElement) revenueElement.textContent = totalRevenue.toLocaleString('fr-FR') + ' FCFA';
            if (countElement) countElement.textContent = transactionCount;
            
            console.log('REVENUS-PROMINENT: Total updated:', totalRevenue);
        } catch (error) {
            console.error('REVENUS-PROMINENT: Error updating revenue:', error);
        }
    }

    function injectHeaderRevenue() {
        // Attempt to find a header or navigation bar
        const header = document.querySelector('header') || 
                       document.querySelector('.header') || 
                       document.querySelector('.navbar') || 
                       document.querySelector('[class*="Header"]');
        
        if (!header) {
            setTimeout(injectHeaderRevenue, 1000);
            return;
        }

        if (header.querySelector('.prominent-revenue-header')) return;

        const banner = document.createElement('div');
        banner.className = 'prominent-revenue-header';
        banner.style.width = '100%';
        banner.style.padding = '12px 20px';
        banner.style.background = 'linear-gradient(to right, #065f46, #059669)';
        banner.style.color = 'white';
        banner.style.display = 'flex';
        banner.style.justifyContent = 'space-between';
        banner.style.alignItems = 'center';
        banner.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        banner.style.zIndex = '9999';
        banner.style.position = 'relative';

        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 24px;">📊</div>
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; opacity: 0.9; letter-spacing: 0.1em; line-height: 1;">STATISTIQUES DU JOUR</div>
                    <div style="font-size: 14px; font-weight: 500; opacity: 0.8; margin-top: 2px;">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                </div>
            </div>
            
            <div style="display: flex; gap: 30px; align-items: center;">
                <div style="text-align: right;">
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; opacity: 0.9; letter-spacing: 0.1em; line-height: 1;">SOMME TOTALE</div>
                    <div class="prominent-total-revenue" style="font-size: 20px; font-weight: 900; color: #34d399; letter-spacing: -0.5px; margin-top: 2px;">
                        Chargement...
                    </div>
                </div>
                <div style="text-align: right; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 30px;">
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; opacity: 0.9; letter-spacing: 0.1em; line-height: 1;">VENTES CLÔTURÉES</div>
                    <div class="prominent-transaction-count" style="font-size: 20px; font-weight: 900; color: #bef264; margin-top: 2px;">
                        ...
                    </div>
                </div>
                <button onclick="window.refreshProminentRevenue()" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin-left: 10px; transition: all 0.2s;">
                    ACTUALISER
                </button>
            </div>
        `;

        // Style for hover
        const btn = banner.querySelector('button');
        btn.onmouseover = () => btn.style.background = 'rgba(255,255,255,0.25)';
        btn.onmouseout = () => btn.style.background = 'rgba(255,255,255,0.15)';

        // Insert at the very top of the header
        header.insertBefore(banner, header.firstChild);
        
        updateProminentRevenue();
    }

    window.refreshProminentRevenue = updateProminentRevenue;

    // Start injection
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHeaderRevenue);
    } else {
        injectHeaderRevenue();
    }

    // Monitor for changes (some SPA routers replace the header)
    setInterval(injectHeaderRevenue, 5000);
    setInterval(updateProminentRevenue, 60000);

})();
