-- =============================================
-- O'CLIC SANTE - Base de Données Complète
-- =============================================

CREATE DATABASE IF NOT EXISTS oclic_sante_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE oclic_sante_db;

-- =============================================
-- TABLES PRINCIPALES
-- =============================================

-- Utilisateurs du système
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST') NOT NULL,
    specialite VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Services médicaux
CREATE TABLE services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INT DEFAULT 30,
    color VARCHAR(20) DEFAULT '#007bff',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients
CREATE TABLE patients (
    id VARCHAR(50) PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('M', 'F', 'OTHER'),
    address TEXT,
    emergency_contact VARCHAR(255),
    blood_type VARCHAR(10),
    allergies TEXT,
    chronic_diseases TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tickets de file d'attente
CREATE TABLE tickets (
    id VARCHAR(50) PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id VARCHAR(50),
    service_id VARCHAR(50),
    patient_name VARCHAR(255) NOT NULL,
    patient_age INT,
    patient_gender ENUM('M', 'F', 'OTHER'),
    service_name VARCHAR(255) NOT NULL,
    status ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'WAITING',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    amount DECIMAL(10,2),
    paid BOOLEAN DEFAULT FALSE,
    doctor_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Consultations médicales
CREATE TABLE consultations (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50),
    patient_id VARCHAR(50),
    doctor_id VARCHAR(50),
    consultation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diagnosis TEXT,
    symptoms TEXT,
    prescription TEXT,
    recommendations TEXT,
    follow_up_date DATE,
    status ENUM('ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'ONGOING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Médicaments
CREATE TABLE medicines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'comprimé',
    stock_quantity INT DEFAULT 0,
    min_stock_alert INT DEFAULT 10,
    price DECIMAL(10,2),
    supplier VARCHAR(255),
    expiry_date DATE,
    storage_conditions TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ordonnances (prescriptions détaillées)
CREATE TABLE prescriptions (
    id VARCHAR(50) PRIMARY KEY,
    consultation_id VARCHAR(50),
    patient_id VARCHAR(50),
    doctor_id VARCHAR(50),
    prescription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Détails des ordonnances
CREATE TABLE prescription_details (
    id VARCHAR(50) PRIMARY KEY,
    prescription_id VARCHAR(50),
    medicine_id VARCHAR(50),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration_days INT,
    quantity INT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id),
    FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

-- Paiements
CREATE TABLE payments (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50),
    patient_id VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CASH', 'CARD', 'MOBILE_MONEY', 'INSURANCE') DEFAULT 'CASH',
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Résultats de laboratoire
CREATE TABLE lab_results (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50),
    doctor_id VARCHAR(50),
    test_type VARCHAR(255) NOT NULL,
    test_name VARCHAR(255),
    result TEXT,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    notes TEXT,
    result_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Ventes de médicaments
CREATE TABLE sales (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50),
    medicine_id VARCHAR(50),
    seller_id VARCHAR(50),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CASH', 'CARD', 'MOBILE_MONEY', 'INSURANCE') DEFAULT 'CASH',
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'COMPLETED',
    prescription_id VARCHAR(50),
    notes TEXT,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
);

-- =============================================
-- TABLES DE CONFIGURATION
-- =============================================

-- Paramètres du système
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Logs d'activité
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100),
    record_id VARCHAR(50),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- INDEX POUR OPTIMISATION
-- =============================================

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_date ON tickets(created_at);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_consultations_date ON consultations(consultation_date);
CREATE INDEX idx_medicines_stock ON medicines(stock_quantity);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at);
CREATE INDEX idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX idx_lab_results_status ON lab_results(status);
CREATE INDEX idx_sales_patient ON sales(patient_id);
CREATE INDEX idx_sales_medicine ON sales(medicine_id);
CREATE INDEX idx_sales_date ON sales(sale_date);

-- =============================================
-- DONNÉES INITIALES
-- =============================================

-- Utilisateur Super Admin
INSERT INTO users (id, name, email, password_hash, role) VALUES 
('admin-001', 'Administrateur O''CLIC SANTE', 'admin@sante.quantum221.com', '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO', 'SUPER_ADMIN');

-- Services médicaux
INSERT INTO services (id, name, description, price, duration_minutes, color) VALUES 
('service-001', 'Consultation générale', 'Consultation médicale générale', 5000.00, 30, '#007bff'),
('service-002', 'Consultation pédiatrique', 'Consultation spécialisée pédiatrie', 6000.00, 45, '#28a745'),
('service-003', 'Consultation gynécologie', 'Consultation spécialisée gynécologie', 8000.00, 30, '#dc3545'),
('service-004', 'Vaccination', 'Administration de vaccins', 3000.00, 15, '#ffc107'),
('service-005', 'Urgence', 'Consultation d''urgence', 10000.00, 60, '#fd7e14');

-- Médicaments exemples
INSERT INTO medicines (id, name, generic_name, category, stock_quantity, price) VALUES 
('med-001', 'Paracétamol 500mg', 'Paracétamol', 'Antalgique', 100, 500.00),
('med-002', 'Ibuprofène 400mg', 'Ibuprofène', 'Anti-inflammatoire', 80, 750.00),
('med-003', 'Amoxicilline 500mg', 'Amoxicilline', 'Antibiotique', 60, 1200.00),
('med-004', 'Vitamine C', 'Acide ascorbique', 'Supplément', 150, 300.00);

-- Utilisateurs additionnels
INSERT INTO users (id, name, email, password_hash, role, specialite) VALUES 
('doctor-001', 'Dr. Marie Dupont', 'marie.dupont@sante.quantum221.com', '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO', 'DOCTOR', 'Médecine générale'),
('nurse-001', 'Infirmière Jeanne Martin', 'jeanne.martin@sante.quantum221.com', '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO', 'NURSE', 'Soins généraux');

-- Patients exemples
INSERT INTO patients (id, ticket_number, name, email, phone, date_of_birth, gender) VALUES 
('patient-001', 'CS-20240314-001', 'Patient Test', 'patient@test.com', '0700000000', '1990-01-01', 'M'),
('patient-002', 'CS-20240314-002', 'Patiente Test', 'patiente@test.com', '0600000000', '1995-05-15', 'F');

-- Résultats de laboratoire exemples
INSERT INTO lab_results (id, patient_id, doctor_id, test_type, test_name, result, status) VALUES 
('lab-001', 'patient-001', 'doctor-001', 'Analyse sanguine', 'NFS', 'Résultats normaux', 'COMPLETED'),
('lab-002', 'patient-002', 'doctor-001', 'Test COVID-19', 'PCR', 'Négatif', 'COMPLETED');

-- Ventes exemples
INSERT INTO sales (id, patient_id, medicine_id, seller_id, quantity, unit_price, total_price, payment_method) VALUES 
('sale-001', 'patient-001', 'med-001', 'admin-001', 2, 500.00, 1000.00, 'CASH'),
('sale-002', 'patient-002', 'med-002', 'admin-001', 1, 750.00, 750.00, 'MOBILE_MONEY');

-- Paramètres système
INSERT INTO settings (setting_key, setting_value, description) VALUES 
('clinic_name', 'O''CLIC SANTE', 'Nom de la clinique'),
('clinic_address', 'Adresse de la clinique', 'Adresse complète'),
('clinic_phone', '+226 XX XX XX XX', 'Téléphone de contact'),
('currency', 'XOF', 'Devise utilisée'),
('ticket_prefix', 'CS', 'Préfixe des numéros de tickets'),
('auto_backup', 'true', 'Sauvegarde automatique activée');

-- =============================================
-- VUES UTILES
-- =============================================

-- Vue des tickets en attente
CREATE VIEW v_waiting_tickets AS
SELECT 
    t.id, t.ticket_number, t.patient_name, t.patient_age, t.patient_gender,
    t.service_name, t.status, t.priority, t.amount, t.created_at,
    s.color as service_color,
    u.name as doctor_name
FROM tickets t
LEFT JOIN services s ON t.service_id = s.id
LEFT JOIN users u ON t.doctor_id = u.id
WHERE t.status = 'WAITING'
ORDER BY t.created_at ASC;

-- Vue des consultations du jour
CREATE VIEW v_today_consultations AS
SELECT 
    c.id, c.diagnosis, c.prescription, c.consultation_date,
    p.name as patient_name, p.ticket_number,
    u.name as doctor_name,
    s.name as service_name
FROM consultations c
JOIN patients p ON c.patient_id = p.id
JOIN users u ON c.doctor_id = u.id
JOIN tickets t ON c.ticket_id = t.id
JOIN services s ON t.service_id = s.id
WHERE DATE(c.consultation_date) = CURDATE()
ORDER BY c.consultation_date DESC;
