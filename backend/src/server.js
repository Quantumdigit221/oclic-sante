import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root (two levels up)
dotenv.config({ path: join(__dirname, '../../.env') });

// Use PostgreSQL in production, MySQL in development
const db = process.env.NODE_ENV === 'production'
  ? (await import('./postgres-database.js')).db
  : (await import('./mysql-database.js')).db;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple auth middleware
const authMiddleware = async (req, res, next) => {
  // En production, on vérifierait un vrai token JWT
  const centerId = req.headers['x-center-id'] || req.query.centerId;
  const userRole = req.headers['x-user-role'] || 'ADMIN';
  const centers = await db.getCenters();

  req.user = {
    centerId: centerId || (centers.length > 0 ? centers[0].id : 'center-1'),
    role: userRole.toUpperCase()
  };
  next();
};

// API Routes
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Backend: tentative de login avec:', { email, password: '***', passwordLength: password?.length });

  const user = await db.findUser(email);
  console.log('Backend: utilisateur trouvé:', !!user);

  if (user && password === 'demo123') {
    // Générer un token simple (en production, utiliser JWT)
    const token = 'token_' + Date.now() + '_' + user.id;
    console.log('Backend: connexion réussie, token généré');
    return res.json({ success: true, user, token });
  }

  console.log('Backend: échec de connexion - utilisateur:', !!user, 'mot de passe correct:', password === 'demo123');
  return res.status(401).json({ success: false, error: 'Invalid credentials' });
});

app.get('/api/center', async (req, res) => {
  try {
    const centerId = req.query.centerId || 'center-1';
    const center = await db.getCenter(centerId);
    res.json(center);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching center' });
  }
});

app.get('/api/centers', async (req, res) => {
  try {
    const centers = await db.getCenters();
    res.json(centers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching centers' });
  }
});

// Profile endpoint for token validation
app.get('/api/profile', async (req, res) => {
  try {
    // For now, return a simple success response
    // In production, validate the token and return user profile
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Insurance endpoints (placeholder responses)
app.get('/api/insurance/companies', async (req, res) => {
  try {
    res.json([]); // Empty array for now
  } catch (error) {
    res.status(500).json({ error: 'Error fetching insurance companies' });
  }
});

app.get('/api/insurance/patients', async (req, res) => {
  try {
    res.json([]); // Empty array for now
  } catch (error) {
    res.status(500).json({ error: 'Error fetching insurance patients' });
  }
});

app.get('/api/insurance/transactions', async (req, res) => {
  try {
    res.json([]); // Empty array for now
  } catch (error) {
    res.status(500).json({ error: 'Error fetching insurance transactions' });
  }
});

app.post('/api/centers', async (req, res) => {
  try {
    console.log('Création d\'un centre - Données reçues:', req.body);
    const center = await db.addCenter(req.body);
    console.log('Centre créé avec succès:', center);
    res.status(201).json(center);
  } catch (error) {
    console.error('Erreur détaillée lors de la création du centre:', error);
    res.status(400).json({ error: 'Error creating center', details: error.message });
  }
});

app.patch('/api/centers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const sql = 'UPDATE health_centers SET isActive = ? WHERE id = ?';
    const result = await db.executeQuery(sql, [isActive, id]);

    if (result.affectedRows > 0) {
      res.json({ success: true, isActive });
    } else {
      res.status(404).json({ error: 'Center not found' });
    }
  } catch (error) {
    console.error('Error updating center status:', error);
    res.status(500).json({ error: 'Error updating center status' });
  }
});

app.patch('/api/center', authMiddleware, async (req, res) => {
  try {
    const center = await db.updateCenter(req.body);
    res.json(center);
  } catch (error) {
    console.error('Error updating center:', error);
    if (error.message === 'Center not found') {
      res.status(404).json({ error: 'Center not found' });
    } else {
      res.status(400).json({ error: 'Error updating center', details: error.message });
    }
  }
});

app.get('/api/services', authMiddleware, async (req, res) => {
  try {
    const centerId = req.user.role === 'SUPER_ADMIN' ? req.query.centerId : req.user.centerId;
    const services = await db.getServices(centerId);
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Error fetching services' });
  }
});

app.get('/api/services/:id', authMiddleware, async (req, res) => {
  try {
    const service = await db.getServiceById(req.params.id);
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error fetching service' });
  }
});

app.patch('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await db.updateService(id, req.body);
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error updating service' });
  }
});

