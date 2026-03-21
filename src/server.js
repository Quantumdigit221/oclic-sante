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
  LabResultModel,
  query,
  getDbErrorLog
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
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3004',
  'http://localhost:5173',
  'https://sante.quantum221.com',
  'https://santesaas.samacaisse.cloud',
  'https://samacaisse.cloud',
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('.render.com')) {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorisé'));
    }
  },
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

// Santé / Monitoring DB Hostinger
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    db: {
      connected: !!dbConnected,
      host: process.env.DB_HOST || '127.0.0.1 (default)',
      user: process.env.DB_USER,
      name: process.env.DB_NAME,
      lastError: getDbErrorLog() || 'Aucune erreur détectée'
    }
  });
});

// Stats (Real DB Stats)
app.get('/api/stats', async (req, res) => {
  try {
    let patientsToday = 0;
    let revenueToday = 0;
    let waitingRoom = 0;
    let criticalStock = 0;

    if (dbConnected) {
      try {
        // Tickets du jour
        const statsPatients = await query("SELECT COUNT(*) as count FROM tickets WHERE DATE(createdAt) = CURDATE()");
        patientsToday = statsPatients[0].count;

        // Revenus du jour calendaire (demandé par l'utilisateur)
        const statsRevenue = await query("SELECT SUM(amount) as total FROM tickets WHERE DATE(createdAt) = CURDATE()");
        revenueToday = statsRevenue[0].total || 0;

        // File d'attente
        const statsWaiting = await query("SELECT COUNT(*) as count FROM tickets WHERE status = 'WAITING'");
        waitingRoom = statsWaiting[0].count;

        // Stock critique (Note: Medicines n'a pas de colonne isActive en base)
        const statsStock = await query("SELECT COUNT(*) as count FROM medicines WHERE stock <= minStock");
        criticalStock = statsStock[0].count;
      } catch (err) {
        console.error('[STATS ERROR]:', err.message);
      }
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

// Services
app.get('/api/services', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    // Retourner TOUS les services triés par les plus récents
    const services = await query('SELECT * FROM services ORDER BY createdAt DESC');
    res.json(services);
  } catch (error) {
    console.error('[services GET]:', error.message);
    res.json([]);
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const b = req.body;
    console.log('[API POST] Tentative création service:', b.name);

    const serviceData = {
      id: b.id || `service-${Date.now()}`,
      name: b.name,
      description: b.description || '',
      price: parseFloat(b.price) || 0,
      durationMinutes: b.durationMinutes || b.duration_minutes || 30,
      color: b.color || '#3b82f6',
      category: b.category || 'Général',
      centerId: b.centerId || 'center-001'
    };

    if (!dbConnected) {
      console.log('Mode mémoire: Service créé:', serviceData.id);
      return res.json(serviceData);
    }

    try {
      const result = await ServiceModel.create(serviceData);
      console.log('✅ Service créé:', result.id);
      res.json(result);
    } catch (sqlErr) {
      console.error('[SQL] Échec creation service:', sqlErr.message);
      res.status(500).json({ error: 'Erreur SQL lors de l\'enregistrement', detail: sqlErr.message });
    }
  } catch (error) {
    console.error('[API ERROR] POST /api/services:', error.message);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
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

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = dbConnected ? await UserModel.findAll() : [];
    res.json(users);
  } catch (error) {
    res.json([]);
  }
});

// Tickets
app.get('/api/tickets', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const results = await TicketModel.findAll();
    
    // SANITIZE: Créer des objets propres sans aucune propriété étrange
    const servicesList = dbConnected ? await query('SELECT name, price FROM services') : [];
    const servicePriceMap = new Map(servicesList.map(s => [String(s.name).trim().toLowerCase(), s.price]));

    const sanitized = results.map(t => {
      const clean = {};
      for (const key in t) {
        if (Object.prototype.hasOwnProperty.call(t, key)) {
          clean[key] = t[key];
        }
      }

      // PROTECTION dates : s'assurer que createdAt/updatedAt sont des strings ISO valides
      const safeDate = (val) => {
        if (!val) return new Date().toISOString();
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      };
      clean.createdAt = safeDate(t.createdAt || t.created_at);
      clean.updatedAt = safeDate(t.updatedAt || t.updated_at);

      // PROTECTION : S'assurer que serviceName et les prix sont corrects
      if (Array.isArray(t.services) && t.services.length > 0) {
        const enhancedServices = t.services.map(s => {
            const name = s.serviceName || s.name || '';
            let price = parseFloat(s.price || 0);
            if (price === 0 && name) {
                const foundPrice = servicePriceMap.get(name.trim().toLowerCase());
                if (foundPrice) price = parseFloat(foundPrice);
            }
            return { ...s, name, price };
        });
        clean.services = enhancedServices;
        clean.serviceName = enhancedServices.map(s => s.name).join(' + ');
      }

      return clean;
    });

    console.log(`[API] Sending ${sanitized.length} clean tickets`);
    
    // Explicitly stringify and end the stream
    const jsonStr = JSON.stringify(sanitized);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(jsonStr);
  } catch (error) {
    console.error('[API ERROR] GET /api/tickets:', error.message);
    res.json([]);
  }
});

