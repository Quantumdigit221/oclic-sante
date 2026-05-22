// =============================================
// O'CLIC SANTE - Connexion Base de Données (RESCUE VERSION)
// =============================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

function isPlaceholder(v = '') {
  const s = String(v || '').trim();
  if (!s) return true;
  return (
    s.startsWith('REPLACE_WITH_') ||
    s.includes('your_') ||
    s.includes('votre_') ||
    s === 'changeme'
  );
}

function buildDbConfigFromEnv() {
  const fromUrl = {};
  const rawUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || '';
  if (rawUrl) {
    try {
      const u = new URL(rawUrl);
      fromUrl.host = u.hostname;
      fromUrl.port = u.port ? Number(u.port) : undefined;
      fromUrl.user = decodeURIComponent(u.username || '');
      fromUrl.password = decodeURIComponent(u.password || '');
      fromUrl.database = (u.pathname || '').replace(/^\//, '');
    } catch {
      // Ignore DATABASE_URL parsing errors and fallback to DB_* vars
    }
  }

  // --- RESCUE FALLBACK FOR HOSTINGER PRODUCTION ---
  // Si on est sur le serveur Hostinger et que .env est absent ou local,
  // on force les accès qui marchent sur Hostinger.
  const isHostinger = process.env.HOSTINGER === 'true' || 
                    (typeof window === 'undefined' && process.env.USER && process.env.USER.includes('u622816723'));
  
  let host = process.env.DB_HOST || fromUrl.host || '127.0.0.1';
  let user = process.env.DB_USER || fromUrl.user || '';
  let pass = process.env.DB_PASSWORD || fromUrl.password || '';
  let db   = process.env.DB_NAME || fromUrl.database || '';
  let ssl  = process.env.DB_SSL === 'true';

  // Si on détecte qu'on n'a pas d'accès configuré, on utilise le "Rescue"
  if ((!user || user === 'root') && !rawUrl) {
    console.log('🛡️ DATABASE-RESCUE: No valid config found, applying remote Hostinger fallback...');
    host = 'srv480.hstgr.io';
    user = 'u622816723_oclics';
    pass = 'Madi@w012701';
    db   = 'u622816723_oclics';
    ssl  = true;
  }

  return {
    host,
    port: Number(process.env.DB_PORT || fromUrl.port || 3306),
    user,
    password: pass,
    database: db,
    charset: 'utf8mb4',
    timezone: '+00:00',
    acquireTimeout: 10000,
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 10,
    enableKeepAlive: true,
    ssl: ssl ? { rejectUnauthorized: false } : undefined
  };
}

const dbConfig = buildDbConfigFromEnv();

function validateDbConfig(config) {
  const bad =
    isPlaceholder(config.host) ||
    isPlaceholder(config.user) ||
    isPlaceholder(config.database);
  // Note: config.password can be empty in local environments
  if (bad) {
    return "Configuration DB invalide: renseigner DB_HOST, DB_USER, DB_NAME (ou DATABASE_URL) avec des valeurs réelles.";
  }
  return null;
}

const mysqlConfig = {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectTimeout: 15000,      // 15s max pour établir la connexion
  acquireTimeout: 15000,      // 15s pour obtenir une connexion du pool
  timeout: 20000,             // 20s max par requête SQL
  connectionLimit: 5,         // réduit pour Hostinger shared hosting
  waitForConnections: true,
  queueLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: dbConfig.ssl
};

let pool;
let dbErrorLog = null;

const __filename_db = fileURLToPath(import.meta.url);
const __dirname_db = path.dirname(__filename_db);
const logFile = path.join(__dirname_db, '../server-err.log');

function logToFile(msg) {
  try {
    const time = new Date().toISOString();
    fs.appendFileSync(logFile, `[${time}] ${msg}\n`);
    console.log(`[LOG] ${msg}`);
  } catch (e) { }
}

export function getDbErrorLog() {
  return dbErrorLog;
}

export async function query(sql, params = []) {
  try {
    if (!pool) throw new Error('Base de données non initialisée');
    const cleanParams = Array.isArray(params) ? params.map(p => p === undefined ? null : p) : [];
    // Timeout par requête : évite de bloquer le serveur si Hostinger est lent
    const QUERY_TIMEOUT_MS = 18000;
    const queryPromise = pool.query(sql, cleanParams);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`SQL timeout après ${QUERY_TIMEOUT_MS}ms: ${sql.slice(0, 80)}`)), QUERY_TIMEOUT_MS)
    );
    const [rows] = await Promise.race([queryPromise, timeoutPromise]);
    return Array.isArray(rows) ? rows : (rows ? [rows] : []);
  } catch (error) {
    console.error('Erreur SQL:', error.message);
    throw error;
  }
}

