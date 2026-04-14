
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  RECEPTIONIST = 'RECEPTIONIST',
  PHARMACIST = 'PHARMACIST'
}

export enum TicketStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NOSHOW = 'NOSHOW'
}

export interface HealthCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  directorName: string;
  rnis?: string;
  logoUrl?: string;
  capacity?: number;
  pispiAlias?: string; // PI-SPI Merchant Alias for Mobile Money QR
  isActive: boolean;
}

export interface User {
  id: string;
  centerId: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  specialty?: string; // For doctors
  phone?: string;
  password?: string;
}

export interface Service {
  id: string;
  centerId: string;
  name: string;
  category: string;
  price: number; // In FCFA
  emergencyPrice: number;
  description?: string;
  durationMinutes?: number;
  isActive: boolean;
}

export interface Patient {
  id: string;
  centerId: string;
  code: string; // Ex: P-2023-001
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  age: number;
  gender: 'M' | 'F';
  phone: string;
  address: string;
  email?: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  centerId: string;
  ticketNumber: string; // CS-YYYYMMDD-XXXX
  patientId?: string; // Link to Patient DB
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  patientPhone?: string;
  patientAddress?: string;
  serviceId: string;
  serviceName: string; // Denormalized for reports
  serviceCategory?: string;
  services?: any[];
  doctorId?: string;
  amount: number;
  paymentMethod: 'CASH' | 'MOBILE_MONEY' | 'CARD';
  status: string;
  createdAt: string; // ISO Date
  notes?: string;
  insuranceId?: string | number;
  insuranceCoverage?: number;
}

export interface Medicine {
  id: string;
  centerId: string;
  name: string;
  dci: string; // Dénomination Commune Internationale
  stock: number;
  minStock: number;
  maxStock?: number;
  price: number;
  expiryDate: string;
  category: string;
  batchNumber: string;
  manufacturer?: string;
  form?: string;
  dosage?: string;
}

export interface Sale {
  id: string;
  centerId: string;
  ticketId?: string; // Optional link to a consultation
  patientName?: string; // Nom du patient (lié ou manuel)
  items: {
    medicineId: string;
    medicineName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  paymentMethod: 'CASH' | 'MOBILE_MONEY' | 'CARD';
  createdAt: string;
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string; // e.g. "1 comprimé matin et soir"
  quantity: number;
  form?: string;
}

export interface Consultation {
  id: string;
  centerId: string;
  ticketId: string;
  patientId: string;
  doctorId?: string;
  serviceId?: string;
  date: string; // DATETIME format

  // Vitals
  weight?: number; // kg
  height?: number; // cm
  temperature?: number; // °C
  bloodPressure?: string; // "120/80"
  pulse?: number; // bpm

  // Medical
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;

  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations (non stockées en base)
  patientName?: string;
  doctorName?: string;
  serviceName?: string;
  labOrders?: string[]; // IDs des examens
  prescriptionItems?: PrescriptionItem[]; // Détails de la prescription
}

export interface LabResult {
  id: string;
  centerId: string;
  patientId: string;
  patientName: string;
  consultationId?: string;
  ticketId?: string;
  testName: string;
  category: string;
  status: 'pending' | 'completed' | 'validated';
  result: any;
  notes?: string;
  doctorId: string;
  doctorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  centerId: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  reason?: string;
  status: AppointmentStatus;
  smsSent: boolean;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  doctorId?: string;
  doctorName?: string;
}
