import { centersAPI, patientsAPI, servicesAPI, ticketsAPI, medicinesAPI } from './laravel-api';
import { HealthCenter, Patient, Service, Ticket, Medicine } from '../types';

// Adapter functions to transform Laravel API responses to frontend types
export class ApiAdapter {
  private static statusToApi(status?: string): string | undefined {
    if (!status) return status;
    const map: Record<string, string> = {
      WAITING: 'En attente',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminé',
      CANCELLED: 'Annulé'
    };
    return map[status] ?? status;
  }

  private static statusFromApi(status?: string): string {
    if (!status) return '';
    const map: Record<string, string> = {
      'En attente': 'WAITING',
      'En cours': 'IN_PROGRESS',
      'Terminé': 'COMPLETED',
      'Annulé': 'CANCELLED',
      'TerminÃ©': 'COMPLETED',
      'AnnulÃ©': 'CANCELLED'
    };
    return map[status] ?? status;
  }
  
  // Health Centers
  static async getCenters(): Promise<HealthCenter[]> {
    try {
      const response = await centersAPI.getAll();
      // Vérifier si response est un tableau ou contient une propriété centers
      const centers = Array.isArray(response) ? response : (response.centers || []);
      return centers.map(this.transformHealthCenter);
    } catch (error) {
      console.error('Failed to get centers:', error);
      return [];
    }
  }

  static async getCurrentCenter(centerId?: string): Promise<HealthCenter | null> {
    try {
      const response = await centersAPI.getCurrent(centerId);
      // Vérifier si response contient center ou si response est directement le center
      const center = response.center || response;
      return center ? this.transformHealthCenter(center) : null;
    } catch (error) {
      console.error('Failed to get current center:', error);
      return null;
    }
  }

  static async createCenter(data: Partial<HealthCenter>): Promise<HealthCenter | null> {
    try {
      const response = await centersAPI.create(this.transformHealthCenterToLaravel(data));
      return this.transformHealthCenter(response.center);
    } catch (error) {
      console.error('Failed to create center:', error);
      return null;
    }
  }

  static async updateCenter(id: string, data: Partial<HealthCenter>): Promise<HealthCenter | null> {
    try {
      const response = await centersAPI.update(id, this.transformHealthCenterToLaravel(data));
      return this.transformHealthCenter(response.center);
    } catch (error) {
      console.error('Failed to update center:', error);
      return null;
    }
  }

  // Patients
  static async getPatients(centerId?: string, search?: string): Promise<Patient[]> {
    try {
      const response = await patientsAPI.getAll(centerId, search);
      // La réponse est maintenant directement un tableau de patients
      const patientsArray = Array.isArray(response) ? response : response.patients || [];
      return patientsArray.map(this.transformPatient);
    } catch (error) {
      console.error('Failed to get patients:', error);
      return [];
    }
  }

  static async getPatient(id: string): Promise<Patient | null> {
    try {
      const response = await patientsAPI.getById(id);
      // La réponse est maintenant directement l'objet patient
      return this.transformPatient(response.patient || response);
    } catch (error) {
      console.error('Failed to get patient:', error);
      return null;
    }
  }

  static async createPatient(data: Partial<Patient>): Promise<Patient | null> {
    try {
      const transformedData = this.transformPatientToLaravel(data);
      const response = await patientsAPI.create(transformedData);
      // La réponse est maintenant directement l'objet patient
      return this.transformPatient(response.patient || response);
    } catch (error) {
      console.error('Failed to create patient:', error);
      return null;
    }
  }

  static async updatePatient(id: string, data: Partial<Patient>): Promise<Patient | null> {
    try {
      const response = await patientsAPI.update(id, this.transformPatientToLaravel(data));
      // La réponse est maintenant directement l'objet patient
      return this.transformPatient(response.patient || response);
    } catch (error) {
      console.error('Failed to update patient:', error);
      return null;
    }
  }