export async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function initializeDatabase() {
  logToFile(`INIT: Connexion sur ${dbConfig.host}:${dbConfig.port}...`);
  try {
    const configError = validateDbConfig(dbConfig);
    if (configError) {
      dbErrorLog = configError;
      logToFile(`ECHEC CONFIG DB: ${configError}`);
      return false;
    }

    dbErrorLog = null;
    // CRITIQUE : mysql2/promise utilise .createPool() directement sur l'objet importé
    pool = mysql.createPool(mysqlConfig);


    // Test simple
    await pool.query('SELECT 1');
    logToFile(`SUCCÈS: DB Connectée.`);

    // Tables Vitales
    await query(`CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY, 
      name VARCHAR(255), 
      email VARCHAR(255) UNIQUE, 
      password VARCHAR(255), 
      role VARCHAR(50) DEFAULT 'USER',
      specialty VARCHAR(255),
      center_id VARCHAR(255) DEFAULT 'center-001',
      centerId VARCHAR(255) DEFAULT 'center-001',
      tenant_id VARCHAR(255) DEFAULT 'center-001',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS tickets (
      id VARCHAR(255) PRIMARY KEY, 
      ticket_number VARCHAR(255) UNIQUE, 
      patient_id VARCHAR(255),
      service_id VARCHAR(255),
      doctor_id VARCHAR(255),
      patient_name VARCHAR(255), 
      patient_age INT,
      patient_gender VARCHAR(10),
      patient_phone VARCHAR(50),
      patient_address TEXT,
      service_name VARCHAR(255), 
      amount DECIMAL(10,2) DEFAULT 0.00, 
      payment_method VARCHAR(50) DEFAULT 'CASH',
      notes TEXT,
      status VARCHAR(50) DEFAULT 'WAITING', 
      center_id VARCHAR(255) DEFAULT 'center-001', 
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS ticket_services (
      id VARCHAR(255) PRIMARY KEY, 
      ticket_id VARCHAR(255), 
      service_id VARCHAR(255),
      service_name VARCHAR(255), 
      price DECIMAL(10,2), 
      quantity INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS patients (
      id VARCHAR(255) PRIMARY KEY, 
      name VARCHAR(255), 
      firstName VARCHAR(255),
      lastName VARCHAR(255),
      dateOfBirth DATE,
      age INT,
      gender VARCHAR(10),
      phone VARCHAR(20),
      address TEXT,
      center_id VARCHAR(255) DEFAULT 'center-001', 
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(255) PRIMARY KEY, 
      name VARCHAR(255), 
      description TEXT,
      category VARCHAR(255) DEFAULT 'Consultation',
      price DECIMAL(10,2), 
      durationMinutes INT DEFAULT 30,
      color VARCHAR(50),
      centerId VARCHAR(255) DEFAULT 'center-001',
      isActive TINYINT(1) DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS medicines (
      id VARCHAR(255) PRIMARY KEY, 
      name VARCHAR(255), 
      generic_name VARCHAR(255),
      stock_quantity INT DEFAULT 0, 
      min_stock_alert INT DEFAULT 10,
      price DECIMAL(10,2), 
      category VARCHAR(255) DEFAULT 'Général',
      center_id VARCHAR(255) DEFAULT 'center-001',
      active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS settings (
      setting_key VARCHAR(255) PRIMARY KEY, 
      setting_value TEXT,
      updated_by VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS consultations (
      id VARCHAR(255) PRIMARY KEY,
      ticket_id VARCHAR(255),
      patient_id VARCHAR(255),
      doctor_id VARCHAR(255),
      doctor_name VARCHAR(255),
      patient_name VARCHAR(255),
      temperature VARCHAR(50),
      weight VARCHAR(50),
      blood_pressure VARCHAR(50),
      pulse VARCHAR(50),
      diagnosis TEXT,
      symptoms TEXT,
      prescription TEXT,
      lab_orders TEXT,
      notes TEXT,
      center_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS lab_results (
      id VARCHAR(255) PRIMARY KEY,
      test_name VARCHAR(255),
      category VARCHAR(255),
      patient_id VARCHAR(255),
      patient_name VARCHAR(255),
      doctor_id VARCHAR(255),
      doctor_name VARCHAR(255),
      result TEXT,
      status VARCHAR(50),
      center_id VARCHAR(255) DEFAULT 'center-001',
      notes TEXT,
      unit VARCHAR(100),
      reference VARCHAR(255),
      ticket_id VARCHAR(255),
      consultation_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS exam_categories (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      unit VARCHAR(100),
      reference_min VARCHAR(50),
      reference_max VARCHAR(50),
      reference_text TEXT,
      category_type VARCHAR(100) DEFAULT 'Laboratoire',
      is_active TINYINT(1) DEFAULT 1,
      center_id VARCHAR(255) DEFAULT 'center-001',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS sales (
      id VARCHAR(255) PRIMARY KEY,
      patient_name VARCHAR(255),
      quantity INT,
      unit_price DECIMAL(10,2),
      total DECIMAL(10,2),
      status VARCHAR(50),
      center_id VARCHAR(255) DEFAULT 'center-001',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS centers (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      address TEXT,
      phone VARCHAR(50),
      email VARCHAR(255),
      director_name VARCHAR(255),
      rnis VARCHAR(255),
      capacity INT,
      pispi_alias VARCHAR(255),
      is_active TINYINT(1) DEFAULT 0,
      activated_at TIMESTAMP NULL,
      activated_by VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(255) PRIMARY KEY,
      patient_id VARCHAR(255),
      patient_name VARCHAR(255) NOT NULL,
      patient_phone VARCHAR(50),
      doctor_id VARCHAR(255),
      doctor_name VARCHAR(255),
      service_name VARCHAR(255),
      appointment_date DATE NOT NULL,
      appointment_time VARCHAR(10) NOT NULL,
      duration_minutes INT DEFAULT 30,
      status VARCHAR(50) DEFAULT 'SCHEDULED',
      notes TEXT,
      sms_sent TINYINT(1) DEFAULT 0,
      reminder_sent TINYINT(1) DEFAULT 0,
      center_id VARCHAR(255) DEFAULT 'center-001',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS insurance_companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50),
      type VARCHAR(50) DEFAULT 'ASSURANCE',
      phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT,
      contact_person VARCHAR(255),
      coverage_percentage DECIMAL(10,2) DEFAULT 100.00,
      max_coverage_amount DECIMAL(15,2) DEFAULT 0.00,
      is_active TINYINT(1) DEFAULT 1,
      center_id VARCHAR(255) DEFAULT 'center-001',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS patient_insurances (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id VARCHAR(255) NOT NULL,
      insurance_company_id INT NOT NULL,
      policy_number VARCHAR(100),
      member_number VARCHAR(100),
      coverage_percentage DECIMAL(10,2),
      max_coverage_amount DECIMAL(15,2),
      is_primary TINYINT(1) DEFAULT 1,
      valid_from DATE,
      valid_until DATE,
      center_id VARCHAR(255) DEFAULT 'center-001',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS insurance_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id VARCHAR(255),
      invoice_id VARCHAR(255),
      service_id VARCHAR(255),
      consultation_id VARCHAR(255),
      total_amount DECIMAL(15,2) DEFAULT 0.00,
      patient_paid_amount DECIMAL(15,2) DEFAULT 0.00,
      insurance_coverage_amount DECIMAL(15,2) DEFAULT 0.00,
      remaining_amount DECIMAL(15,2) DEFAULT 0.00,
      insurance_company_id INT,
      status VARCHAR(50) DEFAULT 'PENDING',
      claim_reference VARCHAR(100),
      claim_date DATE,
      payment_date DATE,
      notes TEXT,
      center_id VARCHAR(255) DEFAULT 'center-001',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(15,2) DEFAULT 0.00,
      expense_date DATE NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'CASH',
      reference VARCHAR(100),
      notes TEXT,
      attachment_url VARCHAR(255),
      center_id VARCHAR(255) DEFAULT 'center-001',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS assets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      serial_number VARCHAR(100),
      purchase_date DATE,
      purchase_price DECIMAL(15,2) DEFAULT 0.00,
      current_value DECIMAL(15,2) DEFAULT 0.00,
      location VARCHAR(255),
      status VARCHAR(50) DEFAULT 'ACTIVE',
      useful_life_years INT DEFAULT 5,
      notes TEXT,
      center_id VARCHAR(255) DEFAULT 'center-001',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS inventory_general (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      quantity INT DEFAULT 0,
      unit VARCHAR(50),
      min_stock_alert INT DEFAULT 5,
      unit_price DECIMAL(10,2) DEFAULT 0.00,
      supplier VARCHAR(255),
      location VARCHAR(100),
      center_id VARCHAR(255) DEFAULT 'center-001',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    // FORCER LES COLONNES VITALES (Si les tables existaient déjà en version light)
    const vitalCols = [
      ['patients', 'firstName', 'VARCHAR(255)'],
      ['patients', 'lastName', 'VARCHAR(255)'],
      ['patients', 'age', 'INT'],
      ['patients', 'gender', 'VARCHAR(10)'],
      ['patients', 'phone', 'VARCHAR(50)'],
      ['patients', 'address', 'TEXT'],
      ['patients', 'centerId', 'VARCHAR(255)'],
      ['patients', 'center_id', 'VARCHAR(255) DEFAULT "center-001"'],
      ['tickets', 'centerId', 'VARCHAR(255)'],
      ['tickets', 'center_id', 'VARCHAR(255) DEFAULT "center-001"'],
      ['tickets', 'patient_id', 'VARCHAR(255)'],
      ['tickets', 'amount', 'DECIMAL(10,2) DEFAULT 0.00'],
      ['tickets', 'payment_method', 'VARCHAR(50) DEFAULT "CASH"'],
      ['medicines', 'generic_name', 'VARCHAR(255)'],
      ['medicines', 'stock_quantity', 'INT DEFAULT 0'],
      ['medicines', 'center_id', 'VARCHAR(255) DEFAULT "center-001"'],
      ['medicines', 'centerId', 'VARCHAR(255)'],
      ['lab_results', 'center_id', 'VARCHAR(255) DEFAULT "center-001"'],
      ['sales', 'center_id', 'VARCHAR(255) DEFAULT "center-001"'],
      ['centers', 'is_active', 'TINYINT(1) DEFAULT 0'],
      ['centers', 'activated_at', 'TIMESTAMP NULL'],
      ['centers', 'activated_by', 'VARCHAR(255) NULL'],
      ['users', 'center_id', 'VARCHAR(255) DEFAULT "center-001"'],
      ['users', 'centerId', 'VARCHAR(255) DEFAULT "center-001"'],
      ['users', 'tenant_id', 'VARCHAR(255) DEFAULT "center-001"'],
      ['users', 'specialty', 'VARCHAR(255)'],
      ['tickets', 'rejection_reason', 'TEXT'],
      ['tickets', 'rejected_by', 'VARCHAR(255)'],
      ['tickets', 'accepted_by', 'VARCHAR(255)'],
      ['appointments', 'sms_message_id', 'VARCHAR(255)'],
      ['appointments', 'sms_delivery_status', 'VARCHAR(50)'],
      ['appointments', 'sms_updated_at', 'TIMESTAMP NULL'],
      ['appointments', 'sms_opt_out', 'TINYINT(1) DEFAULT 0'],
      ['patients', 'sms_opt_out', 'TINYINT(1) DEFAULT 0'],
      ['tickets', 'insurance_id', 'INT DEFAULT NULL'],
      ['tickets', 'insurance_coverage', 'DECIMAL(10,2) DEFAULT 0.00'],
      ['appointments', 'insurance_id', 'INT DEFAULT NULL'],
      ['appointments', 'claim_reference', 'VARCHAR(100)']
    ];
    // Migrations automatiques des colonnes manquantes
    for (const [t, c, d] of vitalCols) {
      try { await query(`ALTER TABLE ${t} ADD COLUMN ${c} ${d}`); } catch(e) {}
    }

    // Compatibilité multitenant : réinjecter center_id pour les données historiques
    // (anciens enregistrements sans center_id ou avec centerId uniquement)
    try {
      await query(`UPDATE patients SET center_id = COALESCE(NULLIF(center_id, ''), NULLIF(centerId, ''), 'center-001')`);
    } catch (e) {}
    try {
      await query(`UPDATE patients SET centerId = COALESCE(NULLIF(centerId, ''), NULLIF(center_id, ''), 'center-001')`);
    } catch (e) {}
    try {
      await query(`UPDATE tickets SET center_id = COALESCE(NULLIF(center_id, ''), 'center-001')`);
    } catch (e) {}
    try {
      await query(`UPDATE consultations SET center_id = COALESCE(NULLIF(center_id, ''), 'center-001')`);
    } catch (e) {}
    try {
      await query(`UPDATE medicines SET center_id = COALESCE(NULLIF(center_id, ''), NULLIF(centerId, ''), 'center-001')`);
    } catch (e) {}
    try {
      await query(`UPDATE medicines SET centerId = COALESCE(NULLIF(centerId, ''), NULLIF(center_id, ''), 'center-001')`);
    } catch (e) {}
    try {
      await query(`UPDATE lab_results SET center_id = COALESCE(NULLIF(center_id, ''), 'center-001')`);
    } catch (e) {}
    try {
      await query(`UPDATE sales SET center_id = COALESCE(NULLIF(center_id, ''), 'center-001')`);
    } catch (e) {}

    // Migrations en arrière-plan (le reste)
    async function runAsyncMigrations() {
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));
      await sleep(5000);
      const cols = [
        ['tickets', 'patient_id', 'VARCHAR(255) AFTER ticket_number'],
        ['tickets', 'service_id', 'VARCHAR(255) AFTER patient_id'],
        ['tickets', 'doctor_id', 'VARCHAR(255) AFTER service_id'],
        ['tickets', 'patient_age', 'INT AFTER patient_name'],
        ['tickets', 'patient_gender', 'VARCHAR(10) AFTER patient_age'],
        ['tickets', 'patient_phone', 'VARCHAR(50) AFTER patient_gender'],
        ['tickets', 'patient_address', 'TEXT AFTER patient_phone'],
        ['tickets', 'amount', 'DECIMAL(10,2) DEFAULT 0.00 AFTER service_name'],
        ['tickets', 'payment_method', 'VARCHAR(50) DEFAULT "CASH" AFTER amount'],
        ['tickets', 'notes', 'TEXT AFTER payment_method'],
        ['patients', 'firstName', 'VARCHAR(255) AFTER name'],
        ['patients', 'lastName', 'VARCHAR(255) AFTER firstName'],
        ['patients', 'dateOfBirth', 'DATE AFTER lastName'],
        ['patients', 'gender', 'VARCHAR(10) AFTER dateOfBirth'],
        ['patients', 'phone', 'VARCHAR(20) AFTER gender'],
        ['patients', 'address', 'TEXT AFTER phone'],
        ['medicines', 'generic_name', 'VARCHAR(255) AFTER name'],
        ['medicines', 'stock', 'INT DEFAULT 0 AFTER stock_quantity'],
        ['medicines', 'min_stock_alert', 'INT DEFAULT 10 AFTER stock'],
        ['medicines', 'category', 'VARCHAR(255) DEFAULT "Général" AFTER stock'],
        ['exam_categories', 'id', 'VARCHAR(255) PRIMARY KEY'],
        ['exam_categories', 'name', 'VARCHAR(255) NOT NULL'],
        ['exam_categories', 'description', 'TEXT'],
        ['exam_categories', 'unit', 'VARCHAR(100)'],
        ['exam_categories', 'reference_min', 'VARCHAR(50)'],
        ['exam_categories', 'reference_max', 'VARCHAR(50)'],
        ['exam_categories', 'reference_text', 'TEXT'],
        ['exam_categories', 'category_type', 'VARCHAR(100) DEFAULT "Laboratoire"'],
        ['exam_categories', 'is_active', 'TINYINT(1) DEFAULT 1'],
        ['exam_categories', 'center_id', 'VARCHAR(255) DEFAULT "center-001"'],
        ['exam_categories', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'],
        ['exam_categories', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
        ['lab_results', 'ticket_id', 'VARCHAR(255)'],
        ['lab_results', 'consultation_id', 'VARCHAR(255)']
      ];
      for (const [t, c, d] of cols) {
        try { await query(`ALTER TABLE ${t} ADD COLUMN ${c} ${d}`); } catch (e) { }
        await sleep(500);
      }
      // Index critiques pour améliorer les performances (ORDER BY / search)
      const indexList = [
        ['patients', 'idx_p_center', '(center_id)'],
        ['patients', 'idx_p_created', '(created_at)'],
        ['tickets', 'idx_t_center', '(center_id)'],
        ['tickets', 'idx_t_created', '(created_at)'],
        ['medicines', 'idx_m_name', '(name)'],
        ['medicines', 'idx_m_center', '(center_id)'],
        ['medicines', 'idx_m_created', '(created_at)'],
        ['consultations', 'idx_c_created', '(created_at)'],
        ['lab_results', 'idx_lab_created', '(created_at)'],
        ['sales', 'idx_sales_created', '(created_at)'],
        ['centers', 'idx_centers_active_created', '(is_active, created_at)']
      ];
      for (const [t, i, c] of indexList) {
        try { await query(`ALTER TABLE ${t} ADD INDEX ${i} ${c}`); } catch (e) { }
        await sleep(300);
      }
    }

    runAsyncMigrations().catch(e => console.error('Migration error:', e));

    logToFile("INIT: OK");
    return true;
  } catch (err) {
    dbErrorLog = err.message;
    logToFile(`ECHEC DB: ${err.message}`);
    return false;
  }
}

// MODELS
export class UserModel {
  static async findAll() { return await query('SELECT * FROM users ORDER BY name'); }
  static async findById(id) {
    const res = await query('SELECT * FROM users WHERE id = ?', [id]);
    return res[0] || null;
  }
  static async findByEmail(email) {
    const res = await query('SELECT * FROM users WHERE email = ?', [email]);
    return res;
  }
  static async create(data) {
    const id = data.id || `u-${Date.now()}`;
    const centerId = data.centerId || data.center_id || data.tenant_id || 'center-001';
    await query(
      'INSERT INTO users (id, name, email, password, role, specialty, center_id, centerId, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.name, data.email, data.password || data.passwordHash, data.role || 'USER',
       data.specialty || null, centerId, centerId, centerId]
    );
    return await this.findById(id);
  }
}

export class PatientModel {
  static async findAll(centerId = null) {
    let q = 'SELECT * FROM patients';
    const params = [];
    if (centerId) {
      q += ' WHERE center_id = ? OR centerId = ?';
      params.push(centerId, centerId);
    }
    q += ' ORDER BY created_at DESC';
    const rows = await query(q, params);
    return rows.map(r => ({
      ...r,
      name: r.name || `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Inconnu',
      firstName: r.firstName || r.first_name || '',
      lastName: r.lastName || r.last_name || '',
      phoneNumber: r.phoneNumber || r.phone_number || r.phone || '',
      phone: r.phone || r.phoneNumber || r.phone_number || '',
      address: r.address || '',
      gender: r.gender || 'M'
    }));
  }
  static async findById(id, centerId = null) {
    const res = centerId
      ? await query('SELECT * FROM patients WHERE id = ? AND (center_id = ? OR centerId = ?)', [id, centerId, centerId])
      : await query('SELECT * FROM patients WHERE id = ?', [id]);
    return res[0] || null;
  }
  static async findByTicketNumber(ticketNumber) {
    return await query('SELECT * FROM patients WHERE ticket_number = ?', [ticketNumber]);
  }
  static async create(data) {
    const pid = data.id || `p-${Date.now()}`;
    const fullName = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();
    const tenantCenterId = data.centerId || data.center_id || data.tenantId || 'center-001';
    await query(
      `INSERT INTO patients (id, name, firstName, lastName, age, gender, phone, address, center_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pid, fullName, data.firstName || '', data.lastName || '', data.age || 0, data.gender || 'M', data.phone || '', data.address || '', tenantCenterId]
    );
    return await this.findById(pid);
  }
  static async update(id, data) {
    const centerId = arguments[2] || null;
    const updates = []; const params = [];
    Object.keys(data).forEach(k => {
      if (['name', 'firstName', 'lastName', 'age', 'gender', 'phone', 'address'].includes(k)) {
        updates.push(`${k} = ?`); params.push(data[k]);
      }
    });
    if (updates.length > 0) {
      params.push(id);
      if (centerId) {
        params.push(centerId, centerId);
        await query(`UPDATE patients SET ${updates.join(', ')} WHERE id = ? AND (center_id = ? OR centerId = ?)`, params);
      } else {
        await query(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`, params);
      }
    }
    return await this.findById(id, centerId);
  }
}

