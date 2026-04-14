// ============================================
// O'CLIC SANTE - Optimisations Mobile
// ============================================

(function() {
    'use strict';
    
    console.log('Mobile Optimizer: Initialisation...');
    
    // Détecter si on est sur mobile
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    // Variables globales
    let sidebarOpen = false;
    let touchStartY = 0;
    let touchEndY = 0;
    
    // Créer le menu hamburger si nécessaire
    function createMobileMenu() {
        if (!isMobile) return;
        
        // Vérifier si le bouton existe déjà
        if (document.querySelector('.mobile-menu-toggle')) return;
        
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-toggle';
        menuBtn.innerHTML = '☰';
        menuBtn.setAttribute('aria-label', 'Menu');
        
        // Insérer au début du body
        document.body.insertBefore(menuBtn, document.body.firstChild);
        
        // Gérer le clic
        menuBtn.addEventListener('click', toggleSidebar);
        
        console.log('Mobile Optimizer: Menu hamburger créé');
    }
    
    // Gérer l'ouverture/fermeture du sidebar
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar, .side-menu, .nav-sidebar');
        if (!sidebar) return;
        
        sidebarOpen = !sidebarOpen;
        
        if (sidebarOpen) {
            sidebar.classList.add('expanded');
            sidebar.classList.remove('collapsed');
            document.body.style.overflow = 'hidden'; // Empêcher le scroll
        } else {
            sidebar.classList.add('collapsed');
            sidebar.classList.remove('expanded');
            document.body.style.overflow = ''; // Réactiver le scroll
        }
        
        // Mettre à jour le bouton
        const menuBtn = document.querySelector('.mobile-menu-toggle');
        if (menuBtn) {
            menuBtn.innerHTML = sidebarOpen ? '✕' : '☰';
        }
    }
    
    // Fermer le sidebar quand on clique en dehors
    function handleOutsideClick(e) {
        if (!isMobile || !sidebarOpen) return;
        
        const sidebar = document.querySelector('.sidebar, .side-menu, .nav-sidebar');
        const menuBtn = document.querySelector('.mobile-menu-toggle');
        
        if (sidebar && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            toggleSidebar();
        }
    }
    
    // Optimiser les clics sur mobile
    function optimizeClicks() {
        // Ajouter des attributs pour améliorer l'expérience tactile
        const clickableElements = document.querySelectorAll('.btn, .card, .clickable, [onclick]');
        
        clickableElements.forEach(element => {
            // Augmenter la zone de clic
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.position === 'static') {
                element.style.position = 'relative';
            }
            
            // Ajouter un effet tactile
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
                this.style.transition = 'transform 0.1s';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    // Gérer le scroll pour les tableaux
    function optimizeTableScroll() {
        const tables = document.querySelectorAll('.table-container, .data-table');
        
        tables.forEach(table => {
            // Ajouter des indicateurs de scroll horizontal
            if (table.scrollWidth > table.clientWidth) {
                table.classList.add('scrollable-x');
                
                // Ajouter un indicateur visuel
                const indicator = document.createElement('div');
                indicator.className = 'scroll-indicator';
                indicator.innerHTML = '↔ Glisser pour voir plus';
                indicator.style.cssText = `
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 12px;
                    z-index: 10;
                `;
                
                table.style.position = 'relative';
                table.appendChild(indicator);
                
                // Cacher l'indicateur après le premier scroll
                table.addEventListener('scroll', function() {
                    if (this.scrollLeft > 50) {
                        indicator.style.display = 'none';
                    }
                });
            }
        });
    }
    
    // Optimiser les formulaires pour mobile
    function optimizeForms() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Empêcher le zoom sur les inputs
            input.style.fontSize = '16px';
            
            // Améliorer l'espacement
            input.style.margin = '8px 0';
            
            // Ajouter des types appropriés
            if (input.type === 'tel' && !input.getAttribute('inputmode')) {
                input.setAttribute('inputmode', 'tel');
            }
            if (input.type === 'email' && !input.getAttribute('inputmode')) {
                input.setAttribute('inputmode', 'email');
            }
            if (input.type === 'number' && !input.getAttribute('inputmode')) {
                input.setAttribute('inputmode', 'numeric');
            }
        });
    }
    
    // Gérer les gestes tactiles
    function handleTouchGestures() {
        let startY = 0;
        let startX = 0;
        
        document.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchmove', function(e) {
            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const diffY = startY - currentY;
            const diffX = startX - currentX;
            
            // Détecter le swipe horizontal pour les tableaux
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                const table = e.target.closest('.table-container, .data-table');
                if (table) {
                    e.preventDefault(); // Permettre le scroll horizontal
                }
            }
        });
    }
    
    // Adapter les grilles pour mobile
    function adaptGrids() {
        const grids = document.querySelectorAll('.grid, .dashboard-grid, .stats-grid');
        
        grids.forEach(grid => {
            if (isMobile) {
                grid.style.gridTemplateColumns = '1fr';
                grid.style.gap = '0.5rem';
            } else if (isTablet) {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            }
        });
    }
    
    // Optimiser les modales pour mobile
    function optimizeModals() {
        const modals = document.querySelectorAll('.modal, .dialog');
        
        modals.forEach(modal => {
            if (isMobile) {
                modal.style.width = '95%';
                modal.style.margin = '1rem';
                modal.style.maxHeight = '90vh';
                modal.style.overflowY = 'auto';
                
                // Centrer verticalement
                modal.style.position = 'fixed';
                modal.style.top = '50%';
                modal.style.left = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
            }
        });
    }
    
    // Fonction principale d'initialisation
    function initializeMobileOptimizations() {
        console.log(`Mobile Optimizer: Détection ${isMobile ? 'Mobile' : isTablet ? 'Tablette' : 'Desktop'}`);
        
        if (isMobile || isTablet) {
            createMobileMenu();
            optimizeClicks();
            optimizeTableScroll();
            optimizeForms();
            handleTouchGestures();
            adaptGrids();
            optimizeModals();
            
            // Écouteurs d'événements
            document.addEventListener('click', handleOutsideClick);
            
            // Observer les changements DOM pour les éléments dynamiques
            if (window.MutationObserver) {
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList') {
                            optimizeClicks();
                            optimizeTableScroll();
                            optimizeForms();
                            adaptGrids();
                            optimizeModals();
                        }
                    });
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
            
            // Gérer le redimensionnement
            window.addEventListener('resize', function() {
                setTimeout(function() {
                    adaptGrids();
                    optimizeModals();
                }, 100);
            });
        }
        
        console.log('Mobile Optimizer: Initialisation terminée');
    }
    
    // Démarrer l'initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMobileOptimizations);
    } else {
        initializeMobileOptimizations();
    }
    
    // Exposer quelques fonctions globalement pour debugging
    window.mobileOptimizer = {
        toggleSidebar: toggleSidebar,
        isMobile: isMobile,
        isTablet: isTablet
    };
    
})();
