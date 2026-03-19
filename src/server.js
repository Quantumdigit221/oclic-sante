// Serveur Monolithique O'CLIC SANTE - Version Base de Données
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  initializeDatabase, 
  UserModel, 
  TicketModel, 
  PatientModel, 
  ServiceModel, 
  MedicineModel, 
  ConsultationModel, 
  SettingsModel,
  query
} from './database.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'o_clic_sante_jwt_secret_very_long_and_secure_2024';

let dbConnected = false;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sante.quantum221.com'] 
    : ['http://localhost:3000', 'http://localhost:3004'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`[REQ DB] ${req.method} ${req.url}`);
  next();
});

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../public')));

const adminUser = {
  id: 'admin-001',
  name: 'Administrateur O\'CLIC SANTE',
  email: 'admin@sante.quantum221.com',
  role: 'SUPER_ADMIN',
  password: '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO' // admin123
};

// === API ROUTES ===

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = null;

    if (dbConnected) {
      const users = await UserModel.findByEmail(email);
      user = users.length > 0 ? users[0] : null;
    } else if (email === adminUser.email) {
      user = adminUser;
    }

    if (user) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (isValidPassword) {
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role, name: user.name },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
      }
    }
    return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Stats (Real DB Stats)
app.get('/api/stats', async (req, res) => {
  try {
    let patientsToday = 0;
    let revenueToday = 0;
    let waitingRoom = 0;
    let criticalStock = 0;

    if (dbConnected) {
      const statsPatients = await query("SELECT COUNT(*) as count FROM tickets WHERE DATE(created_at) = CURDATE()");
      patientsToday = statsPatients[0].count;

      const statsRevenue = await query("SELECT SUM(amount) as total FROM tickets WHERE DATE(created_at) = CURDATE() AND status = 'COMPLETED'");
      revenueToday = statsRevenue[0].total || 0;

      const statsWaiting = await query("SELECT COUNT(*) as count FROM tickets WHERE status = 'WAITING'");
      waitingRoom = statsWaiting[0].count;

      const statsStock = await query("SELECT COUNT(*) as count FROM medicines WHERE stock_quantity <= min_stock_alert AND active = TRUE");
      criticalStock = statsStock[0].count;
    }

    res.json({
      dailyPatients: { value: patientsToday, change: '+5%' },
      dailyRevenue: { value: revenueToday, change: '+12%' },
      waitingRoom: { value: waitingRoom, change: 'Stable' },
      criticalStock: { value: criticalStock, change: 'Action requise' },
      total_patients_today: patientsToday,
      total_revenue_today: revenueToday,
      waiting_today: waitingRoom,
      stock_alert: criticalStock
    });
  } catch (error) {
    res.json({ dailyPatients: { value: 0 }, dailyRevenue: { value: 0 }, waitingRoom: { value: 0 }, criticalStock: { value: 0 } });
  }
});

// Centers
app.get('/api/centers', async (req, res) => {
  try {
    const centers = dbConnected ? await CenterModel.findAll() : [];
    res.json(centers);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/centers', async (req, res) => {
  try {
    console.log('POST /api/centers:', req.body);
    const centerData = {
      id: req.body.id || `center-${Date.now()}`,
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      directorName: req.body.directorName,
      rnis: req.body.rnis,
      capacity: req.body.capacity,
      pispiAlias: req.body.pispiAlias
    };
    
    if (dbConnected) {
      const newCenter = await CenterModel.create(centerData);
      res.json(newCenter);
    } else {
      res.json(centerData);
    }
  } catch (error) {
    console.error('Erreur create center:', error);
    res.status(500).json({ error: 'Erreur lors de la création du centre' });
  }
});

// Tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = dbConnected ? await TicketModel.findAll() : [];
    res.json(tickets);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const newTicket = {
      id: `ticket-${Date.now()}`,
      ticketNumber: `T-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      patientId: req.body.patientId || null,
      serviceId: req.body.serviceId || null,
      patientName: req.body.patientName || 'Anonyme',
      patientAge: req.body.patientAge || 0,
      patientGender: req.body.patientGender || 'M',
      serviceName: req.body.serviceName || 'Consultation',
      amount: req.body.amount || 0
    };
    
    if (dbConnected) {
      await TicketModel.create(newTicket);
    }
    res.json(newTicket);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du ticket' });
  }
});

// Patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = dbConnected ? await PatientModel.findAll() : [];
    res.json(patients);
  } catch (error) {
    res.json([]);
  }
});

// Médicaments
app.get('/api/medicines', async (req, res) => {
  try {
    const medicines = dbConnected ? await MedicineModel.findAll() : [];
    res.json(medicines);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/center', async (req, res) => {
  try {
    const settings = dbConnected ? await SettingsModel.getAll() : {};
    res.json({
      name: settings.center_name || "O'CLIC SANTE Principal",
      address: settings.center_address || "Abidjan, Côte d'Ivoire",
      phone: settings.center_phone || "+225 07 07 07 07 07",
      email: settings.center_email || "contact@sante.quantum221.com"
    });
  } catch (error) {
    res.json({ name: "O'CLIC SANTE Principal" });
  }
});

// Initialisation au démarrage
async function startServer() {
  dbConnected = await initializeDatabase();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur O'CLIC SANTE DB démarré sur http://localhost:${PORT}`);
    console.log(`🗄️  Statut Base de Données: ${dbConnected ? 'CONNECTÉE' : 'ÉCHEC (Mode mémoire)'}`);
  });
}

startServer();
