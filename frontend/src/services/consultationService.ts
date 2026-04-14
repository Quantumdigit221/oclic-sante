import { Consultation, PrescriptionItem } from '../types';

const API_BASE_URL = '/api';

export const consultationService = {
  // Créer une nouvelle consultation
  async create(consultation: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await fetch(`${API_BASE_URL}/consultations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        ...consultation,
        prescription: consultation.prescription
          ? JSON.stringify(consultation.prescription)
          : null
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la création de la consultation');
    }

    return response.json();
  },

  // Récupérer une consultation par son ID
  async getById(id: string): Promise<Consultation> {
    const response = await fetch(`${API_BASE_URL}/consultations/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Consultation non trouvée');
    }

    const data = await response.json();
    return this.formatConsultation(data);
  },

  // Mettre à jour une consultation
  async update(
    id: string,
    updates: Partial<Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Consultation> {
    const response = await fetch(`${API_BASE_URL}/consultations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        ...updates,
        prescription: updates.prescription
          ? JSON.stringify(updates.prescription)
          : null
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la mise à jour de la consultation');
    }

    const data = await response.json();
    return this.formatConsultation(data);
  },

  // Supprimer une consultation
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/consultations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de la suppression de la consultation');
    }
  },

  // Récupérer les consultations par patient
  async getByPatientId(patientId: string): Promise<Consultation[]> {
    const response = await fetch(`${API_BASE_URL}/consultations/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des consultations');
    }

    const data = await response.json();
    return Array.isArray(data) ? data.map(this.formatConsultation) : [];
  },

  // Récupérer les consultations par médecin
  async getByDoctorId(doctorId: string): Promise<Consultation[]> {
    const response = await fetch(`${API_BASE_URL}/consultations/doctor/${doctorId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des consultations');
    }

    const data = await response.json();
    return Array.isArray(data) ? data.map(this.formatConsultation) : [];
  },

  // Formater une consultation (parse les champs JSON)
  formatConsultation(consultation: any): Consultation {
    return {
      ...consultation,
      prescriptionItems: consultation.prescription
        ? (typeof consultation.prescription === 'string'
          ? JSON.parse(consultation.prescription)
          : consultation.prescription)
        : [],
      // Convertir les champs numériques
      weight: consultation.weight ? parseFloat(consultation.weight) : undefined,
      height: consultation.height ? parseFloat(consultation.height) : undefined,
      temperature: consultation.temperature ? parseFloat(consultation.temperature) : undefined,
      pulse: consultation.pulse ? parseInt(consultation.pulse, 10) : undefined,
    };
  },

  // Récupérer les statistiques des consultations
  async getStats(period: 'day' | 'week' | 'month' = 'month') {
    const response = await fetch(`${API_BASE_URL}/consultations/stats?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }

    return response.json();
  },

  // Exporter les consultations au format PDF
  async exportToPdf(consultationId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/export/pdf`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de l\'export PDF');
    }

    return response.blob();
  },

  // Envoyer la consultation par email
  async sendByEmail(consultationId: string, email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erreur lors de l\'envoi par email');
    }
  },
};
