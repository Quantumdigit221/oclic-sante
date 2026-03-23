// Serveur Monolithique O'CLIC SANTE - Version Base de Données
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dns from 'dns';
import crypto from 'crypto';

// Force Node.js > 17 to resolve 'localhost' to IPv4 (127.0.0.1) instead of IPv6 (::1)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignorer si l'option n'est pas supportée par la version de Node.js
}
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
  CenterModel,
  SalesModel,
  query,
  getDbErrorLog
} from './database.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

const isProd = process.env.NODE_ENV === 'production';
const envJwt = process.env.JWT_SECRET || '';
/** Secret JWT : jamais process.exit — évite 503 Render si variable manquante (génération éphémère au redémarrage). */
let JWT_SECRET;
if (envJwt.length >= 32) {
  JWT_SECRET = envJwt;
} else if (!isProd) {
  JWT_SECRET = envJwt || 'dev-jwt-secret-min-32-chars________';
} else {
  JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn(
    '[JWT] JWT_SECRET absent ou < 32 caractères en production. Secret généré pour ce démarrage uniquement. ' +
      'Définissez JWT_SECRET (≥32 caractères) sur l\'hébergeur pour des sessions stables après redémarrage.'
  );
}
const PORT = process.env.PORT || 3000;
const TENANT_HEADER = (process.env.TENANT_HEADER || 'x-tenant-id').toLowerCase();
const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || 'center-001';
const ALLOW_SUPERADMIN_CROSS_TENANT = process.env.ALLOW_SUPERADMIN_CROSS_TENANT === 'true';
const REQUEST_LOGS_ENABLED = process.env.REQUEST_LOGS_ENABLED === 'true' || !isProd;
const API_CACHE_TTL_MS = Number(process.env.API_CACHE_TTL_MS || 5000);

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token manquant', code: 'AUTH_REQUIRED' });
    }
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré', code: 'AUTH_INVALID' });
  }
}

function normalizeTenantId(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function resolveTenant(req, res, next) {
  const tokenTenant = normalizeTenantId(
    req.user?.tenantId || req.user?.centerId || req.user?.center_id
  );
  const headerTenant = normalizeTenantId(req.headers[TENANT_HEADER]);
  const requestTenant = tokenTenant || headerTenant || DEFAULT_TENANT_ID;

  if (!requestTenant) {
    return res.status(400).json({ error: 'Tenant manquant', code: 'TENANT_REQUIRED' });
  }

  const isSuperAdmin = String(req.user?.role || '').toUpperCase() === 'SUPER_ADMIN';
  const crossTenantAllowed = isSuperAdmin && ALLOW_SUPERADMIN_CROSS_TENANT;
  if (tokenTenant && headerTenant && tokenTenant !== headerTenant && !crossTenantAllowed) {
    return res.status(403).json({ error: 'Conflit de tenant', code: 'TENANT_MISMATCH' });
  }

  req.tenantId = crossTenantAllowed && headerTenant ? headerTenant : requestTenant;
  return next();
}

function requireSuperAdmin(req, res, next) {
  const role = String(req.user?.role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Accès réservé au super admin', code: 'SUPER_ADMIN_REQUIRED' });
  }
  return next();
}

const apiResponseCache = new Map();
function buildCacheKey(req, key) {
  const tenantPart = req.tenantId || 'public';
  return `${tenantPart}:${key}`;
}
function getCachedValue(key) {
  const cached = apiResponseCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    apiResponseCache.delete(key);
    return null;
  }
  return cached.value;
}
function setCachedValue(key, value, ttlMs = API_CACHE_TTL_MS) {
  apiResponseCache.set(key, {
    value,
    expiresAt: Date.now() + Math.max(0, ttlMs)
  });
}
function invalidateTenantCache(tenantId) {
  if (!tenantId) return;
  const prefix = `${tenantId}:`;
  for (const key of apiResponseCache.keys()) {
    if (key.startsWith(prefix)) apiResponseCache.delete(key);
  }
}
async function sendCachedJson(req, res, key, producer, ttlMs = API_CACHE_TTL_MS) {
  if (ttlMs <= 0) {
    const fresh = await producer();
    return res.json(fresh);
  }
  const cacheKey = buildCacheKey(req, key);
  const hit = getCachedValue(cacheKey);
  if (hit !== null) return res.json(hit);
  const fresh = await producer();
  setCachedValue(cacheKey, fresh, ttlMs);
  return res.json(fresh);
}

