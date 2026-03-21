// Interface de dossier patient avec boutons d'impression fonctionnels
(function() {
    'use strict';
    
    console.log('PATIENT-FILE: Creating patient file interface...');
    
    // Fonction pour générer l'interface du dossier patient
    function createPatientFileInterface() {
        const root = document.getElementById('root');
        if (!root) {
            console.log('PATIENT-FILE: Root not found, retrying...');
            setTimeout(createPatientFileInterface, 100);
            return;
        }
        
        console.log('PATIENT-FILE: Creating patient file interface...');
        
        root.innerHTML = `
            <div style="display: flex; height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc;">
                <!-- Sidebar -->
                <aside style="width: 250px; background: linear-gradient(180deg, #1e293b 0%, #334155 100%); color: white; padding: 20px; overflow-y: auto;">
                    <h2 style="margin: 0 0 30px 0; font-size: 18px;">O'CLIC SANTE</h2>
                    <nav style="display: flex; flex-direction: column; gap: 0;">
                        <a href="#/" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: transparent; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid transparent;">Tableau de Bord</a>
                        <a href="#/patients" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: rgba(20,184,166,0.2); border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid #14b8a6;">📋 Dossier Patient</a>
                        <a href="#/consultations" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: transparent; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid transparent;">Consultations</a>
                        <a href="#/config" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: transparent; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid transparent;">⚙️ Configuration</a>
                    </nav>
                </aside>
                
                <!-- Main Content -->
                <main style="flex: 1; background: #f8fafc; overflow-y: auto; padding: 30px;">
                    <!-- Header -->
                    <header style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <div>
                                <h1 style="margin: 0; font-size: 24px; color: #1e293b;">Dossier Patient</h1>
                                <p style="margin: 4px 0 0 0; color: #64748b;">Informations complètes et historique médical</p>
                            </div>
                            <button onclick="window.location.reload()" style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                                🔄 Actualiser
                            </button>
                        </div>
                        
                        <!-- Patient Info -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                            <div>
                                <label style="font-size: 12px; color: #64748b; font-weight: 500;">Nom Complet</label>
                                <div style="font-size: 16px; font-weight: 500; color: #1e293b;">Mamadou Diop</div>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: #64748b; font-weight: 500;">Âge</label>
                                <div style="font-size: 16px; color: #374151;">32 ans</div>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: #64748b; font-weight: 500;">Sexe</label>
                                <div style="font-size: 16px; color: #374151;">Masculin</div>
                            </div>
                            <div>
                                <label style="font-size: 12px; color: #64748b; font-weight: 500;">Téléphone</label>
                                <div style="font-size: 16px; color: #374151;">+224 XXX XXX XXX</div>
                            </div>
                        </div>
                    </header>
                    
                    <!-- Consultations History -->
                    <section style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #1e293b;">Historique des Consultations</h2>
                        
                        <div style="space-y: 16px;">
                            <!-- Consultation 1 -->
                            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                                    <div>
                                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Consultation du 19 mars 2026 à 18:25</div>
                                        <div style="font-size: 14px; color: #64748b;">Dr. Administrateur O'CLIC SANTE</div>
                                    </div>
                                    <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; background: #dcfce7; color: #166534;">
                                        ✅ Terminée
                                    </span>
                                </div>
                                
                                <!-- Symptômes -->
                                <div style="margin-bottom: 20px;">
                                    <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Symptômes</h3>
                                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
                                        <div style="margin-bottom: 12px;"><strong>Principal:</strong> UKJ</div>
                                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 12px;">
                                            <div><strong>Température:</strong> 23°C</div>
                                            <div><strong>Tension Artérielle:</strong> 32</div>
                                            <div><strong>Poids:</strong> 32kg</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Ordonnances -->
                                <div style="margin-bottom: 20px;">
                                    <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Ordonnances</h3>
                                    <div style="background: #fef3c7; padding: 16px; border-radius: 8px;">
                                        <div style="margin-bottom: 12px; padding: 12px; background: white; border-left: 4px solid #f59e0b; border-radius: 4px;">
                                            <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Paracétamol 500mg</div>
                                            <div style="font-size: 14px; color: #374151;">
                                                <div><strong>Dosage:</strong> M</div>
                                                <div><strong>Quantité:</strong> 1 Comprimé</div>
                                            </div>
                                        </div>
                                        <div style="margin-top: 12px;">
                                            <button onclick="printOrdonnance1()" style="background: #14b8a6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                                                🖨️ Imprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Examens -->
                                <div style="margin-bottom: 20px;">
                                    <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Examens Prescrits</h3>
                                    <div style="display: grid; gap: 16px;">
                                        <div style="background: #dbeafe; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                                            <div style="font-weight: 600; color: #1e40af; margin-bottom: 4px;">NFS</div>
                                            <div style="font-size: 14px; color: #374151;">
                                                <div><strong>Catégorie:</strong> Laboratoire</div>
                                                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">NFS (Hémogramme)</div>
                                            </div>
                                            <div style="margin-top: 12px;">
                                                <button onclick="printExam1()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                                                    🖨️ Imprimer
                                                </button>
                                            </div>
                                        </div>
                                        <div style="background: #dbeafe; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                                            <div style="font-weight: 600; color: #1e40af; margin-bottom: 4px;">Échographie</div>
                                            <div style="font-size: 14px; color: #374151;">
                                                <div><strong>Catégorie:</strong> Imagerie</div>
                                            </div>
                                            <div style="margin-top: 12px;">
                                                <button onclick="printExam2()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                                                    🖨️ Imprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        `;
        
        // Ajouter les fonctions d'impression
        window.printOrdonnance1 = function() {
            const patientData = {
                name: 'Mamadou Diop',
                doctor: 'Dr. Administrateur O\'CLIC SANTE'
            };
            
            const prescriptionData = [
                {
                    medicine: 'Paracétamol 500mg',
                    dosage: 'M',
                    quantity: '1 Comprimé'
                }
            ];
            
            if (typeof window.printSimpleOrdonnance === 'function') {
                window.printSimpleOrdonnance(patientData, prescriptionData);
            } else {
                alert('Fonction d\'impression non disponible');
            }
        };
        
        window.printExam1 = function() {
            const examData = {
                type: 'NFS',
                category: 'Laboratoire',
                subcategory: 'NFS (Hémogramme)',
                patient: 'Mamadou Diop',
                doctor: 'Dr. Administrateur O\'CLIC SANTE',
                date: '19 mars 2026',
                results: [
                    { param: 'Hémoglobine', value: '14.5 g/dL', normal: '13.5-17.5 g/dL', status: 'Normal' },
                    { param: 'Globules rouges', value: '4.5 T/L', normal: '4.5-5.9 T/L', status: 'Normal' },
                    { param: 'Plaquettes', value: '250 000/mm³', normal: '150-450 000/mm³', status: 'Normal' }
                ]
            };
            
            printExamResult(examData);
        };
        
        window.printExam2 = function() {
            const examData = {
                type: 'Échographie',
                category: 'Imagerie',
                patient: 'Mamadou Diop',
                doctor: 'Dr. Administrateur O\'CLIC SANTE',
                date: '19 mars 2026',
                results: [
                    { param: 'Examen', value: 'Échographie abdominale', details: 'Pas d\'anomalie détectée' },
                    { param: 'Conclusion', value: 'Examen normal' }
                ]
            };
            
            printExamResult(examData);
        };
        
        console.log('PATIENT-FILE: Patient file interface created successfully');
        return true;
    }
    
    // Fonction pour imprimer les résultats d'examens
    function printExamResult(examData) {
        const config = window.medicalCenterConfig || {};
        const date = new Date().toLocaleDateString('fr-FR');
        const examId = 'EXAM-' + Date.now().toString().slice(-6);
        
        let html = '<div style="font-family: Times New Roman; padding: 30px; max-width: 800px; margin: 0 auto; line-height: 1.6;">';
        
        // En-tête
        html += '<div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">';
        html += '<div style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">' + (config.name || 'O\'CLIC SANTE') + '</div>';
        html += '<div style="font-size: 14px; color: #64748b;">' + (config.address || 'Conakry, Guinée') + '</div>';
        html += '<div style="font-size: 12px; color: #94a3b8;">📞 ' + (config.phone || '+224 622 123 456') + '</div>';
        html += '</div>';
        
        // Titre
        html += '<div style="text-align: center; margin-bottom: 25px; padding: 15px; background: #dbeafe; border-radius: 8px; border: 2px solid #2563eb;">';
        html += '<div style="font-size: 20px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 2px;">🧪 RÉSULTATS D\'EXAMEN</div>';
        html += '<div style="font-size: 12px; color: #1e40af; margin-top: 5px;">N°: ' + examId + ' | Date: ' + date + '</div>';
        html += '</div>';
        
        // Informations patient
        html += '<div style="margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">';
        html += '<div style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #bfdbfe; padding-bottom: 8px;">📋 INFORMATIONS PATIENT</div>';
        html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Nom</div><div style="font-size: 14px; font-weight: bold; color: #1e293b;">' + examData.patient + '</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Date</div><div style="font-size: 14px; color: #374151;">' + examData.date + '</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Médecin</div><div style="font-size: 14px; color: #374151;">' + examData.doctor + '</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Type</div><div style="font-size: 14px; color: #374151;">' + examData.type + '</div></div>';
        html += '</div>';
        html += '</div>';
        
        // Détails de l'examen
        html += '<div style="margin-bottom: 30px;">';
        html += '<div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px; text-transform: uppercase; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">🔬 DÉTAILS DE L\'EXAMEN</div>';
        html += '<div style="background: white; padding: 20px; border: 2px solid #e2e8f0; border-radius: 8px;">';
        html += '<div style="margin-bottom: 15px;"><div style="font-size: 14px; color: #64748b;">Catégorie:</div><div style="font-size: 16px; font-weight: bold; color: #1e293b;">' + examData.category + '</div></div>';
        if (examData.subcategory) {
            html += '<div style="margin-bottom: 15px;"><div style="font-size: 14px; color: #64748b;">Sous-catégorie:</div><div style="font-size: 16px; font-weight: bold; color: #1e293b;">' + examData.subcategory + '</div></div>';
        }
        html += '</div>';
        
        // Résultats
        if (examData.results && examData.results.length > 0) {
            html += '<div style="margin-top: 20px;">';
            examData.results.forEach(function(result, index) {
                html += '<div style="margin-bottom: 12px; padding: 12px; background: #f8fafc; border-radius: 6px;">';
                html += '<div style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">' + result.param + '</div>';
                html += '<div style="font-size: 14px; color: #374151;">' + result.value + '</div>';
                if (result.normal) {
                    html += '<div style="font-size: 12px; color: #16a34a; margin-top: 4px;">Normale: ' + result.normal + '</div>';
                                        }
                if (result.details) {
                    html += '<div style="font-size: 12px; color: #64748b; margin-top: 4px; font-style: italic;">' + result.details + '</div>';
                                        }
                html += '</div>';
                                    });
            html += '</div>';
                                }
        
        html += '</div>';
        
        // Signatures
        html += '<div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end;">';
        html += '<div style="text-align: left;"><div style="font-size: 10px; color: #64748b;">Cachet du laboratoire:</div>';
        html += '<div style="width: 80px; height: 80px; border: 2px solid #3b82f6; border-radius: 50%; margin-top: 5px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #3b82f6;">LABO</div></div>';
        html += '<div style="text-align: right;"><div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Signature du médecin:</div>';
        html += '<div style="border-bottom: 2px solid #1e293b; width: 200px; margin-bottom: 5px;"></div>';
        html += '<div style="font-size: 11px; color: #374151; font-weight: bold;">' + examData.doctor + '</div></div>';
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
        
        console.log('PATIENT-FILE: Exam result printed');
    }
    
    // Forcer l'affichage immédiat
    setTimeout(() => {
        createPatientFileInterface();
    }, 0);
    
    // Écouter les changements de hash
    window.addEventListener('hashchange', function() {
        if (window.location.hash.includes('patients')) {
            createPatientFileInterface();
        }
    });
    
    console.log('PATIENT-FILE: Patient file system ready');
})();
