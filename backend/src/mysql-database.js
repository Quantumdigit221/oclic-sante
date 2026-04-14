import pool from './mysql-config.js';

class MySQLDatabase {
  constructor() {
    this.initDatabase();
  }

  async initDatabase() {
    try {
      const connection = await pool.getConnection();
      console.log('Connecté à MySQL');

      // Seed default superadmin if no users exist
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
      if (rows[0].count === 0) {
        console.log('Base de données vide, ajout du superadmin par défaut...');
        const superadminSql = `
          INSERT INTO users (id, name, email, role, password)
          VALUES (?, ?, ?, ?, ?)
        `;
        await connection.execute(superadminSql, [
          'user-superadmin',
          'Super Administrateur',
          'superadmin@sante.sn',
          'SUPER_ADMIN',
          'demo123'
        ]);
        console.log('Superadmin créé: superadmin@sante.sn / demo123');
      }

      connection.release();

      // Fix potential encoding issues in existing data
      try {
        console.log('Nettoyage des données corrompues (encodage)...');
        // Fix standard center name if it was corrupted
        await this.executeQuery(`
          UPDATE health_centers 
          SET name = 'Centre Principal Sénégal Santé' 
          WHERE name LIKE 'Centre Principal%' AND (name LIKE '%?%' OR name LIKE '%Ã©%')
        `);

        // Fix standard services names
        await this.executeQuery(`
          UPDATE services 
          SET name = 'Consultation Générale' 
          WHERE name LIKE '%G??n??rale%' OR name LIKE '%GÃ©nÃ©rale%'
        `);

        await this.executeQuery(`
          UPDATE services 
          SET category = 'Maternité' 
          WHERE category LIKE '%Maternit??%' OR category LIKE '%MaternitÃ©%'
        `);

        await this.executeQuery(`
          UPDATE medicines 
          SET form = 'Comprimé' 
          WHERE form LIKE '%Comprim??%' OR form LIKE '%ComprimÃ©%'
        `);

        console.log('Nettoyage terminé.');
      } catch (e) {
        console.error('Erreur lors du nettoyage des données:', e);
      }
    } catch (error) {
      console.error('Erreur de connexion MySQL:', error);
    }
  }

