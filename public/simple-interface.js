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
            html += '</div>';
        } else if (activeTab === 'prescription') {
            html = '<h4>Prescription</h4>';
            html += '<div style="margin-top: 15px;">';
            html += '<div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 5px; margin-bottom: 10px;"><strong>Paracetamol 500mg</strong><br><small>1 comprime toutes les 6 heures</small></div>';
            html += '<div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 5px;"><strong>Ibuprofene 400mg</strong><br><small>1 comprime si douleur intense</small></div>';
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
        const isDashboard = !isConsultation && !isPatients;
        
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
            contentHtml += '<thead style="background: #f1f5f9;"><tr><th style="padding: 15px; text-align: left; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Nom</th><th style="padding: 15px; text-align: left; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Age</th><th style="padding: 15px; text-align: left; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Genre</th><th style="padding: 15px; text-align: left; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Statut</th></tr></thead>';
            contentHtml += '<tbody>';
            contentHtml += '<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 15px;">Patient Test</td><td style="padding: 15px;">35 ans</td><td style="padding: 15px;">Homme</td><td style="padding: 15px;"><span style="background: #dcfce7; color: #166534; padding: 5px 10px; border-radius: 12px; font-size: 12px;">Actif</span></td></tr>';
            contentHtml += '<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 15px;">Patiente Test</td><td style="padding: 15px;">28 ans</td><td style="padding: 15px;">Femme</td><td style="padding: 15px;"><span style="background: #dcfce7; color: #166534; padding: 5px 10px; border-radius: 12px; font-size: 12px;">Actif</span></td></tr>';
            contentHtml += '</tbody>';
            contentHtml += '</table>';
            contentHtml += '</div>';
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
    
    console.log('Simple interface ready');
})();
