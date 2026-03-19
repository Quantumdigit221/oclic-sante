// =============================================
// O'CLIC SANTE - Connexion Base de Données
// =============================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'oclic_sante_db',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Pool de connexions
let pool;

// Initialisation de la base de données
export async function initializeDatabase() {
  try {
    // Créer le pool de connexions
    pool = mysql.createPool(dbConfig);
    
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
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        ticket_number VARCHAR(255) UNIQUE,
        age INT,
        gender VARCHAR(10),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) DEFAULT 0.00,
        color VARCHAR(50),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    console.log('✅ Structure de la base de données prête');
    return true;
  } catch (error) {
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
    
    const [rows] = await pool.execute(sql, params);
    return rows;
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
  static async findAll(status = null) {
    let sql = `
      SELECT t.*, s.name as service_name, s.color as service_color, u.name as doctor_name
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
    
    return await query(sql, params);
  }
  
  static async findById(id) {
    return await query(`
      SELECT t.*, s.name as service_name, s.color as service_color, u.name as doctor_name
      FROM tickets t
      LEFT JOIN services s ON t.service_id = s.id
      LEFT JOIN users u ON t.doctor_id = u.id
      WHERE t.id = ?
    `, [id]);
  }
  
  static async create(ticketData) {
    const { id, ticketNumber, patientId, serviceId, patientName, patientAge, patientGender, serviceName, amount } = ticketData;
    
    await query(`
      INSERT INTO tickets (id, ticket_number, patient_id, service_id, patient_name, patient_age, patient_gender, service_name, amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, ticketNumber, patientId, serviceId, patientName, patientAge, patientGender, serviceName, amount]);
    
    return await this.findById(id);
  }
  
  static async updateStatus(id, status, doctorId = null) {
    await query(
      'UPDATE tickets SET status = ?, doctor_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, doctorId, id]
    );
    
    return await this.findById(id);
  }
}

export class PatientModel {
  static async findAll() {
    return await query('SELECT * FROM patients ORDER BY created_at DESC');
  }
  
  static async findById(id) {
    return await query('SELECT * FROM patients WHERE id = ?', [id]);
  }
  
  static async findByTicketNumber(ticketNumber) {
    return await query('SELECT * FROM patients WHERE ticket_number = ?', [ticketNumber]);
  }
  
  static async create(patientData) {
    const { id, ticketNumber, name, email, phone, dateOfBirth, gender, address, emergencyContact, bloodType, allergies, chronicDiseases } = patientData;
    
    await query(`
      INSERT INTO patients (id, ticket_number, name, email, phone, date_of_birth, gender, address, emergency_contact, blood_type, allergies, chronic_diseases)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, ticketNumber, name, email, phone, dateOfBirth, gender, address, emergencyContact, bloodType, allergies, chronicDiseases]);
    
    return await this.findById(id);
  }
  
  static async update(id, patientData) {
    const fields = [];
    const params = [];
    
    Object.keys(patientData).forEach(key => {
      if (patientData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(patientData[key]);
      }
    });
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await query(`UPDATE patients SET ${fields.join(', ')} WHERE id = ?`, params);
    
    return await this.findById(id);
  }
}

export class ServiceModel {
  static async findAll() {
    return await query('SELECT * FROM services WHERE active = TRUE ORDER BY name');
  }
  
  static async findById(id) {
    return await query('SELECT * FROM services WHERE id = ?', [id]);
  }
  
  static async create(serviceData) {
    const { id, name, description, price, durationMinutes, color } = serviceData;
    
    await query(
      'INSERT INTO services (id, name, description, price, duration_minutes, color) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description, price, durationMinutes, color]
    );
    
    return await this.findById(id);
  }
}

export class MedicineModel {
  static async findAll() {
    return await query('SELECT * FROM medicines WHERE active = TRUE ORDER BY name');
  }
  
  static async findById(id) {
    return await query('SELECT * FROM medicines WHERE id = ?', [id]);
  }
  
  static async findByCategory(category) {
    return await query('SELECT * FROM medicines WHERE category = ? AND active = TRUE ORDER BY name', [category]);
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
  static async findAll(patientId = null, doctorId = null, date = null) {
    let sql = `
      SELECT c.*, p.name as patient_name, p.ticket_number, u.name as doctor_name, s.name as service_name
      FROM consultations c
      JOIN patients p ON c.patient_id = p.id
      JOIN users u ON c.doctor_id = u.id
      JOIN tickets t ON c.ticket_id = t.id
      JOIN services s ON t.service_id = s.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (patientId) {
      conditions.push('c.patient_id = ?');
      params.push(patientId);
    }
    
    if (doctorId) {
      conditions.push('c.doctor_id = ?');
      params.push(doctorId);
    }
    
    if (date) {
      conditions.push('DATE(c.consultation_date) = ?');
      params.push(date);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY c.consultation_date DESC';
    
    return await query(sql, params);
  }
  
  static async findById(id) {
    return await query(`
      SELECT c.*, p.name as patient_name, p.ticket_number, u.name as doctor_name, s.name as service_name
      FROM consultations c
      JOIN patients p ON c.patient_id = p.id
      JOIN users u ON c.doctor_id = u.id
      JOIN tickets t ON c.ticket_id = t.id
      JOIN services s ON t.service_id = s.id
      WHERE c.id = ?
    `, [id]);
  }
  
  static async create(consultationData) {
    const { id, ticketId, patientId, doctorId, diagnosis, symptoms, prescription, recommendations, followUpDate, notes } = consultationData;
    
    await query(`
      INSERT INTO consultations (id, ticket_id, patient_id, doctor_id, diagnosis, symptoms, prescription, recommendations, follow_up_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, ticketId, patientId, doctorId, diagnosis, symptoms, prescription, recommendations, followUpDate, notes]);
    
    return await this.findById(id);
  }
  
  static async updateStatus(id, status) {
    await query(
      'UPDATE consultations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    
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
  SettingsModel
};
