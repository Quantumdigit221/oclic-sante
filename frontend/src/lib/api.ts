// Simple API client for our backend
const getApiBaseUrl = () => {
  const env = import.meta.env as any;
  // Priorité 1 : Variable d'environnement Vite (ex: définie au moment du build)
  if (env.VITE_API_URL) {
    return env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Production sur quantum221.com
    if (hostname.includes('sante.quantum221.com')) {
      return 'https://sante.quantum221.com/api';
    }
    // Production sur Hostinger (samacaisse.cloud) → backend sur le même domaine
    if (hostname.includes('samacaisse.cloud') || hostname.includes('samacaisse')) {
      return 'https://santesaas.samacaisse.cloud/api';
    }
  }
  // Développement local (via proxy Vite)
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Get current center ID from localStorage or use default
const getCurrentCenterId = () => {
  try {
    const centerData = localStorage.getItem('currentCenter');
    if (centerData) {
      const center = JSON.parse(centerData);
      return center.id || 'center-1';
    }
  } catch (e) {
    console.warn('Failed to get current center from localStorage');
  }
  return 'center-1';
};

const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (e) {
    console.warn('Failed to get current user from localStorage');
  }
  return null;
};

const getHeaders = (extraHeaders = {}) => {
  const user = getCurrentUser();
  const centerId = getCurrentCenterId();
  const token = localStorage.getItem('token');

  const headers: any = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (centerId) headers['x-tenant-id'] = centerId;
  if (centerId) headers['X-Center-Id'] = centerId;
  if (user?.role) headers['X-User-Role'] = user.role;

  return headers;
};

export const apiClient = {
  // Login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  // Get center data
  getCenters: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/centers`, { headers: getHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  },

  getCenter: async () => {
    const response = await fetch(`${API_BASE_URL}/center`, { headers: getHeaders() });
    return response.json();
  },

  // Get services
  getServices: async () => {
    const centerId = getCurrentCenterId();
    const url = `${API_BASE_URL}/services?centerId=${centerId}`;

    try {
      const response = await fetch(url, { headers: getHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erreur dans getServices:', error);
      return [];
    }
  },

  // Get medicines
  getMedicines: async () => {
    try {
      const centerId = getCurrentCenterId();
      const response = await fetch(`${API_BASE_URL}/medicines?centerId=${centerId}`, { headers: getHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  },

  // Get patients
  getPatients: async () => {
    const centerId = getCurrentCenterId();
    try {
      const response = await fetch(`${API_BASE_URL}/patients?centerId=${centerId}`, { headers: getHeaders() });
      if (!response.ok) {
        console.error('Failed to fetch patients:', response.status);
        return [];
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Failed to fetch patients:', error);
      return [];
    }
  },

  // Get tickets
  getTickets: async () => {
    const centerId = getCurrentCenterId();
    try {
      const response = await fetch(`${API_BASE_URL}/tickets?centerId=${centerId}`, { headers: getHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  },

  // Get users
  getUsers: async (centerId?: string) => {
    try {
      const cid = centerId !== undefined ? centerId : getCurrentCenterId();
      const url = cid ? `${API_BASE_URL}/users?centerId=${cid}` : `${API_BASE_URL}/users`;
      const response = await fetch(url, { headers: getHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  },

  // Get consultations
  getConsultations: async () => {
    try {
      const centerId = getCurrentCenterId();
      const response = await fetch(`${API_BASE_URL}/consultations?centerId=${centerId}`, { headers: getHeaders() });
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((consultation: any) => {
        let prescription = consultation.prescription;
        let labOrders = consultation.labOrders;

        if (typeof prescription === 'string' && (prescription.startsWith('[') || prescription.startsWith('{'))) {
          try {
            prescription = JSON.parse(prescription);
          } catch (e) {
            console.warn('Failed to parse prescription:', e);
          }
        }

        if (typeof labOrders === 'string' && labOrders.startsWith('[')) {
          try {
            labOrders = JSON.parse(labOrders);
          } catch (e) {
            console.warn('Failed to parse labOrders:', e);
          }
        }

        return { ...consultation, prescription, labOrders };
      });
    } catch (error) {
      console.warn('Failed to fetch consultations:', error);
      return [];
    }
  },

  // Lab Results
  getLabResults: async (patientId?: string) => {
    try {
      const centerId = getCurrentCenterId();
      let url = `${API_BASE_URL}/lab-results?centerId=${centerId}`;
      if (patientId) url += `&patientId=${patientId}`;

      const response = await fetch(url, { headers: getHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  },

  saveLabResult: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/lab-results`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erreur API (${response.status}): ${text.substring(0, 100)}`);
    }
    return response.json();
  },

  updateLabResult: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/lab-results/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteLabResult: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/lab-results/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  },

  // Get sales
  getSales: async () => {
    try {
      const centerId = getCurrentCenterId();
      const response = await fetch(`${API_BASE_URL}/sales?centerId=${centerId}`, { headers: getHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  },

  // Get appointments
  getAppointments: async () => {
    try {
      const centerId = getCurrentCenterId();
      const response = await fetch(`${API_BASE_URL}/appointments?centerId=${centerId}`, { headers: getHeaders() });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  },

  // Create appointment
  createAppointment: async (data: any) => {
    try {
      console.log('[API] Creating appointment, URL:', `${API_BASE_URL}/appointments`, 'data:', data);
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const text = await response.text();
        const errMsg = `Erreur API rendez-vous (${response.status}): ${text.substring(0, 150)}`;
        console.error('[API] createAppointment failed:', errMsg);
        alert(errMsg);
        throw new Error(errMsg);
      }
      return response.json();
    } catch (e: any) {
      console.error('[API] createAppointment exception:', e.message);
      throw e;
    }
  },
};
