// Serveur Monolithique O'CLIC SANTE - Version Simple et Fonctionnelle
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Données de démonstration
const tickets = [
  {
    id: 'ticket-001',
    ticketNumber: 'TKT-20240315-001',
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
    ticketNumber: 'TKT-20240315-002',
    patientName: 'Patiente Test',
    patientAge: 28,
    patientGender: 'F',
    serviceName: 'Consultation pédiatrique',
    status: 'IN_PROGRESS',
    amount: 6000,
    createdAt: new Date().toISOString()
  }
];

const services = [
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
];

const patients = [
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
];

const medicines = [
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
];

const consultations = [
  {
    id: 'consult-001',
    patientName: 'Jean Test',
    doctorName: 'Dr. Administrateur',
    serviceName: 'Consultation générale',
    date: new Date().toISOString(),
    symptoms: 'Mal de tête',
    diagnosis: 'Céphalée tensionnelle',
    prescription: 'Paracétamol 500mg',
    status: 'completed'
  }
];

// === API ROUTES ===

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'O\'CLIC SANTE API - Simple Version',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    version: '2.2.0-simple'
  });
});

// Login simplifié
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('=== DEBUG LOGIN ===');
    console.log('Reçu:', { email, password });
    console.log('Type email:', typeof email);
    console.log('Type password:', typeof password);
    console.log('Email attendu:', adminUser.email);
    console.log('Password attendu:', 'admin123');
    console.log('Email match:', email === adminUser.email);
    console.log('Password match:', password === 'admin123');

    if (email === adminUser.email && password === 'admin123') {
      const token = jwt.sign(
        { 
          id: 'admin-001', 
          email: email, 
          role: 'SUPER_ADMIN',
          name: 'Administrateur O\'CLIC SANTE'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login réussi pour:', email);
      console.log('Token généré:', token.substring(0, 50) + '...');

      return res.json({
        success: true,
        message: 'Connexion réussie',
        token,
        user: {
          id: 'admin-001',
          name: 'Administrateur O\'CLIC SANTE',
          email: email,
          role: 'SUPER_ADMIN'
        }
      });
    }

    console.log('Login échoué - email ou mot de passe incorrect');
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

// Routes de données
app.get('/api/tickets', (req, res) => {
  const { centerId } = req.query;
  console.log('GET /api/tickets - centerId:', centerId, 'returning', tickets.length, 'tickets');
  res.json({ tickets: tickets });
});

app.get('/api/services', (req, res) => {
  const { centerId } = req.query;
  console.log('GET /api/services - centerId:', centerId, 'returning', services.length, 'services');
  res.json({ services: services });
});

app.get('/api/medicines', (req, res) => {
  const { centerId } = req.query;
  console.log('GET /api/medicines - centerId:', centerId, 'returning', medicines.length, 'medicines');
  res.json({ medicines: medicines });
});

app.get('/api/patients', (req, res) => {
  const { centerId } = req.query;
  console.log('GET /api/patients - centerId:', centerId, 'returning', patients.length, 'patients');
  res.json({ patients: patients });
});

app.get('/api/consultations', (req, res) => {
  const { centerId } = req.query;
  console.log('GET /api/consultations - centerId:', centerId, 'returning', consultations.length, 'consultations');
  res.json({ consultations: consultations });
});

// Ajouter les endpoints manquants
app.get('/api/users', (req, res) => {
  const { centerId } = req.query;
  const users = [
    {
      id: 'user-001',
      name: 'Administrateur O\'CLIC SANTE',
      email: 'admin@sante.quantum221.com',
      role: 'SUPER_ADMIN'
    },
    {
      id: 'user-002',
      name: 'Dr. Marie Sarr',
      email: 'marie@sante.quantum221.com',
      role: 'DOCTOR'
    }
  ];
  console.log('GET /api/users - centerId:', centerId, 'returning', users.length, 'users');
  res.json({ users: users });
});

app.get('/api/lab-results', (req, res) => {
  const { centerId } = req.query;
  const labResults = [
    {
      id: 'lab-001',
      patientName: 'Jean Test',
      testName: 'Analyse sanguine',
      result: 'Normal',
      date: new Date().toISOString()
    }
  ];
  console.log('GET /api/lab-results - centerId:', centerId, 'returning', labResults.length, 'lab results');
  res.json({ labResults: labResults });
});

app.get('/api/sales', (req, res) => {
  const { centerId } = req.query;
  const sales = [
    {
      id: 'sale-001',
      ticketNumber: 'TKT-20240315-001',
      amount: 5000,
      paymentMethod: 'CASH',
      date: new Date().toISOString()
    }
  ];
  console.log('GET /api/sales - centerId:', centerId, 'returning', sales.length, 'sales');
  res.json({ sales: sales });
});

// === FRONTEND ROUTE ===

// Servir le frontend React pour les routes non-API
app.use((req, res, next) => {
  // Si c'est une route API, passer au prochain middleware
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Servir index.html pour les routes frontend (React Router)
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
  console.log(`🚀 Serveur O'CLIC SANTE Simple Version démarré`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🏥 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Routes API disponibles:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/login (admin@sante.quantum221.com / admin123)`);
  console.log(`   GET  /api/auth/verify`);
  console.log(`   GET  /api/tickets?centerId=center-1`);
  console.log(`   GET  /api/services?centerId=center-1`);
  console.log(`   GET  /api/medicines?centerId=center-1`);
  console.log(`   GET  /api/patients?centerId=center-1`);
  console.log(`   GET  /api/consultations?centerId=center-1`);
  console.log(`   GET  /api/users?centerId=center-1`);
  console.log(`   GET  /api/lab-results?centerId=center-1`);
  console.log(`   GET  /api/sales?centerId=center-1`);
  console.log(`🎨 Frontend servi sur: /`);
  console.log(`🔧 Version: 2.2.0-simple - Login fonctionnel + centerId support`);
});

export default app;
