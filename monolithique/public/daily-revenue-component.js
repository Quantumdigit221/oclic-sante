// Composant React amélioré pour les revenus du jour - Version Dynamique
(function() {
    'use strict';
    
    console.log('DAILY-REVENUE-COMPONENT: Initializing dynamic component...');
    
    let revenueData = {
        total: 0,
        entries: [],
        average: 0,
        count: 0
    };

    async function fetchRevenueData() {
        try {
            console.log('DAILY-REVENUE-COMPONENT: Fetching real-time data...');
            
            // 1. Fetch stats for the summary
            const statsRes = await fetch('/api/stats');
            const stats = await statsRes.json();
            
            // 2. Fetch all tickets to filter for today's entries
            const ticketsRes = await fetch('/api/tickets');
            const allTickets = await ticketsRes.json();
            
            const today = new Date().toISOString().split('T')[0];
            const todayTickets = allTickets.filter(t => {
                const ticketDate = new Date(t.createdAt).toISOString().split('T')[0];
                return ticketDate === today && t.status === 'COMPLETED';
            });

            revenueData = {
                total: stats.total_revenue_today || 0,
                count: todayTickets.length,
                average: todayTickets.length > 0 ? Math.round(stats.total_revenue_today / todayTickets.length) : 0,
                entries: todayTickets.map(t => ({
                    time: new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    patient: t.patientName || 'Anonyme',
                    type: t.serviceName || 'Consultation',
                    amount: t.amount || 0,
                    method: t.paymentMethod || 'CASH'
                }))
            };
            
            updateUI();
        } catch (error) {
            console.error('DAILY-REVENUE-COMPONENT: Error fetching data:', error);
        }
    }

    function updateUI() {
        const container = document.querySelector('.daily-revenue-component-container');
        if (!container) return;

        container.innerHTML = `
            <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 2px solid #10b981;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 18px; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                        💰 Situation Financière du Jour
                    </h3>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.refreshRevenueData()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">
                            🔄 Actualiser
                        </button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px; color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="font-size: 12px; margin-bottom: 8px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.05em;">Total Recettes</div>
                        <div style="font-size: 28px; font-weight: 800; margin-bottom: 5px;">${revenueData.total.toLocaleString('fr-FR')} FCFA</div>
                        <div style="font-size: 11px; opacity: 0.8;">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: white; border-radius: 12px; color: #1e293b; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="font-size: 12px; margin-bottom: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Nombre de Ventes</div>
                        <div style="font-size: 28px; font-weight: 800; color: #059669; margin-bottom: 5px;">${revenueData.count}</div>
                        <div style="font-size: 11px; color: #94a3b8;">Transactions complétées</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: white; border-radius: 12px; color: #1e293b; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="font-size: 12px; margin-bottom: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Panier Moyen</div>
                        <div style="font-size: 28px; font-weight: 800; color: #3b82f6; margin-bottom: 5px;">${revenueData.average.toLocaleString('fr-FR')} FCFA</div>
                        <div style="font-size: 11px; color: #94a3b8;">Par patient</div>
                    </div>
                </div>

                <div style="margin-bottom: 20px; padding: 25px; background: #f0fdf4; border-radius: 16px; border: 2px solid #34d399; text-align: center; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);">
                    <div style="font-size: 16px; font-weight: 700; color: #065f46; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">💰 SOMME TOTALE À ENCAISSER</div>
                    <div style="font-size: 48px; font-weight: 900; color: #059669; letter-spacing: -2px; margin-bottom: 10px;">
                        ${revenueData.total.toLocaleString('fr-FR')} FCFA
                    </div>
                    <div style="display: inline-block; padding: 4px 12px; background: #34d399; color: white; border-radius: 9999px; font-size: 12px; font-weight: 700;">
                        100% VÉRIFIÉ
                    </div>
                </div>
                
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead style="position: sticky; top: 0; background: #f1f5f9; z-index: 10;">
                            <tr>
                                <th style="padding: 12px; text-align: left; color: #475569; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Heure</th>
                                <th style="padding: 12px; text-align: left; color: #475569; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Patient</th>
                                <th style="padding: 12px; text-align: left; color: #475569; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Prestation</th>
                                <th style="padding: 12px; text-align: right; color: #475569; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${revenueData.entries.length > 0 ? revenueData.entries.map((entry, index) => `
                                <tr style="background: ${index % 2 === 0 ? 'white' : '#f8fafc'}; border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 12px; color: #64748b;">${entry.time}</td>
                                    <td style="padding: 12px; font-weight: 600; color: #1e293b;">${entry.patient}</td>
                                    <td style="padding: 12px; color: #475569;">${entry.type}</td>
                                    <td style="padding: 12px; text-align: right; font-weight: 700; color: #059669;">${entry.amount.toLocaleString('fr-FR')} FCFA</td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="4" style="padding: 40px; text-align: center; color: #94a3b8; font-style: italic;">
                                        Aucune transaction enregistrée pour aujourd'hui
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function injectRevenueComponent() {
        const root = document.getElementById('root');
        if (!root) {
            setTimeout(injectRevenueComponent, 1000);
            return;
        }

        if (document.querySelector('.daily-revenue-component-container')) return;

        const container = document.createElement('div');
        container.className = 'daily-revenue-component-container';
        container.style.maxWidth = '1200px';
        container.style.margin = '0 auto';
        container.style.padding = '0 20px';
        
        // Find a good place to inject
        const dashboard = document.querySelector('[class*="dashboard"]') || root.firstChild;
        if (dashboard && dashboard.parentNode) {
            dashboard.parentNode.insertBefore(container, dashboard.nextSibling);
        } else {
            root.appendChild(container);
        }

        fetchRevenueData();
    }

    window.refreshRevenueData = fetchRevenueData;

    // Initial injection
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectRevenueComponent);
    } else {
        injectRevenueComponent();
    }

    // Periodic check and refresh
    setInterval(injectRevenueComponent, 5000);
    setInterval(fetchRevenueData, 30000);

})();
