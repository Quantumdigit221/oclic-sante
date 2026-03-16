-- Ajout des nouvelles tables manquantes

-- Résultats de laboratoire
CREATE TABLE IF NOT EXISTS lab_results (
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
CREATE TABLE IF NOT EXISTS sales (
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

-- Index pour les nouvelles tables
CREATE INDEX IF NOT EXISTS idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_status ON lab_results(status);
CREATE INDEX IF NOT EXISTS idx_sales_patient ON sales(patient_id);
CREATE INDEX IF NOT EXISTS idx_sales_medicine ON sales(medicine_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);

-- Utilisateurs additionnels
INSERT IGNORE INTO users (id, name, email, password_hash, role, specialite) VALUES 
('doctor-001', 'Dr. Marie Dupont', 'marie.dupont@sante.quantum221.com', '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO', 'DOCTOR', 'Médecine générale'),
('nurse-001', 'Infirmière Jeanne Martin', 'jeanne.martin@sante.quantum221.com', '$2b$10$IvYowXwqRRbSKS2M3m6lPuKD1TwGWRDz2aouI1zbR0Frsd7dc2QgO', 'NURSE', 'Soins généraux');

-- Patients exemples
INSERT IGNORE INTO patients (id, ticket_number, name, email, phone, date_of_birth, gender) VALUES 
('patient-001', 'CS-20240314-001', 'Patient Test', 'patient@test.com', '0700000000', '1990-01-01', 'M'),
('patient-002', 'CS-20240314-002', 'Patiente Test', 'patiente@test.com', '0600000000', '1995-05-15', 'F');

-- Résultats de laboratoire exemples
INSERT IGNORE INTO lab_results (id, patient_id, doctor_id, test_type, test_name, result, status) VALUES 
('lab-001', 'patient-001', 'doctor-001', 'Analyse sanguine', 'NFS', 'Résultats normaux', 'COMPLETED'),
('lab-002', 'patient-002', 'doctor-001', 'Test COVID-19', 'PCR', 'Négatif', 'COMPLETED');

-- Ventes exemples
INSERT IGNORE INTO sales (id, patient_id, medicine_id, seller_id, quantity, unit_price, total_price, payment_method) VALUES 
('sale-001', 'patient-001', 'med-001', 'admin-001', 2, 500.00, 1000.00, 'CASH'),
('sale-002', 'patient-002', 'med-002', 'admin-001', 1, 750.00, 750.00, 'MOBILE_MONEY');
