// Système d'impression de ticket sur une seule page
(function() {
    'use strict';
    console.log('SINGLE-PAGE-TICKET: Initializing single page ticket print system...');
    
    // Ticket sur UNE SEULE PAGE (A4)
    window.printSinglePageTicket = function(ticket, consultation) {
        const date = new Date().toLocaleDateString('fr-FR');
        const time = new Date().toLocaleTimeString('fr-FR');
        const config = window.medicalCenterConfig || {};
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Ticket - ${ticket?.ticketNumber || 'N/A'}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        background: white;
                        color: #333;
                    }
                    
                    .ticket-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background: white;
                    }
                    
                    .ticket-card {
                        width: 400px;
                        background: white;
                        border: 3px solid #14b8a6;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    
                    .ticket-header {
                        background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
                        color: white;
                        padding: 20px;
                        text-align: center;
                    }
                    
                    .logo {
                        font-size: 28pt;
                        font-weight: bold;
                        margin-bottom: 8px;
                        letter-spacing: 2px;
                    }
                    
                    .subtitle {
                        font-size: 11pt;
                        opacity: 0.9;
                    }
                    
                    .ticket-number-section {
                        background: #f0fdf4;
                        padding: 20px;
                        text-align: center;
                        border-bottom: 2px dashed #14b8a6;
                    }
                    
                    .ticket-number {
                        font-size: 32pt;
                        font-weight: bold;
                        color: #14b8a6;
                        letter-spacing: 3px;
                        font-family: 'Courier New', monospace;
                        margin-bottom: 8px;
                    }
                    
                    .ticket-label {
                        font-size: 10pt;
                        color: #666;
                        text-transform: uppercase;
                        font-weight: 600;
                    }
                    
                    .ticket-content {
                        padding: 24px;
                    }
                    
                    .info-section {
                        margin-bottom: 20px;
                    }
                    
                    .info-title {
                        font-size: 11pt;
                        color: #14b8a6;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-bottom: 8px;
                        padding-bottom: 6px;
                        border-bottom: 2px solid #e2e8f0;
                    }
                    
                    .info-group {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                        margin-bottom: 12px;
                    }
                    
                    .info-item {
                        background: #f8fafc;
                        padding: 12px;
                        border-radius: 6px;
                        border-left: 3px solid #14b8a6;
                    }
                    
                    .info-label {
                        font-size: 9pt;
                        color: #64748b;
                        font-weight: 600;
                        text-transform: uppercase;
                        margin-bottom: 4px;
                    }
                    
                    .info-value {
                        font-size: 14pt;
                        font-weight: bold;
                        color: #1e293b;
                    }
                    
                    .info-value-secondary {
                        font-size: 12pt;
                        color: #475569;
                    }
                    
                    .amount-section {
                        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                        padding: 16px;
                        border-radius: 8px;
                        text-align: center;
                        margin: 16px 0;
                        border: 2px solid #fbbf24;
                    }
                    
                    .amount-label {
                        font-size: 10pt;
                        color: #92400e;
                        font-weight: 600;
                        text-transform: uppercase;
                        margin-bottom: 6px;
                    }
                    
                    .amount-value {
                        font-size: 28pt;
                        font-weight: bold;
                        color: #b45309;
                        font-family: 'Courier New', monospace;
                    }
                    
                    .status-badge {
                        display: inline-block;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 10pt;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-top: 8px;
                    }
                    
                    .status-waiting {
                        background: #fef3c7;
                        color: #92400e;
                    }
                    
                    .status-progress {
                        background: #cfe2ff;
                        color: #084298;
                    }
                    
                    .status-completed {
                        background: #d1e7dd;
                        color: #0f5132;
                    }
                    
                    .ticket-footer {
                        background: #f8fafc;
                        padding: 16px;
                        text-align: center;
                        border-top: 2px dashed #e2e8f0;
                    }
                    
                    .footer-text {
                        font-size: 10pt;
                        color: #64748b;
                        line-height: 1.6;
                    }
                    
                    .divider {
                        height: 1px;
                        background: #e2e8f0;
                        margin: 16px 0;
                    }
                    
                    @media print {
                        body {
                            background: white;
                            margin: 0;
                            padding: 0;
                        }
                        
                        .ticket-container {
                            min-height: auto;
                            display: block;
                            padding: 0;
                            background: white;
                        }
                        
                        .ticket-card {
                            box-shadow: none;
                            width: 100%;
                            max-width: 400px;
                            margin: 0 auto;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="ticket-container">
                    <div class="ticket-card">
                        <!-- En-tête -->
                        <div class="ticket-header">
                            <div class="logo">🏥 O'CLIC</div>
                            <div class="subtitle">Centre Médical - Système de Gestion</div>
                        </div>
                        
                        <!-- Numéro du Ticket -->
                        <div class="ticket-number-section">
                            <div class="ticket-number">${ticket?.ticketNumber || 'N/A'}</div>
                            <div class="ticket-label">🎫 Numéro de Ticket</div>
                        </div>
                        
                        <!-- Contenu Principal -->
                        <div class="ticket-content">
                            
                            <!-- Patient -->
                            <div class="info-section">
                                <div class="info-title">👤 Informations Patient</div>
                                <div class="info-item">
                                    <div class="info-label">Nom Complet</div>
                                    <div class="info-value">${ticket?.patientName || 'N/A'}</div>
                                </div>
                                <div class="info-group">
                                    <div class="info-item">
                                        <div class="info-label">Âge</div>
                                        <div class="info-value-secondary">${ticket?.patientAge || '--'} ans</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Sexe</div>
                                        <div class="info-value-secondary">${ticket?.patientGender === 'M' ? '👨 Masculin' : '👩 Féminin'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <!-- Service -->
                            <div class="info-section">
                                <div class="info-title">🏥 Service Médical</div>
                                <div class="info-item">
                                    <div class="info-label">Département</div>
                                    <div class="info-value-secondary">${ticket?.serviceName || 'N/A'}</div>
                                </div>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <!-- Montant -->
                            <div class="amount-section">
                                <div class="amount-label">💰 Montant du Ticket</div>
                                <div class="amount-value">${ticket?.amount ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(ticket.amount) : '0 XOF'}</div>
                            </div>
                            
                            <!-- Statut -->
                            <div class="info-section">
                                <div class="info-title">📊 Statut</div>
                                <div style="text-align: center;">
                                    <span class="status-badge ${
                                        ticket?.status === 'WAITING' ? 'status-waiting' :
                                        ticket?.status === 'IN_PROGRESS' ? 'status-progress' :
                                        'status-completed'
                                    }">
                                        ${ticket?.status === 'WAITING' ? '⏳ En Attente' : ticket?.status === 'IN_PROGRESS' ? '⏱ En Cours' : '✅ Terminé'}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <!-- Date & Heure -->
                            <div class="info-section">
                                <div class="info-title">📅 Date et Heure</div>
                                <div class="info-group">
                                    <div class="info-item">
                                        <div class="info-label">Date</div>
                                        <div class="info-value-secondary">${date}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Heure</div>
                                        <div class="info-value-secondary">${time}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Pied de Page -->
                        <div class="ticket-footer">
                            <div class="footer-text">
                                ✓ Merci de votre visite chez O'CLIC SANTE<br>
                                📞 Contactez-nous: ${config.phone || '+224 622 123 456'}<br>
                                🌐 ${config.website || 'www.oclicsante.com'}
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '', 'width=600,height=800');
        printWindow.document.write(html);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            setTimeout(() => printWindow.close(), 500);
        }, 250);
        
        console.log('SINGLE-PAGE-TICKET: Ticket printed on single page - ' + ticket?.ticketNumber);
    };
    
    console.log('SINGLE-PAGE-TICKET: System ready - use printSinglePageTicket(ticket, consultation)');
})();
