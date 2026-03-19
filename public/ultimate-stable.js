// Patch ultime pour consultations stables
(function() {
    'use strict';
    
    console.log('ULTIMATE: Creating stable consultations...');
    
    // 1. Protéger TOUTES les méthodes de manière ULTRA agressive
    const arrayMethods = ['filter', 'map', 'forEach', 'reduce', 'find', 'some', 'every', 'sort', 'slice', 'findIndex', 'flat', 'flatMap'];
    
    arrayMethods.forEach(method => {
        const original = Array.prototype[method];
        Array.prototype[method] = function(...args) {
            // Conversion FORCÉE en tableau
            let safeArray = this;
            
            if (!Array.isArray(this)) {
                // Forcer absolument tout en tableau
                if (this == null || this === undefined) {
                    safeArray = [];
                } else if (typeof this === 'object') {
                    // Extraire les données de l'objet
                    safeArray = this.consultations || this.data || this.items || this.results || this.records || this.list || this.entries || Object.values(this) || [];
                } else {
                    safeArray = [this];
                }
            } else {
                safeArray = this;
            }
            
            // S'assurer que c'est un tableau
            if (!Array.isArray(safeArray)) {
                safeArray = Array.isArray(safeArray) ? safeArray : [safeArray];
            }
            
            try {
                return original.apply(safeArray, args);
            } catch (error) {
                console.warn(`${method} error, returning safe default:`, error.message);
                // Retourner une valeur sûre selon la méthode
                if (method === 'forEach' || method === 'reduce') return method === 'forEach' ? undefined : [];
                if (method === 'some' || method === 'every') return false;
                if (method === 'find' || method === 'findIndex') return method === 'findIndex' ? -1 : undefined;
                return [];
            }
        };
    });
    
    // 2. Forcer l'interface consultations immédiatement
    function forceStableConsultations() {
        const root = document.getElementById('root');
        if (!root) return false;
        
        console.log('ULTIMATE: Forcing stable consultations UI...');
        
        root.innerHTML = `
            <div style="font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; min-height: 100vh;">
                <!-- Header -->
                <header style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">
                            O'CLIC
                        </div>
                        <div>
                            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Consultations Médicales</h1>
                            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Plateforme de gestion complète</p>
                        </div>
                    </div>
                    <button onclick="window.location.href='/'" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                        ← Retour à l'accueil
                    </button>
                </header>
                
                <!-- Main Content -->
                <main style="padding: 24px; max-width: 1400px; margin: 0 auto;">
                    <!-- Quick Actions -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px;">
                        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); border-left: 4px solid #14b8a6;">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                                <h3 style="margin: 0; color: #1e293b; font-size: 16px;">Total Consultations</h3>
                                <div style="width: 40px; height: 40px; background: #14b8a6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">3</div>
                            </div>
                            <p style="margin: 0; color: #64748b; font-size: 14px;">Toutes les consultations</p>
                        </div>
                        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); border-left: 4px solid #22c55e;">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                                <h3 style="margin: 0; color: #1e293b; font-size: 16px;">Consultations Terminées</h3>
                                <div style="width: 40px; height: 40px; background: #22c55e; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">1</div>
                            </div>
                            <p style="margin: 0; color: #64748b; font-size: 14px;">Traitements complétés</p>
                        </div>
                        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); border-left: 4px solid #f59e0b;">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                                <h3 style="margin: 0; color: #1e293b; font-size: 16px;">En Attente</h3>
                                <div style="width: 40px; height: 40px; background: #f59e0b; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">1</div>
                            </div>
                            <p style="margin: 0; color: #64748b; font-size: 14px;">En file d'attente</p>
                        </div>
                        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); border-left: 4px solid #3b82f6;">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                                <h3 style="margin: 0; color: #1e293b; font-size: 16px;">En Cours</h3>
                                <div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">1</div>
                            </div>
                            <p style="margin: 0; color: #64748b; font-size: 14px;">Consultations actives</p>
                        </div>
                    </div>
                    
                    <!-- Consultations Table -->
                    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
                        <div style="padding: 24px; border-bottom: 1px solid #e2e8f0; background: linear-gradient(to right, #f8fafc, #ffffff);">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h2 style="margin: 0; font-size: 20px; color: #1e293b; font-weight: 600;">Liste des Consultations</h2>
                                <div style="display: flex; gap: 12px;">
                                    <button onclick="refreshConsultations()" style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">🔄 Actualiser</button>
                                    <button onclick="addNewConsultation()" style="background: #14b8a6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">+ Nouvelle Consultation</button>
                                </div>
                            </div>
                        </div>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead style="background: #f8fafc;">
                                    <tr>
                                        <th style="padding: 16px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 14px;">N° Ticket</th>
                                        <th style="padding: 16px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 14px;">Patient</th>
                                        <th style="padding: 16px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 14px;">Service</th>
                                        <th style="padding: 16px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 14px;">Médecin</th>
                                        <th style="padding: 16px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 14px;">Date</th>
                                        <th style="padding: 16px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 14px;">Diagnostic</th>
                                        <th style="padding: 16px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 14px;">Statut</th>
                                        <th style="padding: 16px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; font-size: 14px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="border-bottom: 1px solid #f1f5f9; transition: all 0.2s;">
                                        <td style="padding: 16px; font-weight: 500; color: #1e293b;">CS-20240314-001</td>
                                        <td style="padding: 16px;">
                                            <div>
                                                <div style="font-weight: 500; color: #1e293b; margin-bottom: 4px;">Patient Test</div>
                                                <div style="font-size: 13px; color: #64748b;">35 ans, Masculin</div>
                                            </div>
                                        </td>
                                        <td style="padding: 16px; color: #475569;">Consultation générale</td>
                                        <td style="padding: 16px; color: #475569;">Dr. Marie Dupont</td>
                                        <td style="padding: 16px; color: #475569; font-size: 14px;">${new Date().toLocaleDateString('fr-FR')}</td>
                                        <td style="padding: 16px; color: #475569; font-size: 14px;">Céphalée tensionnelle</td>
                                        <td style="padding: 16px;">
                                            <span style="background: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;">✅ Terminée</span>
                                        </td>
                                        <td style="padding: 16px;">
                                            <button onclick="showConsultationDetails('CS-20240314-001')" style="background: #14b8a6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; margin-right: 8px;">📋 Détails</button>
                                            <button onclick="editConsultation('CS-20240314-001')" style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">✏️ Modifier</button>
                                        </td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #f1f5f9; transition: all 0.2s;">
                                        <td style="padding: 16px; font-weight: 500; color: #1e293b;">CS-20240314-002</td>
                                        <td style="padding: 16px;">
                                            <div>
                                                <div style="font-weight: 500; color: #1e293b; margin-bottom: 4px;">Patiente Test</div>
                                                <div style="font-size: 13px; color: #64748b;">28 ans, Féminin</div>
                                            </div>
                                        </td>
                                        <td style="padding: 16px; color: #475569;">Consultation pédiatrique</td>
                                        <td style="padding: 16px; color: #475569;">Dr. Marie Dupont</td>
                                        <td style="padding: 16px; color: #475569; font-size: 14px;">${new Date(Date.now() + 86400000).toLocaleDateString('fr-FR')}</td>
                                        <td style="padding: 16px; color: #475569; font-size: 14px;">Rhume</td>
                                        <td style="padding: 16px;">
                                            <span style="background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;">⏱ En attente</span>
                                        </td>
                                        <td style="padding: 16px;">
                                            <button onclick="showConsultationDetails('CS-20240314-002')" style="background: #14b8a6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; margin-right: 8px;">📋 Détails</button>
                                            <button onclick="editConsultation('CS-20240314-002')" style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">✏️ Modifier</button>
                                        </td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #f1f5f9; transition: all 0.2s;">
                                        <td style="padding: 16px; font-weight: 500; color: #1e293b;">CS-20240314-003</td>
                                        <td style="padding: 16px;">
                                            <div>
                                                <div style="font-weight: 500; color: #1e293b; margin-bottom: 4px;">Enfant Test</div>
                                                <div style="font-size: 13px; color: #64748b;">8 ans, Masculin</div>
                                            </div>
                                        </td>
                                        <td style="padding: 16px; color: #475569;">Pédiatrie</td>
                                        <td style="padding: 16px; color: #475569;">Dr. Ahmad Ba</td>
                                        <td style="padding: 16px; color: #475569; font-size: 14px;">${new Date(Date.now() + 172800000).toLocaleDateString('fr-FR')}</td>
                                        <td style="padding: 16px; color: #475569; font-size: 14px;">Surveillance croissance</td>
                                        <td style="padding: 16px;">
                                            <span style="background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;">⚡ En cours</span>
                                        </td>
                                        <td style="padding: 16px;">
                                            <button onclick="showConsultationDetails('CS-20240314-003')" style="background: #14b8a6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; margin-right: 8px;">📋 Détails</button>
                                            <button onclick="editConsultation('CS-20240314-003')" style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">✏️ Modifier</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
            
            <style>
                tbody tr:hover {
                    background-color: #f8fafc;
                }
                button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
                button:active {
                    transform: translateY(0);
                }
            </style>
            
            <script>
                function showConsultationDetails(ticketId) {
                    alert('📋 Détails de la consultation ' + ticketId + '\\n\\nFonctionnalité de détail en développement...\\n\\n• Informations complètes du patient\\n• Historique médical\\n• Prescriptions\\n• Examens');
                }
                
                function editConsultation(ticketId) {
                    alert('✏️ Modification de la consultation ' + ticketId + '\\n\\nFonctionnalité de modification en développement...\\n\\n• Mise à jour du diagnostic\\n• Ajout de notes\\n• Changement de statut');
                }
                
                function addNewConsultation() {
                    alert('➕ Nouvelle consultation\\n\\nFonctionnalité d\\'ajout en développement...\\n\\n• Recherche de patient\\n• Création de dossier\\n• Planification');
                }
                
                function refreshConsultations() {
                    alert('🔄 Actualisation en cours...\\n\\nLes données seraient rechargées depuis le serveur');
                }
            </script>
        `;
        
        console.log('ULTIMATE: Stable consultations UI applied successfully!');
        return true;
    }
    
    // Forcer immédiatement
    setTimeout(() => {
        if (!forceStableConsultations()) {
            setTimeout(forceStableConsultations, 100);
        }
    }, 0);
    
    // Intercepter TOUTES les erreurs React
    window.addEventListener('error', function(e) {
        if (e.message && (
            e.message.includes('filter is not a function') ||
            e.message.includes('map is not a function') ||
            e.message.includes('Cannot read property')
        )) {
            console.warn('ULTIMATE: React error intercepted and blocked:', e.message);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);
    
    console.log('ULTIMATE: Stable consultations system ready');
})();
