// Amélioration simple des modèles d'impression
(function() {
    'use strict';
    console.log('ENHANCE: Starting enhanced print templates...');
    
    // Fonction améliorée pour ordonnance
    window.printOrdonnance = function(ticket, consultation) {
        const config = window.medicalCenterConfig || {};
        const date = new Date().toLocaleDateString('fr-FR');
        const ordonnanceId = 'ORD-' + Date.now().toString().slice(-6);
        
        let html = '<div style="font-family: Times New Roman; padding: 30px; max-width: 800px; margin: 0 auto;">';
        
        // En-tête amélioré
        html += '<div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #14b8a6; padding-bottom: 20px;">';
        html += '<div style="font-size: 26px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">' + (config.name || 'CENTRE MEDICAL O\'CLIC') + '</div>';
        html += '<div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">' + (config.subtitle || 'Plateforme de Gestion Médicale Intégrée') + '</div>';
        html += '<div style="font-size: 12px; color: #94a3b8;">' + (config.address || 'Rue de la Santé, Conakry, Guinée') + '</div>';
        html += '<div style="font-size: 12px; color: #94a3b8;">📞 ' + (config.phone || '+224 622 123 456') + ' | ✉️ ' + (config.email || 'contact@oclicsante.com') + '</div>';
        html += '<div style="font-size: 10px; color: #94a3b8; margin-top: 10px;">' + (config.registrationNumber || 'N° REG: CM-2024-001') + ' | ' + (config.licenseNumber || 'N° LIC: MED-GN-2024-001') + '</div>';
        html += '</div>';
        
        // Titre
        html += '<div style="text-align: center; margin-bottom: 25px; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 2px solid #16a34a;">';
        html += '<div style="font-size: 20px; font-weight: bold; color: #166534; text-transform: uppercase; letter-spacing: 2px;">📋 ORDONNANCE MÉDICALE</div>';
        html += '<div style="font-size: 12px; color: #15803d; margin-top: 5px;">N°: ' + ordonnanceId + ' | Date: ' + date + '</div>';
        html += '</div>';
        
        // Informations patient
        html += '<div style="margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #14b8a6;">';
        html += '<div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">📋 INFORMATIONS PATIENT</div>';
        html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Nom</div><div style="font-size: 14px; font-weight: bold; color: #1e293b;">' + (ticket.patientName || 'Patient') + '</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Âge</div><div style="font-size: 14px; color: #374151;">' + (ticket.patientAge || 'N/A') + ' ans</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Sexe</div><div style="font-size: 14px; color: #374151;">' + (ticket.patientGender === 'M' ? 'Masculin' : 'Féminin') + '</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Date</div><div style="font-size: 14px; color: #374151;">' + date + '</div></div>';
        html += '</div>';
        html += '</div>';
        
        // Diagnostic
        if (consultation.diagnosis) {
            html += '<div style="margin-bottom: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">';
            html += '<div style="font-size: 16px; font-weight: bold; color: #92400e; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #fde68a; padding-bottom: 8px;">🔬 DIAGNOSTIC MÉDICAL</div>';
            html += '<div style="background: white; padding: 10px; border-radius: 4px; margin-bottom: 10px;"><strong>Principal:</strong> ' + consultation.diagnosis.primary + '</div>';
            if (consultation.diagnosis.secondary) {
                html += '<div style="background: white; padding: 10px; border-radius: 4px; margin-bottom: 10px;"><strong>Secondaire:</strong> ' + consultation.diagnosis.secondary + '</div>';
            }
            html += '<div style="background: white; padding: 10px; border-radius: 4px; font-style: italic;"><strong>Description:</strong> ' + consultation.diagnosis.description + '</div>';
            html += '</div>';
        }
        
        // Prescription
        html += '<div style="margin-bottom: 30px;">';
        html += '<div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px; text-transform: uppercase; border-bottom: 2px solid #14b8a6; padding-bottom: 8px;">💊 PRESCRIPTION MÉDICAMENTEUSE</div>';
        
        consultation.prescription.forEach(function(med, index) {
            html += '<div style="margin-bottom: 20px; padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 8px; position: relative;">';
            html += '<div style="position: absolute; top: -10px; left: 20px; background: #14b8a6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">Médicament #' + (index + 1) + '</div>';
            html += '<div style="font-size: 16px; font-weight: bold; color: #1e293b; margin: 10px 0;">' + med.medicine + '</div>';
            html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">';
            html += '<div><strong>Posologie:</strong> ' + med.dosage + '</div>';
            html += '<div><strong>Durée:</strong> ' + med.duration + '</div>';
            html += '</div>';
            html += '<div style="background: #f0f9ff; padding: 12px; border-radius: 6px; border-left: 4px solid #3b82f6;">';
            html += '<div style="font-size: 12px; color: #1e40af; font-weight: 600; margin-bottom: 4px;">Instructions:</div>';
            html += '<div style="font-size: 13px; color: #374151; font-style: italic;">' + med.instructions + '</div>';
            html += '</div>';
            html += '</div>';
        });
        
        html += '</div>';
        
        // Signatures
        html += '<div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end;">';
        html += '<div style="text-align: left;"><div style="font-size: 10px; color: #64748b;">Cachet du centre:</div>';
        html += '<div style="width: 80px; height: 80px; border: 2px solid #14b8a6; border-radius: 50%; margin-top: 5px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #14b8a6;">O\'CLIC</div></div>';
        html += '<div style="text-align: right;"><div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Signature du médecin:</div>';
        html += '<div style="border-bottom: 2px solid #1e293b; width: 200px; margin-bottom: 5px;"></div>';
        html += '<div style="font-size: 11px; color: #374151; font-weight: bold;">Dr. Médecin Traitant</div></div>';
        html += '</div>';
        
        // Pied de page
        html += '<div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8;">';
        html += 'Document généré le ' + date + ' | Ce document est un certificat médical confidentiel | ' + (config.name || 'CENTRE MEDICAL O\'CLIC');
        html += '</div>';
        
        html += '</div>';
        
        // Imprimer
        const printContainer = document.createElement('div');
        printContainer.innerHTML = html;
        printContainer.style.display = 'none';
        document.body.appendChild(printContainer);
        
        setTimeout(function() {
            window.print();
            setTimeout(function() {
                document.body.removeChild(printContainer);
            }, 1000);
        }, 500);
        
        console.log('ENHANCE: Enhanced ordonnance printed');
    };
    
    // Fonction améliorée pour examens
    window.printExamens = function(ticket, consultation) {
        const config = window.medicalCenterConfig || {};
        const date = new Date().toLocaleDateString('fr-FR');
        const examenId = 'EXAM-' + Date.now().toString().slice(-6);
        
        let html = '<div style="font-family: Times New Roman; padding: 30px; max-width: 800px; margin: 0 auto;">';
        
        // En-tête
        html += '<div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">';
        html += '<div style="font-size: 26px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">' + (config.name || 'CENTRE MEDICAL O\'CLIC') + '</div>';
        html += '<div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">' + (config.subtitle || 'Plateforme de Gestion Médicale Intégrée') + '</div>';
        html += '<div style="font-size: 12px; color: #94a3b8;">' + (config.address || 'Rue de la Santé, Conakry, Guinée') + '</div>';
        html += '<div style="font-size: 12px; color: #94a3b8;">📞 ' + (config.phone || '+224 622 123 456') + ' | ✉️ ' + (config.email || 'contact@oclicsante.com') + '</div>';
        html += '</div>';
        
        // Titre
        html += '<div style="text-align: center; margin-bottom: 25px; padding: 15px; background: #dbeafe; border-radius: 8px; border: 2px solid #2563eb;">';
        html += '<div style="font-size: 20px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 2px;">📋 RÉSULTATS D\'EXAMENS MÉDICAUX</div>';
        html += '<div style="font-size: 12px; color: #1e40af; margin-top: 5px;">N°: ' + examenId + ' | Date: ' + date + '</div>';
        html += '</div>';
        
        // Informations patient
        html += '<div style="margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">';
        html += '<div style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #bfdbfe; padding-bottom: 8px;">📋 INFORMATIONS PATIENT</div>';
        html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Nom</div><div style="font-size: 14px; font-weight: bold; color: #1e293b;">' + (ticket.patientName || 'Patient') + '</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Âge</div><div style="font-size: 14px; color: #374151;">' + (ticket.patientAge || 'N/A') + ' ans</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Sexe</div><div style="font-size: 14px; color: #374151;">' + (ticket.patientGender === 'M' ? 'Masculin' : 'Féminin') + '</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Date</div><div style="font-size: 14px; color: #374151;">' + date + '</div></div>';
        html += '</div>';
        html += '</div>';
        
        // Examen clinique
        if (consultation.clinicalExam) {
            html += '<div style="margin-bottom: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">';
            html += '<div style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #bfdbfe; padding-bottom: 8px;">🏥 EXAMEN CLINIQUE</div>';
            html += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">';
            html += '<div style="background: white; padding: 10px; border-radius: 6px; text-align: center;"><div style="font-size: 12px; color: #64748b;">Pression</div><div style="font-size: 18px; font-weight: bold; color: #1e293b;">' + consultation.clinicalExam.bloodPressure + '</div></div>';
            html += '<div style="background: white; padding: 10px; border-radius: 6px; text-align: center;"><div style="font-size: 12px; color: #64748b;">Cœur</div><div style="font-size: 18px; font-weight: bold; color: #1e293b;">' + consultation.clinicalExam.heartRate + ' bpm</div></div>';
            html += '<div style="background: white; padding: 10px; border-radius: 6px; text-align: center;"><div style="font-size: 12px; color: #64748b;">Température</div><div style="font-size: 18px; font-weight: bold; color: #1e293b;">' + consultation.clinicalExam.temperature + '°C</div></div>';
            html += '</div>';
            html += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;">';
            html += '<div style="background: white; padding: 10px; border-radius: 6px; text-align: center;"><div style="font-size: 12px; color: #64748b;">Poids</div><div style="font-size: 18px; font-weight: bold; color: #1e293b;">' + consultation.clinicalExam.weight + ' kg</div></div>';
            html += '<div style="background: white; padding: 10px; border-radius: 6px; text-align: center;"><div style="font-size: 12px; color: #64748b;">Taille</div><div style="font-size: 18px; font-weight: bold; color: #1e293b;">' + consultation.clinicalExam.height + ' cm</div></div>';
            const imc = (consultation.clinicalExam.weight / ((consultation.clinicalExam.height / 100) ** 2)).toFixed(1);
            html += '<div style="background: white; padding: 10px; border-radius: 6px; text-align: center;"><div style="font-size: 12px; color: #64748b;">IMC</div><div style="font-size: 18px; font-weight: bold; color: #1e293b;">' + imc + ' kg/m²</div></div>';
            html += '</div>';
            if (consultation.clinicalExam.notes) {
                html += '<div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;"><div style="font-size: 12px; color: #1e40af; font-weight: 600; margin-bottom: 4px;">Observations:</div><div style="font-size: 13px; color: #374151; font-style: italic;">' + consultation.clinicalExam.notes + '</div></div>';
            }
            html += '</div>';
        }
        
        // Résultats de laboratoire
        html += '<div style="margin-bottom: 30px;">';
        html += '<div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px; text-transform: uppercase; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">🧪 RÉSULTATS DE LABORATOIRE</div>';
        
        consultation.exams.forEach(function(exam, index) {
            html += '<div style="margin-bottom: 20px; padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 8px; position: relative;">';
            html += '<div style="position: absolute; top: -10px; left: 20px; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">Examen #' + (index + 1) + '</div>';
            html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; margin-top: 5px;">';
            html += '<div><div style="font-size: 16px; font-weight: bold; color: #1e293b;">' + exam.type + '</div><div style="font-size: 12px; color: #64748b;">Date: ' + new Date(exam.date).toLocaleDateString('fr-FR') + '</div></div>';
            const statusStyle = exam.status === 'completed' ? 'background: #dcfce7; color: #166534;' : 'background: #fef3c7; color: #92400e;';
            const statusText = exam.status === 'completed' ? '✅ ANALYSÉ' : '⏱ EN ATTENTE';
            html += '<div style="padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; ' + statusStyle + '">' + statusText + '</div>';
            html += '</div>';
            html += '<div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;"><div style="font-size: 12px; color: #1e40af; font-weight: 600; margin-bottom: 4px;">Résultat:</div><div style="font-size: 14px; color: #374151;">' + exam.result + '</div></div>';
            html += '</div>';
        });
        
        html += '</div>';
        
        // Signatures
        html += '<div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end;">';
        html += '<div style="text-align: left;"><div style="font-size: 10px; color: #64748b;">Cachet du laboratoire:</div>';
        html += '<div style="width: 80px; height: 80px; border: 2px solid #3b82f6; border-radius: 50%; margin-top: 5px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #3b82f6;">LABO</div></div>';
        html += '<div style="text-align: right;"><div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Signature du biologiste:</div>';
        html += '<div style="border-bottom: 2px solid #1e293b; width: 200px; margin-bottom: 5px;"></div>';
        html += '<div style="font-size: 11px; color: #374151; font-weight: bold;">Dr. Biologiste</div></div>';
        html += '</div>';
        
        // Pied de page
        html += '<div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8;">';
        html += 'Document généré le ' + date + ' | Résultats confidentiels destinés au médecin traitant | ' + (config.name || 'CENTRE MEDICAL O\'CLIC');
        html += '</div>';
        
        html += '</div>';
        
        // Imprimer
        const printContainer = document.createElement('div');
        printContainer.innerHTML = html;
        printContainer.style.display = 'none';
        document.body.appendChild(printContainer);
        
        setTimeout(function() {
            window.print();
            setTimeout(function() {
                document.body.removeChild(printContainer);
            }, 1000);
        }, 500);
        
        console.log('ENHANCE: Enhanced examens printed');
    };
    
    console.log('ENHANCE: Enhanced print templates ready');
})();
