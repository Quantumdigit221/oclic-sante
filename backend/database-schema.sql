-- Créer la base de données
CREATE DATABASE IF NOT EXISTS sante_saas;
USE sante_saas;

-- Table health_centers
CREATE TABLE IF NOT EXISTS health_centers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  directorName VARCHAR(255),
  rnis VARCHAR(50),
  capacity INT,
  pispiAlias VARCHAR(50),
  isActive BOOLEAN DEFAULT TRUE
);

-- Table users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  centerId VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PHARMACIST') NOT NULL,
  phone VARCHAR(50),
  specialty VARCHAR(255),
  avatarUrl TEXT,
  FOREIGN KEY (centerId) REFERENCES health_centers(id)
);

-- Table patients
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(50) PRIMARY KEY,
  centerId VARCHAR(50),
  code VARCHAR(50) UNIQUE NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  birthDate DATE NOT NULL,
  gender ENUM('M', 'F') NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  bloodGroup VARCHAR(10),
  allergies TEXT,
  emergencyContact TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (centerId) REFERENCES health_centers(id)
);

-- Table services
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(50) PRIMARY KEY,
  centerId VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  emergencyPrice DECIMAL(10, 2),
  durationMinutes INT,
  description TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (centerId) REFERENCES health_centers(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table medicines
CREATE TABLE IF NOT EXISTS medicines (
  id VARCHAR(50) PRIMARY KEY,
  centerId VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  dci VARCHAR(255),
  stock INT NOT NULL DEFAULT 0,
  minStock INT NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  expiryDate DATE,
  category VARCHAR(100),
  batchNumber VARCHAR(100),
  form VARCHAR(50),
  FOREIGN KEY (centerId) REFERENCES health_centers(id)
);

-- Table tickets
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(50) PRIMARY KEY,
  centerId VARCHAR(50),
  ticketNumber VARCHAR(100) UNIQUE NOT NULL,
  patientName VARCHAR(255) NOT NULL,
  patientAge INT NOT NULL,
  patientGender ENUM('M', 'F') NOT NULL,
  patientPhone VARCHAR(50),
  patientAddress TEXT,
  serviceId VARCHAR(50),
  serviceName VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  paymentMethod ENUM('CASH', 'MOBILE_MONEY', 'CARD', 'INSURANCE') NOT NULL,
  status ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'WAITING',
  notes TEXT,
  doctorId VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (centerId) REFERENCES health_centers(id),
  FOREIGN KEY (serviceId) REFERENCES services(id),
  FOREIGN KEY (doctorId) REFERENCES users(id)
);

-- Table consultations
CREATE TABLE IF NOT EXISTS consultations (
  id VARCHAR(50) PRIMARY KEY,
  centerId VARCHAR(50),
  ticketId VARCHAR(50),
  doctorId VARCHAR(50),
  patientName VARCHAR(255) NOT NULL,
  temperature VARCHAR(20),
  weight VARCHAR(20),
  bloodPressure VARCHAR(20),
  pulse VARCHAR(20),
  symptoms TEXT,
  diagnosis TEXT,
  notes TEXT,
  prescription JSON,
  labOrders JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (centerId) REFERENCES health_centers(id),
  FOREIGN KEY (ticketId) REFERENCES tickets(id),
  FOREIGN KEY (doctorId) REFERENCES users(id)
);

-- Table sales
CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(50) PRIMARY KEY,
  centerId VARCHAR(50),
  items JSON NOT NULL,
  paymentMethod ENUM('CASH', 'MOBILE_MONEY', 'CARD', 'INSURANCE') NOT NULL,
  totalAmount DECIMAL(10, 2) NOT NULL,
  patientName VARCHAR(255),
  ticketId VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (centerId) REFERENCES health_centers(id),
  FOREIGN KEY (ticketId) REFERENCES tickets(id)
);

-- Index pour optimiser les performances
CREATE INDEX idx_patients_centerId ON patients(centerId);
CREATE INDEX idx_tickets_centerId ON tickets(centerId);
CREATE INDEX idx_consultations_centerId ON consultations(centerId);
CREATE INDEX idx_sales_centerId ON sales(centerId);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_code ON patients(code);
CREATE INDEX idx_tickets_number ON tickets(ticketNumber);

-- Données initiales
INSERT INTO health_centers (id, name, address, phone, email, directorName, rnis, capacity, pispiAlias) VALUES 
('center-1', 'Centre de Santé Medina', 'Dakar, Sénégal', '+221 33 123 45 67', 'medina@sante.sn', 'Dr. Amadou Ba', 'RNIS123456', 200, 'MEDINA-SANTE');

INSERT INTO users (id, centerId, name, email, role, phone, specialty) VALUES 
('u1', 'center-1', 'Aminata Diop', 'admin@medina.sn', 'ADMIN', '+221 77 123 45 67', 'Médecin généraliste'),
('u2', 'center-1', 'Moussa Fall', 'doctor@medina.sn', 'DOCTOR', '+221 76 987 65 43', 'Cardiologue'),
('u3', 'center-1', 'Fatou Sarr', 'reception@medina.sn', 'RECEPTIONIST', '+221 78 234 56 78', null);

INSERT INTO services (id, centerId, name, category, price, emergencyPrice, durationMinutes) VALUES 
('s1', 'center-1', 'Consultation générale', 'Consultation', 5000, 10000, 30),
('s2', 'center-1', 'Consultation spécialisée', 'Consultation', 10000, 20000, 45),
('s3', 'center-1', 'Vaccination', 'Vaccination', 2000, 5000, 15),
('s4', 'center-1', 'Analyse sanguine', 'Laboratoire', 8000, 15000, 20),
('s5', 'center-1', 'Radiographie', 'Imagerie', 15000, 25000, 30);

INSERT INTO medicines (id, centerId, name, dci, stock, minStock, price, expiryDate, category, batchNumber, form) VALUES 
('m1', 'center-1', 'Paracétamol 500mg', 'Paracétamol', 100, 20, 500, '2025-12-31', 'Antalgique', 'B001', 'Comprimé'),
('m2', 'center-1', 'Amoxicilline 1g', 'Amoxicilline', 50, 10, 1500, '2025-10-31', 'Antibiotique', 'B002', 'Comprimé'),
('m3', 'center-1', 'Ibuprofène 400mg', 'Ibuprofène', 75, 15, 800, '2025-11-30', 'Antalgique', 'B003', 'Comprimé');
