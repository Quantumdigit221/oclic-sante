// Serveur Monolithique O'CLIC SANTE - Version Améliorée
// Inspiré du code Tickets.tsx avec toutes les fonctionnalités
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

// Base de données en mémoire (pour la démo)
let tickets = [
  {
    id: 'ticket-001',
    ticketNumber: 'TKT-20240315-001',
    patientName: 'Patient Test',
    patientAge: 35,
    patientGender: 'M',
    patientPhone: '+221 77 123 45 67',
    patientAddress: 'Dakar, Sénégal',
    serviceName: 'Consultation générale',
    serviceId: 'service-001',
    doctorId: 'doctor-001',
    amount: 5000,
    paymentMethod: 'CASH',
    status: 'WAITING',
    notes: 'Patient avec maux de tête',
    createdAt: new Date().toISOString(),
    centerId: 'center-1'
  }
];

let services = [
  {
    id: 'service-001',
    name: 'Consultation générale',
    category: 'Consultation',
    price: 5000,
    emergencyPrice: 7500,
    durationMinutes: 30,
    isActive: true
  },
  {
    id: 'service-002',
    name: 'Consultation pédiatrique',
    category: 'Consultation',
    price: 6000,
    emergencyPrice: 9000,
    durationMinutes: 45,
    isActive: true
  },
  {
    id: 'service-003',
    name: 'Analyse sanguine complète',
    category: 'Laboratoire',
    price: 15000,
    emergencyPrice: 22500,
    durationMinutes: 15,
    isActive: true
  }
];

let users = [
  {
    id: 'admin-001',
    name: 'Administrateur O\'CLIC SANTE',
    email: 'admin@sante.quantum221.com',
    role: 'SUPER_ADMIN',
    password: '$2a$10$rOzJqQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ' // admin123
  },
  {
    id: 'doctor-001',
    name: 'Dr. Marie Sarr',
    role: 'DOCTOR',
    specialty: 'Médecine générale',
    email: 'doctor@sante.quantum221.com'
  }
];

let patients = [
  {
    id: 'patient-001',
    firstName: 'Jean',
    lastName: 'Test',
    birthDate: '1989-03-15',
    gender: 'M',
    phone: '+221 77 123 45 67',
    address: 'Dakar, Sénégal',
    email: 'patient@test.com'
  },
  {
    id: 'patient-002',
    firstName: 'Marie',
    lastName: 'Fall',
    birthDate: '1995-08-20',
    gender: 'F',
    phone: '+221 77 987 65 43',
    address: 'Dakar, Sénégal'
  }
];

let consultations = [
  {
    id: 'consult-001',
    ticketId: 'ticket-001',
    patientName: 'Jean Test',
    doctorName: 'Dr. Marie Sarr',
    serviceName: 'Consultation générale',
    date: new Date().toISOString(),
    symptoms: 'Maux de tête depuis 2 jours',
    diagnosis: 'Céphalée tensionnelle',
    prescription: 'Paracétamol 500mg, 1 comprimé toutes les 6 heures pendant 3 jours',
    status: 'completed'
  }
];

