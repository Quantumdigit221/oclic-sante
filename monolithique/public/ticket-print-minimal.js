/**
 * Impression ticket minimal — une seule source pour tous les flux d'impression.
 * Champs : clinique, date, patient, services, total à payer, total payé.
 */
(function () {
    'use strict';

    function esc(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function getCenter() {
        try {
            const raw = localStorage.getItem('currentCenter');
            if (raw) {
                const c = JSON.parse(raw);
                if (c && (c.name || c.centerName)) return c;
            }
        } catch (e) { /* ignore */ }
        return window.medicalCenterConfig || { name: "O'CLIC SANTE" };
    }

    function formatAmount(val) {
        const num = parseFloat(String(val).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return num.toLocaleString('fr-FR') + ' F';
    }

    function formatDateInput(value) {
        if (!value) return '';
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function buildServicesFromTicket(ticket) {
        const list = [];
        if (Array.isArray(ticket.services) && ticket.services.length > 0) {
            ticket.services.forEach((s) => {
                list.push({
                    name: s.name || s.serviceName || 'Service',
                    price: formatAmount(s.price || s.amount || 0)
                });
            });
        } else if (ticket.serviceName) {
            list.push({ name: ticket.serviceName, price: formatAmount(ticket.amount || 0) });
        }
        return list;
    }

    function buildTicketHtml(data) {
        const servicesHTML = data.services.length > 0
            ? data.services.map((s) => `
                <div class="svc-row">
                  <span class="svc-name">${esc(s.name)}</span>
                  <span class="svc-price">${esc(s.price)}</span>
                </div>`).join('')
            : '<div class="svc-row muted"><span class="svc-name">—</span></div>';

        // Nettoyage radical : ne garder que le nom (tout avant la première virgule, point, ou retour ligne)
        let cleanCenter = esc(data.centerName).split(/[\n\r,.]/)[0].replace(/Avenue.*|Tel:.*|@.*/gi, '').trim();
        if (!cleanCenter || cleanCenter.length < 3) cleanCenter = "CLINIQUE SARR";
        
        const cleanPatient = esc(data.patientName).split(/[\n\r,]/)[0].trim();

        return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Ticket</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  html, body { margin: 0; padding: 0; height: auto; overflow: visible; }
  body { font-family: 'Courier New', Courier, monospace; color: #000; width: 72mm; padding: 5mm; box-sizing: border-box; }
  * { page-break-before: avoid !important; page-break-after: avoid !important; page-break-inside: avoid !important; }
  .hdr { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
  .hdr h1 { font-size: 20px; font-weight: 900; margin: 0; text-transform: uppercase; }
  .blk { margin-bottom: 12px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
  .lbl { font-size: 10px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; color: #444; }
  .val { font-size: 16px; font-weight: 900; }
  .svc-row { display: flex; justify-content: space-between; gap: 6px; margin-bottom: 6px; font-size: 14px; }
  .svc-name { flex: 1; font-weight: bold; }
  .svc-price { white-space: nowrap; font-weight: 900; }
  .total-row { border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; }
  .total-row.main { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; font-size: 18px; }
  .total-amt { font-size: 20px; font-weight: 900; }
  .footer { text-align: center; margin-top: 25px; font-size: 12px; font-weight: 900; border-top: 1px solid #000; padding-top: 10px; }
</style></head><body>
  <div class="hdr"><h1>${cleanCenter}</h1></div>
  <div class="blk"><div class="lbl">Patient</div><div class="val">${cleanPatient}</div></div>
  <div class="blk" style="border-bottom:none"><div class="lbl">Services</div>${servicesHTML}</div>
  <div class="total-row"><span>MONTANT TOTAL</span><span class="total-amt">${esc(data.totalDue)}</span></div>
  <div class="total-row main"><span>MONTANT PAYÉ</span><span class="total-amt">${esc(data.totalPaid)}</span></div>
  <div class="footer">MERCI DE VOTRE CONFIANCE</div>
</body></html>`;
    }

    function openPrintWindow(html) {
        const printWin = window.open('', '_blank', 'width=420,height=640');
        if (!printWin) {
            alert('Veuillez autoriser les fenêtres popup pour imprimer le ticket.');
            return false;
        }
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
            printWin.print();
            setTimeout(() => printWin.close(), 600);
        }, 300);
        return true;
    }

    function ticketFromObject(ticket) {
        const center = getCenter();
        const amount = ticket.amount || ticket.totalAmount || ticket.total || 0;
        const total = formatAmount(amount);
        return {
            centerName: center.name || center.centerName || "O'CLIC SANTE",
            dateStr: formatDateInput(ticket.createdAt || ticket.date) || formatDateInput(new Date()),
            patientName: ticket.patientName || ticket.patient?.name || 'Anonyme',
            services: buildServicesFromTicket(ticket),
            totalDue: total,
            totalPaid: total
        };
    }

    function extractFromPrintArea(area) {
        const fullText = area.innerText || '';
        const sanitizeAmount = (txt) => {
            if (!txt) return '0 F';
            const val = String(txt).replace(/F\s*CFA|FCFA|F\b/gi, '').replace(/[\s\u00A0]/g, '').replace(/,/g, '').trim();
            return (parseFloat(val) || 0).toLocaleString('fr-FR') + ' F';
        };

        const center = getCenter();
        const centerName = center.name || center.centerName ||
            area.querySelector('.font-black.text-xl')?.innerText?.trim() ||
            area.querySelector('.font-bold.text-lg')?.innerText?.trim() || "O'CLIC SANTE";

        let dateStr = fullText.match(/(\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2})/)?.[1] || '';
        if (!dateStr) {
            const dateLine = Array.from(area.querySelectorAll('span, div'))
                .map((el) => el.innerText.trim())
                .find((t) => /^DATE\s*:/i.test(t));
            if (dateLine) dateStr = dateLine.replace(/^DATE\s*:\s*/i, '').trim();
        }
        if (!dateStr) dateStr = formatDateInput(new Date());

        let patientName = 'Anonyme';
        const patientLabels = area.querySelectorAll('span, div, b');
        for (let el of patientLabels) {
            const txt = el.innerText.trim();
            if (/^PATIENT\s*:?\s*$/i.test(txt)) {
                const next = el.nextElementSibling || el.parentElement.nextElementSibling;
                if (next) {
                    patientName = next.innerText.trim();
                    break;
                }
            }
            if (/^PATIENT\s*:\s*(.+)/i.test(txt)) {
                patientName = txt.match(/^PATIENT\s*:\s*(.+)/i)[1].trim();
                break;
            }
        }
        
        if (patientName === 'Anonyme') {
            const alt = area.querySelector('.text-lg.font-black') ||
                area.querySelector('.font-bold.text-black:not(.uppercase)');
            if (alt) patientName = alt.innerText.trim().split('\n')[0];
        }

        const skipRow = (txt) => /TOTAL|PAIEMENT|PATIENT|SIGNATURE|SOUS-TOTAL|MÉDECIN|ASSURANCE|NET À|DATE\s*:|TEL|RNIS|NUMÉRO|REF\s*:|MODE DE|Merci|Conservez|Propulsé|Cachet|RECU|REÇU|Quantum|EMAIL|@|PRESTATIONS|RECU DE PAIEMENT/i.test(txt);

        const services = [];
        area.querySelectorAll('div[class*="justify-between"], div.flex.justify-between, tr, .svc-row').forEach((row) => {
            const rowText = row.innerText || '';
            if (skipRow(rowText)) return;
            
            // Try different extraction strategies
            let name = '', price = '';
            
            const spans = row.querySelectorAll('span, td');
            if (spans.length >= 2) {
                name = spans[0].innerText.trim();
                price = sanitizeAmount(spans[spans.length - 1].innerText);
            } else {
                // Try split by space/tab
                const parts = rowText.trim().split(/\s{2,}|\t/);
                if (parts.length >= 2) {
                    name = parts[0];
                    price = sanitizeAmount(parts[parts.length - 1]);
                }
            }

            if (name && name.length > 2 && !skipRow(name)) {
                services.push({ name, price });
            }
        });

        let totalDue = '';
        let totalPaid = '';
        const dueMatch = fullText.match(/(?:TOTAL|NET|MONTANT|A PAYER)\s*(?:À\s*PAYER|TOTAL)?\s*:?\s*([\d\s.,]+)/i);
        const paidMatch = fullText.match(/(?:PAYÉ|VERSEMENT|PAIEMENT)\s*:?\s*([\d\s.,]+)/i);
        if (dueMatch) totalDue = sanitizeAmount(dueMatch[1]);
        if (paidMatch) totalPaid = sanitizeAmount(paidMatch[1]);
        if (!totalDue && !totalPaid) {
            const t = fullText.match(/TOTAL\s+([\d\s.,]+)\s*F/i);
            if (t) totalDue = totalPaid = sanitizeAmount(t[1]);
        }
        if (!totalDue) totalDue = totalPaid || '0 F';
        if (!totalPaid) totalPaid = totalDue;

        return { centerName, dateStr, patientName, services, totalDue, totalPaid };
    }

    /** Impression depuis objet ticket (API / professional-receipt / etc.) */
    window.oclicPrintMinimalTicket = function (ticket) {
        const html = buildTicketHtml(ticketFromObject(ticket || {}));
        openPrintWindow(html);
    };

    function installPrintOverride() {
        if (!window.__oclicNativePrint) {
            window.__oclicNativePrint = window.print.bind(window);
        }
        const originalPrint = window.__oclicNativePrint;

        window.print = function oclicMinimalPrint() {
            const printAreas = document.querySelectorAll(
                '#print-area, #receipt-print-area, .print-area, .ticket-print, #ticket-print'
            );
            if (printAreas.length === 0) {
                originalPrint();
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
                originalPrint();
                return;
            }

            const html = buildTicketHtml(extractFromPrintArea(area));
            if (!openPrintWindow(html)) {
                document.body.classList.add('oclic-ticket-printing');
                const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/i);
                area.innerHTML = bodyMatch ? bodyMatch[1] : '';
                originalPrint();
                document.body.classList.remove('oclic-ticket-printing');
            }
        };

        // Proxy window.open to catch new windows
        if (!window.__oclicNativeOpen) {
            window.__oclicNativeOpen = window.open;
            window.open = function() {
                const win = window.__oclicNativeOpen.apply(this, arguments);
                if (win) {
                    // Force minimal print on the new window
                    const checkInterval = setInterval(() => {
                        try {
                            if (win.document && win.document.body) {
                                // If win.print is called, we catch it
                                if (!win.__oclicPrintPatched) {
                                    const winPrint = win.print;
                                    win.print = function() {
                                        const body = win.document.body;
                                        if (body && (body.innerText.includes('TICKET') || body.innerText.includes('RECU') || body.innerText.includes('Facture'))) {
                                            const minimalHtml = buildTicketHtml(extractFromPrintArea(body));
                                            win.document.open();
                                            win.document.write(minimalHtml);
                                            win.document.close();
                                        }
                                        return winPrint.apply(win, arguments);
                                    };
                                    win.__oclicPrintPatched = true;
                                }
                                // Optional: auto-transform content even before print is called
                                if (win.document.body.innerText.length > 50 && !win.__oclicContentTransformed) {
                                     // wait a bit for React to render
                                }
                            }
                        } catch(e) { /* cross-origin possible */ }
                    }, 500);
                    setTimeout(() => clearInterval(checkInterval), 5000);
                }
                return win;
            };
        }
    }

    function installGlobalAliases() {
        window.printProfessionalReceipt = window.oclicPrintMinimalTicket;
        window.printTicketReceipt = window.oclicPrintMinimalTicket;
        window.printCompactTicket = window.oclicPrintMinimalTicket;
        window.printSinglePageTicket = window.oclicPrintMinimalTicket;
        window.printMiniTicket = window.oclicPrintMinimalTicket;
    }

    installGlobalAliases();
    installPrintOverride();
    window.addEventListener('load', () => {
        installGlobalAliases();
        installPrintOverride();
    });
    setInterval(() => {
        installGlobalAliases();
        installPrintOverride();
    }, 3000);

    console.log('TICKET-PRINT-MINIMAL: actif (format court)');
})();