  async executeQuery(sql, params = []) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Erreur SQL:', error);
      throw error;
    }
  }

  // Users
  async findUser(email) {
    console.log('Recherche utilisateur avec email:', email);
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await this.executeQuery(sql, [email]);
    console.log('Résultat trouvé:', results[0] || 'NULL');
    return results[0] || null;
  }

  async findUserById(userId) {
    console.log('Recherche utilisateur avec ID:', userId);
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await this.executeQuery(sql, [userId]);
    console.log('Résultat trouvé:', results[0] || 'NULL');
    return results[0] || null;
  }

  async getUsers(centerId) {
    let sql = 'SELECT * FROM users';
    let params = [];

    if (centerId) {
      sql += ' WHERE centerId = ?';
      params.push(centerId);
    }

    return await this.executeQuery(sql, params);
  }

  // Centers
  async getCenters() {
    return await this.executeQuery('SELECT * FROM health_centers');
  }

  async getCenter(centerId) {
    const sql = 'SELECT * FROM health_centers WHERE id = ?';
    const results = await this.executeQuery(sql, [centerId]);
    return results[0] || null;
  }

  async addCenter(centerData) {
    try {
      console.log('addCenter appelé avec:', centerData);

      // Générer un ID unique pour le centre
      const centerId = 'center-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      console.log('ID généré pour le centre:', centerId);

      const sql = `
        INSERT INTO health_centers (id, name, address, phone, email, directorName, rnis, capacity, pispiAlias)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        centerId,
        centerData.name,
        centerData.address || null,
        centerData.phone || null,
        centerData.email || null,
        centerData.directorName || null,
        centerData.rnis || null,
        centerData.capacity || null,
        centerData.pispiAlias || null
      ];

      console.log('SQL à exécuter:', sql);
      console.log('Paramètres:', params);

      const result = await this.executeQuery(sql, params);
      console.log('Résultat de l\'insertion:', result);

      // Créer un utilisateur administrateur pour ce centre si un mot de passe est fourni
      if (centerData.adminEmail && centerData.adminPassword) {
        const adminId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const adminSql = `
          INSERT INTO users (id, centerId, name, email, role, phone, specialty, password)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const adminParams = [
          adminId,
          centerId,
          centerData.directorName || 'Administrateur',
          centerData.adminEmail,
          'ADMIN',
          centerData.phone || null,
          null,
          centerData.adminPassword
        ];

        console.log('Création de l\'administrateur:', adminParams);
        await this.executeQuery(adminSql, adminParams);
      }

      // Ajouter des services par défaut
      const defaultServices = [
        ['Consultation Générale', 'Consultation', 2000, 3000, 20],
        ['Consultation Prénatale', 'Maternité', 1500, 2000, 30],
        ['Pansement Simple', 'Soins', 1000, 1500, 15],
        ['Injection', 'Soins', 500, 1000, 5],
        ['Échographie', 'Imagerie', 10000, 12000, 20],
        ['NFS (Hémogramme)', 'Laboratoire', 3000, 4000, 1]
      ];

      for (let i = 0; i < defaultServices.length; i++) {
        const [name, category, price, emergencyPrice, duration] = defaultServices[i];
        const serviceId = `s-${centerId}-${i + 1}`;
        const serviceSql = `
          INSERT INTO services (id, centerId, name, category, price, emergencyPrice, durationMinutes, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `;
        await this.executeQuery(serviceSql, [serviceId, centerId, name, category, price, emergencyPrice, duration]);
      }

      // Ajouter des médicaments par défaut
      const defaultMedicines = [
        // Antalgiques et Antipyrétiques
        ['Paracétamol 500mg', 'Paracétamol', 200, 50, 500, '2025-12-31', 'Antalgique', 'LOT-001', 'Comprimé'],
        ['Paracétamol 1000mg', 'Paracétamol', 100, 20, 750, '2025-12-31', 'Antalgique', 'LOT-002', 'Comprimé'],
        ['Ibuprofène 400mg', 'Ibuprofène', 150, 30, 1000, '2026-03-15', 'Anti-inflammatoire', 'LOT-003', 'Comprimé'],
        ['Aspirine 500mg', 'Acide acétylsalicylique', 100, 25, 400, '2025-08-31', 'Antalgique', 'LOT-004', 'Comprimé'],

        // Antibiotiques
        ['Amoxicilline 500mg', 'Amoxicilline', 80, 15, 1500, '2024-06-30', 'Antibiotique', 'LOT-005', 'Gélule'],
        ['Amoxicilline 1g', 'Amoxicilline', 60, 10, 2000, '2024-06-30', 'Antibiotique', 'LOT-006', 'Gélule'],
        ['Azithromycine 500mg', 'Azithromycine', 40, 8, 2500, '2025-02-28', 'Antibiotique', 'LOT-007', 'Comprimé'],
        ['Ciprofloxacine 500mg', 'Ciprofloxacine', 50, 12, 1800, '2025-04-30', 'Antibiotique', 'LOT-008', 'Comprimé'],
        ['Doxycycline 100mg', 'Doxycycline', 60, 15, 1200, '2025-01-15', 'Antibiotique', 'LOT-009', 'Gélule'],

        // Antipaludéens
        ['Artemether/Lumefantrine', 'Coartem', 30, 10, 2500, '2025-01-01', 'Antipaludéen', 'LOT-010', 'Comprimé'],
        ['Chloroquine 100mg', 'Chloroquine', 100, 20, 800, '2025-06-30', 'Antipaludéen', 'LOT-011', 'Comprimé'],
        ['Quinine 500mg', 'Quinine', 40, 8, 1500, '2024-12-31', 'Antipaludéen', 'LOT-012', 'Comprimé'],

        // Antidiarrhéiques et Réhydratation
        ['Smecta 3g', 'Diosmectite', 80, 20, 600, '2025-09-30', 'Antidiarrhéique', 'LOT-013', 'Poudre'],
        ['Lopéramide 2mg', 'Lopéramide', 50, 15, 800, '2025-07-31', 'Antidiarrhéique', 'LOT-014', 'Gélule'],
        ['Sérum physiologique 500ml', 'Chlorure de sodium', 30, 10, 1000, '2026-01-31', 'Réhydratation', 'LOT-015', 'Solution'],
        ['Soluté de réhydratation', 'SRO', 100, 25, 500, '2026-01-31', 'Réhydratation', 'LOT-016', 'Sachet'],

        // Diabète
        ['Metformine 850mg', 'Metformine', 60, 12, 1200, '2025-04-30', 'Antidiabétique', 'LOT-017', 'Comprimé'],

        // Vitamines
        ['Vitamine C 500mg', 'Acide ascorbique', 150, 30, 300, '2025-11-30', 'Vitamine', 'LOT-018', 'Comprimé'],
        ['Vitamine D3 1000UI', 'Cholécalciférol', 80, 20, 800, '2025-12-31', 'Vitamine', 'LOT-019', 'Gélule'],

        // Dermatologie
        ['Bétadine 5%', 'Povidone iodée', 40, 10, 1200, '2025-08-31', 'Antiseptique', 'LOT-020', 'Solution'],
        ['Dakin', 'Hypochlorite de sodium', 30, 8, 800, '2025-06-30', 'Antiseptique', 'LOT-021', 'Solution'],

        // Cardiovasculaire
        ['Amlodipine 5mg', 'Amlodipine', 60, 12, 1500, '2025-04-30', 'Antihypertenseur', 'LOT-022', 'Comprimé'],
        ['Lisinopril 10mg', 'Lisinopril', 50, 10, 1800, '2025-03-31', 'Antihypertenseur', 'LOT-023', 'Comprimé'],

        // Gastro-entérologique
        ['Oméprazole 20mg', 'Oméprazole', 70, 15, 1200, '2025-05-31', 'Antiulcéreux', 'LOT-024', 'Gélule'],
        ['Maalox', 'Hydroxyde d\'aluminium', 40, 10, 1000, '2025-10-31', 'Antiulcéreux', 'LOT-025', 'Suspension'],

        // Vaccins et Sérums
        ['Vaccin BCG', 'BCG', 20, 5, 3000, '2024-12-31', 'Vaccin', 'LOT-026', 'Flacon'],
        ['Vaccin DTCoq', 'DTCoq', 20, 5, 2500, '2024-12-31', 'Vaccin', 'LOT-027', 'Flacon'],
        ['Sérum antitétanique', 'Sérum ATS', 15, 3, 5000, '2024-11-30', 'Sérum', 'LOT-028', 'Ampoule'],

        // Matériel médical consommable
        ['Gants stériles', 'Gants', 200, 50, 100, '2026-12-31', 'Matériel', 'LOT-029', 'Boîte'],
        ['Seringues 5ml', 'Seringue', 300, 100, 150, '2026-12-31', 'Matériel', 'LOT-030', 'Unité'],
        ['Coton hydrophile', 'Coton', 100, 20, 500, '2026-12-31', 'Matériel', 'LOT-031', 'Paquet'],
        ['Compresses stériles', 'Compresse', 150, 30, 800, '2026-12-31', 'Matériel', 'LOT-032', 'Paquet'],
        ['Bandes élastiques', 'Bande', 50, 10, 1200, '2026-12-31', 'Matériel', 'LOT-033', 'Rouleau'],

        // Autres médicaments essentiels
        ['Fer 200mg', 'Sulfate ferreux', 80, 20, 600, '2025-09-30', 'Supplémentation', 'LOT-034', 'Comprimé'],
        ['Acide folique 5mg', 'Acide folique', 100, 25, 400, '2025-10-31', 'Supplémentation', 'LOT-035', 'Comprimé'],
        ['Salbutamol 100µg', 'Salbutamol', 40, 8, 2500, '2025-03-15', 'Bronchodilatateur', 'LOT-036', 'Aérosol']
      ];

      for (let i = 0; i < defaultMedicines.length; i++) {
        const [name, dci, stock, minStock, price, expiryDate, category, batchNumber, form] = defaultMedicines[i];
        const medId = `m-${centerId}-${i + 1}`;
        const medSql = `
          INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await this.executeQuery(medSql, [medId, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form]);
      }

      console.log('Services et médicaments par défaut ajoutés pour le centre:', centerId);

      return { id: centerId, ...centerData };
    } catch (error) {
      console.error('Erreur dans addCenter:', error);
      throw error;
    }
  }

  async addUser(userData) {
    try {
      console.log('addUser appelé avec:', userData);

      // Générer un ID unique pour l'utilisateur
      const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      console.log('ID généré pour l\'utilisateur:', userId);

      const sql = `
        INSERT INTO users (id, centerId, name, email, role, phone, specialty, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        userId,
        userData.centerId || this.currentCenterId,
        userData.name,
        userData.email,
        userData.role,
        userData.phone || null,
        userData.specialty || null,
        userData.password || null
      ];

      console.log('SQL à exécuter:', sql);
      console.log('Paramètres:', params);

      const result = await this.executeQuery(sql, params);
      console.log('Résultat de l\'insertion:', result);

      return { id: userId, ...userData };
    } catch (error) {
      console.error('Erreur dans addUser:', error);
      throw error;
    }
  }

  async getUsers(centerId) {
    let sql = 'SELECT * FROM users';
    let params = [];

    if (centerId) {
      sql += ' WHERE centerId = ?';
      params.push(centerId);
    }

    return await this.executeQuery(sql, params);
  }

  async updateUser(userId, userData) {
    try {
      console.log('updateUser appelé avec:', { userId, userData });

      if (!userId) {
        throw new Error('User ID is required for update');
      }

      // Construire la requête UPDATE dynamiquement
      const fields = Object.keys(userData).filter(key => userData[key] !== undefined);
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => userData[field]);
      values.push(userId);

      const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
      console.log('Update user SQL:', sql);
      console.log('Update params:', values);

      const result = await this.executeQuery(sql, values);

      if (result.affectedRows > 0) {
        // Récupérer l'utilisateur mis à jour
        const updatedUser = await this.findUserById(userId);
        return updatedUser;
      }

      throw new Error('User not found or no changes made');
    } catch (error) {
      console.error('Erreur dans updateUser:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      if (!userId) throw new Error('User ID is required');
      const sql = 'DELETE FROM users WHERE id = ?';
      const result = await this.executeQuery(sql, [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur dans deleteUser:', error);
      throw error;
    }
  }

  async updateCenter(centerData) {
    try {
      const { id, ...updateFields } = centerData;

      if (!id) {
        throw new Error('Center ID is required for update');
      }

      // Construire la requête UPDATE dynamiquement
      const fields = Object.keys(updateFields).filter(key => updateFields[key] !== undefined);
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updateFields[field]);
      values.push(id);

      const sql = `UPDATE health_centers SET ${setClause} WHERE id = ?`;
      console.log('Update center SQL:', sql);
      console.log('Update params:', values);

      const result = await this.executeQuery(sql, values);

      if (result.affectedRows > 0) {
        // Récupérer le centre mis à jour
        const updatedCenter = await this.getCenter(id);
        return updatedCenter;
      } else {
        throw new Error('Center not found');
      }
    } catch (error) {
      console.error('Error updating center:', error);
      throw error;
    }
  }
  async getPatients(centerId) {
    try {
      console.log('getPatients called with centerId:', centerId);
      let sql = 'SELECT * FROM patients';
      let params = [];

      if (centerId) {
        sql += ' WHERE centerId = ?';
        params.push(centerId);
      }

      console.log('Executing query:', sql, 'with params:', params);
      const result = await this.executeQuery(sql, params);
      console.log('Query result:', result);

      // Vérifier si la table est vide
      const tableInfo = await this.executeQuery('SHOW TABLES LIKE "patients"');
      console.log('Table exists:', tableInfo.length > 0);

      if (tableInfo.length > 0) {
        const count = await this.executeQuery('SELECT COUNT(*) as count FROM patients');
        console.log('Number of patients in database:', count[0]?.count);
      }

      return result;
    } catch (error) {
      console.error('Error in getPatients:', error);
      throw error;
    }
  }

  async addPatient(patientData) {
    const requiredFields = ['centerId', 'firstName', 'lastName', 'birthDate', 'gender'];
    for (const field of requiredFields) {
      if (!patientData?.[field]) {
        throw new Error(`Missing required patient field: ${field}`);
      }
    }

    // Inspect actual table schema to decide what to insert
    const columns = await this.executeQuery('SHOW COLUMNS FROM patients');
    const hasColumn = (name) => columns.some((c) => c.Field === name);
    const idColumn = columns.find((c) => c.Field === 'id');
    const idIsAutoIncrement = Boolean(idColumn && typeof idColumn.Extra === 'string' && idColumn.Extra.includes('auto_increment'));

    // Generate code if not provided (frontend doesn't send it)
    if (hasColumn('code') && (!patientData.code || String(patientData.code).trim() === '')) {
      const year = new Date().getFullYear();
      const rand = Math.floor(100000 + Math.random() * 900000);
      patientData.code = `P-${year}-${rand}`;
    }

    // Generate id if table expects an id but it's not auto-increment
    if (hasColumn('id') && !idIsAutoIncrement && (!patientData.id || String(patientData.id).trim() === '')) {
      patientData.id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    const fields = [];
    const placeholders = [];
    const params = [];

    const add = (field, value) => {
      if (!hasColumn(field)) return;
      if (value === undefined) return;
      fields.push(field);
      placeholders.push('?');
      params.push(value);
    };

    add('id', patientData.id);
    add('centerId', patientData.centerId);
    add('code', patientData.code);
    add('firstName', patientData.firstName);
    add('lastName', patientData.lastName);
    add('birthDate', patientData.birthDate);
    add('gender', patientData.gender);
    add('phone', patientData.phone || null);
    add('address', patientData.address || null);
    add('bloodGroup', patientData.bloodGroup || null);
    add('allergies', patientData.allergies || null);
    add('emergencyContact', patientData.emergencyContact || null);
    add('age', patientData.age || null);
    add('createdAt', new Date().toISOString());

    const sql = `INSERT INTO patients (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    const result = await this.executeQuery(sql, params);

    const createdId = idIsAutoIncrement ? result.insertId : patientData.id;
    return { id: createdId, ...patientData };
  }

  async updatePatient(id, data) {
    const fields = [];
    const params = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    });

    params.push(id);

    const sql = `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`;
    await this.executeQuery(sql, params);

    return await this.getPatient(id);
  }

  async getPatient(id) {
    const sql = 'SELECT * FROM patients WHERE id = ?';
    const results = await this.executeQuery(sql, [id]);
    return results[0] || null;
  }

  // Tickets
  async getTickets(centerId) {
    let sql = 'SELECT * FROM tickets';
    let params = [];

    if (centerId) {
      sql += ' WHERE centerId = ?';
      params.push(centerId);
    }

    sql += ' ORDER BY createdAt DESC';

    return await this.executeQuery(sql, params);
  }

  async addTicket(ticketData) {
    const requiredFields = [
      'centerId',
      'patientName',
      'patientAge',
      'patientGender',
      'serviceId',
      'serviceName',
      'amount',
      'paymentMethod'
    ];
    for (const field of requiredFields) {
      if (ticketData?.[field] === undefined || ticketData?.[field] === null || ticketData?.[field] === '') {
        throw new Error(`Missing required ticket field: ${field}`);
      }
    }

    // Inspect actual table schema
    const columns = await this.executeQuery('SHOW COLUMNS FROM tickets');
    const hasColumn = (name) => columns.some((c) => c.Field === name);
    const idColumn = columns.find((c) => c.Field === 'id');
    const idIsAutoIncrement = Boolean(idColumn && typeof idColumn.Extra === 'string' && idColumn.Extra.includes('auto_increment'));

    // Generate ticketNumber if not provided
    if (hasColumn('ticketNumber') && (!ticketData.ticketNumber || String(ticketData.ticketNumber).trim() === '')) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const rand = Math.floor(1000 + Math.random() * 9000);
      ticketData.ticketNumber = `CS-${y}${m}${d}-${rand}`;
    }

    // Generate id if needed
    if (hasColumn('id') && !idIsAutoIncrement && (!ticketData.id || String(ticketData.id).trim() === '')) {
      ticketData.id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    // MySQL-friendly datetime (avoid ISO "Z" timezone issues)
    const mysqlDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const fields = [];
    const placeholders = [];
    const params = [];
    const add = (field, value) => {
      if (!hasColumn(field)) return;
      if (value === undefined) return;
      fields.push(field);
      placeholders.push('?');
      params.push(value);
    };

    add('id', ticketData.id);
    add('centerId', ticketData.centerId);
    add('ticketNumber', ticketData.ticketNumber);
    add('patientName', ticketData.patientName);
    add('patientAge', ticketData.patientAge);
    add('patientGender', ticketData.patientGender);
    add('patientPhone', ticketData.patientPhone || null);
    add('patientAddress', ticketData.patientAddress || null);
    add('serviceId', ticketData.serviceId);
    add('serviceName', ticketData.serviceName);
    add('amount', ticketData.amount);
    add('paymentMethod', ticketData.paymentMethod);
    add('status', ticketData.status || 'WAITING');
    add('notes', ticketData.notes || null);
    add('doctorId', ticketData.doctorId || null);
    add('createdAt', mysqlDateTime);

    const sql = `INSERT INTO tickets (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    const result = await this.executeQuery(sql, params);

    const createdId = idIsAutoIncrement ? result.insertId : ticketData.id;
    return { id: createdId, ...ticketData, createdAt: mysqlDateTime };
  }

  async updateTicketStatus(id, status) {
    const sql = 'UPDATE tickets SET status = ? WHERE id = ?';
    await this.executeQuery(sql, [status, id]);

    const getSql = 'SELECT * FROM tickets WHERE id = ?';
    const results = await this.executeQuery(getSql, [id]);
    return results[0] || null;
  }

  // Services
  async getServices(centerId) {
    let sql = 'SELECT * FROM services';
    let params = [];

    if (centerId) {
      sql += ' WHERE centerId = ?';
      params.push(centerId);
    }

    return await this.executeQuery(sql, params);
  }

  async getServiceById(id) {
    const sql = 'SELECT * FROM services WHERE id = ?';
    const results = await this.executeQuery(sql, [id]);
    return results[0] || null;
  }

  async updateService(id, data) {
    try {
      if (!id) throw new Error('Service ID required');
      const fields = Object.keys(data).filter(k => data[k] !== undefined);
      if (fields.length === 0) return null;

      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const values = [...fields.map(f => data[f]), id];

      const sql = `UPDATE services SET ${setClause} WHERE id = ?`;
      const result = await this.executeQuery(sql, values);

      if (result.affectedRows > 0) {
        return await this.getServiceById(id);
      }
      return null;
    } catch (error) {
      console.error('Erreur dans updateService:', error);
      throw error;
    }
  }

  async addService(serviceData) {
    try {
      const columns = await this.executeQuery('SHOW COLUMNS FROM services');
      const hasColumn = (name) => columns.some((c) => c.Field === name);

      if (!serviceData.id && hasColumn('id')) {
        serviceData.id = `s-${serviceData.centerId}-${Date.now()}`;
      }

      const fields = [];
      const placeholders = [];
      const params = [];

      const add = (field, value, defaultValue = null) => {
        if (hasColumn(field)) {
          fields.push(field);
          placeholders.push('?');
          params.push(value !== undefined && value !== null ? value : defaultValue);
        }
      };

      add('id', serviceData.id);
      add('centerId', serviceData.centerId);
      add('name', serviceData.name);
      add('category', serviceData.category);
      add('price', serviceData.price);
      add('emergencyPrice', serviceData.emergencyPrice);
      add('durationMinutes', serviceData.durationMinutes);
      add('description', serviceData.description, '');
      add('isActive', serviceData.isActive !== false ? 1 : 0, 1);

      if (fields.length === 0) {
        throw new Error('Aucune colonne valide à insérer pour le service.');
      }

      const sql = `INSERT INTO services (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
      await this.executeQuery(sql, params);
      return { ...serviceData };

    } catch (error) {
      console.error('Erreur détaillée dans db.addService:', error);
      throw error;
    }
  }

  async deleteService(id) {
    try {
      // Vérifier si le service existe
      const [existingService] = await this.executeQuery(
        'SELECT * FROM services WHERE id = ?',
        [id]
      );

      if (!existingService) {
        throw new Error('Service non trouvé');
      }

      // Vérifier si le service est utilisé dans des tickets
      const [tickets] = await this.executeQuery(
        'SELECT COUNT(*) as count FROM tickets WHERE serviceId = ?',
        [id]
      );

      if (tickets && tickets[0].count > 0) {
        // Si le service est utilisé, on le désactive au lieu de le supprimer
        await this.executeQuery(
          'UPDATE services SET isActive = 0 WHERE id = ?',
          [id]
        );
        return { id, message: 'Service désactivé car il est utilisé dans des tickets' };
      }

      // Sinon, on peut le supprimer
      await this.executeQuery(
        'DELETE FROM services WHERE id = ?',
        [id]
      );

      return { id, message: 'Service supprimé avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error);
      throw error;
    }
  }

  // Medicines
  async getMedicines(centerId) {
    let sql = 'SELECT * FROM medicines';
    let params = [];

    if (centerId) {
      sql += ' WHERE centerId = ?';
      params.push(centerId);
    }

    return await this.executeQuery(sql, params);
  }

  async addMedicine(medicineData) {
    const sql = `
      INSERT INTO medicines (centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      medicineData.centerId,
      medicineData.name,
      medicineData.dci,
      medicineData.stock,
      medicineData.minStock,
      medicineData.price,
      medicineData.expiryDate,
      medicineData.category,
      medicineData.batchNumber,
      medicineData.form
    ];

    const result = await this.executeQuery(sql, params);
    return { id: result.insertId, ...medicineData };
  }

  async updateMedicine(id, medicineData) {
    const sql = `
      UPDATE medicines 
      SET name = ?, dci = ?, stock = ?, minStock = ?, price = ?, expiryDate = ?, category = ?, batchNumber = ?, form = ?
      WHERE id = ?
    `;
    const params = [
      medicineData.name,
      medicineData.dci,
      medicineData.stock,
      medicineData.minStock,
      medicineData.price,
      medicineData.expiryDate,
      medicineData.category,
      medicineData.batchNumber,
      medicineData.form,
      id
    ];

    const result = await this.executeQuery(sql, params);
    if (result.affectedRows > 0) {
      return { id, ...medicineData };
    }
    return null;
  }

  async deleteMedicine(id) {
    const sql = 'DELETE FROM medicines WHERE id = ?';
    const result = await this.executeQuery(sql, [id]);
    return result.affectedRows > 0;
  }

  // Consultations
  async getConsultations(centerId) {
    let sql = 'SELECT * FROM consultations';
    let params = [];

    if (centerId) {
      sql += ' WHERE centerId = ?';
      params.push(centerId);
    }

    sql += ' ORDER BY createdAt DESC';

    return await this.executeQuery(sql, params);
  }

  async addConsultation(consultationData) {
    console.log('Données de la consultation reçues:', JSON.stringify(consultationData, null, 2));

    // Vérification des champs obligatoires
    const requiredFields = ['centerId', 'ticketId', 'doctorId', 'patientName'];
    const missingFields = requiredFields.filter(field => !consultationData[field]);

    if (missingFields.length > 0) {
      const errorMsg = `Champs obligatoires manquants: ${missingFields.join(', ')}`;
      console.error('Erreur de validation:', errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // Générer un nouvel ID unique pour la consultation
      const consultationId = `c-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      const sql = `
      INSERT INTO consultations (
        id, centerId, ticketId, patientId, doctorId, doctorName, patientName, 
        temperature, weight, bloodPressure, pulse, 
        symptoms, diagnosis, notes, prescription, labOrders
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      // Préparation des paramètres avec des valeurs par défaut
      const params = [
        consultationId, // ID généré
        consultationData.centerId,
        consultationData.ticketId,
        consultationData.patientId || null,
        consultationData.doctorId,
        consultationData.doctorName || null,
        consultationData.patientName,
        consultationData.temperature || null,
        consultationData.weight || null,
        consultationData.bloodPressure || null,
        consultationData.pulse || null,
        consultationData.symptoms || '',
        consultationData.diagnosis || '',
        consultationData.notes || '',
        JSON.stringify(consultationData.prescription || []),
        JSON.stringify(consultationData.labOrders || [])
      ];

      console.log('Paramètres SQL:', JSON.stringify(params, null, 2));

      console.log('Exécution de la requête SQL avec les paramètres:', params);

      const result = await this.executeQuery(sql, params);

      // If we provided the ID ourselves and it's not auto-increment, result.insertId might be 0
      if (!result || result.affectedRows === 0) {
        throw new Error('Échec de l\'insertion de la consultation: aucun résultat retourné ou aucune ligne affectée');
      }

      const insertedId = consultationId; // Use the generated ID directly
      console.log('Consultation insérée avec succès, ID:', insertedId);

      // Construire l'objet de consultation à retourner
      const consultation = {
        id: consultationId,
        centerId: consultationData.centerId,
        ticketId: consultationData.ticketId,
        doctorId: consultationData.doctorId,
        patientName: consultationData.patientName,
        temperature: consultationData.temperature,
        weight: consultationData.weight,
        bloodPressure: consultationData.bloodPressure,
        pulse: consultationData.pulse,
        symptoms: consultationData.symptoms,
        diagnosis: consultationData.diagnosis,
        notes: consultationData.notes,
        prescription: consultationData.prescription || [],
        labOrders: consultationData.labOrders || [],
        createdAt: new Date().toISOString()
      };

      console.log('Consultation créée avec succès:', consultation);
      return consultation;

    } catch (error) {
      console.error('Erreur lors de l\'ajout de la consultation:', error);

      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        const match = error.message.match(/FOREIGN KEY \(`(.*?)`\)/);
        const field = match ? match[1] : 'inconnu';
        throw new Error(`Erreur de clé étrangère: la valeur pour le champ '${field}' n'existe pas`);
      }

      throw new Error(`Erreur lors de la création de la consultation: ${error.message}`);
    }
  }

  // Sales
  async getSales(centerId) {
    let sql = 'SELECT * FROM sales';
    let params = [];

    if (centerId) {
      sql += ' WHERE centerId = ?';
      params.push(centerId);
    }

    sql += ' ORDER BY createdAt DESC';

    return await this.executeQuery(sql, params);
  }

  async addSale(saleData) {
    const sql = `
      INSERT INTO sales (centerId, items, paymentMethod, totalAmount, patientName, ticketId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      saleData.centerId,
      JSON.stringify(saleData.items),
      saleData.paymentMethod,
      saleData.totalAmount,
      saleData.patientName || null,
      saleData.ticketId || null,
      new Date().toISOString()
    ];

    const result = await this.executeQuery(sql, params);
    return { id: result.insertId, ...saleData };
  }

  // Lab Results
  async getLabResults(centerId, patientId = null) {
    let sql = 'SELECT * FROM lab_results';
    let params = [];

    if (centerId && patientId) {
      sql += ' WHERE centerId = ? AND patientId = ?';
      params.push(centerId, patientId);
    } else if (centerId) {
      sql += ' WHERE centerId = ?';
      params.push(centerId);
    } else if (patientId) {
      sql += ' WHERE patientId = ?';
      params.push(patientId);
    }

    sql += ' ORDER BY createdAt DESC';
    return await this.executeQuery(sql, params);
  }

  async addLabResult(labResultData) {
    const id = labResultData.id || `lab-${Date.now()}`;
    const sql = `
      INSERT INTO lab_results (
        id, centerId, patientId, patientName, consultationId, 
        type, examName, examCategory, resultDate, status, 
        results, doctorId, doctorName, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      labResultData.centerId,
      labResultData.patientId,
      labResultData.patientName,
      labResultData.consultationId,
      labResultData.type,
      labResultData.examName,
      labResultData.examCategory,
      labResultData.resultDate,
      labResultData.status || 'pending',
      JSON.stringify(labResultData.results || {}),
      labResultData.doctorId,
      labResultData.doctorName,
      new Date().toISOString(),
      new Date().toISOString()
    ];

    await this.executeQuery(sql, params);
    return { id, ...labResultData };
  }

  async updateLabResult(id, labResultData) {
    const fields = Object.keys(labResultData).filter(key => key !== 'id');
    const setClause = fields.map(field => {
      if (field === 'results') return `${field} = ?`;
      return `${field} = ?`;
    }).join(', ');

    const values = fields.map(field => {
      if (field === 'results') return JSON.stringify(labResultData[field]);
      return labResultData[field];
    });

    values.push(id);
    const sql = `UPDATE lab_results SET ${setClause}, updatedAt = NOW() WHERE id = ?`;

    await this.executeQuery(sql, values);
    return { id, ...labResultData };
  }

  async deleteLabResult(id) {
    const sql = 'DELETE FROM lab_results WHERE id = ?';
    const result = await this.executeQuery(sql, [id]);
    return result.affectedRows > 0;
  }

  async close() {
    await pool.end();
  }
}

export const db = new MySQLDatabase();
