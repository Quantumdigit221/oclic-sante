-- ========================================
-- Sénégal Santé SaaS - Base de données MySQL
-- Script d'initialisation pour Hostinger
-- ========================================

-- Nettoyage des tables existantes (optionnel)
-- DROP TABLE IF EXISTS consultations;
-- DROP TABLE IF EXISTS tickets;
-- DROP TABLE IF EXISTS medicines;
-- DROP TABLE IF EXISTS services;
-- DROP TABLE IF EXISTS patients;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS health_centers;

-- ========================================
-- 1. Table des centres de santé
-- ========================================
CREATE TABLE IF NOT EXISTS health_centers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(100),
  email VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- 2. Table des utilisateurs
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'DOCTOR', 'PHARMACIST', 'RECEPTIONIST', 'SUPER_ADMIN') NOT NULL,
  specialty VARCHAR(255),
  phone VARCHAR(100),
  centerId VARCHAR(255),
  avatarUrl VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE SET NULL
);

-- ========================================
-- 3. Table des patients
-- ========================================
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(100),
  dateOfBirth DATE,
  address TEXT,
  centerId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE SET NULL
);

-- ========================================
-- 4. Table des services
-- ========================================
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  centerId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE SET NULL
);

-- ========================================
-- 5. Table des tickets
-- ========================================
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(255) PRIMARY KEY,
  patientId VARCHAR(255),
  serviceId VARCHAR(255),
  status ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'WAITING',
  centerId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE SET NULL,
  FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE SET NULL,
  FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE SET NULL
);

-- ========================================
-- 6. Table des consultations
-- ========================================
CREATE TABLE IF NOT EXISTS consultations (
  id VARCHAR(255) PRIMARY KEY,
  patientId VARCHAR(255),
  doctorId VARCHAR(255),
  date DATE,
  diagnosis TEXT,
  prescription TEXT,
  labOrders TEXT,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  centerId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE SET NULL,
  FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE SET NULL
);

-- ========================================
-- 7. Table des médicaments
-- ========================================
CREATE TABLE IF NOT EXISTS medicines (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dci VARCHAR(255),
  stock INT DEFAULT 0,
  minStock INT DEFAULT 10,
  price DECIMAL(10,2),
  expiryDate DATE,
  category VARCHAR(255),
  batchNumber VARCHAR(255),
  form VARCHAR(100),
  centerId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE SET NULL
);

-- ========================================
-- 8. Table des ventes (pharmacie)
-- ========================================
CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(255) PRIMARY KEY,
  patientId VARCHAR(255),
  items JSON,
  totalAmount DECIMAL(10,2),
  paymentMethod ENUM('cash', 'card', 'mobile') DEFAULT 'cash',
  centerId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE SET NULL,
  FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE SET NULL
);

-- ========================================
-- Index pour optimiser les performances
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_center ON users(centerId);
CREATE INDEX IF NOT EXISTS idx_patients_center ON patients(centerId);
CREATE INDEX IF NOT EXISTS idx_services_center ON services(centerId);
CREATE INDEX IF NOT EXISTS idx_tickets_center ON tickets(centerId);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_consultations_center ON consultations(centerId);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations(doctorId);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patientId);
CREATE INDEX IF NOT EXISTS idx_medicines_center ON medicines(centerId);
CREATE INDEX IF NOT EXISTS idx_sales_center ON sales(centerId);

-- ========================================
-- Données initiales
-- ========================================

-- Centre de santé par défaut
INSERT IGNORE INTO health_centers (id, name, address, phone, email, status) VALUES 
('center-1', 'Centre Principal Sénégal Santé', 'Dakar, Plateau, Rue 123', '+221 33 123 45 67', 'contact@sante-saas.sn', 'active');