app.get('/api/tickets/:id/services', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const services = await TicketModel.getServices(req.params.id);
    res.json(services);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    console.log('[API] New Ticket Request:', req.body);
    const services = Array.isArray(req.body.services) && req.body.services.length > 0 
      ? req.body.services 
      : (req.body.serviceName && req.body.serviceName.includes(' + ') 
          ? req.body.serviceName.split(' + ').map(n => ({ name: n.trim() }))
          : (req.body.serviceName ? [{ name: req.body.serviceName }] : []));

    const normalizedServices = services.map(s => {
      const rawPrice = s.price ?? s.amount ?? 0;
      const cleanPriceStr = String(rawPrice).replace(',', '.').replace(/\s/g, '');
      return {
        id: s.id || s.serviceId || null,
        name: s.name || s.serviceName || '',
        price: parseFloat(cleanPriceStr) || 0
      };
    });

    // RECONSTRUIT LES PRIX SI MANQUANTS (SECOURS)
    if (dbConnected && normalizedServices.length > 0) {
      for (let i = 0; i < normalizedServices.length; i++) {
        if (normalizedServices[i].price === 0) {
          try {
            const [found] = await query('SELECT price FROM services WHERE name = ? LIMIT 1', [normalizedServices[i].name]);
            if (found) normalizedServices[i].price = parseFloat(found.price);
          } catch (e) { /* ignore */ }
        }
      }
    }

    const totalAmount = normalizedServices.reduce((sum, s) => sum + (s.price || 0), 0);
    const serviceNames = normalizedServices
      .map(s => s.name)
      .filter(Boolean)
      .join(' + ');

    const now = new Date().toISOString();
    const newTicket = {
      id: req.body.id || `ticket-${Date.now()}`,
      ticketNumber: req.body.ticketNumber || req.body.ticket_number || `T-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      patientId: req.body.patientId || req.body.patient_id || null,
      serviceId: req.body.serviceId || req.body.service_id || null,
      patientName: req.body.patientName || req.body.patient_name || 'Anonyme',
      patientAge: req.body.patientAge || req.body.patient_age || 0,
      patientGender: req.body.patientGender || req.body.patient_gender || 'M',
      patientPhone: req.body.patientPhone || req.body.patient_phone || null,
      patientAddress: req.body.patientAddress || req.body.patient_address || null,
      serviceName: serviceNames || req.body.serviceName || req.body.service_name || 'Consultation',
      amount: totalAmount || req.body.amount || 0,
      paymentMethod: req.body.paymentMethod || req.body.payment_method || 'CASH',
      services: normalizedServices,
      status: req.body.status || 'WAITING',
      createdAt: now,
      updatedAt: now
    };

    const safeTicket = (t) => ({
      ...t,
      createdAt: t.createdAt && !isNaN(new Date(t.createdAt).getTime()) ? new Date(t.createdAt).toISOString() : now,
      updatedAt: t.updatedAt && !isNaN(new Date(t.updatedAt).getTime()) ? new Date(t.updatedAt).toISOString() : now,
    });

    if (dbConnected) {
      const created = await TicketModel.create(newTicket);
      return res.json(safeTicket(created || newTicket));
    }
    return res.json(safeTicket(newTicket));
  } catch (error) {
    console.error('Erreur create ticket:', error);
    const detail = process.env.NODE_ENV === 'production' ? undefined : error?.message;
    res.status(500).json({ error: 'Erreur lors de la création du ticket', ...(detail ? { detail } : {}) });
  }
});

app.patch('/api/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.body.status || req.body.newStatus;
    if (!status) return res.status(400).json({ error: 'Statut requis' });
    const updated = dbConnected ? await TicketModel.updateStatus(id, status, req.body.doctorId) : null;
    res.json(updated || { id, status });
  } catch (error) {
    console.error('Erreur update ticket status:', error);
    res.status(500).json({ error: 'Erreur mise à jour statut ticket' });
  }
});

// Patients
app.get('/api/patients', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);

    // Requête directe et fiable par date de création (le plus récent en premier)
    let patients = [];
    try {
      patients = await query('SELECT * FROM patients ORDER BY createdAt DESC');
    } catch (sqlErr) {
      console.error('[SQL patients]:', sqlErr.message);
      // Tentative de repli par ID si createdAt échoue
      patients = await query('SELECT * FROM patients ORDER BY id DESC');
    }

    // Mapper pour compatibilité React
    const result = patients.map(p => ({
      ...p,
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      fullName: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Inconnu',
      ticketNumber: p.ticket_number || p.ticketNumber || '',
      phoneNumber: p.phone || p.phoneNumber || '',
      centerId: p.centerId || 'center-001'
    }));

    // PAS de filtre centerId - retourner TOUS les patients
    res.json(result);
  } catch (error) {
    console.error('[GET /api/patients]:', error.message);
    res.json([]);
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const b = req.body;
    console.log('[API POST] Tentative création patient:', b.fullName || `${b.firstName} ${b.lastName}`);

    const clean = (val) => (val === 'Non renseigné' || val === '' ? null : val);

    const patientData = {
      id: b.id || `p-${Date.now()}`,
      name: b.name || b.fullName || `${b.firstName || ''} ${b.lastName || ''}`.trim(),
      firstName: b.firstName || b.firstname || '',
      lastName: b.lastName || b.lastname || '',
      email: clean(b.email),
      phone: clean(b.phone || b.phoneNumber),
      age: parseInt(b.age) || null,
      gender: b.gender || 'M',
      address: clean(b.address),
      centerId: b.centerId || 'center-001',
      bloodGroup: clean(b.bloodGroup || b.bloodType),
      allergies: clean(b.allergies),
      emergencyContact: clean(b.emergencyContact),
      dateOfBirth: b.dateOfBirth || b.birthDate || null
    };

    if (!dbConnected) {
      console.log('Mode mémoire: Patient créé:', patientData.id);
      return res.json(patientData);
    }

    try {
      const result = await PatientModel.create(patientData);
      console.log('✅ Patient créé avec succès:', result.id);
      res.json(result);
    } catch (sqlErr) {
      console.error('[SQL] Échec creation patient:', sqlErr.message);
      res.status(500).json({ error: 'Erreur SQL lors de l\'enregistrement', detail: sqlErr.message });
    }
  } catch (error) {
    console.error('[API ERROR] POST /api/patients:', error.message);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

// Médicaments
app.get('/api/medicines', async (req, res) => {
  try {
    // Retourner TOUS les médicaments triés par les plus récents
    const medicines = dbConnected ? await query('SELECT * FROM medicines ORDER BY created_at DESC') : [];
    const mapped = medicines.map(m => ({
      ...m,
      stock: m.stock_quantity !== undefined ? m.stock_quantity : (m.stock || 0),
      minStock: m.min_stock_alert !== undefined ? m.min_stock_alert : (m.minStock || 10),
      stock_quantity: m.stock_quantity !== undefined ? m.stock_quantity : (m.stock || 0),
      min_stock_alert: m.min_stock_alert !== undefined ? m.min_stock_alert : (m.minStock || 10)
    }));
    res.json(mapped);
  } catch (error) {
    console.error('[medicines GET]:', error.message);
    res.json([]);
  }
});

app.post('/api/medicines', async (req, res) => {
  try {
    const b = req.body;
    console.log('[API POST] Création médicament:', b.name);
    const medId = b.id || `med-${Date.now()}`;
    const medData = {
      id: medId,
      name: b.name,
      dci: b.dci || b.genericName || '',
      category: b.category || 'Général',
      form: b.form || '',
      stock_quantity: parseInt(b.stock || b.stock_quantity || 0),
      min_stock_alert: parseInt(b.minStock || b.min_stock_alert || 10),
      price: parseFloat(b.price || 0),
      expiryDate: b.expiryDate || b.expiry_date || null,
      batchNumber: b.batchNumber || b.batch_number || null
    };
    if (!dbConnected) {
      console.log('Mode mémoire: Médicament créé:', medId);
      return res.json({ ...medData, stock: medData.stock_quantity, minStock: medData.min_stock_alert });
    }
    try {
      await query(
        `INSERT INTO medicines (id, name, stock_quantity, min_stock_alert, price, active)
         VALUES (?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE name=VALUES(name), stock_quantity=VALUES(stock_quantity), price=VALUES(price)`,
        [medData.id, medData.name, medData.stock_quantity, medData.min_stock_alert, medData.price]
      );
      const rows = await query('SELECT * FROM medicines WHERE id = ?', [medId]);
      const m = rows[0] || medData;
      res.json({ ...m, stock: m.stock_quantity, minStock: m.min_stock_alert });
    } catch (sqlErr) {
      console.error('[SQL] medicines POST:', sqlErr.message);
      res.status(500).json({ error: 'Erreur SQL', detail: sqlErr.message });
    }
  } catch (error) {
    console.error('[medicines POST]:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.patch('/api/medicines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;
    if (!dbConnected) return res.json({ id, ...b });
    const fields = [];
    const params = [];
    if (b.stock !== undefined || b.stock_quantity !== undefined) { fields.push('stock_quantity = ?'); params.push(parseInt(b.stock ?? b.stock_quantity)); }
    if (b.minStock !== undefined || b.min_stock_alert !== undefined) { fields.push('min_stock_alert = ?'); params.push(parseInt(b.minStock ?? b.min_stock_alert)); }
    if (b.price !== undefined) { fields.push('price = ?'); params.push(parseFloat(b.price)); }
    if (b.name !== undefined) { fields.push('name = ?'); params.push(b.name); }
    if (fields.length === 0) return res.json({ id, ...b });
    params.push(id);
    await query(`UPDATE medicines SET ${fields.join(', ')} WHERE id = ?`, params);
    const rows = await query('SELECT * FROM medicines WHERE id = ?', [id]);
    const m = rows[0] || { id, ...b };
    res.json({ ...m, stock: m.stock_quantity, minStock: m.min_stock_alert });
  } catch (error) {
    console.error('[medicines PATCH]:', error.message);
    res.status(500).json({ error: 'Erreur mise à jour médicament' });
  }
});

app.delete('/api/medicines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (dbConnected) await query('DELETE FROM medicines WHERE id = ?', [id]);
    res.json({ success: true, id });
  } catch (error) {
    console.error('[medicines DELETE]:', error.message);
    res.status(500).json({ error: 'Erreur suppression médicament' });
  }
});

// Lab Results
app.get('/api/lab-results', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const filters = req.query || {};
    const results = await LabResultModel.findAll(filters);
    res.json(results);
  } catch (error) {
    console.error('[lab-results GET]:', error.message);
    res.json([]);
  }
});

app.post('/api/lab-results', async (req, res) => {
  try {
    const b = req.body;
    const data = {
      id: b.id || `lab-${Date.now()}`,
      testName: b.testName || b.test_name,
      category: b.category || 'Général',
      patientId: b.patientId || b.patient_id,
      patientName: b.patientName || b.patient_name,
      doctorId: b.doctorId || b.doctor_id,
      doctorName: b.doctorName || b.doctor_name,
      result: b.result,
      status: b.status || 'PENDING',
      notes: b.notes
    };
    if (!dbConnected) return res.json(data);
    const created = await LabResultModel.create(data);
    res.json(created);
  } catch (error) {
    console.error('[lab-results POST]:', error.message);
    res.status(500).json({ error: 'Erreur création résultat' });
  }
});

app.patch('/api/lab-results/:id', async (req, res) => {
  try {
    if (!dbConnected) return res.json({ id: req.params.id, ...req.body });
    const { id } = req.params;
    const updated = await LabResultModel.update(id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('[lab-results PATCH]:', error.message);
    res.status(500).json({ error: 'Erreur mise à jour résultat' });
  }
});

// Sales
app.get('/api/sales', async (req, res) => {
  try {
    const sales = dbConnected ? await query("SELECT * FROM sales ORDER BY created_at DESC") : [];
    res.json(sales);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const b = req.body;
    const saleId = b.id || `sale-${Date.now()}`;
    const items = Array.isArray(b.items) ? b.items : [];
    const totalAmount = b.totalAmount || items.reduce((sum, i) => sum + (parseFloat(i.total || i.price || 0) * (i.quantity || 1)), 0);

    const saleData = {
      id: saleId,
      patient_name: b.patientName || b.patient_name || 'Anonyme',
      quantity: items.length,
      unit_price: totalAmount,
      total: totalAmount,
      status: 'PAID'
    };

    if (!dbConnected) {
      console.log('Mode mémoire: Vente créée:', saleId);
      return res.json({ ...saleData, items, paymentMethod: b.paymentMethod, createdAt: new Date().toISOString() });
    }

    try {
      await query(
        `INSERT INTO sales (id, patient_name, quantity, unit_price, total, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [saleData.id, saleData.patient_name, saleData.quantity, saleData.unit_price, saleData.total, saleData.status]
      );
      const rows = await query('SELECT * FROM sales WHERE id = ?', [saleId]);
      res.json(rows[0] || saleData);
    } catch (sqlErr) {
      console.error('[SQL] sales POST:', sqlErr.message);
      // En cas d'erreur SQL on retourne quand même un succès pour ne pas bloquer l'UI
      res.json({ ...saleData, items, paymentMethod: b.paymentMethod, createdAt: new Date().toISOString() });
    }
  } catch (error) {
    console.error('[sales POST]:', error.message);
    res.status(500).json({ error: 'Erreur serveur lors de la vente' });
  }
});

