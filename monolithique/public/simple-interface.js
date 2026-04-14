// Simple Interface - Direct DOM Manipulation
(function() {
    'use strict';
    console.log('Simple interface starting...');
    
    let activeTab = 'clinical';
    
    // Wait for DOM to be ready
    function initInterface() {
        const root = document.getElementById('root');
        if (!root) {
            console.log('Root not found, retrying...');
            setTimeout(initInterface, 100);
            return;
        }
        
        console.log('Root found, rendering interface');
        render();
    }
    
    function getCurrentPage() {
        const hash = window.location.hash || '#/';
        console.log('Current hash:', hash);
        if (hash.includes('consultations')) return 'consultations';
        if (hash.includes('patients')) return 'patients';
        if (hash.includes('config')) return 'config';
        return 'dashboard';
    }
    
    function buildTabContent() {
        let html = '';
        if (activeTab === 'clinical') {
            html = '<h4>Examen Clinique</h4>';
            html += '<div style="margin-top: 15px;">';
            html += '<div style="margin: 10px 0;"><strong>Pression:</strong> 120/80</div>';
            html += '<div style="margin: 10px 0;"><strong>Coeur:</strong> 72 bpm</div>';
            html += '<div style="margin: 10px 0;"><strong>Temperature:</strong> 36.8°C</div>';
            html += '</div>';
        } else if (activeTab === 'diagnosis') {
            html = '<h4>Diagnostic</h4>';
            html += '<div style="margin-top: 15px;">';
            html += '<div style="background: #dcfce7; padding: 15px; border-radius: 5px; margin-bottom: 10px;"><strong>Principal:</strong> Cephalee tensionnelle</div>';
            html += '<div style="background: #fef3c7; padding: 15px; border-radius: 5px;"><strong>Secondaire:</strong> Stress leger</div>';
            html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">';
            html += '<span style="font-weight: 500;">Diagnostic</span>';
            html += '<button onclick="printCurrentDiagnostic()" style="background: #14b8a6; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-size: 12px;">';
            html += '🖨️ Imprimer Diagnostic';
            html += '</button>';
            html += '</div>';
            html += '</div>';
        } else if (activeTab === 'prescription') {
            html = `
                <h4>Prescription</h4>
                <div style="margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span style="font-weight: 500;">Médicaments prescrits</span>
                        <button onclick="printCurrentOrdonnance()" style="background: #14b8a6; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                            🖨️ Imprimer Ordonnance
                        </button>
                    </div>
                    <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
                        <strong>Paracétamol 500mg</strong><br>
                        <small>1 comprimé toutes les 6 heures pendant 5 jours</small><br>
                        <small style="color: #666;">Prendre après les repas si douleur</small>
                    </div>
                    <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 5px;">
                        <strong>Ibuprofène 400mg</strong><br>
                        <small>1 comprimé si douleur intense</small><br>
                        <small style="color: #666;">Ne pas dépasser 3 comprimés par jour</small>
                    </div>
                </div>
            `;
        } else if (activeTab === 'exams') {
            html = '<h4>Examens Médicaux</h4>';
            html += '<div style="margin-top: 15px;">';
            html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">';
            html += '<span style="font-weight: 500;">Résultats d\'examens</span>';
            html += '<button onclick="printCurrentExamens()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-size: 12px;">';
            html += '🖨️ Imprimer Examens';
            html += '</button>';
            html += '</div>';
            html += '<div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 5px; margin-bottom: 10px;">';
            html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">';
            html += '<strong>Analyze Sanguine</strong>';
            html += '<span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; background: #dcfce7; color: #166534;">✅ Terminé</span>';
            html += '</div>';
            html += '<small style="color: #666;">Date: ' + new Date().toLocaleDateString('fr-FR') + '</small><br>';
            html += '<div style="background: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px;">';
            html += '<strong>Résultat:</strong> Résultats normaux';
            html += '</div>';
            html += '</div>';
            html += '<div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 5px;">';
            html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">';
            html += '<strong>Tension Artérielle</strong>';
            html += '<span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; background: #dcfce7; color: #166534;">✅ Terminé</span>';
            html += '</div>';
            html += '<small style="color: #666;">Date: ' + new Date().toLocaleDateString('fr-FR') + '</small><br>';
            html += '<div style="background: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px;">';
            html += '<strong>Résultat:</strong> 120/80 mmHg';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        }
        return html;
    }
    
    function render() {
        const root = document.getElementById('root');
        if (!root) return;
        
        const currentPage = getCurrentPage();
        const isConsultation = currentPage === 'consultations';
        const isPatients = currentPage === 'patients';
        const isConfig = currentPage === 'config';
        const isDashboard = !isConsultation && !isPatients && !isConfig;
        
        // Sidebar
        let sidebarHtml = '<div style="width: 250px; background: #1e293b; color: white; padding: 20px; overflow-y: auto;">';
        sidebarHtml += '<h2 style="margin: 0 0 30px 0; font-size: 18px;">O\'CLIC SANTE</h2>';
        sidebarHtml += '<nav style="display: flex; flex-direction: column; gap: 0;">';
        
        // Dashboard link
        sidebarHtml += '<a href="#/" onclick="window.simpleInterface.navigateTo(event)" style="display: block; margin: 5px 0; padding: 12px 15px; background: ' + (isDashboard ? 'rgba(20,184,166,0.2)' : 'transparent') + '; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid ' + (isDashboard ? '#14b8a6' : 'transparent') + ';">Tableau de Bord</a>';
        
        // Consultations link
        sidebarHtml += '<a href="#/consultations" onclick="window.simpleInterface.navigateTo(event)" style="display: block; margin: 5px 0; padding: 12px 15px; background: ' + (isConsultation ? 'rgba(20,184,166,0.2)' : 'transparent') + '; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid ' + (isConsultation ? '#14b8a6' : 'transparent') + ';">Consultations</a>';
        
        // Patients link
        sidebarHtml += '<a href="#/patients" onclick="window.simpleInterface.navigateTo(event)" style="display: block; margin: 5px 0; padding: 12px 15px; background: ' + (isPatients ? 'rgba(20,184,166,0.2)' : 'transparent') + '; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid ' + (isPatients ? '#14b8a6' : 'transparent') + ';">Patients</a>';
        sidebarHtml += '<a href="#/config" onclick="window.simpleInterface.navigateTo(event)" style="display: block; margin: 5px 0; padding: 12px 15px; background: ' + (isConfig ? 'rgba(20,184,166,0.2)' : 'transparent') + '; border-radius: 5px; cursor: pointer; text-decoration: none; color: white; border-left: 3px solid ' + (isConfig ? '#14b8a6' : 'transparent') + ';">⚙️ Configuration</a>';
        
        sidebarHtml += '</nav></div>';
        
        // Content
        let contentHtml = '<div style="flex: 1; background: #f8fafc; overflow-y: auto; padding: 30px;">';
        
        if (isConsultation) {
            contentHtml += '<h1>Consultations</h1>';
            contentHtml += '<p>Page de consultations affichee avec succes!</p>';
            contentHtml += '<div style="background: white; border-radius: 8px; padding: 20px; margin-top: 30px; border: 1px solid #e2e8f0;">';
            contentHtml += '<h2>Details de Consultation</h2>';
            contentHtml += '<div style="display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px;">';
            contentHtml += '<button onclick="window.simpleInterface.switchTab(\'clinical\')" style="padding: 10px 20px; border: none; background: ' + (activeTab === 'clinical' ? '#f0fdf4' : 'transparent') + '; cursor: pointer; font-weight: bold; border-bottom: ' + (activeTab === 'clinical' ? '2px solid #14b8a6' : 'none') + ';">Clinique</button>';
            contentHtml += '<button onclick="window.simpleInterface.switchTab(\'diagnosis\')" style="padding: 10px 20px; border: none; background: ' + (activeTab === 'diagnosis' ? '#f0fdf4' : 'transparent') + '; cursor: pointer; font-weight: bold; border-bottom: ' + (activeTab === 'diagnosis' ? '2px solid #14b8a6' : 'none') + ';">Diagnostic</button>';
            contentHtml += '<button onclick="window.simpleInterface.switchTab(\'prescription\')" style="padding: 10px 20px; border: none; background: ' + (activeTab === 'prescription' ? '#f0fdf4' : 'transparent') + '; cursor: pointer; font-weight: bold; border-bottom: ' + (activeTab === 'prescription' ? '2px solid #14b8a6' : 'none') + ';">Prescription</button>';
            contentHtml += '<button onclick="window.simpleInterface.switchTab(\'exams\')" style="padding: 10px 20px; border: none; background: ' + (activeTab === 'exams' ? '#f0fdf4' : 'transparent') + '; cursor: pointer; font-weight: bold; border-bottom: ' + (activeTab === 'exams' ? '2px solid #14b8a6' : 'none') + ';">Examens</button>';
            contentHtml += '</div>';
            contentHtml += '<div id="tab-content" style="padding: 20px; background: #f8fafc; border-radius: 5px;">';
            contentHtml += buildTabContent();
            contentHtml += '</div>';
            contentHtml += '</div>';
        } else if (isPatients) {
            contentHtml += '<h1>Patients</h1>';
            contentHtml += '<p>Liste des patients affichee avec succes!</p>';
            contentHtml += '<div style="background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-top: 20px;">';
            contentHtml += '<table style="width: 100%; border-collapse: collapse;">';
            contentHtml += '<thead><tr style="background: #f8fafc;"><th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0;">Nom</th><th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0;">Téléphone</th><th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0;">Dernière visite</th></tr></thead>';
            contentHtml += '<tbody><tr><td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">Patient Test</td><td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">622123456</td><td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">15/03/2026</td></tr></tbody>';
            contentHtml += '</table></div>';
        } else if (isConfig) {
            contentHtml += '<h1>Configuration du Centre</h1>';
            contentHtml += '<p>Personnalisez les informations de votre centre médical pour les documents imprimés.</p>';
            contentHtml += '<div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">';
            contentHtml += '<strong>⚠️ Important:</strong> Les informations configurées ici apparaîtront dans les en-têtes de toutes les ordonnances et résultats d\'examens.';
            contentHtml += '</div>';
            contentHtml += '<button onclick="showCenterConfig()" style="background: #14b8a6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; margin-top: 20px;">⚙️ Ouvrir la configuration</button>';
        } else {
            contentHtml += '<h1>Tableau de Bord</h1>';
            contentHtml += '<p>Bienvenue sur O\'CLIC SANTE!</p>';
        }
        
        contentHtml += '</div>';
        
        // Final HTML
        let fullHtml = '<div style="display: flex; height: 100vh; font-family: system-ui;">';
        fullHtml += sidebarHtml;
        fullHtml += contentHtml;
        fullHtml += '</div>';
        
        root.innerHTML = fullHtml;
        console.log('Interface rendered');
    }
    
    // Expose functions globally
    window.simpleInterface = {
        navigateTo: function(e) {
            if (e) e.preventDefault();
            render();
        },
        switchTab: function(tab) {
            activeTab = tab;
            const content = document.getElementById('tab-content');
            if (content) {
                content.innerHTML = buildTabContent();
            }
        }
    };
    
    // Listen for hash changes
    window.addEventListener('hashchange', render);
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInterface);
    } else {
        initInterface();
    }
    
    // Fonctions d'impression globales
    window.printCurrentOrdonnance = function() {
        const ticket = {
            patientName: 'Mamadou Diop',
            patientAge: 35,
            patientGender: 'M'
        };
        
        const consultation = {
            prescription: [
                {
                    medicine: 'Paracétamol 500mg',
                    dosage: 'Mat',
                    quantity: '1',
                    duration: '5 jours',
                    instructions: 'Prendre après les repas si douleur'
                },
                {
                    medicine: 'Ibuprofène 400mg',
                    dosage: 'Soir',
                    quantity: '1',
                    duration: '3 jours',
                    instructions: 'Ne pas dépasser 3 comprimés par jour'
                }
            ],
            diagnosis: {
                primary: 'Céphalée tensionnelle',
                secondary: 'Stress léger',
                description: 'Maux de tête fréquents liés au stress professionnel'
            }
        };
        
        // Utiliser le modèle simple et direct
        if (typeof window.printSimpleOrdonnance === 'function') {
            window.printSimpleOrdonnance(ticket, consultation);
        } else if (typeof window.printOrdonnance === 'function') {
            window.printOrdonnance(ticket, consultation);
        } else {
            alert('Fonction d\'impression non disponible. Veuillez recharger la page.');
        }
    };
    
    window.printCurrentExamens = function() {
        const ticket = {
            patientName: 'Patient Test',
            patientAge: 35,
            patientGender: 'M'
        };
        
        const consultation = {
            clinicalExam: {
                bloodPressure: '120/80',
                heartRate: 72,
                temperature: 36.8,
                weight: 75,
                height: 175,
                notes: 'Patient en bonne santé générale, plaint des maux de tête occasionnels'
            },
            exams: [
                {
                    type: 'Analyse sanguine',
                    status: 'completed',
                    date: new Date().toISOString(),
                    result: 'Résultats normaux'
                },
                {
                    type: 'Tension artérielle',
                    status: 'completed',
                    date: new Date().toISOString(),
                    result: '120/80 mmHg'
                }
            ],
            diagnosis: {
                primary: 'Céphalée tensionnelle',
                secondary: 'Stress léger',
                description: 'Maux de tête fréquents liés au stress professionnel'
            }
        };
        
        if (typeof window.printExamens === 'function') {
            window.printExamens(ticket, consultation);
        } else {
            alert('Fonction d\'impression non disponible. Veuillez recharger la page.');
        }
    };
    
    window.printCurrentDiagnostic = function() {
        const ticket = {
            patientName: 'Patient Test',
            patientAge: 35,
            patientGender: 'M'
        };
        
        const consultation = {
            diagnosis: {
                primary: 'Céphalée tensionnelle',
                secondary: 'Stress léger',
                description: 'Maux de tête fréquents liés au stress professionnel'
            }
        };
        
        if (typeof window.printOrdonnance === 'function') {
            window.printOrdonnance(ticket, consultation);
        } else {
            alert('Fonction d\'impression non disponible. Veuillez recharger la page.');
        }
    };
    
    console.log('Simple interface ready');
})();
