// Serveur Monolithique O'CLIC SANTE - Version Corrigée
// Résolution du problème filter() avec validation stricte des tableaux
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

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Utilisateur admin par défaut
const adminUser = {
  id: 'admin-001',
  name: 'Administrateur O\'CLIC SANTE',
  email: 'admin@sante.quantum221.com',
  role: 'SUPER_ADMIN',
  password: '$2b$10$7sRMIAtKj3aW1Lr1O5sfJeQa1ArwGOJcBvcxeN/hrCCf09Ta2yI/C' // admin123
};

// Validation stricte des tableaux
const ensureArray = (data, defaultArray = []) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data === null || data === undefined) {
    return defaultArray;
  }
  console.warn(`⚠️ Conversion en tableau: ${typeof data} -> array`, data);
  return defaultArray;
};

// === API ROUTES ===

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'O\'CLIC SANTE API - Fixed Version',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    version: '2.1.0-fixed'
  });
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Tentative de login:', { email, timestamp: new Date().toISOString() });

    if (email === adminUser.email) {
      // Mode développement : accepter admin123 directement
      if (password === 'admin123' || await bcrypt.compare(password, adminUser.password)) {
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

// === DONNÉES VALIDÉES ===

// Données validées comme tableaux
const getTickets = () => ensureArray([
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
]);

const getServices = () => ensureArray([
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
]);

const getMedicines = () => ensureArray([
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
]);

const getPatients = () => ensureArray([
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
]);

const getConsultations = () => ensureArray([
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
]);

// === API ENDPOINTS VALIDÉS ===

app.get('/api/tickets', (req, res) => {
  const tickets = getTickets();
  console.log('GET /api/tickets - type:', typeof tickets, 'length:', tickets.length);
  res.json({ tickets: tickets });
});

app.get('/api/services', (req, res) => {
  const services = getServices();
  console.log('GET /api/services - type:', typeof services, 'length:', services.length);
  res.json({ services: services });
});

app.get('/api/medicines', (req, res) => {
  const medicines = getMedicines();
  console.log('GET /api/medicines - type:', typeof medicines, 'length:', medicines.length);
  res.json({ medicines: medicines });
});

app.get('/api/patients', (req, res) => {
  const patients = getPatients();
  console.log('GET /api/patients - type:', typeof patients, 'length:', patients.length);
  res.json({ patients: patients });
});

app.get('/api/consultations', (req, res) => {
  const consultations = getConsultations();
  console.log('GET /api/consultations - type:', typeof consultations, 'length:', consultations.length);
  res.json({ consultations: consultations });
});

// Route de test pour le débogage
app.get('/api/debug', (req, res) => {
  const debug = {
    tickets: {
      data: getTickets(),
      isArray: Array.isArray(getTickets()),
      length: getTickets().length
    },
    services: {
      data: getServices(),
      isArray: Array.isArray(getServices()),
      length: getServices().length
    },
    medicines: {
      data: getMedicines(),
      isArray: Array.isArray(getMedicines()),
      length: getMedicines().length
    },
    patients: {
      data: getPatients(),
      isArray: Array.isArray(getPatients()),
      length: getPatients().length
    },
    consultations: {
      data: getConsultations(),
      isArray: Array.isArray(getConsultations()),
      length: getConsultations().length
    }
  };
  res.json(debug);
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

// Gestion des erreurs 404 pour les API (route spécifique)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') && req.method === 'GET') {
    const availableRoutes = [
      '/api/health',
      '/api/login',
      '/api/auth/verify',
      '/api/tickets',
      '/api/services',
      '/api/medicines',
      '/api/patients',
      '/api/consultations',
      '/api/debug'
    ];
    
    if (!availableRoutes.includes(req.path)) {
      return res.status(404).json({
        error: 'Route API non trouvée',
        path: req.path,
        method: req.method,
        availableRoutes: availableRoutes
      });
    }
  }
  next();
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
  console.log(`🚀 Serveur O'CLIC SANTE Fixed Version démarré`);
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
  console.log(`   GET  /api/debug (nouveau)`);
  console.log(`🎨 Frontend servi sur: /`);
  console.log(`🔧 Version: 2.1.0-fixed - Problème filter() résolu`);
});

export default app;
