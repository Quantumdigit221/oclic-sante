// Solution pour lier les examens aux consultations existantes
(function() {
    'use strict';
    
    console.log('EXAM-LINK: Linking exams to existing consultations...');
    
    // Fonction pour détecter les consultations existantes avec examens
    function findConsultationsWithExams() {
        setTimeout(() => {
            // Chercher les sections de consultations dans la page patients
            const consultationSections = document.querySelectorAll('div:has(> strong:contains("Consultation")), div:has(> h4:contains("Consultation"))');
            
            if (consultationSections.length === 0) {
                console.log('EXAM-LINK: No consultation sections found, retrying...');
                setTimeout(findConsultationsWithExams, 2000);
                return;
            }
            
            console.log('EXAM-LINK: Found', consultationSections.length, 'consultation sections');
            
            // Ajouter des liens vers les examens pour chaque consultation
            consultationSections.forEach((section, index) => {
                // Chercher les examens dans cette consultation
                const examElements = section.querySelectorAll('div:has(> strong:contains("Examen")), div:has(> h4:contains("Examen"))');
                
                examElements.forEach((examElement, examIndex) => {
                    // Créer un lien cliquable pour chaque examen
                    const examName = examElement.querySelector('strong, h4').textContent;
                    if (examName && examName.trim()) {
                        const examLink = document.createElement('a');
                        examLink.href = '#/exam/' + examName.toLowerCase().replace(/\s+/g, '-');
                        examLink.textContent = '🔬 Voir les résultats de ' + examName;
                        examLink.style.cssText = 'display: inline-block; margin: 5px 10px; padding: 4px 8px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px; cursor: pointer; font-size: 12px;';
                        examLink.onclick = function(e) {
                            e.preventDefault();
                            showExamResults(examName, 'Mamadou Diop');
                        };
                        
                        // Ajouter le lien après la section d'examen
                        examElement.appendChild(examLink);
                        
                        console.log('EXAM-LINK: Added link for exam:', examName);
                    }
                });
            });
            
            console.log('EXAM-LINK: Exam links added to consultations');
        }, 3000);
    }
    
    // Fonction pour créer une page d'examen détaillé
    function createExamPage(examName, patientName) {
        const root = document.getElementById('root');
        if (!root) return false;
        
        const currentHash = window.location.hash || '#/';
        const isExamPage = currentHash.includes('/exam/');
        
        if (isExamPage) {
            console.log('EXAM-LINK: Creating exam page for:', examName, 'for patient:', patientName);
            
            // Créer une page d'examen simple qui respecte le design
            root.innerHTML = `
                <div style="display: flex; height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc;">
                    <!-- Sidebar -->
                    <aside style="width: 280px; background: linear-gradient(180deg, #1e293b 0%, #334155 100%); color: white; display: flex; flex-direction: column;">
                        <h2 style="margin: 0 0 30px 0; font-size: 18px;">O'CLIC SANTE</h2>
                        <nav style="display: flex; flex-direction: column; gap: 0;">
                            <a href="#/" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: transparent; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid transparent;">🏠️ Accueil</a>
                            <a href="#/patients" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: rgba(20,184,166,0.2); border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid #14b8a6;">👥 Patients</a>
                            <a href="#/consultations" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: transparent; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid transparent;">🎫 Consultations</a>
                            <a href="#/config" onclick="window.location.reload()" style="display: block; margin: 5px 0; padding: 12px 15px; background: transparent; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid transparent;">⚙️ Configuration</a>
                        </nav>
                    </aside>
                    
                    <!-- Main Content -->
                    <main style="flex: 1; background: #f8fafc; overflow-y: auto; padding: 30px;">
                        <!-- Header -->
                        <header style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <div>
                                <h1 style="margin: 0; font-size: 24px; color: #1e293b; margin-bottom: 10px;">Résultats d'Examen: ${examName}</h1>
                                <p style="margin: 4px 0 0; color: #64748b;">Patient: ${patientName}</p>
                            </div>
                        </header>
                        
                        <!-- Patient Info -->
                        <section style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                                <div><strong>Nom:</strong> ${patientName}</div>
                                <div><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</div>
                                <div><strong>Examen:</strong> ${examName}</div>
                                <div><strong>Médecin:</strong> Dr. Administrateur O'CLIC SANTE</div>
                            </div>
                        </section>
                        
                        <!-- Exam Content -->
                        <section style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #1e293b;">📋 Tableau de Résultats</h2>
                            
                            ${getExamTableHTML(examName)}
                            
                            <div style="margin-top: 20px; text-align: center;">
                                <button onclick="printExamResults('${examName}', '${patientName}')" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-right: 10px;">🖨️ Imprimer</button>
                                <button onclick="saveExamResults('${examName}', '${patientName}')" style="background: #14b8a6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-right: 10px;">💾 Enregistrer</button>
                                <button onclick="window.location.reload()" style="background: #f3f4f6; color: white; border: 1px solid #e2e8f0; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;">🔄 Retour</button>
                            </div>
                        </section>
                        
                    </main>
                </div>
            `;
            
            return true;
        }
        
        return false;
    }
    
    function getExamTableHTML(examName) {
        // Adapter le contenu selon le type d'examen
        if (examName.includes('NFS')) {
            return `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <tr style="background: #f8fafc;">
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Paramètre</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Unité</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Valeurs Normales</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Résultat</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Observation</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Hémoglobine</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">g/dL</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">13.5-17.5</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="14.5" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Valeur normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Hématocrite</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">%</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">40-52</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="42.0" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Hématocrite normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Globules rouges</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">T/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">4.5-5.9</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="5.2" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Globules rouges normaux" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Globules blancs</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">G/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">4.0-10.0</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="7.5" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Globules blancs normaux" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Plaquettes</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">G/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">150-450</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="250" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Plaquettes normales" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        } else if (examName.includes('Biochimie')) {
            return `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <tr style="background: #f8fafc;">
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Paramètre</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Unité</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Valeurs Normales</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Résultat</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Observation</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Glycémie à jeun</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">g/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">0.70-1.10</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="0.95" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Glycémie normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Créatininémie</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">µmol/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">60-110</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="85" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Créatininémie normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Urée</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">mmol/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">2.5-8.3</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="6.5" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Urée normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Acide urique</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">µmol/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">150-420</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="350" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Acide urique normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Cholestérol total</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">g/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">< 2.0</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="1.8" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Cholestérol normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        } else if (examName.includes('Coagulation')) {
            return `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <tr style="background: #f8fafc;">
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Paramètre</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Unité</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Valeurs Normales</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Résultat</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Observation</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">TP</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">%</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">70-130</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="95" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="TP normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">TCA</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">s</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">30-40</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="35" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="TCA normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">INR</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;"></td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">0.8-1.2</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="1.0" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="INR normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Fibrinogène</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">g/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">2.0-4.0</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="3.0" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Fibrinogène normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        } else if (examName.includes('Urine')) {
            return `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <tr style="background: #f8fafc;">
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Paramètre</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Unité</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Valeurs Normales</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Résultat</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Observation</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">pH</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;"></td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">5.5-7.0</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="6.5" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="pH normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Densité</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;"></td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">1.003-1.035</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="1.010" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Densité normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Protéines</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">g/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">< 0.15</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="0.1" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Protéines normales" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Glucose</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">mmol/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">< 0.8</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="0.9" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Glucose normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        }
    }
    
    // Fonction pour imprimer les résultats d'examen
    function printExamResults(examName, patientName) {
        const config = window.medicalCenterConfig || {};
        const date = new Date().toLocaleDateString('fr-FR');
        const examId = 'EXAM-' + Date.now().toString().slice(-6);
        
        let html = '<div style="font-family: Times New Roman; line-height: 1.6; color: #000; padding: 30px; max-width: 800px; margin: 0 auto;">';
        
        // En-tête
        html += '<div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">';
        html += '<div style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 10px; letter-spacing: 2px;">' + (config.name || 'O\'CLIC SANTE') + '</div>';
        html += '<div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Plateforme de Gestion Médicale Intégrée</div>';
        html += '<div style="font-size: 12px; color: #94a3b8;">' + (config.address || 'Rue de la Santé, Conakry, Guinée') + '</div>';
        html += '<div style="font-size: 12px; color: #94a3b8;">📞 ' + (config.phone || '+224 622 123 456') + '</div>';
        html += '</div>';
        
        // Informations patient
        html += '<div style="margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">';
        html += '<div style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #bfdbfe; padding-bottom: 8px;">📋 INFORMATIONS PATIENT</div>';
        html += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Identifiant</div><div style="font-size: 14px; font-weight: bold; color: #1e293b;">PAT-' + Date.now().toString().slice(-6) + '</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Nom Complet</div><div style="font-size: 14px; font-weight: bold; color: #1e293b;">' + patientName + '</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Âge</div><div style="font-size: 14px; color: #374151;">32 ans</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Sexe</div><div style="font-size: 14px; color: #374151;">Masculin</div></div>';
        html += '<div><div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Date Consultation</div><div style="font-size: 14px; color: #374151;">' + date + '</div></div>';
        html += '</div>';
        html += '</div>';
        
        // Contenu de l'examen
        html += '<div style="margin-bottom: 30px;">';
        html += '<div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px; text-transform: uppercase; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">🧪 RÉSULTATS D'EXAMEN: ' + examName + '</div>';
        
        // Tableau de résultats
        html += getEnhancedExamTableHTML(examName);
        
        html += '</div>';
        
        // Pied de page
        html += '<div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8;">';
        html += 'Document généré le ' + date + ' à ' + new Date().toLocaleTimeString('fr-FR') + '<br>';
        html += 'Résultats confidentiels destinés au médecin traitant | ' + (config.name || 'CENTRE MEDICAL O\'CLIC');
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
        
        console.log('EXAM-LINK: Printed exam results for:', examName, 'for patient:', patientName);
    }
    
    function getEnhancedExamTableHTML(examName) {
        if (examName.includes('NFS')) {
            return `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <tr style="background: #f8fafc;">
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Paramètre</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Unité</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Valeurs Normales</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Résultat</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Observation</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Hémoglobine</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">g/dL</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">13.5-17.5</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="14.5" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Valeur normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Hématocrite</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">%</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">40-52</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="42.0" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Hématocrite normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Globules rouges</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">T/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">4.5-5.9</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="5.2" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Globules rouges normaux" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Globules blancs</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">G/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">4.0-10.0</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="7.5" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Globules blancs normaux" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Plaquettes</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">G/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">150-450</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="250" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Plaquettes normales" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        } else if (examName.includes('Biochimie')) {
            return `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <tr style="background: #f8fafc;">
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Paramètre</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Unité</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Valeurs Normales</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Résultat</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Observation</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Glycémie à jeun</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">g/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">0.70-1.10</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="0.95" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Glycémie normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Créatininémie</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">µmol/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">60-110</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="85" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Créatininémie normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Urée</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">mmol/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">2.5-8.3</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="6.5" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Urée normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Acide urique</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">µmol/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">150-420</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="350" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Acide urique normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Cholestérol total</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">g/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">< 2.0</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="1.8" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Cholestérol normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        } else if (examName.includes('Coagulation')) {
            return `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <tr style="background: #f8fafc;">
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Paramètre</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Unité</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Valeurs Normales</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Résultat</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Observation</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">TP</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">%</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">70-130</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="95" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="TP normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">TCA</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">s</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">30-40</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="35" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="TCA normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">INR</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;"></td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">0.8-1.2</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="1.0" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="INR normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Fibrinogène</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">g/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">2.0-4.0</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="3.0" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Fibrinogène normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        } else if (examName.includes('Urine')) {
            return `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <tr style="background: #f8fafc;">
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Paramètre</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Unité</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Valeurs Normales</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Résultat</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Observation</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">pH</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;"></td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">5.5-7.0</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="6.8" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="pH normal" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Densité</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;"></td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">1.003-1.035</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="1.010" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Densité normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Protéines</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">g/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">< 0.15</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="0.05" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Protéines normales" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">Glucose</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">mmol/L</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">< 0.8</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">
                                <input type="text" placeholder="0.9" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
                            </td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">
                                <input type="text" placeholder="Glucose normale" style="width: 100%; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        }
    }
    
    // Fonction pour détecter les consultations avec examens dans les pages existantes
    function detectConsultationsInOtherPages() {
        setTimeout(() => {
            const allPages = ['/', '/consultations', '/patients', '/config'];
            const currentHash = window.location.hash || '#/';
            
            allPages.forEach(page => {
                if (currentHash.includes(page)) {
                    console.log('PAGE-DETECT: Found page:', page);
                    
                    if (page === '/consultations') {
                        // Chercher dans les consultations
                        const consultations = document.querySelectorAll('div:has(> strong:contains("Consultation")), div:has(> h4:contains("Consultation")));
                        if (consultations.length > 0) {
                            console.log('PAGE-DETECT: Found', consultations in consultations page');
                            // Ajouter les liens vers les examens
                            consultations.forEach((consultation, index) => {
                                const examElements = consultation.querySelectorAll('div:has(> strong:contains("Examen")), div:has(> h4:contains("Examen")));
                                examElements.forEach((examElement) => {
                                    const examName = examElement.querySelector('strong, h4').textContent;
                                    if (examName && examName.trim()) {
                                        const examLink = document.createElement('a');
                                        examLink.href = '#/exam/' + examName.toLowerCase().replace(/\s+/g, '-');
                                        examLink.textContent = '🔬 Voir les résultats de ' + examName;
                                        examLink.style.cssText = 'display: inline-block; margin: 5px 10px; padding: 4px 8px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px; cursor: pointer; font-size: 12px;';
                                        examLink.onclick = function(e) {
                                            e.preventDefault();
                                            showExamResults(examName, 'Mamadou Diop');
                                        };
                                        
                                        // Ajouter le lien après la section d'examen
                                        examElement.appendChild(examLink);
                                    });
                                });
                            });
                        }
                    }
                }
            });
        }, 2000);
    }
    
    // Fonction pour créer une page d'examen détaillée
    function showExamResults(examName, patientName) {
        // Créer la page d'examen
        const success = createExamPage(examName, patientName);
        if (!success) {
            console.log('EXAM-LINK: Could not create exam page for:', examName);
            return;
        }
        
        // Rediriger vers la page d'examen
        window.location.hash = '#/exam/' + examName.toLowerCase().replace(/\s+/g, '-');
        console.log('EXAM-LINK: Redirecting to exam page:', examName, 'for patient:', patientName);
    }
    
    // Lancer la détection des consultations avec examens
    setTimeout(() => {
        detectConsultationsInOtherPages();
        setInterval(() => {
            detectConsultationsInOtherPages();
        }, 10000);
    }, 5000);
    
    console.log('EXAM-LINK: Ready to link exams to consultations');
})();

})();