export class TicketModel {
  static async findAll(centerId = null) {
    const rows = centerId
      ? await query('SELECT * FROM tickets WHERE center_id = ? ORDER BY created_at DESC', [centerId])
      : await query('SELECT * FROM tickets ORDER BY created_at DESC');
    return rows.map(r => ({
      ...r,
      ticketNumber: r.ticket_number || r.ticketNumber || '',
      patientName: r.patient_name || r.patientName || 'Inconnu',
      patientAge: r.patient_age || r.patientAge || 0,
      patientGender: r.patient_gender || r.patientGender || 'M',
      serviceName: r.service_name || r.serviceName || 'Consultation',
      patientPhone: r.patient_phone || r.patientPhone || '',
      patientAddress: r.patient_address || r.patientAddress || '',
      status: r.status || 'WAITING',
      centerId: r.centerId || r.center_id || centerId || null,
      center_id: r.center_id || r.centerId || centerId || null,
      tenantId: r.tenantId || r.center_id || r.centerId || centerId || null
    }));
  }
  static async findById(id, centerId = null) {
    const res = centerId
      ? await query('SELECT * FROM tickets WHERE id = ? AND center_id = ?', [id, centerId])
      : await query('SELECT * FROM tickets WHERE id = ?', [id]);
    const r = res[0];
    if (!r) return null;

    const safeDateStr = (val) => {
      if (!val) return new Date().toISOString();
      const d = new Date(val);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    };
    const cDate = safeDateStr(r.created_at || r.createdAt);

    return {
      ...r,
      ticketNumber: r.ticket_number || r.ticketNumber || '',
      patientName: r.patient_name || r.patientName || 'Inconnu',
      patientAge: r.patient_age || r.patientAge || 0,
      patientGender: r.patient_gender || r.patientGender || 'M',
      serviceName: r.service_name || r.serviceName || 'Consultation',
      patientPhone: r.patient_phone || r.patientPhone || '',
      patientAddress: r.patient_address || r.patientAddress || '',
      status: r.status || 'WAITING',
      centerId: r.centerId || r.center_id || centerId || null,
      center_id: r.center_id || r.centerId || centerId || null,
      tenantId: r.tenantId || r.center_id || r.centerId || centerId || null,
      createdAt: cDate,
      date: cDate,
      updatedAt: safeDateStr(r.updated_at || r.updatedAt)
    };
  }
  static async create(data) {
    const tid = data.id || `t-${Date.now()}`;
    const tenantCenterId = data.centerId || data.center_id || data.tenantId || 'center-001';
    const insId = data.insuranceId || data.insurance_id || null;
    const insCov = data.insuranceCoverage || data.insurance_coverage || 0;
    
    await query(
      `INSERT INTO tickets (id, ticket_number, patient_name, patient_age, patient_gender, service_name, amount, status, center_id, insurance_id, insurance_coverage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tid, data.ticketNumber || `T-${Date.now()}`, data.patientName || '', data.patientAge || 0, data.patientGender || 'M', data.serviceName || 'Consultation', data.amount || 0, data.status || 'WAITING', tenantCenterId, insId, insCov]
    );
    return await this.findById(tid);
  }
  static async updateStatus(id, status, doctorId = null, rejectionReason = null) {
    const fields = ['status = ?'];
    const vals = [status];
    if (doctorId) { fields.push('doctor_id = ?'); vals.push(doctorId); }
    if (status === 'IN_PROGRESS' && doctorId) { fields.push('accepted_by = ?'); vals.push(doctorId); }
    if (status === 'REJECTED') {
      if (rejectionReason) { fields.push('rejection_reason = ?'); vals.push(rejectionReason); }
      if (doctorId) { fields.push('rejected_by = ?'); vals.push(doctorId); }
    }
    vals.push(id);
    await query(`UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`, vals);
    return await this.findById(id);
  }
  static async update(id, data) {
    const fields = [];
    const vals = [];
    const mapping = {
      patientName: 'patient_name',
      patientAge: 'patient_age',
      patientGender: 'patient_gender',
      serviceName: 'service_name',
      amount: 'amount',
      status: 'status',
      insuranceId: 'insurance_id',
      insurance_id: 'insurance_id',
      insuranceCoverage: 'insurance_coverage',
      insurance_coverage: 'insurance_coverage',
      patientId: 'patient_id',
      patient_id: 'patient_id',
      serviceId: 'service_id',
      service_id: 'service_id',
      doctorId: 'doctor_id',
      rejectionReason: 'rejection_reason',
      paymentMethod: 'payment_method'
    };

    for (const [key, col] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = ?`);
        vals.push(data[key]);
      }
    }

    if (fields.length === 0) return await this.findById(id);
    
    vals.push(id);
    await query(`UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`, vals);
    return await this.findById(id);
  }
  static async getServices(ticketId) {
    return await query('SELECT * FROM ticket_services WHERE ticket_id = ?', [ticketId]);
  }
}

