// =============================================
// O'CLIC SANTE - Navigateur Rendez-vous (Hybrid Fix)
// Version 20260405 - Intercepteur de Routes React
// =============================================
(function () {
  'use strict';

  function attachHandlers() {
    // Cibler les liens vers les rendez-vous
    const apptLinks = document.querySelectorAll('a[href*="#/appointments"]');
    if (apptLinks.length === 0) {
      setTimeout(attachHandlers, 1000);
      return;
    }

    apptLinks.forEach(link => {
      if (link.dataset.apptIntercepted) return;
      link.dataset.apptIntercepted = 'true';
      
      link.addEventListener('click', (e) => {
        // Empêcher React Router de rediriger ou de faire clignoter le dashboard
        e.preventDefault();
        e.stopPropagation();
        
        const path = link.getAttribute('href').replace('#', '');
        window.location.hash = path;
        
        console.log("🛡️ [NAV] Interception RDV vers:", path);
      }, true);
    });
  }

  // Lancer l'observation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHandlers);
  } else {
    attachHandlers();
  }
  
  // Exécuter périodiquement car React reconstruit souvent la barre latérale
  setInterval(attachHandlers, 2000);
})();
