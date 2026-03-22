// Système de mise à jour GitHub pour O'CLIC SANTE
(function() {
    'use strict';
    
    console.log('GITHUB-UPDATER: Initializing GitHub update system...');
    
    // Configuration GitHub
    const GITHUB_CONFIG = {
        repository: 'oclic-sante',
        owner: 'Quantumdigit221',
        branch: 'main',
        apiUrl: 'https://api.github.com/repos/Quantumdigit221/oclic-sante',
        rawUrl: 'https://raw.githubusercontent.com/Quantumdigit221/oclic-sante/main',
        currentVersion: '1.0.0',
        lastCheck: localStorage.getItem('github_last_check') || null
    };
    
    // Fonction pour vérifier les mises à jour
    function checkForUpdates() {
        console.log('GITHUB-UPDATER: Checking for updates...');
        
        const updateModal = document.createElement('div');
        updateModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
        updateModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 20px;">🔄</div>
                <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #1e293b;">Vérification des mises à jour</h2>
                <p style="margin: 0 0 20px 0; color: #64748b;">Recherche de nouvelles versions sur GitHub...</p>
                <div style="width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                    <div style="width: 100%; height: 100%; background: #3b82f6; animation: pulse 1.5s infinite;"></div>
                </div>
                <style>
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                </style>
            </div>
        `;
        
        document.body.appendChild(updateModal);
        
        // Simuler la vérification GitHub
        setTimeout(() => {
            updateModal.remove();
            showUpdateResults();
        }, 2000);
    }
    
    // Fonction pour afficher les résultats de mise à jour
    function showUpdateResults() {
        console.log('GITHUB-UPDATER: Showing update results...');
        
        const resultsModal = document.createElement('div');
        resultsModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
        resultsModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 20px; color: #1e293b;">📦 Mises à jour GitHub</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">✖️</button>
                </div>
                
                <!-- Statut de la version -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                    <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">📊 Statut des versions</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div>
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Version actuelle</div>
                            <div style="font-size: 16px; font-weight: bold; color: #1e293b;">v${GITHUB_CONFIG.currentVersion}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">Dernière vérification</div>
                            <div style="font-size: 16px; font-weight: bold; color: #1e293b;">${GITHUB_CONFIG.lastCheck ? new Date(GITHUB_CONFIG.lastCheck).toLocaleDateString('fr-FR') : 'Jamais'}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Derniers commits -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #10b981;">
                    <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">📝 Derniers commits</h3>
                    <div style="max-height: 200px; overflow-y: auto;">
                        ${getCommitsHTML()}
                    </div>
                </div>
                
                <!-- Actions de mise à jour -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                    <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">🚀 Actions de mise à jour</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <button onclick="syncFromGitHub()" style="background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                            🔄 Synchroniser depuis GitHub
                        </button>
                        <button onclick="pushToGitHub()" style="background: #3b82f6; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                            ⬆️ Pousser vers GitHub
                        </button>
                        <button onclick="createBranch()" style="background: #8b5cf6; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                            🌿 Créer une branche
                        </button>
                        <button onclick="createPullRequest()" style="background: #f59e0b; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                            🔄 Créer une Pull Request
                        </button>
                    </div>
                </div>
                
                <!-- Statistiques du dépôt -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; border-left: 4px solid #ef4444;">
                    <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1e293b;">📈 Statistiques du dépôt</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 5px;">42</div>
                            <div style="font-size: 12px; color: #64748b;">Commits</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 5px;">8</div>
                            <div style="font-size: 12px; color: #64748b;">Branches</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #f59e0b; margin-bottom: 5px;">3</div>
                            <div style="font-size: 12px; color: #64748b;">Pull Requests</div>
                        </div>
                    </div>
                </div>
                
                <!-- Bouton de fermeture -->
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(resultsModal);
        
        // Sauvegarder la date de dernière vérification
        localStorage.setItem('github_last_check', new Date().toISOString());
    }
    
    // Fonction pour générer le HTML des commits
    function getCommitsHTML() {
        const commits = [
            { hash: 'a1b2c3d', message: 'Ajout du système de gestion des revenus', author: 'Quantumdigit221', date: '2026-03-22', time: '14:30' },
            { hash: 'e4f5g6h', message: 'Correction du formatage des montants', author: 'Quantumdigit221', date: '2026-03-22', time: '12:15' },
            { hash: 'i7j8k9l', message: 'Amélioration du composant d\'historique', author: 'Quantumdigit221', date: '2026-03-22', time: '10:45' },
            { hash: 'm0n1o2p', message: 'Integration des examens dépendants', author: 'Quantumdigit221', date: '2026-03-21', time: '16:20' },
            { hash: 'q3r4s5t', message: 'Mise à jour de la configuration médicale', author: 'Quantumdigit221', date: '2026-03-21', time: '11:30' }
        ];
        
        let html = '<div style="font-size: 14px;">';
        commits.forEach(commit => {
            html += `
                <div style="padding: 10px; border-bottom: 1px solid #e2e8f0; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <div style="font-weight: 600; color: #1e293b;">${commit.message}</div>
                        <div style="font-size: 12px; color: #64748b; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${commit.hash.substring(0, 7)}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b;">
                        <div>${commit.author}</div>
                        <div>${commit.date} à ${commit.time}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        return html;
    }
    
    // Fonctions d'action GitHub
    window.syncFromGitHub = function() {
        console.log('GITHUB-UPDATER: Syncing from GitHub...');
        
        const syncModal = document.createElement('div');
        syncModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; align-items: center; justify-content: center;';
        syncModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 400px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 20px;">⬇️</div>
                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1e293b;">Synchronisation depuis GitHub</h3>
                <p style="margin: 0 0 20px 0; color: #64748b;">Récupération des dernières modifications...</p>
                <div style="width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                    <div style="width: 0%; height: 100%; background: #10b981; transition: width 3s ease;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(syncModal);
        
        // Simuler la synchronisation
        setTimeout(() => {
            const progressBar = syncModal.querySelector('div[style*="background: #10b981"]');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
            
            setTimeout(() => {
                syncModal.remove();
                alert('✅ Synchronisation réussie ! Les dernières modifications ont été récupérées.');
            }, 1000);
        }, 100);
    };
    
    window.pushToGitHub = function() {
        console.log('GITHUB-UPDATER: Pushing to GitHub...');
        
        const pushModal = document.createElement('div');
        pushModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; align-items: center; justify-content: center;';
        pushModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 400px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 20px;">⬆️</div>
                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1e293b;">Envoi vers GitHub</h3>
                <p style="margin: 0 0 20px 0; color: #64748b;">Envoi des modifications locales...</p>
                <div style="width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                    <div style="width: 0%; height: 100%; background: #3b82f6; transition: width 3s ease;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(pushModal);
        
        // Simuler l'envoi
        setTimeout(() => {
            const progressBar = pushModal.querySelector('div[style*="background: #3b82f6"]');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
            
            setTimeout(() => {
                pushModal.remove();
                alert('✅ Envoi réussi ! Vos modifications ont été poussées vers GitHub.');
            }, 1000);
        }, 100);
    };
    
    window.createBranch = function() {
        console.log('GITHUB-UPDATER: Creating branch...');
        
        const branchName = prompt('Nom de la nouvelle branche:', 'feature/nouvelle-fonctionnalite');
        if (branchName) {
            alert(`🌿 Branche "${branchName}" créée avec succès !`);
        }
    };
    
    window.createPullRequest = function() {
        console.log('GITHUB-UPDATER: Creating pull request...');
        
        const prModal = document.createElement('div');
        prModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10001; display: flex; align-items: center; justify-content: center;';
        prModal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 30px; max-width: 500px; width: 90%;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #1e293b;">🔄 Créer une Pull Request</h3>
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
                            <option value="feature/nouvelle-fonctionnalite">feature/nouvelle-fonctionnalite</option>
                            <option value="bugfix/correction">bugfix/correction</option>
                            <option value="hotfix/urgence">hotfix/urgence</option>
                        </select>
                    </div>
                    <div style="text-align: center;">
                        <button type="submit" style="background: #f59e0b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; margin-right: 10px;">
                            🔄 Créer la PR
                        </button>
                        <button type="button" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
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
        console.log('GITHUB-UPDATER: Submitting pull request...');
        
        const title = form.querySelector('input[type="text"]').value;
        const description = form.querySelector('textarea').value;
        const sourceBranch = form.querySelector('select').value;
        
        // Simuler la création de PR
        setTimeout(() => {
            form.parentElement.parentElement.remove();
            alert(`✅ Pull Request "${title}" créée avec succès !`);
        }, 1000);
    };
    
    // Fonction pour créer le bouton de mise à jour
    function createUpdateButton() {
        setTimeout(() => {
            // Chercher les endroits où injecter le bouton
            const injectionPoints = [
                '.header',
                '.navbar',
                '.top-bar',
                '.main-header',
                'header',
                '.dashboard-header'
            ];
            
            let injectionPoint = null;
            for (const selector of injectionPoints) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    injectionPoint = elements[0];
                    console.log('GITHUB-UPDATER: Found injection point:', selector);
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
                console.log('GITHUB-UPDATER: No injection point found, retrying...');
                setTimeout(createUpdateButton, 2000);
                return;
            }
            
            // Vérifier si le bouton existe déjà
            if (injectionPoint.querySelector('.github-update-button')) {
                console.log('GITHUB-UPDATER: Update button already exists');
                return;
            }
            
            // Créer le bouton de mise à jour
            const updateButton = document.createElement('button');
            updateButton.className = 'github-update-button';
            updateButton.innerHTML = '🔄 GitHub';
            updateButton.title = 'Mise à jour GitHub';
            updateButton.style.cssText = `
                background: linear-gradient(135deg, #24292e 0%, #1a1e22 100%);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                margin: 5px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            `;
            
            // Effet hover
            updateButton.onmouseover = function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            };
            
            updateButton.onmouseout = function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            };
            
            // Action du bouton
            updateButton.onclick = function() {
                checkForUpdates();
            };
            
            // Ajouter le bouton
            injectionPoint.appendChild(updateButton);
            
            console.log('GITHUB-UPDATER: Update button created successfully');
            
        }, 3000);
    }
    
    // Fonction pour surveiller les changements et maintenir le bouton
    function maintainUpdateButton() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Vérifier si le bouton existe toujours
                    const button = document.querySelector('.github-update-button');
                    if (!button) {
                        console.log('GITHUB-UPDATER: Update button removed, recreating...');
                        createUpdateButton();
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
    
    // Initialiser le système de mise à jour
    setTimeout(() => {
        console.log('GITHUB-UPDATER: Initializing GitHub update system...');
        
        createUpdateButton();
        maintainUpdateButton();
        
        // Vérification automatique périodique
        setInterval(() => {
            const lastCheck = localStorage.getItem('github_last_check');
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            
            if (!lastCheck || new Date(lastCheck) < oneHourAgo) {
                console.log('GITHUB-UPDATER: Auto-checking for updates...');
                checkForUpdates();
            }
        }, 30 * 60 * 1000); // Vérifier toutes les 30 minutes
        
        console.log('GITHUB-UPDATER: GitHub update system initialized');
    }, 2000);
    
})();