export class MedicineModel {
  static async findAll(centerId = null) {
    const rows = centerId
      ? await query('SELECT * FROM medicines WHERE (center_id = ? OR center_id IS NULL) ORDER BY name', [centerId])
      : await query('SELECT * FROM medicines ORDER BY name');
    return rows.map(r => ({
      ...r,
      name: r.name || 'Médicament sans nom',
      genericName: r.genericName || r.generic_name || r.dci || '',
      dci: r.dci || r.generic_name || '',
      category: r.category || 'Général',
      form: r.form || '',
      stock: r.stock_quantity || r.stock || 0,
      stock_quantity: r.stock_quantity || r.stock || 0,
      minStock: r.min_stock_alert || r.minStock || 10,
      min_stock_alert: r.min_stock_alert || r.minStock || 10,
      price: parseFloat(r.price || 0),
      centerId: r.centerId || r.center_id || centerId || 'center-001',
      center_id: r.center_id || r.centerId || centerId || 'center-001'
    }));
  }
  static async findById(id, centerId = null) {
    const res = centerId
      ? await query('SELECT * FROM medicines WHERE id = ? AND (center_id = ? OR center_id IS NULL)', [id, centerId])
      : await query('SELECT * FROM medicines WHERE id = ?', [id]);
    return res[0] || null;
  }
  static async create(data) {
    const mid = data.id || `m-${Date.now()}`;
    const tenantCenterId = data.centerId || data.center_id || data.tenantId || 'center-001';
    await query(
      `INSERT INTO medicines (id, name, generic_name, stock_quantity, price, center_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [mid, data.name, data.genericName || '', data.stockQuantity || 0, data.price || 0, tenantCenterId]
    );
    return await this.findById(mid, tenantCenterId);
  }
}

// STUBS for missing but imported models
// STUBS for missing but imported models
export class ServiceModel {
  static async findAll(centerId = null) {
    const q = centerId
      ? 'SELECT * FROM services WHERE (centerId = ? OR center_id = ? OR centerId IS NULL) ORDER BY name'
      : 'SELECT * FROM services ORDER BY name';
    const rows = await query(q, centerId ? [centerId, centerId] : []);
    return rows.map(r => ({
      ...r,
      durationMinutes: r.durationMinutes || r.duration_minutes || 30,
      centerId: r.centerId || r.center_id || 'center-001'
    }));
  }
  static async findById(id) {
    const res = await query('SELECT * FROM services WHERE id = ?', [id]);
    return res[0] || null;
  }
  static async create(d) {
    const id = d.id || `service-${Date.now()}`;
    const name = d.name || d.serviceName || 'Service sans nom';
    const desc = d.description || d.notes || '';
    const cat = d.category || 'Consultation';
    const price = parseFloat(d.price || 0);
    const dur = parseInt(d.durationMinutes || d.duration_minutes || 30);
    const color = d.color || '#3b82f6';
    const tenant = d.centerId || d.center_id || d.tenantId || 'center-001';

    await query(
      `INSERT INTO services (id, name, description, category, price, durationMinutes, color, centerId, center_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, desc, cat, price, dur, color, tenant, tenant]
    );
    return await this.findById(id);
  }
}
export class ConsultationModel {
  static async findAll(filters = {}) {
    let q = 'SELECT * FROM consultations';
    const params = [];
    const where = [];
    if (filters.patientId) { where.push('patient_id = ?'); params.push(filters.patientId); }
    if (filters.patient_id) { where.push('patient_id = ?'); params.push(filters.patient_id); }
    if (filters.doctorId) { where.push('doctor_id = ?'); params.push(filters.doctorId); }
    if (filters.doctor_id) { where.push('doctor_id = ?'); params.push(filters.doctor_id); }
    if (filters.centerId) { where.push('center_id = ?'); params.push(filters.centerId); }
    if (filters.center_id) { where.push('center_id = ?'); params.push(filters.center_id); }
    
    if (where.length > 0) q += ' WHERE ' + where.join(' AND ');
    q += ' ORDER BY created_at DESC';
    
    const rows = await query(q, params);
    return rows.map(r => ({
      ...r,
      ticketId: r.ticket_id,
      patientId: r.patient_id,
      doctorId: r.doctor_id,
      doctorName: r.doctor_name || 'Inconnu',
      patientName: r.patient_name || 'Inconnu',
      diagnosis: r.diagnosis || '',
      symptoms: r.symptoms || '',
      bloodPressure: r.blood_pressure || '',
      notes: r.notes || '',
      labOrders: r.lab_orders || '[]'
    }));
  }
  static async findById(id, centerId = null) {
    const res = centerId
      ? await query('SELECT * FROM consultations WHERE id = ? AND center_id = ?', [id, centerId])
      : await query('SELECT * FROM consultations WHERE id = ?', [id]);
    if (!res[0]) return null;
    const r = res[0];
    return {
      ...r,
      ticketId: r.ticket_id,
      patientId: r.patient_id,
      doctorId: r.doctor_id,
      doctorName: r.doctor_name,
      patientName: r.patient_name,
      bloodPressure: r.blood_pressure,
      labOrders: r.lab_orders
    };
  }
  static async create(d) {
    const id = d.id || `consult-${Date.now()}`;
    const tenantCenterId = d.centerId || d.center_id || d.tenantId || 'center-001';
    const ticketId = d.ticketId || d.ticket_id || null;
    const patientId = d.patientId || d.patient_id || null;
    const doctorId = d.doctorId || d.doctor_id || null;
    const doctorName = d.doctorName || d.doctor_name || null;
    const patientName = d.patientName || d.patient_name || null;
    const bloodPressure = d.bloodPressure || d.blood_pressure || null;
    const labOrders = d.labOrders || d.lab_orders || null;

    // Idempotence: a ticket should map to a single consultation in a center.
    // If it already exists, update it instead of inserting a duplicate row.
    if (ticketId) {
      const existing = await query(
        'SELECT id FROM consultations WHERE ticket_id = ? AND center_id = ? ORDER BY created_at DESC LIMIT 1',
        [ticketId, tenantCenterId]
      );
      if (existing && existing[0]?.id) {
        const existingId = existing[0].id;
        await query(
          `UPDATE consultations
           SET patient_id = ?, doctor_id = ?, doctor_name = ?, patient_name = ?, temperature = ?, weight = ?, blood_pressure = ?, pulse = ?, diagnosis = ?, symptoms = ?, prescription = ?, lab_orders = ?, notes = ?
           WHERE id = ?`,
          [patientId, doctorId, doctorName, patientName, d.temperature, d.weight, bloodPressure, d.pulse, d.diagnosis, d.symptoms, d.prescription, labOrders, d.notes, existingId]
        );
        return await this.findById(existingId, tenantCenterId);
      }
    }

    await query(
      `INSERT INTO consultations (id, ticket_id, patient_id, doctor_id, doctor_name, patient_name, temperature, weight, blood_pressure, pulse, diagnosis, symptoms, prescription, lab_orders, notes, center_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, ticketId, patientId, doctorId, doctorName, patientName, d.temperature, d.weight, bloodPressure, d.pulse, d.diagnosis, d.symptoms, d.prescription, labOrders, d.notes, tenantCenterId]
    );
    return await this.findById(id);
  }
}
export class SettingsModel {
  static async getAll() {
    const rows = await query('SELECT setting_key, setting_value FROM settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    return settings;
  }
  static async get(key, fallback = null) {
    const res = await query('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
    return (res && res.length > 0) ? res[0].setting_value : fallback;
  }
  static async set(key, val, updatedBy = 'system') {
    const value = typeof val === 'object' ? JSON.stringify(val) : String(val);
    await query(
      `INSERT INTO settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_by = ?`,
      [key, value, updatedBy, value, updatedBy]
    );
    return true;
  }
}
export class LabResultModel {
  static async findAll(filters = {}) {
    let q = 'SELECT * FROM lab_results';
    const params = [];
    const where = [];
    if (filters.patientId) { where.push('patient_id = ?'); params.push(filters.patientId); }
    if (filters.centerId) { where.push('center_id = ?'); params.push(filters.centerId); }
    if (filters.center_id) { where.push('center_id = ?'); params.push(filters.center_id); }
    if (filters.ticketId) { where.push('ticket_id = ?'); params.push(filters.ticketId); }
    if (filters.consultationId) { where.push('consultation_id = ?'); params.push(filters.consultationId); }
    if (where.length > 0) q += ' WHERE ' + where.join(' AND ');
    q += ' ORDER BY created_at DESC';
    const rows = await query(q, params);
    return rows.map(r => ({
      ...r,
      testName: r.test_name || r.testName || 'Examen sans nom',
      patientId: r.patient_id || r.patientId || '',
      patientName: r.patient_name || r.patientName || 'Inconnu',
      doctorId: r.doctor_id || r.doctorId || '',
      doctorName: r.doctor_name || r.doctorName || 'Inconnu',
      ticketId: r.ticket_id || r.ticketId || '',
      consultationId: r.consultation_id || r.consultationId || '',
      status: r.status || 'PENDING'
    }));
  }
  static async create(d) {
    const id = d.id || `lab-${Date.now()}`;
    const tenantCenterId = d.centerId || d.center_id || d.tenantId || 'center-001';
    await query(
      `INSERT INTO lab_results (id, test_name, category, patient_id, patient_name, doctor_id, doctor_name, result, status, notes, center_id, ticket_id, consultation_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, d.testName || d.test_name, d.category, d.patientId || d.patient_id, d.patientName || d.patient_name, d.doctorId || d.doctor_id, d.doctorName || d.doctor_name, (d.result && typeof d.result === 'object' ? JSON.stringify(d.result) : d.result), d.status, d.notes, tenantCenterId, d.ticketId || d.ticket_id || null, d.consultationId || d.consultation_id || null]
    );
    return await this.findById(id, tenantCenterId);
  }
  static async findById(id, centerId = null) {
    const res = centerId
      ? await query('SELECT * FROM lab_results WHERE id = ? AND center_id = ?', [id, centerId])
      : await query('SELECT * FROM lab_results WHERE id = ?', [id]);
    if (!res[0]) return null;
    const r = res[0];
    return {
      ...r,
      testName: r.test_name,
      patientId: r.patient_id,
      patientName: r.patient_name,
      doctorId: r.doctor_id,
      doctorName: r.doctor_name,
      ticketId: r.ticket_id,
      consultationId: r.consultation_id
    };
  }
  static async update(id, data, centerId = null) {
    const updates = []; const params = [];
    Object.keys(data).forEach(k => {
      let dbKey = k;
      if (k === 'testName') dbKey = 'test_name';
      else if (k === 'patientId') dbKey = 'patient_id';
      else if (k === 'patientName') dbKey = 'patient_name';
      else if (k === 'doctorId') dbKey = 'doctor_id';
      else if (k === 'doctorName') dbKey = 'doctor_name';
      else if (k === 'ticketId') dbKey = 'ticket_id';
      else if (k === 'consultationId') dbKey = 'consultation_id';

      const allowed = [
        'test_name', 'category', 'patient_id', 'patient_name', 'doctor_id', 
        'doctor_name', 'result', 'status', 'notes', 'ticket_id', 'consultation_id'
      ];
      
      if (allowed.includes(dbKey)) {
        let val = data[k];
        if (dbKey === 'result' && val && typeof val === 'object') val = JSON.stringify(val);
        updates.push(`${dbKey} = ?`); 
        params.push(val);
      }
    });
    if (updates.length > 0) {
      params.push(id);
      if (centerId) {
        params.push(centerId);
        await query(`UPDATE lab_results SET ${updates.join(', ')} WHERE id = ? AND center_id = ?`, params);
      } else {
        await query(`UPDATE lab_results SET ${updates.join(', ')} WHERE id = ?`, params);
      }
    }
    return await this.findById(id, centerId);
  }
}
export class CenterModel {
  static async findAll(includeInactive = true) {
    if (includeInactive) {
      return await query("SELECT * FROM centers ORDER BY created_at DESC");
    }
    return await query("SELECT * FROM centers WHERE is_active = 1 ORDER BY created_at DESC");
  }
  static async findById(id) {
    const res = await query('SELECT * FROM centers WHERE id = ?', [id]);
    return res[0] || null;
  }
  static async create(d) {
    const id = d.id || `center-${Date.now()}`;
    const isActive = d.isActive || d.is_active ? 1 : 0;
    await query(
      `INSERT INTO centers (id, name, address, phone, email, director_name, rnis, capacity, pispi_alias, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, d.name, d.address, d.phone, d.email, d.directorName || d.director_name, d.rnis, d.capacity || 0, d.pispiAlias || d.pispi_alias, isActive]
    );
    return await this.findById(id);
  }

  static async setActivation(id, isActive, actorId = null) {
    await query(
      'UPDATE centers SET is_active = ?, activated_at = ?, activated_by = ? WHERE id = ?',
      [isActive ? 1 : 0, isActive ? new Date() : null, isActive ? actorId : null, id]
    );
    return await this.findById(id);
  }
}

export class SalesModel {
  static _mapRow(row) {
    if (!row) return null;
    const status = String(row.status || 'PAID').trim().toUpperCase();
    return {
      ...row,
      status,
      totalAmount: parseFloat(row.totalAmount ?? row.total ?? row.unit_price ?? 0) || 0,
      total: parseFloat(row.total ?? row.totalAmount ?? row.unit_price ?? 0) || 0,
      patientName: row.patientName || row.patient_name || 'Anonyme',
      patient_name: row.patient_name || row.patientName || 'Anonyme',
      createdAt: row.createdAt || row.created_at || new Date().toISOString(),
      created_at: row.created_at || row.createdAt,
      centerId: row.centerId || row.center_id,
      center_id: row.center_id || row.centerId
    };
  }

  static async findAll(centerId = null) {
    try {
      const rows = centerId
        ? await query('SELECT * FROM sales WHERE center_id = ? ORDER BY created_at DESC', [centerId])
        : await query('SELECT * FROM sales ORDER BY created_at DESC');
      return rows.map((r) => SalesModel._mapRow(r));
    } catch (e) {
      const rows = centerId
        ? await query('SELECT * FROM sales WHERE center_id = ? ORDER BY id DESC', [centerId])
        : await query('SELECT * FROM sales ORDER BY id DESC');
      return rows.map((r) => SalesModel._mapRow(r));
    }
  }

  static async findById(id, centerId = null) {
    const rows = centerId
      ? await query('SELECT * FROM sales WHERE id = ? AND center_id = ?', [id, centerId])
      : await query('SELECT * FROM sales WHERE id = ?', [id]);
    return rows[0] ? SalesModel._mapRow(rows[0]) : null;
  }

  static async cancel(id, centerId = null) {
    if (centerId) {
      await query(
        `UPDATE sales SET status = 'CANCELLED' WHERE id = ? AND center_id = ?`,
        [id, centerId]
      );
    } else {
      await query(`UPDATE sales SET status = 'CANCELLED' WHERE id = ?`, [id]);
    }
    return await SalesModel.findById(id, centerId);
  }
}

export class AppointmentModel {
  static async findAll(centerId = null) {
    const rows = centerId
      ? await query('SELECT * FROM appointments WHERE center_id = ? ORDER BY appointment_date ASC, appointment_time ASC', [centerId])
      : await query('SELECT * FROM appointments ORDER BY appointment_date ASC, appointment_time ASC');
    return rows.map(r => AppointmentModel._mapRow(r));
  }

  static async findById(id) {
    const res = await query('SELECT * FROM appointments WHERE id = ?', [id]);
    return res[0] ? AppointmentModel._mapRow(res[0]) : null;
  }

  static async findUpcomingForReminder(hoursAhead = 24) {
    const now = new Date();
    const future = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
    const futureStr = future.toISOString().slice(0, 19).replace('T', ' ');
    const rows = await query(
      `SELECT * FROM appointments
       WHERE status = 'SCHEDULED'
         AND reminder_sent = 0
         AND patient_phone IS NOT NULL
         AND patient_phone != ''
         AND CONCAT(appointment_date, ' ', appointment_time) BETWEEN ? AND ?`,
      [nowStr, futureStr]
    );
    return rows.map(r => AppointmentModel._mapRow(r));
  }

  static async create(data) {
    const id = data.id || `appt-${Date.now()}`;
    const centerId = data.centerId || data.center_id || 'center-001';
    await query(
      `INSERT INTO appointments (id, patient_id, patient_name, patient_phone, doctor_id, doctor_name, service_name, appointment_date, appointment_time, duration_minutes, status, notes, center_id, insurance_id, claim_reference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.patientId || null, data.patientName || 'Anonyme', data.patientPhone || null,
       data.doctorId || null, data.doctorName || null, data.serviceName || 'Consultation',
       data.appointmentDate, data.appointmentTime, data.durationMinutes || 30,
       data.status || 'SCHEDULED', data.notes || null, centerId, data.insuranceId || null, data.claimReference || null]
    );
    return await this.findById(id);
  }