  // Services
  static async getServices(centerId?: string, category?: string): Promise<Service[]> {
    try {
      const response = await servicesAPI.getAll(centerId, category);
      // La réponse est maintenant directement un tableau de services
      const servicesArray = Array.isArray(response) ? response : response.services || [];
      return servicesArray.map(this.transformService);
    } catch (error) {
      console.error('Failed to get services:', error);
      return [];
    }
  }

  static async createService(data: Partial<Service>): Promise<Service | null> {
    try {
      const response = await servicesAPI.create(this.transformServiceToLaravel(data));
      // La réponse est maintenant directement l'objet service
      return this.transformService(response.service || response);
    } catch (error) {
      console.error('Failed to create service:', error);
      return null;
    }
  }

  // Tickets
  static async getTickets(centerId?: string, status?: string, date?: string): Promise<Ticket[]> {
    try {
      const response = await ticketsAPI.getAll(centerId, status, date);
      // La réponse est maintenant directement un tableau de tickets
      const ticketsArray = Array.isArray(response) ? response : response.tickets || [];
      return ticketsArray.map(this.transformTicket);
    } catch (error) {
      console.error('Failed to get tickets:', error);
      return [];
    }
  }

  static async createTicket(data: Partial<Ticket>): Promise<Ticket | null> {
    try {
      console.log('🔍 ApiAdapter.createTicket reçu:', JSON.stringify(data, null, 2));
      const transformedData = this.transformTicketToLaravel(data);
      console.log('🔄 ApiAdapter.transformTicketToLaravel:', JSON.stringify(transformedData, null, 2));
      
      const response = await ticketsAPI.create(transformedData);
      // La réponse est maintenant directement l'objet ticket
      return this.transformTicket(response.ticket || response);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      return null;
    }
  }

  static async updateTicketStatus(id: string, status: string): Promise<Ticket | null> {
    try {
      const response = await ticketsAPI.updateStatus(id, this.statusToApi(status) ?? status);
      // La réponse est maintenant directement l'objet ticket
      return this.transformTicket(response.ticket || response);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      return null;
    }
  }

  // Medicines
  static async getMedicines(centerId?: string, lowStock?: boolean, expiringSoon?: boolean): Promise<Medicine[]> {
    try {
      const response = await medicinesAPI.getAll(centerId, lowStock, expiringSoon);
      // La réponse est maintenant directement un tableau de medicines
      const medicinesArray = Array.isArray(response) ? response : response.medicines || [];
      return medicinesArray.map(this.transformMedicine);
    } catch (error) {
      console.error('Failed to get medicines:', error);
      return [];
    }
  }

  static async createMedicine(data: Partial<Medicine>): Promise<Medicine | null> {
    try {
      const response = await medicinesAPI.create(this.transformMedicineToLaravel(data));
      // La réponse est maintenant directement l'objet medicine
      return this.transformMedicine(response.medicine || response);
    } catch (error) {
      console.error('Failed to create medicine:', error);
      return null;
    }
  }

  // Transform functions
  private static transformHealthCenter(laravelCenter: any): HealthCenter {
    return {
      id: laravelCenter.id.toString(),
      name: laravelCenter.name,
      address: laravelCenter.address,
      phone: laravelCenter.phone,
      email: laravelCenter.email,
      directorName: laravelCenter.director_name ?? laravelCenter.directorName ?? '',
      rnis: laravelCenter.rnis ?? '',
      logoUrl: laravelCenter.logo_url ?? laravelCenter.logoUrl,
      capacity: laravelCenter.capacity,
      pispiAlias: laravelCenter.pispi_alias ?? laravelCenter.pispiAlias ?? '',
      isActive: laravelCenter.is_active ?? laravelCenter.isActive ?? (laravelCenter.status === 'active')
    };
  }