-- Utilisateur administrateur par défaut (mot de passe: admin123)
INSERT IGNORE INTO users (id, name, email, password, role, centerId) VALUES 
('admin-1', 'Administrateur Principal', 'admin@sante-saas.sn', '$2b$10$rOzJqQjQjQjQjQjQjQjQuOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'SUPER_ADMIN', 'center-1');

-- Services par défaut
INSERT IGNORE INTO services (id, name, description, price, centerId) VALUES 
('svc-1', 'Consultation Générale', 'Consultation médicale générale pour adultes', 5000.00, 'center-1'),
('svc-2', 'Consultation Pédiatrie', 'Consultation spécialisée pour enfants de 0-16 ans', 7000.00, 'center-1'),
('svc-3', 'Consultation Gynécologie', 'Suivi gynécologique et obstétrique', 8000.00, 'center-1'),
('svc-4', 'Vaccination BCG', 'Vaccin contre la tuberculose', 1500.00, 'center-1'),
('svc-5', 'Vaccination DTP', 'Vaccin diphtérie-tétanos-poliomyélite', 2000.00, 'center-1'),
('svc-6', 'Test COVID-19', 'Test de dépistage rapide', 15000.00, 'center-1'),
('svc-7', 'Prise de sang', 'Analyse sanguine complète', 8000.00, 'center-1'),
('svc-8', 'Radiographie', 'Radio pulmonaire standard', 12000.00, 'center-1'),
('svc-9', 'Échographie', 'Échographie abdominale', 15000.00, 'center-1'),
('svc-10', 'Urgence', 'Consultation d''urgence', 10000.00, 'center-1');

-- Médicaments par défaut
INSERT IGNORE INTO medicines (id, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form, centerId) VALUES 
-- Antipaludiques
('med-1', 'Artemether/Lumefantrine', 'Artemether + Lumefantrine', 100, 20, 2500.00, '2025-12-31', 'Antipaludique', 'LOT-001', 'Comprimé', 'center-1'),
('med-2', 'Quinine', 'Quinine sulfate', 50, 15, 1800.00, '2025-08-31', 'Antipaludique', 'LOT-002', 'Comprimé', 'center-1'),

-- Antibiotiques
('med-3', 'Amoxicilline', 'Amoxicillin', 200, 50, 800.00, '2025-10-31', 'Antibiotique', 'LOT-003', 'Gélule', 'center-1'),
('med-4', 'Azithromycine', 'Azithromycin', 80, 20, 1200.00, '2025-11-30', 'Antibiotique', 'LOT-004', 'Comprimé', 'center-1'),
('med-5', 'Ceftriaxone', 'Ceftriaxone sodium', 30, 10, 3500.00, '2025-09-30', 'Antibiotique', 'LOT-005', 'Injectable', 'center-1'),

-- Antalgiques
('med-6', 'Paracétamol', 'Paracetamol', 500, 100, 150.00, '2026-01-31', 'Antalgique', 'LOT-006', 'Comprimé', 'center-1'),
('med-7', 'Ibuprofène', 'Ibuprofen', 300, 75, 250.00, '2025-07-31', 'Antalgique', 'LOT-007', 'Comprimé', 'center-1'),

-- Antidiarrhéiques
('med-8', 'Sels de réhydratation orale', 'ORS', 200, 50, 500.00, '2026-02-28', 'Réhydratation', 'LOT-008', 'Poudre', 'center-1'),

-- Vitamines
('med-9', 'Vitamine A', 'Retinol', 100, 25, 300.00, '2025-11-30', 'Vitamine', 'LOT-009', 'Gélule', 'center-1'),
('med-10', 'Fer + Acide folique', 'Ferrous sulfate + Folic acid', 150, 30, 400.00, '2025-10-31', 'Supplémentation', 'LOT-010', 'Comprimé', 'center-1'),

-- Matériel médical
('med-11', 'Gants stériles', 'Latex gloves', 200, 50, 100.00, '2026-12-31', 'Matériel', 'LOT-011', 'Boîte', 'center-1'),
('med-12', 'Seringues 5ml', 'Disposable syringes', 300, 100, 150.00, '2026-12-31', 'Matériel', 'LOT-012', 'Unité', 'center-1'),
('med-13', 'Coton hydrophile', 'Cotton wool', 100, 20, 500.00, '2026-12-31', 'Matériel', 'LOT-013', 'Paquet', 'center-1'),
('med-14', 'Compresses stériles', 'Sterile gauze', 150, 30, 800.00, '2026-12-31', 'Matériel', 'LOT-014', 'Paquet', 'center-1');

-- ========================================
-- Procédures stockées (optionnel)
-- ========================================

DELIMITER //

-- Procédure pour obtenir les statistiques du tableau de bord
CREATE PROCEDURE IF NOT EXISTS GetDashboardStats(IN centerIdParam VARCHAR(255))
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM patients WHERE centerId = centerIdParam) as totalPatients,
        (SELECT COUNT(*) FROM users WHERE centerId = centerIdParam AND role != 'PATIENT') as totalStaff,
        (SELECT COUNT(*) FROM tickets WHERE centerId = centerIdParam AND status = 'WAITING') as waitingTickets,
        (SELECT COUNT(*) FROM consultations WHERE centerId = centerIdParam AND DATE(date) = CURDATE()) as todayConsultations,
        (SELECT COUNT(*) FROM medicines WHERE centerId = centerIdParam AND stock <= minStock) as lowStockMedicines;
END //

DELIMITER ;

-- ========================================
-- Vue pour les rapports
-- ========================================

CREATE OR REPLACE VIEW consultation_reports AS
SELECT 
    c.id,
    c.date,
    p.name as patientName,
    u.name as doctorName,
    'Consultation' as serviceName,
    c.status,
    c.createdAt,
    hc.name as centerName
FROM consultations c
LEFT JOIN patients p ON c.patientId = p.id
LEFT JOIN users u ON c.doctorId = u.id
LEFT JOIN health_centers hc ON c.centerId = hc.id;

-- ========================================
-- Fin du script d'initialisation
-- ========================================

-- Message de confirmation
SELECT 'Base de données Sénégal Santé SaaS initialisée avec succès!' as message;
