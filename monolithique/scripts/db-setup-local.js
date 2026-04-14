
import mysql from 'mysql2/promise';
import { initializeDatabase, query, closeDatabase, getDbErrorLog } from '../src/database.js';

async function setup() {
  console.log('🔄 Étape 1: Création de la base oclic_sante_db si elle manque...');
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: ''
    });
    await conn.query('CREATE DATABASE IF NOT EXISTS oclic_sante_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Base oclic_sante_db prête.');
    await conn.end();
  } catch (e) {
    console.error('❌ Échec création base:', e.message);
  }

  console.log('🔄 Étape 2: Initialisation des tables par l\'API...');
  const ok = await initializeDatabase();
  if (!ok) {
    console.error('❌ Échec Initialisation. Détails:', getDbErrorLog());
  } else {
    console.log('✅ Statut Initialisation: SUCCÈS');
  }

  if (ok) {
    console.log('🔄 Étape 3: Injection de données de test (Patients et Tickets)...');
    try {
        const patients = await query('SELECT count(*) as c FROM patients');
        if (patients[0].c === 0) {
            await query("INSERT INTO patients (id, name, phone, center_id) VALUES ('p-001', 'Patient Demo 1', '770000000', 'center-001')");
            await query("INSERT INTO patients (id, name, phone, center_id) VALUES ('p-002', 'Patient Demo 2', '780000000', 'center-001')");
            console.log('✅ Patients ajoutés.');
        }

        const tickets = await query('SELECT count(*) as c FROM tickets');
        if (tickets[0].c === 0) {
            await query(`INSERT INTO tickets (id, ticket_number, patient_id, patient_name, service_name, status, center_id, amount) 
                        VALUES ('t-001', 'T-2026-001', 'p-001', 'Patient Demo 1', 'Consultation', 'WAITING', 'center-001', 5000)`);
            await query(`INSERT INTO tickets (id, ticket_number, patient_id, patient_name, service_name, status, center_id, amount) 
                        VALUES ('t-002', 'T-2026-002', 'p-002', 'Patient Demo 2', 'Injection', 'IN_PROGRESS', 'center-001', 2000)`);
            console.log('✅ Tickets pour démonstration ajoutés.');
        }
    } catch (err) {
        console.error('❌ Erreur Data Seeding:', err.message);
    }
  }

  await closeDatabase();
  console.log('\n✨ Rétabli avec succès ! Vous pouvez maintenant rafraîchir votre navigateur.');
}

setup();
