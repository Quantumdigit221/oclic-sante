(function() {
    console.log("🛡️ [RESCUE] Système de secours Rendez-vous activé.");
    
    let rescueTriggered = false;

    function log(msg, data) {
        console.log(`[RESCUE] ${msg}`, data || '');
        if (!window.__RESCUE_LOGS) window.__RESCUE_LOGS = [];
        window.__RESCUE_LOGS.push({ time: new Date().toLocaleTimeString(), msg, data });
    }

    async function tryRescue() {
        if (rescueTriggered) return;
        const hash = window.location.hash;
        if (!hash.includes('appointments')) return;

        const root = document.getElementById('root');
        // Si le root est vide ou ne contient que le spinner après 5 secondes
        const isEmpty = !root || root.innerHTML.trim() === '' || root.innerHTML.includes('animate-spin');
        
        if (isEmpty) {
            log("⚠️ Détection d'un échec de rendu React. Lancement du mode secours...");
            rescueTriggered = true;
            
            // Créer un conteneur forcé
            let rescueDiv = document.getElementById('rescue-appointments-container');
            if (!rescueDiv) {
                rescueDiv = document.createElement('div');
                rescueDiv.id = 'rescue-appointments-container';
                rescueDiv.style.cssText = "position:fixed; inset:0; background:#f8fafc; z-index:9999; overflow-y:auto; padding:20px; font-family:sans-serif;";
                document.body.appendChild(rescueDiv);
            }

            rescueDiv.innerHTML = `
                <div style="max-width:800px; margin:0 auto; background:white; padding:30px; border-radius:12px; shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);">
                    <h1 style="color:#1e293b; font-size:24px; margin-bottom:10px;">📅 Mode Secours : Rendez-vous</h1>
                    <p style="color:#64748b; margin-bottom:20px;">Le module principal a un problème de chargement. Voici vos données en mode direct :</p>
                    <div id="rescue-list">Chargement des données...</div>
                    <button onclick="location.reload()" style="margin-top:20px; padding:10px 20px; background:#14b8a6; color:white; border:none; border-radius:6px; cursor:pointer;">🔄 Réessayer</button>
                    <button onclick="document.getElementById('rescue-appointments-container').style.display='none'" style="margin-top:20px; margin-left:10px; padding:10px 20px; background:#e2e8f0; color:#475569; border:none; border-radius:6px; cursor:pointer;">Fermer</button>
                </div>
            `;

            try {
                const token = localStorage.getItem('oclic_sante_jwt_token') || localStorage.getItem('token');
                const centerId = localStorage.getItem('oclic_sante_center_id') || 'center-001';
                const r = await fetch('/api/appointments', {
                    headers: { 'Authorization': 'Bearer ' + token, 'x-tenant-id': centerId }
                });
                const data = await r.json();
                
                const listDiv = document.getElementById('rescue-list');
                if (Array.isArray(data) && data.length > 0) {
                    listDiv.innerHTML = data.map(a => `
                        <div style="border-bottom:1px solid #f1f5f9; padding:15px 0;">
                            <div style="font-weight:bold; color:#0f172a;">${a.patientName}</div>
                            <div style="font-size:14px; color:#64748b;">${a.appointmentDate} à ${a.appointmentTime} - ${a.serviceName}</div>
                            <div style="font-size:12px; margin-top:4px;"><span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:10px;">${a.status}</span></div>
                        </div>
                    `).join('');
                } else {
                    listDiv.innerHTML = "<p>Aucun rendez-vous trouvé.</p>";
                }
            } catch (err) {
                document.getElementById('rescue-list').innerHTML = "❌ Erreur API: " + err.message;
            }
        }
    }

    // Surveiller
    setInterval(tryRescue, 4000);
    window.addEventListener('hashchange', () => { rescueTriggered = false; setTimeout(tryRescue, 2000); });
})();
