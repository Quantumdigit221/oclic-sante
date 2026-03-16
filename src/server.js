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
app.use(express.static(path.join(__dirname, '../public'), {
  // Support du routing hash-based pour React Router
  index: 'index.html',
  // Pour le développement, on peut désactiver le cache
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      // Empêcher la mise en cache des fichiers HTML pour le développement
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Utilisateur admin par défaut
const adminUser = {
  id: 'admin-001',
  name: 'Administrateur O\'CLIC SANTE',
  email: 'admin@sante.quantum221.com',
  role: 'SUPER_ADMIN',
  password: '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO' // admin123
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
app.get('/api/services', (req, res) => {
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
  console.log('GET /api/services - services:', services, 'type:', typeof services);
  res.json({ services: services });
});

app.get('/api/medicines', (req, res) => {
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
  console.log('GET /api/medicines - medicines:', medicines, 'type:', typeof medicines);
  res.json({ medicines: medicines });
});

app.get('/api/patients', (req, res) => {
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
  console.log('GET /api/patients - patients:', patients, 'type:', typeof patients);
  res.json({ patients: patients });
});

app.get('/api/consultations', (req, res) => {
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
  console.log('GET /api/consultations - consultations:', consultations, 'type:', typeof consultations);
  res.json({ consultations: consultations });
});

// Center API (single center)
app.get('/api/center', (req, res) => {
  const center = {
    id: 'center-001',
    name: 'Centre Médical Dakar',
    address: 'Plateau, Dakar, Sénégal',
    phone: '+221 33 123 45 67',
    email: 'contact@dakar-medical.sn',
    directorName: 'Dr. Marie Sarr',
    rnis: 'RNIS-001-DK',
    capacity: 50,
    pispiAlias: 'DAKAR_MEDICAL_01',
    isActive: true,
    createdAt: new Date().toISOString()
  };
  console.log('GET /api/center - center:', center);
  res.json(center);
});

// Centers API
app.get('/api/centers', (req, res) => {
  const centers = [
    {
      id: 'center-001',
      name: 'Centre Médical Dakar',
      address: 'Plateau, Dakar, Sénégal',
      phone: '+221 33 123 45 67',
      email: 'contact@dakar-medical.sn',
      directorName: 'Dr. Marie Sarr',
      rnis: 'RNIS-001-DK',
      capacity: 50,
      pispiAlias: 'DAKAR_MEDICAL_01',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'center-002',
      name: 'Clinique Saint-Louis',
      address: 'Saint-Louis, Sénégal',
      phone: '+221 33 987 65 43',
      email: 'info@clinique-stlouis.sn',
      directorName: 'Dr. Amadou Bâ',
      rnis: 'RNIS-002-SL',
      capacity: 30,
      pispiAlias: 'STLOUIS_CLINIC_01',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'center-003',
      name: 'Hôpital Régional de Thiès',
      address: 'Thiès, Sénégal',
      phone: '+221 33 456 78 90',
      email: 'contact@hopital-thies.sn',
      directorName: 'Dr. Fatou Ndiaye',
      rnis: 'RNIS-003-TH',
      capacity: 75,
      pispiAlias: 'THIES_HOSPITAL_01',
      isActive: false,
      createdAt: new Date().toISOString()
    }
  ];
  console.log('GET /api/centers - centers:', centers, 'type:', typeof centers);
  res.json(centers);
});

// Users API
app.get('/api/users', (req, res) => {
  const users = [
    {
      id: 'user-001',
      name: 'Dr. Marie Sarr',
      email: 'marie.sarr@sante.sn',
      role: 'ADMIN',
      centerId: 'center-001',
      phone: '+221 77 111 22 33',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-002',
      name: 'Dr. Amadou Bâ',
      email: 'amadou.ba@sante.sn',
      role: 'ADMIN',
      centerId: 'center-002',
      phone: '+221 77 444 55 66',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];
  console.log('GET /api/users - users:', users, 'type:', typeof users);
  res.json(users);
});

// Tickets API
app.get('/api/tickets', (req, res) => {
  const { centerId } = req.query;
  const tickets = [
    {
      id: 'ticket-001',
      ticketNumber: 'T-2024-001',
      patientName: 'Mamadou Diop',
      serviceName: 'Consultation générale',
      amount: 5000,
      status: 'PENDING',
      centerId: centerId || 'center-001',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ticket-002',
      ticketNumber: 'T-2024-002',
      patientName: 'Aissatou Sow',
      serviceName: 'Urgence',
      amount: 10000,
      status: 'IN_PROGRESS',
      centerId: centerId || 'center-001',
      createdAt: new Date().toISOString()
    }
  ];
  console.log('GET /api/tickets - tickets:', tickets, 'centerId:', centerId);
  res.json({ tickets: tickets });
});

// Lab Results API
app.get('/api/lab-results', (req, res) => {
  const { centerId } = req.query;
  const labResults = [
    {
      id: 'lab-001',
      testName: 'NFS (Hémogramme)',
      patientName: 'Mamadou Diop',
      result: 'Normal',
      centerId: centerId || 'center-001',
      createdAt: new Date().toISOString()
    }
  ];
  console.log('GET /api/lab-results - labResults:', labResults, 'centerId:', centerId);
  res.json({ labResults: labResults });
});

// Sales API
app.get('/api/sales', (req, res) => {
  const { centerId } = req.query;
  const sales = [
    {
      id: 'sale-001',
      medicineName: 'Paracétamol 500mg',
      quantity: 2,
      unitPrice: 500,
      total: 1000,
      patientName: 'Mamadou Diop',
      centerId: centerId || 'center-001',
      createdAt: new Date().toISOString()
    }
  ];
  console.log('GET /api/sales - sales:', sales, 'centerId:', centerId);
  res.json({ sales: sales });
});

// POST APIs pour la création
app.post('/api/tickets', (req, res) => {
  const ticketData = req.body;
  const newTicket = {
    id: `ticket-${Date.now()}`,
    ticketNumber: `T-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    ...ticketData,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  console.log('POST /api/tickets - newTicket:', newTicket);
  res.json({ success: true, ticket: newTicket });
});

app.post('/api/patients', (req, res) => {
  const patientData = req.body;
  const newPatient = {
    id: `patient-${Date.now()}`,
    code: `P-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    ...patientData,
    createdAt: new Date().toISOString()
  };
  console.log('POST /api/patients - newPatient:', newPatient);
  res.json({ success: true, patient: newPatient });
});

app.post('/api/services', (req, res) => {
  const serviceData = req.body;
  const newService = {
    id: `service-${Date.now()}`,
    ...serviceData,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  console.log('POST /api/services - newService:', newService);
  res.json({ success: true, service: newService });
});

app.post('/api/medicines', (req, res) => {
  const medicineData = req.body;
  const newMedicine = {
    id: `med-${Date.now()}`,
    ...medicineData,
    createdAt: new Date().toISOString()
  };
  console.log('POST /api/medicines - newMedicine:', newMedicine);
  res.json({ success: true, medicine: newMedicine });
});

app.post('/api/consultations', (req, res) => {
  const consultationData = req.body;
  const newConsultation = {
    id: `consult-${Date.now()}`,
    ...consultationData,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  console.log('POST /api/consultations - newConsultation:', newConsultation);
  res.json({ success: true, consultation: newConsultation });
});

app.post('/api/prescriptions', (req, res) => {
  const prescriptionData = req.body;
  const newPrescription = {
    id: `prescription-${Date.now()}`,
    ...prescriptionData,
    createdAt: new Date().toISOString()
  };
  console.log('POST /api/prescriptions - newPrescription:', newPrescription);
  res.json({ success: true, prescription: newPrescription });
});

app.post('/api/lab-results', (req, res) => {
  const labResultData = req.body;
  const newLabResult = {
    id: `lab-${Date.now()}`,
    ...labResultData,
    createdAt: new Date().toISOString()
  };
  console.log('POST /api/lab-results - newLabResult:', newLabResult);
  res.json({ success: true, labResult: newLabResult });
});

// === FRONTEND ROUTE ===

// Note: Wildcard route désactivée temporairement pour éviter les erreurs
// Le frontend React est servi via express.static

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
