// Configuration du serveur pour Hostinger
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env.production') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://sante.quantum221.com', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques si nécessaire
app.use(express.static(path.join(__dirname, '../public')));

// Routes API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'O\'CLIC SANTE API - Hostinger',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Importer les routes existantes
try {
  const authRoutes = await import('./routes/auth.js');
  const ticketRoutes = await import('./routes/tickets.js');
  const consultationRoutes = await import('./routes/consultations.js');
  const medicineRoutes = await import('./routes/medicines.js');
  const serviceRoutes = await import('./routes/services.js');
  const patientRoutes = await import('./routes/patients.js');
  
  app.use('/api/auth', authRoutes.default);
  app.use('/api/tickets', ticketRoutes.default);
  app.use('/api/consultations', consultationRoutes.default);
  app.use('/api/medicines', medicineRoutes.default);
  app.use('/api/services', serviceRoutes.default);
  app.use('/api/patients', patientRoutes.default);
} catch (error) {
  console.log('⚠️ Routes non trouvées, utilisation des routes de secours');
  
  // Routes de secours basiques
  app.get('/api/tickets', (req, res) => {
    res.json({ tickets: [] });
  });
  
  app.get('/api/medicines', (req, res) => {
    res.json({ medicines: [] });
  });
  
  app.get('/api/services', (req, res) => {
    res.json({ services: [] });
  });
}

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur O'CLIC SANTE démarré sur le port ${PORT}`);
  console.log(`🌐 URL: https://sante.quantum221.com/api`);
  console.log(`🏥 Environnement: ${process.env.NODE_ENV || 'production'}`);
});

export default app;
