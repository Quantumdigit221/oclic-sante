import pkg from 'pg';
const { Pool } = pkg;

class PostgreSQLDatabase {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    this.initDatabase();
  }

  async initDatabase() {
    try {
      const client = await this.pool.connect();
      console.log('Connecté à PostgreSQL');
      client.release();
    } catch (error) {
      console.error('Erreur de connexion PostgreSQL:', error);
    }
  }

  async executeQuery(sql, params = []) {
    try {
      const client = await this.pool.connect();
      const result = await client.query(sql, params);
      client.release();
      return result.rows;
    } catch (error) {
      console.error('Erreur SQL:', error);
      throw error;
    }
  }

  // Users
  async findUser(email) {
    console.log('Recherche utilisateur avec email:', email);
    const sql = 'SELECT * FROM users WHERE email = $1';
    const results = await this.executeQuery(sql, [email]);
    console.log('Résultat trouvé:', results[0] || 'NULL');
    return results[0] || null;
  }

  async findUserById(userId) {
    console.log('Recherche utilisateur avec ID:', userId);
    const sql = 'SELECT * FROM users WHERE id = $1';
    const results = await this.executeQuery(sql, [userId]);
    console.log('Résultat trouvé:', results[0] || 'NULL');
    return results[0] || null;
  }

  async getUsers(centerId) {
    let sql = 'SELECT * FROM users';
    let params = [];
    
    if (centerId) {
      sql += ' WHERE "centerId" = $1';
      params.push(centerId);
    }
    
    return await this.executeQuery(sql, params);
  }

  async createUser(userData) {
    const sql = `
      INSERT INTO users (name, email, password, role, "centerId", specialty, phone, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;
    const params = [
      userData.name,
      userData.email,
      userData.password,
      userData.role || 'USER',
      userData.centerId,
      userData.specialty,
      userData.phone
    ];
    const results = await this.executeQuery(sql, params);
    return results[0];
  }

  // Centers
  async getCenters() {
    const sql = 'SELECT * FROM centers ORDER BY name';
    return await this.executeQuery(sql);
  }

  async getCenter(centerId) {
    const sql = 'SELECT * FROM centers WHERE id = $1';
    const results = await this.executeQuery(sql, [centerId]);
    return results[0] || null;
  }

  async createCenter(centerData) {
    const sql = `
      INSERT INTO centers (id, name, address, phone, email, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    const params = [
      centerData.id,
      centerData.name,
      centerData.address,
      centerData.phone,
      centerData.email
    ];
    const results = await this.executeQuery(sql, params);
    return results[0];
  }

  // Patients
  async getPatients(centerId, search = '') {
    let sql = 'SELECT * FROM patients';
    let params = [];
    
    if (centerId) {
      sql += ' WHERE "centerId" = $1';
      params.push(centerId);
    }
    
    if (search) {
      const searchCondition = params.length > 0 
        ? ` AND (name ILIKE $${params.length + 1} OR "patientId" ILIKE $${params.length + 1})`
        : ` WHERE name ILIKE $1 OR "patientId" ILIKE $1`;
      sql += searchCondition;
      params.push(`%${search}%`);
    }
    
    sql += ' ORDER BY name';
    return await this.executeQuery(sql, params);
  }

  async createPatient(patientData) {
    const sql = `
      INSERT INTO patients (name, "patientId", "dateOfBirth", gender, phone, address, "centerId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;
    const params = [
      patientData.name,
      patientData.patientId,
      patientData.dateOfBirth,
      patientData.gender,
      patientData.phone,
      patientData.address,
      patientData.centerId
    ];
    const results = await this.executeQuery(sql, params);
    return results[0];
  }

  // Appointments
  async getAppointments(centerId, date) {
    let sql = `
      SELECT a.*, p.name as patient_name, p."patientId" 
      FROM appointments a
      JOIN patients p ON a."patientId" = p.id
    `;
    let params = [];
    
    if (centerId) {
      sql += ` WHERE a."centerId" = $1`;
      params.push(centerId);
    }
    
    if (date) {
      const dateCondition = params.length > 0 
        ? ` AND DATE(a.date) = $${params.length + 1}`
        : ` WHERE DATE(a.date) = $1`;
      sql += dateCondition;
      params.push(date);
    }
    
    sql += ' ORDER BY a.date';
    return await this.executeQuery(sql, params);
  }

  async createAppointment(appointmentData) {
    const sql = `
      INSERT INTO appointments ("patientId", date, type, notes, status, "centerId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;
    const params = [
      appointmentData.patientId,
      appointmentData.date,
      appointmentData.type,
      appointmentData.notes,
      appointmentData.status || 'SCHEDULED',
      appointmentData.centerId
    ];
    const results = await this.executeQuery(sql, params);
    return results[0];
  }

  // Consultations
  async getConsultations(centerId, date) {
    let sql = `
      SELECT c.*, p.name as patient_name, p."patientId", u.name as doctor_name
      FROM consultations c
      JOIN patients p ON c."patientId" = p.id
      LEFT JOIN users u ON c."doctorId" = u.id
    `;
    let params = [];
    
    if (centerId) {
      sql += ` WHERE c."centerId" = $1`;
      params.push(centerId);
    }
    
    if (date) {
      const dateCondition = params.length > 0 
        ? ` AND DATE(c.date) = $${params.length + 1}`
        : ` WHERE DATE(c.date) = $1`;
      sql += dateCondition;
      params.push(date);
    }
    
    sql += ' ORDER BY c.date DESC';
    return await this.executeQuery(sql, params);
  }

  async createConsultation(consultationData) {
    const sql = `
      INSERT INTO consultations ("patientId", "doctorId", date, diagnosis, treatment, notes, "centerId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;
    const params = [
      consultationData.patientId,
      consultationData.doctorId,
      consultationData.date,
      consultationData.diagnosis,
      consultationData.treatment,
      consultationData.notes,
      consultationData.centerId
    ];
    const results = await this.executeQuery(sql, params);
    return results[0];
  }

  // Prescriptions
  async getPrescriptions(centerId, patientId) {
    let sql = `
      SELECT p.*, pa.name as patient_name, pa."patientId", u.name as doctor_name
      FROM prescriptions p
      JOIN patients pa ON p."patientId" = pa.id
      LEFT JOIN users u ON p."doctorId" = u.id
    `;
    let params = [];
    
    if (centerId) {
      sql += ` WHERE p."centerId" = $1`;
      params.push(centerId);
    }
    
    if (patientId) {
      const patientCondition = params.length > 0 
        ? ` AND p."patientId" = $${params.length + 1}`
        : ` WHERE p."patientId" = $1`;
      sql += patientCondition;
      params.push(patientId);
    }
    
    sql += ' ORDER BY p."createdAt" DESC';
    return await this.executeQuery(sql, params);
  }

  async createPrescription(prescriptionData) {
    const sql = `
      INSERT INTO prescriptions ("patientId", "doctorId", medication, dosage, frequency, duration, notes, "centerId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;
    const params = [
      prescriptionData.patientId,
      prescriptionData.doctorId,
      prescriptionData.medication,
      prescriptionData.dosage,
      prescriptionData.frequency,
      prescriptionData.duration,
      prescriptionData.notes,
      prescriptionData.centerId
    ];
    const results = await this.executeQuery(sql, params);
    return results[0];
  }

  // Statistics
  async getStats(centerId) {
    const stats = {};
    
    // Patients count
    let patientSql = 'SELECT COUNT(*) as count FROM patients';
    let patientParams = [];
    if (centerId) {
      patientSql += ' WHERE "centerId" = $1';
      patientParams.push(centerId);
    }
    const patientResult = await this.executeQuery(patientSql, patientParams);
    stats.totalPatients = parseInt(patientResult[0].count);
    
    // Appointments today
    let appointmentSql = `SELECT COUNT(*) as count FROM appointments WHERE DATE(date) = CURRENT_DATE`;
    let appointmentParams = [];
    if (centerId) {
      appointmentSql += ' AND "centerId" = $1';
      appointmentParams.push(centerId);
    }
    const appointmentResult = await this.executeQuery(appointmentSql, appointmentParams);
    stats.appointmentsToday = parseInt(appointmentResult[0].count);
    
    // Consultations this month
    let consultationSql = `SELECT COUNT(*) as count FROM consultations WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)`;
    let consultationParams = [];
    if (centerId) {
      consultationSql += ' AND "centerId" = $1';
      consultationParams.push(centerId);
    }
    const consultationResult = await this.executeQuery(consultationSql, consultationParams);
    stats.consultationsThisMonth = parseInt(consultationResult[0].count);
    
    return stats;
  }
}

export const db = new PostgreSQLDatabase();
export default PostgreSQLDatabase;
