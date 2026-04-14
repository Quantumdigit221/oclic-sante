import fs from 'fs';
import path from 'path';

// Database file path
const DB_PATH = path.join(process.cwd(), 'database.sqlite');

// Simple SQLite-like implementation using JSON files
class SimpleDB {
  constructor() {
    this.data = {
      users: [],
      centers: [],
      services: [],
      medicines: [],
      patients: [],
      tickets: [],
      consultations: []
    };
    this.loadDatabase();
  }

  loadDatabase() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const content = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(content);
      } else {
        this.initializeData();
        this.saveDatabase();
      }
    } catch (error) {
      console.log('Initializing new database...');
      this.initializeData();
      this.saveDatabase();
    }
  }

  saveDatabase() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Services par défaut pour les centres de santé sénégalais
  getDefaultServices() {
    return [
      // Consultations
      { name: "Consultation Générale", category: "Consultation", price: 2000, emergencyPrice: 3000, durationMinutes: 20, isActive: true },
      { name: "Consultation Prénatale", category: "Maternité", price: 1500, emergencyPrice: 2000, durationMinutes: 30, isActive: true },
      { name: "Consultation Pédiatrique", category: "Pédiatrie", price: 2500, emergencyPrice: 3500, durationMinutes: 25, isActive: true },
      
      // Vaccinations (Programme National)
      { name: "Vaccination BCG", category: "Vaccination", price: 0, emergencyPrice: 0, durationMinutes: 10, isActive: true },
      { name: "Vaccination Pentavalent", category: "Vaccination", price: 0, emergencyPrice: 0, durationMinutes: 10, isActive: true },
      { name: "Vaccination Rougeole", category: "Vaccination", price: 0, emergencyPrice: 0, durationMinutes: 10, isActive: true },
      { name: "Vaccination Poliomyélite", category: "Vaccination", price: 0, emergencyPrice: 0, durationMinutes: 10, isActive: true },
      
      // Planification Familiale
      { name: "Planification Familiale", category: "Planification Familiale", price: 500, emergencyPrice: 1000, durationMinutes: 15, isActive: true },
      { name: "Implant Contraceptif", category: "Planification Familiale", price: 2000, emergencyPrice: 3000, durationMinutes: 15, isActive: true },
      { name: "DIU Pose", category: "Planification Familiale", price: 5000, emergencyPrice: 7000, durationMinutes: 20, isActive: true },
      
      // Soins courants
      { name: "Pansement Simple", category: "Soins", price: 1000, emergencyPrice: 1500, durationMinutes: 15, isActive: true },
      { name: "Pansement Compliqué", category: "Soins", price: 2000, emergencyPrice: 3000, durationMinutes: 25, isActive: true },
      { name: "Injection IM", category: "Soins", price: 500, emergencyPrice: 1000, durationMinutes: 5, isActive: true },
      { name: "Injection IV", category: "Soins", price: 1500, emergencyPrice: 2000, durationMinutes: 10, isActive: true },
      { name: "Perfusion", category: "Soins", price: 2000, emergencyPrice: 3000, durationMinutes: 30, isActive: true },
      { name: "Suture (3 points)", category: "Soins", price: 3000, emergencyPrice: 5000, durationMinutes: 30, isActive: true },
      { name: "Suture (+3 points)", category: "Soins", price: 5000, emergencyPrice: 7000, durationMinutes: 45, isActive: true },
      { name: "Ablation de suture", category: "Soins", price: 1000, emergencyPrice: 1500, durationMinutes: 10, isActive: true },
      
      // Chirurgie mineure
      { name: "Curetage", category: "Chirurgie Mineure", price: 5000, emergencyPrice: 8000, durationMinutes: 30, isActive: true },
      { name: "Incision/Drainage", category: "Chirurgie Mineure", price: 4000, emergencyPrice: 6000, durationMinutes: 25, isActive: true },
      { name: "Circumcision", category: "Chirurgie Mineure", price: 3000, emergencyPrice: 5000, durationMinutes: 20, isActive: true },
      
      // Laboratoire
      { name: "DPI (Dépistage Palu)", category: "Laboratoire", price: 500, emergencyPrice: 1000, durationMinutes: 5, isActive: true },
      { name: "Goutte Épaisse", category: "Laboratoire", price: 500, emergencyPrice: 1000, durationMinutes: 10, isActive: true },
      { name: "Test de Grossesse", category: "Laboratoire", price: 1000, emergencyPrice: 1500, durationMinutes: 5, isActive: true },
      { name: "Test VIH", category: "Laboratoire", price: 0, emergencyPrice: 0, durationMinutes: 15, isActive: true },
      { name: "Hémogramme (NFS)", category: "Laboratoire", price: 3000, emergencyPrice: 4000, durationMinutes: 15, isActive: true },
      { name: "Groupe Sanguin", category: "Laboratoire", price: 2000, emergencyPrice: 3000, durationMinutes: 10, isActive: true },
      { name: "Glycémie", category: "Laboratoire", price: 1500, emergencyPrice: 2000, durationMinutes: 5, isActive: true },
      { name: "Créatininémie", category: "Laboratoire", price: 2000, emergencyPrice: 3000, durationMinutes: 10, isActive: true },
      { name: "Transaminases", category: "Laboratoire", price: 2500, emergencyPrice: 3500, durationMinutes: 10, isActive: true },
      { name: "TDR Tuberculose", category: "Laboratoire", price: 5000, emergencyPrice: 7000, durationMinutes: 15, isActive: true },
      
      // Imagerie
      { name: "Échographie Abdomen", category: "Imagerie", price: 10000, emergencyPrice: 12000, durationMinutes: 20, isActive: true },
      { name: "Échographie Pelvienne", category: "Imagerie", price: 8000, emergencyPrice: 10000, durationMinutes: 20, isActive: true },
      { name: "Échographie Obstétricale", category: "Imagerie", price: 12000, emergencyPrice: 15000, durationMinutes: 25, isActive: true },
      { name: "Radio Thorax", category: "Imagerie", price: 5000, emergencyPrice: 7000, durationMinutes: 15, isActive: true },
      { name: "Radio Membre", category: "Imagerie", price: 3000, emergencyPrice: 5000, durationMinutes: 10, isActive: true },
      { name: "ECG", category: "Imagerie", price: 4000, emergencyPrice: 6000, durationMinutes: 15, isActive: true },
      
      // Nutrition
      { name: "Consultation Nutrition", category: "Nutrition", price: 2000, emergencyPrice: 3000, durationMinutes: 30, isActive: true },
      { name: "Supplémentation Fer", category: "Nutrition", price: 500, emergencyPrice: 1000, durationMinutes: 5, isActive: true },
      { name: "Supplémentation Vit A", category: "Nutrition", price: 0, emergencyPrice: 0, durationMinutes: 5, isActive: true },
      
      // Prévention
      { name: "Moustiquaire Imprégnée", category: "Prévention", price: 2500, emergencyPrice: 3500, durationMinutes: 10, isActive: true },
      
      // Autres
      { name: "Oxygénothérapie", category: "Soins", price: 1000, emergencyPrice: 2000, durationMinutes: 30, isActive: true },
      { name: "Nébulisation", category: "Soins", price: 2000, emergencyPrice: 3000, durationMinutes: 15, isActive: true },
      { name: "Sonde Urinaire", category: "Soins", price: 1500, emergencyPrice: 2500, durationMinutes: 15, isActive: true },
      { name: "Kinésithérapie Resp.", category: "Kinésithérapie", price: 3000, emergencyPrice: 5000, durationMinutes: 30, isActive: true }
    ];
  }

  // Médicaments par défaut pour les centres de santé sénégalais
  getDefaultMedicines() {
    return [
      // Antipaludéens
      { name: "Artemether/Lumefantrine", dci: "Coartem", stock: 50, minStock: 10, price: 2500, expiryDate: "2025-12-31", category: "Antipaludéen", batchNumber: "LOT-001", form: "Comprimé" },
      { name: "Artesunate+Amodiaquine", dci: "ASAQ", stock: 30, minStock: 8, price: 2000, expiryDate: "2025-11-30", category: "Antipaludéen", batchNumber: "LOT-002", form: "Comprimé" },
      { name: "Quinine", dci: "Quinine", stock: 20, minStock: 5, price: 1500, expiryDate: "2025-10-31", category: "Antipaludéen", batchNumber: "LOT-003", form: "Comprimé" },
      { name: "Doxycycline", dci: "Doxycycline", stock: 40, minStock: 10, price: 1000, expiryDate: "2026-01-31", category: "Antipaludéen", batchNumber: "LOT-004", form: "Gélule" },
      
      // Antibiotiques
      { name: "Amoxicilline 500mg", dci: "Amoxicilline", stock: 100, minStock: 20, price: 1500, expiryDate: "2025-06-30", category: "Antibiotique", batchNumber: "LOT-005", form: "Gélule" },
      { name: "Amoxicilline 1g", dci: "Amoxicilline", stock: 50, minStock: 10, price: 2000, expiryDate: "2025-07-31", category: "Antibiotique", batchNumber: "LOT-006", form: "Gélule" },
      { name: "Azithromycine", dci: "Azithromycine", stock: 30, minStock: 8, price: 3000, expiryDate: "2025-09-30", category: "Antibiotique", batchNumber: "LOT-007", form: "Comprimé" },
      { name: "Ciprofloxacine", dci: "Ciprofloxacine", stock: 40, minStock: 10, price: 2500, expiryDate: "2025-08-31", category: "Antibiotique", batchNumber: "LOT-008", form: "Comprimé" },
      { name: "Ceftriaxone", dci: "Ceftriaxone", stock: 20, minStock: 5, price: 5000, expiryDate: "2025-05-31", category: "Antibiotique", batchNumber: "LOT-009", form: "Injectable" },
      { name: "Erythromycine", dci: "Erythromycine", stock: 30, minStock: 8, price: 2000, expiryDate: "2025-10-31", category: "Antibiotique", batchNumber: "LOT-010", form: "Comprimé" },
      { name: "Gentamicine", dci: "Gentamicine", stock: 15, minStock: 5, price: 3000, expiryDate: "2025-08-31", category: "Antibiotique", batchNumber: "LOT-011", form: "Injectable" },
      
      // Antalgiques et Antipyrétiques
      { name: "Paracétamol 500mg", dci: "Paracétamol", stock: 200, minStock: 50, price: 500, expiryDate: "2026-03-31", category: "Antalgique", batchNumber: "LOT-012", form: "Comprimé" },
      { name: "Paracétamol 1000mg", dci: "Paracétamol", stock: 100, minStock: 25, price: 800, expiryDate: "2026-02-28", category: "Antalgique", batchNumber: "LOT-013", form: "Comprimé" },
      { name: "Ibuprofène 400mg", dci: "Ibuprofène", stock: 150, minStock: 30, price: 1000, expiryDate: "2026-01-31", category: "Anti-inflammatoire", batchNumber: "LOT-014", form: "Comprimé" },
      { name: "Aspirine 500mg", dci: "Aspirine", stock: 100, minStock: 20, price: 600, expiryDate: "2025-12-31", category: "Antalgique", batchNumber: "LOT-015", form: "Comprimé" },
      { name: "Tramadol", dci: "Tramadol", stock: 50, minStock: 10, price: 1500, expiryDate: "2025-11-30", category: "Antalgique", batchNumber: "LOT-016", form: "Gélule" },
      
      // Vitamines et Suppléments
      { name: "Vitamine A", dci: "Rétinol", stock: 100, minStock: 20, price: 0, expiryDate: "2025-09-30", category: "Vitamine", batchNumber: "LOT-017", form: "Capsule" },
      { name: "Fer (Sulfate Ferreux)", dci: "Fer", stock: 150, minStock: 30, price: 500, expiryDate: "2025-10-31", category: "Supplément", batchNumber: "LOT-018", form: "Comprimé" },
      { name: "Acide Folique", dci: "Acide Folique", stock: 200, minStock: 40, price: 300, expiryDate: "2026-01-31", category: "Vitamine", batchNumber: "LOT-019", form: "Comprimé" },
      { name: "Vitamine C", dci: "Acide Ascorbique", stock: 100, minStock: 20, price: 400, expiryDate: "2025-12-31", category: "Vitamine", batchNumber: "LOT-020", form: "Comprimé" },
      
      // Cardiovasculaires
      { name: "Nifédipine", dci: "Nifédipine", stock: 40, minStock: 8, price: 2000, expiryDate: "2025-08-31", category: "Antihypertenseur", batchNumber: "LOT-021", form: "Comprimé" },
      { name: "Enalapril", dci: "Enalapril", stock: 30, minStock: 6, price: 2500, expiryDate: "2025-09-30", category: "Antihypertenseur", batchNumber: "LOT-022", form: "Comprimé" },
      { name: "Furosémide", dci: "Furosémide", stock: 50, minStock: 10, price: 1500, expiryDate: "2025-10-31", category: "Diurétique", batchNumber: "LOT-023", form: "Comprimé" },
      
      // Gastro-intestinaux
      { name: "Métoprolol", dci: "Métoprolol", stock: 40, minStock: 8, price: 1800, expiryDate: "2025-11-30", category: "Bêtabloquant", batchNumber: "LOT-024", form: "Comprimé" },
      { name: "Oméprazole", dci: "Oméprazole", stock: 60, minStock: 12, price: 2000, expiryDate: "2025-12-31", category: "IPP", batchNumber: "LOT-025", form: "Gélule" },
      { name: "Ranitidine", dci: "Ranitidine", stock: 50, minStock: 10, price: 1500, expiryDate: "2025-10-31", category: "Antiulcéreux", batchNumber: "LOT-026", form: "Comprimé" },
      
      // Respiratoires
      { name: "Salbutamol", dci: "Salbutamol", stock: 30, minStock: 6, price: 3000, expiryDate: "2025-09-30", category: "Bronchodilatateur", batchNumber: "LOT-027", form: "Aérosol" },
      { name: "Bétaméthasone", dci: "Bétaméthasone", stock: 20, minStock: 4, price: 2500, expiryDate: "2025-08-31", category: "Corticoïde", batchNumber: "LOT-028", form: "Injectable" },
      
      // Diabète
      { name: "Metformine", dci: "Metformine", stock: 80, minStock: 16, price: 1200, expiryDate: "2025-11-30", category: "Antidiabétique", batchNumber: "LOT-029", form: "Comprimé" },
      { name: "Glibenclamide", dci: "Glibenclamide", stock: 40, minStock: 8, price: 1500, expiryDate: "2025-10-31", category: "Antidiabétique", batchNumber: "LOT-030", form: "Comprimé" },
      
      // Divers
      { name: "Dextrose 5%", dci: "Dextrose", stock: 20, minStock: 5, price: 2000, expiryDate: "2025-12-31", category: "Soluté", batchNumber: "LOT-031", form: "Flacon" },
      { name: "Sérum Physiologique", dci: "NaCl 0.9%", stock: 30, minStock: 8, price: 1000, expiryDate: "2026-01-31", category: "Soluté", batchNumber: "LOT-032", form: "Flacon" },
      { name: "Liquide de Dakin", dci: "Hypochlorite", stock: 15, minStock: 3, price: 1500, expiryDate: "2025-09-30", category: "Antiseptique", batchNumber: "LOT-033", form: "Flacon" },
      { name: "Bétadine", dci: "Povidone Iodée", stock: 25, minStock: 5, price: 2000, expiryDate: "2025-11-30", category: "Antiseptique", batchNumber: "LOT-034", form: "Solution" }
    ];
  }

  initializeData() {
    this.data = {
      users: [
        { id: 'u1', centerId: 'center-1', name: 'Dr. Aminata Diop', email: 'admin@medina.sn', role: 'ADMIN', phone: '770000000' },
        { id: 'u2', centerId: 'center-1', name: 'Dr. Moussa Fall', email: 'doc@medina.sn', role: 'DOCTOR', specialty: 'Généraliste', phone: '771111111' },
        { id: 'u3', centerId: 'center-1', name: 'Fatou Ndiaye', email: 'accueil@medina.sn', role: 'RECEPTIONIST', phone: '772222222' },
        { id: 'u4', centerId: 'center-1', name: 'Jean Mendy', email: 'pharma@medina.sn', role: 'PHARMACIST', phone: '773333333' },
        { id: 'u5', centerId: '', name: 'Ministère de la Santé', email: 'superadmin@senegal-sante.sn', role: 'SUPER_ADMIN', phone: '338000000' }
      ],
      centers: [
        {
          id: 'center-1',
          name: 'Poste de Santé Médina',
          address: 'Rue 15 x 16, Médina, Dakar',
          phone: '+221 33 822 00 00',
          email: 'contact@medina.sn',
          directorName: 'Dr. Aminata Diop',
          rnis: 'DK-2024-001',
          capacity: 20,
          pispiAlias: 'POSTE_MEDINA_01',
          isActive: true
        }
      ],
      services: [
        { id: 's1', centerId: 'center-1', name: 'Consultation Générale', category: 'Consultation', price: 2000, emergencyPrice: 3000, durationMinutes: 20, isActive: true },
        { id: 's2', centerId: 'center-1', name: 'Consultation Prénatale', category: 'Maternité', price: 1500, emergencyPrice: 2000, durationMinutes: 30, isActive: true },
        { id: 's3', centerId: 'center-1', name: 'Pansement Simple', category: 'Soins', price: 1000, emergencyPrice: 1500, durationMinutes: 15, isActive: true },
        { id: 's4', centerId: 'center-1', name: 'Injection', category: 'Soins', price: 500, emergencyPrice: 1000, durationMinutes: 5, isActive: true },
        { id: 's5', centerId: 'center-1', name: 'Échographie', category: 'Imagerie', price: 10000, emergencyPrice: 12000, durationMinutes: 20, isActive: true },
        { id: 's6', centerId: 'center-1', name: 'NFS (Hémogramme)', category: 'Laboratoire', price: 3000, emergencyPrice: 4000, isActive: true }
      ],
      medicines: [
        { id: 'm1', centerId: 'center-1', name: 'Paracétamol 500mg', dci: 'Paracétamol', stock: 150, minStock: 20, price: 500, expiryDate: '2025-12-31', category: 'Antalgique', batchNumber: 'LOT-001', form: 'Comprimé' },
        { id: 'm2', centerId: 'center-1', name: 'Amoxicilline 500mg', dci: 'Amoxicilline', stock: 45, minStock: 10, price: 1500, expiryDate: '2024-06-30', category: 'Antibiotique', batchNumber: 'LOT-002', form: 'Gélule' },
        { id: 'm3', centerId: 'center-1', name: 'Artemether/Lum.', dci: 'Coartem', stock: 5, minStock: 15, price: 2500, expiryDate: '2025-01-01', category: 'Antipaludéen', batchNumber: 'LOT-003', form: 'Comprimé' },
        { id: 'm4', centerId: 'center-1', name: 'Ibuprofène 400mg', dci: 'Ibuprofène', stock: 80, minStock: 20, price: 1000, expiryDate: '2026-03-15', category: 'Anti-inflammatoire', batchNumber: 'LOT-004', form: 'Comprimé' }
      ],
      patients: [
        { id: 'p1', centerId: 'center-1', code: 'P-2024-001', firstName: 'Mamadou', lastName: 'Diop', birthDate: '1980-05-15', gender: 'M', phone: '771234567', address: 'Médina Rue 6', bloodGroup: 'O+', allergies: 'Pénicilline', createdAt: '2024-01-01' },
        { id: 'p2', centerId: 'center-1', code: 'P-2024-002', firstName: 'Aissatou', lastName: 'Sow', birthDate: '1995-11-20', gender: 'F', phone: '779876543', address: 'Fass Delorme', bloodGroup: 'A+', createdAt: '2024-01-02' },
        { id: 'p3', centerId: 'center-1', code: 'P-2024-003', firstName: 'Ibrahima', lastName: 'Ndiaye', birthDate: '2015-02-10', gender: 'M', phone: '706543210', address: 'Gueule Tapée', emergencyContact: 'Père: 770000000', createdAt: '2024-01-15' }
      ],
      tickets: [
        { id: 't1', centerId: 'center-1', ticketNumber: 'CS-20240310-0001', patientName: 'Mamadou Diop', patientAge: 44, patientGender: 'M', patientPhone: '771234567', serviceId: 's1', serviceName: 'Consultation Générale', amount: 2000, paymentMethod: 'CASH', status: 'WAITING', createdAt: new Date().toISOString() },
        { id: 't2', centerId: 'center-1', ticketNumber: 'CS-20240310-0002', patientName: 'Aissatou Sow', patientAge: 29, patientGender: 'F', patientPhone: '779876543', serviceId: 's2', serviceName: 'Consultation Prénatale', amount: 1500, paymentMethod: 'MOBILE_MONEY', status: 'IN_PROGRESS', doctorId: 'u2', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 't3', centerId: 'center-1', ticketNumber: 'CS-20240310-0003', patientName: 'Ibrahima Ndiaye', patientAge: 9, patientGender: 'M', patientPhone: '706543210', serviceId: 's3', serviceName: 'Pansement Simple', amount: 1000, paymentMethod: 'CASH', status: 'COMPLETED', doctorId: 'u2', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: 't4', centerId: 'center-1', ticketNumber: 'CS-20251205-0004', patientName: 'madou th', patientAge: 34, patientGender: 'M', patientPhone: '774204484', patientAddress: 'médina', serviceId: 's5', serviceName: 'Échographie', doctorId: 'u2', amount: 10000, paymentMethod: 'CASH', notes: '', status: 'WAITING', createdAt: '2025-12-05T23:47:29.446Z' },
        { id: 't5', centerId: 'center-1', ticketNumber: 'CS-20251205-0005', patientName: 'madou th', patientAge: 3, patientGender: 'F', patientPhone: '774204484', patientAddress: 'médina', serviceId: 's3', serviceName: 'Pansement Simple', amount: 1000, paymentMethod: 'CASH', notes: '', status: 'WAITING', createdAt: '2025-12-05T23:53:36.904Z' },
        { id: 't6', centerId: 'center-1', ticketNumber: 'CS-20251206-0006', patientName: 'madou thddd', patientAge: 3, patientGender: 'F', patientPhone: '', patientAddress: 'médina', serviceId: 's2', serviceName: 'Consultation Prénatale', doctorId: 'u2', amount: 1500, paymentMethod: 'CASH', notes: '', status: 'WAITING', createdAt: '2025-12-05T23:58:50.341Z' },
        { id: 't7', centerId: 'center-1', ticketNumber: 'CS-20251206-0007', patientName: 'kj', patientAge: 2, patientGender: 'F', patientPhone: '778888888', patientAddress: 'médina', serviceId: 's5', serviceName: 'Échographie', doctorId: 'u2', amount: 10000, paymentMethod: 'CASH', notes: '', status: 'WAITING', createdAt: '2025-12-06T00:08:57.470Z' }
      ],
      consultations: []
    };
  }

  // Database operations
  findUser(email) {
    return this.data.users.find(u => u.email === email);
  }

  getUsers(centerId) {
    if (centerId) {
      return this.data.users.filter(u => u.centerId === centerId);
    }
    return this.data.users;
  }

  getCenter() {
    return this.data.centers[0];
  }

  getCenters() {
    return this.data.centers;
  }

  addCenter(center) {
    // Générer un ID unique pour le nouveau centre
    const centerId = 'center-' + (this.data.centers.length + 1);
    center.id = centerId;
    
    // Ajouter les timestamps
    center.createdAt = new Date().toISOString();
    center.updatedAt = new Date().toISOString();
    
    // S'assurer que le centre est actif par défaut
    if (center.isActive === undefined) {
      center.isActive = true;
    }
    
    // Ajouter le centre
    this.data.centers.push(center);
    
    // Ajouter les services par défaut pour ce centre
    const defaultServices = this.getDefaultServices();
    defaultServices.forEach((service, index) => {
      const serviceWithId = {
        ...service,
        id: 's' + (this.data.services.length + index + 1),
        centerId: centerId
      };
      this.data.services.push(serviceWithId);
    });
    
    // Ajouter les médicaments par défaut pour ce centre
    const defaultMedicines = this.getDefaultMedicines();
    defaultMedicines.forEach((medicine, index) => {
      const medicineWithId = {
        ...medicine,
        id: 'm' + (this.data.medicines.length + index + 1),
        centerId: centerId
      };
      this.data.medicines.push(medicineWithId);
    });
    
    this.saveDatabase();
    return center;
  }

  getServices(centerId) {
    if (centerId) {
      return this.data.services.filter(s => s.centerId === centerId);
    }
    return this.data.services;
  }

  getMedicines(centerId) {
    if (centerId) {
      return this.data.medicines.filter(m => m.centerId === centerId);
    }
    return this.data.medicines;
  }

  updateCenter(data) {
    if (this.data.centers.length > 0) {
      // Mettre à jour le premier centre (pour l'instant, nous n'avons qu'un seul centre dans cette implémentation)
      Object.assign(this.data.centers[0], data);
      this.data.centers[0].updatedAt = new Date().toISOString();
      this.saveDatabase();
      return this.data.centers[0];
    }
    return null;
  }

  getPatients() {
    return this.data.patients;
  }

  getPatientsByCenter(centerId) {
    return this.data.patients.filter(p => p.centerId === centerId);
  }

  getTickets() {
    return this.data.tickets;
  }

  getTicketsByCenter(centerId) {
    return this.data.tickets.filter(t => t.centerId === centerId);
  }

  addService(service) {
    service.id = 's' + (this.data.services.length + 1);
    this.data.services.push(service);
    this.saveDatabase();
    return service;
  }

  updateMedicine(id, data) {
    const medicine = this.data.medicines.find(m => m.id === id);
    if (medicine) {
      Object.assign(medicine, data);
      this.saveDatabase();
      return medicine;
    }
    return null;
  }

  addMedicine(medicine) {
    medicine.id = 'm' + (this.data.medicines.length + 1);
    this.data.medicines.push(medicine);
    this.saveDatabase();
    return medicine;
  }

  updateService(id, data) {
    const service = this.data.services.find(s => s.id === id);
    if (service) {
      Object.assign(service, data);
      this.saveDatabase();
      return service;
    }
    return null;
  }

  addUser(user) {
    user.id = 'u' + (this.data.users.length + 1);
    this.data.users.push(user);
    this.saveDatabase();
    return user;
  }

  updateUser(id, data) {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, data);
      this.saveDatabase();
      return user;
    }
    return null;
  }

  deleteUser(id) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.data.users.splice(index, 1);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  addPatient(patient) {
    patient.id = 'p' + (this.data.patients.length + 1);
    patient.code = 'P-' + new Date().getFullYear() + '-' + String(this.data.patients.length + 1).padStart(3, '0');
    patient.createdAt = new Date().toISOString();
    this.data.patients.push(patient);
    this.saveDatabase();
    return patient;
  }

  addTicket(ticket) {
    ticket.id = 't' + (this.data.tickets.length + 1);
    ticket.ticketNumber = 'CS-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(this.data.tickets.length + 1).padStart(4, '0');
    ticket.createdAt = new Date().toISOString();
    ticket.status = 'WAITING';
    this.data.tickets.push(ticket);
    this.saveDatabase();
    return ticket;
  }

  updateTicketStatus(id, status) {
    const ticket = this.data.tickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = status;
      this.saveDatabase();
      return ticket;
    }
    return null;
  }

  getConsultations(centerId) {
    if (centerId) {
      return this.data.consultations.filter(c => c.centerId === centerId);
    }
    return this.data.consultations;
  }

  addConsultation(consultation) {
    consultation.id = 'c' + (this.data.consultations.length + 1);
    consultation.createdAt = new Date().toISOString();
    
    // Get doctor name from users
    const doctor = this.data.users.find(u => u.id === consultation.doctorId);
    consultation.doctorName = doctor ? doctor.name : 'Unknown';
    
    this.data.consultations.push(consultation);
    this.saveDatabase();
    return consultation;
  }
}

export const db = new SimpleDB();
