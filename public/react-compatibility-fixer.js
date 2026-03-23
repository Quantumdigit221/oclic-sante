(function() {
    'use strict';
    
    // --- JWT : ajoute Authorization sur les appels /api/* (sauf login, health, verify) ---
    function extractTokenFromObject(obj) {
        if (!obj || typeof obj !== 'object') return null;
        if (typeof obj.token === 'string' && obj.token) return obj.token;
        if (typeof obj.accessToken === 'string' && obj.accessToken) return obj.accessToken;
        if (obj.user && typeof obj.user === 'object') {
            if (typeof obj.user.token === 'string' && obj.user.token) return obj.user.token;
            if (typeof obj.user.accessToken === 'string' && obj.user.accessToken) return obj.user.accessToken;
        }
        return null;
    }
    function getAuthToken() {
        try {
            var direct = localStorage.getItem('token')
                || localStorage.getItem('authToken')
                || localStorage.getItem('access_token')
                || sessionStorage.getItem('token')
                || sessionStorage.getItem('authToken');
            if (direct) return direct;

            var keys = ['currentUser', 'user', 'auth', 'session'];
            for (var i = 0; i < keys.length; i++) {
                var raw = localStorage.getItem(keys[i]) || sessionStorage.getItem(keys[i]);
                if (!raw) continue;
                try {
                    var parsed = JSON.parse(raw);
                    var token = extractTokenFromObject(parsed);
                    if (token) return token;
                } catch (e) {
                    // ignore malformed JSON
                }
            }
        } catch (e) {}
        return null;
    }
    function getInputUrl(input) {
        if (typeof input === 'string') return input;
        if (typeof URL !== 'undefined' && input instanceof URL) return input.href;
        if (typeof Request !== 'undefined' && input instanceof Request) return input.url;
        if (input && typeof input.url === 'string') return input.url;
        return '';
    }
    function apiPathNeedsAuth(urlStr) {
        try {
            var u = new URL(urlStr, window.location.origin);
            var p = u.pathname;
            if (!p.startsWith('/api')) return false;
            if (p === '/api/login') return false;
            if (p === '/api/health') return false;
            if (p === '/api/auth/verify') return false;
            return true;
        } catch (e) {
            return false;
        }
    }
    function withAuthHeaders(input, init) {
        var token = getAuthToken();
        var urlStr = getInputUrl(input);
        if (!apiPathNeedsAuth(urlStr)) return [input, init];
        if (!token) {
            return [input, init];
        }
        if (typeof input === 'string') {
            init = init && typeof init === 'object' ? init : {};
            var headers = new Headers(init.headers || {});
            if (!headers.has('Authorization')) headers.set('Authorization', 'Bearer ' + token);
            return [input, Object.assign({}, init, { headers: headers })];
        }
        if (typeof URL !== 'undefined' && input instanceof URL) {
            init = init && typeof init === 'object' ? init : {};
            var headersFromUrl = new Headers(init.headers || {});
            if (!headersFromUrl.has('Authorization')) headersFromUrl.set('Authorization', 'Bearer ' + token);
            return [input, Object.assign({}, init, { headers: headersFromUrl })];
        }
        if (typeof Request !== 'undefined' && input instanceof Request) {
            var h = new Headers(input.headers);
            if (!h.has('Authorization')) h.set('Authorization', 'Bearer ' + token);
            return [new Request(input, { headers: h }), undefined];
        }
        return [input, init];
    }

    // --- SMART FETCH (Auto-Retry on 503) ---
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
        var requestUrl = getInputUrl(input);
        var needsAuth = apiPathNeedsAuth(requestUrl);
        var tokenNow = getAuthToken();
        if (needsAuth && !tokenNow) {
            if (!window.__OCLIC_MISSING_TOKEN_REDIRECT__) {
                window.__OCLIC_MISSING_TOKEN_REDIRECT__ = true;
                try {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('authToken');
                } catch (e) {}
                if (!window.location.hash.includes('/auth')) {
                    console.warn('SESSION-RESCUER: token absent, redirection vers /auth');
                    setTimeout(function() { window.location.hash = '#/auth'; }, 50);
                }
            }
            return Promise.resolve(new Response(JSON.stringify({
                success: false,
                error: 'Token manquant',
                code: 'AUTH_REQUIRED'
            }), { status: 401, headers: { 'Content-Type': 'application/json' } }));
        }

        var w = withAuthHeaders(input, init);
        input = w[0];
        init = w[1];
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
            try {
                const response = await originalFetch(input, init);
                if (response.status === 503 && attempts < maxAttempts - 1) {
                    attempts++;
                    await new Promise(r => setTimeout(r, 1000 * attempts));
                    continue;
                }
                if (response.ok) {
                    try {
                        var urlStr = getInputUrl(input);
                        var method = (init && init.method) || (typeof Request !== 'undefined' && input instanceof Request ? input.method : 'GET');
                        if (method === 'POST' && urlStr && urlStr.indexOf('/api/login') !== -1) {
                            var data = await response.clone().json();
                            if (data && data.token && typeof data.token === 'string') {
                                localStorage.setItem('token', data.token);
                            }
                        }
                    } catch (e) {}
                }
                return response;
            } catch (err) {
                if (attempts < maxAttempts - 1) {
                   attempts++;
                   await new Promise(r => setTimeout(r, 1000 * attempts));
                   continue;
                }
                throw err;
            }
        }
    };

    console.log('O-CLIC-SANTE-FIXER v2.8: JWT fetch + Smart-Fetch actifs...');
    
    // VERIFICATION DE LA BASE DE DONNÉES (FRONTEND)
    fetch('/api/center').then(r => {
        if (r.status === 401) {
            console.warn('%cℹ️ SESSION: non authentifiée (token manquant).', 'color: #f59e0b; font-weight: bold;');
            return null;
        }
        return r.json();
    }).then(center => {
        if (center && (center.name || center.id)) {
            console.log('%c✅ BASE DE DONNÉES: CONNECTÉE (MySQL Hostinger)', 'color: #059669; font-weight: bold; font-size: 12px;');
        } else if (center !== null) {
            console.warn('%c⚠️ BASE DE DONNÉES: MODE MÉMOIRE (Non persistante)', 'color: #d97706; font-weight: bold;');
        }
    }).catch(() => {
        console.error('%c❌ BASE DE DONNÉES: ERREUR DE CONNEXION', 'color: #dc2626; font-weight: bold;');
    });

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
        // Ciblages multiples pour être sûr de trouver le bon widget
        const elements = document.querySelectorAll('.rounded-xl, .bg-white, span, div, p, h3, h4');
        
        // 1. On cherche d'abord les erreurs de format (doublons)
        const badRevenuePattern = /\d+\.00\d{3,}/; 
        elements.forEach(el => {
            if (el.innerText.includes('02000.002000') || (el.children.length === 0 && badRevenuePattern.test(el.innerText))) {
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

        // 2. On cherche le bloc "Revenus du jour" pour s'assurer qu'il n'est pas à 0 à tort
        elements.forEach(el => {
            const txt = el.innerText.trim();
            if (txt === "Revenus du jour" || txt === "CA du jour") {
                const card = el.closest('.rounded-xl, .bg-white, .p-4, .p-6');
                if (card) {
                    // On cherche le montant dans cette carte
                    const amountEl = Array.from(card.querySelectorAll('p, div, h3'))
                        .find(sub => sub.innerText.includes('FCFA') || sub.innerText.match(/^\s*\d+[\s\d]*\s*$/));
                    
                    if (amountEl && (amountEl.innerText.startsWith('0') || amountEl.innerText === '0 FCFA')) {
                        if (amountEl.dataset.fixing) return;
                        amountEl.dataset.fixing = "true";
                        fetch('/api/stats').then(r => r.json()).then(data => {
                            const val = data.total_revenue_today || data.dailyRevenue?.value || 0;
                            if (parseFloat(val) > 0) {
                                amountEl.innerText = formatCurrency(val);
                                amountEl.style.color = '#059669';
                                amountEl.style.fontWeight = '800';
                            }
                            delete amountEl.dataset.fixing;
                        }).catch(() => { delete amountEl.dataset.fixing; });
                    }
                }
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
                console.log('TICKET-FIXER: Reconstructing ticket design...');
                
                const sanitizeAmount = (txt) => {
                    if (!txt) return '0 F CFA';
                    // On retire le texte monétaire et les espaces insécables
                    const val = txt.replace(/F\s*CFA|FCFA/gi, '').replace(/[\s\u00A0]/g, '').trim();
                    const num = parseFloat(val) || 0;
                    return num.toLocaleString('fr-FR') + ' F CFA';
                };

                const centerName = area.querySelector('.font-bold.text-lg')?.innerText || 'O\'CLIC SANTE';
                const centerDetails = Array.from(area.querySelectorAll('.text-xs.text-black')).map(el => el.innerText);
                const ticketNumFull = area.querySelector('.text-2xl.font-black')?.innerText || '----';
                const ticketID = area.querySelectorAll('.text-\\[10px\\]')[0]?.innerText || '';
                const dateStr = area.querySelector('.text-xs.mt-1')?.innerText || new Date().toLocaleString();
                
                const patientName = area.querySelector('.font-bold.text-black:not(.uppercase)')?.innerText || 'Anonyme';
                const patientMeta = area.querySelector('.text-xs.text-black:nth-of-type(2)')?.innerText || '';
                const patientPhone = area.querySelector('.text-xs.text-black:nth-of-type(3)')?.innerText || '';
                
                // Extraction et nettoyage du TOTAL
                let rawTotal = area.querySelector('.text-lg.font-bold span:last-child')?.innerText || '0 F CFA';
                const totalAmount = sanitizeAmount(rawTotal);
                
                const paymentMethod = area.querySelector('div[class*="mt-1"]')?.innerText || 'Espèces';

                // Reconstruction des services
                let servicesHTML = '';
                const rawRows = Array.from(area.querySelectorAll('div[class*="justify-between"]'))
                    .filter(el => {
                        const txt = el.innerText.toUpperCase();
                        return !txt.includes('TOTAL') && !txt.includes('PAIEMENT') && !txt.includes('PATIENT') && !txt.includes('SIGNATURE');
                    });

                let allServices = [];
                if (rawRows.length > 0) {
                    rawRows.forEach(row => {
                        const spans = row.querySelectorAll('span');
                        if (spans.length >= 2) {
                            const name = spans[0].innerText.trim();
                            const price = sanitizeAmount(spans[1].innerText.trim());
                            if (name && !name.includes('TOTAL')) {
                                if (name.includes(' + ')) {
                                    name.split(' + ').forEach(n => allServices.push({ name: n.trim(), price: '' }));
                                } else {
                                    allServices.push({ name, price });
                                }
                            }
                        }
                    });
                }
                
                // Si on a un total à 0 mais qu'on a trouvé un chiffre ailleurs, on essaie de le récupérer
                const finalTotal = totalAmount === '0 F CFA' ? sanitizeAmount(rawTotal) : totalAmount;

                // Construction finale des lignes de services
                if (allServices.length > 0) {
                    allServices.forEach(s => {
                        // S'assurer qu'un service n'affiche 0 que si c'est vraiment gratuit
                        let sPrice = s.price;
                        if (sPrice === '0 F CFA' && finalTotal !== '0 F CFA' && allServices.length === 1) {
                            sPrice = finalTotal;
                        }
                        
                        servicesHTML += `
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:11px; border-bottom:1px dotted #eee; padding-bottom:3px;">
                                <span style="flex:1; padding-right:8px;">${s.name}</span>
                                <span style="font-weight:bold; white-space:nowrap;">${sPrice}</span>
                            </div>`;
                    });
                }

                // NOUVEAU DESIGN PREMIUM
                area.innerHTML = `
                    <div style="font-family:'Courier New', Courier, monospace; color:black; width:100%; word-wrap:break-word;">
                        <!-- HEADER -->
                        <div style="text-center; border-bottom:2px solid black; padding-bottom:10px; margin-bottom:10px; text-align:center;">
                            <div style="font-size:18px; font-weight:900; letter-spacing:1px; margin-bottom:2px;">${centerName}</div>
                            <div style="font-size:10px; line-height:1.2;">
                                ${centerDetails.join('<br>')}
                            </div>
                        </div>

                        <!-- TICKET MAIN INFO -->
                        <div style="text-align:center; margin-bottom:15px; border-bottom:1px dashed black; padding-bottom:10px;">
                            <div style="font-size:10px; text-transform:uppercase; letter-spacing:2px; margin-bottom:5px;">RECU DE PAIEMENT</div>
                            <div style="font-size:32px; font-weight:900; margin:5px 0;">#${ticketNumFull}</div>
                            <div style="font-size:9px; color:#333;">Ref: ${ticketID}</div>
                            <div style="font-size:10px; margin-top:5px; font-weight:bold;">${dateStr}</div>
                        </div>

                        <!-- PATIENT SECTION -->
                        <div style="margin-bottom:15px; border-bottom:1px dashed black; padding-bottom:10px;">
                            <div style="font-size:9px; font-weight:bold; text-decoration:underline; margin-bottom:4px;">PATIENT :</div>
                            <div style="font-size:13px; font-weight:bold;">${patientName}</div>
                            <div style="font-size:10px;">${patientMeta}</div>
                            <div style="font-size:10px;">${patientPhone}</div>
                        </div>

                        <!-- SERVICES SECTION -->
                        <div style="margin-bottom:15px;">
                            <div style="font-size:9px; font-weight:bold; text-decoration:underline; margin-bottom:8px;">DETAIL DES PRESTATIONS :</div>
                            <div style="min-height:40px;">
                                ${servicesHTML}
                            </div>
                        </div>

                        <!-- TOTAL SECTION -->
                        <div style="border-top:2px solid black; border-bottom:2px solid black; padding:8px 0; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:12px; font-weight:bold;">TOTAL A PAYER</span>
                            <span style="font-size:18px; font-weight:900;">${finalTotal}</span>
                        </div>

                        <!-- PAYMENT INFO -->
                        <div style="font-size:10px; margin-bottom:20px; text-align:right; font-style:italic;">
                            MODE DE PAIEMENT : ${paymentMethod.replace('Paiement: ', '')}
                        </div>

                        <!-- BARCODE SIMULATION -->
                        <div style="text-align:center; margin-bottom:20px;">
                            <div style="height:30px; width:100%; background:repeating-linear-gradient(90deg, black, black 1px, white 1px, white 3px, black 3px, black 4px, white 4px, white 5px);"></div>
                            <div style="font-size:8px; margin-top:2px;">* ${ticketID} *</div>
                        </div>

                        <!-- FOOTER -->
                        <div style="text-align:center; font-size:10px; line-height:1.4;">
                            <div style="height:50px; border:1px solid #ccc; margin-bottom:10px; display:flex; align-items:center; justify-content:center; color:#666; font-style:italic; font-size:9px;">
                                Signature & Cachet
                            </div>
                            <div style="font-weight:bold; font-size:11px;">Merci de votre confiance !</div>
                            <div style="font-size:9px; margin-top:4px;">Conservez ce ticket pour tout suivi médical.</div>
                            <div style="margin-top:10px; font-size:8px; color:#555;">O'CLIC SANTE - Propulsé par Quantum Digit</div>
                        </div>
                    </div>
                `;

                // Suppression des doublons monétaires potentiels dans le nouveau rendu
                area.innerHTML = area.innerHTML.replace(/(F\s*CFA|FCFA)[\s\u00A0]+(FCFA|F\s*CFA)/gi, 'F CFA');
            });
            
            originalPrint.call(window);
        };
    }

    function init() {
        fixDashboard();
        setupPrintHijack();
        setupTicketFixer();
        setInterval(fixDashboard, 30000); // Ralenti à 30 secondes pour économiser le serveur
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