  static async update(id, data) {
    const fields = [];
    const vals = [];
    if (data.status !== undefined) { fields.push('status = ?'); vals.push(data.status); }
    if (data.notes !== undefined) { fields.push('notes = ?'); vals.push(data.notes); }
    if (data.appointmentDate !== undefined) { fields.push('appointment_date = ?'); vals.push(data.appointmentDate); }
    if (data.appointmentTime !== undefined) { fields.push('appointment_time = ?'); vals.push(data.appointmentTime); }
    if (data.doctorId !== undefined) { fields.push('doctor_id = ?'); vals.push(data.doctorId); }
    if (data.doctorName !== undefined) { fields.push('doctor_name = ?'); vals.push(data.doctorName); }
    if (data.sms_sent !== undefined) { fields.push('sms_sent = ?'); vals.push(data.sms_sent ? 1 : 0); }
    if (data.reminder_sent !== undefined) { fields.push('reminder_sent = ?'); vals.push(data.reminder_sent ? 1 : 0); }
    if (data.insuranceId !== undefined) { fields.push('insurance_id = ?'); vals.push(data.insuranceId); }
    if (data.claimReference !== undefined) { fields.push('claim_reference = ?'); vals.push(data.claimReference); }
    if (fields.length === 0) return await this.findById(id);
    vals.push(id);
    await query(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`, vals);
    return await this.findById(id);
  }

  static async delete(id) {
    await query('DELETE FROM appointments WHERE id = ?', [id]);
    return { deleted: true, id };
  }

  static _mapRow(r) {
    return {
      id: r.id,
      patientId: r.patient_id || null,
      patientName: r.patient_name || 'Anonyme',
      patientPhone: r.patient_phone || '',
      doctorId: r.doctor_id || null,
      doctorName: r.doctor_name || '',
      serviceName: r.service_name || 'Consultation',
      appointmentDate: r.appointment_date ? (r.appointment_date instanceof Date ? r.appointment_date.toISOString().slice(0, 10) : String(r.appointment_date).slice(0, 10)) : '',
      appointmentTime: r.appointment_time || '',
      durationMinutes: r.duration_minutes || 30,
      status: r.status || 'SCHEDULED',
      notes: r.notes || '',
      smsSent: !!r.sms_sent,
      reminderSent: !!r.reminder_sent,
      centerId: r.center_id || 'center-001',
      insuranceId: r.insurance_id || null,
      claimReference: r.claim_reference || '',
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
    };
  }
}

export class ExamCategoryModel {
  static async findAll(centerId = null) {
    const rows = centerId
      ? await query('SELECT * FROM exam_categories WHERE center_id = ? ORDER BY name', [centerId])
      : await query('SELECT * FROM exam_categories ORDER BY name');
    return rows.map(r => ({
      ...r,
      unit: r.unit || '',
      referenceMin: r.reference_min || null,
      referenceMax: r.reference_max || null,
      referenceText: r.reference_text || '',
      centerId: r.center_id || centerId || 'center-001'
    }));
  }

  static async findById(id, centerId = null) {
    const res = centerId
      ? await query('SELECT * FROM exam_categories WHERE id = ? AND center_id = ?', [id, centerId])
      : await query('SELECT * FROM exam_categories WHERE id = ?', [id]);
    if (!res[0]) return null;
    const r = res[0];
    return {
      ...r,
      unit: r.unit || '',
      referenceMin: r.reference_min || null,
      referenceMax: r.reference_max || null,
      referenceText: r.reference_text || '',
      centerId: r.center_id || centerId || 'center-001'
    };
  }

  static async findByName(name, centerId = null) {
    const res = centerId
      ? await query('SELECT * FROM exam_categories WHERE name = ? AND center_id = ?', [name, centerId])
      : await query('SELECT * FROM exam_categories WHERE name = ?', [name]);
    if (!res[0]) return null;
    return await this.findById(res[0].id, centerId);
  }

  static async create(data) {
    const id = data.id || `cat-${Date.now()}`;
    const tenantCenterId = data.centerId || data.center_id || data.tenantId || 'center-001';
    await query(
      `INSERT INTO exam_categories (id, name, unit, reference_min, reference_max, reference_text, center_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.unit || '', data.referenceMin || null, data.referenceMax || null, data.referenceText || '', tenantCenterId]
    );
    return await this.findById(id, tenantCenterId);
  }

