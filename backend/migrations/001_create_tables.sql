-- Migration 001: Create tables
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  centerId TEXT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  specialty TEXT,
  avatarUrl TEXT
);

-- Create centers table
CREATE TABLE IF NOT EXISTS centers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  directorName TEXT,
  rnis TEXT,
  capacity INTEGER,
  pispiAlias TEXT,
  isActive BOOLEAN DEFAULT 1
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  centerId TEXT,
  name TEXT NOT NULL,
  category TEXT,
  price INTEGER,
  emergencyPrice INTEGER,
  durationMinutes INTEGER,
  isActive BOOLEAN DEFAULT 1
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY,
  centerId TEXT,
  name TEXT NOT NULL,
  dci TEXT,
  stock INTEGER,
  minStock INTEGER,
  price INTEGER,
  expiryDate TEXT,
  category TEXT,
  batchNumber TEXT,
  form TEXT
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  centerId TEXT,
  code TEXT UNIQUE NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  birthDate TEXT,
  gender TEXT,
  phone TEXT,
  address TEXT,
  bloodGroup TEXT,
  allergies TEXT,
  emergencyContact TEXT,
  createdAt TEXT
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  centerId TEXT,
  ticketNumber TEXT UNIQUE NOT NULL,
  patientName TEXT NOT NULL,
  patientAge INTEGER,
  patientGender TEXT,
  patientPhone TEXT,
  serviceId TEXT,
  serviceName TEXT,
  amount INTEGER,
  paymentMethod TEXT,
  status TEXT DEFAULT " WAITING\,
 doctorId TEXT,
 createdAt TEXT
);
