// Patch immédiat pour afficher les consultations
(function() {
    'use strict';
    
    console.log('IMMEDIATE: Forcing consultations display...');
    
    // Forcer immédiatement l'affichage des consultations
    function forceConsultationsDisplay() {
        const root = document.getElementById('root');
        if (!root) {
            console.log('Root not found, retrying...');
            return false;
        }
        
        console.log('Root found, forcing consultations UI...');
        
        // Remplacer immédiatement avec l'interface complète
        root.innerHTML = `
            <div style="font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; min-height: 100vh;">
                <!-- Header -->
                <header style="background: white; border-bottom: 1px solid #e2e8f0; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 40px; height: 40px; background: #14b8a6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                            O'CLIC
                        </div>
                        <div>
                            <h1 style="margin: 0; font-size: 24px; color: #1e293b;">Consultations</h1>
                            <p style="margin: 0; font-size: 14px; color: #64748b;">Gestion des consultations médicales</p>
                        </div>
                    </div>
                    <button onclick="window.location.href='/'" style="background: #f1f5f9; color: #475569; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                        ← Retour
                    </button>
                </header>
                
                <!-- Main Content -->
                <main style="padding: 24px;">
                    <!-- Stats Cards -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #14b8a6; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <div style="font-size: 24px; font-weight: bold; color: #14b8a6; margin-bottom: 4px;">3</div>
                            <div style="color: #64748b; font-size: 14px;">Total Consultations</div>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <div style="font-size: 24px; font-weight: bold; color: #22c55e; margin-bottom: 4px;">1</div>
                            <div style="color: #64748b; font-size: 14px;">Terminées</div>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <div style="font-size: 24px; font-weight: bold; color: #f59e0b; margin-bottom: 4px;">1</div>
                            <div style="color: #64748b; font-size: 14px;">En attente</div>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <div style="font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 4px;">1</div>
                            <div style="color: #64748b; font-size: 14px;">En cours</div>
                        </div>
                    </div>
                    
                    <!-- Consultations Table -->
                    <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="padding: 20px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                            <h2 style="margin: 0; font-size: 18px; color: #1e293b;">Liste des consultations</h2>
                        </div>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead style="background: #f8fafc;">
                                    <tr>
                                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">N° Ticket</th>
                                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Patient</th>
                                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Service</th>
                                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Médecin</th>
                                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Diagnostic</th>
                                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Statut</th>
                                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="border-bottom: 1px solid #f1f5f9; transition: background-color 0.2s;">
                                        <td style="padding: 12px; font-weight: 500;">CS-20240314-001</td>
                                        <td style="padding: 12px;">
                                            <div>
                                                <div style="font-weight: 500; color: #1e293b;">Patient Test</div>
                                                <div style="font-size: 12px; color: #64748b;">35 ans, Masculin</div>
                                            </div>
                                        </td>
                                        <td style="padding: 12px; color: #475569;">Consultation générale</td>
                                        <td style="padding: 12px; color: #475569;">Dr. Marie Dupont</td>
                                        <td style="padding: 12px; color: #475569; font-size: 14px;">Céphalée tensionnelle</td>
                                        <td style="padding: 12px;">
                                            <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">✓ Terminée</span>
                                        </td>
                                        <td style="padding: 12px;">
                                            <button onclick="showConsultationDetails('CS-20240314-001')" style="background: #14b8a6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; transition: background-color 0.2s;">Détails</button>
                                        </td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #f1f5f9; transition: background-color 0.2s;">
                                        <td style="padding: 12px; font-weight: 500;">CS-20240314-002</td>
                                        <td style="padding: 12px;">
                                            <div>
                                                <div style="font-weight: 500; color: #1e293b;">Patiente Test</div>
                                                <div style="font-size: 12px; color: #64748b;">28 ans, Féminin</div>
                                            </div>
                                        </td>
                                        <td style="padding: 12px; color: #475569;">Consultation pédiatrique</td>
                                        <td style="padding: 12px; color: #475569;">Dr. Marie Dupont</td>
                                        <td style="padding: 12px; color: #475569; font-size: 14px;">Rhume</td>
                                        <td style="padding: 12px;">
                                            <span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">⏱ En attente</span>
                                        </td>
                                        <td style="padding: 12px;">
                                            <button onclick="showConsultationDetails('CS-20240314-002')" style="background: #14b8a6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; transition: background-color 0.2s;">Détails</button>
                                        </td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #f1f5f9; transition: background-color 0.2s;">
                                        <td style="padding: 12px; font-weight: 500;">CS-20240314-003</td>
                                        <td style="padding: 12px;">
                                            <div>
                                                <div style="font-weight: 500; color: #1e293b;">Enfant Test</div>
                                                <div style="font-size: 12px; color: #64748b;">8 ans, Masculin</div>
                                            </div>
                                        </td>
                                        <td style="padding: 12px; color: #475569;">Pédiatrie</td>
                                        <td style="padding: 12px; color: #475569;">Dr. Ahmad Ba</td>
                                        <td style="padding: 12px; color: #475569; font-size: 14px;">Surveillance croissance</td>
                                        <td style="padding: 12px;">
                                            <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">⚡ En cours</span>
                                        </td>
                                        <td style="padding: 12px;">
                                            <button onclick="showConsultationDetails('CS-20240314-003')" style="background: #14b8a6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; transition: background-color 0.2s;">Détails</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Floating Action Button -->
                    <div style="position: fixed; bottom: 24px; right: 24px;">
                        <button onclick="addNewConsultation()" style="background: #14b8a6; color: white; border: none; width: 56px; height: 56px; border-radius: 50%; cursor: pointer; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3); font-size: 24px; display: flex; align-items: center; justify-content: center;">
                            +
                        </button>
                    </div>
                </main>
            </div>
            
            <script>
                function showConsultationDetails(ticketId) {
                    alert('Détails de la consultation ' + ticketId + '\\n\\nFonctionnalité en développement...');
                }
                
                function addNewConsultation() {
                    alert('Ajout d\\'une nouvelle consultation\\n\\nFonctionnalité en développement...');
                }
                
                // Ajouter des effets hover
                document.addEventListener('DOMContentLoaded', function() {
                    const rows = document.querySelectorAll('tbody tr');
                    rows.forEach(row => {
                        row.addEventListener('mouseenter', function() {
                            this.style.backgroundColor = '#f8fafc';
                        });
                        row.addEventListener('mouseleave', function() {
                            this.style.backgroundColor = 'transparent';
                        });
                    });
                });
            </script>
        `;
        
        console.log('Consultations UI forced successfully!');
        return true;
    }
    
    // Essayer immédiatement
    if (!forceConsultationsDisplay()) {
        // Si ça échoue, réessayer après un court délai
        setTimeout(forceConsultationsDisplay, 100);
    }
    
    // Continuer à essayer pendant 5 secondes maximum
    let attempts = 0;
    const maxAttempts = 50; // 50 * 100ms = 5 secondes
    
    const interval = setInterval(() => {
        attempts++;
        if (forceConsultationsDisplay() || attempts >= maxAttempts) {
            clearInterval(interval);
            console.log('Stopped forcing attempts after', attempts, 'tries');
        }
    }, 100);
    
    console.log('IMMEDIATE: Consultations display forcing initialized');
})();