  static async update(id, data, centerId = null) {
    const updates = [];
    const params = [];
    
    if (data.name !== undefined) { updates.push('name = ?'); params.push(data.name); }
    if (data.unit !== undefined) { updates.push('unit = ?'); params.push(data.unit); }
    if (data.referenceMin !== undefined) { updates.push('reference_min = ?'); params.push(data.referenceMin); }
    if (data.referenceMax !== undefined) { updates.push('reference_max = ?'); params.push(data.referenceMax); }
    if (data.referenceText !== undefined) { updates.push('reference_text = ?'); params.push(data.referenceText); }
    
    if (updates.length > 0) {
      params.push(id);
      if (centerId) {
        params.push(centerId);
        await query(`UPDATE exam_categories SET ${updates.join(', ')} WHERE id = ? AND center_id = ?`, params);
      } else {
        await query(`UPDATE exam_categories SET ${updates.join(', ')} WHERE id = ?`, params);
      }
    }
    return await this.findById(id, centerId);
  }

  static async delete(id, centerId = null) {
    if (centerId) {
      await query('DELETE FROM exam_categories WHERE id = ? AND center_id = ?', [id, centerId]);
    } else {
      await query('DELETE FROM exam_categories WHERE id = ?', [id]);
    }
    return { deleted: true, id };
  }
}


