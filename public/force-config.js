// Solution forcée pour afficher la configuration
(function() {
    'use strict';
    
    console.log('FORCE: Starting forced interface...');
    
    // Forcer l'affichage immédiat
    function forceShowInterface() {
        const root = document.getElementById('root');
        if (!root) {
            console.log('FORCE: Root not found, retrying...');
            setTimeout(forceShowInterface, 100);
            return;
        }
        
        console.log('FORCE: Root found, checking current content...');
        
        // Vérifier si React a déjà pris le contrôle
        if (root.innerHTML.includes('react') || root.innerHTML.includes('React')) {
            console.log('FORCE: React detected, forcing our interface...');
        }
        
        // Forcer notre interface
        const currentHash = window.location.hash || '#/';
        const isConfig = currentHash.includes('config');
        
        if (isConfig) {
            console.log('FORCE: Showing config interface...');
            root.innerHTML = `
                <div style="display: flex; height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc;">
                    <!-- Sidebar -->
                    <div style="width: 250px; background: #1e293b; color: white; padding: 20px;">
                        <h2 style="margin: 0 0 30px 0; font-size: 18px;">O'CLIC SANTE</h2>
                        <nav style="display: flex; flex-direction: column; gap: 0;">
                            <a href="#/" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: transparent; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid transparent;">Tableau de Bord</a>
                            <a href="#/consultations" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: transparent; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid transparent;">Consultations</a>
                            <a href="#/patients" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: transparent; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid transparent;">Patients</a>
                            <a href="#/config" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: rgba(20,184,166,0.2); border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid #14b8a6;">⚙️ Configuration</a>
                        </nav>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="flex: 1; background: #f8fafc; overflow-y: auto; padding: 30px;">
                        <h1 style="color: #1e293b; margin-bottom: 10px;">Configuration du Centre Médical</h1>
                        <p style="color: #64748b; margin-bottom: 20px;">Personnalisez les informations de votre centre médical pour les documents imprimés.</p>
                        
                        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
                            <strong style="color: #92400e;">⚠️ Important:</strong> Les informations configurées ici apparaîtront dans les en-têtes de toutes les ordonnances et résultats d'examens.
                        </div>
                        
                        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #14b8a6; margin-bottom: 30px; border-bottom: 2px solid #14b8a6; padding-bottom: 8px;">Informations Principales</h2>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Nom du centre:</label>
                                    <input type="text" id="center-name" value="CENTRE MEDICAL O'CLIC" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Sous-titre:</label>
                                    <input type="text" id="center-subtitle" value="Plateforme de Gestion Médicale Intégrée" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Adresse:</label>
                                    <input type="text" id="center-address" value="Rue de la Santé, Conakry, Guinée" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Téléphone:</label>
                                    <input type="text" id="center-phone" value="+224 622 123 456" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Email:</label>
                                    <input type="email" id="center-email" value="contact@oclicsante.com" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Site web:</label>
                                    <input type="text" id="center-website" value="www.oclicsante.com" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                                </div>
                            </div>
                            
                            <h3 style="color: #14b8a6; margin-bottom: 20px; border-bottom: 2px solid #14b8a6; padding-bottom: 8px;">Informations Professionnelles</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">N° d'enregistrement:</label>
                                    <input type="text" id="center-registration" value="N° REG: CM-2024-001" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">N° de licence:</label>
                                    <input type="text" id="center-license" value="N° LIC: MED-GN-2024-001" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                                </div>
                            </div>
                            
                            <h3 style="color: #14b8a6; margin-bottom: 20px; border-bottom: 2px solid #14b8a6; padding-bottom: 8px;">Spécialités Médicales</h3>
                            <div style="margin-bottom: 30px;">
                                <textarea id="center-specialties" rows="4" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">Médecine Générale
Pédiatrie
Gynécologie
Urgences
Laboratoire d'Analyse
Radiologie
Cardiologie</textarea>
                                <small style="color: #6b7280;">Une spécialité par ligne</small>
                            </div>
                            
                            <div style="display: flex; gap: 20px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                <button onclick="previewHeader()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">📋 Aperçu</button>
                                <button onclick="saveConfig()" style="background: #14b8a6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">💾 Enregistrer</button>
                                <button onclick="testPrint()" style="background: #8b5cf6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">🖨️ Test Impression</button>
                            </div>
                        </div>
                        
                        <!-- Preview Section -->
                        <div id="preview-section" style="margin-top: 30px; display: none;">
                            <h3 style="color: #1e293b; margin-bottom: 20px;">Aperçu de l'en-tête</h3>
                            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 30px;">
                                <div id="preview-content"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Ajouter les fonctions
            window.previewHeader = function() {
                const config = collectConfig();
                const previewSection = document.getElementById('preview-section');
                const previewContent = document.getElementById('preview-content');
                
                if (previewSection && previewContent) {
                    previewSection.style.display = 'block';
                    previewContent.innerHTML = generateHeaderHTML(config);
                }
            };
            
            window.saveConfig = function() {
                const config = collectConfig();
                localStorage.setItem('medicalCenterConfig', JSON.stringify(config));
                alert('✅ Configuration enregistrée avec succès !');
            };
            
            window.testPrint = function() {
                const config = collectConfig();
                const ticket = {
                    patientName: 'Patient Test',
                    patientAge: 35,
                    patientGender: 'M'
                };
                
                const consultation = {
                    prescription: [
                        {
                            medicine: 'Paracétamol 500mg',
                            dosage: '1 comprimé toutes les 6 heures',
                            duration: '5 jours',
                            instructions: 'Prendre après les repas si douleur'
                        }
                    ],
                    diagnosis: {
                        primary: 'Céphalée tensionnelle',
                        secondary: 'Stress léger',
                        description: 'Maux de tête fréquents'
                    }
                };
                
                // Créer un conteneur d'impression
                const printContainer = document.createElement('div');
                printContainer.innerHTML = generateOrdonnanceHTML(config, ticket, consultation);
                printContainer.style.display = 'none';
                document.body.appendChild(printContainer);
                
                setTimeout(() => {
                    window.print();
                    document.body.removeChild(printContainer);
                }, 500);
            };
            
            function collectConfig() {
                return {
                    name: document.getElementById('center-name').value,
                    subtitle: document.getElementById('center-subtitle').value,
                    address: document.getElementById('center-address').value,
                    phone: document.getElementById('center-phone').value,
                    email: document.getElementById('center-email').value,
                    website: document.getElementById('center-website').value,
                    registrationNumber: document.getElementById('center-registration').value,
                    licenseNumber: document.getElementById('center-license').value,
                    specialties: document.getElementById('center-specialties').value.split('\\n').filter(s => s.trim())
                };
            }
            
            function generateHeaderHTML(config) {
                return `
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">
                            ${config.name}
                        </div>
                        <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">
                            ${config.subtitle}
                        </div>
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
                            ${config.address}
                        </div>
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">
                            📞 ${config.phone} | ✉️ ${config.email}
                        </div>
                        <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">
                            ${config.registrationNumber} | ${config.licenseNumber}
                        </div>
                        <div style="border-top: 2px solid #14b8a6; padding-top: 8px; margin-top: 8px;">
                            <div style="font-size: 11px; color: #64748b;">
                                ${config.specialties.slice(0, 4).join(' • ')}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            function generateOrdonnanceHTML(config, ticket, consultation) {
                const date = new Date().toLocaleDateString('fr-FR');
                
                return `
                    <div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; padding: 20px;">
                        ${generateHeaderHTML(config)}
                        
                        <div style="margin-bottom: 25px;">
                            <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px;">
                                ORDONNANCE MÉDICALE
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                                <div>
                                    <div style="font-weight: bold; font-size: 12px;">Patient:</div>
                                    <div style="font-size: 14px;">${ticket.patientName}</div>
                                </div>
                                <div>
                                    <div style="font-weight: bold; font-size: 12px;">Date:</div>
                                    <div style="font-size: 14px;">${date}</div>
                                </div>
                                <div>
                                    <div style="font-weight: bold; font-size: 12px;">Âge:</div>
                                    <div style="font-size: 14px;">${ticket.patientAge} ans</div>
                                </div>
                                <div>
                                    <div style="font-weight: bold; font-size: 12px;">Sexe:</div>
                                    <div style="font-size: 14px;">${ticket.patientGender === 'M' ? 'Masculin' : 'Féminin'}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px;">
                                PRESCRIPTION
                            </div>
                            ${consultation.prescription.map((med, index) => `
                                <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
                                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${index + 1}. ${med.medicine}</div>
                                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
                                        <strong>Posologie:</strong> ${med.dosage}<br>
                                        <strong>Durée:</strong> ${med.duration}
                                    </div>
                                    <div style="font-style: italic; font-size: 12px; background: #f9f9f9; padding: 8px; border-left: 3px solid #14b8a6;">
                                        <strong>Instructions:</strong> ${med.instructions}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div style="margin-top: 50px; text-align: right;">
                            <div style="border-bottom: 1px solid #000; width: 200px; margin-left: auto; margin-bottom: 5px;"></div>
                            <div style="font-size: 12px; color: #666;">Signature et cachet du médecin</div>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    // Forcer immédiatement
    setTimeout(forceShowInterface, 0);
    
    // Réessayer périodiquement
    setInterval(() => {
        if (window.location.hash.includes('config')) {
            forceShowInterface();
        }
    }, 2000);
    
    console.log('FORCE: Forced interface ready');
})();