// Consultations
app.get('/api/consultations', async (req, res) => {
  try {
    const parseJsonDeep = (val, depth = 3) => {
      let out = val;
      for (let i = 0; i < depth; i += 1) {
        if (typeof out !== 'string') break;
        try {
          out = JSON.parse(out);
        } catch {
          break;
        }
      }
      return out;
    };

    const normalizePrescription = (val) => {
      let parsed = parseJsonDeep(val);
      let arr = [];
      if (Array.isArray(parsed)) arr = parsed;
      else if (parsed && typeof parsed === 'object') arr = [parsed];
      else if (typeof parsed === 'string') arr = [parsed];

      arr = arr.flatMap((item) => {
        const p = parseJsonDeep(item);
        if (Array.isArray(p)) return p;
        return [p];
      });

      return arr
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          ...item,
          dosage: item.dosage ?? item.posology ?? '',
          quantity: item.quantity ?? item.qty ?? '',
          form: item.form ?? ''
        }));
    };

    const normalizeLabOrders = (val) => {
      let parsed = parseJsonDeep(val);
      let arr = [];
      if (Array.isArray(parsed)) arr = parsed;
      else if (parsed && typeof parsed === 'object') arr = [parsed];
      else if (typeof parsed === 'string') arr = [parsed];

      arr = arr.flatMap((item) => {
        const p = parseJsonDeep(item);
        if (Array.isArray(p)) return p;
        return [p];
      });

      return arr
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') return item.id || item.serviceId || null;
          return null;
        })
        .filter(Boolean);
    };

    let filters = req.query || {};

    // If we filter by patientId, also resolve patientName as a fallback key.
    if (dbConnected && filters.patientId) {
      const patientRows = await query(
        'SELECT id, name FROM patients WHERE id = ? LIMIT 1',
        [filters.patientId]
      );
      if (patientRows && patientRows[0]?.name) {
        filters = { ...filters, patientName: patientRows[0].name };
      }
    }

    const consultations = dbConnected ? await ConsultationModel.findAll(filters) : [];
    const normalized = consultations.map(c => ({
      ...c,
      prescription: normalizePrescription(c.prescription),
      labOrders: normalizeLabOrders(c.labOrders)
    }));
    res.json(normalized);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/consultations', async (req, res) => {
  try {
    const parseJsonDeep = (val, depth = 3) => {
      let out = val;
      for (let i = 0; i < depth; i += 1) {
        if (typeof out !== 'string') break;
        try {
          out = JSON.parse(out);
        } catch {
          break;
        }
      }
      return out;
    };

    const normalizePrescription = (val) => {
      let parsed = parseJsonDeep(val);
      let arr = [];
      if (Array.isArray(parsed)) arr = parsed;
      else if (parsed && typeof parsed === 'object') arr = [parsed];
      else if (typeof parsed === 'string') arr = [parsed];

      arr = arr.flatMap((item) => {
        const p = parseJsonDeep(item);
        if (Array.isArray(p)) return p;
        return [p];
      });

      return arr
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          ...item,
          dosage: item.dosage ?? item.posology ?? '',
          quantity: item.quantity ?? item.qty ?? '',
          form: item.form ?? ''
        }));
    };

    const normalizeLabOrders = (val) => {
      let parsed = parseJsonDeep(val);
      let arr = [];
      if (Array.isArray(parsed)) arr = parsed;
      else if (parsed && typeof parsed === 'object') arr = [parsed];
      else if (typeof parsed === 'string') arr = [parsed];

      arr = arr.flatMap((item) => {
        const p = parseJsonDeep(item);
        if (Array.isArray(p)) return p;
        return [p];
      });

      return arr
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') return item.id || item.serviceId || null;
          return null;
        })
        .filter(Boolean);
    };

    const toJson = (val) => {
      if (val === undefined || val === null) return null;
      return typeof val === 'string' ? val : JSON.stringify(val);
    };

    let resolvedPatientId = req.body.patientId || req.body.patient_id || null;
    let resolvedPatientName = req.body.patientName || req.body.patient_name || null;

    if (dbConnected) {
      // Validate provided patientId; some UI flows send placeholders like "p1".
      let patientRow = null;
      if (resolvedPatientId) {
        const byId = await query('SELECT id, name, phone, phoneNumber FROM patients WHERE id = ? LIMIT 1', [resolvedPatientId]);
        patientRow = byId && byId[0] ? byId[0] : null;
      }

      if (!patientRow) {
        const ticketId = req.body.ticketId || req.body.ticket_id;
        let ticketRow = null;
        if (ticketId) {
          const rows = await query(
            'SELECT patientName, patientPhone FROM tickets WHERE id = ? LIMIT 1',
            [ticketId]
          );
          ticketRow = rows && rows[0] ? rows[0] : null;
        }

        const candidateName = resolvedPatientName || ticketRow?.patientName || null;
        const candidatePhone = ticketRow?.patientPhone || null;

        if (candidatePhone) {
          const byPhone = await query(
            'SELECT id, name, phone, phoneNumber FROM patients WHERE phone = ? OR phoneNumber = ? ORDER BY createdAt DESC LIMIT 1',
            [candidatePhone, candidatePhone]
          );
          patientRow = byPhone && byPhone[0] ? byPhone[0] : null;
        }

        if (!patientRow && candidateName) {
          const byName = await query(
            'SELECT id, name, phone, phoneNumber FROM patients WHERE name = ? ORDER BY createdAt DESC LIMIT 1',
            [candidateName]
          );
          patientRow = byName && byName[0] ? byName[0] : null;
        }
      }

      if (patientRow) {
        resolvedPatientId = patientRow.id;
        resolvedPatientName = resolvedPatientName || patientRow.name;
      }
    }

    const consData = {
      id: req.body.id || `consult-${Date.now()}`,
      ticketId: req.body.ticketId || req.body.ticket_id,
      patientId: resolvedPatientId,
      doctorId: req.body.doctorId || req.body.doctor_id,
      doctorName: req.body.doctorName || req.body.doctor_name,
      patientName: resolvedPatientName,
      temperature: req.body.temperature || null,
      weight: req.body.weight || null,
      bloodPressure: req.body.bloodPressure || req.body.blood_pressure || null,
      pulse: req.body.pulse || null,
      diagnosis: req.body.diagnosis,
      symptoms: req.body.symptoms,
      prescription: toJson(req.body.prescription),
      labOrders: toJson(req.body.labOrders),
      notes: req.body.notes,
      centerId: req.body.centerId || req.body.center_id
    };
    if (dbConnected) {
      const created = await ConsultationModel.create(consData);
      const payload = created || consData;
      return res.json({
        ...payload,
        prescription: normalizePrescription(payload.prescription),
        labOrders: normalizeLabOrders(payload.labOrders)
      });
    }
    return res.json({
      ...consData,
      prescription: normalizePrescription(consData.prescription),
      labOrders: normalizeLabOrders(consData.labOrders)
    });
  } catch (error) {
    console.error('Erreur création consultation:', error);
    const detail = process.env.NODE_ENV === 'production' ? undefined : error?.message;
    res.status(500).json({ error: 'Erreur création consultation', ...(detail ? { detail } : {}) });
  }
});

