-- Table pour les compagnies d'assurance et IMP
CREATE TABLE IF NOT EXISTS insurance_companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('IMP', 'ASSURANCE', 'AUTRE') DEFAULT 'ASSURANCE',
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  contact_person VARCHAR(255),
  coverage_percentage DECIMAL(5,2) DEFAULT 100.00,
  max_coverage_amount DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table pour les couvertures d'assurance des patients
CREATE TABLE IF NOT EXISTS patient_insurance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  insurance_company_id INT NOT NULL,
  policy_number VARCHAR(100),
  member_number VARCHAR(100),
  coverage_percentage DECIMAL(5,2) DEFAULT 100.00,
  max_coverage_amount DECIMAL(10,2) DEFAULT 0.00,
  is_primary BOOLEAN DEFAULT TRUE,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (insurance_company_id) REFERENCES insurance_companies(id),
  INDEX idx_patient_insurance (patient_id, insurance_company_id)
);

-- Table pour les transactions avec assurance
CREATE TABLE IF NOT EXISTS insurance_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  invoice_id INT,
  service_id INT,
  consultation_id INT,
  total_amount DECIMAL(10,2) NOT NULL,
  patient_paid_amount DECIMAL(10,2) DEFAULT 0.00,
  insurance_coverage_amount DECIMAL(10,2) DEFAULT 0.00,
  remaining_amount DECIMAL(10,2) DEFAULT 0.00,
  insurance_company_id INT,
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'PARTIAL') DEFAULT 'PENDING',
  claim_reference VARCHAR(100),
  claim_date DATE,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (insurance_company_id) REFERENCES insurance_companies(id),
  INDEX idx_insurance_patient (patient_id, insurance_company_id),
  INDEX idx_insurance_status (status),
  INDEX idx_insurance_date (claim_date)
);

-- Ajout des colonnes dans la table invoices si elles n'existent pas
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS patient_insurance_id INT NULL,
ADD COLUMN IF NOT EXISTS insurance_coverage_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS patient_responsibility_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS has_insurance BOOLEAN DEFAULT FALSE,
ADD FOREIGN KEY IF NOT EXISTS (patient_insurance_id) REFERENCES patient_insurance(id);

-- Ajout dans la table services
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS is_insurance_billable BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS standard_insurance_rate DECIMAL(10,2) DEFAULT 0.00;
