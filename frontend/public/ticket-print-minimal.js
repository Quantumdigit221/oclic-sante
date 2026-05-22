/**
 * Impression ticket minimal — ULTRA-AGRESSIF
 * Force le format court même si l'application tente d'utiliser ses propres modèles.
 */
(function () {
    'use strict';

    const DEBUG = true;
    function log(msg) { if (DEBUG) console.log('[TICKET-FORCE] ' + msg); }

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
        return window.medicalCenterConfig || { name: "CLINIQUE SARR" };
    }

    function formatAmount(val) {
        const num = parseFloat(String(val).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return num.toLocaleString('fr-FR') + ' F';
    }

    function buildTicketHtml(data) {
        const servicesHTML = data.services.length > 0
            ? data.services.map((s) => `
                <div class="svc-row">
                  <span class="svc-name">${esc(s.name)}</span>
                  <span class="svc-price">${esc(s.price)}</span>
                </div>`).join('')
            : '<div class="svc-row muted"><span class="svc-name">—</span></div>';

        let cleanCenter = esc(data.centerName).split(/[\n\r,.]/)[0].replace(/Avenue.*|Tel:.*|@.*/gi, '').trim();
        if (!cleanCenter || cleanCenter.length < 3) cleanCenter = "CLINIQUE SARR";
        
        const cleanPatient = esc(data.patientName).split(/[\n\r,]/)[0].trim();

        return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Ticket</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  html, body { margin: 0; padding: 0; height: auto; overflow: visible; background: #fff; }
  body { font-family: 'Courier New', Courier, monospace; color: #000; width: 72mm; padding: 5mm; box-sizing: border-box; }
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
  @media print { body { width: 100%; } }
</style></head><body>
  <div class="hdr"><h1>${cleanCenter}</h1></div>
  <div class="blk"><div class="lbl">Patient</div><div class="val">${cleanPatient}</div></div>
  <div class="blk" style="border-bottom:none"><div class="lbl">Services</div>${servicesHTML}</div>
  <div class="total-row"><span>MONTANT TOTAL</span><span class="total-amt">${esc(data.totalDue)}</span></div>
  <div class="total-row main"><span>MONTANT PAYÉ</span><span class="total-amt">${esc(data.totalPaid)}</span></div>
  <div class="footer">MERCI DE VOTRE CONFIANCE</div>
</body></html>`;
    }

    function extractFromPrintArea(area) {
        const fullText = area.innerText || '';
        const sanitizeAmount = (txt) => {
            if (!txt) return '0 F';
            const val = String(txt).replace(/F\s*CFA|FCFA|F\b/gi, '').replace(/[\s\u00A0]/g, '').replace(/,/g, '').trim();
            return (parseFloat(val) || 0).toLocaleString('fr-FR') + ' F';
        };

        const center = getCenter();
        let centerName = center.name || center.centerName || "CLINIQUE SARR";

        let patientName = 'Anonyme';
        const labels = area.querySelectorAll('span, div, b, td, p');
        for (let el of labels) {
            const txt = el.innerText.trim();
            if (/^PATIENT\s*:?\s*$/i.test(txt)) {
                const next = el.nextElementSibling || el.parentElement.nextElementSibling;
                if (next) { patientName = next.innerText.trim(); break; }
            }
            if (/^PATIENT\s*:\s*(.+)/i.test(txt)) {
                patientName = txt.match(/^PATIENT\s*:\s*(.+)/i)[1].trim();
                break;
            }
        }
        
        if (patientName === 'Anonyme') {
            const matches = fullText.match(/PATIENT\s*:\s*([^\n\r]+)/i);
            if (matches) patientName = matches[1].trim();
        }

        const skipRow = (txt) => /TOTAL|PAIEMENT|PATIENT|SIGNATURE|SOUS-TOTAL|MÉDECIN|ASSURANCE|NET À|DATE\s*:|TEL|RNIS|NUMÉRO|REF\s*:|MODE DE|Merci|Conservez|Propulsé|Cachet|RECU|REÇU|Quantum|EMAIL|@|PRESTATIONS|RECU DE PAIEMENT|DÉTAIL/i.test(txt);

        const services = [];
        area.querySelectorAll('div[class*="justify-between"], div.flex.justify-between, tr, .svc-row, div.grid').forEach((row) => {
            const rowText = row.innerText || '';
            if (skipRow(rowText)) return;
            let name = '', price = '';
            const spans = row.querySelectorAll('span, td, div');
            if (spans.length >= 2) {
                name = spans[0].innerText.trim();
                price = sanitizeAmount(spans[spans.length - 1].innerText);
            } else {
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
        if (!totalDue) {
            const t = fullText.match(/(\d[\d\s.,]*)\s*F/i);
            if (t) totalDue = totalPaid = sanitizeAmount(t[1]);
        }
        if (!totalDue) totalDue = totalPaid || '0 F';
        if (!totalPaid) totalPaid = totalDue;

        return { centerName, patientName, services, totalDue, totalPaid };
    }

    function openPrintWindow(html) {
        log('Opening print window...');
        const printWin = window.open('', '_blank', 'width=420,height=640');
        if (!printWin) return false;
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
        setTimeout(() => {
            printWin.focus();
            printWin.print();
            setTimeout(() => printWin.close(), 1000);
        }, 500);
        return true;
    }

    function installOverrides() {
        if (window.__oclicOverriden) return;
        window.__oclicOverriden = true;

        log('Installing overrides...');

        // Override window.print
        const nativePrint = window.print.bind(window);
        window.print = function() {
            log('Intercepted window.print()');
            const body = document.body;
            if (body.innerText.includes('DETAIL DES PRESTATIONS') || body.innerText.includes('R E C U')) {
                const html = buildTicketHtml(extractFromPrintArea(body));
                openPrintWindow(html);
            } else {
                const area = document.querySelector('#print-area, #receipt-print-area, .print-area, #ticket-print');
                if (area) {
                    const html = buildTicketHtml(extractFromPrintArea(area));
                    openPrintWindow(html);
                } else {
                    nativePrint();
                }
            }
        };

        // Override window.open
        const nativeOpen = window.open.bind(window);
        window.open = function() {
            const win = nativeOpen.apply(this, arguments);
            if (win) {
                log('Intercepted window.open()');
                const itv = setInterval(() => {
                    try {
                        if (win.document && win.document.body && win.document.body.innerText.length > 20) {
                            const txt = win.document.body.innerText;
                            if (txt.includes('DETAIL DES PRESTATIONS') || txt.includes('R E C U')) {
                                log('Found ticket in popup, transforming...');
                                const minimalHtml = buildTicketHtml(extractFromPrintArea(win.document.body));
                                win.document.open();
                                win.document.write(minimalHtml);
                                win.document.close();
                                clearInterval(itv);
                            }
                        }
                    } catch(e) { clearInterval(itv); }
                }, 100);
                setTimeout(() => clearInterval(itv), 5000);
            }
            return win;
        };

        // Add CSS to hide unwanted stuff during print on the main window just in case
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                body.oclic-minimal-printing > *:not(.oclic-force-visible) { display: none !important; }
                .no-print { display: none !important; }
            }
        `;
        document.head.appendChild(style);
    }

    // Run immediately and frequently
    installOverrides();
    window.addEventListener('load', installOverrides);
    setInterval(installOverrides, 2000);

    log('Loaded & Active');
})();
