// Impression compacte de tickets avec police agrandie
(function() {
    'use strict';
    console.log('COMPACT-TICKET: Initializing compact ticket print system...');
    
    // Ticket 80mm - Format thermique
    window.printCompactTicket = function(ticket, consultation) {
        const date = new Date().toLocaleDateString('fr-FR');
        const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const config = window.medicalCenterConfig || {};
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Ticket - ${ticket?.ticketNumber || 'N/A'}</title>
                <style>
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    
                    body {
                        margin: 0;
                        padding: 3mm;
                        font-family: 'Courier New', monospace;
                        background: white;
                        width: 80mm;
                    }
                    
                    .ticket {
                        width: 100%;
                        text-align: center;
                        background: white;
                    }
                    
                    .ticket-header {
                        border-bottom: 2px dashed #000;
                        padding-bottom: 4mm;
                        margin-bottom: 4mm;
                    }
                    
                    .logo {
                        font-size: 18pt;
                        font-weight: bold;
                        color: #000;
                        margin-bottom: 2mm;
                    }
                    
                    .subtitle {
                        font-size: 9pt;
                        color: #333;
                        margin-bottom: 1mm;
                    }
                    
                    .ticket-number {
                        font-size: 16pt;
                        font-weight: bold;
                        color: #000;
                        letter-spacing: 1px;
                        margin: 3mm 0;
                        text-transform: uppercase;
                    }
                    
                    .section {
                        margin-bottom: 4mm;
                        text-align: left;
                        padding: 2mm;
                        border-bottom: 1px solid #ddd;
                    }
                    
                    .section-last {
                        border-bottom: none;
                    }
                    
                    .label {
                        font-size: 9pt;
                        color: #666;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    
                    .value {
                        font-size: 14pt;
                        color: #000;
                        font-weight: bold;
                        margin-top: 1mm;
                    }
                    
                    .value-secondary {
                        font-size: 12pt;
                        color: #333;
                        margin-top: 0.5mm;
                    }
                    
                    .status {
                        display: inline-block;
                        padding: 2mm 4mm;
                        border-radius: 3px;
                        font-size: 10pt;
                        font-weight: bold;
                        margin-top: 1mm;
                    }
                    
                    .status-waiting {
                        background: #fff3cd;
                        color: #856404;
                    }
                    
                    .status-progress {
                        background: #cfe2ff;
                        color: #084298;
                    }
                    
                    .status-completed {
                        background: #d1e7dd;
                        color: #0f5132;
                    }
                    
                    .info-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 2mm;
                        margin-bottom: 2mm;
                    }
                    
                    .info-box {
                        padding: 1mm;
                        background: #f9f9f9;
                        border-radius: 2px;
                    }
                    
                    .amount {
                        font-size: 16pt;
                        font-weight: bold;
                        color: #000;
                        margin: 3mm 0;
                        padding: 2mm;
                        background: #fffbea;
                        border: 1px solid #ffd700;
                        border-radius: 3px;
                    }
                    
                    .footer {
                        text-align: center;
                        font-size: 8pt;
                        color: #999;
                        margin-top: 3mm;
                        padding-top: 2mm;
                        border-top: 1px dashed #000;
                    }
                    
                    .divider {
                        border-bottom: 1px dashed #000;
                        margin: 2mm 0;
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <!-- En-tête -->
                    <div class="ticket-header">
                        <div class="logo">O'CLIC SANTE</div>
                        <div class="subtitle">${config.name || 'Centre Médical'}</div>
                    </div>
                    
                    <!-- Numéro du ticket -->
                    <div class="ticket-number">
                        🎫 ${ticket?.ticketNumber || 'N/A'}
                    </div>
                    
                    <div class="divider"></div>
                    
                    <!-- Informations Patient -->
                    <div class="section">
                        <div class="label">👤 Patient</div>
                        <div class="value">${ticket?.patientName || 'N/A'}</div>
                        <div class="info-row">
                            <div class="info-box">
                                <div class="label">Âge</div>
                                <div class="value-secondary">${ticket?.patientAge || '--'} ans</div>
                            </div>
                            <div class="info-box">
                                <div class="label">Sexe</div>
                                <div class="value-secondary">${ticket?.patientGender === 'M' ? 'M' : 'F'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Service -->
                    <div class="section">
                        <div class="label">🏥 Service</div>
                        <div class="value-secondary">${ticket?.serviceName || 'N/A'}</div>
                    </div>
                    
                    <!-- Montant -->
                    <div class="section">
                        <div class="label">💰 Montant</div>
                        <div class="amount">${ticket?.amount ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(ticket.amount) : '0 XOF'}</div>
                    </div>
                    
                    <!-- Statut -->
                    <div class="section">
                        <div class="label">📊 Statut</div>
                        <div class="status ${
                            ticket?.status === 'WAITING' ? 'status-waiting' :
                            ticket?.status === 'IN_PROGRESS' ? 'status-progress' :
                            'status-completed'
                        }">
                            ${ticket?.status === 'WAITING' ? '⏳ EN ATTENTE' : ticket?.status === 'IN_PROGRESS' ? '⏱ EN COURS' : '✅ TERMINÉ'}
                        </div>
                    </div>
                    
                    <!-- Date et Heure -->
                    <div class="section section-last">
                        <div class="label">📅 Date/Heure</div>
                        <div class="value-secondary">${date}</div>
                        <div class="value-secondary">${time}</div>
                    </div>
                    
                    <!-- Pied de page -->
                    <div class="footer">
                        Merci de votre visite
                        <br>
                        ${config.phone || 'Contactez-nous'}
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '', 'width=300,height=500');
        printWindow.document.write(html);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            setTimeout(() => printWindow.close(), 500);
        }, 250);
        
        console.log('COMPACT-TICKET: Ticket printed - ' + ticket?.ticketNumber);
    };
    
    // Ticket Mini 58mm
    window.printMiniTicket = function(ticket) {
        const date = new Date().toLocaleDateString('fr-FR');
        const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Mini Ticket</title>
                <style>
                    @page {
                        size: 58mm auto;
                        margin: 0;
                    }
                    
                    body {
                        margin: 0;
                        padding: 2mm;
                        font-family: 'Courier New', monospace;
                        background: white;
                        width: 58mm;
                    }
                    
                    .ticket {
                        text-align: center;
                        background: white;
                    }
                    
                    .header {
                        font-size: 14pt;
                        font-weight: bold;
                        margin-bottom: 2mm;
                        border-bottom: 2px solid #000;
                        padding-bottom: 2mm;
                    }
                    
                    .number {
                        font-size: 18pt;
                        font-weight: bold;
                        margin: 2mm 0;
                        letter-spacing: 1px;
                    }
                    
                    .row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 11pt;
                        margin: 1.5mm 0;
                        text-align: left;
                    }
                    
                    .label {
                        font-size: 9pt;
                        color: #666;
                        font-weight: bold;
                    }
                    
                    .value {
                        font-size: 13pt;
                        font-weight: bold;
                        color: #000;
                    }
                    
                    .amount {
                        font-size: 16pt;
                        font-weight: bold;
                        margin: 2mm 0;
                        padding: 1mm;
                        background: #fffbea;
                        border: 1px solid #ffd700;
                    }
                    
                    .footer {
                        font-size: 8pt;
                        color: #999;
                        margin-top: 2mm;
                        border-top: 1px dashed #000;
                        padding-top: 1mm;
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">O'CLIC</div>
                    <div class="number">${ticket?.ticketNumber || 'N/A'}</div>
                    
                    <div class="row">
                        <span class="label">Patient:</span>
                        <span class="value">${(ticket?.patientName || 'N/A').substring(0, 15)}</span>
                    </div>
                    
                    <div class="row">
                        <span class="label">Service:</span>
                        <span class="value">${(ticket?.serviceName || 'N/A').substring(0, 12)}</span>
                    </div>
                    
                    <div class="amount">
                        ${ticket?.amount ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(ticket.amount) : '0 XOF'}
                    </div>
                    
                    <div class="row">
                        <span class="label">${date} ${time}</span>
                    </div>
                    
                    <div class="footer">
                        Merci !
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '', 'width=250,height=400');
        printWindow.document.write(html);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            setTimeout(() => printWindow.close(), 500);
        }, 250);
        
        console.log('COMPACT-TICKET: Mini ticket printed');
    };
    
    console.log('COMPACT-TICKET: System ready - use printCompactTicket() or printMiniTicket()');
})();
