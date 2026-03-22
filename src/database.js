// =============================================
// O'CLIC SANTE - Connexion Base de Données
// =============================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de la base de données
const databaseUrl = process.env.DATABASE_URL;

// On construit l'objet de configuration finale
const dbConfig = databaseUrl ? {
  uri: databaseUrl,
  ssl: (databaseUrl.includes('render.com') || databaseUrl.includes('hstgr.io') || process.env.DB_SSL === 'true') 
       ? { rejectUnauthorized: false } 
       : undefined
} : {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'oclic_sante_db',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  ssl: (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' || process.env.DB_SSL === 'true') 
       ? { rejectUnauthorized: false } 
       : undefined
};

// Pool de connexions
let pool;
let dbErrorLog = null;

export function getDbErrorLog() {
  return dbErrorLog;
}

// Initialisation de la base de données
export async function initializeDatabase() {
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

    // Tester la connexion
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log('✅ Base de données connectée avec succès');

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
        service_name VARCHAR(255),
        amount DECIMAL(10, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'WAITING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS ticket_services (
        id VARCHAR(255) PRIMARY KEY,
        ticketId VARCHAR(255) NOT NULL,
        serviceId VARCHAR(255) NOT NULL,
        serviceName VARCHAR(255),
        price DECIMAL(10, 2) DEFAULT 0.00,
        quantity INT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ticket_services_ticket (ticketId)
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
        centerId VARCHAR(255) DEFAULT 'center-001',
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

    // Corrections de schéma (idempotentes)
    const columnExists = async (table, column) => {
      const rows = await query(
        `SELECT COUNT(*) as count
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [dbConfig.database, table, column]
      );
      return rows && rows[0] && rows[0].count > 0;
    };
    const addColumnIfMissing = async (table, column, ddl) => {
      if (!(await columnExists(table, column))) {
        await query(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
      }
    };

    await addColumnIfMissing('services', 'description', 'description TEXT AFTER name');
    await addColumnIfMissing('services', 'category', 'category VARCHAR(255) DEFAULT "Consultation" AFTER name');
    await addColumnIfMissing('services', 'durationMinutes', 'durationMinutes INT DEFAULT 30 AFTER price');
    await addColumnIfMissing('services', 'centerId', 'centerId VARCHAR(255) DEFAULT "center-001" AFTER durationMinutes');
    await addColumnIfMissing('services', 'isActive', 'isActive TINYINT(1) DEFAULT 1 AFTER centerId');
    await addColumnIfMissing('services', 'createdAt', 'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfMissing('services', 'updatedAt', 'updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await addColumnIfMissing('patients', 'firstName', 'firstName VARCHAR(255) AFTER name');
    await addColumnIfMissing('patients', 'lastName', 'lastName VARCHAR(255) AFTER firstName');
    await addColumnIfMissing('patients', 'dateOfBirth', 'dateOfBirth DATE AFTER lastName');
    await addColumnIfMissing('patients', 'phoneNumber', 'phoneNumber VARCHAR(20) AFTER phone');
    await addColumnIfMissing('patients', 'centerId', "centerId VARCHAR(255) DEFAULT 'center-001' AFTER lastName");
    await addColumnIfMissing('patients', 'createdAt', 'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfMissing('patients', 'updatedAt', 'updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
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
      `SELECT * FROM ticket_services WHERE ticketId IN (${placeholders}) ORDER BY createdAt ASC`,
      ids
    );

    const servicesByTicket = new Map();
    rows.forEach(row => {
      if (!servicesByTicket.has(row.ticketId)) servicesByTicket.set(row.ticketId, []);
      servicesByTicket.get(row.ticketId).push(row);
    });

    return tickets.map(t => ({
      ...t,
      services: servicesByTicket.get(t.id) || []
    }));
  }

  static async getServices(ticketId) {
    return await query(
      'SELECT * FROM ticket_services WHERE ticketId = ? ORDER BY createdAt ASC',
      [ticketId]
    );
  }

  static async findAll(status = null) {
    let sql = `
      SELECT t.*, s.name as serviceName, s.category as serviceCategory, s.color as serviceColor, u.name as doctorName
      FROM tickets t
      LEFT JOIN services s ON t.serviceId = s.id
      LEFT JOIN users u ON t.doctorId = u.id
    `;
    const params = [];

    if (status) {
      sql += ' WHERE t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.createdAt ASC';

    const rows = await query(sql, params);
    
    // Convertir RowDataPacket en POJO simple pour éviter les problèmes de sérialisation
    const pojos = rows.map(r => ({ ...r }));
    return await this.attachServices(pojos);
  }

  static async findById(id) {
    const res = await query(`
      SELECT t.*, s.name as serviceName, s.color as serviceColor, u.name as doctorName
      FROM tickets t
      LEFT JOIN services s ON t.serviceId = s.id
      LEFT JOIN users u ON t.doctorId = u.id
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

    const normalizedServices = services.map(s => ({
      id: s.id || s.serviceId || null,
      name: s.name || s.serviceName || '',
      price: parseFloat(String(s.price ?? s.amount ?? 0)) || 0
    }));

    const totalAmount = normalizedServices.reduce((sum, s) => sum + (s.price || 0), 0);
    const serviceNames = normalizedServices
      .map(s => s.name)
      .filter(Boolean)
      .join(' + ');
    const primaryServiceId = normalizedServices[0]?.id || serviceId || null;

    await transaction(async (conn) => {
      await conn.query(
        `INSERT INTO tickets (id, ticketNumber, serviceId, doctorId, patientName, patientAge, patientGender, patientPhone, patientAddress, serviceName, amount, paymentMethod, notes, status, centerId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ticketId,
          ticketNumber || `T-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
          primaryServiceId,
          doctorId || null,
          patientName,
          patientAge,
          patientGender,
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
          `INSERT INTO ticket_services (id, ticketId, serviceId, serviceName, price, quantity)
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