let medicines = [
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

// Utilitaires
const generateTicketNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TKT-${dateStr}-${random}`;
};

const formatAmount = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount || 0);
};

// === API ROUTES ===

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'O\'CLIC SANTE API - Monolithique Enhanced',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    version: '2.0.0',
    features: ['tickets', 'services', 'patients', 'consultations', 'medicines']
  });
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Tentative de login:', { email, timestamp: new Date().toISOString() });

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    if (email === 'admin@sante.quantum221.com') {
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (isValidPassword) {
        const token = jwt.sign(
          { 
            id: user.id, 
            email: user.email, 
            role: user.role,
            name: user.name 
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
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
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

// === TICKETS API ===

// Get all tickets
app.get('/api/tickets', (req, res) => {
  const { centerId, status } = req.query;
  let filteredTickets = tickets;

  if (centerId) {
    filteredTickets = filteredTickets.filter(t => t.centerId === centerId);
  }

  if (status) {
    filteredTickets = filteredTickets.filter(t => t.status === status);
  }

  res.json({ tickets: filteredTickets });
});

// Create ticket
app.post('/api/tickets', (req, res) => {
  try {
    const ticketData = {
      id: 'ticket-' + Date.now(),
      ticketNumber: generateTicketNumber(),
      ...req.body,
      createdAt: new Date().toISOString()
    };

    tickets.push(ticketData);

    console.log('Ticket créé:', ticketData);

    res.status(201).json({
      success: true,
      message: 'Ticket créé avec succès',
      ticket: ticketData
    });
  } catch (error) {
    console.error('Erreur création ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du ticket'
    });
  }
});

// Update ticket status
app.patch('/api/tickets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticketIndex = tickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    tickets[ticketIndex].status = status;
    tickets[ticketIndex].updatedAt = new Date().toISOString();

    console.log(`Ticket ${id} mis à jour: status=${status}`);

    res.json({
      success: true,
      message: 'Ticket mis à jour avec succès',
      ticket: tickets[ticketIndex]
    });
  } catch (error) {
    console.error('Erreur mise à jour ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du ticket'
    });
  }
});

// Delete ticket
app.delete('/api/tickets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const ticketIndex = tickets.findIndex(t => t.id === id);

    if (ticketIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    tickets.splice(ticketIndex, 1);

    console.log(`Ticket ${id} supprimé`);

    res.json({
      success: true,
      message: 'Ticket supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du ticket'
    });
  }
});

// === SERVICES API ===

app.get('/api/services', (req, res) => {
  const { category, isActive } = req.query;
  let filteredServices = services;

  if (category) {
    filteredServices = filteredServices.filter(s => s.category === category);
  }

  if (isActive !== undefined) {
    filteredServices = filteredServices.filter(s => s.isActive === (isActive === 'true'));
  }

  res.json({ services: filteredServices });
});

// === PATIENTS API ===

app.get('/api/patients', (req, res) => {
  const { search } = req.query;
  let filteredPatients = patients;

  if (search) {
    filteredPatients = patients.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search)
    );
  }

  res.json({ patients: filteredPatients });
});

// === CONSULTATIONS API ===

app.get('/api/consultations', (req, res) => {
  const { patientId, doctorId, status } = req.query;
  let filteredConsultations = consultations;

  if (patientId) {
    filteredConsultations = filteredConsultations.filter(c => c.patientId === patientId);
  }

  if (doctorId) {
    filteredConsultations = filteredConsultations.filter(c => c.doctorId === doctorId);
  }

  if (status) {
    filteredConsultations = filteredConsultations.filter(c => c.status === status);
  }

  res.json({ consultations: filteredConsultations });
});

// === MEDICINES API ===

app.get('/api/medicines', (req, res) => {
  const { category, inStock } = req.query;
  let filteredMedicines = medicines;

  if (category) {
    filteredMedicines = filteredMedicines.filter(m => m.category === category);
  }

  if (inStock === 'true') {
    filteredMedicines = filteredMedicines.filter(m => m.stock > 0);
  }

  res.json({ medicines: filteredMedicines });
});

// === USERS API ===

app.get('/api/users', (req, res) => {
  const { role } = req.query;
  let filteredUsers = users;

  if (role) {
    filteredUsers = users.filter(u => u.role === role);
  }

  res.json({ users: filteredUsers });
});

// === STATISTICS API ===

app.get('/api/stats', (req, res) => {
  const stats = {
    tickets: {
      total: tickets.length,
      waiting: tickets.filter(t => t.status === 'WAITING').length,
      inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tickets.filter(t => t.status === 'COMPLETED').length,
      cancelled: tickets.filter(t => t.status === 'CANCELLED').length
    },
    patients: patients.length,
    services: services.length,
    consultations: consultations.length,
    medicines: medicines.length,
    revenue: tickets
      .filter(t => t.status === 'COMPLETED')
      .reduce((total, t) => total + (t.amount || 0), 0)
  };

  res.json(stats);
});

// === PAGE TICKETS STANDALONE ===

app.get('/tickets', (req, res) => {
  res.sendFile(path.join(__dirname, 'tickets-standalone.html'));
});

// === FRONTEND ROUTE ===

// Servir le frontend React pour toutes les autres routes (SPA)
app.get('*', (req, res) => {
  // Ne pas servir pour les routes API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Route API non trouvée',
      path: req.path,
      method: req.method,
      availableRoutes: [
        'GET /api/health',
        'POST /api/login',
        'GET /api/auth/verify',
        'GET /api/tickets',
        'POST /api/tickets',
        'PATCH /api/tickets/:id',
        'DELETE /api/tickets/:id',
        'GET /api/services',
        'GET /api/patients',
        'GET /api/consultations',
        'GET /api/medicines',
        'GET /api/users',
        'GET /api/stats',
        'GET /tickets (page standalone)'
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
  console.log(`🚀 Serveur O'CLIC SANTE Monolithique Enhanced démarré`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🏥 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Routes API disponibles:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/login`);
  console.log(`   GET  /api/auth/verify`);
  console.log(`   GET  /api/tickets`);
  console.log(`   POST /api/tickets`);
  console.log(`   PATCH /api/tickets/:id`);
  console.log(`   DELETE /api/tickets/:id`);
  console.log(`   GET  /api/services`);
  console.log(`   GET  /api/patients`);
  console.log(`   GET  /api/consultations`);
  console.log(`   GET  /api/medicines`);
  console.log(`   GET  /api/users`);
  console.log(`   GET  /api/stats`);
  console.log(`   GET  /tickets (page standalone)`);
  console.log(`🎨 Frontend servi sur: /`);
  console.log(`📊 Statistiques en temps réel disponibles`);
});

export default app;