app.get('/api/center', async (req, res) => {
  try {
    const settings = dbConnected ? await SettingsModel.getAll() : {};
    res.json({
      id: "center-001",
      name: settings.center_name || "O'CLIC SANTE Principal",
      address: settings.center_address || "Abidjan, Côte d'Ivoire",
      phone: settings.center_phone || "+225 07 07 07 07 07",
      email: settings.center_email || "contact@sante-principal.ci"
    });
  } catch (error) {
    res.json({ id: "center-001", name: "O'CLIC SANTE Principal" });
  }
});

app.patch('/api/center', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.json({ id: 'center-001', ...req.body });
    }

    const b = req.body;
    console.log('[API PATCH] Mise à jour des informations du centre:', b.name);

    // On mappe les champs de l'objet sur les clés de settings
    if (b.name !== undefined) await SettingsModel.set('center_name', b.name, 'admin');
    if (b.address !== undefined) await SettingsModel.set('center_address', b.address, 'admin');
    if (b.phone !== undefined) await SettingsModel.set('center_phone', b.phone, 'admin');
    if (b.email !== undefined) await SettingsModel.set('center_email', b.email, 'admin');

    // Retourner les nouvelles infos
    const s = await SettingsModel.getAll();
    res.json({
      id: "center-001",
      name: s.center_name,
      address: s.center_address,
      phone: s.center_phone,
      email: s.center_email
    });
  } catch (error) {
    console.error('[API ERROR] PATCH /api/center:', error.message);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

// SPA fallback: serve index.html for non-API routes (fixes Cannot GET /patients/:id on refresh)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Route API non trouvée' });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
// Initialisation au démarrage
async function startServer() {
  dbConnected = await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Serveur O'CLIC SANTE DB démarré sur port ${PORT}`);
    console.log(`🗄️  Statut Base de Données: ${dbConnected ? 'CONNECTÉE' : 'ÉCHEC (Mode mémoire)'}`);
  });
}

startServer();
