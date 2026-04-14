// Serveur API simplifié pour Hostinger
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise';

// Middleware
app.use(cors({
  origin: ['https://sante.quantum221.com', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Utilisateur admin par défaut (en production)
const adminUser = {
  id: 'admin-001',
  name: 'Administrateur O\'CLIC SANTE',
  email: 'admin@sante.quantum221.com',
  role: 'SUPER_ADMIN',
  password: '$2a$10$rOzJqQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ' // admin123
};

// Routes API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'O\'CLIC SANTE API - Hostinger',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Route de login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Tentative de login:', { email, timestamp: new Date().toISOString() });

    // Vérifier les identifiants
    if (email === adminUser.email) {
      const isValidPassword = await bcrypt.compare(password, adminUser.password);
      
      if (isValidPassword) {
        const token = jwt.sign(
          { 
            id: adminUser.id, 
            email: adminUser.email, 
            role: adminUser.role,
            name: adminUser.name 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        console.log('Login réussi pour:', email);

        return res.json({
          success: true,
          message: 'Connexion réussie',
          token,
          user: {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role
          }
        });
      }
    }

    console.log('Login échoué pour:', email);
    return res.status(401).json({
      success: false,
      message: 'Email ou mot de passe incorrect'
    });

  } catch (error) {
    console.error('Erreur login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
});

// Route de vérification du token
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false, message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, message: 'Token invalide' });
  }
});

// Routes de données factices pour les tests
app.get('/api/tickets', (req, res) => {
  res.json({
    tickets: [
      {
        id: 'ticket-001',
        patientName: 'Patient Test',
        patientAge: 35,
        patientGender: 'M',
        serviceName: 'Consultation générale',
        status: 'WAITING',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/services', (req, res) => {
  res.json({
    services: [
      {
        id: 'service-001',
        name: 'Consultation générale',
        category: 'Consultation',
        price: 5000,
        isActive: true
      }
    ]
  });
});

app.get('/api/medicines', (req, res) => {
  res.json({
    medicines: [
      {
        id: 'med-001',
        name: 'Paracétamol 500mg',
        dci: 'Paracétamol',
        stock: 100,
        price: 500,
        category: 'Antalgique'
      }
    ]
  });
});

// Route 404
app.use('*', (req, res) => {
  console.log('Route non trouvée:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /api/health',
      'POST /api/login',
      'GET /api/auth/verify',
      'GET /api/tickets',
      'GET /api/services',
      'GET /api/medicines'
    ]
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur O'CLIC SANTE démarré sur le port ${PORT}`);
  console.log(`🌐 URL: https://sante.quantum221.com/api`);
  console.log(`🏥 Environnement: ${process.env.NODE_ENV || 'production'}`);
  console.log(`📋 Routes disponibles:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/login`);
  console.log(`   GET  /api/auth/verify`);
  console.log(`   GET  /api/tickets`);
  console.log(`   GET  /api/services`);
  console.log(`   GET  /api/medicines`);
});

export default app;
