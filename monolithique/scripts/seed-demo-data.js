
import { initializeDatabase, query, closeDatabase } from '../src/database.js';

async function seed() {
  console.log('🌱 Démarrage de l\'injection des données de démonstration...');
  
  const connected = await initializeDatabase();
  if (!connected) {
    console.error('❌ Impossible de se connecter à la base de données. Vérifiez XAMPP.');
    return;
  }

  try {
    // 1. Nettoyer les anciennes données pour avoir une démo propre
    console.log('🧹 Nettoyage des anciennes données...');
    await query('SET FOREIGN_KEY_CHECKS = 0');
    await query('DELETE FROM tickets');
    await query('DELETE FROM patients');
    await query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Créer des Patients
    console.log('👥 Création des dossiers patients...');
    const patients = [
      { id: 'pat-001', name: 'Aloune SOW', phone: '772345678', gender: 'M', center_id: 'center-001' },
      { id: 'pat-002', name: 'Mariama DIALLO', phone: '781234567', gender: 'F', center_id: 'center-001' },
      { id: 'pat-003', name: 'Babacar NDIAYE', phone: '761112233', gender: 'M', center_id: 'center-001' }
    ];

    for (const p of patients) {
      await query(
        'INSERT INTO patients (id, name, phone, gender, center_id, centerId) VALUES (?, ?, ?, ?, ?, ?)',
        [p.id, p.name, p.phone, p.gender, p.center_id, p.center_id]
      );
    }

    // 3. Créer des Tickets
    console.log('🎫 Création des tickets dans la file d\'attente...');
    const tickets = [
      { id: 't-101', num: 'CS-2026-001', pid: 'pat-001', pname: 'Aloune SOW', sname: 'Consultation Générale', status: 'WAITING', amount: 5000 },
      { id: 't-102', num: 'CS-2026-002', pid: 'pat-002', pname: 'Mariama DIALLO', sname: 'Gynécologie', status: 'IN_PROGRESS', amount: 8000 },
      { id: 't-103', num: 'CS-2026-003', pid: 'pat-003', pname: 'Babacar NDIAYE', sname: 'Laboratoire', status: 'WAITING', amount: 3000 },
      { id: 't-104', num: 'CS-2026-004', pid: 'pat-001', pname: 'Aloune SOW', sname: 'Pharmacie', status: 'COMPLETED', amount: 1500 }
    ];

    for (const t of tickets) {
      await query(
        `INSERT INTO tickets (id, ticket_number, patient_id, patient_name, service_name, status, amount, center_id, centerId, paid) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.num, t.pid, t.pname, t.sname, t.status, t.amount, 'center-001', 'center-001', 1]
      );
    }

    // 4. Créer des Compagnies d'Assurance
    console.log('🏦 Création des organismes d\'assurance & IPM...');
    const assurances = [
      { id: 1, name: 'IPM SONATEL', code: 'IPM-SON', type: 'IPM', discount: 80, center_id: 'center-001' },
      { id: 2, name: 'IPM ORANGE', code: 'IPM-ORG', type: 'IPM', discount: 90, center_id: 'center-001' },
      { id: 3, name: 'ALLIANZ SÉNÉGAL', code: 'ALZ-SN', type: 'PRIVATE', discount: 100, center_id: 'center-001' }
    ];

    for (const a of assurances) {
      // truncate first if exists (optional but safer for demo)
      try {
        await query('INSERT INTO insurance_companies (id, name, code, type, coverage_percentage, center_id) VALUES (?, ?, ?, ?, ?, ?)', 
        [a.id, a.name, a.code, a.type, a.discount, a.center_id]);
      } catch (e) { /* ignore if already exists */ }
    }

    // 5. Créer une transaction d'assurance (facture complexe)
    console.log('📑 Création d\'une facture assurance complexe (ex: 80/20)...');
    await query(`INSERT INTO insurance_transactions 
      (id, patient_id, invoice_id, total_amount, patient_paid_amount, insurance_coverage_amount, remaining_amount, insurance_company_id, status, center_id)
      VALUES 
      (1, 'pat-002', 'INV-2026-001', 10000.00, 2000.00, 8000.00, 0.00, 1, 'PENDING', 'center-001')`);

    console.log('\n✅ Données injectées avec succès !');
    console.log('--- RÉSUMÉ ---');
    console.log('- 3 Patients créés');
    console.log('- 2 Tickets "En attente"');
    console.log('- 1 Ticket "En cours"');
    console.log('- 1 Ticket "Terminé"');

  } catch (err) {
    console.error('❌ Erreur lors du seeding:', err.message);
  } finally {
    await closeDatabase();
  }
}

seed();