  private static transformHealthCenterToLaravel(center: Partial<HealthCenter>): any {
    return {
      name: center.name,
      address: center.address,
      phone: center.phone,
      email: center.email,
      directorName: center.directorName,
      rnis: center.rnis,
      logoUrl: center.logoUrl,
      capacity: center.capacity,
      pispiAlias: center.pispiAlias,
      isActive: center.isActive
    };
  }

  private static transformPatient(laravelPatient: any): Patient {
    return {
      id: laravelPatient.id?.toString() || '',
      centerId: laravelPatient.center_id?.toString() || laravelPatient.centerId?.toString() || '',
      code: laravelPatient.code || '',
      firstName: laravelPatient.first_name || laravelPatient.firstName || '',
      lastName: laravelPatient.last_name || laravelPatient.lastName || '',
      birthDate: laravelPatient.birth_date || laravelPatient.birthDate || '',
      age: laravelPatient.age || 0,
      gender: laravelPatient.gender || 'M',
      phone: laravelPatient.phone || '',
      address: laravelPatient.address || '',
      email: laravelPatient.email || '',
      bloodGroup: laravelPatient.blood_group || laravelPatient.bloodGroup || '',
      allergies: laravelPatient.allergies || '',
      emergencyContact: laravelPatient.emergency_contact || laravelPatient.emergencyContact || '',
      emergencyPhone: laravelPatient.emergency_phone || laravelPatient.emergencyPhone || '',
      notes: laravelPatient.notes || '',
      createdAt: laravelPatient.created_at || laravelPatient.createdAt || new Date().toISOString()
    };
  }

  private static transformPatientToLaravel(patient: Partial<Patient> | any): any {
    // Si les données sont déjà en snake_case, les retourner directement
    if (patient.center_id || patient.first_name) {
      return {
        center_id: patient.center_id || '1',
        name: patient.first_name && patient.last_name ? `${patient.first_name} ${patient.last_name}` : patient.first_name || patient.name,
        dateOfBirth: patient.birth_date,
        phone: patient.phone,
        address: patient.address,
        email: patient.email,
        blood_group: patient.blood_group,
        allergies: patient.allergies,
        emergency_contact: patient.emergency_contact,
        emergency_phone: patient.emergency_phone,
        notes: patient.notes
      };
    }
    
    // Sinon, transformer de camelCase vers snake_case
    return {
      center_id: patient.centerId,
      name: patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : patient.firstName || patient.name,
      dateOfBirth: patient.birthDate,
      phone: patient.phone,
      address: patient.address,
      email: patient.email,
      blood_group: patient.bloodGroup,
      allergies: patient.allergies,
      emergency_contact: patient.emergencyContact,
      emergency_phone: patient.emergencyPhone,
      notes: patient.notes
    };
  }

  private static transformService(laravelService: any): Service {
    return {
      id: laravelService.id.toString(),
      centerId: laravelService.center_id ?? laravelService.centerId,
      name: laravelService.name,
      category: laravelService.category,
      price: laravelService.price,
      emergencyPrice: laravelService.emergency_price ?? laravelService.emergencyPrice,
      description: laravelService.description,
      durationMinutes: laravelService.duration_minutes ?? laravelService.durationMinutes,
      isActive: laravelService.is_active ?? laravelService.isActive
    };
  }

  private static transformServiceToLaravel(service: Partial<Service> | any): any {
    // Si les données sont déjà en snake_case, les retourner directement
    if (service.center_id || service.emergency_price) {
      return {
        center_id: service.center_id || '1',
        name: service.name,
        category: service.category,
        price: service.price,
        emergency_price: service.emergency_price,
        description: service.description,
        duration_minutes: service.duration_minutes,
        is_active: service.is_active
      };
    }
    
    // Sinon, transformer de camelCase vers snake_case
    return {
      center_id: service.centerId,
      name: service.name,
      category: service.category,
      price: service.price,
      emergency_price: service.emergencyPrice,
      description: service.description,
      duration_minutes: service.durationMinutes,
      is_active: service.isActive
    };
  }

