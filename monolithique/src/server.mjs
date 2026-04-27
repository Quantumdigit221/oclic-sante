// Serveur Monolithique O'CLIC SANTE - Version Base de Données
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dns from 'dns';
import crypto from 'crypto';

// ESM: Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '..');
const publicPath = path.resolve(rootPath, 'public');

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
  AppointmentModel,
  ExamCategoryModel,
  InsuranceCompanyModel,
  PatientInsuranceModel,
  InsuranceTransactionModel,
  query,
  getDbErrorLog
} from './database.mjs';
import { sendSms, buildConfirmationMessage, buildReminderMessage } from './sms-service.mjs';


// Charger les variables d'environnement (plus robuste sur Hostinger)
dotenv.config(); 

const PORT = process.env.PORT || 3000;
const app = express();

// --- DÉMARRAGE ULTRA-PRÉCOCE (Mode Robustesse Hostinger) ---
// On écoute SANS spécifier d'adresse (0.0.0.0 ou 127.0.0.1)
// Car Passenger/Hostinger gère lui-même le binding socket/port.
app.listen(PORT, () => {
    console.log(`🚀 MONOLITH: Ready & Listening on port ${PORT}`);
});

// Endpoint de santé immédiat
app.get('/api/health-check', (req, res) => res.json({ status: 'live', node: process.version, time: new Date().toISOString() }));

const isProd = process.env.NODE_ENV === 'production';
const DEFAULT_JWT_SECRET = '9f7b3d2e1c4a8b6f5d0e7a9c2b1d4f6e8a3c5b7d9e1f2a4c6b8d0e3f5a7c9b1';
const LEGACY_SECRETS = [
  'o_clic_sante_jwt_secret_very_long_and_secure_2024_quantum221_com',
  'o_clic_sante_jwt_secret_very_long_and_secure_2024'
];
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
console.log(`[JWT] System Initialized.`);



const TENANT_HEADER = (process.env.TENANT_HEADER || 'x-tenant-id').toLowerCase();
const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || 'center-001';
const ALLOW_SUPERADMIN_CROSS_TENANT = true;
const REQUEST_LOGS_ENABLED = true; // Forcer les logs pour le debug
const API_CACHE_TTL_MS = Number(process.env.API_CACHE_TTL_MS || 5000);
const SUPERADMIN_TENANT_SCOPE = '*';

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    // --- ACCÈS PRIORITAIRE LOCAL (Mode DEV) ---
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    
    if (!token) {
        if (isLocal) {
            console.log('🛡️ AUTH: Accès local sans token autorisé (Super Admin par défaut)');
            req.user = { id: 'admin-001', role: 'SUPER_ADMIN', centerId: 'center-001', tenantId: 'center-001' };
            return next();
        }
        if (REQUEST_LOGS_ENABLED) console.warn('[JWT-AUTH] Missing token');
        return res.status(401).json({ error: 'Token manquant', code: 'AUTH_REQUIRED' });
    }
    
    // Try primary secret first
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (verifyErr) {
      // Try legacy secrets for backward compatibility
      let verified = false;
      for (const legacySecret of LEGACY_SECRETS) {
        try {
          req.user = jwt.verify(token, legacySecret);
          if (REQUEST_LOGS_ENABLED) console.log(`[JWT-AUTH] Verified using legacy secret: ${legacySecret.substring(0, 5)}...`);
          verified = true;
          break;
        } catch (_) { /* continue */ }
      }
      
      if (!verified) {
          // Si échec total MAIS en local : on laisse passer avec un log
          if (isLocal) {
              console.warn('🛡️ AUTH: Token invalide en local, accès maintenu pour tests');
              req.user = { id: 'admin-001', role: 'SUPER_ADMIN', centerId: 'center-001', tenantId: 'center-001' };
              return next();
          }
          throw verifyErr;
      }
    }
    next();
  } catch (error) {
    console.error(`[JWT-AUTH] Verification failed: ${error.name} - ${error.message}`);
    return res.status(401).json({ error: 'Token invalide ou expiré', code: 'AUTH_INVALID', details: error.message });
  }
}

