import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.sqlite');

console.log('Running migrations...');

if (!fs.existsSync(DB_PATH)) {
  console.log('Creating initial database...');
  
  const initialData = {
    users: [
      { id: 'u1', centerId: 'center-1', name: 'Dr. Aminata Diop', email: 'admin@medina.sn', role: 'ADMIN', phone: '770000000' },
      { id: 'u2', centerId: 'center-1', name: 'Dr. Moussa Fall', email: 'doc@medina.sn', role: 'DOCTOR', specialty: 'Generaliste', phone: '771111111' },
      { id: 'u3', centerId: 'center-1', name: 'Fatou Ndiaye', email: 'accueil@medina.sn', role: 'RECEPTIONIST', phone: '772222222' },
      { id: 'u4', centerId: 'center-1', name: 'Jean Mendy', email: 'pharma@medina.sn', role: 'PHARMACIST', phone: '773333333' }
    ],
    centers: [
      { 
        id: 'center-1', 
        name: 'Poste de Sante Medina', 
        address: 'Rue 15 x 16, Medina, Dakar', 
        phone: '+221 33 822 00 00', 
        email: 'contact@medina.sn', 
        directorName: 'Dr. Aminata Diop', 
        rnis: 'DK-2024-001', 
        capacity: 20, 
        pispiAlias: 'POSTE_MEDINA_01', 
        isActive: true 
      }
    ],
    services: [],
    medicines: [],
    patients: [],
    tickets: [],
    migrations: ['001_create_initial_data']
  };
  
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  console.log('Database created successfully!');
} else {
  console.log('Database already exists.');
}