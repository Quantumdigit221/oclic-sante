// Interface O'CLIC SANTE - Version Restaurée Classique
(function() {
    'use strict';
    
    console.log('RESTORING: Classic interface...');
    
    // --- STATE ---
    let ticketsData = [];
    let selectedTicket = null;
    let activeTab = 'clinical';
    let centerInfo = {
        name: "O'CLIC SANTE",
        address: "102 Mermoz, Dakar",
        phone: "+221 33 000 00 00",
        email: "contact@sante.sn"
    };
    let stats = { patientsToday: 0, revenueToday: 0, waiting: 0, critical: 0 };

    // --- DATA ---
    const fetchData = async () => {
        try {
            const [tRes, sRes, cRes] = await Promise.all([
                fetch('/api/tickets?centerId=center-1'),
                fetch('/api/stats'),
                fetch('/api/center')
            ]);
            
            const tData = await tRes.json();
            ticketsData = Array.isArray(tData) ? tData : (tData.tickets || []);
            
            const sData = await sRes.json();
            stats = {
                patientsToday: sData.dailyPatients?.value || 0,
                revenueToday: sData.dailyRevenue?.value || 0,
                waiting: sData.waitingRoom?.value || 0,
                critical: sData.criticalStock?.value || 0
            };

            const cData = await cRes.json();
            if (cData && cData.name) centerInfo = cData;

            renderInterface();
        } catch (e) { console.error('Erreur chargement:', e); }
    };

    // --- UI HELPERS ---
    function getStatusBadge(status) {
        if (status === 'COMPLETED' || status === 'completed') return '<span style="background:#dcfce7; color:#166534; padding:4px 8px; border-radius:4px; font-size:12px;">✅ Terminé</span>';
        if (status === 'WAITING' || status === 'waiting') return '<span style="background:#fef3c7; color:#92400e; padding:4px 8px; border-radius:4px; font-size:12px;">⏱ Attente</span>';
        return '<span style="background:#dbeafe; color:#1e40af; padding:4px 8px; border-radius:4px; font-size:12px;">⚡ En cours</span>';
    }

    // --- RENDER ---
    function renderInterface() {
        const root = document.getElementById('root');
        if (!root) return;

        root.innerHTML = `
            <div style="display: flex; height: 100vh; font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9;">
                <!-- Sidebar -->
                <aside style="width: 260px; background: #1e293b; color: white; display:flex; flex-direction:column; box-shadow: 2px 0 10px rgba(0,0,0,0.1);">
                    <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display:flex; align-items:center; gap:10px;">
                        <span style="font-size:24px;">🏥</span>
                        <h1 style="margin:0; font-size:18px;">O'CLIC SANTE</h1>
                    </div>
                    <nav style="flex:1; padding:20px 0;">
                        <div style="padding:12px 25px; background:rgba(255,255,255,0.1); border-left:4px solid #14b8a6; color:white; cursor:pointer; display:flex; align-items:center; gap:10px;">
                            <span>📋</span> Consultations
                        </div>
                        <div style="padding:12px 25px; color:#94a3b8; cursor:pointer;" onclick="alert('Module Pharmacie bientôt disponible')">💊 Pharmacie</div>
                        <div style="padding:12px 25px; color:#94a3b8; cursor:pointer;" onclick="alert('Module Laboratoire bientôt disponible')">🔬 Laboratoire</div>
                        <div style="padding:12px 25px; color:#94a3b8; cursor:pointer;" onclick="alert('Module Patients bientôt disponible')">👥 Patients</div>
                    </nav>
                    <div style="padding:20px; border-top: 1px solid rgba(255,255,255,0.1); font-size:12px; color:#94a3b8;">
                        Connecté: Administrateur
                    </div>
                </aside>

                <!-- Main Content -->
                <main style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
                    <!-- Header with Stats -->
                    <header style="background:white; padding:15px 30px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h2 style="margin:0; font-size:22px; color:#1e293b;">Gestion des Consultations</h2>
                            <div style="display:flex; gap:20px; margin-top:5px; font-size:13px;">
                                <span style="color:#3b82f6;"><strong>Patients:</strong> ${stats.patientsToday}</span>
                                <span style="color:#10b981;"><strong>Revenus:</strong> ${stats.revenueToday} FCFA</span>
                                <span style="color:#f59e0b;"><strong>Attente:</strong> ${stats.waiting}</span>
                                <span style="color:#ef4444;"><strong>Stock Crit.:</strong> ${stats.critical}</span>
                            </div>
                        </div>
                        <button onclick="window.location.reload()" style="background:#14b8a6; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">
                            🔄 Actualiser
                        </button>
                    </header>

                    <!-- Content Layout -->
                    <div style="flex:1; display:flex; overflow:hidden;">
                        <!-- Tickets List -->
                        <section style="width:380px; background:white; border-right:1px solid #e2e8f0; overflow-y:auto; padding:20px;">
                            <h3 style="margin:0 0 15px 0; font-size:16px; color:#64748b;">File d'attente</h3>
                            ${ticketsData.map(t => `
                                <div onclick="window.selectTicket('${t.id}')" style="padding:15px; border:1px solid ${selectedTicket === t.id ? '#14b8a6' : '#e2e8f0'}; border-radius:8px; margin-bottom:10px; cursor:pointer; transition:all 0.2s; background:${selectedTicket === t.id ? '#f0fdf4' : 'white'};">
                                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:5px;">
                                        <div style="font-weight:bold; color:#1e293b;">#${t.ticketNumber || t.id.slice(-6)}</div>
                                        ${getStatusBadge(t.status)}
                                    </div>
                                    <div style="font-size:14px; color:#475569;">${t.patientName}</div>
                                    <div style="font-size:12px; color:#94a3b8; margin-top:5px; display:flex; justify-content:space-between;">
                                        <span>${t.serviceName || 'Consultation'}</span>
                                        <div style="display:flex; gap:5px;">
                                            <button onclick="event.stopPropagation(); window.printDoc('ticket', '${t.id}')" style="background:#f1f5f9; border:none; padding:2px 5px; border-radius:3px; font-size:10px; cursor:pointer;">🎫 Ticket</button>
                                        </div>
                                    </div>
                                </div>
                            `).join('') || '<div style="color:#94a3b8; text-align:center; padding:20px;">Aucun ticket</div>'}
                        </section>

                        <!-- Details Panel -->
                        <section id="details-panel" style="flex:1; padding:30px; overflow-y:auto; background:#f8fafc;">
                            ${renderDetails()}
                        </section>
                    </div>
                </main>
            </div>
        `;
    }

    function renderDetails() {
        if (!selectedTicket) {
            return `
                <div style="height:100%; display:flex; align-items:center; justify-content:center; color:#94a3b8; flex-direction:column;">
                    <div style="font-size:64px; margin-bottom:20px;">📋</div>
                    <h3>Sélectionnez un ticket pour voir les détails</h3>
                </div>
            `;
        }

        const ticket = ticketsData.find(t => t.id === selectedTicket);
        if (!ticket) return '';

        return `
            <div style="background:white; padding:25px; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #f1f5f9; padding-bottom:15px; margin-bottom:20px;">
                    <div>
                        <h2 style="margin:0; color:#1e293b;">Dossier Patient - #${ticket.ticketNumber || ticket.id.slice(-6)}</h2>
                        <p style="margin:5px 0 0 0; color:#64748b;">${ticket.patientName} • ${ticket.patientAge || '35'} ans • ${ticket.patientGender || 'M'}</p>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="window.printDoc('ordonnance', '${ticket.id}')" style="background:#14b8a6; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">📝 Ordonnance</button>
                        <button onclick="window.printDoc('examen', '${ticket.id}')" style="background:#3b82f6; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">🔬 Examen</button>
                    </div>
                </div>

                <div style="display:flex; border-bottom:1px solid #e2e8f0; margin-bottom:20px;">
                    <button onclick="window.setTab('clinical')" style="padding:10px 20px; border:none; background:${activeTab === 'clinical' ? '#f0fdf4' : 'transparent'}; border-bottom:${activeTab === 'clinical' ? '3px solid #14b8a6' : 'none'}; cursor:pointer; font-weight:bold;">Examen Clinique</button>
                    <button onclick="window.setTab('diagnosis')" style="padding:10px 20px; border:none; background:${activeTab === 'diagnosis' ? '#f0fdf4' : 'transparent'}; border-bottom:${activeTab === 'diagnosis' ? '3px solid #14b8a6' : 'none'}; cursor:pointer; font-weight:bold;">Diagnostic</button>
                </div>

                <div style="padding:15px; background:#f8fafc; border-radius:8px;">
                    ${activeTab === 'clinical' ? `
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                            <div><strong>Température:</strong> 37°C</div>
                            <div><strong>Tension:</strong> 120/80</div>
                            <div><strong>Poids:</strong> 75kg</div>
                            <div><strong>Symptômes:</strong> Douleurs abdominales, fièvre légère</div>
                        </div>
                    ` : `
                        <div>
                            <strong>Diagnostic:</strong> Gastro-entérite virale<br><br>
                            <strong>Notes:</strong> Patient stable, hydratation recommandée.
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    // --- GLOBALS ---
    window.selectTicket = function(id) {
        selectedTicket = id;
        renderInterface();
    };

    window.setTab = function(tab) {
        activeTab = tab;
        renderInterface();
    };

    window.printDoc = function(type, id) {
        const ticket = ticketsData.find(t => t.id === id);
        if (!ticket) return;

        console.log(`Impression ${type} pour ${ticket.patientName}`);
        
        const printWindow = window.open('', '_blank');
        let content = `
            <html><head><title>Impression ${type}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
                .header { text-align: center; border-bottom: 2px solid #000; margin-bottom: 30px; padding-bottom: 20px; }
                .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 40px; text-decoration: underline; }
                .info { margin-bottom: 30px; }
                .footer { margin-top: 100px; text-align: right; }
            </style></head><body>
            <div class="header">
                <h1>${centerInfo.name}</h1>
                <p>${centerInfo.address}</p>
                <p>Tél: ${centerInfo.phone}</p>
            </div>
            <div class="title">${type.toUpperCase()}</div>
            <div class="info">
                <p><strong>Patient:</strong> ${ticket.patientName}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>N° Ticket:</strong> ${ticket.ticketNumber || ticket.id}</p>
            </div>
            <div style="min-height:300px;">
                <p><strong>Contenu de la consultation :</strong></p>
                <p>${type === 'ordonnance' ? '1. Paracétamol 500mg (3x/jour)\\n2. Spasfon (si douleur)' : '1. NFS\\n2. Glycémie'}</p>
            </div>
            <div class="footer">
                <p>Cachet et Signature</p>
                <br><br>
                <p>Dr. Administrateur</p>
            </div>
            <script>window.print(); setTimeout(() => window.close(), 500);</script>
            </body></html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
    };

    // --- INIT ---
    fetchData();
    setInterval(fetchData, 60000); // Sync every minute

})();