const app = express();
let dbConnected = false;

// Route de diagnostic (JWT requis — ne pas exposer les données sans session)
app.get('/debug-db', authenticateToken, async (req, res) => {
  try {
    const errorLog = getDbErrorLog();
    let dbStatus = 'UNKNOWN';
    let dbDetails = {};
    
    if (dbConnected) {
      dbStatus = 'CONNECTED';
      // TEST D'ÉCRITURE REEL
      const testId = 'test-' + Date.now();
      await query("INSERT INTO patients (id, name, firstName) VALUES (?, 'DIAGNOSTIC PROBE', 'TEST')", [testId]);
      const [verify] = await query("SELECT * FROM patients WHERE id = ?", [testId]);
      const dbName = (await query('SELECT DATABASE() as db'))[0].db;
      const dbUser = (await query('SELECT USER() as user'))[0].user;
      
      const lastPatients = await query("SELECT name, created_at FROM patients ORDER BY created_at DESC LIMIT 5");
      const lastMeds = await query("SELECT name, generic_name, stock_quantity, created_at FROM medicines ORDER BY created_at DESC LIMIT 5");

      dbDetails = {
        verifyWriteSuccess: !!verify,
        insertedId: testId,
        database: dbName,
        user: dbUser,
        now: new Date().toISOString()
      };
      
      res.header('Content-Type', 'text/html');
      res.send(`
        <html>
          <head><title>O'CLIC SANTE - DB DEBUG</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6} pre{background:#f4f4f4;padding:15px;border-radius:5px} .status-connected{color:green;font-weight:bold} .status-error{color:red;font-weight:bold} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#eee}</style></head>
          <body>
            <h1>🔧 Diagnostic complet de la Base de Données</h1>
            <p>Statut: <span class="${dbStatus === 'CONNECTED' ? 'status-connected' : 'status-error'}">${dbStatus}</span></p>
            
            <h3>📝 Log d'Erreurs</h3>
            <pre>${errorLog || 'Aucune erreur consignée.'}</pre>
  
            <h3>📋 Derniers Patients (Base de données)</h3>
            <table>
              <tr><th>Nom</th><th>Date Création</th></tr>
              ${lastPatients.map(p => `<tr><td>${p.name}</td><td>${p.created_at}</td></tr>`).join('') || '<tr><td colspan="2">Aucun patient</td></tr>'}
            </table>

            <h3>💊 Derniers Médicaments (Base de données)</h3>
            <table>
              <tr><th>Nom</th><th>Générique</th><th>Stock</th><th>Création</th></tr>
              ${lastMeds.map(m => `<tr><td>${m.name}</td><td>${m.generic_name}</td><td>${m.stock_quantity}</td><td>${m.created_at}</td></tr>`).join('') || '<tr><td colspan="4">Aucun médicament</td></tr>'}
            </table>

            <h3>📂 Détails Techniques</h3>
            <pre>${JSON.stringify(dbDetails, null, 2)}</pre>
            
            <hr>
            <button onclick="window.location.reload()">🔄 Rafraîchir les données</button>
          </body>
        </html>
      `);
      return;
    } else {
      dbStatus = 'DISCONNECTED / MEMORY MODE';
    }

    res.header('Content-Type', 'text/html');
    res.send(`
      <html>
        <head><title>O'CLIC SANTE - DB DEBUG (FAIL)</title></head>
        <body>
          <h1 style="color:red">❌ BASE DE DONNÉES DÉCONNECTÉE</h1>
          <pre>${errorLog}</pre>
          <button onclick="window.location.reload()">Réessayer</button>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`Erreur de diagnostic: ${err.message}`);
  }
});

// Middleware — FRONTEND_URL et EXTRA_CORS_ORIGINS (séparés par des virgules) pour les domaines Hostinger / custom
const extraCorsOrigins = (process.env.EXTRA_CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3004',
  'http://localhost:5173',
  'https://sante.quantum221.com',
  'https://santesaas.samacaisse.cloud',
  'https://samacaisse.cloud',
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL,
  ...extraCorsOrigins
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('.render.com') || origin.includes('.hostingersite.com')) {
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
  if (REQUEST_LOGS_ENABLED) {
    console.log(`[REQ] ${req.method} ${req.url}`);
  }
  next();
});

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../public')));

const adminUser = {
  id: 'admin-001',
  name: 'Administrateur O\'CLIC SANTE',
  email: 'admin@sante.quantum221.com',
  role: 'SUPER_ADMIN',
  password: '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO'
};

// === API ROUTES ===

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const requestedTenant = normalizeTenantId(
      req.body?.tenantId || req.body?.centerId || req.headers[TENANT_HEADER] || DEFAULT_TENANT_ID
    );
    if (!requestedTenant) {
      return res.status(400).json({ success: false, message: 'Tenant requis' });
    }
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
        const userTenant = normalizeTenantId(
          user.tenant_id || user.tenantId || user.center_id || user.centerId || requestedTenant
        );
        const isSuperAdmin = String(user.role || '').toUpperCase() === 'SUPER_ADMIN';
        if (!isSuperAdmin && userTenant && requestedTenant !== userTenant) {
          return res.status(403).json({ success: false, message: 'Tenant invalide pour cet utilisateur' });
        }
        const effectiveTenant = isSuperAdmin && ALLOW_SUPERADMIN_CROSS_TENANT ? requestedTenant : (userTenant || requestedTenant);
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role, name: user.name, tenantId: effectiveTenant, centerId: effectiveTenant },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: effectiveTenant, centerId: effectiveTenant }
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

// Vérification du JWT (route publique : le client envoie le token dans Authorization)
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ valid: false, message: 'Token manquant' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch {
    return res.status(401).json({ valid: false, message: 'Token invalide ou expiré' });
  }
});

// Toutes les autres routes /api/* exigent un Bearer token (sauf login, health, verify ci-dessus)
app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  const p = req.path.replace(/\/$/, '') || '/';
  if (req.method === 'POST' && p === '/login') return next();
  if (req.method === 'GET' && p === '/health') return next();
  if (req.method === 'GET' && p === '/auth/verify') return next();
  return authenticateToken(req, res, next);
});
app.use('/api', resolveTenant);

// Stats (Real DB Stats)
app.get('/api/stats', async (req, res) => {
  try {
    return sendCachedJson(req, res, 'stats', async () => {
      let patientsToday = 0;
      let revenueToday = 0;
      let waitingRoom = 0;
      let criticalStock = 0;

      if (dbConnected) {
        try {
          const statsPatients = await query("SELECT COUNT(*) as count FROM tickets WHERE DATE(createdAt) = CURDATE()");
          patientsToday = statsPatients[0].count;
          const statsRevenue = await query("SELECT SUM(amount) as total FROM tickets WHERE DATE(createdAt) = CURDATE()");
          revenueToday = statsRevenue[0].total || 0;
          const statsWaiting = await query("SELECT COUNT(*) as count FROM tickets WHERE status = 'WAITING'");
          waitingRoom = statsWaiting[0].count;
          const statsStock = await query("SELECT COUNT(*) as count FROM medicines WHERE stock <= minStock");
          criticalStock = statsStock[0].count;
        } catch (err) {
          console.error('[STATS ERROR]:', err.message);
        }
      }

      return {
        dailyPatients: { value: patientsToday, change: '+5%' },
        dailyRevenue: { value: revenueToday, change: '+12%' },
        waitingRoom: { value: waitingRoom, change: 'Stable' },
        criticalStock: { value: criticalStock, change: 'Action requise' },
        total_patients_today: patientsToday,
        total_revenue_today: revenueToday,
        waiting_today: waitingRoom,
        stock_alert: criticalStock
      };
    });
  } catch (error) {
    res.json({ dailyPatients: { value: 0 }, dailyRevenue: { value: 0 }, waitingRoom: { value: 0 }, criticalStock: { value: 0 } });
  }
});

// Services
app.get('/api/services', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    return sendCachedJson(req, res, 'services', async () => {
      return await query('SELECT * FROM services ORDER BY createdAt DESC');
    });
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
    const isSuperAdmin = String(req.user?.role || '').toUpperCase() === 'SUPER_ADMIN';
    if (!dbConnected) return res.json([]);
    return sendCachedJson(req, res, `centers:${isSuperAdmin ? 'all' : 'active'}`, async () => {
      return await CenterModel.findAll(isSuperAdmin);
    });
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/centers', requireSuperAdmin, async (req, res) => {
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
      pispiAlias: req.body.pispiAlias,
      isActive: false
    };

    if (dbConnected) {
      const newCenter = await CenterModel.create(centerData);
      invalidateTenantCache(req.tenantId);
      res.json(newCenter);
    } else {
      res.json(centerData);
    }
  } catch (error) {
    console.error('Erreur create center:', error);
    res.status(500).json({ error: 'Erreur lors de la création du centre' });
  }
});

app.get('/api/centers/pending', requireSuperAdmin, async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    return sendCachedJson(req, res, 'centers:pending', async () => {
      return await query('SELECT * FROM centers WHERE is_active = 0 ORDER BY created_at DESC');
    });
  } catch (error) {
    console.error('[API ERROR] GET /api/centers/pending:', error.message);
    return res.status(500).json({ error: 'Erreur récupération centres en attente' });
  }
});

app.patch('/api/centers/:id/activation', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const activate = Boolean(req.body?.isActive);

    if (!dbConnected) {
      return res.json({ id, is_active: activate ? 1 : 0, activated_by: req.user?.id || null });
    }

    const center = await CenterModel.findById(id);
    if (!center) {
      return res.status(404).json({ error: 'Centre non trouvé' });
    }

    const updated = await CenterModel.setActivation(id, activate, req.user?.id || null);
    invalidateTenantCache(req.tenantId);
    return res.json(updated);
  } catch (error) {
    console.error('[API ERROR] PATCH /api/centers/:id/activation:', error.message);
    return res.status(500).json({ error: 'Erreur activation centre' });
  }
});

// Patients
app.get('/api/patients', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const patients = await PatientModel.findAll(req.tenantId);
    res.json(patients);
  } catch (error) {
    console.error('Erreur get patients:', error);
    res.json([]);
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    if (!dbConnected) return res.status(404).json({ error: 'DB non connectée' });
    const patient = await PatientModel.findById(req.params.id, req.tenantId);
    if (!patient) return res.status(404).json({ error: 'Patient non trouvé' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    console.log('[API] New Patient Request:', req.body);
    if (dbConnected) {
      const newPatient = await PatientModel.create({ ...req.body, centerId: req.tenantId, center_id: req.tenantId, tenantId: req.tenantId });
      res.json(newPatient);
    } else {
      res.status(503).json({ error: 'Service en mode lecture seule (DB déconnectée)' });
    }
  } catch (error) {
    console.error('Erreur create patient:', error);
    res.status(500).json({ error: 'Erreur lors de la création du patient', detail: error.message });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    if (dbConnected) {
      const updated = await PatientModel.update(req.params.id, req.body, req.tenantId);
      res.json(updated);
    } else {
      res.status(503).json({ error: 'Service en mode lecture seule' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// Services
app.get('/api/services', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const services = await ServiceModel.findAll();
    res.json(services);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/services', async (req, res) => {
  try {
    if (dbConnected) {
      const newService = await ServiceModel.create(req.body);
      res.json(newService);
    } else {
      res.status(503).json({ error: 'Lecture seule' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

// Medicines
app.get('/api/medicines', async (req, res) => {
  try {
    const medicines = dbConnected ? await MedicineModel.findAll() : [];
    res.json(medicines);
  } catch (error) {
    console.error('[API] GET /api/medicines:', error.message);
    res.json([]);
  }
});

app.post('/api/medicines', async (req, res) => {
  try {
    if (dbConnected) {
      const newMed = await MedicineModel.create(req.body);
      res.json(newMed);
    } else {
      res.status(503).json({ error: 'Lecture seule' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

// Consultations
app.get('/api/consultations', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const filters = {
      patientId: req.query.patientId || req.query.patient_id,
      patientName: req.query.patientName || req.query.patient_name,
      doctorId: req.query.doctorId || req.query.doctor_id,
      date: req.query.date,
      centerId: req.tenantId
    };
    const consultations = await ConsultationModel.findAll(filters);
    res.json(consultations);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/consultations/:id', async (req, res) => {
  try {
    if (!dbConnected) return res.status(404).json({ error: 'DB non connectée' });
    const cons = await ConsultationModel.findById(req.params.id, req.tenantId);
    if (!cons) return res.status(404).json({ error: 'Non trouvé' });
    res.json(cons);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

app.post('/api/consultations', async (req, res) => {
  try {
    if (dbConnected) {
      const data = { ...req.body, id: req.body.id || `c-${Date.now()}`, centerId: req.tenantId, center_id: req.tenantId, tenantId: req.tenantId };
      const newCons = await ConsultationModel.create(data);
      res.json(newCons);
    } else {
      res.status(503).json({ error: 'Lecture seule' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur création consultation', detail: error.message });
  }
});

// Lab Results
app.get('/api/lab-results', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const labs = await LabResultModel.findAll({ ...(req.query || {}), centerId: req.tenantId });
    res.json(labs);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/lab-results', async (req, res) => {
  try {
    if (dbConnected) {
      const newLab = await LabResultModel.create({ ...req.body, centerId: req.tenantId, center_id: req.tenantId, tenantId: req.tenantId });
      invalidateTenantCache(req.tenantId);
      res.json(newLab);
    } else {
      res.status(503).json({ error: 'Lecture seule' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur', detail: error.message });
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
    const results = await TicketModel.findAll(req.tenantId);
    
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
    const ticket = await TicketModel.findById(req.params.id, req.tenantId);
    if (!ticket) return res.status(404).json({ error: 'Ticket non trouvé' });
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
      centerId: req.tenantId,
      center_id: req.tenantId,
      tenantId: req.tenantId,
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
    const detail = error?.message || 'Erreur inconnue';
    res.status(500).json({ error: 'Erreur lors de la création du ticket', detail });
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
    const filters = { ...(req.query || {}), centerId: req.tenantId };
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
      notes: b.notes,
      centerId: req.tenantId,
      center_id: req.tenantId,
      tenantId: req.tenantId
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
    const updated = await LabResultModel.update(id, req.body, req.tenantId);
    res.json(updated);
  } catch (error) {
    console.error('[lab-results PATCH]:', error.message);
    res.status(500).json({ error: 'Erreur mise à jour résultat' });
  }
});

// Sales
app.get('/api/sales', async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    return sendCachedJson(req, res, 'sales', async () => {
      return await SalesModel.findAll(req.tenantId);
    });
  } catch (error) {
    console.error('[API] GET /api/sales:', error.message);
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
      status: 'PAID',
      center_id: req.tenantId
    };

    if (!dbConnected) {
      console.log('Mode mémoire: Vente créée:', saleId);
      return res.json({ ...saleData, items, paymentMethod: b.paymentMethod, createdAt: new Date().toISOString() });
    }

    try {
      await query(
        `INSERT INTO sales (id, patient_name, quantity, unit_price, total, status, center_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [saleData.id, saleData.patient_name, saleData.quantity, saleData.unit_price, saleData.total, saleData.status, saleData.center_id]
      );
      const rows = await query('SELECT * FROM sales WHERE id = ?', [saleId]);
      invalidateTenantCache(req.tenantId);
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

    let filters = { ...(req.query || {}), centerId: req.tenantId };

    // If we filter by patientId, also resolve patientName as a fallback key.
    if (dbConnected && filters.patientId) {
      const patientRows = await query(
        'SELECT id, name FROM patients WHERE id = ? AND (center_id = ? OR centerId = ?) LIMIT 1',
        [filters.patientId, req.tenantId, req.tenantId]
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
        const byId = await query(
          'SELECT id, name, phone, phoneNumber FROM patients WHERE id = ? AND (center_id = ? OR centerId = ?) LIMIT 1',
          [resolvedPatientId, req.tenantId, req.tenantId]
        );
        patientRow = byId && byId[0] ? byId[0] : null;
      }

      if (!patientRow) {
        const ticketId = req.body.ticketId || req.body.ticket_id;
        let ticketRow = null;
        if (ticketId) {
          const rows = await query(
            'SELECT patientName, patientPhone FROM tickets WHERE id = ? AND center_id = ? LIMIT 1',
            [ticketId, req.tenantId]
          );
          ticketRow = rows && rows[0] ? rows[0] : null;
        }

        const candidateName = resolvedPatientName || ticketRow?.patientName || null;
        const candidatePhone = ticketRow?.patientPhone || null;

        if (candidatePhone) {
          const byPhone = await query(
            'SELECT id, name, phone, phoneNumber FROM patients WHERE (phone = ? OR phoneNumber = ?) AND (center_id = ? OR centerId = ?) ORDER BY createdAt DESC LIMIT 1',
            [candidatePhone, candidatePhone, req.tenantId, req.tenantId]
          );
          patientRow = byPhone && byPhone[0] ? byPhone[0] : null;
        }

        if (!patientRow && candidateName) {
          const byName = await query(
            'SELECT id, name, phone, phoneNumber FROM patients WHERE name = ? AND (center_id = ? OR centerId = ?) ORDER BY createdAt DESC LIMIT 1',
            [candidateName, req.tenantId, req.tenantId]
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
      centerId: req.tenantId,
      center_id: req.tenantId,
      tenantId: req.tenantId
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
    return sendCachedJson(req, res, 'center', async () => {
      const settings = dbConnected ? await SettingsModel.getAll() : {};
      const k = (name) => `${req.tenantId}__${name}`;
      return {
        id: req.tenantId,
        name: settings[k('center_name')] || settings.center_name || "O'CLIC SANTE Principal",
        address: settings[k('center_address')] || settings.center_address || "Abidjan, Côte d'Ivoire",
        phone: settings[k('center_phone')] || settings.center_phone || "+225 07 07 07 07 07",
        email: settings[k('center_email')] || settings.center_email || "contact@sante-principal.ci"
      };
    });
  } catch (error) {
    res.json({ id: req.tenantId, name: "O'CLIC SANTE Principal" });
  }
});

app.patch('/api/center', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.json({ id: req.tenantId, ...req.body });
    }

    const b = req.body;
    console.log('[API PATCH] Mise à jour des informations du centre:', b.name);
    const k = (name) => `${req.tenantId}__${name}`;

    // On mappe les champs de l'objet sur les clés de settings
    if (b.name !== undefined) await SettingsModel.set(k('center_name'), b.name, 'admin');
    if (b.address !== undefined) await SettingsModel.set(k('center_address'), b.address, 'admin');
    if (b.phone !== undefined) await SettingsModel.set(k('center_phone'), b.phone, 'admin');
    if (b.email !== undefined) await SettingsModel.set(k('center_email'), b.email, 'admin');
    invalidateTenantCache(req.tenantId);

    // Retourner les nouvelles infos
    const s = await SettingsModel.getAll();
    res.json({
      id: req.tenantId,
      name: s[k('center_name')] || s.center_name,
      address: s[k('center_address')] || s.center_address,
      phone: s[k('center_phone')] || s.center_phone,
      email: s[k('center_email')] || s.center_email
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
  // Écoute sur toutes les interfaces (requis Render / Docker / PaaS) — évite 503 si bind localhost seul
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur O'CLIC SANTE démarré sur 0.0.0.0:${PORT}`);
  });

  // DB init en arrière-plan : ne bloque PAS le démarrage du serveur
  initializeDatabase().then(success => {
    dbConnected = success;
    console.log(`🗄️  Statut Base de Données: ${dbConnected ? 'CONNECTÉE' : 'ÉCHEC (Mode mémoire)'}`);
  }).catch(e => {
    dbConnected = false;
    console.error('⚠️ DB Init Crash en arrière-plan:', e.message);
  });
}

startServer();

