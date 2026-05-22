/**
 * Compatibilité : redirige vers le ticket minimal (6 champs seulement).
 */
(function () {
    'use strict';
    function printReceipt(ticket) {
        if (typeof window.oclicPrintMinimalTicket === 'function') {
            window.oclicPrintMinimalTicket(ticket);
            return;
        }
        console.warn('professional-receipt: ticket-print-minimal.js non chargé');
        window.print();
    }
    window.printProfessionalReceipt = printReceipt;
    window.printTicketReceipt = printReceipt;
})();
