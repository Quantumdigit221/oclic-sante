// Modèle d'ordonnance médicale simplifié et direct
(function() {
    'use strict';
    
    console.log('SIMPLE-ORD: Initializing simple ordonnance template...');
    
    // Fonction pour générer une ordonnance simple et directe
    function generateSimpleOrdonnance(patientData, prescriptionData) {
        const config = window.medicalCenterConfig || {};
        const currentDate = new Date().toLocaleDateString('fr-FR');
        const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        let html = '<div style="font-family: Times New Roman, serif; line-height: 1.6; color: #000; padding: 40px; max-width: 600px; margin: 0 auto;">';
        
        // En-tête simple
        html += '<div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">';
        html += '<div style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 8px; letter-spacing: 2px;">ORDONNANCE MÉDICALE</div>';
        html += '<div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">' + (config.name || 'O\'CLIC SANTE') + '</div>';
        html += '<div style="font-size: 12px; color: #94a3b8;">' + (config.address || 'Conakry, Guinée') + '</div>';
        html += '<div style="font-size: 12px; color: #94a3b8;">📞 ' + (config.phone || '+224 622 123 456') + '</div>';
        html += '</div>';
        
        // Informations principales
        html += '<div style="margin-bottom: 25px;">';
        html += '<div style="font-size: 14px; color: #374151; margin-bottom: 8px;"><strong>Date:</strong> ' + currentDate + '</div>';
        html += '<div style="font-size: 14px; color: #374151; margin-bottom: 8px;"><strong>Patient:</strong> ' + (patientData.name || 'Mamadou Diop') + '</div>';
        html += '<div style="font-size: 14px; color: #374151; margin-bottom: 8px;"><strong>Médecin:</strong> ' + (patientData.doctor || 'Administrateur O\'CLIC SANTE') + '</div>';
        html += '</div>';
        
        // Prescription
        html += '<div style="margin-bottom: 30px;">';
        html += '<div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 8px;">Prescription:</div>';
        
        if (prescriptionData && prescriptionData.length > 0) {
            prescriptionData.forEach(function(med) {
                html += '<div style="margin-bottom: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid #14b8a6;">';
                html += '<div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">' + med.medicine + '</div>';
                
                if (med.dosage) {
                    html += '<div style="font-size: 14px; color: #374151; margin-bottom: 5px;"><strong>Posologie:</strong> ' + med.dosage + '</div>';
                }
                if (med.quantity) {
                    html += '<div style="font-size: 14px; color: #374151; margin-bottom: 5px;"><strong>Quantité:</strong> ' + med.quantity + '</div>';
                }
                if (med.duration) {
                    html += '<div style="font-size: 14px; color: #374151; margin-bottom: 5px;"><strong>Durée:</strong> ' + med.duration + '</div>';
                }
                if (med.instructions) {
                    html += '<div style="font-size: 13px; color: #64748b; font-style: italic; margin-top: 10px;">' + med.instructions + '</div>';
                }
                
                html += '</div>';
            });
        } else {
            // Prescription par défaut
            html += '<div style="margin-bottom: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid #14b8a6;">';
            html += '<div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">Paracétamol 500mg</div>';
            html += '<div style="font-size: 14px; color: #374151; margin-bottom: 5px;"><strong>Posologie:</strong> Matin</div>';
            html += '<div style="font-size: 14px; color: #374151; margin-bottom: 5px;"><strong>Quantité:</strong> 1</div>';
            html += '</div>';
        }
        
        html += '</div>';
        
        // Instructions générales
        html += '<div style="margin-bottom: 30px; padding: 15px; background: #fef3c7; border-radius: 6px; font-size: 12px; color: #92400e; line-height: 1.5;">';
        html += '<strong>Instructions:</strong> Prendre les médicaments selon la posologie indiquée. Ne pas dépasser la dose prescrite. En cas d\'effets secondaires, consulter immédiatement un médecin.';
        html += '</div>';
        
        // Signature
        html += '<div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end;">';
        html += '<div style="text-align: left;">';
        html += '<div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Signature et cachet du médecin</div>';
        html += '<div style="width: 100px; height: 60px; border: 2px solid #1e293b; margin-top: 5px;"></div>';
        html += '</div>';
        html += '<div style="text-align: right; font-size: 12px; color: #94a3b8;">';
        html += currentDate + ' ' + currentTime + '<br>';
        html += 'Ordonnance - ' + (patientData.name || 'Mamadou Diop');
        html += '</div>';
        html += '</div>';
        
        html += '</div>';
        
        return html;
    }
    
    // Fonction d'impression simple
    window.printSimpleOrdonnance = function(patientData, prescriptionData) {
        const printContainer = document.createElement('div');
        printContainer.innerHTML = generateSimpleOrdonnance(patientData, prescriptionData);
        printContainer.style.display = 'none';
        document.body.appendChild(printContainer);
        
        setTimeout(function() {
            window.print();
            setTimeout(function() {
                document.body.removeChild(printContainer);
            }, 1000);
        }, 500);
        
        console.log('SIMPLE-ORD: Simple ordonnance printed');
    };
    
    // Remplacer la fonction d'impression existante
    window.printOrdonnance = function(ticket, consultation) {
        const patientData = {
            name: ticket.patientName || 'Mamadou Diop',
            doctor: 'Administrateur O\'CLIC SANTE'
        };
        
        const prescriptionData = consultation.prescription || [
            {
                medicine: 'Paracétamol 500mg',
                dosage: 'Mat',
                quantity: '1'
            }
        ];
        
        printSimpleOrdonnance(patientData, prescriptionData);
    };
    
    console.log('SIMPLE-ORD: Simple ordonnance template ready');
})();
