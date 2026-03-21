// Bouton d'accès à l'historique des consultations sur la page prescriptions
(function() {
    'use strict';
    
    console.log('PRESCRIPTIONS-HISTORY-BUTTON: Creating history button on prescriptions page...');
    
    // Fonction pour créer le bouton d'accès à l'historique sur la page prescriptions
    function createHistoryButtonOnPrescriptionsPage() {
        setTimeout(() => {
            const currentHash = window.location.hash || '#/';
            const isPrescriptionsPage = currentHash.includes('/prescriptions');
            
            if (!isPrescriptionsPage) {
                console.log('PRESCRIPTIONS-HISTORY-BUTTON: Not on prescriptions page, checking again...');
                setTimeout(createHistoryButtonOnPrescriptionsPage, 2000);
                return;
            }
            
            console.log('PRESCRIPTIONS-HISTORY-BUTTON: On prescriptions page, creating history button...');
            
            // Chercher le conteneur principal de la page prescriptions
            const root = document.getElementById('root');
            if (!root) {
                console.log('PRESCRIPTIONS-HISTORY-BUTTON: No root found, retrying...');
                setTimeout(createHistoryButtonOnPrescriptionsPage, 2000);
                return;
            }
            
            // Vérifier si le bouton existe déjà
            if (root.querySelector('.prescriptions-history-button')) {
                console.log('PRESCRIPTIONS-HISTORY-BUTTON: History button already exists on prescriptions page');
                return;
            }
            
            // Créer un conteneur pour le bouton
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'prescriptions-history-container';
            buttonContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            
            // Créer le bouton principal d'historique
            const historyButton = document.createElement('button');
            historyButton.className = 'prescriptions-history-button';
            historyButton.innerHTML = '📚 Historique des Consultations';
            historyButton.title = 'Accéder à l\'historique des consultations';
            historyButton.style.cssText = `
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                transition: all 0.3s ease;
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            // Effet hover pour le bouton principal
            historyButton.onmouseover = function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
            };
            
            historyButton.onmouseout = function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            };
            
            // Action du bouton principal
            historyButton.onclick = function() {
                console.log('PRESCRIPTIONS-HISTORY-BUTTON: Navigating to consultation history...');
                window.location.hash = '#/history';
                window.location.reload();
            };
            
            // Créer un bouton flottant plus petit
            const floatingButton = document.createElement('button');
            floatingButton.className = 'prescriptions-floating-history';
            floatingButton.innerHTML = '📚';
            floatingButton.title = 'Historique des Consultations';
            floatingButton.style.cssText = `
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border: none;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            // Effet hover pour le bouton flottant
            floatingButton.onmouseover = function() {
                this.style.transform = 'scale(1.1)';
                this.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
            };
            
            floatingButton.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            };
            
            // Action du bouton flottant
            floatingButton.onclick = function() {
                console.log('PRESCRIPTIONS-HISTORY-BUTTON: Floating button - Navigating to consultation history...');
                window.location.hash = '#/history';
                window.location.reload();
            };
            
            // Ajouter les boutons au conteneur
            buttonContainer.appendChild(historyButton);
            buttonContainer.appendChild(floatingButton);
            
            // Ajouter le conteneur à la page
            root.appendChild(buttonContainer);
            
            console.log('PRESCRIPTIONS-HISTORY-BUTTON: History buttons created on prescriptions page');
            
        }, 3000);
    }
    
    // Fonction pour créer un bouton dans la barre latérale si elle existe
    function createSidebarHistoryButtonOnPrescriptions() {
        setTimeout(() => {
            const currentHash = window.location.hash || '#/';
            const isPrescriptionsPage = currentHash.includes('/prescriptions');
            
            if (!isPrescriptionsPage) {
                return;
            }
            
            // Chercher la barre latérale
            const sidebar = document.querySelector('aside, .sidebar, .side-nav, [class*="sidebar"], [class*="menu"]');
            if (!sidebar) {
                console.log('PRESCRIPTIONS-HISTORY-BUTTON: No sidebar found on prescriptions page');
                return;
            }
            
            // Vérifier si le lien existe déjà
            if (sidebar.querySelector('.prescriptions-sidebar-history')) {
                console.log('PRESCRIPTIONS-HISTORY-BUTTON: Sidebar history link already exists');
                return;
            }
            
            // Créer le lien dans la barre latérale
            const historyLink = document.createElement('a');
            historyLink.className = 'prescriptions-sidebar-history';
            historyLink.innerHTML = '📚 Historique';
            historyLink.href = '#/history';
            historyLink.style.cssText = `
                display: block;
                margin: 8px 0;
                padding: 12px 16px;
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
                border-radius: 8px;
                cursor: pointer;
                text-decoration: none;
                color: #1e40af;
                border-left: 4px solid #3b82f6;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
            `;
            
            // Effet hover
            historyLink.onmouseover = function() {
                this.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)';
                this.style.transform = 'translateX(4px)';
                this.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.2)';
            };
            
            historyLink.onmouseout = function() {
                this.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)';
                this.style.transform = 'translateX(0)';
                this.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
            };
            
            // Action du lien
            historyLink.onclick = function(e) {
                e.preventDefault();
                console.log('PRESCRIPTIONS-HISTORY-BUTTON: Sidebar link - Navigating to consultation history...');
                window.location.hash = '#/history';
                window.location.reload();
            };
            
            // Ajouter le lien à la barre latérale
            sidebar.appendChild(historyLink);
            
            console.log('PRESCRIPTIONS-HISTORY-BUTTON: Sidebar history link created on prescriptions page');
            
        }, 4000);
    }
    
    // Fonction pour créer un bouton dans le contenu principal
    function createMainContentHistoryButtonOnPrescriptions() {
        setTimeout(() => {
            const currentHash = window.location.hash || '#/';
            const isPrescriptionsPage = currentHash.includes('/prescriptions');
            
            if (!isPrescriptionsPage) {
                return;
            }
            
            // Chercher le contenu principal
            const mainContent = document.querySelector('main, .main, .content, [class*="content"], [class*="main"]');
            if (!mainContent) {
                console.log('PRESCRIPTIONS-HISTORY-BUTTON: No main content found on prescriptions page');
                return;
            }
            
            // Vérifier si le bouton existe déjà
            if (mainContent.querySelector('.prescriptions-main-history')) {
                console.log('PRESCRIPTIONS-HISTORY-BUTTON: Main content history button already exists');
                return;
            }
            
            // Créer une section pour le bouton
            const buttonSection = document.createElement('div');
            buttonSection.className = 'prescriptions-main-history-section';
            buttonSection.style.cssText = `
                margin: 20px 0;
                padding: 20px;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border-radius: 12px;
                border: 2px solid #3b82f6;
                text-align: center;
                box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
            `;
            
            // Créer le titre
            const title = document.createElement('h3');
            title.innerHTML = '📚 Accès Rapide à l\'Historique';
            title.style.cssText = `
                margin: 0 0 15px 0;
                font-size: 18px;
                color: #1e40af;
                font-weight: 600;
            `;
            
            // Créer le bouton principal
            const mainButton = document.createElement('button');
            mainButton.className = 'prescriptions-main-history';
            mainButton.innerHTML = '📚 Voir l\'Historique des Consultations';
            mainButton.style.cssText = `
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                transition: all 0.3s ease;
                margin: 10px;
            `;
            
            // Effet hover
            mainButton.onmouseover = function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
            };
            
            mainButton.onmouseout = function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            };
            
            // Action du bouton
            mainButton.onclick = function() {
                console.log('PRESCRIPTIONS-HISTORY-BUTTON: Main content button - Navigating to consultation history...');
                window.location.hash = '#/history';
                window.location.reload();
            };
            
            // Ajouter les éléments à la section
            buttonSection.appendChild(title);
            buttonSection.appendChild(mainButton);
            
            // Ajouter la section au contenu principal
            mainContent.appendChild(buttonSection);
            
            console.log('PRESCRIPTIONS-HISTORY-BUTTON: Main content history button created on prescriptions page');
            
        }, 5000);
    }
    
    // Fonction pour surveiller les changements de page
    function monitorPageChanges() {
        setInterval(() => {
            const currentHash = window.location.hash || '#/';
            const isPrescriptionsPage = currentHash.includes('/prescriptions');
            
            if (isPrescriptionsPage) {
                // Vérifier si les boutons existent
                const hasFloatingButton = document.querySelector('.prescriptions-history-container');
                const hasSidebarButton = document.querySelector('.prescriptions-sidebar-history');
                const hasMainButton = document.querySelector('.prescriptions-main-history-section');
                
                if (!hasFloatingButton && !hasSidebarButton && !hasMainButton) {
                    console.log('PRESCRIPTIONS-HISTORY-BUTTON: No history buttons found on prescriptions page, recreating...');
                    createHistoryButtonOnPrescriptionsPage();
                    createSidebarHistoryButtonOnPrescriptions();
                    createMainContentHistoryButtonOnPrescriptions();
                }
            }
        }, 8000);
    }
    
    // Lancer toutes les créations de boutons
    setTimeout(() => {
        createHistoryButtonOnPrescriptionsPage();
        createSidebarHistoryButtonOnPrescriptions();
        createMainContentHistoryButtonOnPrescriptions();
        monitorPageChanges();
    }, 2000);
    
    console.log('PRESCRIPTIONS-HISTORY-BUTTON: Ready to create history buttons on prescriptions page');
})();