  private static transformTicket(laravelTicket: any): Ticket {
    return {
      id: laravelTicket.id?.toString() || '',
      centerId: laravelTicket.center_id?.toString() || laravelTicket.centerId?.toString() || '',
      ticketNumber: laravelTicket.ticket_number || laravelTicket.ticketNumber || '',
      patientId: laravelTicket.patient_id?.toString() || laravelTicket.patientId?.toString() || '',
      patientName: laravelTicket.patient_name || laravelTicket.patientName || '',
      patientAge: laravelTicket.patient_age || laravelTicket.patientAge || 0,
      patientGender: laravelTicket.patient_gender || laravelTicket.patientGender || 'M',
      patientPhone: laravelTicket.patient_phone || laravelTicket.patientPhone || '',
      patientAddress: laravelTicket.patient_address || laravelTicket.patientAddress || '',
      serviceId: laravelTicket.service_id?.toString() || laravelTicket.serviceId?.toString() || '',
      serviceName: laravelTicket.service_name || laravelTicket.serviceName || '',
      doctorId: laravelTicket.doctor_id?.toString() || laravelTicket.doctorId?.toString() || '',
      amount: laravelTicket.amount || 0,
      paymentMethod: laravelTicket.payment_method || laravelTicket.paymentMethod || 'CASH',
      status: ApiAdapter.statusFromApi(laravelTicket.status || 'En attente'),
      createdAt: laravelTicket.created_at || laravelTicket.createdAt || new Date().toISOString(),
      notes: laravelTicket.notes || ''
    };
  }

  private static transformTicketToLaravel(ticket: Partial<Ticket> | any): any {
    // Si les données sont déjà en snake_case, les retourner directement
    if (ticket.center_id || ticket.patient_name || ticket.service_id) {
      return {
        center_id: ticket.center_id || '1',
        patient_name: ticket.patient_name,
        patient_age: ticket.patient_age,
        patient_gender: ticket.patient_gender,
        patient_phone: ticket.patient_phone,
        patient_address: ticket.patient_address,
        service_id: ticket.service_id,
        payment_method: ticket.payment_method,
        doctor_id: ticket.doctor_id,
        notes: ticket.notes,
        status: ticket.status
      };
    }

    // Sinon, transformer de camelCase vers snake_case
    return {
      center_id: ticket.centerId,
      patient_name: ticket.patientName,
      patient_age: ticket.patientAge,
      patient_gender: ticket.patientGender,
      patient_phone: ticket.patientPhone,
      patient_address: ticket.patientAddress,
      service_id: ticket.serviceId,
      payment_method: ticket.paymentMethod,
      doctor_id: ticket.doctorId,
      notes: ticket.notes,
      status: ApiAdapter.statusToApi(ticket.status)
    };
  }

  private static transformMedicine(laravelMedicine: any): Medicine {
    return {
      id: laravelMedicine.id.toString(),
      centerId: laravelMedicine.center_id ?? laravelMedicine.centerId,
      name: laravelMedicine.name,
      dci: laravelMedicine.dci,
      stock: laravelMedicine.stock,
      minStock: laravelMedicine.min_stock ?? laravelMedicine.minStock,
      price: laravelMedicine.price,
      expiryDate: laravelMedicine.expiry_date ?? laravelMedicine.expiryDate,
      category: laravelMedicine.category,
      batchNumber: laravelMedicine.batch_number ?? laravelMedicine.batchNumber,
      form: laravelMedicine.form
    };
  }

  private static transformMedicineToLaravel(medicine: Partial<Medicine>): any {
    return {
      center_id: medicine.centerId,
      name: medicine.name,
      dci: medicine.dci,
      stock: medicine.stock,
      min_stock: medicine.minStock,
      price: medicine.price,
      expiry_date: medicine.expiryDate,
      category: medicine.category,
      batch_number: medicine.batchNumber,
      form: medicine.form
    };
  }
}
