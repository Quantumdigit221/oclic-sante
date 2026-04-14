import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, HealthCenter, Ticket, Service, Medicine, Sale, Role, TicketStatus, Consultation, Patient, LabResult, Appointment, AppointmentStatus } from './types';
import { apiClient } from './lib/api';
import { differenceInYears } from 'date-fns';

const getApiBaseUrl = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('sante.quantum221.com')) {
      return 'https://sante.quantum221.com/api';
    }
    if (hostname.includes('samacaisse.cloud') || hostname.includes('samacaisse')) {
      return 'https://santesaas.samacaisse.cloud/api';
    }
  }
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// --- MOCK DATA ---
const MOCK_CENTER: HealthCenter = {
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
};

const MOCK_USERS: User[] = [
  { id: 'u1', centerId: 'center-1', name: 'Dr. Aminata Diop', email: 'admin@medina.sn', role: Role.ADMIN, phone: '770000000' },
  { id: 'u2', centerId: 'center-1', name: 'Dr. Moussa Fall', email: 'doc@medina.sn', role: Role.DOCTOR, specialty: 'Généraliste', phone: '771111111', avatarUrl: 'https://i.pravatar.cc/150?u=doc' },
  { id: 'u3', centerId: 'center-1', name: 'Fatou Ndiaye', email: 'accueil@medina.sn', role: Role.RECEPTIONIST, phone: '772222222' },
  { id: 'u4', centerId: 'center-1', name: 'Jean Mendy', email: 'pharma@medina.sn', role: Role.PHARMACIST, phone: '773333333' },
  { id: 'u5', centerId: '', name: 'Ministère de la Santé', email: 'superadmin@senegal-sante.sn', role: Role.SUPER_ADMIN, phone: '338000000' }
];

const MOCK_SERVICES: Service[] = [
  { id: 's1', centerId: 'center-1', name: 'Consultation Générale', category: 'Consultation', price: 2000, emergencyPrice: 3000, durationMinutes: 20, isActive: true },
  { id: 's2', centerId: 'center-1', name: 'Consultation Prénatale', category: 'Maternité', price: 1500, emergencyPrice: 2000, durationMinutes: 30, isActive: true },
  { id: 's3', centerId: 'center-1', name: 'Pansement Simple', category: 'Soins', price: 1000, emergencyPrice: 1500, durationMinutes: 15, isActive: true },
  { id: 's4', centerId: 'center-1', name: 'Injection', category: 'Soins', price: 500, emergencyPrice: 1000, durationMinutes: 5, isActive: true },
  { id: 's5', centerId: 'center-1', name: 'Échographie', category: 'Imagerie', price: 10000, emergencyPrice: 12000, durationMinutes: 20, isActive: true },
  { id: 's6', centerId: 'center-1', name: 'NFS (Hémogramme)', category: 'Laboratoire', price: 3000, emergencyPrice: 4000, isActive: true },
  { id: 's7', centerId: 'center-1', name: 'Consultation Pédiatrique', category: 'Consultation', price: 2500, emergencyPrice: 3500, durationMinutes: 25, isActive: true },
  { id: 's8', centerId: 'center-1', name: 'Vaccination BCG', category: 'Vaccination', price: 1500, emergencyPrice: 2000, durationMinutes: 10, isActive: true },
  { id: 's9', centerId: 'center-1', name: 'Suture', category: 'Soins', price: 5000, emergencyPrice: 7000, durationMinutes: 30, isActive: true },
  { id: 's10', centerId: 'center-1', name: 'Radiographie Pulmonaire', category: 'Imagerie', price: 8000, emergencyPrice: 10000, durationMinutes: 15, isActive: true },
  { id: 's11', centerId: 'center-1', name: 'Test COVID-19', category: 'Laboratoire', price: 15000, emergencyPrice: 20000, durationMinutes: 15, isActive: true },
  { id: 's12', centerId: 'center-1', name: 'Consultation Cardiologique', category: 'Consultation', price: 5000, emergencyPrice: 7000, durationMinutes: 30, isActive: true },
  { id: 's13', centerId: 'center-1', name: 'Glycémie', category: 'Laboratoire', price: 2000, emergencyPrice: 3000, isActive: true },
  { id: 's14', centerId: 'center-1', name: 'Prise de sang', category: 'Laboratoire', price: 2500, emergencyPrice: 3500, durationMinutes: 10, isActive: true },
  { id: 's15', centerId: 'center-1', name: 'Mise en plâtre', category: 'Soins', price: 7000, emergencyPrice: 10000, durationMinutes: 45, isActive: true },
];

