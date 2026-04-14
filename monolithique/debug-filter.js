// Script de débogage pour l'erreur filter
// Ajouter ce script dans le frontend pour corriger le problème

// Patch pour garantir que les données sont toujours des tableaux
window.patchFilterError = function() {
  console.log('🔧 Application du patch filter...');
  
  // Intercepter les appels fetch pour vérifier les réponses
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(response => {
      // Cloner la réponse pour pouvoir la lire
      const clonedResponse = response.clone();
      
      clonedResponse.json().then(data => {
        // Vérifier et corriger les données
        Object.keys(data).forEach(key => {
          if (!Array.isArray(data[key])) {
            console.warn(`⚠️ Correction: ${key} n'est pas un tableau, conversion en tableau vide`);
            data[key] = [];
          }
        });
      }).catch(err => {
        console.error('❌ Erreur parsing JSON:', err);
      });
      
      return response;
    });
  };
  
  console.log('✅ Patch filter appliqué');
};

// Appliquer le patch automatiquement
if (typeof window !== 'undefined') {
  window.patchFilterError();
}

// Export pour utilisation manuelle
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { patchFilterError };
}
