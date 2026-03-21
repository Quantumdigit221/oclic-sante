// Organiseur d'Examens dans le Dossier Patient - O'CLIC SANTE
(function() {
    'use strict';
    
    console.log('PATIENT-EXAMS-VISIBLE: Loading enhanced patient exam module...');

    let currentPatientId = null;
    let patientExams = [];

    // Fonction principale pour injecter la section d'examens
    function injectExamSection() {
        const root = document.getElementById('root');
        if (!root) return;

        // Tenter de détecter le patient ID depuis l'URL ou le contenu
        detectPatientContext();

        // Chercher une section pour l'injection (Dossier Patient)
        const targets = document.querySelectorAll('div, section, main');
        targets.forEach(target => {
            if (target.textContent.includes('Dossier') && 
               (target.textContent.includes('Patient') || target.textContent.includes('Mamadou') || target.textContent.includes('Diop')) &&
               !target.querySelector('.enhanced-exams-container')) {
                
                renderExamSectionInTarget(target);
            }
        });
    }

    function detectPatientContext() {
        // Simple détection par défaut pour le démo si non trouvé
        const hash = window.location.hash;
        if (hash.includes('/patient/')) {
            currentPatientId = hash.split('/').pop();
        } else {
            currentPatientId = 'P-0001'; // Fallback
        }
    }

    async function fetchPatientExams() {
        try {
            const response = await fetch(`/api/lab-results?patientId=${currentPatientId}`);
            patientExams = await response.json();
            if (patientExams.length === 0) {
                // Mock data pour la démo si vide
                patientExams = [
                    { id: '101', test_name: 'NFS', category: 'Hématologie', status: 'COMPLETED', result: { hemoglobin: '14.5', wbc: '7.5' }, created_at: new Date().toISOString() },
                    { id: '102', test_name: 'Glycémie', category: 'Biochimie', status: 'PENDING', created_at: new Date().toISOString() }
                ];
            }
        } catch (e) {
            console.error('Fetch error:', e);
        }
    }

    async function renderExamSectionInTarget(target) {
        await fetchPatientExams();

        const container = document.createElement('div');
        container.className = 'enhanced-exams-container';
        container.style.cssText = `
            margin: 30px 0;
            padding: 30px;
            background: #ffffff;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
            font-family: 'Inter', system-ui, sans-serif;
        `;

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="margin: 0; font-size: 20px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 10px;">
                    <span style="background: #ede9fe; color: #8b5cf6; padding: 6px; border-radius: 8px; font-size: 16px;">🧪</span> 
                    Analyses et Résultats
                </h3>
                <div style="display: flex; gap: 10px;">
                    <button onclick="window.location.hash='#/exams'" style="padding: 8px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; color: #64748b; font-weight: 600; cursor: pointer; font-size: 13px;">
                        Voir tout →
                    </button>
                    <button onclick="alert('Impression du dossier d\\'examens en cours...')" style="padding: 8px 16px; background: #8b5cf6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2);">
                        🖨️ Imprimer
                    </button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                ${patientExams.length > 0 ? patientExams.map(renderExamCardSmall).join('') : '<p style="color: #94a3b8; text-align: center; grid-column: span 2;">Aucun examen enregistré.</p>'}
            </div>
        `;

        target.appendChild(container);
    }

    function renderExamCardSmall(exam) {
        const isCompleted = exam.status === 'COMPLETED';
        const statusColor = isCompleted ? '#10b981' : (exam.status === 'IN_PROGRESS' ? '#3b82f6' : '#f59e0b');
        const dateStr = new Date(exam.created_at).toLocaleDateString('fr-FR');

        return `
            <div style="background: ${isCompleted ? '#f0fdf4' : '#fffbeb'}; border: 1px solid ${isCompleted ? '#dcfce7' : '#fef3c7'}; border-radius: 12px; padding: 16px; transition: transform 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                        <div style="font-weight: 700; color: #1e293b; font-size: 15px;">${exam.test_name}</div>
                        <div style="font-size: 12px; color: #64748b;">${exam.category} • ${dateStr}</div>
                    </div>
                    <span style="font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 20px; background: white; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                        ${exam.status}
                    </span>
                </div>
                
                ${isCompleted ? `
                    <div style="font-size: 13px; color: #166534; font-weight: 500; margin-bottom: 12px; background: rgba(255,255,255,0.5); padding: 8px; border-radius: 6px;">
                        ✅ Résultats disponibles
                    </div>
                ` : `
                    <div style="font-size: 13px; color: #92400e; font-weight: 500; margin-bottom: 12px;">
                        ⏳ En attente de traitement
                    </div>
                `}

                <button onclick="handleExamine('${exam.id}')" style="width: 100%; padding: 8px; background: white; border: 1px solid ${isCompleted ? '#dcfce7' : '#fef3c7'}; border-radius: 8px; color: #1e293b; font-weight: 600; font-size: 12px; cursor: pointer; transition: all 0.2s;" 
                    onmouseover="this.style.background='white'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)';" 
                    onmouseout="this.style.background='white';">
                    ${isCompleted ? '👁️ Voir Résultats' : '📝 Compléter'}
                </button>
            </div>
        `;
    }

    window.handleExamine = function(id) {
        window.location.hash = '#/exams'; // Pour l'instant on redirige vers l'organiseur principal
    };

    // Observer pour les changements de DOM (car React reconstruit souvent la page)
    const observer = new MutationObserver(() => {
        injectExamSection();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run
    setTimeout(injectExamSection, 2000);

})();
