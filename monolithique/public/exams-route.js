// Organiseur de Résultats d'Examens - O'CLIC SANTE
(function() {
    'use strict';
    
    console.log('EXAMS-ROUTE: Loading enhanced laboratory organizer...');
    
    let labResults = [];
    let currentFilter = 'ALL';
    let searchQuery = '';

    // Initialisation
    async function init() {
        await fetchLabResults();
        renderExamsPage();
    }

    async function fetchLabResults() {
        try {
            const response = await fetch('/api/lab-results');
            labResults = await response.json();
            // If empty, add mock data for demonstration
            if (labResults.length === 0) {
                labResults = [
                    { id: '1', patient_name: 'Mamadou Diop', test_name: 'NFS', category: 'Hématologie', status: 'COMPLETED', created_at: '2026-03-19T10:00:00Z', doctor_name: 'Dr. Keita' },
                    { id: '2', patient_name: 'Aminata Sow', test_name: 'Glycémie', category: 'Biochimie', status: 'PENDING', created_at: '2026-03-19T11:30:00Z', doctor_name: 'Dr. Diallo' },
                    { id: '3', patient_name: 'Jean Koulibaly', test_name: 'Urée/Créat', category: 'Biochimie', status: 'IN_PROGRESS', created_at: '2026-03-19T09:15:00Z', doctor_name: 'Dr. Barry' },
                    { id: '4', patient_name: 'Fatou Ndiaye', test_name: 'Test Palu (TDR)', category: 'Parasitologie', status: 'COMPLETED', created_at: '2026-03-18T15:45:00Z', doctor_name: 'Dr. Keita' },
                    { id: '5', patient_name: 'Oumar Sy', test_name: 'Widal', category: 'Sérologie', status: 'PENDING', created_at: '2026-03-19T14:20:00Z', doctor_name: 'Dr. Diallo' }
                ];
            }
        } catch (error) {
            console.error('Error fetching lab results:', error);
        }
    }

    function renderExamsPage() {
        const root = document.getElementById('root');
        if (!root || !window.location.hash.includes('/exams')) return;

        const stats = {
            total: labResults.length,
            pending: labResults.filter(r => r.status === 'PENDING').length,
            inProgress: labResults.filter(r => r.status === 'IN_PROGRESS').length,
            completed: labResults.filter(r => r.status === 'COMPLETED').length
        };

        const filteredResults = labResults.filter(r => {
            const matchesFilter = currentFilter === 'ALL' || r.status === currentFilter;
            const matchesSearch = r.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                r.test_name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        root.innerHTML = `
            <div style="display: flex; height: 100vh; font-family: 'Inter', system-ui, sans-serif; background: #f1f5f9; color: #1e293b;">
                <!-- Sidebar -->
                <aside style="width: 280px; background: #1e293b; color: white; display: flex; flex-direction: column;">
                    <div style="padding: 30px 20px;">
                        <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #8b5cf6; display: flex; align-items: center; gap: 10px;">
                            <span style="background: white; border-radius: 8px; padding: 5px; font-size: 18px;">🏥</span> O'CLIC SANTE
                        </h2>
                    </div>
                    <nav style="flex: 1; padding: 0 15px;">
                        <a href="#/" class="nav-item">🏠️ Tableau de bord</a>
                        <a href="#/patients" class="nav-item">👥 Patients</a>
                        <a href="#/consultations" class="nav-item">🎫 Consultations</a>
                        <a href="#/exams" class="nav-item active">🧪 Laboratoire</a>
                        <a href="#/pharmacy" class="nav-item">💊 Pharmacie</a>
                        <a href="#/config" class="nav-item">⚙️ Configuration</a>
                    </nav>
                </aside>

                <!-- Main Content -->
                <main style="flex: 1; overflow-y: auto; padding: 40px;">
                    <header style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px;">
                        <div>
                            <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #0f172a;">Gestion du Laboratoire</h1>
                            <p style="margin: 8px 0 0; color: #64748b; font-size: 16px;">Organisation et suivi des résultats d'examens</p>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button onclick="window.location.reload()" style="padding: 12px 20px; background: white; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                                🔄 Actualiser
                            </button>
                            <button onclick="alert('Fonctionnalité d\\'ajout direct bientôt disponible')" style="padding: 12px 24px; background: #8b5cf6; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2);">
                                ➕ Nouvel Examen
                            </button>
                        </div>
                    </header>

                    <!-- Stats Cards -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 40px;">
                        ${renderStatCard('Total Examens', stats.total, '#6366f1', '📊')}
                        ${renderStatCard('En attente', stats.pending, '#f59e0b', '⏳')}
                        ${renderStatCard('En cours', stats.inProgress, '#3b82f6', '⚗️')}
                        ${renderStatCard('Terminés', stats.completed, '#10b981', '✅')}
                    </div>

                    <!-- Filters & Search -->
                    <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; gap: 4px;">
                            ${renderFilterBtn('ALL', 'Tous')}
                            ${renderFilterBtn('PENDING', 'En attente')}
                            ${renderFilterBtn('IN_PROGRESS', 'En cours')}
                            ${renderFilterBtn('COMPLETED', 'Terminés')}
                        </div>
                        <div style="position: relative; width: 350px;">
                            <span style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8;">🔍</span>
                            <input type="text" placeholder="Rechercher un patient ou un test..." 
                                value="${searchQuery}"
                                oninput="updateSearch(this.value)"
                                style="width: 100%; padding: 12px 12px 12px 45px; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; font-size: 14px; transition: border 0.2s;">
                        </div>
                    </div>

                    <!-- Results List -->
                    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
                                    <th style="padding: 16px 24px; font-weight: 600; font-size: 13px; color: #64748b; text-transform: uppercase;">Patient</th>
                                    <th style="padding: 16px 24px; font-weight: 600; font-size: 13px; color: #64748b; text-transform: uppercase;">Examen</th>
                                    <th style="padding: 16px 24px; font-weight: 600; font-size: 13px; color: #64748b; text-transform: uppercase;">Catégorie</th>
                                    <th style="padding: 16px 24px; font-weight: 600; font-size: 13px; color: #64748b; text-transform: uppercase;">Prescrit par</th>
                                    <th style="padding: 16px 24px; font-weight: 600; font-size: 13px; color: #64748b; text-transform: uppercase;">Statut</th>
                                    <th style="padding: 16px 24px; font-weight: 600; font-size: 13px; color: #64748b; text-transform: uppercase;">Date</th>
                                    <th style="padding: 16px 24px; font-weight: 600; font-size: 13px; color: #64748b; text-transform: uppercase; text-align: right;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredResults.length > 0 ? filteredResults.map(r => renderExamRow(r)).join('') : `
                                    <tr>
                                        <td colspan="7" style="padding: 60px; text-align: center; color: #94a3b8;">
                                            <div style="font-size: 40px; margin-bottom: 10px;">📋</div>
                                            <p>Aucun résultat trouvé pour cette sélection.</p>
                                        </td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
            <style>
                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 15px;
                    margin: 4px 0;
                    color: #94a3b8;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .nav-item:hover {
                    background: rgba(255,255,255,0.05);
                    color: white;
                }
                .nav-item.active {
                    background: #8b5cf6;
                    color: white;
                }
                tr:hover {
                    background-color: #f8fafc;
                }
            </style>
        `;
    }

    function renderStatCard(title, value, color, icon) {
        return `
            <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 20px;">
                <div style="width: 56px; height: 56px; border-radius: 12px; background: ${color}15; color: ${color}; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    ${icon}
                </div>
                <div>
                    <div style="font-size: 14px; color: #64748b; font-weight: 500;">${title}</div>
                    <div style="font-size: 28px; font-weight: 800; color: #1e293b;">${value}</div>
                </div>
            </div>
        `;
    }

    function renderFilterBtn(id, label) {
        const isActive = currentFilter === id;
        return `
            <button onclick="setFilter('${id}')" style="padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; 
                background: ${isActive ? 'white' : 'transparent'}; 
                color: ${isActive ? '#8b5cf6' : '#64748b'};
                box-shadow: ${isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};">
                ${label}
            </button>
        `;
    }

    function renderExamRow(r) {
        const dateStr = new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        const statusColors = {
            'PENDING': { bg: '#fff7ed', text: '#ea580c', label: 'En attente' },
            'IN_PROGRESS': { bg: '#eff6ff', text: '#2563eb', label: 'En cours' },
            'COMPLETED': { bg: '#f0fdf4', text: '#16a34a', label: 'Terminé' }
        };
        const s = statusColors[r.status] || statusColors['PENDING'];

        return `
            <tr style="border-bottom: 1px solid #f8fafc; transition: background 0.2s;">
                <td style="padding: 16px 24px;">
                    <div style="font-weight: 700; color: #1e293b;">${r.patient_name}</div>
                    <div style="font-size: 12px; color: #94a3b8;">ID: P-${r.id.padStart(4, '0')}</div>
                </td>
                <td style="padding: 16px 24px;">
                    <div style="font-weight: 600;">${r.test_name}</div>
                </td>
                <td style="padding: 16px 24px;">
                    <span style="font-size: 12px; padding: 4px 8px; background: #f1f5f9; border-radius: 6px; color: #475569; font-weight: 500;">${r.category}</span>
                </td>
                <td style="padding: 16px 24px; color: #64748b; font-size: 14px;">
                    ${r.doctor_name || 'Dr. Admin'}
                </td>
                <td style="padding: 16px 24px;">
                    <span style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: ${s.bg}; color: ${s.text}; border: 1px solid ${s.text}20;">
                        ${s.label}
                    </span>
                </td>
                <td style="padding: 16px 24px; color: #64748b; font-size: 13px;">
                    ${dateStr}
                </td>
                <td style="padding: 16px 24px; text-align: right;">
                    <button onclick="handleAction('${r.id}', '${r.status}')" style="padding: 8px 16px; background: ${r.status === 'COMPLETED' ? '#f1f5f9' : '#8b5cf6'}; color: ${r.status === 'COMPLETED' ? '#475569' : 'white'}; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer;">
                        ${r.status === 'COMPLETED' ? '👁️ Détails' : '📝 Saisir'}
                    </button>
                </td>
            </tr>
        `;
    }

    window.setFilter = function(filter) {
        currentFilter = filter;
        renderExamsPage();
    };

    window.updateSearch = function(query) {
        searchQuery = query;
        renderExamsPage();
    };

    window.handleAction = function(id, status) {
        console.log('Action on exam:', id, status);
        if (status === 'COMPLETED') {
            alert("Affichage des résultats de l'examen " + id);
        } else {
            alert("Ouverture de l'interface de saisie pour l'examen " + id);
        }
    };

    // Event listeners
    window.addEventListener('hashchange', renderExamsPage);
    
    // Initial fetch
    init();

})();

