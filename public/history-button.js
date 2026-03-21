// Bouton d'accès à l'historique des consultations
(function() {
    'use strict';
    
    console.log('HISTORY-BUTTON: Creating button to access consultation history...');
    
    // Fonction pour créer le bouton d'accès à l'historique
    function createHistoryButton() {
        setTimeout(() => {
            // Chercher la barre de navigation ou le menu principal
            const navElements = [
                'nav',
                '.nav',
                '.navigation',
                '.menu',
                '.sidebar',
                '.side-nav',
                'header',
                '.header',
                '.top-bar'
            ];
            
            let navContainer = null;
            for (const selector of navElements) {
                navContainer = document.querySelector(selector);
                if (navContainer) {
                    console.log('HISTORY-BUTTON: Found navigation container:', selector);
                    break;
                }
            }
            
            // Si pas de navigation trouvée, chercher le root pour ajouter le bouton
            if (!navContainer) {
                const root = document.getElementById('root');
                if (root) {
                    console.log('HISTORY-BUTTON: Using root container for button');
                    navContainer = root;
                }
            }
            
            if (!navContainer) {
                console.log('HISTORY-BUTTON: No container found, retrying...');
                setTimeout(createHistoryButton, 2000);
                return;
            }
            
            // Vérifier si le bouton existe déjà
            if (navContainer.querySelector('.history-button')) {
                console.log('HISTORY-BUTTON: History button already exists');
                return;
            }
            
            // Créer le bouton d'accès à l'historique
            const historyButton = document.createElement('button');
            historyButton.className = 'history-button';
            historyButton.innerHTML = '📚 Historique des Consultations';
            historyButton.style.cssText = `
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                margin: 10px;
                box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
                position: relative;
                z-index: 1000;
            `;
            
            // Effet hover
            historyButton.onmouseover = function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 12px rgba(59, 130, 246, 0.4)';
            };
            
            historyButton.onmouseout = function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
            };
            
            // Action du bouton
            historyButton.onclick = function() {
                console.log('HISTORY-BUTTON: Navigating to consultation history...');
                window.location.hash = '#/history';
                window.location.reload();
            };
            
            // Ajouter le bouton au conteneur
            navContainer.appendChild(historyButton);
            
            console.log('HISTORY-BUTTON: History button created successfully');
            
        }, 3000);
    }
    
    // Créer également un bouton flottant si le bouton principal n'est pas visible
    function createFloatingHistoryButton() {
        setTimeout(() => {
            // Vérifier si le bouton principal existe
            const mainButton = document.querySelector('.history-button');
            if (mainButton) {
                console.log('HISTORY-BUTTON: Main button exists, skipping floating button');
                return;
            }
            
            // Créer un bouton flottant
            const floatingButton = document.createElement('button');
            floatingButton.className = 'floating-history-button';
            floatingButton.innerHTML = '📚';
            floatingButton.title = 'Historique des Consultations';
            floatingButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border: none;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 24px;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                transition: all 0.3s ease;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            // Effet hover
            floatingButton.onmouseover = function() {
                this.style.transform = 'scale(1.1)';
                this.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
            };
            
            floatingButton.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            };
            
            // Action du bouton
            floatingButton.onclick = function() {
                console.log('HISTORY-BUTTON: Floating button - Navigating to consultation history...');
                window.location.hash = '#/history';
                window.location.reload();
            };
            
            // Ajouter le bouton flottant au body
            document.body.appendChild(floatingButton);
            
            console.log('HISTORY-BUTTON: Floating history button created');
            
        }, 5000);
    }
    
    // Créer également un lien dans le menu latéral s'il existe
    function createSidebarHistoryLink() {
        setTimeout(() => {
            // Chercher le menu latéral
            const sidebar = document.querySelector('aside, .sidebar, .side-nav, [class*="sidebar"], [class*="menu"]');
            if (!sidebar) {
                console.log('HISTORY-BUTTON: No sidebar found');
                return;
            }
            
            // Vérifier si le lien existe déjà
            if (sidebar.querySelector('.sidebar-history-link')) {
                console.log('HISTORY-BUTTON: Sidebar history link already exists');
                return;
            }
            
            // Créer le lien dans le menu latéral
            const historyLink = document.createElement('a');
            historyLink.className = 'sidebar-history-link';
            historyLink.innerHTML = '📚 Historique';
            historyLink.href = '#/history';
            historyLink.style.cssText = `
                display: block;
                margin: 5px 0;
                padding: 12px 15px;
                background: rgba(59, 130, 246, 0.1);
                border-radius: 5px;
                cursor: pointer;
                text-decoration: none;
                color: #1e293b;
                border-left: 3px solid #3b82f6;
                font-weight: 500;
                transition: all 0.3s ease;
            `;
            
            // Effet hover
            historyLink.onmouseover = function() {
                this.style.background = 'rgba(59, 130, 246, 0.2)';
                this.style.color = '#1e40af';
            };
            
            historyLink.onmouseout = function() {
                this.style.background = 'rgba(59, 130, 246, 0.1)';
                this.style.color = '#1e293b';
            };
            
            // Action du lien
            historyLink.onclick = function(e) {
                e.preventDefault();
                console.log('HISTORY-BUTTON: Sidebar link - Navigating to consultation history...');
                window.location.hash = '#/history';
                window.location.reload();
            };
            
            // Ajouter le lien au menu latéral
            sidebar.appendChild(historyLink);
            
            console.log('HISTORY-BUTTON: Sidebar history link created');
            
        }, 4000);
    }
    
    // Lancer toutes les créations de boutons
    setTimeout(() => {
        createHistoryButton();
        createFloatingHistoryButton();
        createSidebarHistoryLink();
    }, 2000);
    
    // Surveiller périodiquement pour s'assurer que les boutons sont toujours présents
    setInterval(() => {
        const mainButton = document.querySelector('.history-button');
        const floatingButton = document.querySelector('.floating-history-button');
        const sidebarLink = document.querySelector('.sidebar-history-link');
        
        if (!mainButton && !floatingButton && !sidebarLink) {
            console.log('HISTORY-BUTTON: No history buttons found, recreating...');
            createHistoryButton();
            createFloatingHistoryButton();
            createSidebarHistoryLink();
        }
    }, 10000);
    
    console.log('HISTORY-BUTTON: Ready to create history access buttons');
})();
