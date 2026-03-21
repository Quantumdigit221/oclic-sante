// Point d'entrée pour Hostinger (Passenger)
console.log('🚀 Démarrage de l\'application O\'CLIC SANTE...');

process.on('uncaughtException', (err) => {
  console.error('FATAL ERROR (Uncaught Exception):', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL ERROR (Unhandled Rejection) at:', promise, 'reason:', reason);
});

import './src/server.js';
