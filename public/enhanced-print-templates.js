// Amélioration des modèles d'impression pour ordonnances et examens
(function() {
    'use strict';
    
    console.log('PRINT-ENHANCE: Initializing enhanced print templates...');
    
    // Fonction pour générer un en-tête médical amélioré
    function generateEnhancedHeader(config, type = 'full') {
        const currentDate = new Date().toLocaleDateString('fr-FR');
        const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        let headerHtml = '';
        
        if (type === 'full') {
            headerHtml = `
                <div style="text-align: center; margin-bottom: 35px; padding-bottom: 20px; border-bottom: 3px solid #14b8a6;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div style="text-align: left; flex: 1;">
                            <div style="font-size: 10px; color: #64748b; margin-bottom: 2px;">N° Ordre:</div>
                            <div style="font-size: 12px; font-weight: bold; color: #1e293b;">ORD-${Date.now().toString().slice(-6)}</div>
                        </div>
                        <div style="text-align: center; flex: 2;">
                            <div style="font-size: 26px; font-weight: bold; color: #1e293b; margin-bottom: 6px; letter-spacing: 1px;">
                                ${config.name || 'CENTRE MEDICAL O\\'CLIC'}
                            </div>
                            <div style="font-size: 14px; color: #64748b; margin-bottom: 4px; font-style: italic;">
                                ${config.subtitle || 'Plateforme de Gestion Médicale Intégrée'}
                            </div>
                        </div>
                        <div style="text-align: right; flex: 1;">
                            <div style="font-size: 10px; color: #64748b; margin-bottom: 2px;">Date/Heure:</div>
                            <div style="font-size: 12px; font-weight: bold; color: #1e293b;">${currentDate}</div>
                            <div style="font-size: 11px; color: #64748b;">${currentTime}</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 15px;">
                        <div style="text-align: left;">
                            <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">📍 Adresse:</div>
                            <div style="font-size: 12px; color: #374151;">${config.address || 'Rue de la Santé, Conakry, Guinée'}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">📞 Contact:</div>
                            <div style="font-size: 12px; color: #374151;">${config.phone || '+224 622 123 456'}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">✉️ Email:</div>
                            <div style="font-size: 12px; color: #374151;">${config.email || 'contact@oclicsante.com'}</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                        <div style="font-size: 10px; color: #94a3b8;">
                            ${config.registrationNumber || 'N° REG: CM-2024-001'} | ${config.licenseNumber || 'N° LIC: MED-GN-2024-001'}
                        </div>
                        <div style="font-size: 10px; color: #94a3b8;">
                            ${config.website || 'www.oclicsante.com'}
                        </div>
                    </div>
                </div>
            `;
        }
        
        return headerHtml;
    }
    
    // Fonction pour générer une section patient améliorée
    function generateEnhancedPatientSection(ticket, consultation) {
        const patientId = `PAT-${Date.now().toString().slice(-6)}`;
        const age = ticket.patientAge || 'N/A';
        const gender = ticket.patientGender === 'M' ? 'Masculin' : ticket.patientGender === 'F' ? 'Féminin' : 'N/A';
        
        return `
            <div style="margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #14b8a6;">
                <div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                    📋 INFORMATIONS PATIENT
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
                    <div>
                        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Identifiant</div>
                        <div style="font-size: 14px; font-weight: bold; color: #1e293b;">${patientId}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Nom Complet</div>
                        <div style="font-size: 14px; font-weight: bold; color: #1e293b;">${ticket.patientName || 'Patient'}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Âge / Sexe</div>
                        <div style="font-size: 14px; color: #374151;">${age} ans / ${gender}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Date Consultation</div>
                        <div style="font-size: 14px; color: #374151;">${new Date().toLocaleDateString('fr-FR')}</div>
                    </div>
                </div>
                
                ${ticket.patientPhone ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Contact</div>
                        <div style="font-size: 14px; color: #374151;">📱 ${ticket.patientPhone}</div>
                    </div>
                ` : ''}
                
                ${ticket.patientAddress ? `
                    <div style="margin-top: 10px;">
                        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Adresse</div>
                        <div style="font-size: 14px; color: #374151;">🏠 ${ticket.patientAddress}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // Fonction pour générer une ordonnance améliorée
    function generateEnhancedOrdonnance(ticket, consultation) {
        const config = window.medicalCenterConfig || {};
        const ordonnanceId = `ORD-${Date.now().toString().slice(-6)}`;
        const validite = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');
        
        return `
            <div style="font-family: 'Times New Roman', Georgia, serif; line-height: 1.6; color: #000; padding: 30px; max-width: 800px; margin: 0 auto;">
                ${generateEnhancedHeader(config, 'full')}
                
                <div style="text-align: center; margin-bottom: 25px; padding: 15px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; border: 2px solid #16a34a;">
                    <div style="font-size: 20px; font-weight: bold; color: #166534; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px;">
                        📋 ORdonnance Médicale
                    </div>
                    <div style="font-size: 12px; color: #15803d;">
                        N°: ${ordonnanceId} | Valable jusqu'au: ${validite}
                    </div>
                </div>
                
                ${generateEnhancedPatientSection(ticket, consultation)}
                
                ${consultation.diagnosis ? `
                    <div style="margin-bottom: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <div style="font-size: 16px; font-weight: bold; color: #92400e; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #fde68a; padding-bottom: 8px;">
                            🔬 Diagnostic Médical
                        </div>
                        
                        <div style="display: grid; gap: 12px;">
                            <div>
                                <div style="font-size: 12px; color: #78350f; font-weight: 600; margin-bottom: 4px;">Diagnostic Principal:</div>
                                <div style="font-size: 14px; font-weight: bold; color: #1e293b; background: white; padding: 8px; border-radius: 4px;">
                                    ${consultation.diagnosis.primary}
                                </div>
                            </div>
                            
                            ${consultation.diagnosis.secondary ? `
                                <div>
                                    <div style="font-size: 12px; color: #78350f; font-weight: 600; margin-bottom: 4px;">Diagnostic Secondaire:</div>
                                    <div style="font-size: 14px; color: #1e293b; background: white; padding: 8px; border-radius: 4px;">
                                        ${consultation.diagnosis.secondary}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div>
                                <div style="font-size: 12px; color: #78350f; font-weight: 600; margin-bottom: 4px;">Description Clinique:</div>
                                <div style="font-size: 13px; color: #374151; background: white; padding: 10px; border-radius: 4px; font-style: italic;">
                                    ${consultation.diagnosis.description}
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 30px;">
                    <div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px; text-transform: uppercase; border-bottom: 2px solid #14b8a6; padding-bottom: 8px;">
                        💊 Prescription Médicamenteuse
                    </div>
                    
                    ${consultation.prescription.map((med, index) => `
                        <div style="margin-bottom: 20px; padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 8px; position: relative;">
                            <div style="position: absolute; top: -10px; left: 20px; background: #14b8a6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                                Médicament #${index + 1}
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 15px; margin-bottom: 15px; margin-top: 5px;">
                                <div>
                                    <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Dénomination</div>
                                    <div style="font-size: 16px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
                                        ${med.medicine}
                                    </div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Posologie</div>
                                    <div style="font-size: 14px; color: #374151; background: #f8fafc; padding: 6px; border-radius: 4px;">
                                        ${med.dosage}
                                    </div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Durée</div>
                                    <div style="font-size: 14px; color: #374151; background: #f8fafc; padding: 6px; border-radius: 4px;">
                                        ${med.duration}
                                    </div>
                                </div>
                            </div>
                            
                            <div style="background: #f0f9ff; padding: 12px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                                <div style="font-size: 12px; color: #1e40af; font-weight: 600; margin-bottom: 4px;">Instructions Spécifiques:</div>
                                <div style="font-size: 13px; color: #374151; font-style: italic;">
                                    ${med.instructions}
                                </div>
                            </div>
                            
                            <div style="margin-top: 12px; display: flex; gap: 10px; font-size: 10px; color: #64748b;">
                                <span style="background: #fef2f2; padding: 2px 6px; border-radius: 4px;">⚠️ À conserver hors de portée des enfants</span>
                                <span style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">💊 Respecter la posologie</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${consultation.notes ? `
                    <div style="margin-bottom: 30px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #64748b;">
                        <div style="font-size: 12px; color: #374151; font-weight: 600; margin-bottom: 4px;">Notes Complémentaires:</div>
                        <div style="font-size: 13px; color: #374151; font-style: italic;">
                            ${consultation.notes}
                        </div>
                    </div>
                ` : ''}
                
                <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 8px;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 15px; text-align: center;">
                        ⚠️ INSTRUCTIONS IMPORTANTES
                    </div>
                    <div style="font-size: 10px; color: #374151; line-height: 1.4;">
                        • Prendre ce médicament uniquement sous surveillance médicale<br>
                        • Ne pas dépasser la dose prescrite<br>
                        • En cas d'effets secondaires, consulter immédiatement un médecin<br>
                        • Ne pas conduire après prise de médicaments causant de la somnolence<br>
                        • Informer votre médecin des autres médicaments pris simultanément
                    </div>
                </div>
                
                <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="text-align: left;">
                        <div style="font-size: 10px; color: #64748b;">Cachet du centre:</div>
                        <div style="width: 80px; height: 80px; border: 2px solid #14b8a6; border-radius: 50%; margin-top: 5px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #14b8a6; text-align: center;">
                            ${config.name || 'O\\'CLIC'}
                        </div>
                    </div>
                    
                    <div style="text-align: right;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Signature du médecin:</div>
                        <div style="border-bottom: 2px solid #1e293b; width: 200px; margin-bottom: 5px;"></div>
                        <div style="font-size: 11px; color: #374151; font-weight: bold;">Dr. [Nom du médecin]</div>
                        <div style="font-size: 10px; color: #64748b;">N° ORD: [Numéro d'ordre]</div>
                    </div>
                </div>
                
                <div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; color: #94a3b8;">
                        Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
                        Ce document est un certificat médical confidentiel | ${config.name || 'CENTRE MEDICAL O\\'CLIC'}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Fonction pour générer des examens améliorés
    function generateEnhancedExamens(ticket, consultation) {
        const config = window.medicalCenterConfig || {};
        const examenId = `EXAM-${Date.now().toString().slice(-6)}`;
        
        return `
            <div style="font-family: 'Times New Roman', Georgia, serif; line-height: 1.6; color: #000; padding: 30px; max-width: 800px; margin: 0 auto;">
                ${generateEnhancedHeader(config, 'full')}
                
                <div style="text-align: center; margin-bottom: 25px; padding: 15px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 8px; border: 2px solid #2563eb;">
                    <div style="font-size: 20px; font-weight: bold; color: #1e40af; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px;">
                        📋 Résultats d'Examens Médicaux
                    </div>
                    <div style="font-size: 12px; color: #1e40af;">
                        N°: ${examenId} | Date: ${new Date().toLocaleDateString('fr-FR')}
                    </div>
                </div>
                
                ${generateEnhancedPatientSection(ticket, consultation)}
                
                ${consultation.clinicalExam ? `
                    <div style="margin-bottom: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <div style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #bfdbfe; padding-bottom: 8px;">
                            🏥 Examen Clinique
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px;">
                            <div style="background: white; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Pression Artérielle</div>
                                <div style="font-size: 18px; font-weight: bold; color: #1e293b;">${consultation.clinicalExam.bloodPressure}</div>
                                <div style="font-size: 10px; color: #64748b;">mmHg</div>
                            </div>
                            <div style="background: white; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Fréquence Cardiaque</div>
                                <div style="font-size: 18px; font-weight: bold; color: #1e293b;">${consultation.clinicalExam.heartRate}</div>
                                <div style="font-size: 10px; color: #64748b;">bpm</div>
                            </div>
                            <div style="background: white; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Température</div>
                                <div style="font-size: 18px; font-weight: bold; color: #1e293b;">${consultation.clinicalExam.temperature}</div>
                                <div style="font-size: 10px; color: #64748b;">°C</div>
                            </div>
                            <div style="background: white; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Poids</div>
                                <div style="font-size: 18px; font-weight: bold; color: #1e293b;">${consultation.clinicalExam.weight}</div>
                                <div style="font-size: 10px; color: #64748b;">kg</div>
                            </div>
                            <div style="background: white; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Taille</div>
                                <div style="font-size: 18px; font-weight: bold; color: #1e293b;">${consultation.clinicalExam.height}</div>
                                <div style="font-size: 10px; color: #64748b;">cm</div>
                            </div>
                            <div style="background: white; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">IMC</div>
                                <div style="font-size: 18px; font-weight: bold; color: #1e293b;">
                                    ${(consultation.clinicalExam.weight / ((consultation.clinicalExam.height / 100) ** 2)).toFixed(1)}
                                </div>
                                <div style="font-size: 10px; color: #64748b;">kg/m²</div>
                            </div>
                        </div>
                        
                        ${consultation.clinicalExam.notes ? `
                            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
                                <div style="font-size: 12px; color: #1e40af; font-weight: 600; margin-bottom: 4px;">Observations Cliniques:</div>
                                <div style="font-size: 13px; color: #374151; font-style: italic;">
                                    ${consultation.clinicalExam.notes}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 30px;">
                    <div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px; text-transform: uppercase; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">
                        🧪 Résultats de Laboratoire
                    </div>
                    
                    ${consultation.exams.map((exam, index) => `
                        <div style="margin-bottom: 20px; padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 8px; position: relative;">
                            <div style="position: absolute; top: -10px; left: 20px; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                                Examen #${index + 1}
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; margin-top: 5px;">
                                <div>
                                    <div style="font-size: 16px; font-weight: bold; color: #1e293b;">${exam.type}</div>
                                    <div style="font-size: 12px; color: #64748b;">Date: ${new Date(exam.date).toLocaleDateString('fr-FR')}</div>
                                </div>
                                <div style="padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; ${
                                    exam.status === 'completed' 
                                        ? 'background: #dcfce7; color: #166534;' 
                                        : 'background: #fef3c7; color: #92400e;'
                                }">
                                    ${exam.status === 'completed' ? '✅ ANALYSÉ' : '⏱ EN ATTENTE'}
                                </div>
                            </div>
                            
                            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                                <div style="font-size: 12px; color: #1e40af; font-weight: 600; margin-bottom: 4px;">Résultat:</div>
                                <div style="font-size: 14px; color: #374151;">
                                    ${exam.result}
                                </div>
                            </div>
                            
                            ${exam.status === 'completed' ? `
                                <div style="margin-top: 12px; display: flex; gap: 10px; font-size: 10px; color: #64748b;">
                                    <span style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">✅ Valeurs normales</span>
                                    <span style="background: #f8fafc; padding: 2px 6px; border-radius: 4px;">📊 Validé le ${new Date(exam.date).toLocaleDateString('fr-FR')}</span>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                
                ${consultation.diagnosis ? `
                    <div style="margin-bottom: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <div style="font-size: 16px; font-weight: bold; color: #92400e; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #fde68a; padding-bottom: 8px;">
                            🔬 Diagnostic Médical
                        </div>
                        
                        <div style="display: grid; gap: 12px;">
                            <div>
                                <div style="font-size: 12px; color: #78350f; font-weight: 600; margin-bottom: 4px;">Diagnostic Principal:</div>
                                <div style="font-size: 14px; font-weight: bold; color: #1e293b; background: white; padding: 8px; border-radius: 4px;">
                                    ${consultation.diagnosis.primary}
                                </div>
                            </div>
                            
                            ${consultation.diagnosis.secondary ? `
                                <div>
                                    <div style="font-size: 12px; color: #78350f; font-weight: 600; margin-bottom: 4px;">Diagnostic Secondaire:</div>
                                    <div style="font-size: 14px; color: #1e293b; background: white; padding: 8px; border-radius: 4px;">
                                        ${consultation.diagnosis.secondary}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div>
                                <div style="font-size: 12px; color: #78350f; font-weight: 600; margin-bottom: 4px;">Description Clinique:</div>
                                <div style="font-size: 13px; color: #374151; background: white; padding: 10px; border-radius: 4px; font-style: italic;">
                                    ${consultation.diagnosis.description}
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="text-align: left;">
                        <div style="font-size: 10px; color: #64748b;">Cachet du laboratoire:</div>
                        <div style="width: 80px; height: 80px; border: 2px solid #3b82f6; border-radius: 50%; margin-top: 5px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #3b82f6; text-align: center;">
                            LABO
                        </div>
                    </div>
                    
                    <div style="text-align: right;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Signature du biologiste:</div>
                        <div style="border-bottom: 2px solid #1e293b; width: 200px; margin-bottom: 5px;"></div>
                        <div style="font-size: 11px; color: #374151; font-weight: bold;">Dr. [Biologiste]</div>
                        <div style="font-size: 10px; color: #64748b;">N° ORD: [Numéro d'ordre]</div>
                    </div>
                </div>
                
                <div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; color: #94a3b8;">
                        Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
                        Résultats confidentiels destinés uniquement au médecin traitant | ${config.name || 'CENTRE MEDICAL O\\'CLIC'}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Remplacer les fonctions d'impression existantes
    window.printOrdonnance = function(ticket, consultation) {
        const printContainer = document.createElement('div');
        printContainer.innerHTML = generateEnhancedOrdonnance(ticket, consultation);
        printContainer.style.display = 'none';
        document.body.appendChild(printContainer);
        
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.body.removeChild(printContainer);
            }, 1000);
        }, 500);
        
        console.log('PRINT-ENHANCE: Enhanced ordonnance sent to print');
    };
    
    window.printExamens = function(ticket, consultation) {
        const printContainer = document.createElement('div');
        printContainer.innerHTML = generateEnhancedExamens(ticket, consultation);
        printContainer.style.display = 'none';
        document.body.appendChild(printContainer);
        
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.body.removeChild(printContainer);
            }, 1000);
        }, 500);
        
        console.log('PRINT-ENHANCE: Enhanced examens sent to print');
    };
    
    console.log('PRINT-ENHANCE: Enhanced print templates ready');
})();