const MOCK_MEDICINES: Medicine[] = [
  { id: 'm1', centerId: 'center-1', name: 'Paracétamol 500mg', dci: 'Paracétamol', stock: 150, minStock: 20, price: 500, expiryDate: '2025-12-31', category: 'Antalgique', batchNumber: 'LOT-001', form: 'Comprimé' },
  { id: 'm2', centerId: 'center-1', name: 'Amoxicilline 500mg', dci: 'Amoxicilline', stock: 45, minStock: 10, price: 1500, expiryDate: '2024-06-30', category: 'Antibiotique', batchNumber: 'LOT-002', form: 'Gélule' },
  { id: 'm3', centerId: 'center-1', name: 'Artemether/Lum.', dci: 'Coartem', stock: 5, minStock: 15, price: 2500, expiryDate: '2025-01-01', category: 'Antipaludéen', batchNumber: 'LOT-003', form: 'Comprimé' },
  { id: 'm4', centerId: 'center-1', name: 'Ibuprofène 400mg', dci: 'Ibuprofène', stock: 80, minStock: 20, price: 1000, expiryDate: '2026-03-15', category: 'Anti-inflammatoire', batchNumber: 'LOT-004', form: 'Comprimé' },
  { id: 'm5', centerId: 'center-1', name: 'Vitamine C 500mg', dci: 'Acide Ascorbique', stock: 200, minStock: 30, price: 300, expiryDate: '2025-08-20', category: 'Vitamine', batchNumber: 'LOT-005', form: 'Comprimé' },
  { id: 'm6', centerId: 'center-1', name: 'Doliprane 1000mg', dci: 'Paracétamol', stock: 60, minStock: 15, price: 800, expiryDate: '2024-12-15', category: 'Antalgique', batchNumber: 'LOT-006', form: 'Comprimé' },
  { id: 'm7', centerId: 'center-1', name: 'Augmentin 625mg', dci: 'Amoxicilline/Acide Clavulanique', stock: 30, minStock: 10, price: 2200, expiryDate: '2024-09-30', category: 'Antibiotique', batchNumber: 'LOT-007', form: 'Comprimé' },
  { id: 'm8', centerId: 'center-1', name: 'Flagyl 500mg', dci: 'Métronidazole', stock: 25, minStock: 8, price: 1200, expiryDate: '2025-02-28', category: 'Antibiotique', batchNumber: 'LOT-008', form: 'Comprimé' },
  { id: 'm9', centerId: 'center-1', name: 'Ventoline 100µg', dci: 'Salbutamol', stock: 40, minStock: 12, price: 3500, expiryDate: '2025-06-10', category: 'Bronchodilatateur', batchNumber: 'LOT-009', form: 'Aérosol' },
  { id: 'm10', centerId: 'center-1', name: 'Artéméther 80mg', dci: 'Artéméther', stock: 15, minStock: 10, price: 1800, expiryDate: '2024-11-25', category: 'Antipaludéen', batchNumber: 'LOT-010', form: 'Comprimé' },
  { id: 'm11', centerId: 'center-1', name: 'Nurofen 200mg', dci: 'Ibuprofène', stock: 95, minStock: 20, price: 600, expiryDate: '2025-07-18', category: 'Anti-inflammatoire', batchNumber: 'LOT-011', form: 'Comprimé' },
  { id: 'm12', centerId: 'center-1', name: 'Aspirine 100mg', dci: 'Acide Acétylsalicylique', stock: 120, minStock: 25, price: 400, expiryDate: '2026-01-10', category: 'Antalgique', batchNumber: 'LOT-012', form: 'Comprimé' },
  { id: 'm13', centerId: 'center-1', name: 'Efferalgan 500mg', dci: 'Paracétamol', stock: 75, minStock: 15, price: 550, expiryDate: '2025-04-22', category: 'Antalgique', batchNumber: 'LOT-013', form: 'Comprimé effervescent' },
  { id: 'm14', centerId: 'center-1', name: 'Bactrim 400mg', dci: 'Cotrimoxazole', stock: 35, minStock: 8, price: 1600, expiryDate: '2024-08-14', category: 'Antibiotique', batchNumber: 'LOT-014', form: 'Comprimé' },
  { id: 'm15', centerId: 'center-1', name: 'Dexaméthasone 4mg', dci: 'Dexaméthasone', stock: 50, minStock: 10, price: 900, expiryDate: '2025-09-05', category: 'Corticoïde', batchNumber: 'LOT-015', form: 'Comprimé' },
  { id: 'm16', centerId: 'center-1', name: 'Glucomètre', dci: 'Glucomètre', stock: 20, minStock: 5, price: 15000, expiryDate: '2027-12-31', category: 'Équipement', batchNumber: 'LOT-016', form: 'Appareil' },
  { id: 'm17', centerId: 'center-1', name: 'Bandes élastiques', dci: 'Bande élastique', stock: 100, minStock: 20, price: 1500, expiryDate: '2026-12-31', category: 'Matériel', batchNumber: 'LOT-017', form: 'Bandage' },
  { id: 'm18', centerId: 'center-1', name: 'Sérum physiologique 500ml', dci: 'Sérum physiologique', stock: 60, minStock: 15, price: 800, expiryDate: '2025-03-20', category: 'Soluté', batchNumber: 'LOT-018', form: 'Perfusion' },
  { id: 'm19', centerId: 'center-1', name: 'Gants chirurgicaux', dci: 'Gants chirurgicaux', stock: 200, minStock: 50, price: 250, expiryDate: '2025-11-30', category: 'Matériel', batchNumber: 'LOT-019', form: 'Boîte' },
  { id: 'm20', centerId: 'center-1', name: 'Bétadine 15ml', dci: 'Povidone iodée', stock: 85, minStock: 20, price: 1200, expiryDate: '2024-10-15', category: 'Antiseptique', batchNumber: 'LOT-020', form: 'Solution' },
];

