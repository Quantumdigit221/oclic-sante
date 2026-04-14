// Gestion des Examens liés aux Consultations et Tickets - O'CLIC SANTE
(function() {
    'use strict';
    
    console.log('EXAM-DEPENDENT: Loading organized dependency module...');

    // Fonction pour ajouter les examens aux consultations/tickets
    function scanAndInject() {
        const root = document.getElementById('root');
        if (!root) return;

        // Détection des sections de consultation/ticket par mots-clés
        const sections = document.querySelectorAll('div, section, article');
        sections.forEach(section => {
            const text = section.textContent || section.innerText || '';
            const isTarget = (text.includes('Consultation') || text.includes('Ticket')) && 
                             (text.includes('Mamadou') || text.includes('Patient') || text.includes('Montant'));
            
            if (isTarget && !section.querySelector('.organized-dependent-exams')) {
                renderDependentExamSection(section);
            }
        });
    }

    async function renderDependentExamSection(target) {
        const container = document.createElement('div');
        container.className = 'organized-dependent-exams';
        container.style.cssText = `
            margin: 25px 0;
            padding: 25px;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            font-family: 'Inter', system-ui, sans-serif;
        `;

        container.innerHTML = `
            <div style="border-bottom: 2px solid #8b5cf6; padding-bottom: 12px; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                    🧪 Examens Associés
                </h3>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px;">
                ${['NFS', 'Biochimie', 'Coagulation', 'Urine', 'Paludisme'].map(name => `
                    <button onclick="requestNewExam('${name}')" style="padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; color: #475569; transition: all 0.2s;"
                        onmouseover="this.style.background='#ede9fe'; this.style.color='#8b5cf6'; this.style.borderColor='#8b5cf6';"
                        onmouseout="this.style.background='#f8fafc'; this.style.color='#475569'; this.style.borderColor='#e2e8f0';">
                        + ${name}
                    </button>
                `).join('')}
            </div>

            <div id="dependent-exams-list" style="display: flex; flex-direction: column; gap: 10px;">
                <p style="text-align: center; color: #94a3b8; font-size: 13px;">Aucun examen prescrit pour cette session.</p>
            </div>
        `;

        target.appendChild(container);
    }

    window.requestNewExam = async function(testName) {
        console.log('Requesting exam:', testName);
        // Ici on pourrait ouvrir un modal de saisie ou envoyer directement au labo
        const patientName = document.body.innerText.includes('Mamadou') ? 'Mamadou Diop' : 'Patient';
        
        try {
            const res = await fetch('/api/lab-results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testName: testName,
                    patientName: patientName,
                    status: 'PENDING',
                    category: testName === 'NFS' ? 'Hématologie' : 'Général'
                })
            });
            const created = await res.json();
            alert(`✅ Examen "${testName}" envoyé au laboratoire pour ${patientName}`);
            window.location.hash = '#/exams';
        } catch (e) {
            alert('Erreur lors de la prescription de l\'examen.');
        }
    };

    // Observer pour le dynamisme
    const observer = new MutationObserver(() => scanAndInject());
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run
    setTimeout(scanAndInject, 3000);

})();

