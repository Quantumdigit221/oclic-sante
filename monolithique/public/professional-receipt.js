// Système complet d'impression de reçu professionnel O'CLIC SANTE
// Affiche le reçu EXACTEMENT au format demandé
(function() {
    'use strict';
    console.log('RECEIPT-SYSTEM: Initializing professional receipt system...');
    
    // Configuration du centre médical
    const CLINIC_CONFIG = {
        name: 'CLINIQUE SARR',
        address: 'Avenue valdiodio ndiaye, Kaolack',
        phone: '774526363',
        email: 'byetiham1@gmail.com',
        poweredBy: 'O\'CLIC SANTE - Propulsé par Quantum Digit'
    };
    
    // Impression de reçu professionnel au format exact
    window.printProfessionalReceipt = function(ticket, consultation) {
        const date = new Date();
        const dateStr = ('0' + date.getDate()).slice(-2) + '/' + 
                       ('0' + (date.getMonth() + 1)).slice(-2) + '/' + 
                       date.getFullYear();
        const timeStr = ('0' + date.getHours()).slice(-2) + ':' + 
                       ('0' + date.getMinutes()).slice(-2);
        
        const config = window.medicalCenterConfig || CLINIC_CONFIG;
        
        // Montant total
        let totalAmount = ticket?.amount || 0;
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reçu - ${ticket?.ticketNumber || 'N/A'}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 10mm 15mm;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                    }
                    
                    body {
                        font-family: 'Courier New', monospace;
                        color: #000;
                        background: white;
                        line-height: 1.3;
                        font-size: 11pt;
                    }
                    
                    .receipt {
                        width: 100%;
                        max-width: 500px;
                        margin: 0 auto;
                        text-align: center;
                    }
                    
                    /* EN-TÊTE CLINIQUE */
                    .header {
                        text-align: center;
                        margin-bottom: 15px;
                        border-bottom: 1px solid #000;
                        padding-bottom: 10px;
                    }
                    
                    .clinic-name {
                        font-size: 14pt;
                        font-weight: bold;
                        letter-spacing: 3px;
                        margin-bottom: 5px;
                    }
                    
                    .clinic-info {
                        font-size: 10pt;
                        line-height: 1.5;
                    }
                    
                    .clinic-info-line {
                        margin: 2px 0;
                    }
                    
                    /* TITRE */
                    .title {
                        text-align: center;
                        font-size: 13pt;
                        font-weight: bold;
                        letter-spacing: 5px;
                        margin: 15px 0;
                        text-transform: uppercase;
                    }
                    
                    /* NUMÉRO ET REF */
                    .ticket-info {
                        text-align: center;
                        margin: 10px 0;
                    }
                    
                    .ticket-number {
                        font-size: 16pt;
                        font-weight: bold;
                        letter-spacing: 2px;
                    }
                    
                    .ticket-ref {
                        font-size: 10pt;
                        margin: 5px 0;
                    }
                    
                    /* DATE/HEURE */
                    .datetime {
                        text-align: center;
                        font-size: 10pt;
                        margin: 10px 0;
                    }
                    
                    .phone {
                        text-align: center;
                        font-size: 10pt;
                        margin-bottom: 15px;
                    }
                    
                    /* INFOS PATIENT */
                    .section {
                        text-align: left;
                        margin: 10px 0;
                        padding: 0;
                    }
                    
                    .section-title {
                        font-weight: bold;
                        font-size: 10pt;
                        text-transform: uppercase;
                        margin-bottom: 5px;
                    }
                    
                    .section-content {
                        font-size: 10pt;
                        margin-left: 10px;
                    }
                    
                    .info-line {
                        margin: 3px 0;
                    }
                    
                    /* PRESTATIONS */
                    .services {
                        margin: 15px 0;
                        text-align: left;
                        font-size: 10pt;
                    }
                    
                    .service-line {
                        display: flex;
                        justify-content: space-between;
                        margin: 5px 0;
                        padding: 3px 0;
                    }
                    
                    .service-name {
                        flex: 1;
                    }
                    
                    .service-amount {
                        text-align: right;
                        min-width: 80px;
                        font-weight: bold;
                    }
                    
                    /* TOTAL */
                    .total-section {
                        border-top: 2px solid #000;
                        border-bottom: 2px solid #000;
                        margin: 15px 0;
                        padding: 8px 0;
                        text-align: left;
                    }
                    
                    .total-line {
                        display: flex;
                        justify-content: space-between;
                        font-size: 12pt;
                        font-weight: bold;
                    }
                    
                    .total-label {
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    
                    .total-amount {
                        min-width: 100px;
                        text-align: right;
                    }
                    
                    /* MODE PAIEMENT */
                    .payment {
                        font-size: 10pt;
                        margin: 10px 0;
                        text-align: left;
                    }
                    
                    /* SIGNATURE */
                    .signature {
                        margin: 20px 0;
                        text-align: center;
                        font-size: 10pt;
                    }
                    
                    .signature-line {
                        margin: 10px 0;
                        font-weight: bold;
                        letter-spacing: 2px;
                    }
                    
                    .signature-space {
                        height: 40px;
                        margin: 10px 0;
                    }
                    
                    /* PIED DE PAGE */
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        padding-top: 10px;
                        border-top: 1px dashed #000;
                        font-size: 10pt;
                        line-height: 1.6;
                    }
                    
                    .footer-thanks {
                        font-weight: bold;
                        margin: 5px 0;
                    }
                    
                    .footer-text {
                        margin: 3px 0;
                    }
                    
                    .footer-powered {
                        margin-top: 8px;
                        font-size: 9pt;
                    }
                    
                    @media print {
                        body { margin: 0; padding: 0; }
                        .receipt { max-width: none; }
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
                            <div class="clinic-info-line">Tel: ${config.phone || 'Téléphone'}</div>
                            <div class="clinic-info-line">${config.email || 'Email'}</div>
                        </div>
                    </div>
                    
                    <!-- NUMÉRO DE TICKET & DATE -->
                    <div class="ticket-info">
                        <div style="text-align: left; margin: 10px 0; font-size: 10pt;">
                            <div style="margin-bottom: 3px;"><strong>NUMÉRO DE TICKET</strong></div>
                            <div>${dateStr} ${timeStr}</div>
                        </div>
                    </div>
                    
                    <!-- PATIENT -->
                    <div class="section">
                        <div class="section-title">PATIENT</div>
                        <div class="section-content">
                            <div class="info-line">${ticket?.patientAge || '--'} ans / ${ticket?.patientGender === 'M' ? 'M' : 'F'}</div>
                            <div class="info-line">Paiement: ${ticket?.paymentMethod === 'CASH' ? 'Espèces' : ticket?.paymentMethod || 'Espèces'}</div>
                        </div>
                    </div>
                    
                    <!-- TITRE REÇU -->
                    <div class="title">R E C U D E P A I E M E N T</div>
                    
                    <!-- NUMÉRO REÇU -->
                    <div class="ticket-number">#${ticket?.ticketNumber || 'XXXX'}</div>
                    <div class="ticket-ref">Ref: T-${date.getFullYear()}-${ticket?.ticketNumber || 'XXXX'}</div>
                    
                    <div class="datetime">${dateStr} ${timeStr}</div>
                    <div class="phone">Tel: ${config.phone || 'Téléphone'}</div>
                    
                    <!-- PATIENT ADRESSE -->
                    <div class="section">
                        <div class="section-title">PATIENT :</div>
                        <div class="section-content">
                            <div class="info-line">${ticket?.patientName || 'PATIENT'}</div>
                            <div class="info-line">${config.address || 'Adresse'}</div>
                            <div class="info-line">Tel: ${config.phone || 'Téléphone'}</div>
                        </div>
                    </div>
                    
                    <!-- PRESTATIONS -->
                    <div class="services">
                        <div style="font-weight: bold; margin-bottom: 8px; text-transform: uppercase;">DETAIL DES PRESTATIONS :</div>
                        <div class="service-line">
                            <div class="service-name">${ticket?.serviceName || 'Service'}</div>
                            <div class="service-amount">${new Intl.NumberFormat('fr-FR').format(Math.round(totalAmount))} F</div>
                        </div>
                    </div>
                    
                    <!-- TOTAL -->
                    <div class="total-section">
                        <div class="total-line">
                            <div class="total-label">TOTAL A PAYER</div>
                            <div class="total-amount">${new Intl.NumberFormat('fr-FR').format(Math.round(totalAmount))} F C</div>
                        </div>
                    </div>
                    
                    <!-- MODE PAIEMENT -->
                    <div class="payment">
                        MODE DE PAIEMENT : ${dateStr}
                    </div>
                    
                    <!-- SIGNATURE -->
                    <div class="signature">
                        <div class="signature-line">* T-${date.getFullYear()}-${ticket?.ticketNumber || 'XXXX'} *</div>
                        <div style="margin: 15px 0;">Signature & Cachet</div>
                        <div class="signature-space"></div>
                    </div>
                    
                    <!-- PIED DE PAGE -->
                    <div class="footer">
                        <div class="footer-thanks">Merci de votre confiance !</div>
                        <div class="footer-text">Conservez ce ticket pour tout suivi médical.</div>
                        <div class="footer-powered">${config.poweredBy || 'O\'CLIC SANTE - Propulsé par Quantum Digit'}</div>
                    </div>
                    
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '', 'width=600,height=900');
        printWindow.document.write(html);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            setTimeout(() => printWindow.close(), 500);
        }, 250);
        
        console.log('RECEIPT-SYSTEM: Receipt printed - ' + ticket?.ticketNumber);
    };
    
    // Alias pour compatibilité
    window.printTicketReceipt = window.printProfessionalReceipt;
    
    console.log('RECEIPT-SYSTEM: Ready - use printProfessionalReceipt(ticket, consultation)');
})();
