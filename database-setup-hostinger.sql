-- Script de setup pour la base de données MySQL Hostinger
-- O'CLIC SANTE - sante.quantum221.com

-- Création de la base de données (si nécessaire)
-- CREATE DATABASE IF NOT EXISTS oclic_sante_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE oclic_sante_db;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    center_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PHARMACIST') NOT NULL,
    avatar_url VARCHAR(500),
    specialty VARCHAR(255),
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_center_id (center_id)
);

-- Table des centres de santé
CREATE TABLE IF NOT EXISTS health_centers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    director_name VARCHAR(255) NOT NULL,
    rnis VARCHAR(100),
    logo_url VARCHAR(500),
    capacity INT DEFAULT 50,
    pispi_alias VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

-- Table des patients
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    center_id VARCHAR(36),
    code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    age INT NOT NULL,
    gender ENUM('M', 'F') NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    email VARCHAR(255),
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allergies TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (first_name, last_name),
    INDEX idx_center_id (center_id)
);

-- Table des services
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    center_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    emergency_price DECIMAL(10,2) NOT NULL,
    description TEXT,
    duration_minutes INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

-- Table des médicaments
CREATE TABLE IF NOT EXISTS medicines (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    center_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    dci VARCHAR(255) NOT NULL,
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 10,
    max_stock INT,
    price DECIMAL(10,2) NOT NULL,
    expiry_date DATE NOT NULL,
    category VARCHAR(100),
    batch_number VARCHAR(100),
    manufacturer VARCHAR(255),
    form VARCHAR(50),
    dosage VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_dci (dci),
    INDEX idx_category (category),
    INDEX idx_expiry (expiry_date)
);

-- Table des tickets
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    center_id VARCHAR(36),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id VARCHAR(36),
    patient_name VARCHAR(255) NOT NULL,
    patient_age INT NOT NULL,
    patient_gender ENUM('M', 'F') NOT NULL,
    patient_phone VARCHAR(20),
    patient_address TEXT,
    service_id VARCHAR(36),
    service_name VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(36),
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CASH', 'MOBILE_MONEY', 'CARD') NOT NULL,
    status ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'WAITING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT,
    INDEX idx_ticket_number (ticket_number),
    INDEX idx_patient_name (patient_name),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_doctor_id (doctor_id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Table des consultations
CREATE TABLE IF NOT EXISTS consultations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    center_id VARCHAR(36),
    ticket_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36),
    service_id VARCHAR(36),
    date DATETIME NOT NULL,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    temperature DECIMAL(4,1),
    blood_pressure VARCHAR(20),
    pulse INT,
    symptoms TEXT,
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    patient_name VARCHAR(255),
    doctor_name VARCHAR(255),
    service_name VARCHAR(255),
    lab_orders TEXT,
    prescription_items TEXT,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_date (date),
    INDEX idx_status (status),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Table des ventes
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    center_id VARCHAR(36),
    ticket_id VARCHAR(36),
    patient_name VARCHAR(255),
    items JSON NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CASH', 'MOBILE_MONEY', 'CARD') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_patient_name (patient_name),
    INDEX idx_created_at (created_at)
);

-- Insérer un utilisateur admin par défaut
INSERT IGNORE INTO users (id, name, email, role, password, center_id) 
VALUES (
    UUID(),
    'Administrateur O\'CLIC SANTE',
    'admin@sante.quantum221.com',
    'SUPER_ADMIN',
    '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQj',
    NULL
);

-- Insérer un centre de santé par défaut
INSERT IGNORE INTO health_centers (id, name, address, phone, email, director_name)
VALUES (
    UUID(),
    'Centre Médical O\'CLIC SANTE',
    '123 Rue de la Santé, Dakar, Sénégal',
    '+221 33 123 45 67',
    'contact@sante.quantum221.com',
    'Dr. Administrateur'
);

-- Insérer des services de base
INSERT IGNORE INTO services (id, center_id, name, category, price, emergency_price) VALUES
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Consultation générale', 'Consultation', 5000.00, 7500.00),
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Consultation pédiatrique', 'Consultation', 6000.00, 9000.00),
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Consultation gynécologique', 'Consultation', 7000.00, 10500.00),
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Analyse sanguine complète', 'Laboratoire', 15000.00, 22500.00),
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Radiographie thoracique', 'Imagerie', 20000.00, 30000.00),
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Échographie abdominale', 'Imagerie', 25000.00, 37500.00),
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Test COVID-19 PCR', 'Laboratoire', 25000.00, 37500.00),
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Vaccination', 'Actes', 5000.00, 7500.00);

-- Insérer des médicaments de base
INSERT IGNORE INTO medicines (id, center_id, name, dci, stock, min_stock, price, expiry_date, category, form) VALUES
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Paracétamol 500mg', 'Paracétamol', 100, 20, 500.00, '2025-12-31', 'Antalgique', 'Comprimé'),
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Ibuprofène 400mg', 'Ibuprofène', 50, 15, 800.00, '2025-12-31', 'Anti-inflammatoire', 'Comprimé'),
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Amoxicilline 500mg', 'Amoxicilline', 80, 25, 1200.00, '2025-12-31', 'Antibiotique', 'Gélule'),
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Vitamine C 1000mg', 'Acide ascorbique', 200, 50, 300.00, '2025-12-31', 'Supplément', 'Comprimé'),
(UUID(), (SELECT id FROM health_centers LIMIT 1), 'Doliprane', 'Paracétamol', 150, 30, 600.00, '2025-12-31', 'Antalgique', 'Comprimé');

COMMIT;
