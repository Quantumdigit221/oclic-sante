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
    const formatNumber = (val) => Number(val || 0).toLocaleString('fr-FR');

    const DASHBOARD_KPI = [
        {
            labels: ["patients aujourd'hui", 'patients du jour'],
            pick: (d) => d.dailyPatients?.value ?? d.total_patients_today ?? 0,
            format: formatNumber
        },
        {
            labels: ['revenus du jour', 'ca du jour'],
            pick: (d) => d.dailyRevenue?.value ?? d.total_revenue_today ?? 0,
            format: formatCurrency
        },
        {
            labels: ["en salle d'attente", 'salle d attente'],
            pick: (d) => d.waitingRoom?.value ?? d.waiting_today ?? 0,
            format: formatNumber
        },
        {
            labels: ['stock critique', 'stock alerte'],
            pick: (d) => d.criticalStock?.value ?? d.stock_alert ?? 0,
            format: formatNumber
        }
    ];

    function normalizeLabel(text) {
        return (text || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    function isDashboardRoute() {
        const hash = window.location.hash || '#/';
        return hash === '#/' || hash === '#' || hash.endsWith('/');
    }

    let dashboardStatsCache = null;
    let dashboardFetchInFlight = null;

    function fetchDashboardStats(force) {
        if (!force && dashboardStatsCache) return Promise.resolve(dashboardStatsCache);
        if (dashboardFetchInFlight) return dashboardFetchInFlight;
        dashboardFetchInFlight = fetch('/api/stats?_=' + Date.now(), { cache: 'no-store' })
            .then((r) => r.json())
            .then((data) => {
                dashboardStatsCache = data;
                dashboardFetchInFlight = null;
                return data;
            })
            .catch((err) => {
                dashboardFetchInFlight = null;
                console.warn('DASHBOARD-FIXER: stats fetch failed', err);
                return dashboardStatsCache || {};
            });
        return dashboardFetchInFlight;
    }

    function findKpiValueElement(card) {
        const candidates = Array.from(card.querySelectorAll('p, div, span, h3, h4'))
            .filter((el) => el.children.length === 0);
        return candidates.find((el) => {
            const t = el.innerText.trim();
            return t.includes('FCFA') || /^\d[\d\s.,]*$/.test(t);
        }) || candidates[candidates.length - 1];
    }

    function applyDashboardStats(data) {
        if (!data) return;
        const titles = document.querySelectorAll('p, span, h3, h4, div');
        titles.forEach((titleEl) => {
            const label = normalizeLabel(titleEl.innerText);
            const kpi = DASHBOARD_KPI.find((k) => k.labels.some((l) => label === l));
            if (!kpi) return;
            const card = titleEl.closest('.rounded-xl, .bg-white, .p-4, .p-6, .shadow-sm');
            if (!card) return;
            const valueEl = findKpiValueElement(card);
            if (!valueEl) return;
            const next = kpi.format(kpi.pick(data));
            if (valueEl.innerText.trim() !== next) {
                valueEl.innerText = next;
                valueEl.dataset.oclicSynced = 'true';
            }
            if (kpi.format === formatCurrency) {
                valueEl.style.color = '#059669';
                valueEl.style.fontWeight = '800';
            }
        });

        const badRevenuePattern = /\d+\.00\d{3,}/;
        document.querySelectorAll('p, div, span').forEach((el) => {
            if (el.children.length === 0 && (el.innerText.includes('02000.002000') || badRevenuePattern.test(el.innerText))) {
                el.innerText = formatCurrency(data.dailyRevenue?.value ?? data.total_revenue_today ?? 0);
            }
        });
    }

    function fixDashboard(force) {
        if (!isDashboardRoute()) return;
        fetchDashboardStats(force).then(applyDashboardStats);
    }

    function invalidateDashboardStats() {
        dashboardStatsCache = null;
        fixDashboard(true);
    }

    async function cancelSaleById(saleId) {
        const res = await fetch('/api/sales/' + encodeURIComponent(saleId) + '/cancel', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Annulation impossible');
        }
        return res.json();
    }

    function setupSaleCancelUi() {
        const injectButtons = () => {
            document.querySelectorAll('table tbody tr').forEach((row) => {
                if (row.querySelector('[data-oclic-cancel-sale]')) return;
                const cells = row.querySelectorAll('td');
                if (cells.length < 8) return;
                const typeText = (cells[3]?.innerText || '').trim().toUpperCase();
                if (typeText !== 'VENTE') return;
                const saleId = (cells[8]?.innerText || '').trim();
                if (!saleId || saleId === '-') return;
                const actionCell = cells[cells.length - 1];
                if (!actionCell) return;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.dataset.oclicCancelSale = saleId;
                btn.className = 'ml-2 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded';
                btn.textContent = 'Annuler vente';
                btn.onclick = async (ev) => {
                    ev.stopPropagation();
                    if (!window.confirm('Annuler cette vente ? Le revenu du tableau de bord sera mis à jour.')) return;
                    btn.disabled = true;
                    try {
                        await cancelSaleById(saleId);
                        invalidateDashboardStats();
                        window.dispatchEvent(new CustomEvent('oclic:sale-cancelled', { detail: { saleId } }));
                        if (window.location.hash.includes('pharmacy')) {
                            window.location.reload();
                        } else {
                            row.remove();
                        }
                    } catch (e) {
                        alert(e.message || 'Erreur lors de l\'annulation');
                        btn.disabled = false;
                    }
                };
                actionCell.appendChild(btn);
            });
        };

        const observer = new MutationObserver(() => injectButtons());
        observer.observe(document.body, { childList: true, subtree: true });
        injectButtons();
    }

    function setupDashboardFetchHook() {
        const nativeFetch = window.fetch;
        window.fetch = async function patchedFetch(url, options) {
            const response = await nativeFetch.apply(this, arguments);
            try {
                const urlStr = typeof url === 'string' ? url : (url?.url || '');
                const method = (options?.method || 'GET').toUpperCase();
                if (response.ok && urlStr.includes('/api/sales') && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
                    invalidateDashboardStats();
                    window.dispatchEvent(new CustomEvent('oclic:data-changed', { detail: { url: urlStr, method } }));
                }
            } catch (e) {
                console.warn('DASHBOARD-FIXER: fetch hook', e);
            }
            return response;
        };
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
            </body>
            </html>
        `;
    }

    // --- TICKET REPAIR PROTECTOR (Fixes the "0 FCFA" and double FCFA on Receipts) ---
    function setupTicketFixer() {
        const originalPrint = window.print;

        function getClinicName(fallbackFromDom) {
            try {
                const raw = localStorage.getItem('currentCenter');
                if (raw) {
                    const center = JSON.parse(raw);
                    if (center && (center.name || center.centerName)) {
                        return center.name || center.centerName;
                    }
                }
            } catch (e) { /* ignore */ }
            return fallbackFromDom || "O'CLIC SANTE";
        }

        function extractTicketFromArea(area) {
            const fullText = area.innerText || '';

            const sanitizeAmount = (txt) => {
                if (!txt) return '0 F';
                const val = String(txt).replace(/F\s*CFA|FCFA|F\b/gi, '').replace(/[\s\u00A0]/g, '').replace(/,/g, '').trim();
                const num = parseFloat(val) || 0;
                return num.toLocaleString('fr-FR') + ' F';
            };

            const domCenterName =
                area.querySelector('.font-black.text-xl')?.innerText?.trim() ||
                area.querySelector('.font-bold.text-lg')?.innerText?.trim() ||
                area.querySelector('.font-bold.text-sm.uppercase')?.innerText?.trim();
            const centerName = getClinicName(domCenterName);

            let dateStr = '';
            const dateRegex = fullText.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2})/);
            if (dateRegex) {
                dateStr = dateRegex[1];
            } else {
                const dateLine = Array.from(area.querySelectorAll('span, div'))
                    .map(el => el.innerText.trim())
                    .find(t => /^DATE\s*:/i.test(t));
                if (dateLine) {
                    dateStr = dateLine.replace(/^DATE\s*:\s*/i, '').trim();
                }
            }
            if (!dateStr) {
                dateStr = new Date().toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
            }

            let patientName = 'Anonyme';
            const patientHeader = Array.from(area.querySelectorAll('*'))
                .find(el => /^PATIENT\s*:?$/i.test((el.innerText || '').trim()));
            if (patientHeader) {
                const block = patientHeader.closest('div')?.parentElement || patientHeader.parentElement;
                const nameEl = block?.querySelector('.font-bold, .font-black');
                if (nameEl) {
                    const candidate = nameEl.innerText.trim().split('\n')[0];
                    if (candidate && !/^PATIENT$/i.test(candidate)) patientName = candidate;
                }
            }
            if (patientName === 'Anonyme') {
                const alt = area.querySelector('.text-lg.font-black') ||
                    area.querySelector('.font-bold.text-black:not(.uppercase)');
                if (alt) patientName = alt.innerText.trim().split('\n')[0];
            }

            const skipRow = (txt) => /TOTAL|PAIEMENT|PATIENT|SIGNATURE|SOUS-TOTAL|MÉDECIN|ASSURANCE|NET À|DATE\s*:|TEL|RNIS|NUMÉRO|REF\s*:|MODE DE|Merci|Conservez|Propulsé|Cachet|Bon rétablissement/i.test(txt);

            const services = [];
            Array.from(area.querySelectorAll('div[class*="justify-between"], div.flex.justify-between')).forEach(row => {
                const rowText = row.innerText || '';
                if (skipRow(rowText)) return;
                const spans = row.querySelectorAll('span');
                if (spans.length >= 2) {
                    const name = spans[0].innerText.trim();
                    const price = sanitizeAmount(spans[spans.length - 1].innerText);
                    if (name && name.length < 120 && !skipRow(name)) {
                        services.push({ name, price });
                    }
                } else if (spans.length === 1) {
                    const name = spans[0].innerText.trim();
                    if (name && name.length < 120 && !skipRow(name)) {
                        services.push({ name, price: '' });
                    }
                }
            });

            let totalDue = '';
            let totalPaid = '';
            const dueMatch = fullText.match(/TOTAL\s*À\s*PAYER\s*:?\s*([\d\s.,]+)/i);
            const paidMatch = fullText.match(/MONTANT\s*PAYÉ\s*:?\s*([\d\s.,]+)/i);
            const netMatch = fullText.match(/NET\s*À\s*PAYER\s*(?:\(PATIENT\))?\s*:?\s*([\d\s.,]+)/i);
            const simpleTotal = fullText.match(/(?:^|\n)\s*TOTAL\s+([\d\s.,]+)\s*F/i);

            if (dueMatch) totalDue = sanitizeAmount(dueMatch[1]);
            else if (netMatch) totalDue = sanitizeAmount(netMatch[1]);
            else if (simpleTotal) totalDue = sanitizeAmount(simpleTotal[1]);

            if (paidMatch) totalPaid = sanitizeAmount(paidMatch[1]);
            else totalPaid = totalDue || sanitizeAmount('0');

            if (!totalDue) totalDue = totalPaid;

            return { centerName, dateStr, patientName, services, totalDue, totalPaid };
        }

        function buildTicketPrintHtml(data) {
            const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const servicesHTML = data.services.length > 0
                ? data.services.map(s => `
                    <div class="svc-row">
                      <span class="svc-name">${esc(s.name)}</span>
                      <span class="svc-price">${esc(s.price)}</span>
                    </div>`).join('')
                : '<div class="svc-row muted"><span class="svc-name">—</span></div>';

            return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Ticket</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  html, body { margin: 0; padding: 0; height: auto; overflow: visible; }
  body {
    font-family: 'Courier New', Courier, monospace;
    color: #000;
    width: 72mm;
    padding: 3mm;
    box-sizing: border-box;
  }
  * { page-break-before: avoid !important; page-break-after: avoid !important; page-break-inside: avoid !important; }
  .hdr { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
  .hdr h1 { font-size: 15px; font-weight: 900; margin: 0; text-transform: uppercase; }
  .blk { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
  .lbl { font-size: 9px; font-weight: bold; margin-bottom: 3px; text-transform: uppercase; }
  .val { font-size: 13px; font-weight: bold; }
  .svc-row { display: flex; justify-content: space-between; gap: 6px; margin-bottom: 5px; font-size: 11px; }
  .svc-name { flex: 1; font-weight: bold; }
  .svc-price { white-space: nowrap; font-weight: bold; }
  .muted { color: #555; }
  .total-row { border-top: 1px dashed #000; padding-top: 6px; margin-top: 4px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; }
  .total-row.main { border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; font-size: 12px; }
  .total-amt { font-size: 14px; font-weight: 900; }
</style>
</head><body>
  <div class="hdr"><h1>${esc(data.centerName)}</h1></div>
  <div class="blk"><div class="lbl">Date</div><div class="val">${esc(data.dateStr)}</div></div>
  <div class="blk"><div class="lbl">Patient</div><div class="val">${esc(data.patientName)}</div></div>
  <div class="blk" style="border-bottom:none"><div class="lbl">Services</div>${servicesHTML}</div>
  <div class="total-row"><span>TOTAL À PAYER</span><span class="total-amt">${esc(data.totalDue)}</span></div>
  <div class="total-row main"><span>TOTAL PAYÉ</span><span class="total-amt">${esc(data.totalPaid)}</span></div>
</body></html>`;
        }

        window.print = function() {
            const printAreas = document.querySelectorAll('#print-area, #receipt-print-area, .print-area, .ticket-print, #ticket-print');
            if (printAreas.length === 0) {
                originalPrint.call(window);
                return;
            }

            let area = null;
            for (const a of printAreas) {
                const r = a.getBoundingClientRect();
                if (r.width > 0 && r.height > 0 && a.innerText.trim().length > 10) {
                    area = a;
                    break;
                }
            }
            if (!area) {
                originalPrint.call(window);
                return;
            }

            const data = extractTicketFromArea(area);
            const html = buildTicketPrintHtml(data);
            const printWin = window.open('', '_blank', 'width=420,height=640');

            if (!printWin) {
                document.body.classList.add('oclic-ticket-printing');
                printAreas.forEach((el, i) => { el.style.display = i === 0 ? 'block' : 'none'; });
                const bodyMatch = buildTicketPrintHtml(data).match(/<body>([\s\S]*)<\/body>/i);
                area.innerHTML = bodyMatch ? bodyMatch[1] : '';
                originalPrint.call(window);
                document.body.classList.remove('oclic-ticket-printing');
                printAreas.forEach(el => { el.style.display = ''; });
                return;
            }

            printWin.document.open();
            printWin.document.write(html);
            printWin.document.close();
            printWin.focus();
            setTimeout(() => {
                printWin.print();
                setTimeout(() => printWin.close(), 600);
            }, 300);
        };
    }

    function init() {
        setupDashboardFetchHook();
        setupSaleCancelUi();
        fixDashboard(true);
        setupPrintHijack();
        setupTicketFixer();
        setInterval(() => fixDashboard(false), 2000);
        window.addEventListener('hashchange', () => fixDashboard(true));
        window.addEventListener('oclic:sale-cancelled', () => invalidateDashboardStats());
        window.addEventListener('oclic:data-changed', () => invalidateDashboardStats());
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