const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', centerId: 'center-1', code: 'P-2024-001', firstName: 'Mamadou', lastName: 'Diop', age: 44, birthDate: '1980-05-15', gender: 'M', phone: '771234567', address: 'Médina Rue 6', bloodGroup: 'O+', allergies: 'Pénicilline', createdAt: '2024-01-01' },
  { id: 'p2', centerId: 'center-1', code: 'P-2024-002', firstName: 'Aissatou', lastName: 'Sow', age: 29, birthDate: '1995-11-20', gender: 'F', phone: '779876543', address: 'Fass Delorme', bloodGroup: 'A+', createdAt: '2024-01-02' },
  { id: 'p3', centerId: 'center-1', code: 'P-2024-003', firstName: 'Ibrahima', lastName: 'Ndiaye', age: 9, birthDate: '2015-02-10', gender: 'M', phone: '706543210', address: 'Gueule Tapée', emergencyContact: 'Père: 770000000', createdAt: '2024-01-15' },
  { id: 'p4', centerId: 'center-1', code: 'P-2024-004', firstName: 'Fatou', lastName: 'Ba', age: 39, birthDate: '1985-08-22', gender: 'F', phone: '762345678', address: 'Ouakam Rue 12', bloodGroup: 'B+', allergies: 'Aucune', email: 'fatou.ba@email.com', createdAt: '2024-01-20' },
  { id: 'p5', centerId: 'center-1', code: 'P-2024-005', firstName: 'Oumar', lastName: 'Fall', age: 46, birthDate: '1978-03-10', gender: 'M', phone: '778901234', address: 'Pikine Bloc 16', bloodGroup: 'AB+', emergencyContact: 'Épouse: 775678901', createdAt: '2024-02-01' },
  { id: 'p6', centerId: 'center-1', code: 'P-2024-006', firstName: 'Mariam', lastName: 'Touré', age: 16, birthDate: '2008-12-03', gender: 'F', phone: '773456789', address: 'Grand Yoff', bloodGroup: 'O-', allergies: 'Arachides', emergencyContact: 'Mère: 770123456', createdAt: '2024-02-10' },
  { id: 'p7', centerId: 'center-1', code: 'P-2024-007', firstName: 'Abdou', lastName: 'Kane', age: 32, birthDate: '1992-07-18', gender: 'M', phone: '770987654', address: 'Mermoz Avenue 45', bloodGroup: 'A-', email: 'abdou.kane@email.com', createdAt: '2024-02-15' },
  { id: 'p8', centerId: 'center-1', code: 'P-2024-008', firstName: 'Awa', lastName: 'Ndiaye', age: 36, birthDate: '1988-09-25', gender: 'F', phone: '772345678', address: 'Sacré Coeur 3', bloodGroup: 'B-', allergies: 'Pollens', emergencyContact: 'Mari: 771234567', createdAt: '2024-02-20' },
  { id: 'p9', centerId: 'center-1', code: 'P-2024-009', firstName: 'Baba', lastName: 'Cissé', age: 14, birthDate: '2010-04-08', gender: 'M', phone: '765432109', address: 'Biscuiterie', bloodGroup: 'AB-', emergencyContact: 'Père: 770987654', createdAt: '2024-03-01' },
  { id: 'p10', centerId: 'center-1', code: 'P-2024-010', firstName: 'Khady', lastName: 'Dieng', age: 49, birthDate: '1975-11-30', gender: 'F', phone: '771112223', address: 'Liberté 6', bloodGroup: 'O+', allergies: 'Fruits de mer', email: 'khady.dieng@email.com', createdAt: '2024-03-05' },
  { id: 'p11', centerId: 'center-1', code: 'P-2024-011', firstName: 'Modou', lastName: 'Gueye', age: 21, birthDate: '2003-01-15', gender: 'M', phone: '770445566', address: 'Yoff', bloodGroup: 'A+', emergencyContact: 'Oncle: 771234567', createdAt: '2024-03-10' },
  { id: 'p12', centerId: 'center-1', code: 'P-2024-012', firstName: 'Rokhaya', lastName: 'Seck', age: 34, birthDate: '1990-06-20', gender: 'F', phone: '772233445', address: 'Almadies', bloodGroup: 'B+', allergies: 'Aucune', createdAt: '2024-03-12' },
  { id: 'p13', centerId: 'center-1', code: 'P-2024-013', firstName: 'Cheikh', lastName: 'Lo', age: 42, birthDate: '1982-08-14', gender: 'M', phone: '771556677', address: 'Point E', bloodGroup: 'AB+', email: 'cheikh.lo@email.com', emergencyContact: 'Frère: 770889900', createdAt: '2024-03-15' },
  { id: 'p14', centerId: 'center-1', code: 'P-2024-014', firstName: 'Mame', lastName: 'Sarr', age: 12, birthDate: '2012-03-28', gender: 'F', phone: '773334455', address: 'Plateau', bloodGroup: 'O-', allergies: 'Dermatite', emergencyContact: 'Mère: 771122334', createdAt: '2024-03-18' },
  { id: 'p15', centerId: 'center-1', code: 'P-2024-015', firstName: 'Saliou', lastName: 'Mbodj', age: 56, birthDate: '1968-12-10', gender: 'M', phone: '770667788', address: 'Biscuiterie Extension', bloodGroup: 'A-', allergies: 'Aucune', email: 'saliou.mbodj@email.com', createdAt: '2024-03-20' },
];

