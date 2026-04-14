// Serveur Monolithique O'CLIC SANTE
// Frontend + Backend dans une seule application
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'o_clic_sante_jwt_secret_very_long_and_secure_2024';

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sante.quantum221.com'] 
    : ['http://localhost:3000', 'http://localhost:3004'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../public')));

// Utilisateur admin par défaut
const adminUser = {
  id: 'admin-001',
  name: 'Administrateur O\'CLIC SANTE',
  email: 'admin@sante.quantum221.com',
  role: 'SUPER_ADMIN',
  password: '$2a$10$rOzJqQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ' // admin123
};

// === API ROUTES ===

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'O\'CLIC SANTE API - Monolithique',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Tentative de login:', { email, timestamp: new Date().toISOString() });

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

// Vérification token
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

// Routes de données démo
app.get('/api/tickets', (req, res) => {
  res.json({
    tickets: [
      {
        id: 'ticket-001',
        ticketNumber: 'CS-20240314-001',
        patientName: 'Patient Test',
        patientAge: 35,
        patientGender: 'M',
        serviceName: 'Consultation générale',
        status: 'WAITING',
        amount: 5000,
        createdAt: new Date().toISOString()
      },
      {
        id: 'ticket-002',
        ticketNumber: 'CS-20240314-002',
        patientName: 'Patiente Test',
        patientAge: 28,
        patientGender: 'F',
        serviceName: 'Consultation pédiatrique',
        status: 'IN_PROGRESS',
        amount: 6000,
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
        emergencyPrice: 7500,
        isActive: true
      },
      {
        id: 'service-002',
        name: 'Consultation pédiatrique',
        category: 'Consultation',
        price: 6000,
        emergencyPrice: 9000,
        isActive: true
      },
      {
        id: 'service-003',
        name: 'Analyse sanguine',
        category: 'Laboratoire',
        price: 15000,
        emergencyPrice: 22500,
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
        minStock: 20,
        price: 500,
        category: 'Antalgique',
        expiryDate: '2025-12-31'
      },
      {
        id: 'med-002',
        name: 'Ibuprofène 400mg',
        dci: 'Ibuprofène',
        stock: 50,
        minStock: 15,
        price: 800,
        category: 'Anti-inflammatoire',
        expiryDate: '2025-12-31'
      }
    ]
  });
});

app.get('/api/patients', (req, res) => {
  res.json({
    patients: [
      {
        id: 'patient-001',
        code: 'P-2024-001',
        firstName: 'Jean',
        lastName: 'Test',
        age: 35,
        gender: 'M',
        phone: '+221 77 123 45 67',
        address: 'Dakar, Sénégal',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/consultations', (req, res) => {
  res.json({
    consultations: [
      {
        id: 'consult-001',
        patientName: 'Jean Test',
        doctorName: 'Dr. Administrateur',
        serviceName: 'Consultation générale',
        date: new Date().toISOString(),
        symptoms: 'Mal de tête',
        diagnosis: 'Céphalée tensionnelle',
        prescription: 'Paracétamol 500mg, 1 comprimé toutes les 6 heures',
        status: 'completed'
      }
    ]
  });
});

// === FRONTEND ROUTE ===

// Servir le frontend React pour toutes les autres routes (SPA)
app.get('*', (req, res) => {
  // Ne pas servir pour les routes API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Route API non trouvée',
      path: req.path,
      availableRoutes: [
        'GET /api/health',
        'POST /api/login',
        'GET /api/auth/verify',
        'GET /api/tickets',
        'GET /api/services',
        'GET /api/medicines',
        'GET /api/patients',
        'GET /api/consultations'
      ]
    });
  }
  
  // Servir index.html pour toutes les autres routes (React Router)
  res.sendFile(path.join(__dirname, '../public/index.html'));
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
  console.log(`🚀 Serveur O'CLIC SANTE Monolithique démarré`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🏥 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Routes API disponibles:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/login`);
  console.log(`   GET  /api/auth/verify`);
  console.log(`   GET  /api/tickets`);
  console.log(`   GET  /api/services`);
  console.log(`   GET  /api/medicines`);
  console.log(`   GET  /api/patients`);
  console.log(`   GET  /api/consultations`);
  console.log(`🎨 Frontend servi sur: /`);
});

export default app;
