// Composant React pour l'historique des consultations
(function() {
    'use strict';
    
    console.log('CONSULTATION-HISTORY-COMPONENT: Creating React component for consultation history...');
    
    // Fonction pour injecter le composant d'historique dans React
    function injectHistoryComponent() {
        setTimeout(() => {
            // Chercher les éléments React où injecter le composant
            const injectionPoints = [
                '.patient-details',
                '.consultation-details',
                '.medical-records',
                '.patient-info',
                '.consultation-info',
                '[class*="patient"]',
                '[class*="consultation"]'
            ];
            
            let injectionPoint = null;
            for (const selector of injectionPoints) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    injectionPoint = elements[0];
                    console.log('CONSULTATION-HISTORY-COMPONENT: Found injection point:', selector);
                    break;
                }
            }
            
            // Si pas de point d'injection trouvé, chercher le root
            if (!injectionPoint) {
                const root = document.getElementById('root');
                if (root) {
                    injectionPoint = root;
                    console.log('CONSULTATION-HISTORY-COMPONENT: Using root as injection point');
                }
            }
            
            if (!injectionPoint) {
                console.log('CONSULTATION-HISTORY-COMPONENT: No injection point found, retrying...');
                setTimeout(injectHistoryComponent, 2000);
                return;
            }
            
            // Vérifier si le composant existe déjà
            if (injectionPoint.querySelector('.consultation-history-component')) {
                console.log('CONSULTATION-HISTORY-COMPONENT: Component already exists');
                return;
            }
            
            // Créer le composant d'historique
            const historyComponent = document.createElement('div');
            historyComponent.className = 'consultation-history-component';
            historyComponent.innerHTML = `
                <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #3b82f6;">
                    <!-- Header du composant -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                        <h3 style="margin: 0; font-size: 18px; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                            📚 Historique des Consultations
                        </h3>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="toggleHistoryView()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                🔄 Actualiser
                            </button>
                            <button onclick="toggleHistorySize()" style="background: #64748b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                📏 Taille
                            </button>
                        </div>
                    </div>
                    
                    <!-- Statistiques compactes -->
                    <div id="history-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="font-size: 18px; font-weight: bold; color: #3b82f6; margin-bottom: 4px;">156</div>
                            <div style="font-size: 11px; color: #64748b;">Total</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="font-size: 18px; font-weight: bold; color: #14b8a6; margin-bottom: 4px;">24</div>
                            <div style="font-size: 11px; color: #64748b;">Ce mois</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="font-size: 18px; font-weight: bold; color: #f59e0b; margin-bottom: 4px;">8</div>
                            <div style="font-size: 11px; color: #64748b;">Aujourd'hui</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="font-size: 18px; font-weight: bold; color: #10b981; margin-bottom: 4px;">42</div>
                            <div style="font-size: 11px; color: #64748b;">Patients</div>
                        </div>
                    </div>
                    
                    <!-- Filtres compactés -->
                    <div id="history-filters" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
                        <input type="text" placeholder="🔍 Rechercher..." onkeyup="filterHistoryTable(this.value)" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px;">
                        <select onchange="filterHistoryByPatient(this.value)" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px;">
                            <option value="">Tous les patients</option>
                            <option value="mamadou">Mamadou Diop</option>
                            <option value="patiente">Patiente Test</option>
                            <option value="enfant">Enfant Test</option>
                        </select>
                        <select onchange="filterHistoryByDate(this.value)" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px;">
                            <option value="">Toutes les dates</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="week">Cette semaine</option>
                            <option value="month">Ce mois</option>
                        </select>
                        <select onchange="filterHistoryByStatus(this.value)" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px;">
                            <option value="">Tous les statuts</option>
                            <option value="completed">Terminée</option>
                            <option value="ongoing">En cours</option>
                            <option value="cancelled">Annulée</option>
                        </select>
                    </div>
                    
                    <!-- Tableau compact d'historique -->
                    <div id="history-table-container" style="max-height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                        ${getCompactHistoryTableHTML()}
                    </div>
                    
                    <!-- Actions rapides -->
                    <div style="margin-top: 15px; text-align: center;">
                        <button onclick="exportHistoryData()" style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; margin-right: 8px;">
                            📊 Exporter
                        </button>
                        <button onclick="printHistoryData()" style="background: #14b8a6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; margin-right: 8px;">
                            🖨️ Imprimer
                        </button>
                        <button onclick="showFullHistory()" style="background: #8b5cf6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            📋 Voir tout
                        </button>
                    </div>
                </div>
            `;
            
            // Ajouter le composant au point d'injection
            injectionPoint.appendChild(historyComponent);
            
            console.log('CONSULTATION-HISTORY-COMPONENT: Component injected successfully');
            
        }, 3000);
    }
    
    function getCompactHistoryTableHTML() {
        const consultations = [
            { id: 'CONS-001', patient: 'Mamadou Diop', date: '19 mars 2026', time: '14:30', doctor: 'Dr. Admin', type: 'Consultation générale', price: '15,000', status: 'completed', statusText: 'Terminée', statusColor: '#10b981' },
            { id: 'CONS-002', patient: 'Patiente Test', date: '19 mars 2026', time: '10:15', doctor: 'Dr. Admin', type: 'Consultation pédiatrique', price: '20,000', status: 'completed', statusText: 'Terminée', statusColor: '#10b981' },
            { id: 'CONS-003', patient: 'Enfant Test', date: '18 mars 2026', time: '16:45', doctor: 'Dr. Sow', type: 'Consultation pédiatrique', price: '15,000', status: 'completed', statusText: 'Terminée', statusColor: '#10b981' },
            { id: 'CONS-004', patient: 'Mamadou Diop', date: '18 mars 2026', time: '09:00', doctor: 'Dr. Diallo', type: 'Consultation spécialisée', price: '25,000', status: 'cancelled', statusText: 'Annulée', statusColor: '#ef4444' },
            { id: 'CONS-005', patient: 'Patiente Test', date: '17 mars 2026', time: '11:30', doctor: 'Dr. Admin', type: 'Consultation gynécologique', price: '30,000', status: 'completed', statusText: 'Terminée', statusColor: '#10b981' }
        ];
        
        let html = '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
        html += '<thead style="position: sticky; top: 0; background: #f8fafc; z-index: 10;"><tr>';
        html += '<th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left; font-weight: 600; font-size: 11px;">ID</th>';
        html += '<th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left; font-weight: 600; font-size: 11px;">Patient</th>';
        html += '<th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left; font-weight: 600; font-size: 11px;">Date</th>';
        html += '<th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left; font-weight: 600; font-size: 11px;">Heure</th>';
        html += '<th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left; font-weight: 600; font-size: 11px;">Type</th>';
        html += '<th style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: 600; font-size: 11px;">Prix</th>';
        html += '<th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600; font-size: 11px;">Statut</th>';
        html += '<th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600; font-size: 11px;">Actions</th>';
        html += '</tr></thead><tbody>';
        
        consultations.forEach((consultation, index) => {
            const rowBg = consultation.status === 'cancelled' ? '#fef2f2' : (index % 2 === 0 ? 'white' : '#f8fafc');
            html += `<tr style="background: ${rowBg};">`;
            html += `<td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500; font-size: 11px;">${consultation.id}</td>`;
            html += `<td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 11px;">${consultation.patient}</td>`;
            html += `<td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 11px;">${consultation.date}</td>`;
            html += `<td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 11px;">${consultation.time}</td>`;
            html += `<td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 11px;">${consultation.type}</td>`;
            html += `<td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #10b981; font-size: 11px;">${consultation.price} GNF</td>`;
            html += `<td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">`;
            html += `<span style="padding: 2px 6px; background: ${consultation.statusColor}20; color: ${consultation.statusColor}; border-radius: 3px; font-size: 10px; font-weight: 500;">${consultation.statusText}</span>`;
            html += `</td>`;
            html += `<td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">`;
            html += `<button onclick="showConsultationDetails('${consultation.id}')" style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; margin-right: 2px;">👁️</button>`;
            html += `<button onclick="editConsultation('${consultation.id}')" style="background: #f59e0b; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px; margin-right: 2px;">✏️</button>`;
            html += `<button onclick="printConsultation('${consultation.id}')" style="background: #14b8a6; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">🖨️</button>`;
            html += `</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        
        return html;
    }
    
    // Fonctions du composant
    window.toggleHistoryView = function() {
        console.log('CONSULTATION-HISTORY-COMPONENT: Toggling history view...');
        const component = document.querySelector('.consultation-history-component');
        if (component) {
            const tableContainer = component.querySelector('#history-table-container');
            if (tableContainer) {
                tableContainer.style.display = tableContainer.style.display === 'none' ? 'block' : 'none';
            }
        }
    };
    
    window.toggleHistorySize = function() {
        console.log('CONSULTATION-HISTORY-COMPONENT: Toggling history size...');
        const component = document.querySelector('.consultation-history-component');
        if (component) {
            const tableContainer = component.querySelector('#history-table-container');
            if (tableContainer) {
                if (tableContainer.style.maxHeight === '400px') {
                    tableContainer.style.maxHeight = '200px';
                } else {
                    tableContainer.style.maxHeight = '400px';
                }
            }
        }
    };
    
    window.filterHistoryTable = function(searchTerm) {
        console.log('CONSULTATION-HISTORY-COMPONENT: Filtering history table:', searchTerm);
        // Logique de filtrage à implémenter
    };
    
    window.filterHistoryByPatient = function(patient) {
        console.log('CONSULTATION-HISTORY-COMPONENT: Filtering by patient:', patient);
        // Logique de filtrage à implémenter
    };
    
    window.filterHistoryByDate = function(dateFilter) {
        console.log('CONSULTATION-HISTORY-COMPONENT: Filtering by date:', dateFilter);
        // Logique de filtrage à implémenter
    };
    
    window.filterHistoryByStatus = function(status) {
        console.log('CONSULTATION-HISTORY-COMPONENT: Filtering by status:', status);
        // Logique de filtrage à implémenter
    };
    
    window.exportHistoryData = function() {
        console.log('CONSULTATION-HISTORY-COMPONENT: Exporting history data...');
        alert('📊 Export des données d\'historique en cours de développement !');
    };
    
    window.printHistoryData = function() {
        console.log('CONSULTATION-HISTORY-COMPONENT: Printing history data...');
        alert('🖨️ Impression des données d\'historique en cours de développement !');
    };
    
    window.showFullHistory = function() {
        console.log('CONSULTATION-HISTORY-COMPONENT: Showing full history...');
        alert('📋 Affichage de l\'historique complet en cours de développement !');
    };
    
    window.showConsultationDetails = function(consultationId) {
        console.log('CONSULTATION-HISTORY-COMPONENT: Showing consultation details:', consultationId);
        alert('👁️ Détails de la consultation ' + consultationId + ' en cours de développement !');
    };
    
    window.editConsultation = function(consultationId) {
        console.log('CONSULTATION-HISTORY-COMPONENT: Editing consultation:', consultationId);
        alert('✏️ Modification de la consultation ' + consultationId + ' en cours de développement !');
    };
    
    window.printConsultation = function(consultationId) {
        console.log('CONSULTATION-HISTORY-COMPONENT: Printing consultation:', consultationId);
        alert('🖨️ Impression de la consultation ' + consultationId + ' en cours de développement !');
    };
    
    // Surveiller les changements dans l'application React
    function monitorReactChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Vérifier si le composant existe toujours
                    const component = document.querySelector('.consultation-history-component');
                    if (!component) {
                        console.log('CONSULTATION-HISTORY-COMPONENT: Component removed, reinjecting...');
                        injectHistoryComponent();
                    }
                }
            });
        });
        
        const root = document.getElementById('root');
        if (root) {
            observer.observe(root, {
                childList: true,
                subtree: true
            });
        }
    }
    
    // Lancer l'injection du composant
    setTimeout(() => {
        injectHistoryComponent();
        monitorReactChanges();
    }, 2000);
    
    // Surveiller périodiquement pour s'assurer que le composant est toujours présent
    setInterval(() => {
        const component = document.querySelector('.consultation-history-component');
        if (!component) {
            console.log('CONSULTATION-HISTORY-COMPONENT: Component not found, reinjecting...');
            injectHistoryComponent();
        }
    }, 10000);
    
    console.log('CONSULTATION-HISTORY-COMPONENT: Ready to inject React component');
})();
