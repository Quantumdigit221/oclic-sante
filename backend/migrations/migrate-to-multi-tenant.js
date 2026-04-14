import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.sqlite');
const BACKUP_PATH = path.join(process.cwd(), 'database.backup.json');

// 1. Sauvegarde de la base actuelle
function backupDatabase() {
  if (fs.existsSync(DB_PATH)) {
    console.log('Création d\'une sauvegarde de la base de données...');
    fs.copyFileSync(DB_PATH, BACKUP_PATH);
    console.log(`Sauvegarde créée : ${BACKUP_PATH}`);
  } else {
    console.log('Aucune base de données existante trouvée. Création d\'une nouvelle base.');
  }
}

// 2. Migration des données
async function migrateDatabase() {
  console.log('Début de la migration...');
  
  // Charger la base actuelle ou initialiser une nouvelle
  let currentDb;
  if (fs.existsSync(DB_PATH)) {
    currentDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } else {
    console.log('Initialisation d\'une nouvelle base de données...');
    currentDb = {
      users: [],
      centers: [],
      services: [],
      medicines: [],
      patients: [],
      tickets: [],
      consultations: []
    };
  }
  
  // Nouvelle structure de données
  const newDb = {
    users: [],
    centers: [],
    services: [],
    medicines: [],
    patients: [],
    tickets: [],
    consultations: [],
    _migrations: [{
      id: 'initial_multi_tenant',
      executedAt: new Date().toISOString(),
      description: 'Migration initiale vers le multi-centres'
    }]
  };

  // 1. Créer le centre par défaut s'il n'existe pas
  const defaultCenter = currentDb.centers && currentDb.centers.length > 0 
    ? currentDb.centers[0] 
    : {
        id: 'center-1',
        name: 'Poste de Santé Principal',
        address: 'Adresse non spécifiée',
        phone: '',
        email: '',
        directorName: '',
        rnis: '',
        capacity: 20,
        pispiAlias: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
  // S'assurer que le centre a tous les champs nécessaires
  newDb.centers.push({
    id: defaultCenter.id || 'center-1',
    name: defaultCenter.name || 'Poste de Santé Principal',
    address: defaultCenter.address || 'Adresse non spécifiée',
    phone: defaultCenter.phone || '',
    email: defaultCenter.email || '',
    directorName: defaultCenter.directorName || '',
    rnis: defaultCenter.rnis || '',
    capacity: defaultCenter.capacity || 20,
    pispiAlias: defaultCenter.pispiAlias || '',
    isActive: defaultCenter.isActive !== undefined ? defaultCenter.isActive : true,
    createdAt: defaultCenter.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 2. Mettre à jour les utilisateurs avec centerId
  newDb.users = (currentDb.users || []).map(user => ({
    ...user,
    centerId: user.centerId || defaultCenter.id,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // 3. Mettre à jour les services avec centerId
  newDb.services = (currentDb.services || []).map(service => ({
    ...service,
    centerId: service.centerId || defaultCenter.id,
    createdAt: service.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // 4. Mettre à jour les médicaments avec centerId
  newDb.medicines = (currentDb.medicines || []).map(medicine => ({
    ...medicine,
    centerId: medicine.centerId || defaultCenter.id,
    createdAt: medicine.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // 5. Mettre à jour les patients avec centerId
  newDb.patients = (currentDb.patients || []).map(patient => ({
    ...patient,
    centerId: patient.centerId || defaultCenter.id,
    createdAt: patient.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // 6. Mettre à jour les tickets avec centerId
  newDb.tickets = (currentDb.tickets || []).map(ticket => ({
    ...ticket,
    centerId: ticket.centerId || defaultCenter.id,
    createdAt: ticket.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // 7. Mettre à jour les consultations avec centerId
  newDb.consultations = (currentDb.consultations || []).map(consultation => ({
    ...consultation,
    centerId: consultation.centerId || defaultCenter.id,
    createdAt: consultation.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // Sauvegarder la nouvelle base de données
  fs.writeFileSync(DB_PATH, JSON.stringify(newDb, null, 2));
  console.log('Migration terminée avec succès !');
  
  // Afficher un résumé
  console.log('\n=== Résumé de la migration ===');
  console.log(`- Centres: ${newDb.centers.length}`);
  console.log(`- Utilisateurs: ${newDb.users.length}`);
  console.log(`- Services: ${newDb.services.length}`);
  console.log(`- Médicaments: ${newDb.medicines.length}`);
  console.log(`- Patients: ${newDb.patients.length}`);
  console.log(`- Tickets: ${newDb.tickets.length}`);
  console.log(`- Consultations: ${newDb.consultations.length}`);
  console.log('============================');
}

// Exécution de la migration
(async () => {
  try {
    console.log('=== Début du processus de migration ===');
    backupDatabase();
    await migrateDatabase();
    console.log('=== Migration terminée avec succès ===');
    console.log('Veuillez redémarrer le serveur pour appliquer les changements.');
  } catch (error) {
    console.error('\x1b[31m', 'Erreur lors de la migration:', error, '\x1b[0m');
    console.error('\x1b[33m', 'La base de données d\'origine n\'a pas été modifiée.', '\x1b[0m');
    if (fs.existsSync(BACKUP_PATH)) {
      console.log(`Une sauvegarde a été créée à : ${BACKUP_PATH}`);
    }
    process.exit(1);
  }
})();