const MOCK_TICKETS: Ticket[] = [
  { id: 't1', centerId: 'center-1', ticketNumber: 'CS-20240310-0001', patientName: 'Mamadou Diop', patientAge: 44, patientGender: 'M', patientPhone: '771234567', serviceId: 's1', serviceName: 'Consultation Générale', amount: 2000, paymentMethod: 'CASH', status: TicketStatus.WAITING, createdAt: new Date().toISOString() },
  { id: 't2', centerId: 'center-1', ticketNumber: 'CS-20240310-0002', patientName: 'Aissatou Sow', patientAge: 29, patientGender: 'F', patientPhone: '779876543', serviceId: 's2', serviceName: 'Consultation Prénatale', amount: 1500, paymentMethod: 'MOBILE_MONEY', status: TicketStatus.IN_PROGRESS, doctorId: 'u2', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 't3', centerId: 'center-1', ticketNumber: 'CS-20240310-0003', patientName: 'Ibrahima Ndiaye', patientAge: 9, patientGender: 'M', patientPhone: '706543210', serviceId: 's3', serviceName: 'Pansement Simple', amount: 1000, paymentMethod: 'CASH', status: TicketStatus.COMPLETED, doctorId: 'u2', createdAt: new Date(Date.now() - 7200000).toISOString() },
];

const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: 'c1',
    centerId: 'center-1',
    ticketId: 't1',
    patientId: 'p1',
    doctorId: 'u2',
    patientName: 'Mamadou Diop',
    doctorName: 'Dr. Moussa Fall',
    date: new Date(Date.now() - 3600000).toISOString(),
    symptoms: 'Fièvre et toux depuis 3 jours',
    diagnosis: 'Infection respiratoire',
    notes: 'Patient à surveiller',
    prescription: JSON.stringify([
      { medicineId: 'm1', medicineName: 'Paracétamol 500mg', dosage: '1 comprimé matin et soir', quantity: 10, form: 'Comprimé' }
    ]),
    labOrders: ['s6', 's13'], // NFS (Hémogramme) et Glycémie
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'c2',
    centerId: 'center-1',
    ticketId: 't2',
    patientId: 'p2',
    doctorId: 'u2',
    patientName: 'Aissatou Sow',
    doctorName: 'Dr. Moussa Fall',
    date: new Date(Date.now() - 7200000).toISOString(),
    symptoms: 'Contrôle de grossesse',
    diagnosis: 'Grossesse évolutive',
    notes: 'Suivi régulier recommandé',
    prescription: JSON.stringify([
      { medicineId: 'm2', medicineName: 'Amoxicilline 500mg', dosage: '1 gélule matin, midi et soir', quantity: 15, form: 'Gélule' }
    ]),
    labOrders: ['s5'], // Échographie
    status: 'completed',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'c3',
    centerId: 'center-1',
    ticketId: 't3',
    patientId: 'p3',
    doctorId: 'u2',
    patientName: 'Ibrahima Ndiaye',
    doctorName: 'Dr. Moussa Fall',
    date: new Date(Date.now() - 10800000).toISOString(),
    symptoms: 'Douleur thoracique',
    diagnosis: 'Suspicion de pneumonie',
    notes: 'Radiographie nécessaire',
    prescription: JSON.stringify([]),
    labOrders: ['s10'], // Radiographie Pulmonaire
    status: 'completed',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString()
  }
];

// --- CONTEXT INTERFACES ---
interface AppState {
  currentUser: User | null;
  currentCenter: HealthCenter | null;
  allCenters: HealthCenter[];
  users: User[];
  patients: Patient[];
  tickets: Ticket[];
  services: Service[];
  medicines: Medicine[];
  sales: Sale[];
  consultations: Consultation[];
  labResults: LabResult[];
  appointments: Appointment[];
  insuranceCompanies: any[];
  insuranceTransactions: any[];
  patientInsurances: any[];
  invoices: any[];
  isLoading: boolean;
}

