// Système d'impression de reçu professionnel O'CLIC SANTE
(function() {
    'use strict';
    console.log('RECEIPT-PRINTER: Initializing professional receipt system...');
    
    // Impression de reçu professionnel
    window.printProfessionalReceipt = function(ticket, consultation) {
        const date = new Date();
        const dateStr = ('0' + date.getDate()).slice(-2) + '/' + 
                       ('0' + (date.getMonth() + 1)).slice(-2) + '/' + 
                       date.getFullYear();
        const timeStr = ('0' + date.getHours()).slice(-2) + ':' + 
                       ('0' + date.getMinutes()).slice(-2);
        
        const config = window.medicalCenterConfig || {
            name: 'CLINIQUE SARR',
            address: 'Avenue valdiodio ndiaye, Kaolack',
            phone: '774526363',
            email: 'byetiham1@gmail.com'
        };
        
        // Calculer le montant total
        let totalAmount = 0;
        let servicesHtml = '';
        
        if (ticket?.amount) {
            totalAmount = ticket.amount;
            servicesHtml = `
                <tr>
                    <td style="width: 60%; padding: 6px 0; font-size: 13pt; border-bottom: 1px solid #ddd;">
                        ${ticket.serviceName || 'Service'}
                    </td>
                    <td style="width: 40%; text-align: right; padding: 6px 0; font-size: 13pt; border-bottom: 1px solid #ddd; font-weight: bold;">
                        ${new Intl.NumberFormat('fr-FR').format(Math.round(totalAmount))} F
                    </td>
                </tr>
            `;
        }
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reçu de Paiement - ${ticket?.ticketNumber || 'N/A'}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Courier New', monospace;
                        background: white;
                        color: #000;
                        line-height: 1.4;
                    }
                    
                    .receipt {
                        width: 100%;
                        max-width: 450px;
                        margin: 0 auto;
                        background: white;
                        padding: 20px;
                    }
                    
                    /* EN-TÊTE CENTRE MÉDICAL */
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 12px;
                    }
                    
                    .clinic-name {
                        font-size: 16pt;
                        font-weight: bold;
                        letter-spacing: 2px;
                        margin-bottom: 6px;
                    }
                    
                    .clinic-info {
                        font-size: 10pt;
                        line-height: 1.6;
                        color: #333;
                    }
                    
                    .clinic-info-line {
                        margin: 2px 0;
                    }
                    
                    /* TITRE REÇU */
                    .receipt-title {
                        text-align: center;
                        font-size: 12pt;
                        font-weight: bold;
                        letter-spacing: 4px;
                        margin: 16px 0;
                        text-transform: uppercase;
                    }
                    
                    /* NUMÉRO REÇU */
                    .receipt-number {
                        text-align: center;
                        font-size: 14pt;
                        font-weight: bold;
                        margin: 8px 0;
                        letter-spacing: 2px;
                    }
                    
                    .receipt-ref {
                        text-align: center;
                        font-size: 10pt;
                        color: #666;
                        margin-bottom: 12px;
                    }
                    
                    /* INFORMATIONS PATIENT */
                    .patient-section {
                        font-size: 10pt;
                        margin: 12px 0;
                        padding: 8px 0;
                        border-bottom: 1px solid #ddd;
                    }
                    
                    .patient-info {
                        display: flex;
                        justify-content: space-between;
                        margin: 4px 0;
                    }
                    
                    .patient-info-label {
                        font-weight: bold;
                    }
                    
                    /* DATE ET HEURE */
                    .datetime {
                        font-size: 11pt;
                        text-align: center;
                        margin: 12px 0;
                        font-weight: bold;
                    }
                    
                    .phone-display {
                        text-align: center;
                        font-size: 10pt;
                        margin: 6px 0;
                        color: #666;
                    }
                    
                    /* TITRE DÉTAILS */
                    .detail-title {
                        font-size: 11pt;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 16px 0 8px 0;
                        border-top: 1px solid #ddd;
                        padding-top: 8px;
                    }
                    
                    /* TABLEAU PRESTATIONS */
                    .services-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                        font-size: 12pt;
                    }
                    
                    .services-table tr {
                        border: none;
                    }
                    
                    .services-table td {
                        padding: 8px 0;
                        border: none;
                    }
                    
                    .service-name {
                        width: 60%;
                        text-align: left;
                        font-size: 12pt;
                    }
                    
                    .service-amount {
                        width: 40%;
                        text-align: right;
                        font-size: 12pt;
                        font-weight: bold;
                    }
                    
                    /* TOTAL */
                    .total-section {
                        margin: 12px 0;
                        padding: 10px 0;
                        border-top: 2px solid #000;
                        border-bottom: 2px solid #000;
                    }
                    
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 13pt;
                        font-weight: bold;
                    }
                    
                    .total-label {
                        text-transform: uppercase;
                    }
                    
                    .total-amount {
                        letter-spacing: 1px;
                        font-family: 'Courier New', monospace;
                    }
                    
                    /* MODE DE PAIEMENT */
                    .payment-section {
                        margin: 12px 0;
                        font-size: 10pt;
                    }
                    
                    .payment-method {
                        font-weight: bold;
                        margin: 4px 0;
                    }
                    
                    .payment-date {
                        color: #666;
                        margin: 4px 0;
                    }
                    
                    /* PIED DE PAGE */
                    .footer {
                        margin-top: 20px;
                        padding-top: 12px;
                        border-top: 1px dashed #ddd;
                        text-align: center;
                        font-size: 10pt;
                        line-height: 1.8;
                    }
                    
                    .footer-text {
                        margin: 4px 0;
                        color: #333;
                    }
                    
                    .footer-thanks {
                        font-weight: bold;
                        margin: 8px 0;
                    }
                    
                    .footer-powered {
                        font-size: 9pt;
                        color: #999;
                        margin-top: 12px;
                    }
                    
                    /* IMPRESSION */
                    @media print {
                        body {
                            background: white;
                            margin: 0;
                            padding: 0;
                        }
                        
                        .receipt {
                            max-width: none;
                            margin: 0;
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="receipt">
                    
                    <!-- EN-TÊTE -->
                    <div class="header">
                        <div class="clinic-name">${config.name || 'CLINIQUE'}</div>
                        <div class="clinic-info">
                            <div class="clinic-info-line">${config.address || 'Adresse'}</div>
                            <div class="clinic-info-line">Tel: ${config.phone || 'Numéro'}</div>
                            <div class="clinic-info-line">${config.email || 'Email'}</div>
                        </div>
                    </div>
                    
                    <!-- TITRE -->
                    <div class="receipt-title">R E C U   D E   P A I E M E N T</div>
                    
                    <!-- NUMÉRO REÇU -->
                    <div class="receipt-number">#${ticket?.ticketNumber || 'XXXX'}</div>
                    <div class="receipt-ref">Ref: T-${date.getFullYear()}-${ticket?.ticketNumber || 'XXXX'}</div>
                    
                    <!-- DATE ET HEURE -->
                    <div class="datetime">${dateStr} ${timeStr}</div>
                    <div class="phone-display">Tel: ${config.phone || 'Numéro'}</div>
                    
                    <!-- INFORMATIONS PATIENT -->
                    <div class="patient-section">
                        <div class="patient-info">
                            <span class="patient-info-label">PATIENT</span>
                            <span></span>
                        </div>
                        <div class="patient-info">
                            <span>${ticket?.patientAge || '--'} ans / ${ticket?.patientGender === 'M' ? 'M' : 'F'}</span>
                        </div>
                        <div class="patient-info">
                            <span class="patient-info-label">Paiement:</span>
                            <span>${ticket?.paymentMethod === 'CASH' ? 'Espèces' : ticket?.paymentMethod || 'Espèces'}</span>
                        </div>
                    </div>
                    
                    <!-- DÉTAILS PRESTATIONS -->
                    <div class="detail-title">DETAIL DES PRESTATIONS :</div>
                    
                    <table class="services-table">
                        <tbody>
                            ${servicesHtml}
                        </tbody>
                    </table>
                    
                    <!-- TOTAL -->
                    <div class="total-section">
                        <div class="total-row">
                            <span class="total-label">TOTAL A PAYER</span>
                            <span class="total-amount">${new Intl.NumberFormat('fr-FR').format(Math.round(totalAmount))} F C</span>
                        </div>
                    </div>
                    
                    <!-- MODE DE PAIEMENT -->
                    <div class="payment-section">
                        <div class="payment-method">MODE DE PAIEMENT : ${dateStr}</div>
                    </div>
                    
                    <!-- PIED DE PAGE -->
                    <div class="footer">
                        <div class="footer-thanks">Merci de votre confiance !</div>
                        <div class="footer-text">Conservez ce ticket pour tout suivi médical.</div>
                        <div class="footer-powered">O'CLIC SANTE - Propulsé par Quantum221</div>
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
        
        console.log('RECEIPT-PRINTER: Professional receipt printed - ' + ticket?.ticketNumber);
    };
    
    console.log('RECEIPT-PRINTER: System ready - use printProfessionalReceipt(ticket, consultation)');
})();