export class InsuranceCompanyModel {
  static async findAll(centerId = null) {
    const q = centerId 
      ? 'SELECT * FROM insurance_companies WHERE center_id = ? ORDER BY name'
      : 'SELECT * FROM insurance_companies ORDER BY name';
    return await query(q, centerId ? [centerId] : []);
  }
  static async findById(id) {
    const res = await query('SELECT * FROM insurance_companies WHERE id = ?', [id]);
    return res[0] || null;
  }
  static async create(data) {
    const fields = ['name', 'code', 'type', 'phone', 'email', 'address', 'contact_person', 'coverage_percentage', 'max_coverage_amount', 'is_active', 'center_id'];
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => data[f] !== undefined ? data[f] : null);
    const res = await query(`INSERT INTO insurance_companies (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return await this.findById(res.insertId || res[0]?.insertId);
  }
  static async update(id, data) {
    const fields = [];
    const values = [];
    Object.keys(data).forEach(k => {
      if (['name', 'code', 'type', 'phone', 'email', 'address', 'contact_person', 'coverage_percentage', 'max_coverage_amount', 'is_active'].includes(k)) {
        fields.push(`${k} = ?`);
        values.push(data[k]);
      }
    });
    if (fields.length === 0) return await this.findById(id);
    values.push(id);
    await query(`UPDATE insurance_companies SET ${fields.join(', ')} WHERE id = ?`, values);
    return await this.findById(id);
  }
  static async delete(id) {
    return await query('DELETE FROM insurance_companies WHERE id = ?', [id]);
  }
}

export class PatientInsuranceModel {
  static async findAll(centerId = null) {
    const q = centerId
      ? 'SELECT pi.*, p.name as patient_name, ic.name as company_name FROM patient_insurances pi LEFT JOIN patients p ON pi.patient_id = p.id LEFT JOIN insurance_companies ic ON pi.insurance_company_id = ic.id WHERE pi.center_id = ?'
      : 'SELECT pi.*, p.name as patient_name, ic.name as company_name FROM patient_insurances pi LEFT JOIN patients p ON pi.patient_id = p.id LEFT JOIN insurance_companies ic ON pi.insurance_company_id = ic.id';
    return await query(q, centerId ? [centerId] : []);
  }
  static async findByPatientId(patientId) {
    const q = 'SELECT pi.*, ic.name as company_name FROM patient_insurances pi LEFT JOIN insurance_companies ic ON pi.insurance_company_id = ic.id WHERE pi.patient_id = ?';
    return await query(q, [patientId]);
  }
  static async create(data) {
    const fields = ['patient_id', 'insurance_company_id', 'policy_number', 'member_number', 'coverage_percentage', 'max_coverage_amount', 'is_primary', 'valid_from', 'valid_until', 'center_id'];
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => data[f] !== undefined ? data[f] : null);
    const res = await query(`INSERT INTO patient_insurances (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return res.insertId;
  }
  static async update(id, data) {
    const fields = [];
    const values = [];
    Object.keys(data).forEach(k => {
      if (['insurance_company_id', 'policy_number', 'member_number', 'coverage_percentage', 'max_coverage_amount', 'is_primary', 'valid_from', 'valid_until'].includes(k)) {
        fields.push(`${k} = ?`);
        values.push(data[k]);
      }
    });
    if (fields.length === 0) return;
    values.push(id);
    await query(`UPDATE patient_insurances SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  static async delete(id) {
    return await query('DELETE FROM patient_insurances WHERE id = ?', [id]);
  }
}

export class InsuranceTransactionModel {
  static async findAll(centerId = null) {
    const q = centerId
      ? 'SELECT it.*, p.name as patient_name, ic.name as company_name FROM insurance_transactions it LEFT JOIN patients p ON it.patient_id = p.id LEFT JOIN insurance_companies ic ON it.insurance_company_id = ic.id WHERE it.center_id = ? ORDER BY it.created_at DESC'
      : 'SELECT it.*, p.name as patient_name, ic.name as company_name FROM insurance_transactions it LEFT JOIN patients p ON it.patient_id = p.id LEFT JOIN insurance_companies ic ON it.insurance_company_id = ic.id ORDER BY it.created_at DESC';
    return await query(q, centerId ? [centerId] : []);
  }
  static async create(data) {
    const fields = ['patient_id', 'invoice_id', 'service_id', 'consultation_id', 'total_amount', 'patient_paid_amount', 'insurance_coverage_amount', 'remaining_amount', 'insurance_company_id', 'status', 'claim_reference', 'claim_date', 'payment_date', 'notes', 'center_id'];
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => data[f] !== undefined ? data[f] : null);
    const res = await query(`INSERT INTO insurance_transactions (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return res.insertId;
  }
  static async updateStatus(id, status, paymentDate = undefined) {
    const fields = ['status = ?'];
    const params = [status];
    
    if (paymentDate !== undefined) {
      fields.push('payment_date = ?');
      params.push(paymentDate);
    }
    
    params.push(id);
    const q = `UPDATE insurance_transactions SET ${fields.join(', ')} WHERE id = ?`;
    return await query(q, params);
  }
}
export class ExpenseModel {
  static async findAll(tenantId) { return await query('SELECT * FROM expenses WHERE center_id = ? ORDER BY expense_date DESC', [tenantId]); }
  static async create(data, tenantId) {
    const res = await query(
      'INSERT INTO expenses (category, title, amount, expense_date, payment_method, reference, notes, attachment_url, center_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.category, data.title, data.amount, data.expense_date, data.payment_method, data.reference, data.notes, data.attachment_url, tenantId]
    );
    return res.insertId;
  }
  static async update(id, data) {
    return await query(
      'UPDATE expenses SET category=?, title=?, amount=?, expense_date=?, payment_method=?, reference=?, notes=?, attachment_url=? WHERE id=?',
      [data.category, data.title, data.amount, data.expense_date, data.payment_method, data.reference, data.notes, data.attachment_url, id]
    );
  }
  static async delete(id) { return await query('DELETE FROM expenses WHERE id = ?', [id]); }
}

export class AssetModel {
  static async findAll(tenantId) { return await query('SELECT * FROM assets WHERE center_id = ? ORDER BY purchase_date DESC', [tenantId]); }
  static async create(data, tenantId) {
    const res = await query(
      'INSERT INTO assets (name, category, serial_number, purchase_date, purchase_price, current_value, location, status, useful_life_years, notes, center_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.name, data.category, data.serial_number, data.purchase_date, data.purchase_price, data.current_value, data.location, data.status, data.useful_life_years, data.notes, tenantId]
    );
    return res.insertId;
  }
  static async update(id, data) {
    return await query(
      'UPDATE assets SET name=?, category=?, serial_number=?, purchase_date=?, purchase_price=?, current_value=?, location=?, status=?, useful_life_years=?, notes=? WHERE id=?',
      [data.name, data.category, data.serial_number, data.purchase_date, data.purchase_price, data.current_value, data.location, data.status, data.useful_life_years, data.notes, id]
    );
  }
  static async delete(id) { return await query('DELETE FROM assets WHERE id = ?', [id]); }
}

export class InventoryModel {
  static async findAll(tenantId) { return await query('SELECT * FROM inventory_general WHERE center_id = ? ORDER BY name', [tenantId]); }
  static async create(data, tenantId) {
    const res = await query(
      'INSERT INTO inventory_general (name, category, quantity, unit, min_stock_alert, unit_price, supplier, location, center_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.name, data.category, data.quantity, data.unit, data.min_stock_alert, data.unit_price, data.supplier, data.location, tenantId]
    );
    return res.insertId;
  }
  static async update(id, data) {
    return await query(
      'UPDATE inventory_general SET name=?, category=?, quantity=?, unit=?, min_stock_alert=?, unit_price=?, supplier=?, location=? WHERE id=?',
      [data.name, data.category, data.quantity, data.unit, data.min_stock_alert, data.unit_price, data.supplier, data.location, id]
    );
  }
  static async delete(id) { return await query('DELETE FROM inventory_general WHERE id = ?', [id]); }
}

export default { 
  initializeDatabase, 
  query, 
  transaction, 
  UserModel, 
  TicketModel, 
  PatientModel, 
  MedicineModel, 
  ServiceModel,
  ConsultationModel,
  LabResultModel,
  ExamCategoryModel,
  SettingsModel,
  CenterModel,
  SalesModel,
  AppointmentModel,
  InsuranceCompanyModel,
  PatientInsuranceModel,
  InsuranceTransactionModel,
  ExpenseModel,
  AssetModel,
  InventoryModel,
  getDbErrorLog 
};