// Supprimer un service
app.delete('/api/services/:id', authMiddleware, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est administrateur
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent supprimer des services.'
      });
    }

    const result = await db.deleteService(req.params.id);

    res.json({
      success: true,
      message: result.message || 'Service supprimé avec succès',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du service:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression du service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/services', authMiddleware, async (req, res) => {
  try {
    // Validation des données requises
    const requiredFields = ['name', 'category', 'price'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Champs manquants: ${missingFields.join(', ')}`
      });
    }

    // Préparation des données du service
    const serviceData = {
      ...req.body,
      centerId: req.body.centerId || req.user.centerId,
      isActive: req.body.isActive !== false,
      emergencyPrice: req.body.emergencyPrice || null,
      durationMinutes: req.body.durationMinutes || null
    };

    console.log('Tentative de création de service:', serviceData);
    const service = await db.addService(serviceData);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la création du service:', error);
    res.status(400).json({ error: 'Error creating service', details: error.message });
  }
});

app.get('/api/medicines', authMiddleware, async (req, res) => {
  try {
    const centerId = req.user.role === 'SUPER_ADMIN' ? req.query.centerId : req.user.centerId;
    const medicines = await db.getMedicines(centerId);
    res.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Error fetching medicines' });
  }
});

app.patch('/api/medicines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await db.updateMedicine(id, req.body);
    if (medicine) {
      res.json(medicine);
    } else {
      res.status(404).json({ error: 'Medicine not found' });
    }
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(400).json({ error: 'Error updating medicine' });
  }
});

app.post('/api/medicines', async (req, res) => {
  try {
    const medicine = await db.addMedicine(req.body);
    res.status(201).json(medicine);
  } catch (error) {
    console.error('Error creating medicine:', error);
    res.status(400).json({ error: 'Error creating medicine' });
  }
});

app.get('/api/patients', authMiddleware, async (req, res) => {
  try {
    const centerId = req.user.role === 'SUPER_ADMIN' ? req.query.centerId : req.user.centerId;
    const patients = await db.getPatients(centerId);
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(400).json({ error: 'Error fetching patients', details: error.message });
  }
});

app.post('/api/patients', authMiddleware, async (req, res) => {
  try {
    const patient = await db.addPatient(req.body);
    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(400).json({ error: 'Error creating patient', details: error.message });
  }
});

app.get('/api/tickets', authMiddleware, async (req, res) => {
  try {
    const centerId = req.user.role === 'SUPER_ADMIN' ? req.query.centerId : req.user.centerId;
    const tickets = await db.getTickets(centerId);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(400).json({ error: 'Error fetching tickets', details: error.message });
  }
});

app.post('/api/tickets', authMiddleware, async (req, res) => {
  try {
    const ticket = await db.addTicket(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(400).json({ error: 'Error creating ticket', details: error.message });
  }
});

app.patch('/api/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`PATCH request: updating ticket ${id} to status ${status}`);

    const ticket = await db.updateTicketStatus(id, status);
    if (ticket) {
      console.log(`Ticket ${id} updated successfully to ${status}`);
      res.json(ticket);
    } else {
      console.log(`Ticket ${id} not found`);
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(400).json({ error: 'Error updating ticket status' });
  }
});

app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const centerId = req.user.role === 'SUPER_ADMIN' ? req.query.centerId : req.user.centerId;
    const users = await db.getUsers(centerId);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    console.log('Création d\'un utilisateur - Données reçues:', req.body);
    const user = await db.addUser(req.body);
    console.log('Utilisateur créé avec succès:', user);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(400).json({ error: 'Error adding user', details: error.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.updateUser(id, req.body);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error updating user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteUser(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error deleting user' });
  }
});

app.get('/api/consultations', authMiddleware, async (req, res) => {
  try {
    const centerId = req.user.role === 'SUPER_ADMIN' ? req.query.centerId : req.user.centerId;
    const consultations = await db.getConsultations(centerId);
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching consultations' });
  }
});

app.post('/api/consultations', async (req, res) => {
  try {
    const consultation = await db.addConsultation(req.body);
    res.status(201).json(consultation);
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(400).json({ error: 'Error creating consultation', details: error.message, stack: error.stack });
  }
});

// Lab Results routes
app.get('/api/lab-results', authMiddleware, async (req, res) => {
  try {
    const centerId = req.user.role === 'SUPER_ADMIN' ? req.query.centerId : req.user.centerId;
    const { patientId } = req.query;
    const results = await db.getLabResults(centerId, patientId);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching lab results' });
  }
});

app.post('/api/lab-results', async (req, res) => {
  try {
    const result = await db.addLabResult(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: 'Error creating lab result' });
  }
});

app.patch('/api/lab-results/:id', async (req, res) => {
  try {
    const result = await db.updateLabResult(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Error updating lab result' });
  }
});

app.delete('/api/lab-results/:id', async (req, res) => {
  try {
    const success = await db.deleteLabResult(req.params.id);
    if (success) res.status(204).send();
    else res.status(404).json({ error: 'Result not found' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting lab result' });
  }
});

// Servir l'application frontend statique
app.use(express.static(join(__dirname, '../../frontend/dist')));

// Rediriger toutes les autres requêtes vers l'application React
app.use((req, res) => {
  console.log(`Catch-all triggered for URL: ${req.url}`);
  try {
    const filePath = join(__dirname, '../../frontend/dist', 'index.html');
    console.log(`Sending file: ${filePath}`);
    res.sendFile(filePath);
  } catch (e) {
    console.error("Error in sendFile:", e);
    res.status(500).send("Error");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log('📊 Available endpoints:');
  console.log('  POST /api/login');
  console.log('  GET  /api/center');
  console.log('  GET  /api/centers');
  console.log('  POST /api/centers');
  console.log('  PATCH /api/center');
  console.log('  GET  /api/services');
  console.log('  POST /api/services');
  console.log('  PATCH /api/services/:id');
  console.log('  GET  /api/medicines');
  console.log('  POST /api/medicines');
  console.log('  PATCH /api/medicines/:id');
  console.log('  GET  /api/patients');
  console.log('  POST /api/patients');
  console.log('  GET  /api/tickets');
  console.log('  POST /api/tickets');
  console.log('  PATCH /api/tickets/:id/status');
  console.log('  GET  /api/users');
  console.log('  POST /api/users');
  console.log('  PATCH /api/users/:id');
  console.log('  DELETE /api/users/:id');
  console.log('  GET  /api/consultations');
  console.log('  POST /api/consultations');
  console.log('  GET  /api/lab-results');
  console.log('  POST /api/lab-results');
  console.log('  PATCH /api/lab-results/:id');
  console.log('  DELETE /api/lab-results/:id');
});
