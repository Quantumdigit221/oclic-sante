/**
 * O'CLIC SANTE - Ticket Billing Extension
 * Adds Price, Percentage and Custom Total to New/Edit Ticket Modal
 */
(function() {
    'use strict';

    console.log('📑 Extension Billing: Initialisation v1.1 (Support Mise à jour)...');

    // --- STATE ---
    let currentTicketData = {
        basePrice: 0,
        discountPercent: 0,
        customTotal: 0
    };

    // --- DOM PATCHER ---
    function patchTicketModal(modal) {
        if (modal.dataset.billingPatched) return;
        
        // Find the service selector or some identifying field
        const serviceSelect = modal.querySelector('select[name="service"]') || 
                           modal.querySelector('select') ||
                           Array.from(modal.querySelectorAll('label')).find(l => l.innerText.includes('Service'))?.parentElement?.querySelector('select');
        
        if (!serviceSelect) {
             // Second attempt: look for any select in a modal
             return;
        }

        console.log('📑 Extension Billing: Modal found and patching...');
        modal.dataset.billingPatched = "true";

        // Find a place to inject our fields (usually after the service selector)
        const injectionPoint = serviceSelect.closest('div').parentElement;
        
        const extensionContainer = document.createElement('div');
        extensionContainer.className = "billing-extension-container mt-4 p-4 bg-teal-50 rounded-xl border border-teal-100 grid grid-cols-3 gap-4";
        extensionContainer.style.backgroundColor = "#f0fdfa";
        extensionContainer.style.padding = "16px";
        extensionContainer.style.borderRadius = "12px";
        extensionContainer.style.marginTop = "16px";
        extensionContainer.style.marginBottom = "16px";
        extensionContainer.style.display = "grid";
        extensionContainer.style.gridTemplateColumns = "1fr 1fr 1fr";
        extensionContainer.style.gap = "12px";
        extensionContainer.style.border = "1px solid #ccfbf1";

        extensionContainer.innerHTML = `
            <div>
                <label style="display:block; font-size:11px; font-weight:800; color:#0d9488; text-transform:uppercase; margin-bottom:4px;">Prix Service</label>
                <input type="number" id="ext-base-price" class="w-full p-2 rounded-lg border border-teal-200" style="width:100%; box-sizing:border-box; padding:8px; border-radius:8px; border:1px solid #99f6e4;">
            </div>
            <div>
                <label style="display:block; font-size:11px; font-weight:800; color:#0d9488; text-transform:uppercase; margin-bottom:4px;">Remise (%)</label>
                <input type="number" id="ext-discount" value="0" min="0" max="100" class="w-full p-2 rounded-lg border border-teal-200" style="width:100%; box-sizing:border-box; padding:8px; border-radius:8px; border:1px solid #99f6e4;">
            </div>
            <div>
                <label style="display:block; font-size:11px; font-weight:800; color:#0d9488; text-transform:uppercase; margin-bottom:4px;">Total à Payer</label>
                <input type="number" id="ext-total" class="w-full p-2 rounded-lg border border-teal-600 font-bold" style="width:100%; box-sizing:border-box; padding:8px; border-radius:8px; border:2px solid #0d9488; font-weight:bold; color:#0f172a;">
            </div>
        `;

        injectionPoint.appendChild(extensionContainer);

        const basePriceInput = document.getElementById('ext-base-price');
        const discountInput = document.getElementById('ext-discount');
        const totalInput = document.getElementById('ext-total');

        function updateCalculations(source) {
            let base = parseFloat(basePriceInput.value) || 0;
            let disc = parseFloat(discountInput.value) || 0;
            let total = parseFloat(totalInput.value) || 0;

            if (source === 'base' || source === 'discount') {
                total = base * (1 - disc / 100);
                totalInput.value = Math.round(total);
            } else if (source === 'total') {
                if (base > 0) {
                    disc = ((base - total) / base) * 100;
                    discountInput.value = Math.round(disc * 100) / 100;
                }
            }
            
            // Store globally for fetch interceptor
            window._lastTicketAmount = parseFloat(totalInput.value);
            window._lastTicketServicePrice = parseFloat(basePriceInput.value);
        }

        basePriceInput.oninput = () => updateCalculations('base');
        discountInput.oninput = () => updateCalculations('discount');
        totalInput.oninput = () => updateCalculations('total');

        // Watch for existing values (Edit mode)
        const originalAmountField = Array.from(modal.querySelectorAll('input')).find(i => i.placeholder && (i.placeholder.includes('Montant') || (i.value && !isNaN(i.value) && i.type === 'number')));
        
        const syncInterval = setInterval(() => {
            if (!document.body.contains(modal)) {
                clearInterval(syncInterval);
                return;
            }
            const currentVal = originalAmountField ? parseFloat(originalAmountField.value) || 0 : 0;
            if (currentVal > 0 && Math.abs(currentVal - parseFloat(totalInput.value)) > 1 && !basePriceInput.value) {
                basePriceInput.value = currentVal;
                totalInput.value = currentVal;
                updateCalculations('base');
            }
        }, 1000);
    }

    // --- MUTATION OBSERVER ---
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) {
                    const modal = node.querySelector('[role="dialog"]') || (node.getAttribute('role') === 'dialog' ? node : null);
                    if (modal && (modal.innerText.includes('Ticket') || modal.innerText.includes('Rendez-vous') || modal.innerText.includes('Modification'))) {
                        patchTicketModal(modal);
                    }
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // --- FETCH INTERCEPTOR ---
    const _originalFetch = window.fetch;
    window.fetch = function(url, opts) {
        const isTicketRequest = url && (url.includes('/api/tickets') || url.includes('/api/appointments'));
        const isPostOrPatch = opts && (opts.method === 'POST' || opts.method === 'PATCH' || opts.method === 'PUT');

        if (isTicketRequest && isPostOrPatch) {
            try {
                let body = JSON.parse(opts.body);
                if (window._lastTicketAmount !== undefined) {
                    console.log('📑 Extension Billing: Intercepting request - Setting amount to', window._lastTicketAmount);
                    body.amount = window._lastTicketAmount;
                    
                    if (Array.isArray(body.services) && body.services.length === 1 && window._lastTicketServicePrice) {
                        body.services[0].price = window._lastTicketServicePrice;
                    }
                    if (window._lastTicketServicePrice) {
                        body.servicePrice = window._lastTicketServicePrice;
                        body.price = window._lastTicketServicePrice;
                    }
                    
                    opts.body = JSON.stringify(body);
                }
            } catch (e) {}
        }
        return _originalFetch.apply(this, arguments);
    };

    console.log('📑 Extension Billing: Active with Update Support.');
})();
