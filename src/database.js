// =============================================
// O'CLIC SANTE - Connexion Base de Données (RESCUE VERSION)
// =============================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'u622816723_oclics',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'u622816723_oclics',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 20000,
  connectionLimit: 5,
  enableKeepAlive: true,
  ssl: (process.env.DB_SSL === 'true') ? { rejectUnauthorized: false } : undefined
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
    const [rows] = await pool.query(sql, cleanParams);
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

export async function initializeDatabase() {
  logToFile(`INIT: Connexion sur ${dbConfig.host}...`);
  try {
    dbErrorLog = null;
    // CRITIQUE : mysql2/promise utilise .createPool() directement sur l'objet importé
    pool = mysql.createPool(dbConfig);


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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await query(`CREATE TABLE IF NOT EXISTS settings (
      setting_key VARCHAR(255) PRIMARY KEY, 
      setting_value TEXT,
      updated_by VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    // Migrations en arrière-plan
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
        ['medicines', 'category', 'VARCHAR(255) DEFAULT "Général" AFTER stock']
      ];
      for (const [t, c, d] of cols) {
        try { await query(`ALTER TABLE ${t} ADD COLUMN ${c} ${d}`); } catch (e) { }
        await sleep(500);
      }
      // Index
      try { await query(`ALTER TABLE patients ADD INDEX idx_p_center (center_id)`); } catch (e) { }
      try { await query(`ALTER TABLE tickets ADD INDEX idx_t_center (center_id)`); } catch (e) { }
    }

    runAsyncMigrations().catch(e => console.error('Migration error:', e));

    logToFile("INIT: OK");
    return true;
  } catch (err) {
    dbErrorLog = err.message;
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
}

export class PatientModel {
  static async findAll(centerId = null) {
    let q = 'SELECT * FROM patients';
    if (centerId) q += ` WHERE center_id = '${centerId}' OR centerId = '${centerId}'`;
    q += ' ORDER BY created_at DESC';
    const rows = await query(q);
    return rows.map(r => ({
      ...r,
      firstName: r.firstName || r.first_name || '',
      lastName: r.lastName || r.last_name || '',
      dateOfBirth: r.dateOfBirth || r.date_of_birth,
      phoneNumber: r.phoneNumber || r.phone_number || r.phone || ''
    }));
  }
  static async findById(id) {
    const res = await query('SELECT * FROM patients WHERE id = ?', [id]);
    return res[0] || null;
  }
  static async findByTicketNumber(ticketNumber) {
    return await query('SELECT * FROM patients WHERE ticket_number = ?', [ticketNumber]);
  }
  static async create(data) {
    const pid = data.id || `p-${Date.now()}`;
    const fullName = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();
    await query(
      `INSERT INTO patients (id, name, firstName, lastName, age, gender, phone, address, center_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pid, fullName, data.firstName || '', data.lastName || '', data.age || 0, data.gender || 'M', data.phone || '', data.address || '', data.centerId || 'center-001']
    );
    return await this.findById(pid);
  }
  static async update(id, data) {
    const updates = []; const params = [];
    Object.keys(data).forEach(k => {
      if (['name', 'firstName', 'lastName', 'age', 'gender', 'phone', 'address'].includes(k)) {
        updates.push(`${k} = ?`); params.push(data[k]);
      }
    });
    if (updates.length > 0) {
      params.push(id);
      await query(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    return await this.findById(id);
  }
}

export class TicketModel {
  static async findAll() {
    const rows = await query('SELECT * FROM tickets ORDER BY created_at DESC');
    return rows.map(r => ({
      ...r,
      ticketNumber: r.ticket_number || r.ticketNumber,
      patientName: r.patient_name || r.patientName,
      patientAge: r.patient_age || r.patientAge,
      patientGender: r.patient_gender || r.patientGender,
      serviceName: r.service_name || r.serviceName
    }));
  }
  static async findById(id) {
    const res = await query('SELECT * FROM tickets WHERE id = ?', [id]);
    return res[0] || null;
  }
  static async create(data) {
    const tid = data.id || `t-${Date.now()}`;
    await query(
      `INSERT INTO tickets (id, ticket_number, patient_name, patient_age, patient_gender, service_name, amount, status, center_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tid, data.ticketNumber || `T-${Date.now()}`, data.patientName || '', data.patientAge || 0, data.patientGender || 'M', data.serviceName || 'Consultation', data.amount || 0, data.status || 'WAITING', data.centerId || 'center-001']
    );
    return await this.findById(tid);
  }
}

export class MedicineModel {
  static async findAll() {
    const rows = await query('SELECT * FROM medicines ORDER BY name');
    return rows.map(r => ({
      ...r,
      genericName: r.genericName || r.generic_name || '',
      stockQuantity: r.stock_quantity || r.stockQuantity || r.stock || 0
    }));
  }
  static async findById(id) {
    const res = await query('SELECT * FROM medicines WHERE id = ?', [id]);
    return res[0] || null;
  }
  static async create(data) {
    const mid = data.id || `m-${Date.now()}`;
    await query(
      `INSERT INTO medicines (id, name, generic_name, stock_quantity, price) VALUES (?, ?, ?, ?, ?)`,
      [mid, data.name, data.genericName || '', data.stockQuantity || 0, data.price || 0]
    );
    return await this.findById(mid);
  }
}

// STUBS for missing but imported models
// STUBS for missing but imported models
export class ServiceModel {
  static async findAll() { return await query('SELECT * FROM services'); }
  static async findById(id) {
    const res = await query('SELECT * FROM services WHERE id = ?', [id]);
    return res[0] || null;
  }
}
export class ConsultationModel {
  static async findAll() { return []; }
  static async findById(id) { return null; }
  static async create(data) { return { id: `cons-${Date.now()}`, ...data }; }
}
export class SettingsModel {
  static async getAll() { return {}; }
  static async get(key, fallback = null) { return fallback; }
  static async set(key, val) { return true; }
}
export class LabResultModel {
  static async findAll() { return []; }
  static async create(data) { return { id: `lab-${Date.now()}`, ...data }; }
}
export class CenterModel {
  static async findById(id) { return { id: "center-001", name: "O'CLIC SANTE" }; }
}

export default { initializeDatabase, query, transaction, UserModel, TicketModel, PatientModel, MedicineModel };