function normalizeTenantId(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function getRequestedTenant(req) {
  return normalizeTenantId(
    req.headers[TENANT_HEADER]
      || req.headers['x-center-id']
      || req.headers['x-centerid']
      || req.query?.tenantId
      || req.query?.centerId
      || req.body?.tenantId
      || req.body?.centerId
  );
}

function resolveTenant(req, res, next) {
  const tokenTenant = normalizeTenantId(
    req.user?.tenantId || req.user?.centerId || req.user?.center_id
  );
  const requestedTenant = getRequestedTenant(req);

  const userRole = String(req.user?.role || '').toUpperCase();
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isAdmin = userRole === 'ADMIN' || isSuperAdmin;

  // Super admins can access any tenant
  if (isSuperAdmin) {
    req.tenantId = requestedTenant || tokenTenant || DEFAULT_TENANT_ID;
    return next();
  }

  // Normalize tenant IDs: 'center-1' and 'center-001' are equivalent
  function normalizeCenterId(id) {
    if (!id) return '';
    const str = String(id).trim().toLowerCase();
    // Normalize legacy 'center-1' to 'center-001'
    return str.replace(/^center-0*(\d+)$/, (_, n) => 'center-' + String(n).padStart(3, '0'));
  }

  const normalizedToken = normalizeCenterId(tokenTenant);
  const normalizedRequested = normalizeCenterId(requestedTenant);

  // Admins get bypass if both token and request are in the same center family
  if (isAdmin && normalizedToken && normalizedRequested && normalizedToken !== normalizedRequested) {
    // For admins, log the mismatch but don't block - use token's tenant
    if (REQUEST_LOGS_ENABLED) console.warn(`[TENANT] Admin mismatch: token=${normalizedToken}, req=${normalizedRequested}. Using token tenant.`);
    req.tenantId = normalizedToken;
    return next();
  }

  const requestTenant = normalizedToken || normalizedRequested || DEFAULT_TENANT_ID;
  if (!requestTenant) return res.status(400).json({ error: 'Tenant manquant', code: 'TENANT_REQUIRED' });

  req.tenantId = requestTenant;
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

let dbConnected = false;
let dbInitStatus = 'pending'; // pending | success | error
let dbInitStartedAt = new Date().toISOString();
let dbInitFinishedAt = null;

app.get('/api/ping', (req, res) => res.status(200).send('PONG'));
app.get('/api/db-status', (req, res) => res.json({ connected: dbConnected, status: dbInitStatus, started: dbInitStartedAt, finished: dbInitFinishedAt }));

const memoryStoreByTenant = new Map();

function getMemoryTenantStore(tenantId) {
  const key = normalizeTenantId(tenantId) || DEFAULT_TENANT_ID;
  if (!memoryStoreByTenant.has(key)) {
    memoryStoreByTenant.set(key, {
      services: [],
      patients: [],
      medicines: [],
      tickets: [],
      consultations: [],
      labResults: [],
      sales: []
    });
  }
  return memoryStoreByTenant.get(key);
}

function upsertMemoryRecord(list, record) {
  const idx = list.findIndex((x) => String(x.id) === String(record.id));
  if (idx >= 0) list[idx] = { ...list[idx], ...record };
  else list.push(record);
  return record;
}

function sortByCreatedAtDesc(list) {
  return [...list].sort((a, b) => {
    const aDate = new Date(a.createdAt || a.created_at || 0).getTime();
    const bDate = new Date(b.createdAt || b.created_at || 0).getTime();
    return bDate - aDate;
  });
}

function normalizeTicketStatus(value) {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw) return 'WAITING';
  if (['WAITING', 'PENDING', 'EN_ATTENTE', 'EN ATTENTE', 'EN_ATTENTES', 'EN ATTENTES', 'QUEUE', 'QUEUED', 'ATTENTE'].includes(raw)) return 'WAITING';
  if (['IN_PROGRESS', 'INPROGRESS', 'EN_COURS', 'EN COURS', 'ONGOING', 'EN_PROGRESSION', 'EN PROGRESSION', 'PROGRESSION'].includes(raw)) return 'IN_PROGRESS';
  if (['COMPLETED', 'DONE', 'TERMINE', 'TERMINÉ', 'FINISHED', 'COMPLÉTÉ', 'COMPLETE'].includes(raw)) return 'COMPLETED';
  if (['CANCELLED', 'CANCELED', 'ANNULE', 'ANNULÉ', 'CANCEL'].includes(raw)) return 'CANCELLED';
  if (['REJECTED', 'REFUSE', 'REFUSÉ', 'REJETÉ', 'REJECTED_BY_DOCTOR', 'REFUS'].includes(raw)) return 'REJECTED';
  return raw;
}

// Route de diagnostic (JWT requis — ne pas exposer les données sans session)
app.get('/debug-db', authenticateToken, async (req, res) => {
  try {
    const errorLog = getDbErrorLog();
    let dbStatus = 'UNKNOWN';
    let dbDetails = {};
    
    if (dbConnected) {
      dbStatus = 'CONNECTED';
      // TEST D'ÉCRITURE REEL (nettoyage immédiat pour ne pas polluer la DB)
      const testId = 'test-' + Date.now();
      await query("INSERT INTO patients (id, name, firstName) VALUES (?, 'DIAGNOSTIC PROBE', 'TEST')", [testId]);
      const [verify] = await query("SELECT * FROM patients WHERE id = ?", [testId]);
      await query('DELETE FROM patients WHERE id = ?', [testId]);
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

app.use(express.json({ limit: '50mb' }));

// --- SERVING STATIC FILES ---
// Ensure static files in 'public' are served correctly by Node.js
app.use(express.static(publicPath));
// Fallback for favicon.ico to favicon.svg if missing
app.get('/favicon.ico', (req, res) => {
    const icoPath = path.join(publicPath, 'favicon.ico');
    if (fs.existsSync(icoPath)) return res.sendFile(icoPath);
    const svgPath = path.join(publicPath, 'favicon.svg');
    if (fs.existsSync(svgPath)) return res.sendFile(svgPath);
    res.status(404).end();
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  if (REQUEST_LOGS_ENABLED) {
    console.log(`[REQ] ${req.method} ${req.url}`);
  }
  next();
});

// Servir les fichiers statiques du frontend (Double sécurité)
app.use(express.static(publicPath));

const adminUser = {
  id: 'admin-001',
  name: 'Administrateur O\'CLIC SANTE',
  email: 'admin@sante.quantum221.com',
  role: 'SUPER_ADMIN',
  password: '$2b$10$Fg161CmvQJKaORqu1ULWuu17DbniAbG.IixdxXylnCujqosYPQ4su' // Correspond à 'admin123'
};

// === API ROUTES ===

// =============================================
// AFRICA'S TALKING — SMS WEBHOOK CALLBACKS
// À configurer dans le dashboard AT :
//   SMS → SMS Callback URLs → Delivery Reports
//   SMS → SMS Callback URLs → Incoming Messages
//   SMS → SMS Callback URLs → Bulk SMS Opt Out
//   SMS → SMS Callback URLs → Subscription Notifications
//
// URL à renseigner : https://santesaas.samacaisse.cloud/api/sms/delivery-report
//                   https://santesaas.samacaisse.cloud/api/sms/incoming
//                   https://santesaas.samacaisse.cloud/api/sms/opt-out
//                   https://santesaas.samacaisse.cloud/api/sms/subscription
// =============================================

// 1. Delivery Reports — Confirmation/Rejet de livraison
app.post('/api/sms/delivery-report', async (req, res) => {
  try {
    const { id, status, phoneNumber, networkCode, failureReason, retryCount } = req.body;
    console.log(`[AT-DELIVERY] ID:${id} → ${phoneNumber} | status:${status}${failureReason ? ' | raison:' + failureReason : ''}`);

    const isFinal = ['Success', 'Rejected', 'Failed'].includes(status);
    const isSuccess = status === 'Success';

    // Mettre à jour le statut SMS dans la table appointments si possible
    if (dbConnected && id) {
      try {
        // Rechercher le rendez-vous lié à ce messageId AT
        const appts = await query('SELECT id FROM appointments WHERE sms_message_id = ? LIMIT 1', [id]);
        if (appts.length > 0) {
          await query('UPDATE appointments SET sms_delivery_status = ?, sms_updated_at = NOW() WHERE id = ?',
            [status, appts[0].id]);
          console.log(`[AT-DELIVERY] ✅ RDV ${appts[0].id} mis à jour → ${status}`);
        }
      } catch (dbErr) {
        // La colonne sms_message_id peut ne pas exister encore — non bloquant
      }
    }

    // Log structuré
    console.log(`[AT-DELIVERY] ${isSuccess ? '✅ LIVRÉ' : isFinal ? '❌ FINAL:' + status : '⏳ ' + status} → ${phoneNumber} (réseau:${networkCode})${failureReason ? ' RAISON:' + failureReason : ''}${retryCount ? ' essais:' + retryCount : ''}`);

    // AT attend juste un 200 OK
    return res.status(200).send('OK');
  } catch (err) {
    console.error('[AT-DELIVERY] Erreur webhook:', err.message);
    return res.status(200).send('OK'); // Toujours 200 pour éviter les retries AT
  }
});

// 2. Incoming Messages — Messages reçus (réponses patients)
app.post('/api/sms/incoming', async (req, res) => {
  try {
    const { date, from, id, linkId, text, to, cost, networkCode } = req.body;
    console.log(`[AT-INCOMING] De:${from} → À:${to} | "${text}" | date:${date} | coût:${cost}`);

    // Tenter d'associer l'expéditeur à un patient ou RDV
    if (dbConnected && from) {
      const phoneNorm = from.replace(/^\+221/, '').replace(/\D/g, '');
      try {
        const patients = await query(
          'SELECT id, name FROM patients WHERE REPLACE(REPLACE(phone, "+221", ""), " ", "") = ? LIMIT 1',
          [phoneNorm]
        );
        if (patients.length > 0) {
          console.log(`[AT-INCOMING] Patient identifié : ${patients[0].name} (${patients[0].id})`);
        }
      } catch (_) {}
    }

    // Réponse auto possible ici (ex: confirmation RDV par SMS)
    // Pour l'instant : juste logging

    return res.status(200).send('OK');
  } catch (err) {
    console.error('[AT-INCOMING] Erreur webhook:', err.message);
    return res.status(200).send('OK');
  }
});

// 3. Bulk SMS Opt-Out — Patient se désinscrit
app.post('/api/sms/opt-out', async (req, res) => {
  try {
    const { senderId, phoneNumber } = req.body;
    console.log(`[AT-OPTOUT] ${phoneNumber} s'est désinscrit du sender ID: ${senderId}`);

    // Marquer le patient comme "no SMS" dans la DB
    if (dbConnected && phoneNumber) {
      const phoneNorm = phoneNumber.replace(/^\+221/, '').replace(/\D/g, '');
      try {
        await query(
          'UPDATE patients SET sms_opt_out = 1 WHERE REPLACE(REPLACE(phone, "+221", ""), " ", "") = ?',
          [phoneNorm]
        );
        // Idem pour les rendez-vous futurs
        await query(
          'UPDATE appointments SET sms_opt_out = 1 WHERE REPLACE(REPLACE(patient_phone, "+221", ""), " ", "") = ?',
          [phoneNorm]
        );
        console.log(`[AT-OPTOUT] ✅ Patient ${phoneNumber} marqué NO-SMS dans la DB`);
      } catch (_) {}
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('[AT-OPTOUT] Erreur webhook:', err.message);
    return res.status(200).send('OK');
  }
});

// 4. Subscription Notifications — Abonnements premium SMS
app.post('/api/sms/subscription', async (req, res) => {
  try {
    const { phoneNumber, shortCode, keyword, updateType } = req.body;
    const action = updateType === 'addition' ? '✅ ABONNÉ' : '❌ DÉSABONNÉ';
    console.log(`[AT-SUBSCRIPTION] ${action} | ${phoneNumber} | shortcode:${shortCode} | keyword:${keyword}`);
    return res.status(200).send('OK');
  } catch (err) {
    console.error('[AT-SUBSCRIPTION] Erreur webhook:', err.message);
    return res.status(200).send('OK');
  }
});

// Route info — liste les URLs de callback à configurer dans l'AT dashboard
app.get('/api/sms/webhook-info', authenticateToken, async (req, res) => {
  const base = process.env.APP_URL || `http://localhost:${PORT}`;
  return res.json({
    provider: 'Africa\'s Talking',
    callbackUrls: {
      deliveryReport:       `${base}/api/sms/delivery-report`,
      incomingMessages:     `${base}/api/sms/incoming`,
      bulkSmsOptOut:        `${base}/api/sms/opt-out`,
      subscriptionNotif:    `${base}/api/sms/subscription`
    },
    dashboardPath: 'SMS → SMS Callback URLs',
    note: 'Configurer ces URLs dans le tableau de bord Africa\'s Talking sous "SMS → SMS Callback URLs"'
  });
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const requestedTenant = getRequestedTenant(req) || DEFAULT_TENANT_ID;
    if (!requestedTenant) {
      return res.status(400).json({ success: false, message: 'Tenant requis' });
    }
    let user = null;

    if (dbConnected) {
      const users = await UserModel.findByEmail(email);
      user = users.length > 0 ? users[0] : null;
      
      // Fallback to hardcoded admin if exact match and DB doesn't have it yet
      if (!user && email === adminUser.email) {
        user = adminUser;
      }
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
        // Relax check: If requestedTenant is the default, allow login to the user's specific tenant
        if (!isSuperAdmin && requestedTenant !== DEFAULT_TENANT_ID && userTenant && requestedTenant !== userTenant) {
          return res.status(403).json({ success: false, message: 'Tenant invalide pour cet utilisateur' });
        }
        const effectiveTenant = isSuperAdmin ? SUPERADMIN_TENANT_SCOPE : (userTenant || requestedTenant);
        const activeTenant = isSuperAdmin ? requestedTenant : (userTenant || requestedTenant);
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role, name: user.name, tenantId: effectiveTenant, centerId: effectiveTenant },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        console.log(`[LOGIN] ✅ Succès pour ${email} (Tenant: ${effectiveTenant})`);
        return res.json({
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: effectiveTenant,
            centerId: effectiveTenant,
            activeTenantId: activeTenant,
            canSwitchTenant: isSuperAdmin
          }
        });
      } else {
        console.warn(`[LOGIN] ❌ Echec mot de passe pour ${email}`);
      }
    } else {
      console.warn(`[LOGIN] ❌ Utilisateur inconnu: ${email}`);
    }
    return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Santé / Monitoring DB Hostinger
app.get('/api/health', (req, res) => {
  const rawDbError = getDbErrorLog();
  const dbError = dbInitStatus === 'pending'
    ? 'Initialisation DB en cours...'
    : (rawDbError || null);
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    db: {
      connected: !!dbConnected,
      lastError: dbError || 'Aucune erreur detectee',
      initStatus: dbInitStatus
    },
    jwt_diagnostic: {
      secret_length: JWT_SECRET?.length || 0,
      prefix: JWT_SECRET ? (JWT_SECRET.substring(0, 4) + '...') : 'missing',
      algorithm: 'HS256'
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
// resolveTenant: exclure les routes publiques (login, health, auth/verify)
app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  const p = req.path.replace(/\/$/, '') || '/';
  if (req.method === 'POST' && p === '/login') return next();
  if (req.method === 'GET' && p === '/health') return next();
  if (req.method === 'GET' && p === '/auth/verify') return next();
  return resolveTenant(req, res, next);
});

// Stats (Real DB Stats)
app.get('/api/stats', async (req, res) => {
  try {
    return sendCachedJson(req, res, 'stats', async () => {
      let patientsToday = 0;
      let revenueToday = 0;
      let waitingRoom = 0;
      let criticalStock = 0;

      if (dbConnected) {
        // Requêtes stats avec try/catch individuel pour ne pas bloquer si une table est lente
        try {
          const r = await query("SELECT COUNT(*) as count FROM tickets WHERE DATE(created_at) = CURDATE()");
          patientsToday = r[0]?.count || 0;
        } catch (e) { console.error('[STATS] tickets count:', e.message); }
        try {
          const r = await query("SELECT SUM(amount) as total FROM tickets WHERE DATE(created_at) = CURDATE()");
          revenueToday = r[0]?.total || 0;
        } catch (e) { console.error('[STATS] revenue:', e.message); }
        try {
          const r = await query("SELECT COUNT(*) as count FROM tickets WHERE UPPER(status) IN ('WAITING','PENDING','EN_ATTENTE','QUEUE','QUEUED')");
          waitingRoom = r[0]?.count || 0;
        } catch (e) { console.error('[STATS] waiting:', e.message); }
        try {
          const r = await query("SELECT COUNT(*) as count FROM medicines WHERE stock_quantity <= min_stock_alert");
          criticalStock = r[0]?.count || 0;
        } catch (e) { console.error('[STATS] stock:', e.message); }
      } else {
        const store = getMemoryTenantStore(req.tenantId);
        patientsToday = store.tickets.length;
        revenueToday = store.tickets.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        waitingRoom = store.tickets.filter((t) => normalizeTicketStatus(t.status) === 'WAITING').length;
        criticalStock = store.medicines.filter((m) => (parseInt(m.stock_quantity || m.stock || 0, 10) <= parseInt(m.min_stock_alert || m.minStock || 10, 10))).length;
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
app.get('/api/services', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      return res.json(sortByCreatedAtDesc(store.services));
    }
    return sendCachedJson(req, res, 'services', async () => {
      return await ServiceModel.findAll(req.tenantId);
    });
  } catch (error) {
    console.error('[services GET]:', error.message);
    res.status(200).json([]);
  }
});

app.post('/api/services', authenticateToken, resolveTenant, async (req, res) => {
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
      centerId: req.tenantId,
      center_id: req.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      upsertMemoryRecord(store.services, serviceData);
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
    if (!dbConnected) {
      return res.json([]); // Mode mémoire = pas de centres en attente
    }
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
    invalidateTenantCache(id); // invalider le cache du centre activé
    return res.json(updated);
  } catch (error) {
    console.error('[API ERROR] PATCH /api/centers/:id/activation:', error.message);
    return res.status(500).json({ error: 'Erreur activation centre' });
  }
});

// Auto-enregistrement d'un nouveau centre (SaaS onboarding public)
// Un futur client peut s'inscrire lui-même → centre créé inactif en attente d'activation SUPER_ADMIN
app.post('/api/register-center', async (req, res) => {
  try {
    const { centerName, address, phone, email, directorName, rnis, adminName, adminEmail, adminPassword } = req.body;
    if (!centerName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'centerName, adminEmail et adminPassword sont obligatoires.' });
    }

    const centerId = `center-${Date.now()}`;

    if (!dbConnected) {
      return res.status(503).json({ error: 'Service temporairement indisponible. Réessayez dans quelques instants.' });
    }

    // Vérifier que l'email admin n'existe pas déjà
    const existing = await UserModel.findByEmail(adminEmail);
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }

    // Créer le centre (inactif par défaut — validé par le SuperAdmin)
    const newCenter = await CenterModel.create({
      id: centerId,
      name: centerName,
      address: address || '',
      phone: phone || '',
      email: email || adminEmail,
      directorName: directorName || adminName || '',
      rnis: rnis || '',
      capacity: 0,
      isActive: false
    });

    // Créer l'utilisateur ADMIN du centre
    const hashedPwd = await bcrypt.hash(adminPassword, 10);
    const adminUser = await UserModel.create({
      id: `u-admin-${centerId}`,
      name: adminName || 'Administrateur',
      email: adminEmail,
      password: hashedPwd,
      role: 'ADMIN',
      tenant_id: centerId,
      centerId: centerId,
      center_id: centerId
    });

    // Initialiser les settings du centre
    try {
      await SettingsModel.set(`${centerId}__center_name`, centerName, adminEmail);
      if (address) await SettingsModel.set(`${centerId}__center_address`, address, adminEmail);
      if (phone) await SettingsModel.set(`${centerId}__center_phone`, phone, adminEmail);
      if (email) await SettingsModel.set(`${centerId}__center_email`, email, adminEmail);
    } catch (settingsErr) {
      console.warn('[REGISTER-CENTER] Erreur settings (non bloquant):', settingsErr.message);
    }

    console.log(`[REGISTER-CENTER] ✅ Nouveau centre créé: ${centerName} (${centerId}) — en attente d'activation`);

    return res.status(201).json({
      success: true,
      centerId,
      centerName,
      status: 'pending_activation',
      message: 'Votre espace O\'CLIC SANTÉ a été créé. Il sera activé prochainement par l\'administrateur.'
    });
  } catch (error) {
    console.error('[API ERROR] POST /api/register-center:', error.message);
    return res.status(500).json({ error: 'Erreur lors de l\'enregistrement: ' + error.message });
  }
});

// Création d'un utilisateur dans un centre (ADMIN ou SUPER_ADMIN)
app.post('/api/users', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const callerRole = String(req.user?.role || '').toUpperCase();
    if (!['ADMIN', 'SUPER_ADMIN'].includes(callerRole)) {
      return res.status(403).json({ error: 'Seul un ADMIN ou SUPER_ADMIN peut créer des utilisateurs.' });
    }
    const b = req.body;
    if (!b.email || !b.password || !b.name) {
      return res.status(400).json({ error: 'name, email et password sont obligatoires.' });
    }
    if (!dbConnected) {
      return res.status(503).json({ error: 'Base de données non disponible.' });
    }
    const existing = await UserModel.findByEmail(b.email);
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }
    const hashedPwd = await bcrypt.hash(b.password, 10);
    const created = await UserModel.create({
      name: b.name,
      email: b.email,
      password: hashedPwd,
      role: b.role || 'RECEPTIONIST',
      tenant_id: req.tenantId,
      centerId: req.tenantId,
      center_id: req.tenantId,
      specialty: b.specialty || null
    });
    const { password: _, ...safeUser } = created;
    return res.status(201).json(safeUser);
  } catch (error) {
    console.error('[API ERROR] POST /api/users:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Lister les utilisateurs du centre courant
app.get('/api/users', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const callerRole = String(req.user?.role || '').toUpperCase();
    let users;
    if (callerRole === 'SUPER_ADMIN') {
      users = await UserModel.findAll();
    } else {
      users = await query('SELECT id, name, email, role, specialty, created_at FROM users WHERE center_id = ? OR centerId = ?', [req.tenantId, req.tenantId]);
    }
    // Masquer les mots de passe
    return res.json((users || []).map(u => { const { password: _, ...s } = u; return s; }));
  } catch (error) {
    console.error('[API ERROR] GET /api/users:', error.message);
    return res.json([]);
  }
});


app.get('/api/patients/:id', async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      const patient = store.patients.find((p) => String(p.id) === String(req.params.id));
      if (!patient) return res.status(404).json({ error: 'Patient non trouvé' });
      return res.json(patient);
    }
    const patient = await PatientModel.findById(req.params.id, req.tenantId);
    if (!patient) return res.status(404).json({ error: 'Patient non trouvé' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    if (dbConnected) {
      const updated = await PatientModel.update(req.params.id, req.body, req.tenantId);
      res.json(updated);
    } else {
      const store = getMemoryTenantStore(req.tenantId);
      const idx = store.patients.findIndex((p) => String(p.id) === String(req.params.id));
      if (idx < 0) return res.status(404).json({ error: 'Patient non trouvé' });
      const updated = { ...store.patients[idx], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
      store.patients[idx] = updated;
      res.json(updated);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});
// Medicines
app.get('/api/medicines', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      return res.json(sortByCreatedAtDesc(store.medicines));
    }
    const medicines = await MedicineModel.findAll(req.tenantId);
    res.json(medicines);
  } catch (error) {
    console.error('[API] GET /api/medicines:', error.message);
    // Retourner JSON vide plutôt que laisser Express envoyer du HTML
    res.status(200).json([]);
  }
});

app.get('/api/consultations/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      const cons = store.consultations.find((c) => String(c.id) === String(req.params.id));
      if (!cons) return res.status(404).json({ error: 'Non trouvé' });
      return res.json(cons);
    }
    const cons = await ConsultationModel.findById(req.params.id, req.tenantId);
    if (!cons) return res.status(404).json({ error: 'Non trouvé' });
    res.json(cons);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

// Users
app.get('/api/users', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const users = dbConnected ? await UserModel.findAll() : [];
    res.json(users);
  } catch (error) {
    res.json([]);
  }
});

// Tickets
app.get('/api/tickets', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const store = getMemoryTenantStore(req.tenantId);
    let results = dbConnected ? await TicketModel.findAll(req.tenantId) : sortByCreatedAtDesc(store.tickets);
    
    if (dbConnected && results.length > 0) {
      const ticketIds = results.map(t => t.id).filter(Boolean);
      if (ticketIds.length > 0) {
          try {
              const placeholders = ticketIds.map(() => '?').join(',');
              const tsRows = await query(`SELECT * FROM ticket_services WHERE ticket_id IN (${placeholders})`, ticketIds);
              const servicesByTicket = {};
              for (const row of tsRows) {
                  if (!servicesByTicket[row.ticket_id]) {
                      servicesByTicket[row.ticket_id] = [];
                  }
                  servicesByTicket[row.ticket_id].push({
                      id: row.service_id,
                      name: row.service_name,
                      price: parseFloat(row.price || 0),
                      quantity: row.quantity
                  });
              }
              results = results.map(t => ({
                  ...t,
                  services: servicesByTicket[t.id] || []
              }));
          } catch (error) {
              console.error("[TICKETS] Error fetching array of services", error.message);
          }
      }
    }
    // Support status filtering
    const statusQuery = req.query.status || req.query.newStatus;
    if (statusQuery) {
      const normalizedQuery = normalizeTicketStatus(statusQuery);
      results = results.filter(t => normalizeTicketStatus(t.status) === normalizedQuery);
    }
    
    // SANITIZE: Créer des objets propres sans aucune propriété étrange
    const servicesList = dbConnected
      ? await query('SELECT name, price FROM services')
      : store.services.map((s) => ({ name: s.name, price: s.price }));
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
      clean.date = clean.createdAt;
      clean.updatedAt = safeDate(t.updatedAt || t.updated_at);
      clean.centerId = t.centerId || t.center_id || req.tenantId;
      clean.center_id = t.center_id || t.centerId || req.tenantId;
      clean.tenantId = t.tenantId || clean.centerId;

      // PROTECTION : S'assurer que serviceName et les prix sont corrects
      clean.status = normalizeTicketStatus(t.status || clean.status);
      clean.patientName = t.patientName || t.patient_name || 'Inconnu';
      clean.patientAge = t.patientAge || t.patient_age || 0;
      clean.patientGender = t.patientGender || t.patient_gender || 'M';
      clean.ticketNumber = t.ticketNumber || t.ticket_number || '';
      clean.amount = t.amount !== undefined ? t.amount : 0;
      
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
      clean.serviceCategory = t.serviceCategory || t.category || 'Consultation';
      clean.insuranceId = t.insurance_id || t.insuranceId || null;
      clean.insuranceCoverage = t.insurance_coverage || t.insuranceCoverage || 0;

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
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      const ticket = store.tickets.find((t) => String(t.id) === String(req.params.id));
      return res.json(Array.isArray(ticket?.services) ? ticket.services : []);
    }
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
      amount: req.body.amount || totalAmount || 0,
      paymentMethod: req.body.paymentMethod || req.body.payment_method || 'CASH',
      services: normalizedServices,
      status: normalizeTicketStatus(req.body.status || 'WAITING'),
      centerId: req.tenantId,
      center_id: req.tenantId,
      tenantId: req.tenantId,
      insuranceId: req.body.insuranceId || null,
      insurance_id: req.body.insuranceId || null,
      insuranceCoverage: req.body.insuranceCoverage || 0,
      insurance_coverage: req.body.insuranceCoverage || 0,
      createdAt: now,
      updatedAt: now
    };

    const safeTicket = (t) => ({
      ...t,
      createdAt: t.createdAt && !isNaN(new Date(t.createdAt).getTime()) ? new Date(t.createdAt).toISOString() : now,
      updatedAt: t.updatedAt && !isNaN(new Date(t.updatedAt).getTime()) ? new Date(t.updatedAt).toISOString() : now,
      serviceCategory: t.serviceCategory || t.category || 'Consultation'
    });

    if (dbConnected) {
      const created = await TicketModel.create(newTicket);
      
      // INSERT TICKET SERVICES
      if (created) {
        for (const s of normalizedServices) {
          if (s.name) {
            await query(`INSERT INTO ticket_services (id, ticket_id, service_id, service_name, price, quantity) VALUES (?, ?, ?, ?, ?, 1)`, [
              `ts-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              created.id,
              s.id || null,
              s.name,
              s.price
            ]);
          }
        }
      }
      
      const responseTicket = {
        ...safeTicket(created || newTicket),
        services: normalizedServices,
        patientName: newTicket.patientName,
        patientAge: newTicket.patientAge,
        patientGender: newTicket.patientGender,
        amount: newTicket.amount,
        ticketNumber: (created && created.ticketNumber) ? created.ticketNumber : newTicket.ticketNumber,
        serviceName: newTicket.serviceName
      };

      // Handle Insurance Transaction
      if (req.body.insuranceId) {
        try {
          const coverage = parseFloat(req.body.insuranceCoverage || 0);
          const totalAmt = parseFloat(newTicket.amount || 0);
          const insAmount = (totalAmt * coverage) / 100;
          const patAmount = totalAmt - insAmount;
          const claimRef = req.body.claimReference || '';

          await InsuranceTransactionModel.create({
            patient_id: newTicket.patientId,
            invoice_id: newTicket.id,
            total_amount: totalAmt,
            patient_paid_amount: patAmount,
            insurance_coverage_amount: insAmount,
            remaining_amount: 0,
            insurance_company_id: req.body.insuranceId,
            status: 'PENDING',
            claim_reference: claimRef,
            claim_date: new Date(),
            center_id: req.tenantId
          });
        } catch (insErr) {
          console.error('[INSURANCE] Transaction creation failed:', insErr.message);
        }
      }
      
      return res.json(responseTicket);
    }
    const store = getMemoryTenantStore(req.tenantId);
    const storeTicket = safeTicket(newTicket);
    upsertMemoryRecord(store.tickets, storeTicket);
    return res.json(storeTicket);
  } catch (error) {
    const detail = error?.message || 'Erreur inconnue';
    res.status(500).json({ error: 'Erreur lors de la création du ticket', detail });
  }
});

app.patch('/api/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const requestedStatus = req.body.status || req.body.newStatus;
    if (!requestedStatus) return res.status(400).json({ error: 'Statut requis' });
    const status = normalizeTicketStatus(requestedStatus);
    if (dbConnected) {
      const updated = await TicketModel.updateStatus(id, status, req.body.doctorId, req.body.rejectionReason);
      return res.json(updated || { id, status });
    }
    const store = getMemoryTenantStore(req.tenantId);
    const idx = store.tickets.findIndex((t) => String(t.id) === String(id));
    if (idx < 0) return res.status(404).json({ error: 'Ticket non trouvé' });
    store.tickets[idx] = { ...store.tickets[idx], status, updatedAt: new Date().toISOString() };
    return res.json(store.tickets[idx]);
  } catch (error) {
    console.error('Erreur update ticket status:', error);
    res.status(500).json({ error: 'Erreur mise à jour statut ticket' });
  }
});

app.put('/api/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const requestedStatus = req.body.status || req.body.newStatus;
    if (!requestedStatus) return res.status(400).json({ error: 'Statut requis' });
    const status = normalizeTicketStatus(requestedStatus);
    if (dbConnected) {
      const updated = await TicketModel.updateStatus(id, status, req.body.doctorId, req.body.rejectionReason);
      return res.json(updated || { id, status });
    }
    const store = getMemoryTenantStore(req.tenantId);
    const idx = store.tickets.findIndex((t) => String(t.id) === String(id));
    if (idx < 0) return res.status(404).json({ error: 'Ticket non trouvé' });
    store.tickets[idx] = { ...store.tickets[idx], status, updatedAt: new Date().toISOString() };
    return res.json(store.tickets[idx]);
  } catch (error) {
    console.error('Erreur update ticket status:', error);
    res.status(500).json({ error: 'Erreur mise à jour statut ticket' });
  }
});

app.post('/api/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const requestedStatus = req.body.status || req.body.newStatus;
    if (!requestedStatus) return res.status(400).json({ error: 'Statut requis' });
    const status = normalizeTicketStatus(requestedStatus);
    if (dbConnected) {
      const updated = await TicketModel.updateStatus(id, status, req.body.doctorId, req.body.rejectionReason);
      return res.json(updated || { id, status });
    }
    const store = getMemoryTenantStore(req.tenantId);
    const idx = store.tickets.findIndex((t) => String(t.id) === String(id));
    if (idx < 0) return res.status(404).json({ error: 'Ticket non trouvé' });
    store.tickets[idx] = { ...store.tickets[idx], status, updatedAt: new Date().toISOString() };
    return res.json(store.tickets[idx]);
  } catch (error) {
    console.error('Erreur update ticket status:', error);
    res.status(500).json({ error: 'Erreur mise à jour statut ticket' });
  }
});

app.patch('/api/tickets/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const { id } = req.params;
    if (dbConnected) {
      const updated = await TicketModel.update(id, req.body);
      return res.json(updated);
    }
    const store = getMemoryTenantStore(req.tenantId);
    const idx = store.tickets.findIndex(t => String(t.id) === String(id));
    if (idx < 0) return res.status(404).json({ error: 'Ticket non trouvé' });
    store.tickets[idx] = { ...store.tickets[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json(store.tickets[idx]);
  } catch (error) {
    console.error('[PATCH ticket]:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du ticket' });
  }
});

// =============================================
// FILE D'ATTENTE (Waiting List)
// =============================================
app.get('/api/tickets/waiting-list', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const currentTenant = req.tenantId || DEFAULT_TENANT_ID;
    const familyId = currentTenant.replace(/^center-0*(\d+)$/, 'center-$1'); 
    const paddedId = currentTenant.replace(/^center-0*(\d+)$/, (_, n) => 'center-' + String(n).padStart(3, '0'));

    if (!dbConnected) {
      const store = getMemoryTenantStore(currentTenant);
      const list = store.tickets.filter(t => ['WAITING', 'IN_PROGRESS', 'PENDING', 'QUEUE'].includes(normalizeTicketStatus(t.status)));
      return res.json({ consultations: list, tickets: list, data: list, total: list.length, success: true });
    }
    
    let q = `
      SELECT t.*, p.name as patient_name, s.name as service_name 
      FROM tickets t 
      LEFT JOIN patients p ON t.patient_id = p.id 
      LEFT JOIN services s ON t.service_id = s.id 
      WHERE (t.center_id = ? OR t.center_id = ? OR t.center_id = ?) 
      AND UPPER(t.status) IN ('WAITING', 'IN_PROGRESS', 'EN_ATTENTE', 'EN ATTENTE', 'EN_ATTENTES', 'EN ATTENTES', 'EN_COURS', 'EN COURS', 'PENDING', 'QUEUE', 'QUEUED', 'EN_PROGRESSION', 'EN PROGRESSION')
      ORDER BY t.created_at ASC`;
    
    const tickets = await query(q, [currentTenant, familyId, paddedId]);
    
    res.json({
      consultations: tickets || [],
      tickets: tickets || [],
      data: tickets || [],
      items: tickets || [],
      total: (tickets || []).length,
      success: true
    });
  } catch (error) {
    res.status(200).json({ consultations: [], tickets: [], total: 0, success: false });
  }
});

// =============================================
// ROUTE DÉDIÉE : Décision du médecin (Accept / Reject)
// =============================================
// POST /api/tickets/:id/doctor-decision
// body: { decision: 'accept'|'reject', doctorId, doctorName, rejectionReason? }
app.post('/api/tickets/:id/doctor-decision', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, doctorId, doctorName, rejectionReason } = req.body;

    if (!decision || !['accept', 'reject'].includes(String(decision).toLowerCase())) {
      return res.status(400).json({ error: 'decision doit être "accept" ou "reject"' });
    }

    const isAccept = String(decision).toLowerCase() === 'accept';
    const newStatus = isAccept ? 'IN_PROGRESS' : 'REJECTED';
    const effectiveDoctorId = doctorId || req.user?.id;
    const effectiveDoctorName = doctorName || req.user?.name;

    if (dbConnected) {
      const updated = await TicketModel.updateStatus(
        id, newStatus, effectiveDoctorId,
        isAccept ? null : (rejectionReason || 'Refusé par le médecin')
      );
      if (!updated) return res.status(404).json({ error: 'Ticket non trouvé' });
      console.log(`[DOCTOR-DECISION] ${effectiveDoctorName} → ${isAccept ? '✅ ACCEPTÉ' : '❌ REJETÉ'} ticket ${id}`);
      return res.json({
        ...updated,
        decision: isAccept ? 'accepted' : 'rejected',
        doctorName: effectiveDoctorName,
        rejectionReason: isAccept ? null : (rejectionReason || 'Refusé par le médecin')
      });
    }

    // Mode mémoire
    const store = getMemoryTenantStore(req.tenantId);
    const idx = store.tickets.findIndex((t) => String(t.id) === String(id));
    if (idx < 0) return res.status(404).json({ error: 'Ticket non trouvé' });
    store.tickets[idx] = {
      ...store.tickets[idx],
      status: newStatus,
      doctor_id: effectiveDoctorId,
      doctor_name: effectiveDoctorName,
      rejection_reason: isAccept ? null : (rejectionReason || 'Refusé par le médecin'),
      updatedAt: new Date().toISOString()
    };
    return res.json({
      ...store.tickets[idx],
      decision: isAccept ? 'accepted' : 'rejected',
      doctorName: effectiveDoctorName
    });
  } catch (error) {
    console.error('[API ERROR] POST /api/tickets/:id/doctor-decision:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// =============================================
// GESTION DES DÉPENSES (EXPENSES)
// =============================================
app.get('/api/expenses', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const expenses = await ExpenseModel.findAll(req.tenantId);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const id = await ExpenseModel.create(req.body, req.tenantId);
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    await ExpenseModel.update(req.params.id, req.body);
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    await ExpenseModel.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// GESTION DES IMMOBILISATIONS (ASSETS)
// =============================================
app.get('/api/assets', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const assets = await AssetModel.findAll(req.tenantId);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assets', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const id = await AssetModel.create(req.body, req.tenantId);
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/assets/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    await AssetModel.update(req.params.id, req.body);
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/assets/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    await AssetModel.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// STOCKS GÉNÉRAUX (INVENTORY)
// =============================================
app.get('/api/inventory', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const inventory = await InventoryModel.findAll(req.tenantId);
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const id = await InventoryModel.create(req.body, req.tenantId);
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inventory/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    await InventoryModel.update(req.params.id, req.body);
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inventory/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    await InventoryModel.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Patients
app.get('/api/patients', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      const mem = sortByCreatedAtDesc(store.patients).map((p) => ({
        ...p,
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        fullName: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Inconnu',
        ticketNumber: p.ticket_number || p.ticketNumber || '',
        phoneNumber: p.phone || p.phoneNumber || '',
        centerId: p.centerId || req.tenantId
      }));
      return res.json(mem);
    }

    // Requête directe et fiable par date de création (le plus récent en premier)
    let patients = [];
    try {
      patients = await query(
        'SELECT * FROM patients WHERE (center_id = ? OR centerId = ?) ORDER BY createdAt DESC',
        [req.tenantId, req.tenantId]
      );
    } catch (sqlErr) {
      console.error('[SQL patients]:', sqlErr.message);
      // Tentative de repli par ID si createdAt échoue
      patients = await query(
        'SELECT * FROM patients WHERE (center_id = ? OR centerId = ?) ORDER BY id DESC',
        [req.tenantId, req.tenantId]
      );
    }

    // Mapper pour compatibilité React
    const result = patients.map(p => ({
      ...p,
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      fullName: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Inconnu',
      ticketNumber: p.ticket_number || p.ticketNumber || '',
      phoneNumber: p.phone || p.phoneNumber || '',
      centerId: p.centerId || p.center_id || req.tenantId
    }));
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
      centerId: req.tenantId,
      center_id: req.tenantId,
      bloodGroup: clean(b.bloodGroup || b.bloodType),
      allergies: clean(b.allergies),
      emergencyContact: clean(b.emergencyContact),
      dateOfBirth: b.dateOfBirth || b.birthDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      upsertMemoryRecord(store.patients, patientData);
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
      batchNumber: b.batchNumber || b.batch_number || null,
      centerId: req.tenantId,
      center_id: req.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      upsertMemoryRecord(store.medicines, medData);
      console.log('Mode mémoire: Médicament créé:', medId);
      return res.json({ ...medData, stock: medData.stock_quantity, minStock: medData.min_stock_alert });
    }
    try {
      await query(
        `INSERT INTO medicines (id, name, stock_quantity, min_stock_alert, price, active, center_id)
         VALUES (?, ?, ?, ?, ?, TRUE, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), stock_quantity=VALUES(stock_quantity), price=VALUES(price), center_id=VALUES(center_id)`,
        [medData.id, medData.name, medData.stock_quantity, medData.min_stock_alert, medData.price, req.tenantId]
      );
      const rows = await query('SELECT * FROM medicines WHERE id = ? AND (center_id = ? OR center_id IS NULL)', [medId, req.tenantId]);
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
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      const idx = store.medicines.findIndex((m) => String(m.id) === String(id));
      if (idx < 0) return res.status(404).json({ error: 'Médicament non trouvé' });
      const current = store.medicines[idx];
      const updated = {
        ...current,
        ...b,
        id,
        stock_quantity: b.stock !== undefined || b.stock_quantity !== undefined ? parseInt(b.stock ?? b.stock_quantity) : current.stock_quantity,
        min_stock_alert: b.minStock !== undefined || b.min_stock_alert !== undefined ? parseInt(b.minStock ?? b.min_stock_alert) : current.min_stock_alert,
        updatedAt: new Date().toISOString()
      };
      store.medicines[idx] = updated;
      return res.json({ ...updated, stock: updated.stock_quantity, minStock: updated.min_stock_alert });
    }
    const fields = [];
    const params = [];
    if (b.stock !== undefined || b.stock_quantity !== undefined) { fields.push('stock_quantity = ?'); params.push(parseInt(b.stock ?? b.stock_quantity)); }
    if (b.minStock !== undefined || b.min_stock_alert !== undefined) { fields.push('min_stock_alert = ?'); params.push(parseInt(b.minStock ?? b.min_stock_alert)); }
    if (b.price !== undefined) { fields.push('price = ?'); params.push(parseFloat(b.price)); }
    if (b.name !== undefined) { fields.push('name = ?'); params.push(b.name); }
    if (fields.length === 0) return res.json({ id, ...b });
    params.push(id, req.tenantId);
    await query(`UPDATE medicines SET ${fields.join(', ')} WHERE id = ? AND (center_id = ? OR center_id IS NULL)`, params);
    const rows = await query('SELECT * FROM medicines WHERE id = ? AND (center_id = ? OR center_id IS NULL)', [id, req.tenantId]);
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
    if (dbConnected) await query('DELETE FROM medicines WHERE id = ? AND (center_id = ? OR center_id IS NULL)', [id, req.tenantId]);
    else {
      const store = getMemoryTenantStore(req.tenantId);
      store.medicines = store.medicines.filter((m) => String(m.id) !== String(id));
    }
    res.json({ success: true, id });
  } catch (error) {
    console.error('[medicines DELETE]:', error.message);
    res.status(500).json({ error: 'Erreur suppression médicament' });
  }
});

// Lab Results
app.get('/api/lab-results', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      return res.json(sortByCreatedAtDesc(store.labResults));
    }
    const filters = { ...(req.query || {}), centerId: req.tenantId };
    const results = await LabResultModel.findAll(filters);
    res.json(results);
  } catch (error) {
    console.error('[lab-results GET]:', error.message);
    res.json([]);
  }
});

app.post('/api/lab-results', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const b = req.body;
    
    // Récupérer les informations de la catégorie si spécifiée
    let categoryInfo = null;
    if (b.category) {
      try {
        categoryInfo = await ExamCategoryModel.findByName(b.category, req.tenantId);
      } catch (e) {
        console.warn('Erreur récupération catégorie:', e.message);
      }
    }
    
    const data = {
      id: b.id || `lab-${Date.now()}`,
      testName: b.testName || b.test_name,
      category: b.category || 'Général',
      patientId: b.patientId || b.patient_id,
      patientName: b.patientName || b.patient_name,
      doctorId: b.doctorId || b.doctor_id,
      doctorName: b.doctorName || b.doctor_name,
      result: (b.result && typeof b.result === 'object' ? JSON.stringify(b.result) : b.result),
      status: b.status || 'PENDING',
      notes: b.notes,
      unit: b.unit || categoryInfo?.unit || '',
      reference: b.reference || categoryInfo?.reference_text || `${categoryInfo?.reference_min || ''} - ${categoryInfo?.reference_max || ''}`,
      centerId: req.tenantId,
      center_id: req.tenantId,
      tenantId: req.tenantId,
      ticketId: b.ticketId || b.ticket_id,
      consultationId: b.consultationId || b.consultation_id
    };
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      upsertMemoryRecord(store.labResults, { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      return res.json(data);
    }
    const created = await LabResultModel.create(data);
    res.json(created);
  } catch (error) {
    console.error('[lab-results POST]:', error.message, error.stack?.substring(0, 300));
    res.status(500).json({ error: 'Erreur création résultat', detail: error.message });
  }
});

app.patch('/api/lab-results/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      const idx = store.labResults.findIndex((r) => String(r.id) === String(req.params.id));
      if (idx < 0) return res.status(404).json({ error: 'Résultat non trouvé' });
      store.labResults[idx] = { ...store.labResults[idx], ...req.body, updatedAt: new Date().toISOString() };
      return res.json(store.labResults[idx]);
    }
    const { id } = req.params;
    const updated = await LabResultModel.update(id, req.body, req.tenantId);
    res.json(updated);
  } catch (error) {
    console.error('[lab-results PATCH]:', error.message);
    res.status(500).json({ error: 'Erreur mise à jour résultat' });
  }
});

// Exam Categories API
app.get('/api/exam-categories', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const categories = dbConnected 
      ? await ExamCategoryModel.findAll(req.tenantId)
      : getMemoryTenantStore(req.tenantId).examCategories || [];
    res.json(categories);
  } catch (error) {
    console.error('[exam-categories GET]:', error.message);
    res.status(500).json({ error: 'Erreur récupération catégories' });
  }
});

app.post('/api/exam-categories', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const category = await ExamCategoryModel.create({
      ...req.body,
      centerId: req.tenantId,
      center_id: req.tenantId
    });
    res.json(category);
  } catch (error) {
    console.error('[exam-categories POST]:', error.message);
    res.status(500).json({ error: 'Erreur création catégorie' });
  }
});

app.put('/api/exam-categories/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const category = await ExamCategoryModel.update(req.params.id, {
      ...req.body,
      centerId: req.tenantId,
      center_id: req.tenantId
    }, req.tenantId);
    res.json(category);
  } catch (error) {
    console.error('[exam-categories PUT]:', error.message);
    res.status(500).json({ error: 'Erreur mise à jour catégorie' });
  }
});

app.delete('/api/exam-categories/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    await ExamCategoryModel.delete(req.params.id, req.tenantId);
    res.json({ success: true });
  } catch (error) {
    console.error('[exam-categories DELETE]:', error.message);
    res.status(500).json({ error: 'Erreur suppression catégorie' });
  }
});

// Sales
app.get('/api/sales', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      return res.json(sortByCreatedAtDesc(store.sales));
    }
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
      const store = getMemoryTenantStore(req.tenantId);
      upsertMemoryRecord(store.sales, { ...saleData, items, paymentMethod: b.paymentMethod, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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
app.get('/api/consultations', authenticateToken, resolveTenant, async (req, res) => {
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

    const consultations = dbConnected
      ? await ConsultationModel.findAll(filters)
      : getMemoryTenantStore(req.tenantId).consultations.filter((c) => {
          if (filters.patientId && String(c.patientId || c.patient_id) !== String(filters.patientId)) return false;
          if (filters.patient_id && String(c.patientId || c.patient_id) !== String(filters.patient_id)) return false;
          if (filters.doctorId && String(c.doctorId || c.doctor_id) !== String(filters.doctorId)) return false;
          if (filters.doctor_id && String(c.doctorId || c.doctor_id) !== String(filters.doctor_id)) return false;
          return true;
        });
    const safeDateStr = (val) => {
      if (!val) return new Date().toISOString();
      const d = new Date(val);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    };

    const normalized = consultations.map(c => ({
      ...c,
      date: safeDateStr(c.date || c.createdAt || c.created_at),
      createdAt: safeDateStr(c.createdAt || c.created_at),
      updatedAt: safeDateStr(c.updatedAt || c.updated_at),
      prescription: normalizePrescription(c.prescription),
      labOrders: normalizeLabOrders(c.labOrders),
      serviceCategory: c.serviceCategory || c.category || 'Consultation'
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
    const store = getMemoryTenantStore(req.tenantId);
    upsertMemoryRecord(store.consultations, { ...consData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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

// Landing page de présentation (marketing)
app.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/landing.html'));
});

// Insurance Companies
app.get('/api/insurance-companies', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const companies = dbConnected ? await InsuranceCompanyModel.findAll(req.tenantId || req.user?.tenantId) : [];
    res.json(companies);
  } catch (error) {
    console.error('[API] GET /api/insurance-companies:', error.message);
    res.status(500).json([]);
  }
});

app.post('/api/insurance-companies', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const data = { ...req.body, center_id: req.tenantId || req.user?.tenantId };
    const created = await InsuranceCompanyModel.create(data);
    res.status(201).json(created);
  } catch (error) {
    console.error('[API] POST /api/insurance-companies:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/insurance-companies/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const updated = await InsuranceCompanyModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('[API] PUT /api/insurance-companies/:id:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/insurance-companies/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    await InsuranceCompanyModel.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /api/insurance-companies/:id:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Patient Insurances
app.get('/api/patient-insurances', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const results = await PatientInsuranceModel.findAll(req.tenantId || req.user?.tenantId);
    res.json(results);
  } catch (error) {
    res.status(500).json([]);
  }
});

app.get('/api/patients/:id/insurances', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const results = await PatientInsuranceModel.findByPatientId(req.params.id);
    res.json(results);
  } catch (error) {
    res.status(500).json([]);
  }
});

app.post('/api/patient-insurances', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const data = { ...req.body, center_id: req.tenantId || req.user?.tenantId };
    const id = await PatientInsuranceModel.create(data);
    res.status(201).json({ id, ...data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/patient-insurances/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    await PatientInsuranceModel.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/patient-insurances/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    await PatientInsuranceModel.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Insurance Transactions
app.get('/api/insurance-transactions', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const results = await InsuranceTransactionModel.findAll(req.tenantId || req.user?.tenantId);
    res.json(results);
  } catch (error) {
    res.status(500).json([]);
  }
});

app.post('/api/insurance-transactions', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const data = { ...req.body, center_id: req.tenantId || req.user?.tenantId };
    const id = await InsuranceTransactionModel.create(data);
    res.status(201).json({ id, ...data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/insurance-transactions/:id/status', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const { status, paymentDate } = req.body;
    await InsuranceTransactionModel.updateStatus(req.params.id, status, paymentDate);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// APPOINTMENTS ROUTES
// =============================================

app.get('/api/appointments', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      return res.json(store.appointments || []);
    }
    const items = await AppointmentModel.findAll(req.tenantId);
    return res.json(items);
  } catch (e) {
    console.error('[API] GET /api/appointments:', e.message);
    return res.json([]);
  }
});

app.post('/api/appointments', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const b = req.body;
    const curTenant = req.tenantId || b.center_id || b.centerId || 'center-001';
    
    console.log('[DEBUG] Appointment Request Received:', JSON.stringify(b));

    const appointmentData = {
      patientId: b.patient_id || b.patientId,
      patientName: b.patientName || b.patient_name || 'Anonyme',
      patientPhone: b.patientPhone || b.patient_phone || b.phone || null,
      doctorId: b.staff_id || b.staffId || b.doctorId || b.doctor_id,
      doctorName: b.doctorName || b.doctor_name || b.staffName || '',
      serviceName: b.serviceName || b.service_name || 'Consultation',
      appointmentDate: b.appointment_date || b.appointmentDate || b.date,
      appointmentTime: b.appointment_time || b.appointmentTime || b.time,
      durationMinutes: b.duration_minutes || b.durationMinutes || 30,
      status: b.status || 'SCHEDULED',
      notes: b.notes || '',
      center_id: curTenant,
      insuranceId: b.insurance_id || b.insuranceId || null,
      claimReference: b.claim_reference || b.claimReference || ''
    };

    if (dbConnected) {
      const result = await AppointmentModel.create(appointmentData);
      
      // Automatic Notification (WhatsApp / SMS)
      if (appointmentData.patientPhone) {
        try {
          const center = await CenterModel.findById(curTenant);
          const msg = buildConfirmationMessage(center, appointmentData);
          console.log('[NOTIF] Sending notification to:', appointmentData.patientPhone);
          await sendSms(appointmentData.patientPhone, msg);
          await AppointmentModel.update(result.id, { sms_sent: true });
        } catch (notifErr) {
          console.error('[NOTIF-ERROR] Failed to send notification:', notifErr.message);
        }
      }

      if (b.createTicket) {
        const today = new Date().toISOString().split('T')[0];
        const appDay = String(appointmentData.appointmentDate).split('T')[0];
        if (today === appDay) {
          await TicketModel.create({
            patientName: appointmentData.patientName,
            patientPhone: appointmentData.patientPhone,
            serviceName: appointmentData.serviceName,
            center_id: curTenant,
            status: 'WAITING'
          });
        }
      }
      
      return res.status(201).json(result);
    } else {
      const store = getMemoryTenantStore(curTenant);
      if (!store.appointments) store.appointments = [];
      const newApp = { ...appointmentData, id: `mem-${Date.now()}` };
      store.appointments.push(newApp);
      return res.status(201).json(newApp);
    }
  } catch (error) {
    console.error('[API] POST /api/appointments Failure:', error);
    res.status(500).json({ error: 'Failed to create appointment', details: error.message });
  }
});

app.get('/api/appointments/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      const appt = (store.appointments || []).find(a => String(a.id) === String(req.params.id));
      return appt ? res.json(appt) : res.status(404).json({ error: 'Rendez-vous introuvable' });
    }
    const appt = await AppointmentModel.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Rendez-vous introuvable' });
    return res.json(appt);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/appointments', authenticateToken, resolveTenant, async (req, res) => {
  console.log('[DEBUG] Appointment Request Received:', JSON.stringify(req.body));
  try {
    const body = req.body;
    if (!body.patientName || !body.appointmentDate || !body.appointmentTime) {
      return res.status(400).json({ error: 'patientName, appointmentDate et appointmentTime sont obligatoires.' });
    }
    const data = { ...body, centerId: req.tenantId, center_id: req.tenantId };

    let created;
    if (dbConnected) {
      created = await AppointmentModel.create(data);
    } else {
      created = { id: `appt-${Date.now()}`, ...data, smsSent: false, reminderSent: false, status: 'SCHEDULED', createdAt: new Date().toISOString() };
      const store = getMemoryTenantStore(req.tenantId);
      if (!store.appointments) store.appointments = [];
      store.appointments.push(created);
    }

    // SMS de confirmation
    if (created.patientPhone) {
      try {
        const center = dbConnected ? await CenterModel.findById(req.tenantId) : null;
        const msg = buildConfirmationMessage(center, created);
        const result = await sendSms(created.patientPhone, msg);
        if (dbConnected && result.success) {
          await AppointmentModel.update(created.id, { sms_sent: true });
          created.smsSent = true;
        }
      } catch (smsErr) {
        console.error('[SMS] Confirmation échouée:', smsErr.message);
      }
    }

    return res.json(created);
  } catch (e) {
    console.error('[API] POST /api/appointments:', e.message);
    return res.status(500).json({ error: e.message });
  }
});

app.patch('/api/appointments/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      if (!store.appointments) store.appointments = [];
      const idx = store.appointments.findIndex(a => String(a.id) === String(req.params.id));
      if (idx < 0) return res.status(404).json({ error: 'Rendez-vous introuvable' });
      store.appointments[idx] = { ...store.appointments[idx], ...req.body };
      return res.json(store.appointments[idx]);
    }
    const updated = await AppointmentModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Rendez-vous introuvable' });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.delete('/api/appointments/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) {
      const store = getMemoryTenantStore(req.tenantId);
      if (store.appointments) store.appointments = store.appointments.filter(a => String(a.id) !== String(req.params.id));
      return res.json({ deleted: true, id: req.params.id });
    }
    return res.json(await AppointmentModel.delete(req.params.id));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/appointments/:id/send-reminder', authenticateToken, resolveTenant, async (req, res) => {
  try {
    const appt = dbConnected ? await AppointmentModel.findById(req.params.id)
      : (getMemoryTenantStore(req.tenantId).appointments || []).find(a => String(a.id) === String(req.params.id));
    if (!appt) return res.status(404).json({ error: 'Rendez-vous introuvable' });
    if (!appt.patientPhone) return res.status(400).json({ error: 'Aucun némuro de téléphone pour ce patient' });
    const center = dbConnected ? await CenterModel.findById(req.tenantId) : null;
    const msg = buildReminderMessage(center, appt);
    const result = await sendSms(appt.patientPhone, msg);
    if (dbConnected && result.success) await AppointmentModel.update(appt.id, { reminder_sent: true });
    return res.json({ success: result.success, message: msg, smsResult: result });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// =============================================
// INSURANCE / IPM MODULE — API ROUTES
// =============================================

// --- Insurance Companies (CRUD) ---
app.get('/api/insurance/companies', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const companies = await InsuranceCompanyModel.findAll(req.tenantId);
    return res.json(companies);
  } catch (e) {
    console.error('[API] GET /api/insurance/companies:', e.message);
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/insurance/companies/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.status(404).json({ error: 'DB non connectée' });
    const company = await InsuranceCompanyModel.findById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Compagnie introuvable' });
    return res.json(company);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/insurance/companies', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB non connectée' });
    const data = { ...req.body, center_id: req.tenantId };
    if (!data.name) return res.status(400).json({ error: 'Le nom de la compagnie est requis' });
    const result = await InsuranceCompanyModel.create(data);
    console.log(`[INSURANCE] ✅ Compagnie créée: ${data.name}`);
    return res.status(201).json(result);
  } catch (e) {
    console.error('[API] POST /api/insurance/companies:', e.message);
    return res.status(500).json({ error: e.message });
  }
});

app.put('/api/insurance/companies/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB non connectée' });
    const result = await InsuranceCompanyModel.update(req.params.id, req.body);
    if (!result) return res.status(404).json({ error: 'Compagnie introuvable' });
    console.log(`[INSURANCE] ✏️ Compagnie mise à jour: ${req.params.id}`);
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.delete('/api/insurance/companies/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB non connectée' });
    await InsuranceCompanyModel.delete(req.params.id);
    console.log(`[INSURANCE] 🗑️ Compagnie supprimée: ${req.params.id}`);
    return res.json({ deleted: true, id: req.params.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// --- Patient Insurances (Couverture patient) ---
app.get('/api/insurance/patients', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const coverages = await PatientInsuranceModel.findAll(req.tenantId);
    return res.json(coverages);
  } catch (e) {
    console.error('[API] GET /api/insurance/patients:', e.message);
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/insurance/patients/:patientId', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const coverages = await PatientInsuranceModel.findByPatientId(req.params.patientId);
    return res.json(coverages);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/insurance/patients', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB non connectée' });
    const data = { ...req.body, center_id: req.tenantId };
    if (!data.patient_id || !data.insurance_company_id) {
      return res.status(400).json({ error: 'patient_id et insurance_company_id sont requis' });
    }
    const insertId = await PatientInsuranceModel.create(data);
    console.log(`[INSURANCE] ✅ Couverture patient créée: patient=${data.patient_id}`);
    return res.status(201).json({ id: insertId, ...data });
  } catch (e) {
    console.error('[API] POST /api/insurance/patients:', e.message);
    return res.status(500).json({ error: e.message });
  }
});

app.put('/api/insurance/patients/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB non connectée' });
    await PatientInsuranceModel.update(req.params.id, req.body);
    console.log(`[INSURANCE] ✏️ Couverture patient mise à jour: ${req.params.id}`);
    return res.json({ id: parseInt(req.params.id), ...req.body });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.delete('/api/insurance/patients/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB non connectée' });
    await PatientInsuranceModel.delete(req.params.id);
    console.log(`[INSURANCE] 🗑️ Couverture patient supprimée: ${req.params.id}`);
    return res.json({ deleted: true, id: req.params.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// --- Insurance Transactions (Réclamations / Facturations) ---
app.get('/api/insurance/transactions', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.json([]);
    const transactions = await InsuranceTransactionModel.findAll(req.tenantId);
    return res.json(transactions);
  } catch (e) {
    console.error('[API] GET /api/insurance/transactions:', e.message);
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/insurance/transactions', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB non connectée' });
    const data = { ...req.body, center_id: req.tenantId };
    if (!data.patient_id || !data.insurance_company_id) {
      return res.status(400).json({ error: 'patient_id et insurance_company_id sont requis' });
    }
    // Générer une référence de réclamation automatique si absente
    if (!data.claim_reference) {
      data.claim_reference = `CLM-${Date.now().toString(36).toUpperCase()}`;
    }
    if (!data.claim_date) {
      data.claim_date = new Date().toISOString().split('T')[0];
    }
    const insertId = await InsuranceTransactionModel.create(data);
    console.log(`[INSURANCE] ✅ Transaction créée: ref=${data.claim_reference}`);
    return res.status(201).json({ id: insertId, ...data });
  } catch (e) {
    console.error('[API] POST /api/insurance/transactions:', e.message);
    return res.status(500).json({ error: e.message });
  }
});

app.patch('/api/insurance/transactions/:id', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB non connectée' });
    const { status, payment_date } = req.body;
    if (!status) return res.status(400).json({ error: 'Le statut est requis' });
    await InsuranceTransactionModel.updateStatus(req.params.id, status, payment_date);
    console.log(`[INSURANCE] ✏️ Transaction ${req.params.id} → ${status}`);
    return res.json({ id: parseInt(req.params.id), status, payment_date });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// --- Insurance Stats / Dashboard ---
app.get('/api/insurance/stats', authenticateToken, resolveTenant, async (req, res) => {
  try {
    if (!dbConnected) return res.json({ totalCompanies: 0, totalCoveredPatients: 0, totalClaims: 0, pendingClaims: 0, totalCoverageAmount: 0 });
    
    const [companies] = await Promise.all([
      query('SELECT COUNT(*) as count FROM insurance_companies WHERE center_id = ? AND is_active = 1', [req.tenantId])
    ]);
    const [coveredPatients] = await Promise.all([
      query('SELECT COUNT(DISTINCT patient_id) as count FROM patient_insurances WHERE center_id = ?', [req.tenantId])
    ]);
    const transStats = await query(
      `SELECT 
        COUNT(*) as total_claims,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_claims,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_claims,
        SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid_claims,
        COALESCE(SUM(insurance_coverage_amount), 0) as total_coverage,
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN insurance_coverage_amount ELSE 0 END), 0) as paid_coverage,
        COALESCE(SUM(CASE WHEN status = 'PENDING' THEN insurance_coverage_amount ELSE 0 END), 0) as pending_coverage
       FROM insurance_transactions WHERE center_id = ?`, [req.tenantId]
    );
    const stats = transStats[0] || {};
    
    return res.json({
      totalCompanies: companies[0]?.count || 0,
      totalCoveredPatients: coveredPatients[0]?.count || 0,
      totalClaims: stats.total_claims || 0,
      pendingClaims: stats.pending_claims || 0,
      approvedClaims: stats.approved_claims || 0,
      paidClaims: stats.paid_claims || 0,
      totalCoverageAmount: parseFloat(stats.total_coverage) || 0,
      paidCoverageAmount: parseFloat(stats.paid_coverage) || 0,
      pendingCoverageAmount: parseFloat(stats.pending_coverage) || 0
    });
  } catch (e) {
    console.error('[API] GET /api/insurance/stats:', e.message);
    return res.json({ totalCompanies: 0, totalCoveredPatients: 0, totalClaims: 0, pendingClaims: 0, totalCoverageAmount: 0 });
  }
});

// Middleware global de gestion d'erreurs — force JSON pour /api et évite HTML 500
app.use((err, req, res, next) => {
  const isApi = req.path.startsWith('/api');
  if (isApi) {
    const status = err.status || err.statusCode || 500;
    const msg = process.env.NODE_ENV === 'production' ? 'Erreur serveur' : (err.message || 'Erreur serveur');
    console.error(`[API-ERROR] ${req.method} ${req.path}:`, err.message);
    return res.status(status).json({ error: msg, success: false });
  }
  next(err);
});

// Aide à la normalisation pour React (Middleware pour transformer les résultats)
app.use('/api', (req, res, next) => {
    const oldJson = res.json;
    res.json = function(data) {
        if (data && typeof data === 'object') {
            // Normalisation si c'est un tableau
            if (Array.isArray(data)) {
                data = data.map(item => normalizeForReact(item));
            } else if (data.data && Array.isArray(data.data)) {
                data.data = data.data.map(item => normalizeForReact(item));
            } else {
                data = normalizeForReact(data);
            }
        }
        return oldJson.call(this, data);
    };
    next();
});

function normalizeForReact(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    // Harmonisation des IDs et Dates pour React
    if (obj.created_at && !obj.createdAt) obj.createdAt = obj.created_at;
    if (obj.updated_at && !obj.updatedAt) obj.updatedAt = obj.updated_at;
    if (obj.patient_id && !obj.patientId) obj.patientId = obj.patient_id;
    if (obj.center_id && !obj.centerId) obj.centerId = obj.center_id;
    if (obj.centerId && !obj.center_id) obj.center_id = obj.centerId;
    return obj;
}

// SPA fallback: serve index.html for non-API routes (fixes Cannot GET /patients/:id on refresh)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Route API non trouvée' });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
// Initialisation au démarrage
// DB init en arrière-plan : ne bloque PAS le démarrage du serveur
dbInitStatus = 'pending';
dbInitStartedAt = new Date().toISOString();
dbInitFinishedAt = null;
initializeDatabase().then(success => {
  dbConnected = success;
  dbInitStatus = success ? 'success' : 'error';
  dbInitFinishedAt = new Date().toISOString();
  console.log(`🗄️  Statut Base de Données: ${dbConnected ? 'CONNECTÉE' : 'ÉCHEC (Mode mémoire)'}`);
}).catch(e => {
  dbConnected = false;
  dbInitStatus = 'error';
  dbInitFinishedAt = new Date().toISOString();
  console.error('⚠️ DB Init Crash en arrière-plan:', e.message);
});

// =============================================
// CRON : Rappel automatique 24h avant le RDV
// =============================================
function startReminderCron() {
  const INTERVAL_MS = 30 * 60 * 1000; // Toutes les 30 min
  setInterval(async () => {
    if (!dbConnected) return;
    try {
      const upcoming = await AppointmentModel.findUpcomingForReminder(24);
      if (upcoming.length === 0) return;
      console.log(`[CRON-REMINDER] ${upcoming.length} RDV à rappeler...`);
      for (const appt of upcoming) {
        try {
          const center = await CenterModel.findById(appt.centerId);
          const msg = buildReminderMessage(center, appt);
          const result = await sendSms(appt.patientPhone, msg);
          if (result.success) {
            await AppointmentModel.update(appt.id, { reminder_sent: true });
            console.log(`[CRON-REMINDER] ✅ Rappel envoyé → ${appt.patientName} (${appt.patientPhone})`);
          }
        } catch (err) {
          console.error(`[CRON-REMINDER] ❌ Erreur pour ${appt.id}:`, err.message);
        }
      }
    } catch (e) {
      console.error('[CRON-REMINDER] Erreur globale:', e.message);
    }
  }, INTERVAL_MS);
  console.log('[CRON-REMINDER] 🕐 Cron de rappel SMS actif (toutes les 30 min)');
}

startReminderCron();

// Global Error Handlers - Preventing 503 crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRASH-PREVENTION] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err, origin) => {
  console.error('[CRASH-PREVENTION] Uncaught Exception:', err, 'origin:', origin);
});
