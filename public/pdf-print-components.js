// Composants d'impression PDF pour ordonnances et examens
(function() {
    'use strict';
    
    console.log('PDF: Initializing print components...');
    
    // Styles CSS pour l'impression
    const printStyles = `
        @media print {
            body * {
                visibility: hidden;
            }
            .print-area, .print-area * {
                visibility: visible;
            }
            .print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px;
            }
            .no-print {
                display: none !important;
            }
            @page {
                margin: 20mm;
                size: A4;
            }
        }
        
        .print-area {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #000;
        }
        
        .print-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .print-logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .print-subtitle {
            font-size: 14px;
            color: #666;
        }
        
        .print-section {
            margin-bottom: 25px;
        }
        
        .print-section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
        }
        
        .print-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .print-info-item {
            margin-bottom: 8px;
        }
        
        .print-label {
            font-weight: bold;
            font-size: 12px;
        }
        
        .print-value {
            font-size: 14px;
        }
        
        .print-medicine {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        
        .print-medicine-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .print-medicine-details {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .print-medicine-instructions {
            font-style: italic;
            font-size: 12px;
            background: #f9f9f9;
            padding: 8px;
            border-left: 3px solid #14b8a6;
        }
        
        .print-exam {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        
        .print-exam-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .print-exam-type {
            font-weight: bold;
            font-size: 14px;
        }
        
        .print-exam-status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }
        
        .print-exam-result {
            background: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
        }
        
        .print-footer {
            margin-top: 50px;
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 20px;
            font-size: 12px;
            color: #666;
        }
        
        .print-signature {
            margin-top: 30px;
            text-align: right;
        }
        
        .print-signature-line {
            border-bottom: 1px solid #000;
            width: 200px;
            margin-left: auto;
            margin-bottom: 5px;
        }
        
        .print-signature-text {
            font-size: 12px;
            color: #666;
        }
    `;
    
    // Ajouter les styles d'impression
    function addPrintStyles() {
        if (!document.getElementById('print-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'print-styles';
            styleSheet.textContent = printStyles;
            document.head.appendChild(styleSheet);
        }
    }
    
    // Fonction pour générer le HTML d'ordonnance
    function generateOrdonnanceHTML(ticket, consultation) {
        const date = new Date().toLocaleDateString('fr-FR');
        const patient = ticket.patientName || 'Patient';
        
        // Utiliser la configuration du centre si disponible
        let headerHtml = '';
        let footerHtml = '';
        
        if (typeof window.generateCenterHeader === 'function') {
            headerHtml = window.generateCenterHeader('full');
        } else {
            // Fallback si la configuration n'est pas chargée
            headerHtml = `
                <div class="print-header">
                    <div class="print-logo">CENTRE MEDICAL O'CLIC</div>
                    <div class="print-subtitle">Plateforme de Gestion Médicale Intégrée</div>
                    <div class="print-subtitle">Rue de la Santé, Conakry, Guinée</div>
                    <div class="print-subtitle">📞 +224 622 123 456 | ✉️ contact@oclicsante.com</div>
                </div>
            `;
        }
        
        if (typeof window.generateCenterFooter === 'function') {
            footerHtml = window.generateCenterFooter('full');
        } else {
            // Fallback si la configuration n'est pas chargée
            footerHtml = `
                <div class="print-footer">
                    <div>Ce document est confidentiel et destiné uniquement au patient et au personnel médical</div>
                    <div style="margin-top: 10px;">CENTRE MEDICAL O'CLIC - ${date}</div>
                </div>
            `;
        }
        
        return `
            <div class="print-area">
                ${headerHtml}
                
                <div class="print-section">
                    <div class="print-section-title">ORDONNANCE MÉDICALE</div>
                    <div class="print-info-grid">
                        <div class="print-info-item">
                            <div class="print-label">Patient:</div>
                            <div class="print-value">${patient}</div>
                        </div>
                        <div class="print-info-item">
                            <div class="print-label">Date:</div>
                            <div class="print-value">${date}</div>
                        </div>
                        <div class="print-info-item">
                            <div class="print-label">Âge:</div>
                            <div class="print-value">${ticket.patientAge || 'N/A'} ans</div>
                        </div>
                        <div class="print-info-item">
                            <div class="print-label">Sexe:</div>
                            <div class="print-value">${ticket.patientGender === 'M' ? 'Masculin' : 'Féminin'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="print-section">
                    <div class="print-section-title">PRESCRIPTION</div>
                    ${consultation.prescription.map((med, index) => `
                        <div class="print-medicine">
                            <div class="print-medicine-name">${index + 1}. ${med.medicine}</div>
                            <div class="print-medicine-details">
                                <strong>Posologie:</strong> ${med.dosage}<br>
                                <strong>Durée:</strong> ${med.duration}
                            </div>
                            <div class="print-medicine-instructions">
                                <strong>Instructions:</strong> ${med.instructions}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${consultation.diagnosis ? `
                    <div class="print-section">
                        <div class="print-section-title">DIAGNOSTIC</div>
                        <div style="margin-bottom: 10px;">
                            <strong>Principal:</strong> ${consultation.diagnosis.primary}
                        </div>
                        ${consultation.diagnosis.secondary ? `
                            <div style="margin-bottom: 10px;">
                                <strong>Secondaire:</strong> ${consultation.diagnosis.secondary}
                            </div>
                        ` : ''}
                        <div>
                            <strong>Description:</strong> ${consultation.diagnosis.description}
                        </div>
                    </div>
                ` : ''}
                
                ${footerHtml}
                
                <div class="print-signature">
                    <div class="print-signature-line"></div>
                    <div class="print-signature-text">Signature et cachet du médecin</div>
                </div>
            </div>
        `;
    }
    
    // Fonction pour générer le HTML de résultats d'examens
    function generateExamensHTML(ticket, consultation) {
        const date = new Date().toLocaleDateString('fr-FR');
        const patient = ticket.patientName || 'Patient';
        
        // Utiliser la configuration du centre si disponible
        let headerHtml = '';
        let footerHtml = '';
        
        if (typeof window.generateCenterHeader === 'function') {
            headerHtml = window.generateCenterHeader('full');
        } else {
            // Fallback si la configuration n'est pas chargée
            headerHtml = `
                <div class="print-header">
                    <div class="print-logo">CENTRE MEDICAL O'CLIC</div>
                    <div class="print-subtitle">Plateforme de Gestion Médicale Intégrée</div>
                    <div class="print-subtitle">Rue de la Santé, Conakry, Guinée</div>
                    <div class="print-subtitle">📞 +224 622 123 456 | ✉️ contact@oclicsante.com</div>
                </div>
            `;
        }
        
        if (typeof window.generateCenterFooter === 'function') {
            footerHtml = window.generateCenterFooter('full');
        } else {
            // Fallback si la configuration n'est pas chargée
            footerHtml = `
                <div class="print-footer">
                    <div>Ces résultats sont confidentiels et destinés uniquement au médecin traitant</div>
                    <div style="margin-top: 10px;">CENTRE MEDICAL O'CLIC - ${date}</div>
                </div>
            `;
        }
        
        return `
            <div class="print-area">
                ${headerHtml}
                
                <div class="print-section">
                    <div class="print-section-title">RÉSULTATS D'EXAMENS</div>
                    <div class="print-info-grid">
                        <div class="print-info-item">
                            <div class="print-label">Patient:</div>
                            <div class="print-value">${patient}</div>
                        </div>
                        <div class="print-info-item">
                            <div class="print-label">Date:</div>
                            <div class="print-value">${date}</div>
                        </div>
                        <div class="print-info-item">
                            <div class="print-label">Âge:</div>
                            <div class="print-value">${ticket.patientAge || 'N/A'} ans</div>
                        </div>
                        <div class="print-info-item">
                            <div class="print-label">Sexe:</div>
                            <div class="print-value">${ticket.patientGender === 'M' ? 'Masculin' : 'Féminin'}</div>
                        </div>
                    </div>
                </div>
                
                ${consultation.clinicalExam ? `
                    <div class="print-section">
                        <div class="print-section-title">EXAMEN CLINIQUE</div>
                        <div class="print-info-grid">
                            <div class="print-info-item">
                                <div class="print-label">Pression Artérielle:</div>
                                <div class="print-value">${consultation.clinicalExam.bloodPressure}</div>
                            </div>
                            <div class="print-info-item">
                                <div class="print-label">Fréquence Cardiaque:</div>
                                <div class="print-value">${consultation.clinicalExam.heartRate} bpm</div>
                            </div>
                            <div class="print-info-item">
                                <div class="print-label">Température:</div>
                                <div class="print-value">${consultation.clinicalExam.temperature}°C</div>
                            </div>
                            <div class="print-info-item">
                                <div class="print-label">Poids:</div>
                                <div class="print-value">${consultation.clinicalExam.weight} kg</div>
                            </div>
                            <div class="print-info-item">
                                <div class="print-label">Taille:</div>
                                <div class="print-value">${consultation.clinicalExam.height} cm</div>
                            </div>
                        </div>
                        ${consultation.clinicalExam.notes ? `
                            <div style="margin-top: 15px;">
                                <div class="print-label">Notes Cliniques:</div>
                                <div style="background: #f9f9f9; padding: 10px; border-left: 3px solid #14b8a6; margin-top: 5px;">
                                    ${consultation.clinicalExam.notes}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div class="print-section">
                    <div class="print-section-title">RÉSULTATS DE LABORATOIRE</div>
                    ${consultation.exams.map((exam, index) => `
                        <div class="print-exam">
                            <div class="print-exam-header">
                                <div class="print-exam-type">${index + 1}. ${exam.type}</div>
                                <div class="print-exam-status" style="background: ${exam.status === 'completed' ? '#dcfce7' : '#fef3c7'}; color: ${exam.status === 'completed' ? '#166534' : '#92400e'};">
                                    ${exam.status === 'completed' ? 'Terminé' : 'En attente'}
                                </div>
                            </div>
                            <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
                                Date: ${new Date(exam.date).toLocaleDateString('fr-FR')}
                            </div>
                            <div class="print-exam-result">
                                <strong>Résultat:</strong> ${exam.result}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${consultation.diagnosis ? `
                    <div class="print-section">
                        <div class="print-section-title">DIAGNOSTIC</div>
                        <div style="margin-bottom: 10px;">
                            <strong>Principal:</strong> ${consultation.diagnosis.primary}
                        </div>
                        ${consultation.diagnosis.secondary ? `
                            <div style="margin-bottom: 10px;">
                                <strong>Secondaire:</strong> ${consultation.diagnosis.secondary}
                            </div>
                        ` : ''}
                        <div>
                            <strong>Description:</strong> ${consultation.diagnosis.description}
                        </div>
                    </div>
                ` : ''}
                
                ${footerHtml}
                
                <div class="print-signature">
                    <div class="print-signature-line"></div>
                    <div class="print-signature-text">Signature et cachet du médecin</div>
                </div>
            </div>
        `;
    }
    
    // Fonction pour imprimer une ordonnance
    window.printOrdonnance = function(ticket, consultation) {
        addPrintStyles();
        
        // Créer un conteneur temporaire pour l'impression
        const printContainer = document.createElement('div');
        printContainer.innerHTML = generateOrdonnanceHTML(ticket, consultation);
        printContainer.style.display = 'none';
        document.body.appendChild(printContainer);
        
        // Attendre que le contenu soit chargé puis imprimer
        setTimeout(() => {
            window.print();
            
            // Nettoyer après l'impression
            setTimeout(() => {
                document.body.removeChild(printContainer);
            }, 1000);
        }, 500);
        
        console.log('PDF: Ordonnance sent to print');
    };
    
    // Fonction pour imprimer les examens
    window.printExamens = function(ticket, consultation) {
        addPrintStyles();
        
        // Créer un conteneur temporaire pour l'impression
        const printContainer = document.createElement('div');
        printContainer.innerHTML = generateExamensHTML(ticket, consultation);
        printContainer.style.display = 'none';
        document.body.appendChild(printContainer);
        
        // Attendre que le contenu soit chargé puis imprimer
        setTimeout(() => {
            window.print();
            
            // Nettoyer après l'impression
            setTimeout(() => {
                document.body.removeChild(printContainer);
            }, 1000);
        }, 500);
        
        console.log('PDF: Examens sent to print');
    };
    
    // Fonction pour créer un PDF avec jsPDF (alternative)
    window.createOrdonnancePDF = function(ticket, consultation) {
        // Vérifier si jsPDF est disponible
        if (typeof window.jspdf !== 'undefined') {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Ajouter le contenu au PDF
                let yPosition = 20;
                
                // Header
                doc.setFontSize(20);
                doc.text('O\'CLIC SANTE', 105, yPosition, { align: 'center' });
                yPosition += 10;
                
                doc.setFontSize(12);
                doc.text('Plateforme de Gestion Médicale', 105, yPosition, { align: 'center' });
                yPosition += 15;
                
                // Info patient
                doc.setFontSize(14);
                doc.text('ORDONNANCE MÉDICALE', 20, yPosition);
                yPosition += 15;
                
                doc.setFontSize(11);
                doc.text(`Patient: ${ticket.patientName || 'Patient'}`, 20, yPosition);
                yPosition += 8;
                doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPosition);
                yPosition += 8;
                doc.text(`Âge: ${ticket.patientAge || 'N/A'} ans`, 20, yPosition);
                yPosition += 15;
                
                // Prescription
                doc.setFontSize(12);
                doc.text('PRESCRIPTION:', 20, yPosition);
                yPosition += 10;
                
                consultation.prescription.forEach((med, index) => {
                    doc.setFontSize(11);
                    doc.text(`${index + 1}. ${med.medicine}`, 25, yPosition);
                    yPosition += 6;
                    doc.setFontSize(10);
                    doc.text(`   Posologie: ${med.dosage}`, 25, yPosition);
                    yPosition += 5;
                    doc.text(`   Durée: ${med.duration}`, 25, yPosition);
                    yPosition += 5;
                    doc.text(`   Instructions: ${med.instructions}`, 25, yPosition);
                    yPosition += 10;
                });
                
                // Sauvegarder le PDF
                doc.save(`ordonnance_${ticket.patientName}_${new Date().toISOString().split('T')[0]}.pdf`);
                
                console.log('PDF: Ordonnance PDF created successfully');
            } catch (error) {
                console.error('PDF: Error creating PDF with jsPDF:', error);
                alert('Erreur lors de la création du PDF. Utilisation de l\'impression standard.');
                printOrdonnance(ticket, consultation);
            }
        } else {
            // Fallback vers l'impression standard si jsPDF n'est pas disponible
            console.log('PDF: jsPDF not available, using standard print');
            printOrdonnance(ticket, consultation);
        }
    };
    
    console.log('PDF: Print components initialized');
})();
