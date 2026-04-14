// GitHub Auto Push System - Synchronisation automatique réelle (v2.9)
(function() {
    'use strict';
    
    console.log('GITHUB-AUTO-PUSH: Initializing REAL automatic GitHub push system...');
    
    // Configuration GitHub
    const GITHUB_AUTO_CONFIG = {
        repository: 'Quantumdigit221/oclic-sante',
        branch: 'main',
        apiUrl: 'https://api.github.com/repos/Quantumdigit221/oclic-sante',
        token: localStorage.getItem('github_token') || '',
        autoPush: true,
        commitMessage: '🚀 O\'CLIC SANTE v2.9 - Unified Core & Stability Fixes',
        filesToPush: [
            // Backend files
            'src/server.js',
            'src/database.js',
            'src/tickets-component.js',
            // Frontend modules
            'public/oclic-core-v2.9.js',
            'public/insurance-module.js',
            'public/insurance-nav-injector.js',
            'public/appointments-module.js',
            'public/appointments-nav-injector.js',
            'public/index.html',
            // Fixers & Systems
            'public/local-api-fixer.js',
            'public/github-sync-deploy.js'
        ]
    };
    
    // L'interface UI n'est plus nécessaire selon la demande de l'utilisateur
    // Les fonctions restent disponibles pour un usage programmatique si besoin
    
    async function executeAutoPush(token, commitMessage) {
        const showStatus = (msg) => {
            console.log('GITHUB-PUSH:', msg);
        };

        if (!token) {
            console.error('GITHUB-PUSH: Token requis');
            return;
        }
        
        showStatus('🚀 Démarrage de la synchronisation silencieuse...');

        let count = 0;
        for (const file of GITHUB_AUTO_CONFIG.filesToPush) {
            try {
                showStatus(`📤 Envoi : ${file}...`);
                const localResp = await fetch('/' + file);
                if (!localResp.ok) throw new Error('Fichier local introuvable');
                const text = await localResp.text();

                // Get SHA
                const ghUrl = `${GITHUB_AUTO_CONFIG.apiUrl}/contents/${file}?ref=${GITHUB_AUTO_CONFIG.branch}`;
                let sha = null;
                try {
                    const check = await fetch(ghUrl, { headers: { Authorization: `token ${token}` } });
                    if (check.ok) sha = (await check.json()).sha;
                } catch(e) {}

                // Push
                const put = await fetch(ghUrl, {
                    method: 'PUT',
                    headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: commitMessage,
                        content: btoa(unescape(encodeURIComponent(text))),
                        sha: sha,
                        branch: GITHUB_AUTO_CONFIG.branch
                    })
                });

                if (put.ok) {
                    count++;
                    showStatus(`✅ ${file} à jour.`);
                } else {
                    const err = await put.json();
                    showStatus(`❌ Erreur ${file}: ${err.message}`);
                }
            } catch (err) {
                showStatus(`❌ Erreur ${file}: ${err.message}`);
            }
        }
        showStatus(`✅ Fin de synchronisation. ${count}/${GITHUB_AUTO_CONFIG.filesToPush.length} fichiers traités.`);
    }

    // Export pour usage manuel via console si besoin
    window.triggerGithubSync = (token) => {
        const msg = GITHUB_AUTO_CONFIG.commitMessage + ' (Manual Sync)';
        executeAutoPush(token || GITHUB_AUTO_CONFIG.token, msg);
    };

    // La synchronisation automatique pourrait être déclenchée ici si un token est présent
    /*
    if (GITHUB_AUTO_CONFIG.token && GITHUB_AUTO_CONFIG.autoPush) {
        setTimeout(() => executeAutoPush(GITHUB_AUTO_CONFIG.token, GITHUB_AUTO_CONFIG.commitMessage), 5000);
    }
    */

})();
