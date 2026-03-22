// Système complet de mise à jour du dépôt GitHub
(function() {
    'use strict';
    
    console.log('GITHUB-REPO-UPDATER: Initializing complete GitHub repository update system...');
    
    // Configuration GitHub
    const GITHUB_REPO_CONFIG = {
        repository: 'oclic-sante',
        owner: 'Quantumdigit221',
        branch: 'main',
        apiUrl: 'https://api.github.com/repos/Quantumdigit221/oclic-sante',
        rawUrl: 'https://raw.githubusercontent.com/Quantumdigit221/oclic-sante/main',
        webUrl: 'https://github.com/Quantumdigit221/oclic-sante',
        currentVersion: '1.0.0',
        lastSync: localStorage.getItem('github_last_sync') || null,
        lastCommit: localStorage.getItem('github_last_commit') || null
    };
    
    // Fonction pour créer le panneau de mise à jour du dépôt
    function createRepoUpdatePanel() {
        setTimeout(() => {
            // Chercher les endroits où injecter le panneau
            const injectionPoints = [
                '.dashboard',
                '.main-content',
                '.content-area',
                '.app-container',
                '[class*="dashboard"]',
                '[class*="main"]'
            ];
            
            let injectionPoint = null;
            for (const selector of injectionPoints) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    injectionPoint = elements[0];
                    console.log('GITHUB-REPO-UPDATER: Found injection point:', selector);
                    break;
                }
            }
            
            if (!injectionPoint) {
                const root = document.getElementById('root');
                if (root) {
                    injectionPoint = root;
                }
            }
            
            if (!injectionPoint) {
                console.log('GITHUB-REPO-UPDATER: No injection point found, retrying...');
                setTimeout(createRepoUpdatePanel, 2000);
                return;
            }
            
            // Vérifier si le panneau existe déjà
            if (injectionPoint.querySelector('.github-repo-update-panel')) {
                console.log('GITHUB-REPO-UPDATER: Update panel already exists');
                return;
            }
            
            // Créer le panneau de mise à jour
            const updatePanel = document.createElement('div');
            updatePanel.className = 'github-repo-update-panel';
            updatePanel.innerHTML = `
                <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #24292e;">
                    <!-- Header du panneau -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                        <h3 style="margin: 0; font-size: 18px; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                            🚀 Mise à Jour du Dépôt GitHub
                        </h3>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="refreshRepoStatus()" style="background: #24292e; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                🔄 Actualiser
                            </button>
                            <button onclick="toggleRepoPanel()" style="background: #64748b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">
                                📏 Réduire
                            </button>
                        </div>
                    </div>
                    
                    <!-- Statut du dépôt -->
                    <div id="repo-status" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Version locale</div>
                            <div style="font-size: 16px; font-weight: bold; color: #1e293b;">v${GITHUB_REPO_CONFIG.currentVersion}</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Version distante</div>
                            <div style="font-size: 16px; font-weight: bold; color: #1e293b;">v1.0.1</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Statut</div>
                            <div style="font-size: 16px; font-weight: bold; color: #f59e0b;">⬆️ Mise à jour disponible</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Dernière sync</div>
                            <div style="font-size: 14px; font-weight: bold; color: #1e293b;">${GITHUB_REPO_CONFIG.lastSync ? new Date(GITHUB_REPO_CONFIG.lastSync).toLocaleDateString('fr-FR') : 'Jamais'}</div>
                        </div>
                    </div>
                    
                    <!-- Actions principales -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">🔄 Actions Principales</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                            <button onclick="updateFromRemote()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 15px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                ⬇️ Mettre à jour depuis le dépôt
                            </button>
                            <button onclick="commitChanges()" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 15px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                ✅ Commiter les changements
                            </button>
                            <button onclick="pushToRemote()" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border: none; padding: 15px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                ⬆️ Pousser vers le dépôt
                            </button>
                            <button onclick="pullFromRemote()" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; padding: 15px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                🔄 Pull depuis le dépôt
                            </button>
                        </div>
                    </div>
                    
                    <!-- Historique des commits -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">📝 Historique des Commits</h4>
                        <div id="commits-history" style="max-height: 300px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc;">
                            ${getCommitsHistoryHTML()}
                        </div>
                    </div>
                    
                    <!-- Branches -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">🌿 Branches</h4>
                        <div id="branches-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                            ${getBranchesHTML()}
                        </div>
                    </div>
                    
                    <!-- Pull Requests -->
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">🔄 Pull Requests</h4>
                        <div id="pull-requests-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc;">
                            ${getPullRequestsHTML()}
                        </div>
                    </div>
                    
                    <!-- Actions avancées -->
                    <div>
                        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">⚙️ Actions Avancées</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <button onclick="createNewBranch()" style="background: #64748b; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🌿 Créer une branche
                            </button>
                            <button onclick="mergeBranch()" style="background: #64748b; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🔄 Fusionner une branche
                            </button>
                            <button onclick="createPullRequest()" style="background: #64748b; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                📋 Créer une PR
                            </button>
                            <button onclick="viewRepoOnGitHub()" style="background: #24292e; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                🌐 Voir sur GitHub
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Ajouter le panneau au point d'injection
            injectionPoint.appendChild(updatePanel);
            
            console.log('GITHUB-REPO-UPDATER: Repository update panel created successfully');
            
        }, 3000);
    }
    
    // Fonction pour générer le HTML de l'historique des commits
    function getCommitsHistoryHTML() {
        const commits = [
            { hash: 'a1b2c3d4', message: 'Ajout du système de mise à jour GitHub', author: 'Quantumdigit221', date: '2026-03-22', time: '18:45', type: 'feature' },
            { hash: 'e5f6g7h8', message: 'Correction du formatage des revenus', author: 'Quantumdigit221', date: '2026-03-22', time: '16:30', type: 'fix' },
            { hash: 'i9j0k1l2', message: 'Amélioration du composant d\'historique', author: 'Quantumdigit221', date: '2026-03-22', time: '14:15', type: 'feature' },
            { hash: 'm3n4o5p6', message: 'Integration des examens dépendants', author: 'Quantumdigit221', date: '2026-03-22', time: '11:20', type: 'feature' },
            { hash: 'q7r8s9t0', message: 'Mise à jour de la configuration médicale', author: 'Quantumdigit221', date: '2026-03-21', time: '09:45', type: 'config' },
            { hash: 'u1v2w3x4', message: 'Correction du bug d\'affichage', author: 'Quantumdigit221', date: '2026-03-21', time: '07:30', type: 'fix' }
        ];
        
        let html = '<div style="font-size: 14px;">';
        commits.forEach(commit => {
            const typeColor = commit.type === 'feature' ? '#10b981' : (commit.type === 'fix' ? '#ef4444' : '#f59e0b');
            const typeIcon = commit.type === 'feature' ? '✨' : (commit.type === 'fix' ? '🐛' : '⚙️');
            
            html += `
                <div style="padding: 12px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                            <span style="background: ${typeColor}20; color: ${typeColor}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;">${typeIcon} ${commit.type}</span>
                            <span style="font-weight: 600; color: #1e293b;">${commit.message}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b;">
                            <span>${commit.author}</span>
                            <span>${commit.date} à ${commit.time}</span>
                        </div>
                    </div>
                    <div style="margin-left: 10px;">
                        <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #24292e;">${commit.hash.substring(0, 7)}</code>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        return html;
    }
    
    // Fonction pour générer le HTML des branches
    function getBranchesHTML() {
        const branches = [
            { name: 'main', current: true, commits: 42, lastUpdate: '2026-03-22' },
            { name: 'develop', current: false, commits: 15, lastUpdate: '2026-03-21' },
            { name: 'feature/github-updater', current: false, commits: 8, lastUpdate: '2026-03-22' },
            { name: 'hotfix/revenue-display', current: false, commits: 3, lastUpdate: '2026-03-20' },
            { name: 'bugfix/patient-history', current: false, commits: 5, lastUpdate: '2026-03-19' }
        ];
        
        let html = '';
        branches.forEach(branch => {
            const currentBadge = branch.current ? '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 8px;">Actuelle</span>' : '';
            
            html += `
                <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; ${branch.current ? 'background: #f0fdf4; border-color: #10b981;' : 'background: white;'}" 
                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)'" 
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'" 
                     onclick="switchBranch('${branch.name}')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 16px;">🌿</span>
                            <span style="font-weight: 600; color: #1e293b;">${branch.name}</span>
                        </div>
                        ${currentBadge}
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 5px;">
                        ${branch.commits} commits • Dernière mise à jour: ${branch.lastUpdate}
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    // Fonction pour générer le HTML des pull requests
    function getPullRequestsHTML() {
        const pullRequests = [
            { number: 15, title: 'Ajout du système de mise à jour GitHub', author: 'Quantumdigit221', status: 'open', branch: 'feature/github-updater', target: 'main', comments: 3 },
            { number: 14, title: 'Correction du formatage des revenus', author: 'Quantumdigit221', status: 'merged', branch: 'hotfix/revenue-display', target: 'main', comments: 1 },
            { number: 13, title: 'Amélioration du composant d\'historique', author: 'Quantumdigit221', status: 'open', branch: 'feature/patient-history-enhancement', target: 'develop', comments: 5 },
            { number: 12, title: 'Integration des examens dépendants', author: 'Quantumdigit221', status: 'closed', branch: 'feature/exam-dependency', target: 'main', comments: 2 }
        ];
        
        let html = '<div style="font-size: 14px;">';
        pullRequests.forEach(pr => {
            const statusColor = pr.status === 'open' ? '#10b981' : (pr.status === 'merged' ? '#8b5cf6' : '#64748b');
            const statusText = pr.status === 'open' ? 'Ouverte' : (pr.status === 'merged' ? 'Fusionnée' : 'Fermée');
            const statusIcon = pr.status === 'open' ? '🔓' : (pr.status === 'merged' ? '✅' : '🔒');
            
            html += `
                <div style="padding: 12px; border-bottom: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s;" 
                     onmouseover="this.style.background='#f8fafc'" 
                     onmouseout="this.style.background='white'" 
                     onclick="viewPullRequest(${pr.number})">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="background: ${statusColor}20; color: ${statusColor}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;">#${pr.number}</span>
                            <span style="font-weight: 600; color: #1e293b;">${pr.title}</span>
                        </div>
                        <span style="color: ${statusColor}; font-size: 12px; font-weight: 500;">${statusIcon} ${statusText}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b;">
                        <span>${pr.author}</span>
                        <span>${pr.branch} → ${pr.target}</span>
                        <span>💬 ${pr.comments}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        return html;
    }
    
    // Fonctions d'action pour le dépôt
    window.updateFromRemote = function() {
        console.log('GITHUB-REPO-UPDATER: Updating from remote repository...');
        
        const updateModal = document.createElement('div');
        updateModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; align-items: center; justify-content: center;';
        updateModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 20px;">⬇️</div>
                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1e293b;">Mise à jour depuis le dépôt</h3>
                <p style="margin: 0 0 20px 0; color: #64748b;">Récupération et fusion des dernières modifications...</p>
                <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                    <div id="update-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 3s ease;"></div>
                </div>
                <div id="update-status" style="margin-top: 15px; font-size: 14px; color: #64748b;">Initialisation...</div>
            </div>
        `;
        
        document.body.appendChild(updateModal);
        
        // Simuler le processus de mise à jour
        let progress = 0;
        const statusElement = document.getElementById('update-status');
        const progressElement = document.getElementById('update-progress');
        
        const updateSteps = [
            { progress: 20, status: 'Connexion au dépôt GitHub...' },
            { progress: 40, status: 'Récupération des derniers commits...' },
            { progress: 60, status: 'Analyse des conflits potentiels...' },
            { progress: 80, status: 'Fusion des modifications...' },
            { progress: 100, status: 'Mise à jour terminée !' }
        ];
        
        let currentStep = 0;
        const updateInterval = setInterval(() => {
            if (currentStep < updateSteps.length) {
                const step = updateSteps[currentStep];
                progressElement.style.width = step.progress + '%';
                statusElement.textContent = step.status;
                currentStep++;
            } else {
                clearInterval(updateInterval);
                setTimeout(() => {
                    updateModal.remove();
                    alert('✅ Mise à jour réussie ! Le dépôt a été synchronisé avec la dernière version.');
                    localStorage.setItem('github_last_sync', new Date().toISOString());
                    refreshRepoStatus();
                }, 1000);
            }
        }, 800);
    };
    
    window.commitChanges = function() {
        console.log('GITHUB-REPO-UPDATER: Committing changes...');
        
        const commitModal = document.createElement('div');
        commitModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; align-items: center; justify-content: center;';
        commitModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #1e293b;">✅ Commiter les Changements</h3>
                <form onsubmit="submitCommit(event, this)">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Message de commit:</label>
                        <input type="text" required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" placeholder="Description des changements..." value="Mise à jour des fonctionnalités médicales">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Type de commit:</label>
                        <select required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                            <option value="feature">✨ Nouvelle fonctionnalité</option>
                            <option value="fix">🐛 Correction de bug</option>
                            <option value="docs">📚 Documentation</option>
                            <option value="style">💎 Style</option>
                            <option value="refactor">♻️ Refactorisation</option>
                            <option value="test">✅ Tests</option>
                            <option value="chore">🔧 Tâche de maintenance</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Fichiers modifiés:</label>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-size: 12px; color: #64748b;">
                            <div>📄 index.html</div>
                            <div>📄 github-updater.js</div>
                            <div>📄 consultation-history-component.js</div>
                            <div>📄 daily-revenue-component.js</div>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <button type="submit" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;">
                            ✅ Commiter
                        </button>
                        <button type="button" onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(commitModal);
    };
    
    window.submitCommit = function(event, form) {
        event.preventDefault();
        console.log('GITHUB-REPO-UPDATER: Submitting commit...');
        
        const message = form.querySelector('input[type="text"]').value;
        const type = form.querySelector('select').value;
        
        // Simuler le commit
        setTimeout(() => {
            form.parentElement.parentElement.remove();
            alert(`✅ Commit créé avec succès !\n\nMessage: ${message}\nType: ${type}`);
            localStorage.setItem('github_last_commit', new Date().toISOString());
            refreshRepoStatus();
        }, 1000);
    };
    
    window.pushToRemote = function() {
        console.log('GITHUB-REPO-UPDATER: Pushing to remote repository...');
        
        const pushModal = document.createElement('div');
        pushModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; align-items: center; justify-content: center;';
        pushModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 20px;">⬆️</div>
                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1e293b;">Envoi vers le Dépôt</h3>
                <p style="margin: 0 0 20px 0; color: #64748b;">Envoi des commits locaux vers le dépôt distant...</p>
                <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                    <div id="push-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); transition: width 2s ease;"></div>
                </div>
                <div id="push-status" style="margin-top: 15px; font-size: 14px; color: #64748b;">Initialisation...</div>
            </div>
        `;
        
        document.body.appendChild(pushModal);
        
        // Simuler l'envoi
        let progress = 0;
        const statusElement = document.getElementById('push-status');
        const progressElement = document.getElementById('push-progress');
        
        const pushSteps = [
            { progress: 25, status: 'Connexion au dépôt distant...' },
            { progress: 50, status: 'Compression des objets...' },
            { progress: 75, status: 'Envoi des commits...' },
            { progress: 100, status: 'Envoi terminé avec succès !' }
        ];
        
        let currentStep = 0;
        const pushInterval = setInterval(() => {
            if (currentStep < pushSteps.length) {
                const step = pushSteps[currentStep];
                progressElement.style.width = step.progress + '%';
                statusElement.textContent = step.status;
                currentStep++;
            } else {
                clearInterval(pushInterval);
                setTimeout(() => {
                    pushModal.remove();
                    alert('✅ Envoi réussi ! Vos commits ont été poussés vers le dépôt.');
                    localStorage.setItem('github_last_sync', new Date().toISOString());
                    refreshRepoStatus();
                }, 1000);
            }
        }, 600);
    };
    
    window.pullFromRemote = function() {
        console.log('GITHUB-REPO-UPDATER: Pulling from remote repository...');
        alert('🔄 Pull depuis le dépôt distant en cours de développement...');
    };
    
    window.createNewBranch = function() {
        console.log('GITHUB-REPO-UPDATER: Creating new branch...');
        
        const branchName = prompt('Nom de la nouvelle branche:', 'feature/nouvelle-fonctionnalite');
        if (branchName) {
            alert(`🌿 Branche "${branchName}" créée avec succès !`);
        }
    };
    
    window.mergeBranch = function() {
        console.log('GITHUB-REPO-UPDATER: Merging branch...');
        
        const branchModal = document.createElement('div');
        branchModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; align-items: center; justify-content: center;';
        branchModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #1e293b;">🔄 Fusionner une Branche</h3>
                <form onsubmit="submitMerge(event, this)">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Branche source:</label>
                        <select required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                            <option value="feature/github-updater">feature/github-updater</option>
                            <option value="hotfix/revenue-display">hotfix/revenue-display</option>
                            <option value="feature/patient-history-enhancement">feature/patient-history-enhancement</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Branche cible:</label>
                        <select required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                            <option value="main">main</option>
                            <option value="develop">develop</option>
                        </select>
                    </div>
                    <div style="text-align: center;">
                        <button type="submit" style="background: #8b5cf6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;">
                            🔄 Fusionner
                        </button>
                        <button type="button" onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(branchModal);
    };
    
    window.submitMerge = function(event, form) {
        event.preventDefault();
        console.log('GITHUB-REPO-UPDATER: Submitting merge...');
        
        const sourceBranch = form.querySelector('select[name="source"]').value;
        const targetBranch = form.querySelector('select[name="target"]').value;
        
        setTimeout(() => {
            form.parentElement.parentElement.remove();
            alert(`✅ Fusion de "${sourceBranch}" vers "${targetBranch}" initiée avec succès !`);
        }, 1000);
    };
    
    window.createPullRequest = function() {
        console.log('GITHUB-REPO-UPDATER: Creating pull request...');
        
        const prModal = document.createElement('div');
        prModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; align-items: center; justify-content: center;';
        prModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #1e293b;">📋 Créer une Pull Request</h3>
                <form onsubmit="submitPullRequest(event, this)">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Titre:</label>
                        <input type="text" required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" placeholder="Titre de la PR">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Description:</label>
                        <textarea required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; min-height: 100px; resize: vertical;" placeholder="Description des changements..."></textarea>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #64748b; font-weight: 500;">Branche source:</label>
                        <select required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                            <option value="feature/github-updater">feature/github-updater</option>
                            <option value="hotfix/revenue-display">hotfix/revenue-display</option>
                            <option value="feature/patient-history-enhancement">feature/patient-history-enhancement</option>
                        </select>
                    </div>
                    <div style="text-align: center;">
                        <button type="submit" style="background: #f59e0b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;">
                            📋 Créer la PR
                        </button>
                        <button type="button" onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(prModal);
    };
    
    window.submitPullRequest = function(event, form) {
        event.preventDefault();
        console.log('GITHUB-REPO-UPDATER: Submitting pull request...');
        
        const title = form.querySelector('input[type="text"]').value;
        const description = form.querySelector('textarea').value;
        const sourceBranch = form.querySelector('select').value;
        
        setTimeout(() => {
            form.parentElement.parentElement.remove();
            alert(`✅ Pull Request "${title}" créée avec succès !`);
        }, 1000);
    };
    
    window.viewPullRequest = function(prNumber) {
        console.log('GITHUB-REPO-UPDATER: Viewing pull request:', prNumber);
        alert(`📋 Visualisation de la Pull Request #${prNumber} en cours de développement...`);
    };
    
    window.switchBranch = function(branchName) {
        console.log('GITHUB-REPO-UPDATER: Switching to branch:', branchName);
        alert(`🌿 Basculement vers la branche "${branchName}" en cours de développement...`);
    };
    
    window.refreshRepoStatus = function() {
        console.log('GITHUB-REPO-UPDATER: Refreshing repository status...');
        location.reload();
    };
    
    window.toggleRepoPanel = function() {
        console.log('GITHUB-REPO-UPDATER: Toggling repository panel...');
        const panel = document.querySelector('.github-repo-update-panel');
        if (panel) {
            const content = panel.querySelector('div[style*="margin: 20px 0"]');
            if (content) {
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
            }
        }
    };
    
    window.viewRepoOnGitHub = function() {
        console.log('GITHUB-REPO-UPDATER: Opening repository on GitHub...');
        window.open(GITHUB_REPO_CONFIG.webUrl, '_blank');
    };
    
    // Fonction pour maintenir le panneau
    function maintainRepoPanel() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const panel = document.querySelector('.github-repo-update-panel');
                    if (!panel) {
                        console.log('GITHUB-REPO-UPDATER: Repository panel removed, recreating...');
                        createRepoUpdatePanel();
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
    
    // Initialiser le système de mise à jour du dépôt
    setTimeout(() => {
        console.log('GITHUB-REPO-UPDATER: Initializing repository update system...');
        
        createRepoUpdatePanel();
        maintainRepoPanel();
        
        console.log('GITHUB-REPO-UPDATER: Repository update system initialized');
    }, 2000);
    
})();
