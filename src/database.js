// =============================================
// O'CLIC SANTE - Connexion Base de Données
// =============================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Configuration de la base de données (Hostinger MySQL)
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'u622816723_oclics',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'u622816723_oclics',
  dbName: process.env.DB_NAME || 'u622816723_oclics',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 20000,
  timeout: 20000,
  connectionLimit: 5,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: (process.env.DB_SSL === 'true') ? { rejectUnauthorized: false } : undefined
};

// Pool de connexions
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
  } catch (e) {
    console.error('Failed to write to log file:', e.message);
  }
}

export function getDbErrorLog() {
  return dbErrorLog;
}

// Initialisation de la base de données
export async function initializeDatabase() {
  logToFile(`INIT: Tentative de connexion DB sur ${dbConfig.host || 'URI'}...`);
  try {
    dbErrorLog = null;
    // Créer le pool de connexions (mysql2 supporte soit une chaîne URI soit un objet config)
    if (typeof dbConfig === 'string' || (dbConfig && dbConfig.uri)) {
      const uri = typeof dbConfig === 'string' ? dbConfig : dbConfig.uri;
      const options = typeof dbConfig === 'object' ? { ...dbConfig } : {};
      if (options.uri) delete options.uri; 
      
      pool = mysql.createPool(uri, options);
    } else {
      pool = mysql.createPool(dbConfig);
    }

    // Tester la connexion (version robuste)
    logToFile(`CONNEXION: Tentative sur ${dbConfig.host}:${dbConfig.port} / Base: ${dbConfig.database} / User: ${dbConfig.user}`);
    
    try {
      const [rows] = await pool.query('SELECT 1 + 1 AS solution');
      console.log('✅ Base de données connectée avec succès');
      logToFile(`SUCCÈS: Connexion DB établie.`);
    } catch (err) {
      dbErrorLog = err.message;
      logToFile(`ERREUR FATALE: ${err.message}`);
      throw err; // On laisse remonter pour que initializeDatabase catch et renvoie false
    }
    
    // Créer les tables si elles n'existent pas
    console.log('🏗️ Création/Vérification des tables...');

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'USER',
        specialty VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(255) PRIMARY KEY,
        ticket_number VARCHAR(255) UNIQUE NOT NULL,
        patient_id VARCHAR(255),
        service_id VARCHAR(255),
        doctor_id VARCHAR(255),
        patient_name VARCHAR(255),
        patient_age INT,
        patient_gender VARCHAR(10),
        patient_phone VARCHAR(50),
        patient_address TEXT,
        service_name VARCHAR(255),
        amount DECIMAL(10, 2) DEFAULT 0.00,
        payment_method VARCHAR(50) DEFAULT 'CASH',
        notes TEXT,
        status VARCHAR(50) DEFAULT 'WAITING',
        center_id VARCHAR(255) DEFAULT 'center-001',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS ticket_services (
        id VARCHAR(255) PRIMARY KEY,
        ticket_id VARCHAR(255) NOT NULL,
        service_id VARCHAR(255),
        service_name VARCHAR(255),
        price DECIMAL(10, 2) DEFAULT 0.00,
        quantity INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ts_ticket (ticket_id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        firstName VARCHAR(255),
        lastName VARCHAR(255),
        centerId VARCHAR(255) DEFAULT 'center-001',
        ticket_number VARCHAR(255) UNIQUE,
        dateOfBirth DATE,
        age INT,
        gender VARCHAR(10),
        phone VARCHAR(20),
        address TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(255) DEFAULT 'Consultation',
        price DECIMAL(10, 2) DEFAULT 0.00,
        durationMinutes INT DEFAULT 30,
        color VARCHAR(50),
        centerId VARCHAR(255) DEFAULT 'center-001',
        isActive TINYINT(1) DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS medicines (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        stock_quantity INT DEFAULT 0,
        min_stock_alert INT DEFAULT 10,
        price DECIMAL(10, 2) DEFAULT 0.00,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS lab_results (
        id VARCHAR(255) PRIMARY KEY,
        test_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'Général',
        patient_id VARCHAR(255),
        patient_name VARCHAR(255),
        doctor_id VARCHAR(255),
        doctor_name VARCHAR(255),
        result JSON,
        status VARCHAR(50) DEFAULT 'PENDING',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_lab_patient (patient_id),
        INDEX idx_lab_status (status)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(255) PRIMARY KEY,
        medicine_name VARCHAR(255),
        quantity INT DEFAULT 1,
        unit_price DECIMAL(10, 2) DEFAULT 0.00,
        total DECIMAL(10, 2) DEFAULT 0.00,
        patient_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'PAID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS consultations (
        id VARCHAR(255) PRIMARY KEY,
        ticket_id VARCHAR(255),
        patient_id VARCHAR(255),
        doctor_id VARCHAR(255),
        doctor_name VARCHAR(255),
        patient_name VARCHAR(255),
        diagnosis TEXT,
        symptoms TEXT,
        prescription TEXT,
        lab_orders TEXT,
        notes TEXT,
        temperature DECIMAL(5,2),
        weight DECIMAL(5,2),
        blood_pressure VARCHAR(50),
        pulse INT,
        center_id VARCHAR(255) DEFAULT 'center-001',
        status VARCHAR(50) DEFAULT 'COMPLETED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT,
        updated_by VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS centers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(255),
        director_name VARCHAR(255),
        rnis VARCHAR(255) UNIQUE,
        capacity INT DEFAULT 50,
        pispi_alias VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // On utilise le nom de la base configuré
    const dbName = dbConfig.database;
    logToFile(`SCHEMA: Chargement du cache pour ${dbName}...`);

    const schemaRows = await query(
      `SELECT TABLE_NAME, COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ?`,
      [dbName || 'DATABASE()']
    );
    const schemaCache = new Set(schemaRows.map(r => `${r.TABLE_NAME}.${r.COLUMN_NAME}`));

    const columnExists = (table, column) => {
      return schemaCache.has(`${table}.${column}`);
    };

    const addColumnIfMissing = async (table, column, ddl) => {
      if (!columnExists(table, column)) {
        try {
          await query(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
          // On met à jour le cache pour les appels suivants au cas où
          schemaCache.add(`${table}.${column}`);
        } catch (e) {
          console.warn(`[DB] Could not add column ${column} to ${table}:`, e.message);
        }
      }
    };
    await addColumnIfMissing('tickets', 'patient_phone', 'patient_phone VARCHAR(50) AFTER patient_gender');
    await addColumnIfMissing('tickets', 'patient_address', 'patient_address TEXT AFTER patient_phone');
    await addColumnIfMissing('tickets', 'payment_method', 'payment_method VARCHAR(50) DEFAULT "CASH" AFTER amount');
    await addColumnIfMissing('tickets', 'notes', 'notes TEXT AFTER payment_method');
    await addColumnIfMissing('tickets', 'center_id', 'center_id VARCHAR(255) DEFAULT "center-001" AFTER status');

    await addColumnIfMissing('ticket_services', 'ticket_id', 'ticket_id VARCHAR(255) AFTER id');
    await addColumnIfMissing('ticket_services', 'service_id', 'service_id VARCHAR(255) AFTER ticket_id');
    await addColumnIfMissing('ticket_services', 'service_name', 'service_name VARCHAR(255) AFTER service_id');
    await addColumnIfMissing('ticket_services', 'created_at', 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    await addColumnIfMissing('services', 'description', 'description TEXT AFTER name');
    await addColumnIfMissing('services', 'category', 'category VARCHAR(255) DEFAULT "Consultation" AFTER name');
    await addColumnIfMissing('services', 'duration_minutes', 'duration_minutes INT DEFAULT 30 AFTER price');
    await addColumnIfMissing('services', 'center_id', 'center_id VARCHAR(255) DEFAULT "center-001" AFTER duration_minutes');
    await addColumnIfMissing('services', 'is_active', 'is_active TINYINT(1) DEFAULT 1 AFTER center_id');
    await addColumnIfMissing('services', 'created_at', 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfMissing('services', 'updated_at', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    
    await addColumnIfMissing('patients', 'first_name', 'first_name VARCHAR(255) AFTER name');
    await addColumnIfMissing('patients', 'last_name', 'last_name VARCHAR(255) AFTER first_name');
    await addColumnIfMissing('patients', 'date_of_birth', 'date_of_birth DATE AFTER last_name');
    await addColumnIfMissing('patients', 'phone_number', 'phone_number VARCHAR(20) AFTER phone');
    await addColumnIfMissing('patients', 'phoneNumber', 'phoneNumber VARCHAR(20) AFTER phone_number');
    await addColumnIfMissing('patients', 'birthDate', 'birthDate DATE AFTER dateOfBirth');
    await addColumnIfMissing('patients', 'bloodGroup', 'bloodGroup VARCHAR(10) AFTER gender');
    await addColumnIfMissing('patients', 'blood_group', 'blood_group VARCHAR(10) AFTER bloodGroup');
    await addColumnIfMissing('patients', 'allergies', 'allergies TEXT AFTER blood_group');
    await addColumnIfMissing('patients', 'emergencyContact', 'emergencyContact VARCHAR(255) AFTER address');
    await addColumnIfMissing('patients', 'emergency_contact', 'emergency_contact VARCHAR(255) AFTER emergencyContact');
    await addColumnIfMissing('patients', 'email', 'email VARCHAR(255) AFTER emergency_contact');
    await addColumnIfMissing('patients', 'center_id', "center_id VARCHAR(255) DEFAULT 'center-001' AFTER last_name");
    await addColumnIfMissing('patients', 'created_at', 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfMissing('patients', 'updated_at', 'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    
    await addColumnIfMissing('medicines', 'stock', 'stock INT DEFAULT 0 AFTER stock_quantity');
    await addColumnIfMissing('medicines', 'minStock', 'minStock INT DEFAULT 10 AFTER min_stock_alert');
    try { await query("UPDATE medicines SET stock = stock_quantity WHERE stock = 0 AND stock_quantity > 0"); } catch (e) { }
    try { await query("UPDATE medicines SET minStock = min_stock_alert WHERE minStock = 10 AND min_stock_alert > 0"); } catch (e) { }
    try { await query("UPDATE patients SET centerId = 'center-001' WHERE centerId IS NULL"); } catch (e) { }
    try { await query("UPDATE patients SET phoneNumber = phone WHERE phoneNumber IS NULL AND phone IS NOT NULL"); } catch (e) { }

    // Données par défaut (uniquement si les tables sont vides)
    const servicesCount = await query("SELECT COUNT(*) as count FROM services");
    if (servicesCount[0].count === 0) {
      console.log('🌱 Insertion des services par défaut...');
      await query(`
        INSERT INTO services (id, name, description, category, price, durationMinutes, color, centerId, isActive) VALUES 
        ('s1', 'Consultation Générale', 'Examen clinique de routine', 'Consultation', 5000, 20, '#3b82f6', 'center-001', 1),
        ('s2', 'Consultation Pédiatrique', 'Spécialisé enfants 0-14 ans', 'Consultation', 7500, 30, '#10b981', 'center-001', 1),
        ('s3', 'Urgences', 'Prise en charge immédiate', 'Urgences', 15000, 60, '#ef4444', 'center-001', 1),
        ('s4', 'Analyse Sanguine (NFS)', 'Bilan laboratoire complet', 'Laboratoire', 12000, 15, '#a855f7', 'center-001', 1)
      `);
    }

    const centersCount = await query("SELECT COUNT(*) as count FROM centers");
    if (centersCount[0].count === 0) {
      console.log("🌱 Insertion du centre par défaut...");
      await query(`
        INSERT INTO centers (id, name, address, phone, email, director_name, capacity, is_active) VALUES 
        ('center-001', 'O''CLIC SANTE Principal', 'Dakar, Sénégal', '+221 77 000 00 00', 'contact@sante.quantum221.com', 'Dr. Sylla', 100, 1)
      `);
    }

    const usersCount = await query("SELECT COUNT(*) as count FROM users");
    if (usersCount[0].count <= 1) {
      console.log("🌱 Insertion du personnel par défaut...");
      await query(`
        INSERT IGNORE INTO users (id, name, email, password, role, specialty) VALUES 
        ('admin-001', 'Administrateur O''CLIC SANTE', 'admin@sante.quantum221.com', '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO', 'SUPER_ADMIN', NULL),
        ('doc-001', 'Dr. Amet Fall', 'docteur@sante.quantum221.com', '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO', 'DOCTOR', 'Médecine Générale'),
        ('doc-002', 'Dr. Sophie Ndiaye', 'pediatre@sante.quantum221.com', '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO', 'DOCTOR', 'Pédiatrie'),
        ('nurse-001', 'Infirmier Aliou', 'infirmier@sante.quantum221.com', '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO', 'NURSE', NULL)
      `);
    }

    const medicinesCount = await query("SELECT COUNT(*) as count FROM medicines");
    if (medicinesCount[0].count === 0) {
      console.log('🌱 Insertion des médicaments de base...');
      await query(`
        INSERT INTO medicines (id, name, stock_quantity, min_stock_alert, price) VALUES 
        ('m1', 'Paracétamol 500mg', 100, 20, 500),
        ('m2', 'Amoxicilline 500mg', 50, 10, 2500),
        ('m3', 'Ibuprofène 400mg', 80, 15, 1200),
        ('m4', 'Vitamine C 1000mg', 150, 30, 800),
        ('m5', 'Bétadine dermique', 20, 5, 3500)
      `);
    }

    const patientsCount = await query("SELECT COUNT(*) as count FROM patients");
    if (patientsCount[0].count === 0 || patientsCount[0].count <= 5) {
      console.log('🌱 Insertion/Mise à jour des patients avec dates de naissance...');
      await query(`
        REPLACE INTO patients (id, name, firstName, lastName, centerId, ticket_number, age, gender, phone, address, dateOfBirth) VALUES 
        ('p1', 'Mamadou Diop', 'Mamadou', 'Diop', 'center-001', 'T-2024-001', 35, 'M', '+221 77 123 45 67', 'Dakar Plateau', '1989-05-15'),
        ('p2', 'Aissatou Sow', 'Aissatou', 'Sow', 'center-001', 'T-2024-002', 28, 'F', '+221 78 456 78 90', 'Mermoz, Dakar', '1996-10-20'),
        ('p3', 'Fatou Ndiaye', 'Fatou', 'Ndiaye', 'center-001', 'T-2024-003', 42, 'F', '+221 70 987 65 43', 'Sacre-Cœur, Dakar', '1982-03-30')
      `);
    }

    console.log('✅ Structure de la base de données prête');
    return true;
  } catch (error) {
    dbErrorLog = error.message;
    console.error('❌ Erreur d\'initialisation de la base de données:', error.message);
    logToFile(`CRITICAL DB ERROR: ${error.stack || error.message}`);
    return false;
  }
}

// Exécuter une requête
export async function query(sql, params = []) {
  try {
    if (!pool) {
      throw new Error('Base de données non initialisée');
    }

    // Nettoyer les paramètres : remplacer undefined par null pour MySQL
    const cleanParams = Array.isArray(params) ? params.map(p => p === undefined ? null : p) : [];

    // Utiliser .query pour plus de flexibilité (évite les erreurs de type sur les paramètres)
    const [rows] = await pool.query(sql, cleanParams);

    // S'assurer de toujours retourner un tableau
    return Array.isArray(rows) ? rows : (rows ? [rows] : []);
  } catch (error) {
    console.error('Erreur SQL:', error.message);
    throw error;
  }
}

// Transaction
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

// Fermer la base de données
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('📴 Base de données fermée');
  }
}

// =============================================
// MODÈLES DE DONNÉES
// =============================================

export class CenterModel {
  static async findAll() {
    return await query("SELECT * FROM centers ORDER BY name ASC");
  }

  static async findById(id) {
    const rows = await query("SELECT * FROM centers WHERE id = ?", [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async create(centerData) {
    const {
      id, name, address, phone, email, directorName, rnis, capacity, pispiAlias
    } = centerData;

    await query(`
      INSERT INTO centers (id, name, address, phone, email, director_name, rnis, capacity, pispi_alias)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id || `center-${Date.now()}`, name, address, phone, email, directorName, rnis, capacity || 50, pispiAlias]);

    const res = await query("SELECT * FROM centers WHERE name = ?", [name]);
    return res.length > 0 ? res[0] : null;
  }
}

export class UserModel {
  static async findById(id) {
    return await query('SELECT * FROM users WHERE id = ?', [id]);
  }

  static async findByEmail(email) {
    return await query('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findAll() {
    return await query('SELECT id, name, email, role, specialty FROM users ORDER BY name');
  }

  static async create(userData) {
    const { id, name, email, passwordHash, role, specialite = null } = userData;
    await query(
      'INSERT INTO users (id, name, email, password, role, specialty) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, passwordHash, role, specialite]
    );
  }
}

export class TicketModel {
  static async attachServices(tickets) {
    if (!tickets || tickets.length === 0) return [];

    const ids = tickets.map(t => t.id).filter(Boolean);
    if (ids.length === 0) return tickets;

    const placeholders = ids.map(() => '?').join(', ');
    const rows = await query(
      `SELECT * FROM ticket_services WHERE ticket_id IN (${placeholders}) ORDER BY created_at ASC`,
      ids
    );

    const servicesByTicket = new Map();
    rows.forEach(row => {
      const tid = row.ticket_id || row.ticketId;
      if (!servicesByTicket.has(tid)) servicesByTicket.set(tid, []);
      // Map for frontend
      servicesByTicket.get(tid).push({
        ...row,
        ticketId: row.ticket_id || row.ticketId,
        serviceId: row.service_id || row.serviceId,
        serviceName: row.service_name || row.serviceName,
        createdAt: row.created_at || row.createdAt
      });
    });

    return tickets.map(t => ({
      ...t,
      services: servicesByTicket.get(t.id) || []
    }));
  }

  static async getServices(ticketId) {
    const rows = await query(
      'SELECT * FROM ticket_services WHERE ticket_id = ? ORDER BY created_at ASC',
      [ticketId]
    );
    return rows.map(row => ({
      ...row,
      ticketId: row.ticket_id || row.ticketId,
      serviceId: row.service_id || row.serviceId,
      serviceName: row.service_name || row.serviceName,
      createdAt: row.created_at || row.createdAt
    }));
  }

  static async findAll(status = null) {
    let sql = `
      SELECT t.*, s.name as serviceName, s.category as serviceCategory, s.color as serviceColor, u.name as doctorName
      FROM tickets t
      LEFT JOIN services s ON t.service_id = s.id
      LEFT JOIN users u ON t.doctor_id = u.id
    `;
    const params = [];

    if (status) {
      sql += ' WHERE t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.created_at ASC';

    const rows = await query(sql, params);
    
    // Convertir RowDataPacket en POJO simple et Mapper snake_case vers camelCase pour compatibilité Frontend
    const pojos = rows.map(r => {
      // Nettoyage de l'âge pour éviter "NaN" dans le JSON
      const rawAge = r.patient_age ?? r.patientAge ?? r.age ?? 0;
      const cleanAge = parseInt(rawAge);
      
      return { 
        ...r,
        ticketNumber: r.ticket_number || r.ticketNumber,
        patientId: r.patient_id || r.patientId,
        serviceId: r.service_id || r.serviceId,
        doctorId: r.doctor_id || r.doctorId,
        patientName: r.patient_name || r.patientName || r.name,
        patientAge: isNaN(cleanAge) ? 0 : cleanAge,
        patientGender: r.patient_gender || r.patientGender || r.gender,
        patientPhone: r.patient_phone || r.patientPhone || r.phone,
        patientAddress: r.patient_address || r.patientAddress || r.address,
        serviceName: r.service_name || r.serviceName,
        paymentMethod: r.payment_method || r.paymentMethod,
        centerId: r.center_id || r.centerId,
        createdAt: r.created_at || r.createdAt,
        updatedAt: r.updated_at || r.updatedAt
      };
    });
    return await this.attachServices(pojos);
  }

  static async findById(id) {
    const res = await query(`
      SELECT t.*, s.name as serviceName, s.color as serviceColor, u.name as doctorName
      FROM tickets t
      LEFT JOIN services s ON t.service_id = s.id
      LEFT JOIN users u ON t.doctor_id = u.id
      WHERE t.id = ?
    `, [id]);
    if (!res || res.length === 0) return null;
    const [withServices] = await this.attachServices([res[0]]);
    return withServices || null;
  }

  static async create(ticketData) {
    const {
      id,
      ticketNumber,
      serviceId,
      doctorId,
      patientId,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientAddress,
      serviceName,
      amount,
      paymentMethod,
      notes,
      status,
      centerId
    } = ticketData;

    const ticketId = id || `ticket-${Date.now()}`;

    const services = Array.isArray(ticketData.services) && ticketData.services.length > 0
      ? ticketData.services
      : (serviceId || serviceName ? [{
        id: serviceId,
        name: serviceName,
        price: amount || 0
      }] : []);

    const normalizedServices = services.map(s => {
      if (typeof s === 'string') return { id: s, name: '', price: 0 };
      const rawPrice = s.price ?? s.amount ?? 0;
      const cleanPriceStr = String(rawPrice).replace(',', '.').replace(/\s/g, '');
      return {
        id: s.id || s.serviceId || null,
        name: s.name || s.serviceName || '',
        price: parseFloat(cleanPriceStr) || 0
      };
    });

    // RECONTRUITS LES NOMS SI MANQUANTS (SECOURS)
    if (!!pool && normalizedServices.length > 0) {
      for (let i = 0; i < normalizedServices.length; i++) {
        if (!normalizedServices[i].name && normalizedServices[i].id) {
          try {
            const [found] = await query('SELECT name, price FROM services WHERE id = ? LIMIT 1', [normalizedServices[i].id]);
            if (found) {
              normalizedServices[i].name = found.name;
              if (normalizedServices[i].price === 0) normalizedServices[i].price = parseFloat(found.price);
            }
          } catch (e) { /* ignore */ }
        }
      }
    }

    const totalAmount = normalizedServices.reduce((sum, s) => sum + (s.price || 0), 0);
    const serviceNames = normalizedServices
      .map(s => s.name)
      .filter(Boolean)
      .join(' + ');
    const primaryServiceId = normalizedServices[0]?.id || serviceId || null;

    await transaction(async (conn) => {
      await conn.query(
        `INSERT INTO tickets (id, ticket_number, service_id, doctor_id, patient_id, patient_name, patient_age, patient_gender, patient_phone, patient_address, service_name, amount, payment_method, notes, status, center_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ticketId,
          ticketNumber || `T-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
          primaryServiceId,
          doctorId || null,
          patientId || null,
          patientName,
          parseInt(patientAge) || 0,
          patientGender || 'M',
          patientPhone || null,
          patientAddress || null,
          serviceNames || serviceName || 'Consultation',
          totalAmount || amount || 0,
          paymentMethod || 'CASH',
          notes || null,
          status || 'WAITING',
          centerId || 'center-001'
        ]
      );

      for (const svc of normalizedServices) {
        const linkId = `ts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await conn.query(
          `INSERT INTO ticket_services (id, ticket_id, service_id, service_name, price, quantity)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            linkId,
            ticketId,
            svc.id,
            svc.name,
            svc.price || 0,
            1
          ]
        );
      }
    });

    return await this.findById(ticketId);
  }

  static async updateStatus(id, status, doctorId = null) {
    await query(
      'UPDATE tickets SET status = ?, doctorId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [status, doctorId, id]
    );

    return await this.findById(id);
  }
}

export class PatientModel {
  static async findAll() {
    return await query('SELECT * FROM patients ORDER BY id DESC');
  }

  static async findById(id) {
    const res = await query('SELECT * FROM patients WHERE id = ?', [id]);
    return res && res.length > 0 ? res[0] : null;
  }

  static async findByTicketNumber(ticketNumber) {
    return await query('SELECT * FROM patients WHERE ticket_number = ?', [ticketNumber]);
  }

  static async create(patientData) {
    const {
      id, name, firstName, lastName, email, phone, age, gender, address,
      centerId, bloodGroup, allergies, emergencyContact, dateOfBirth
    } = patientData;

    const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Anonyme';
    const pid = id || `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const dob = dateOfBirth || null;

    await query(
      `INSERT INTO patients (
        id, name, firstName, lastName, email, phone, phoneNumber, age, gender, address, 
        centerId, bloodGroup, allergies, emergencyContact, dateOfBirth, birthDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pid, fullName, firstName || '', lastName || '', email || null,
        phone || null, phone || null, age || null, gender || 'M', address || null,
        centerId || 'center-001', bloodGroup || null, allergies || null,
        emergencyContact || null, dob, dob
      ]
    );
    return await this.findById(pid);
  }

  static async update(id, patientData) {
    // Whitelist of allowed fields to prevent SQL injection
    const allowedFields = ['name', 'firstName', 'lastName', 'email', 'phone', 'age', 'gender', 'address', 'centerId', 'bloodGroup', 'allergies', 'emergencyContact', 'dateOfBirth'];

    const fields = [];
    const params = [];

    Object.keys(patientData).forEach(key => {
      // Only allow whitelisted fields
      if (allowedFields.includes(key) && patientData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(patientData[key]);
      }
    });

    if (fields.length === 0) {
      return await this.findById(id); // No valid fields to update
    }

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    params.push(id);

    await query(`UPDATE patients SET ${fields.join(', ')} WHERE id = ?`, params);

    return await this.findById(id);
  }
}

export class ServiceModel {
  static async findAll() {
    // Utilise isActive (tinyint) détecté en base
    return await query('SELECT * FROM services WHERE isActive = 1 ORDER BY name');
  }

  static async findById(id) {
    return await query('SELECT * FROM services WHERE id = ?', [id]);
  }

  static async create(serviceData) {
    const { id, name, description, price, durationMinutes, color, category, centerId } = serviceData;
    const sid = id || `service-${Date.now()}`;

    // Use consistent column names (camelCase for new schema)
    await query(
      `INSERT INTO services (id, name, description, price, durationMinutes, color, category, centerId, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [sid, name, description || '', price || 0,
        durationMinutes || 30, color || '#3b82f6',
        category || 'Consultation', centerId || 'center-001']
    );

    return await this.findById(sid);
  }
}

export class MedicineModel {
  static async findAll() {
    return await query('SELECT * FROM medicines ORDER BY name');
  }

  static async findById(id) {
    return await query('SELECT * FROM medicines WHERE id = ?', [id]);
  }

  static async findByCategory(category) {
    return await query('SELECT * FROM medicines WHERE category = ? ORDER BY name', [category]);
  }

  static async create(medicineData) {
    const { id, name, genericName, description, category, unit, stockQuantity, minStockAlert, price, supplier, expiryDate, storageConditions } = medicineData;

    await query(`
      INSERT INTO medicines (id, name, generic_name, description, category, unit, stock_quantity, min_stock_alert, price, supplier, expiry_date, storage_conditions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, genericName, description, category, unit, stockQuantity, minStockAlert, price, supplier, expiryDate, storageConditions]);

    return await this.findById(id);
  }

  static async updateStock(id, quantity) {
    await query(
      'UPDATE medicines SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, id]
    );

    return await this.findById(id);
  }

  static async getLowStock() {
    return await query(`
      SELECT * FROM medicines 
      WHERE stock_quantity <= min_stock_alert AND active = TRUE 
      ORDER BY stock_quantity ASC
    `);
  }
}

export class ConsultationModel {
  static async findAll(patientIdOrFilters = null, doctorId = null, date = null) {
    let patientId = patientIdOrFilters;
    let patientName = null;

    if (patientIdOrFilters && typeof patientIdOrFilters === 'object' && !Array.isArray(patientIdOrFilters)) {
      patientId = patientIdOrFilters.patientId || patientIdOrFilters.patient_id || null;
      patientName = patientIdOrFilters.patientName || patientIdOrFilters.patient_name || null;
      doctorId = patientIdOrFilters.doctorId || patientIdOrFilters.doctor_id || doctorId || null;
      date = patientIdOrFilters.date || date || null;
    }

    let sql = `SELECT * FROM consultations`;
    const conditions = [];
    const params = [];

    if (patientId && patientName) {
      conditions.push('(patient_id = ? OR patient_name = ?)');
      params.push(patientId, patientName);
    } else if (patientId) {
      conditions.push('patient_id = ?');
      params.push(patientId);
    } else if (patientName) {
      conditions.push('patient_name = ?');
      params.push(patientName);
    }

    if (doctorId) {
      conditions.push('doctor_id = ?');
      params.push(doctorId);
    }

    if (date) {
      conditions.push('DATE(created_at) = ?');
      params.push(date);
    }

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    return await query(sql, params);
  }

  static async findById(id) {
    const res = await query('SELECT * FROM consultations WHERE id = ?', [id]);
    return res && res.length > 0 ? res[0] : null;
  }

  static async create(consultationData) {
    const {
      id, ticketId, patientId, doctorId, diagnosis, symptoms, prescription,
      notes, doctorName, patientName, centerId, temperature, weight, bloodPressure, pulse, labOrders
    } = consultationData;

    await query(`
      INSERT INTO consultations (
        id, ticket_id, patient_id, doctor_id, doctor_name, patient_name,
        temperature, weight, blood_pressure, pulse,
        symptoms, diagnosis, notes, prescription, lab_orders, center_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, ticketId || null, patientId || null, doctorId || null,
      doctorName || null, patientName || '',
      temperature || null, weight || null, bloodPressure || null, pulse || null,
      symptoms || null, diagnosis || null, notes || null, prescription || null,
      labOrders || null, centerId || 'center-001'
    ]);

    return await this.findById(id);
  }

  static async updateStatus(id, status) {
    await query('UPDATE consultations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return await this.findById(id);
  }
}

export class SettingsModel {
  static async getAll() {
    const settings = await query('SELECT * FROM settings');
    const result = {};

    settings.forEach(setting => {
      result[setting.setting_key] = setting.setting_value;
    });

    return result;
  }

  static async get(key) {
    const result = await query('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
    return result.length > 0 ? result[0].setting_value : null;
  }

  static async set(key, value, updatedBy) {
    await query(
      'INSERT INTO settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP',
      [key, value, updatedBy, value, updatedBy]
    );

    return await this.get(key);
  }
}

export class LabResultModel {
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM lab_results';
    const conditions = [];
    const params = [];

    if (filters.patientId) {
      conditions.push('patient_id = ?');
      params.push(filters.patientId);
    }

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';
    return await query(sql, params);
  }

  static async findById(id) {
    const res = await query('SELECT * FROM lab_results WHERE id = ?', [id]);
    return (res && res.length > 0) ? res[0] : null;
  }

  static async create(data) {
    const {
      id, testName, category, patientId, patientName, doctorId, doctorName, result, status, notes
    } = data;

    const rid = id || `lab-${Date.now()}`;
    // Convert result to JSON string if it's an object
    const resultStr = result && typeof result === 'object' ? JSON.stringify(result) : (result || '{}');

    await query(`
      INSERT INTO lab_results (
        id, test_name, category, patient_id, patient_name, doctor_id, doctor_name, result, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      rid, testName, category || 'Général', patientId, patientName, doctorId, doctorName,
      resultStr, status || 'PENDING', notes || null
    ]);

    return await this.findById(rid);
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    if (data.status) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (data.result) {
      updates.push('result = ?');
      params.push(typeof data.result === 'object' ? JSON.stringify(data.result) : data.result);
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    if (updates.length === 0) return await this.findById(id);

    params.push(id);
    await query(`UPDATE lab_results SET ${updates.join(', ')} WHERE id = ?`, params);
    return await this.findById(id);
  }
}

export default {
  initializeDatabase,
  query,
  transaction,
  closeDatabase,
  UserModel,
  CenterModel,
  TicketModel,
  PatientModel,
  ServiceModel,
  MedicineModel,
  ConsultationModel,
  SettingsModel,
  LabResultModel,
  getDbErrorLog
};