interface AppContextType extends AppState {
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'ticketNumber' | 'centerId' | 'status'>) => Promise<Ticket | null>;
  refreshTickets: () => Promise<void>;
  updateTicketStatus: (id: string, status: string) => Promise<void>;
  addSale: (items: Sale['items'], paymentMethod: Sale['paymentMethod'], ticketId?: string, patientName?: string) => void;
  registerCenter: (center: Omit<HealthCenter, 'id' | 'isActive'>, admin: Omit<User, 'id' | 'centerId' | 'role'>) => Promise<void>;
  createCenter: (data: any) => Promise<void>;
  updateCenter: (data: Partial<HealthCenter>) => void;
  toggleCenterStatus: (id: string, status: boolean) => void;
  addService: (service: Omit<Service, 'id' | 'centerId'>) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addMedicine: (medicine: Omit<Medicine, 'id' | 'centerId'>) => void;
  updateMedicine: (id: string, data: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  addUser: (user: Omit<User, 'id' | 'centerId'> & { password?: string }) => Promise<User | null>;
  updateUser: (id: string, data: Partial<User>) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  addPatient: (patient: Omit<Patient, 'id' | 'centerId' | 'code' | 'age' | 'createdAt'>) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  saveConsultation: (consultation: Omit<Consultation, 'id' | 'createdAt' | 'doctorName'>) => void;
  addLabResult: (result: Omit<LabResult, 'id' | 'createdAt' | 'updatedAt' | 'centerId'>) => Promise<LabResult | null>;
  updateLabResult: (id: string, data: Partial<LabResult>) => Promise<LabResult | null>;
  deleteLabResult: (id: string) => Promise<boolean>;
  refreshLabResults: () => Promise<void>;
  createAppointment: (appointment: Omit<Appointment, 'id' | 'centerId' | 'createdAt' | 'updatedAt' | 'status' | 'smsSent' | 'reminderSent'>) => Promise<Appointment | null>;
  refreshAppointments: () => Promise<void>;
  switchCenter: (center: HealthCenter) => Promise<void>;
  createInsuranceCompany: (data: any) => Promise<any>;
  updateInsuranceCompany: (id: number, data: any) => Promise<any>;
  deleteInsuranceCompany: (id: number) => Promise<void>;
  createPatientInsurance: (data: any) => Promise<any>;
  updatePatientInsurance: (id: number, data: any) => Promise<void>;
  deletePatientInsurance: (id: number) => Promise<void>;
  createInsuranceTransaction: (data: any) => Promise<any>;
  updateInsuranceTransaction: (id: number, updates: any) => Promise<void>;
  refreshInvoices: () => Promise<void>;
  refreshInsuranceData: () => Promise<void>;
  loadData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCenter, setCurrentCenter] = useState<HealthCenter | null>(null);

  const [allCenters, setAllCenters] = useState<HealthCenter[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>(MOCK_CONSULTATIONS);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<any[]>([]);
  const [insuranceTransactions, setInsuranceTransactions] = useState<any[]>([]);
  const [patientInsurances, setPatientInsurances] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // Restore session
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedCenter = localStorage.getItem('currentCenter');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);

        // Refresh data if user is logged in
        apiClient.getServices().then(setServices).catch(console.error);
        apiClient.getMedicines().then(setMedicines).catch(console.error);
        apiClient.getPatients().then(setPatients).catch(console.error);
        apiClient.getTickets().then(setTickets).catch(console.error);
        apiClient.getUsers().then(setUsers).catch(console.error);
        apiClient.getConsultations().then(setConsultations).catch(console.error);
        apiClient.getLabResults().then(setLabResults).catch(console.error);
        apiClient.getSales().then(setSales).catch(console.error);
        refreshInsuranceData().catch(console.error);
      } catch (e) {
        console.error('Failed to restore user session:', e);
      }
    }

    if (savedCenter) {
      try {
        setCurrentCenter(JSON.parse(savedCenter));
      } catch (e) {
        console.error('Failed to restore center session:', e);
      }
    }
  }, []);

  // --- LOGIN ---
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await apiClient.login(email, password);

      if (response.success) {
        const user = response.user;
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Sauvegarder le token JWT pour les requêtes API suivantes
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('oclic_sante_jwt_token', response.token);
        }

        // Load data based on role
        if (user.role === Role.SUPER_ADMIN) {
          const centers = await apiClient.getCenters();
          setAllCenters(centers);
          if (centers.length > 0) {
            setCurrentCenter(centers[0]);
            localStorage.setItem('currentCenter', JSON.stringify(centers[0]));
          }
          const [services, medicines, patients, tickets, users, consultations, labResults, sales, appts] = await Promise.all([
            apiClient.getServices(),
            apiClient.getMedicines(),
            apiClient.getPatients(),
            apiClient.getTickets(),
            apiClient.getUsers(),
            apiClient.getConsultations(),
            apiClient.getLabResults(),
            apiClient.getSales(),
            apiClient.getAppointments()
          ]);

          setServices(services);
          setMedicines(medicines);
          setPatients(patients);
          setTickets(tickets);
          setUsers(users);
          setConsultations(consultations);
          setLabResults(labResults);
          setSales(sales);
          setAppointments(appts || []);
          refreshInsuranceData();
        } else {
          const [center, services, medicines, patients, tickets, users, consultations, labResults, sales, appts] = await Promise.all([
            apiClient.getCenter(),
            apiClient.getServices(),
            apiClient.getMedicines(),
            apiClient.getPatients(),
            apiClient.getTickets(),
            apiClient.getUsers(),
            apiClient.getConsultations(),
            apiClient.getLabResults(),
            apiClient.getSales(),
            apiClient.getAppointments()
          ]);

          setCurrentCenter(center);
          localStorage.setItem('currentCenter', JSON.stringify(center));
          setServices(services);
          setMedicines(medicines);
          setPatients(patients);
          setTickets(tickets);
          setUsers(users);
          setConsultations(consultations);
          setLabResults(labResults);
          setSales(sales);
          setAppointments(appts || []);
        }

        setIsLoading(false);
        return true;
      }

      console.error("Login failed: Invalid credentials");
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    setCurrentUser(null);
    setCurrentCenter(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentCenter');
    localStorage.removeItem('token');
    setPatients([]);
    setTickets([]);
    setServices([]);
    setMedicines([]);
    setSales([]);
    setConsultations([]);
    setUsers([]);
  };

  const toggleCenterStatus = async (id: string, status: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/centers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: status }),
      });

      if (response.ok) {
        setAllCenters(prev => prev.map(c =>
          c.id === id ? { ...c, isActive: status } : c
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling center status:', error);
      return false;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        refreshTickets(),
        refreshAppointments(),
        refreshLabResults(),
        refreshInsuranceData()
      ]);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const switchCenter = async (center: HealthCenter) => {
    setCurrentCenter(center);
    localStorage.setItem('currentCenter', JSON.stringify(center));

    // Recharger les données du nouveau centre
    const [services, medicines, patients, tickets, users, consultations] = await Promise.all([
      apiClient.getServices(),
      apiClient.getMedicines(),
      apiClient.getPatients(),
      apiClient.getTickets(),
      apiClient.getUsers(),
      apiClient.getConsultations()
    ]);

    setServices(services);
    setMedicines(medicines);
    setPatients(patients);
    setTickets(tickets);
    setUsers(users);
    setConsultations(consultations);
    refreshInsuranceData();
  };

  // --- IMPLEMENTATIONS ---
  const createTicket = async (ticketData: any) => {
    // Auto-create patient if they don't exist
    const patientName = ticketData.patientName || '';
    const nameParts = patientName.split(' ');
    const searchFirstName = nameParts[0]?.toLowerCase() || '';
    const searchLastName = nameParts.slice(1).join(' ').toLowerCase() || '';

    const existingPatient = patients.find(p =>
      p?.firstName?.toLowerCase() === searchFirstName &&
      p?.lastName?.toLowerCase() === searchLastName
    );

    if (!existingPatient) {
      // Création silencieuse du patient
      const nameParts = ticketData.patientName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      await addPatient({
        firstName: firstName,
        lastName: lastName,
        age: ticketData.patientAge,
        birthDate: new Date(new Date().setFullYear(new Date().getFullYear() - ticketData.patientAge)).toISOString().split('T')[0],
        gender: ticketData.patientGender,
        phone: ticketData.patientPhone,
        address: ticketData.patientAddress,
      });
    }

    try {
      // Ajouter le centerId au ticket
      const ticketWithCenter = {
        ...ticketData,
        centerId: currentCenter?.id || 'center-1'
      };

      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketWithCenter),
      });

      if (response.ok) {
        const ticket = await response.json();
        setTickets(prev => [...prev, ticket]);
        return ticket;
      }
      try {
        const errorData = await response.json();
        console.error('Failed to create ticket:', response.status, errorData);
      } catch (e) {
        const errorText = await response.text();
        console.error('Failed to create ticket:', response.status, errorText);
      }
      return null;
    } catch (error) {
      console.error('Error creating ticket:', error);
      return null;
    }
  };

  const refreshTickets = async () => {
    try {
      const tickets = await apiClient.getTickets();
      setTickets(tickets);
    } catch (error) {
      console.error('Error refreshing tickets:', error);
    }
  };
  const updateTicketStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setTickets(prev => prev.map(ticket =>
          ticket.id === id ? { ...ticket, status } : ticket
        ));
      } else {
        console.error('Failed to update ticket status:', response.status);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };
  const addSale = async (items: any[], paymentMethod: string, ticketId?: string, patientName?: string) => {
    try {
      if (!currentCenter) return;

      const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
      const saleData = {
        centerId: currentCenter.id,
        items,
        paymentMethod,
        totalAmount,
        ticketId,
        patientName
      };

      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        const newSale = await response.json();
        setSales(prev => [newSale, ...prev]);

        // Mettre à jour les stocks locaux
        setMedicines(prev => prev.map(med => {
          const item = items.find(i => i.medicineId === med.id);
          if (item) {
            return { ...med, stock: med.stock - item.quantity };
          }
          return med;
        }));
      }
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };
  const createCenter = async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/centers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newCenter = await response.json();
        // Mettre à jour la liste des centres
        setAllCenters(prev => [...prev, newCenter]);
        return newCenter;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du centre');
      }
    } catch (error) {
      console.error('Error creating center:', error);
      throw error;
    }
  };

  const registerCenter = async (centerData: any, adminData: any) => { };
  const updateCenter = async (data: Partial<HealthCenter>) => {
    try {
      if (!currentCenter) return null;

      const response = await fetch(`${API_BASE_URL}/center`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedCenter = await response.json();
        setCurrentCenter(updatedCenter);
        localStorage.setItem('currentCenter', JSON.stringify(updatedCenter));
        return updatedCenter;
      }
      return null;
    } catch (error) {
      console.error('Error updating center:', error);
      return null;
    }
  };
  const addService = async (serviceData: Omit<Service, 'id' | 'centerId'>) => {
    try {
      // Vérifier que le centre est défini
      if (!currentCenter?.id) {
        throw new Error('Aucun centre sélectionné');
      }

      // Ajouter le centerId au service
      const serviceWithCenter = {
        ...serviceData,
        centerId: currentCenter.id,
        isActive: true // S'assurer que le service est actif par défaut
      };

      console.log('Envoi de la requête de création de service:', serviceWithCenter);

      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceWithCenter),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => response.text());
        console.error('Détail de l\'erreur du serveur:', errorData);
        const errorMessage = typeof errorData === 'object' && errorData.details ? errorData.details : (typeof errorData === 'string' ? errorData : 'Erreur lors de la création du service');
        throw new Error(errorMessage);
      }

      const service = await response.json();
      console.log('Service créé avec succès:', service);

      // Mettre à jour la liste des services
      setServices(prev => [...prev, service]);
      return service;

    } catch (error) {
      console.error('Erreur dans addService:', error);
      throw error; // Propager l'erreur pour qu'elle puisse être gérée par le composant
    }
  };
  const updateService = async (id: string, data: Partial<Service>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedService = await response.json();
        setServices(prev => prev.map(s => s.id === id ? updatedService : s));
        return updatedService;
      }
      return null;
    } catch (error) {
      console.error('Error updating service:', error);
      return null;
    }
  };
  const deleteService = (id: string) => { };
  const addMedicine = async (medData: any) => {
    try {
      // Ajouter le centerId au médicament
      const medicineWithCenter = {
        ...medData,
        centerId: currentCenter?.id || 'center-1'
      };

      const response = await fetch(`${API_BASE_URL}/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicineWithCenter),
      });

      if (response.ok) {
        const medicine = await response.json();
        setMedicines(prev => [...prev, medicine]);
        return medicine;
      }
      return null;
    } catch (error) {
      console.error('Error creating medicine:', error);
      return null;
    }
  };
  const updateMedicine = async (id: string, data: Partial<Medicine>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedMedicine = await response.json();
        setMedicines(prev => prev.map(m => m.id === id ? updatedMedicine : m));
        return updatedMedicine;
      }
      return null;
    } catch (error) {
      console.error('Error updating medicine:', error);
      return null;
    }
  };
  const deleteMedicine = (id: string) => { };
  const addUser = async (userData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const user = await response.json();
        setUsers(prev => [...prev, user]);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(prev => Array.isArray(prev) ? prev.filter(u => u.id !== id) : []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };
  const addPatient = async (patientData: any) => {
    try {
      // Calculer l'âge à partir de la date de naissance
      const age = patientData.birthDate ?
        differenceInYears(new Date(), new Date(patientData.birthDate)) : 0;

      // Ajouter le centerId et l'âge au patient
      const patientWithCenter = {
        ...patientData,
        age: age,
        centerId: currentCenter?.id || 'center-1'
      };

      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientWithCenter),
      });

      if (response.ok) {
        const patient = await response.json();
        setPatients(prev => [...prev, patient]);
        return patient;
      }
      return null;
    } catch (error) {
      console.error('Error creating patient:', error);
      return null;
    }
  };
  const updatePatient = (id: string, data: Partial<Patient>) => { };
  const saveConsultation = async (consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt' | 'serviceName' | 'prescriptionItems'>) => {
    try {
      const requiredFields = ['centerId', 'ticketId', 'patientId', 'status', 'patientName', 'doctorId'];
      const missingFields = requiredFields.filter(field => !consultationData[field]);
      if (missingFields.length > 0) {
        console.error('Champs obligatoires manquants:', missingFields);
        throw new Error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
      }

      // Créer une copie des données pour éviter de modifier l'objet original
      const dataToSend = {
        ...consultationData,
        date: consultationData.date || new Date().toISOString(),
        // S'assurer que prescription est bien un tableau
        prescription: Array.isArray(consultationData.prescription)
          ? consultationData.prescription
          : consultationData.prescription ? [consultationData.prescription] : [],
        // S'assurer que labOrders est bien un tableau
        labOrders: Array.isArray(consultationData.labOrders)
          ? consultationData.labOrders
          : consultationData.labOrders ? [consultationData.labOrders] : []
      };

      // Supprimer les champs qui ne devraient pas être envoyés au serveur s'ils existent
      delete (dataToSend as any).prescriptionItems;
      delete (dataToSend as any).serviceName;

      console.log('Envoi de la consultation:', JSON.stringify(dataToSend, null, 2));

      const response = await fetch(`${API_BASE_URL}/consultations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur du serveur:', response.status, errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`Échec de la sauvegarde: ${response.status} Bad Request\n${JSON.stringify(errorJson)}`);
        } catch (e) {
          throw new Error(`Échec de la sauvegarde: ${response.status} Bad Request\n${errorText}`);
        }
      }

      const consultation = await response.json();
      console.log('Consultation enregistrée avec succès:', consultation);

      setConsultations(prev => [...prev, consultation]);
      await updateTicketStatus(consultationData.ticketId, 'COMPLETED');

      return consultation;
    } catch (error) {
      console.error('Error saving consultation:', error);
      throw error;
    }
  };

  const addLabResult = async (resultData: Omit<LabResult, 'id' | 'createdAt' | 'updatedAt' | 'centerId'>) => {
    try {
      const result = await apiClient.saveLabResult({
        ...resultData,
        centerId: currentCenter?.id || 'center-1'
      });
      setLabResults(prev => [...prev, result]);
      return result;
    } catch (error) {
      console.error('Error adding lab result:', error);
      return null;
    }
  };

  const updateLabResult = async (id: string, data: Partial<LabResult>) => {
    try {
      const result = await apiClient.updateLabResult(id, data);
      setLabResults(prev => prev.map(r => r.id === id ? result : r));
      return result;
    } catch (error) {
      console.error('Error updating lab result:', error);
      return null;
    }
  };

  const deleteLabResult = async (id: string) => {
    try {
      await apiClient.deleteLabResult(id);
      setLabResults(prev => Array.isArray(prev) ? prev.filter(r => r.id !== id) : []);
      return true;
    } catch (error) {
      console.error('Error deleting lab result:', error);
      return false;
    }
  };

  const refreshLabResults = async () => {
    try {
      const results = await apiClient.getLabResults();
      setLabResults(results);
    } catch (error) {
      console.error('Error refreshing lab results:', error);
    }
  };

  const refreshInsuranceData = async () => {
    try {
      const [companies, transactions, patientInsurances] = await Promise.all([
        fetch(`${API_BASE_URL}/insurance-companies`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': currentCenter?.id || '' } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/insurance-transactions`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': currentCenter?.id || '' } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/patient-insurances`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': currentCenter?.id || '' } }).then(r => r.json()),
        apiClient.getTickets() // Map tickets to invoices as per current app usage
      ]);
      setInsuranceCompanies(Array.isArray(companies) ? companies : []);
      setInsuranceTransactions(Array.isArray(transactions) ? transactions : []);
      setPatientInsurances(Array.isArray(patientInsurances) ? patientInsurances : []);
      setInvoices(Array.isArray(tickets) ? tickets : []);
    } catch (error) {
      console.error('Error refreshing insurance data:', error);
    }
  };

  const createInsuranceCompany = async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/insurance-companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': currentCenter?.id || '' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const created = await response.json();
        setInsuranceCompanies(prev => [...prev, created]);
        return created;
      }
    } catch (error) {
      console.error('Error creating insurance company:', error);
    }
  };

  const updateInsuranceCompany = async (id: number, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/insurance-companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': currentCenter?.id || '' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updated = await response.json();
        setInsuranceCompanies(prev => prev.map(c => c.id === id ? updated : c));
        return updated;
      }
    } catch (error) {
      console.error('Error updating insurance company:', error);
    }
  };

  const deleteInsuranceCompany = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/insurance-companies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': currentCenter?.id || '' },
      });
      if (response.ok) {
        setInsuranceCompanies(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting insurance company:', error);
    }
  };

  const createPatientInsurance = async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patient-insurances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': currentCenter?.id || '' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const created = await response.json();
        setPatientInsurances(prev => [...prev, created]);
        return created;
      }
    } catch (error) {
      console.error('Error creating patient insurance:', error);
    }
  };

  const updatePatientInsurance = async (id: number, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patient-insurances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': currentCenter?.id || '' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setPatientInsurances(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
      }
    } catch (error) {
      console.error('Error updating patient insurance:', error);
    }
  };

  const deletePatientInsurance = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patient-insurances/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': currentCenter?.id || '' },
      });
      if (response.ok) {
        setPatientInsurances(prev => prev.filter(i => i.id !== id));
      }
    } catch (error) {
      console.error('Error deleting patient insurance:', error);
    }
  };

  const createInsuranceTransaction = async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/insurance-transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': currentCenter?.id || '' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const created = await response.json();
        setInsuranceTransactions(prev => [...prev, created]);
        return created;
      }
    } catch (error) {
      console.error('Error creating insurance transaction:', error);
    }
  };

  const updateInsuranceTransaction = async (id: number, updates: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/insurance-transactions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'x-tenant-id': currentCenter?.id || '' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        setInsuranceTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      }
    } catch (error) {
      console.error('Error updating insurance transaction:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshInsuranceData();
    }
  }, [currentUser, currentCenter]);

  // Role checking functions
  const hasRole = (role: string): boolean => {
    return currentUser?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return currentUser?.role ? roles.includes(currentUser.role) : false;
  };

  const refreshAppointments = async () => {
    try {
      const appts = await apiClient.getAppointments();
      setAppointments(appts);
    } catch (error) {
      console.error('Error refreshing appointments:', error);
    }
  };

  const createAppointment = async (apptData: any) => {
    try {
      const newAppt = await apiClient.createAppointment(apptData);
      if (newAppt) {
        setAppointments(prev => [newAppt, ...prev]);
        return newAppt;
      }
      return null;
    } catch (error) {
      console.error('Error creating appointment:', error);
      return null;
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      currentCenter,
      allCenters,
      users,
      patients,
      tickets,
      services,
      medicines,
      sales,
      consultations,
      labResults,
      appointments,
      insuranceCompanies,
      insuranceTransactions,
      patientInsurances,
      isLoading,
      login,
      logout,
      hasRole,
      hasAnyRole,
      createTicket,
      refreshTickets,
      updateTicketStatus,
      addSale,
      registerCenter,
      createCenter,
      updateCenter,
      toggleCenterStatus,
      addService,
      updateService,
      deleteService,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      addUser,
      updateUser,
      deleteUser,
      addPatient,
      updatePatient,
      saveConsultation,
      addLabResult,
      updateLabResult,
      deleteLabResult,
      refreshLabResults,
      createAppointment,
      refreshAppointments,
      switchCenter,
      createInsuranceCompany,
      updateInsuranceCompany,
      deleteInsuranceCompany,
      createPatientInsurance,
      updatePatientInsurance,
      deletePatientInsurance,
      createInsuranceTransaction,
      updateInsuranceTransaction,
      refreshInvoices: refreshTickets,
      refreshInsuranceData,
      loadData,
      invoices
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useStore must be used within an AppProvider");
  }
  return context;
};
