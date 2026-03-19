// Interface originale restaurée avec menu latéral et consultations détaillées
(function() {
    'use strict';
    
    console.log('RESTORING: Original interface with sidebar...');
    
    // Données de test pour tickets et consultations
    const ticketsData = [
        {
            id: 'ticket-001',
            number: 'TK-20240314-001',
            patientName: 'Patient Test',
            patientAge: 35,
            patientGender: 'M',
            service: 'Consultation générale',
            status: 'completed',
            priority: 'normal',
            createdAt: new Date().toISOString(),
            consultation: {
                id: 'consultation-001',
                clinicalExam: {
                    bloodPressure: '120/80',
                    heartRate: 72,
                    temperature: 36.8,
                    weight: 75,
                    height: 175,
                    notes: 'Patient en bonne santé générale, plaint des maux de tête occasionnels'
                },
                diagnosis: {
                    primary: 'Céphalée tensionnelle',
                    secondary: 'Stress léger',
                    description: 'Maux de tête fréquents liés au stress professionnel'
                },
                prescription: [
                    {
                        medicine: 'Paracétamol 500mg',
                        dosage: '1 comprimé toutes les 6 heures',
                        duration: '5 jours',
                        instructions: 'Prendre après les repas si douleur'
                    },
                    {
                        medicine: 'Ibuprofène 400mg',
                        dosage: '1 comprimé si douleur intense',
                        duration: '3 jours maximum',
                        instructions: 'Ne pas dépasser 3 comprimés par jour'
                    }
                ],
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
                prescriptionLink: {
                    pharmacyId: 'pharma-001',
                    pharmacyName: 'Pharmacie O\'CLIC',
                    status: 'sent',
                    sentAt: new Date().toISOString()
                }
            }
        },
        {
            id: 'ticket-002',
            number: 'TK-20240314-002',
            patientName: 'Patiente Test',
            patientAge: 28,
            patientGender: 'F',
            service: 'Consultation pédiatrique',
            status: 'in_progress',
            priority: 'urgent',
            createdAt: new Date().toISOString(),
            consultation: {
                id: 'consultation-002',
                clinicalExam: {
                    bloodPressure: '110/70',
                    heartRate: 85,
                    temperature: 37.2,
                    weight: 65,
                    height: 162,
                    notes: 'Enfant avec fièvre légère et toux'
                },
                diagnosis: {
                    primary: 'Rhume viral',
                    secondary: 'Fièvre légère',
                    description: 'Infection respiratoire bénigne'
                },
                prescription: [
                    {
                        medicine: 'Doliprane pédiatrique',
                        dosage: '10mg/kg toutes les 6 heures',
                        duration: '3 jours',
                        instructions: 'Adapter le poids de l\'enfant'
                    },
                    {
                        medicine: 'Sirop pour la toux',
                        dosage: '1 cuillère 3 fois par jour',
                        duration: '5 jours',
                        instructions: 'Avant les repas'
                    }
                ],
                exams: [
                    {
                        type: 'Test COVID-19',
                        status: 'pending',
                        date: new Date(Date.now() + 86400000).toISOString(),
                        result: 'En attente'
                    }
                ],
                prescriptionLink: {
                    pharmacyId: 'pharma-002',
                    pharmacyName: 'Pharmie Centrale',
                    status: 'pending',
                    sentAt: null
                }
            }
        },
        {
            id: 'ticket-003',
            number: 'TK-20240314-003',
            patientName: 'Enfant Test',
            patientAge: 8,
            patientGender: 'M',
            service: 'Pédiatrie',
            status: 'pending',
            priority: 'normal',
            createdAt: new Date(Date.now() + 172800000).toISOString(),
            consultation: null
        }
    ];
    
    let selectedTicket = null;
    let activeTab = 'clinical';
    
    // Fonctions utilitaires
    function getStatusStyle(status) {
        switch(status) {
            case 'completed': return 'background: #dcfce7; color: #166534;';
            case 'in_progress': return 'background: #dbeafe; color: #1e40af;';
            case 'pending': return 'background: #fef3c7; color: #92400e;';
            default: return 'background: #f1f5f9; color: #475569;';
        }
    }
    
    function getStatusText(status) {
        switch(status) {
            case 'completed': return '✅ Terminé';
            case 'in_progress': return '⚡ En cours';
            case 'pending': return '⏱ En attente';
            default: return status;
        }
    }
    
    // Fonction pour créer l'interface
    function createOriginalInterface() {
        const root = document.getElementById('root');
        if (!root) return false;
        
        console.log('RESTORING: Creating original interface...');
        
        root.innerHTML = `
            <div style="display: flex; height: 100vh; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc;">
                <!-- Sidebar -->
                <aside style="width: 280px; background: linear-gradient(180deg, #1e293b 0%, #334155 100%); color: white; display: flex; flex-direction: column;">
                    <!-- Logo -->
                    <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 40px; height: 40px; background: #14b8a6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">
                                O'CLIC
                            </div>
                            <div>
                                <h2 style="margin: 0; font-size: 18px; font-weight: 600;">O'CLIC SANTE</h2>
                                <p style="margin: 0; font-size: 12px; opacity: 0.8;">Plateforme Médicale</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Navigation -->
                    <nav style="flex: 1; padding: 20px 0;">
                        <div style="margin-bottom: 8px;">
                            <a href="/" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: white; text-decoration: none; border-radius: 8px; transition: all 0.2s;">
                                <span>🏠</span>
                                <span>Accueil</span>
                            </a>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <a href="/tickets" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: white; text-decoration: none; border-radius: 8px; transition: all 0.2s; background: rgba(20, 184, 166, 0.2);">
                                <span>🎫</span>
                                <span>Tickets</span>
                            </a>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <a href="/patients" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: white; text-decoration: none; border-radius: 8px; transition: all 0.2s;">
                                <span>👥</span>
                                <span>Patients</span>
                            </a>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <a href="/pharmacy" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: white; text-decoration: none; border-radius: 8px; transition: all 0.2s;">
                                <span>💊</span>
                                <span>Pharmacie</span>
                            </a>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <a href="/services" style="display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: white; text-decoration: none; border-radius: 8px; transition: all 0.2s;">
                                <span>🏥</span>
                                <span>Services</span>
                            </a>
                        </div>
                    </nav>
                    
                    <!-- User -->
                    <div style="padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                👤
                            </div>
                            <div>
                                <div style="font-size: 14px; font-weight: 500;">Dr. Administrateur</div>
                                <div style="font-size: 12px; opacity: 0.8;">Médecin</div>
                            </div>
                        </div>
                    </div>
                </aside>
                
                <!-- Main Content -->
                <main style="flex: 1; display: flex; flex-direction: column;">
                    <!-- Header -->
                    <header style="background: white; border-bottom: 1px solid #e2e8f0; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h1 style="margin: 0; font-size: 24px; color: #1e293b;">Gestion des Consultations</h1>
                            <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">Tickets et consultations médicales</p>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button onclick="refreshTickets()" style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                                🔄 Actualiser
                            </button>
                            <button onclick="createNewTicket()" style="background: #14b8a6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                                + Nouveau Ticket
                            </button>
                        </div>
                    </header>
                    
                    <!-- Content Area -->
                    <div style="flex: 1; display: flex; overflow: hidden;">
                        <!-- Tickets List -->
                        <section style="width: 400px; background: white; border-right: 1px solid #e2e8f0; overflow-y: auto;">
                            <div style="padding: 20px; border-bottom: 1px solid #f1f5f9;">
                                <h2 style="margin: 0; font-size: 18px; color: #1e293b;">Liste des Tickets</h2>
                                <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">${ticketsData.length} ticket(s)</p>
                            </div>
                            <div style="padding: 0 20px 20px;">
                                ${ticketsData.map(ticket => `
                                    <div onclick="selectTicket('${ticket.id}')" style="padding: 16px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; ${selectedTicket === ticket.id ? 'background: #f0fdf4; border-color: #14b8a6;' : 'background: white;'}" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${selectedTicket === ticket.id ? '#f0fdf4' : 'white'}'">
                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                            <div>
                                                <div style="font-weight: 500; color: #1e293b; margin-bottom: 4px;">${ticket.number}</div>
                                                <div style="font-size: 14px; color: #475569;">${ticket.patientName}</div>
                                            </div>
                                            <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; ${getStatusStyle(ticket.status)}">
                                                ${getStatusText(ticket.status)}
                                            </span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b;">
                                            <span>${ticket.service}</span>
                                            <span>${new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                        
                        <!-- Consultation Details -->
                        <section style="flex: 1; background: #f8fafc; overflow-y: auto;">
                            ${selectedTicket ? getConsultationDetailsHTML() : `
                                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #64748b;">
                                    <div style="text-align: center;">
                                        <div style="font-size: 48px; margin-bottom: 16px;">🎫</div>
                                        <h3 style="margin: 0; font-size: 20px; color: #1e293b;">Sélectionnez un ticket</h3>
                                        <p style="margin: 8px 0 0 0;">Cliquez sur un ticket pour voir les détails de la consultation</p>
                                    </div>
                                </div>
                            `}
                        </section>
                    </div>
                </main>
            </div>
            
            <script>
                window.selectTicket = function(ticketId) {
                    selectedTicket = ticketId;
                    createOriginalInterface();
                };
                
                window.refreshTickets = function() {
                    alert('🔄 Actualisation des tickets\\n\\nLes données seraient rechargées depuis le serveur...');
                };
                
                window.createNewTicket = function() {
                    alert('➕ Création d\\'un nouveau ticket\\n\\nFormulaire de création en développement...');
                };
                
                window.switchTab = function(tab) {
                    activeTab = tab;
                    createOriginalInterface();
                };
                
                window.viewPrescription = function(medicine) {
                    alert('💊 Détails du médicament:\\n\\n' + medicine + '\\n\\nFonctionnalité de lien avec pharmacie en développement...');
                };
                
                function getConsultationDetailsHTML() {
                    const ticket = ticketsData.find(t => t.id === selectedTicket);
                    if (!ticket || !ticket.consultation) {
                        return \`
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #64748b;">
                                <div style="text-align: center;">
                                    <div style="font-size: 48px; margin-bottom: 16px;">⏱</div>
                                    <h3 style="margin: 0; font-size: 20px; color: #1e293b;">Consultation non commencée</h3>
                                    <p style="margin: 8px 0 0 0;">Cette consultation n'a pas encore de détails</p>
                                </div>
                            </div>
                        \`;
                    }
                    
                    const consultation = ticket.consultation;
                    
                    return \`
                        <div style="padding: 24px;">
                            <!-- Patient Info -->
                            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #1e293b;">Informations Patient</h3>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Nom</label>
                                        <div style="font-size: 14px; color: #1e293b;">\${ticket.patientName}</div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Âge</label>
                                        <div style="font-size: 14px; color: #1e293b;">\${ticket.patientAge} ans</div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Genre</label>
                                        <div style="font-size: 14px; color: #1e293b;">\${ticket.patientGender === 'M' ? 'Masculin' : 'Féminin'}</div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Service</label>
                                        <div style="font-size: 14px; color: #1e293b;">\${ticket.service}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Tabs -->
                            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                                <!-- Tab Headers -->
                                <div style="display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                                    <button onclick="switchTab('clinical')" style="flex: 1; padding: 16px; border: none; background: \${activeTab === 'clinical' ? 'white' : 'transparent'}; color: \${activeTab === 'clinical' ? '#14b8a6' : '#64748b'}; cursor: pointer; font-weight: 500; border-bottom: \${activeTab === 'clinical' ? '2px solid #14b8a6' : 'none'};">
                                        🏥 Examen Clinique
                                    </button>
                                    <button onclick="switchTab('diagnosis')" style="flex: 1; padding: 16px; border: none; background: \${activeTab === 'diagnosis' ? 'white' : 'transparent'}; color: \${activeTab === 'diagnosis' ? '#14b8a6' : '#64748b'}; cursor: pointer; font-weight: 500; border-bottom: \${activeTab === 'diagnosis' ? '2px solid #14b8a6' : 'none'};">
                                        🔬 Diagnostic
                                    </button>
                                    <button onclick="switchTab('prescription')" style="flex: 1; padding: 16px; border: none; background: \${activeTab === 'prescription' ? 'white' : 'transparent'}; color: \${activeTab === 'prescription' ? '#14b8a6' : '#64748b'}; cursor: pointer; font-weight: 500; border-bottom: \${activeTab === 'prescription' ? '2px solid #14b8a6' : 'none'};">
                                        💊 Prescription
                                    </button>
                                    <button onclick="switchTab('exams')" style="flex: 1; padding: 16px; border: none; background: \${activeTab === 'exams' ? 'white' : 'transparent'}; color: \${activeTab === 'exams' ? '#14b8a6' : '#64748b'}; cursor: pointer; font-weight: 500; border-bottom: \${activeTab === 'exams' ? '2px solid #14b8a6' : 'none'};">
                                        📋 Examens
                                    </button>
                                    <button onclick="switchTab('prescription-link')" style="flex: 1; padding: 16px; border: none; background: \${activeTab === 'prescription-link' ? 'white' : 'transparent'}; color: \${activeTab === 'prescription-link' ? '#14b8a6' : '#64748b'}; cursor: pointer; font-weight: 500; border-bottom: \${activeTab === 'prescription-link' ? '2px solid #14b8a6' : 'none'};">
                                        🏪 Ordonnance
                                    </button>
                                </div>
                                
                                <!-- Tab Content -->
                                <div style="padding: 24px;">
                                    \${getTabContent(consultation)}
                                </div>
                            </div>
                        </div>
                    \`;
                }
                
                function getTabContent(consultation) {
                    switch(activeTab) {
                        case 'clinical':
                            return \`
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Pression Artérielle</label>
                                        <div style="font-size: 16px; color: #1e293b; font-weight: 500;">\${consultation.clinicalExam.bloodPressure}</div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Fréquence Cardiaque</label>
                                        <div style="font-size: 16px; color: #1e293b; font-weight: 500;">\${consultation.clinicalExam.heartRate} bpm</div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Température</label>
                                        <div style="font-size: 16px; color: #1e293b; font-weight: 500;">\${consultation.clinicalExam.temperature}°C</div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Poids</label>
                                        <div style="font-size: 16px; color: #1e293b; font-weight: 500;">\${consultation.clinicalExam.weight} kg</div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Taille</label>
                                        <div style="font-size: 16px; color: #1e293b; font-weight: 500;">\${consultation.clinicalExam.height} cm</div>
                                    </div>
                                </div>
                                <div style="margin-top: 24px;">
                                    <label style="font-size: 12px; color: #64748b; font-weight: 500;">Notes Cliniques</label>
                                    <div style="background: #f8fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #14b8a6; margin-top: 8px;">
                                        \${consultation.clinicalExam.notes}
                                    </div>
                                </div>
                            \`;
                        case 'diagnosis':
                            return \`
                                <div style="display: grid; gap: 16px;">
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Diagnostic Principal</label>
                                        <div style="background: #dcfce7; padding: 16px; border-radius: 6px; border-left: 4px solid #22c55e; margin-top: 8px;">
                                            <div style="font-size: 16px; color: #1e293b; font-weight: 500;">\${consultation.diagnosis.primary}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Diagnostic Secondaire</label>
                                        <div style="background: #fef3c7; padding: 16px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-top: 8px;">
                                            <div style="font-size: 16px; color: #1e293b; font-weight: 500;">\${consultation.diagnosis.secondary}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label style="font-size: 12px; color: #64748b; font-weight: 500;">Description</label>
                                        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #14b8a6; margin-top: 8px;">
                                            \${consultation.diagnosis.description}
                                        </div>
                                    </div>
                                </div>
                            \`;
                        case 'prescription':
                            return \`
                                <div style="display: grid; gap: 16px;">
                                    \${consultation.prescription.map((med, index) => \`
                                        <div style="background: white; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px;">
                                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                                <div>
                                                    <div style="font-size: 16px; color: #1e293b; font-weight: 500;">\${med.medicine}</div>
                                                    <div style="font-size: 14px; color: #64748b; margin-top: 4px;">Médicament #\${index + 1}</div>
                                                </div>
                                                <button onclick="viewPrescription('\${med.medicine}')" style="background: #14b8a6; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                                    💊 Voir
                                                </button>
                                            </div>
                                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                                                <div>
                                                    <label style="font-size: 12px; color: #64748b; font-weight: 500;">Posologie</label>
                                                    <div style="font-size: 14px; color: #1e293b;">\${med.dosage}</div>
                                                </div>
                                                <div>
                                                    <label style="font-size: 12px; color: #64748b; font-weight: 500;">Durée</label>
                                                    <div style="font-size: 14px; color: #1e293b;">\${med.duration}</div>
                                                </div>
                                            </div>
                                            <div style="margin-top: 12px;">
                                                <label style="font-size: 12px; color: #64748b; font-weight: 500;">Instructions</label>
                                                <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 4px;">
                                                    \${med.instructions}
                                                </div>
                                            </div>
                                        </div>
                                    \`).join('')}
                                </div>
                            \`;
                        case 'exams':
                            return \`
                                <div style="display: grid; gap: 16px;">
                                    \${consultation.exams.map(exam => \`
                                        <div style="background: white; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                                <div>
                                                    <div style="font-size: 16px; color: #1e293b; font-weight: 500;">\${exam.type}</div>
                                                    <div style="font-size: 12px; color: #64748b;">\${new Date(exam.date).toLocaleDateString('fr-FR')}</div>
                                                </div>
                                                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; \${exam.status === 'completed' ? 'background: #dcfce7; color: #166534;' : 'background: #fef3c7; color: #92400e;'}">
                                                    \${exam.status === 'completed' ? '✅ Terminé' : '⏱ En attente'}
                                                </span>
                                            </div>
                                            <div>
                                                <label style="font-size: 12px; color: #64748b; font-weight: 500;">Résultat</label>
                                                <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 4px;">
                                                    \${exam.result}
                                                </div>
                                            </div>
                                        </div>
                                    \`).join('')}
                                </div>
                            \`;
                        case 'prescription-link':
                            return \`
                                <div style="display: grid; gap: 16px;">
                                    <div style="background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                            <div>
                                                <div style="font-size: 16px; color: #1e293b; font-weight: 500;">\${consultation.prescriptionLink.pharmacyName}</div>
                                                <div style="font-size: 14px; color: #64748b;">Pharmacie destinataire</div>
                                            </div>
                                            <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; \${consultation.prescriptionLink.status === 'sent' ? 'background: #dcfce7; color: #166534;' : 'background: #fef3c7; color: #92400e;'}">
                                                \${consultation.prescriptionLink.status === 'sent' ? '✅ Envoyée' : '⏱ En attente'}
                                            </span>
                                        </div>
                                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                                            <div>
                                                <label style="font-size: 12px; color: #64748b; font-weight: 500;">ID Pharmacie</label>
                                                <div style="font-size: 14px; color: #1e293b;">\${consultation.prescriptionLink.pharmacyId}</div>
                                            </div>
                                            <div>
                                                <label style="font-size: 12px; color: #64748b; font-weight: 500;">Date d'envoi</label>
                                                <div style="font-size: 14px; color: #1e293b;">\${consultation.prescriptionLink.sentAt ? new Date(consultation.prescriptionLink.sentAt).toLocaleDateString('fr-FR') : 'Non envoyée'}</div>
                                            </div>
                                        </div>
                                        <div style="margin-top: 16px;">
                                            <button onclick="window.open('/pharmacy', '_blank')" style="background: #14b8a6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                                                🏪 Voir la pharmacie
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            \`;
                        default:
                            return '';
                    }
                }
            </script>
        `;
        
        console.log('RESTORING: Original interface created successfully!');
        return true;
    }
    
    // Forcer l'affichage immédiat
    setTimeout(() => {
        if (!createOriginalInterface()) {
            setTimeout(createOriginalInterface, 100);
        }
    }, 0);
    
    // Protection contre les erreurs
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('filter is not a function')) {
            console.warn('RESTORING: Error blocked:', e.message);
            e.preventDefault();
            return false;
        }
    });
    
    console.log('RESTORING: Original interface system ready');
})();
