(function() {
    'use strict';
    
    console.log('O-CLIC-SANTE-FIXER v2.3: Session Rescue & Fixes Active...');

    // --- SESSION RESCUER (Fixes White Page on /settings) ---
    function rescueSession() {
        // If we are on a settings page and it's blank (React crashed because of null currentCenter)
        // or if currentCenter is simply missing from localStorage.
        const savedUser = localStorage.getItem('currentUser');
        const savedCenter = localStorage.getItem('currentCenter');
        console.log('SESSION-RESCUER: currentCenter is', savedCenter);
        
        // Log tickets count if found
        try {
            const tickets = localStorage.getItem('tickets');
            if (tickets) console.log('SESSION-RESCUER: localStorage tickets count:', JSON.parse(tickets).length);
        } catch(e) {}
        const isAuthPage = window.location.hash.includes('/auth') || !savedUser;

        if (savedUser && !isAuthPage) {
            // AUTO-UPGRADE: Si on a l'ancien ID 'center-1', on bascule vers 'center-001'
            if (savedCenter && savedCenter.includes('center-1')) {
                console.warn('SESSION-RESCUER: Old center ID detected. Upgrading to center-001...');
                localStorage.removeItem('currentCenter');
                // No reload needed here, let the next block handle the fetch if it's missing
            }

            if (!savedCenter || savedCenter === 'null' || savedCenter === '{}' || savedCenter === 'undefined' || (savedCenter && savedCenter.includes('center-1'))) {
                console.warn('SESSION-RESCUER: currentCenter is missing or invalid! Attempting rescue...');
                
                fetch('/api/center')
                    .then(r => r.json())
                    .then(center => {
                        if (center && (center.name || center.id)) {
                            if (!center.id) center.id = 'center-001';
                            localStorage.setItem('currentCenter', JSON.stringify(center));
                            console.log('SESSION-RESCUER: center restored. Refreshing page...');
                            window.location.reload();
                        }
                    })
                    .catch(err => console.error('SESSION-RESCUER: Failed to fetch center', err));
            }
        }
    }

    // Run rescue immediately
    rescueSession();

    // --- REVENUE & DASHBOARD FIXER ---
    const formatCurrency = (val) => Number(val || 0).toLocaleString('fr-FR') + ' FCFA';
    
    function fixDashboard() {
        const badRevenuePattern = /\d+\.00\d{3,}/; 
        const elements = document.querySelectorAll('span, div, p, h3, h4');
        elements.forEach(el => {
            if (el.innerText.includes('02000.002000') || badRevenuePattern.test(el.innerText)) {
                if (el.dataset.fixing) return;
                el.dataset.fixing = "true";
                fetch('/api/stats').then(r => r.json()).then(data => {
                    const val = data.total_revenue_today || data.dailyRevenue?.value || 0;
                    el.innerText = formatCurrency(val);
                    el.style.color = '#059669';
                    el.style.fontWeight = 'bold';
                    delete el.dataset.fixing;
                }).catch(() => { delete el.dataset.fixing; });
            }
        });
    }

    // --- PRINTING HIJACKER ---
    const safeFormatDate = (dateStr) => {
        if (!dateStr) return '---';
        try {
            return new Date(dateStr).toLocaleDateString('fr-FR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) { return dateStr; }
    };

    function setupPrintHijack() {
        document.body.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const btnText = btn.innerText.trim().toLowerCase();
            if (btnText !== 'imprimer') return;

            const card = btn.closest('.rounded-xl, .bg-blue-50, .bg-purple-50');
            if (!card) return;

            const isPrescription = card.classList.contains('bg-blue-50') || card.innerHTML.toLowerCase().includes('blue-600');
            const isExamen = card.classList.contains('bg-purple-50') || card.innerHTML.toLowerCase().includes('purple-600');
            
            if (!isPrescription && !isExamen) return;

            e.preventDefault();
            e.stopPropagation();

            try {
                const originalText = btn.innerHTML;
                btn.innerHTML = '⌛...';
                btn.disabled = true;

                const center = await fetch('/api/center').then(r => r.json());
                const dossierHeader = document.querySelector('h3.text-xl, .text-xl.font-bold');
                const patientName = dossierHeader ? dossierHeader.innerText.trim() : 'Patient';
                const allCons = await fetch(`/api/consultations?patientName=${encodeURIComponent(patientName)}`).then(r => r.json());
                
                const cardText = card.innerText;
                const cons = allCons.find(c => {
                    const d = new Date(c.createdAt);
                    return cardText.includes(d.getDate()) && cardText.includes(d.getFullYear());
                }) || allCons[0];
                
                if (!cons) {
                    alert('Consultation non trouvée.');
                    btn.innerHTML = originalText; btn.disabled = false;
                    return;
                }

                const printType = isPrescription ? 'prescription' : 'lab';
                const html = generateProfessionalHTML(cons, center, printType);
                const printWin = window.open('', '_blank');
                printWin.document.write(html);
                printWin.document.close();
                
                btn.innerHTML = originalText;
                btn.disabled = false;
            } catch (err) {
                console.error('Print Hijack Error:', err);
                btn.disabled = false;
            }
        }, true);
    }

    function generateProfessionalHTML(cons, center, type) {
        const title = type === 'prescription' ? 'ORDONNANCE MÉDICALE' : 'DEMANDE D\'EXAMENS';
        const items = Array.isArray(type === 'prescription' ? cons.prescription : cons.labOrders) 
                    ? (type === 'prescription' ? cons.prescription : cons.labOrders) 
                    : [];
        
        return `
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
                    .header { display: flex; justify-content: space-between; border-bottom: 3px solid #1e293b; padding-bottom: 15px; margin-bottom: 25px; }
                    .center-name { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; }
                    .center-sub { font-size: 13px; color: #475569; margin: 2px 0; }
                    .doc-title { text-align: center; margin: 40px 0; font-size: 20px; font-weight: 800; text-decoration: underline; color: #1e293b; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px; }
                    .info-box { font-size: 14px; }
                    .label { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .items-table th { text-align: left; background: #f1f5f9; padding: 12px; font-size: 12px; color: #475569; border-bottom: 2px solid #cbd5e1; }
                    .items-table td { padding: 15px 12px; border-bottom: 1px dashed #e2e8f0; font-size: 15px; }
                    .footer { margin-top: 80px; display: flex; justify-content: flex-end; }
                    .signature-area { text-align: center; width: 250px; }
                    .sig-line { border-top: 2px solid #0f172a; margin-top: 70px; padding-top: 10px; font-weight: bold; }
                </style>
            </head>
            <body onload="window.print(); window.close();">
                <div class="header">
                    <div>
                        <p class="center-name">${center.name || "O'CLIC SANTE"}</p>
                        <p class="center-sub">📍 ${center.address || ''}</p>
                        <p class="center-sub">📞 ${center.phone || ''}</p>
                        <p class="center-sub">✉️ ${center.email || ''}</p>
                    </div>
                    <div style="text-align: right">
                        <p style="font-weight: 800; font-size: 16px; margin: 0;">Date: ${safeFormatDate(cons.createdAt)}</p>
                        <p class="center-sub">ID: ${cons.id.substring(0,8).toUpperCase()}</p>
                    </div>
                </div>
                <div class="info-grid">
                    <div class="info-box">
                        <div class="label">Patient</div>
                        <div style="font-size: 16px; font-weight: 700;">${cons.patientName || 'Anonyme'}</div>
                        <div style="font-size: 12px; color: #64748b;">Réf: ${cons.patientId || '---'}</div>
                    </div>
                    <div class="info-box">
                        <div class="label">Médecin Traitant</div>
                        <div style="font-size: 16px; font-weight: 700;">Dr. ${cons.doctorName || '---'}</div>
                    </div>
                </div>
                <div class="doc-title">${title}</div>
                <table class="items-table">
                    <thead>
                        ${type === 'prescription' 
                            ? '<tr><th>Médicament / Traitement</th><th>Posologie</th><th>Qté</th></tr>' 
                            : '<tr><th>Analyse / Examen</th><th>Spécifications</th></tr>'}
                    </thead>
                    <tbody>
                        ${items.length > 0 ? items.map(item => {
                            if (type === 'prescription') {
                                return `<tr>
                                    <td><strong>${item.name || item.medicineName || '---'}</strong><br><small style="color:#64748b">${item.form || ''}</small></td>
                                    <td>${item.dosage || '---'}</td>
                                    <td>${item.quantity || '---'}</td>
                                </tr>`;
                            } else {
                                return `<tr>
                                    <td><strong>${item.name || item}</strong></td>
                                    <td>Analyse approfondie requise</td>
                                </tr>`;
                            }
                        }).join('') : '<tr><td colspan="3" style="text-align:center; padding: 50px;">Aucun élément</td></tr>'}
                    </tbody>
                </table>
                <div class="footer">
                    <div class="signature-area">
                        <div class="sig-line">Dr. ${cons.doctorName || ''}</div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // --- TICKET REPAIR PROTECTOR (Fixes the "0 FCFA" and double FCFA on Receipts) ---
    function setupTicketFixer() {
        const originalPrint = window.print;
        window.print = function() {
            console.log('TICKET-FIXER: Global intercept active.');
            
            // On cherche n'importe quel élément qui ressemble à une zone d'impression
            const printAreas = document.querySelectorAll('#print-area, .print-area, .ticket-print, #ticket-print');
            
            printAreas.forEach(area => {
                console.log('TICKET-FIXER: Processing an area...');
                
                // 1. Solution Radical pour le doublon monétaire (ex: "F CFA FCFA")
                const walkAndFixCurrency = (node) => {
                    if (node.nodeType === 3) { // Text node
                        const oldText = node.nodeValue;
                        // On nettoie TOUTE séquence répétitive de monnaie
                        const newText = oldText.replace(/(F\s*CFA|FCFA|F\s*CFA\s*FCFA|CFA\s*CFA)[\s\u00A0]*/gi, 'F CFA ');
                        if (oldText !== newText) node.nodeValue = newText;
                    } else {
                        node.childNodes.forEach(walkAndFixCurrency);
                    }
                };
                walkAndFixCurrency(area);

                // 2. Correction des doublets hardcodés dans l'innerHTML
                area.innerHTML = area.innerHTML.replace(/(F\s*CFA|FCFA)[\s\u00A0]+(FCFA|F\s*CFA)/gi, 'F CFA');

                // 3. Récupération du TOTAL pour corriger les "0"
                let totalFound = 0;
                const allElements = area.querySelectorAll('*');
                allElements.forEach(el => {
                    const txt = el.innerText.toUpperCase();
                    if (txt.includes('TOTAL') || txt.includes('NET A PAYER')) {
                        const match = el.innerText.match(/(\d+[\s\d]*)/);
                        if (match) {
                            const val = parseInt(match[0].replace(/\s/g, ''));
                            if (val > totalFound) totalFound = val;
                        }
                    }
                });

                if (totalFound > 0) {
                    allElements.forEach(el => {
                        if (el.children.length === 0) { 
                            const t = el.innerText.trim();
                            // Si on voit un prix à 0 alors que le total est positif, on répare
                            if (t === '0' || t === '0 F CFA' || t === '0 FCFA' || t === '0,00' || t === '0,00 F CFA') {
                                if (!el.innerText.includes(totalFound.toLocaleString())) {
                                    el.innerText = totalFound.toLocaleString('fr-FR') + ' F CFA';
                                }
                            }
                        }
                    });
                }
            });
            
            originalPrint.call(window);
        };
    }

    function init() {
        fixDashboard();
        setupPrintHijack();
        setupTicketFixer();
        setInterval(fixDashboard, 1500);
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
