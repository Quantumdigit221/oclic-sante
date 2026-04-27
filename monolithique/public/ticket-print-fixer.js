// Ticket Print Fixer - Corrige l'impression de tickets pour afficher le bon ticket
(function() {
    'use strict';
    
    console.log('TICKET-PRINT-FIXER: Initializing ticket print correction system...');
    
    // Configuration pour l'impression de tickets
    const TICKET_PRINT_CONFIG = {
        ticketSelector: '[data-ticket-id], .ticket-container, .ticket-print, .print-ticket',
        printButtonSelector: '[onclick*="print"], .print-button, .btn-print, button[title*="imprimer"]',
        ticketDataAttribute: 'data-ticket-id',
        printDelay: 500,
        ensureCorrectTicket: true,
        fallbackToCurrentTicket: true
    };
    
    // Stocker le ticket courant
    let currentTicketData = null;
    let lastPrintedTicketId = null;
    
    // Extraire les données du ticket depuis l'interface
    function extractTicketData() {
        try {
            // Chercher le ticket dans la page
            const ticketElements = document.querySelectorAll(TICKET_PRINT_CONFIG.ticketSelector);
            
            for (const element of ticketElements) {
                const ticketId = element.getAttribute(TICKET_PRINT_CONFIG.ticketDataAttribute) ||
                                 element.getAttribute('data-id') ||
                                 element.getAttribute('id');
                
                if (ticketId) {
                    // Extraire les données du ticket
                    const ticketData = {
                        id: ticketId,
                        ticketNumber: element.querySelector('.ticket-number, .ticket-no, [data-ticket-number]')?.textContent ||
                                     element.getAttribute('data-ticket-number') ||
                                     element.querySelector('h1, h2, h3')?.textContent,
                        patientName: element.querySelector('.patient-name, .patient, [data-patient-name]')?.textContent ||
                                     element.getAttribute('data-patient-name'),
                        serviceName: element.querySelector('.service-name, .service, [data-service-name]')?.textContent ||
                                     element.getAttribute('data-service-name'),
                        amount: element.querySelector('.amount, .price, [data-amount]')?.textContent ||
                                element.getAttribute('data-amount'),
                        date: element.querySelector('.date, .created-at, [data-date]')?.textContent ||
                                element.getAttribute('data-date'),
                        status: element.querySelector('.status, [data-status]')?.textContent ||
                                element.getAttribute('data-status'),
                        element: element
                    };
                    
                    // Valider que c'est un ticket complet
                    if (ticketData.ticketNumber || ticketData.patientName) {
                        currentTicketData = ticketData;
                        console.log('TICKET-PRINT-FIXER: Ticket data extracted:', ticketData);
                        return ticketData;
                    }
                }
            }
            
            // Fallback: chercher dans les données React
            const reactData = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(0)?.currentFiber?.memoizedState?.memoizedState;
            if (reactData) {
                console.log('TICKET-PRINT-FIXER: React data found:', reactData);
            }
            
            return null;
        } catch (error) {
            console.error('TICKET-PRINT-FIXER: Error extracting ticket data:', error);
            return null;
        }
    }
    
    // Créer une fenêtre d'impression avec le bon ticket
    function createTicketPrintWindow(ticketData) {
        try {
            console.log('TICKET-PRINT-FIXER: Creating print window for ticket:', ticketData.id);
            
            // Créer le contenu HTML pour l'impression
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Ticket O'CLIC SANTE - ${ticketData.ticketNumber || ticketData.id}</title>
                    <style>
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        body {
                            font-family: 'Courier New', monospace;
                            margin: 0;
                            padding: 5mm;
                            width: 70mm; /* Effectif pour l'imprimante 80mm */
                            background: white;
                        }
                        .ticket-header {
                            text-align: center;
                            border-bottom: 1px dashed #333;
                            padding-bottom: 5px;
                            margin-bottom: 10px;
                        }
                        .ticket-title {
                            font-size: 16px;
                            font-weight: bold;
                            margin: 0;
                        }
                        .ticket-subtitle {
                            font-size: 10px;
                            margin: 2px 0;
                        }
                        .ticket-info {
                            margin: 10px 0;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 4px 0;
                            font-size: 12px;
                        }
                        .info-label {
                            font-weight: bold;
                        }
                        .ticket-footer {
                            margin-top: 15px;
                            text-align: center;
                            font-size: 10px;
                            border-top: 1px dashed #333;
                            padding-top: 5px;
                        }
                        @media print {
                            body { width: 70mm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="ticket-header">
                        <h1 class="ticket-title">O'CLIC SANTE</h1>
                        <div class="ticket-subtitle">Clinique Médicale</div>
                    </div>
                    
                    <div class="ticket-info">
                        <div class="info-row">
                            <span class="info-label">Ticket N°:</span>
                            <span class="info-value">${ticketData.ticketNumber || ticketData.id}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Patient:</span>
                            <span class="info-value">${ticketData.patientName || 'Non spécifié'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Service:</span>
                            <span class="info-value">${ticketData.serviceName || 'Non spécifié'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Montant:</span>
                            <span class="info-value">${ticketData.amount || 'Non spécifié'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date:</span>
                            <span class="info-value">${ticketData.date || new Date().toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Statut:</span>
                            <span class="info-value">${ticketData.status || 'En cours'}</span>
                        </div>
                    </div>
                    
                    <div class="ticket-footer">
                        <p>Merci de votre confiance</p>
                        <p>O'CLIC SANTE - Votre santé, notre priorité</p>
                    </div>
                </body>
                </html>
            `;
            
            // Créer la fenêtre d'impression
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            
            if (printWindow) {
                printWindow.document.write(printContent);
                printWindow.document.close();
                
                // Attendre que le contenu soit chargé avant d'imprimer
                setTimeout(() => {
                    printWindow.print();
                    
                    // Fermer la fenêtre après impression
                    setTimeout(() => {
                        printWindow.close();
                    }, 1000);
                }, TICKET_PRINT_CONFIG.printDelay);
                
                lastPrintedTicketId = ticketData.id;
                console.log('TICKET-PRINT-FIXER: Print window created for ticket:', ticketData.id);
                
                return true;
            } else {
                console.error('TICKET-PRINT-FIXER: Could not open print window');
                return false;
            }
        } catch (error) {
            console.error('TICKET-PRINT-FIXER: Error creating print window:', error);
            return false;
        }
    }
    
    // Intercepter les clics sur les boutons d'impression
    function setupPrintInterception() {
        try {
            // Intercepter tous les clics sur les boutons d'impression
            document.addEventListener('click', function(event) {
                const target = event.target;
                const printButton = target.closest(TICKET_PRINT_CONFIG.printButtonSelector);
                
                if (printButton) {
                    console.log('TICKET-PRINT-FIXER: Print button clicked:', printButton);
                    
                    // Empêcher le comportement par défaut
                    event.preventDefault();
                    event.stopPropagation();
                    
                    // Extraire les données du ticket courant
                    const ticketData = extractTicketData();
                    
                    if (ticketData) {
                        // Créer la fenêtre d'impression avec le bon ticket
                        const success = createTicketPrintWindow(ticketData);
                        
                        if (!success) {
                            // Fallback: utiliser la méthode d'impression par défaut
                            console.warn('TICKET-PRINT-FIXER: Fallback to default print');
                            window.print();
                        }
                    } else {
                        // Fallback: essayer d'imprimer le ticket actuellement sélectionné
                        if (TICKET_PRINT_CONFIG.fallbackToCurrentTicket) {
                            console.warn('TICKET-PRINT-FIXER: No ticket data found, using fallback');
                            
                            // Créer un ticket de base avec les informations visibles
                            const fallbackTicket = {
                                id: 'current-ticket',
                                ticketNumber: document.querySelector('.ticket-number, .ticket-no')?.textContent || 'N/A',
                                patientName: document.querySelector('.patient-name, .patient')?.textContent || 'Non spécifié',
                                serviceName: document.querySelector('.service-name, .service')?.textContent || 'Non spécifié',
                                amount: document.querySelector('.amount, .price')?.textContent || 'Non spécifié',
                                date: new Date().toLocaleDateString('fr-FR'),
                                status: 'En cours'
                            };
                            
                            createTicketPrintWindow(fallbackTicket);
                        }
                    }
                }
            }, true);
            
            console.log('TICKET-PRINT-FIXER: Print interception setup complete');
        } catch (error) {
            console.error('TICKET-PRINT-FIXER: Error setting up print interception:', error);
        }
    }
    
    // Créer le panneau de contrôle pour l'impression
    function createTicketPrintPanel() {
        setTimeout(() => {
            if (document.getElementById('ticket-print-panel')) return;
            
            const panel = document.createElement('div');
            panel.id = 'ticket-print-panel';
            panel.style.cssText = `
                position: fixed;
                top: 380px;
                right: 20px;
                width: 360px;
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                color: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                z-index: 99993;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                animation: slideInRight 0.5s ease-out;
            `;
            
            panel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600;">🎫 Ticket Print Fixer</h3>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;">✕</button>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">Ticket courant:</div>
                    <div id="current-ticket-info" style="font-size: 13px; font-weight: 500; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px;">
                        Aucun ticket détecté
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">Dernier ticket imprimé:</div>
                    <div id="last-printed-ticket" style="font-size: 13px; font-weight: 500; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px;">
                        Jamais imprimé
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <button onclick="detectCurrentTicket()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                        🔍 Détecter Ticket
                    </button>
                    <button onclick="testTicketPrint()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                        🧪 Test Impression
                    </button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                    <button onclick="forceTicketPrint()" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); border: none; color: white; padding: 12px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
                        🎫 FORCER IMPRESSION TICKET
                    </button>
                </div>
                
                <div id="ticket-print-status" style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; font-size: 12px; display: none;">
                    <div id="ticket-print-status-content"></div>
                </div>
            `;
            
            // Ajouter le CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(panel);
            
            // Fonctions globales
            window.detectCurrentTicket = function() {
                const ticketData = extractTicketData();
                if (ticketData) {
                    currentTicketData = ticketData;
                    updateTicketInfo(ticketData);
                    showTicketPrintStatus('✅ Ticket détecté avec succès!', 'success');
                } else {
                    showTicketPrintStatus('❌ Aucun ticket détecté dans la page', 'error');
                }
            };
            
            window.testTicketPrint = function() {
                if (currentTicketData) {
                    showTicketPrintStatus('🧪 Test d\'impression du ticket en cours...', 'info');
                    setTimeout(() => {
                        const success = createTicketPrintWindow(currentTicketData);
                        if (success) {
                            showTicketPrintStatus('✅ Test d\'impression réussi!', 'success');
                        } else {
                            showTicketPrintStatus('❌ Échec du test d\'impression', 'error');
                        }
                    }, 1000);
                } else {
                    showTicketPrintStatus('❌ Aucun ticket à tester', 'error');
                }
            };
            
            window.forceTicketPrint = function() {
                const ticketData = extractTicketData();
                if (ticketData) {
                    showTicketPrintStatus('🎫 Impression forcée du ticket...', 'info');
                    setTimeout(() => {
                        const success = createTicketPrintWindow(ticketData);
                        if (success) {
                            lastPrintedTicketId = ticketData.id;
                            updateLastPrintedTicket(ticketData);
                            showTicketPrintStatus(`✅ Ticket ${ticketData.ticketNumber || ticketData.id} imprimé avec succès!`, 'success');
                        } else {
                            showTicketPrintStatus('❌ Échec de l\'impression forcée', 'error');
                        }
                    }, 1000);
                } else {
                    showTicketPrintStatus('❌ Aucun ticket à imprimer', 'error');
                }
            };
            
            console.log('TICKET-PRINT-FIXER: Ticket print panel created');
        }, 7000);
    }
    
    // Mettre à jour les informations du ticket
    function updateTicketInfo(ticketData) {
        const infoDiv = document.getElementById('current-ticket-info');
        if (infoDiv && ticketData) {
            infoDiv.innerHTML = `
                <div><strong>N°:</strong> ${ticketData.ticketNumber || ticketData.id}</div>
                <div><strong>Patient:</strong> ${ticketData.patientName || 'N/A'}</div>
                <div><strong>Service:</strong> ${ticketData.serviceName || 'N/A'}</div>
            `;
        }
    }
    
    // Mettre à jour le dernier ticket imprimé
    function updateLastPrintedTicket(ticketData) {
        const lastDiv = document.getElementById('last-printed-ticket');
        if (lastDiv && ticketData) {
            lastDiv.innerHTML = `
                <div><strong>N°:</strong> ${ticketData.ticketNumber || ticketData.id}</div>
                <div><strong>Patient:</strong> ${ticketData.patientName || 'N/A'}</div>
                <div><strong>Heure:</strong> ${new Date().toLocaleTimeString('fr-FR')}</div>
            `;
        }
    }
    
    // Afficher le statut d'impression
    function showTicketPrintStatus(message, type = 'info') {
        const statusDiv = document.getElementById('ticket-print-status');
        const contentDiv = document.getElementById('ticket-print-status-content');
        
        if (statusDiv && contentDiv) {
            statusDiv.style.display = 'block';
            contentDiv.innerHTML = `<div style="white-space: pre-line;">${message}</div>`;
            
            const colors = {
                success: 'rgba(16, 185, 129, 0.3)',
                error: 'rgba(239, 68, 68, 0.3)',
                info: 'rgba(59, 130, 246, 0.3)',
                warning: 'rgba(245, 158, 11, 0.3)'
            };
            statusDiv.style.background = colors[type] || colors.info;
        }
    }
    
    // Observer les changements dans la page pour détecter les tickets
    function setupTicketObserver() {
        try {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        // Vérifier si des éléments de ticket ont été ajoutés
                        const ticketElements = document.querySelectorAll(TICKET_PRINT_CONFIG.ticketSelector);
                        if (ticketElements.length > 0 && !currentTicketData) {
                            console.log('TICKET-PRINT-FIXER: Ticket elements detected, extracting data...');
                            const ticketData = extractTicketData();
                            if (ticketData) {
                                updateTicketInfo(ticketData);
                            }
                        }
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            console.log('TICKET-PRINT-FIXER: Ticket observer setup complete');
        } catch (error) {
            console.error('TICKET-PRINT-FIXER: Error setting up ticket observer:', error);
        }
    }
    
    // Initialisation
    function initialize() {
        console.log('TICKET-PRINT-FIXER: Starting ticket print fixer initialization...');
        
        // Extraire les données du ticket initial
        setTimeout(() => {
            const ticketData = extractTicketData();
            if (ticketData) {
                currentTicketData = ticketData;
                console.log('TICKET-PRINT-FIXER: Initial ticket data found:', ticketData);
            }
        }, 2000);
        
        // Configurer l'interception d'impression
        setupPrintInterception();
        
        // Configurer l'observateur de tickets
        setupTicketObserver();
        
        // Créer le panneau de contrôle (DÉSACTIVÉ)
        // createTicketPrintPanel();
        
        console.log('TICKET-PRINT-FIXER: Initialization complete');
    }
    
    // Démarrer l'initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();
