-- PostgreSQL Schema for Sénégal Santé SaaS
-- Compatible with Render PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    "centerId" VARCHAR(50),
    specialty VARCHAR(255),
    phone VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Centers table
CREATE TABLE IF NOT EXISTS centers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    "patientId" VARCHAR(50) UNIQUE NOT NULL,
    "dateOfBirth" DATE,
    gender VARCHAR(10),
    phone VARCHAR(50),
    address TEXT,
    "centerId" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    "patientId" INTEGER REFERENCES patients(id),
    date TIMESTAMP NOT NULL,
    type VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    "centerId" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consultations table
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    "patientId" INTEGER REFERENCES patients(id),
    "doctorId" INTEGER REFERENCES users(id),
    date TIMESTAMP NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    "centerId" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    "patientId" INTEGER REFERENCES patients(id),
    "doctorId" INTEGER REFERENCES users(id),
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    notes TEXT,
    "centerId" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_centerId ON users("centerId");
CREATE INDEX IF NOT EXISTS idx_patients_centerId ON patients("centerId");
CREATE INDEX IF NOT EXISTS idx_patients_patientId ON patients("patientId");
CREATE INDEX IF NOT EXISTS idx_appointments_patientId ON appointments("patientId");
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_centerId ON appointments("centerId");
CREATE INDEX IF NOT EXISTS idx_consultations_patientId ON consultations("patientId");
CREATE INDEX IF NOT EXISTS idx_consultations_doctorId ON consultations("doctorId");
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date);
CREATE INDEX IF NOT EXISTS idx_consultations_centerId ON consultations("centerId");
CREATE INDEX IF NOT EXISTS idx_prescriptions_patientId ON prescriptions("patientId");
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctorId ON prescriptions("doctorId");
CREATE INDEX IF NOT EXISTS idx_prescriptions_centerId ON prescriptions("centerId");

-- Insert default center
INSERT INTO centers (id, name, address, phone, email) 
VALUES ('center-1', 'Centre de Santé Principal', 'Dakar, Sénégal', '+221 33 123 45 67', 'contact@centre1.sn')
ON CONFLICT (id) DO NOTHING;

-- Insert default admin user (password: demo123)
INSERT INTO users (name, email, password, role, "centerId", specialty) 
VALUES ('Administrateur', 'admin@sante.sn', 'demo123', 'ADMIN', 'center-1', 'Administration')
ON CONFLICT (email) DO NOTHING;

-- Insert sample doctor
INSERT INTO users (name, email, password, role, "centerId", specialty) 
VALUES ('Dr. Mbodj', 'dr.mbodj@sante.sn', 'demo123', 'DOCTOR', 'center-1', 'Médecine Générale')
ON CONFLICT (email) DO NOTHING;

-- Insert sample patients
INSERT INTO patients (name, "patientId", "dateOfBirth", gender, phone, address, "centerId") 
VALUES 
    ('Fatou Sow', 'P001', '1990-05-15', 'F', '+221 77 123 45 67', 'Dakar', 'center-1'),
    ('Mamadou Diop', 'P002', '1985-08-20', 'M', '+221 77 234 56 78', 'Dakar', 'center-1'),
    ('Aminata Ba', 'P003', '1992-03-10', 'F', '+221 77 345 67 89', 'Dakar', 'center-1')
ON CONFLICT ("patientId") DO NOTHING;
