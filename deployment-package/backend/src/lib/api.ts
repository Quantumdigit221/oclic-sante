// Simple API client for our backend
const getApiBaseUrl = () => {
  // En mode monolithique (le serveur NodeJS gère à la fois le frontend et l'API)
  if (typeof window !== 'undefined' && window.location.hostname.includes('sante.quantum221.com')) {
    return 'https://sante.quantum221.com/sante-saas/api';
  }
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
    const response = await fetch(`${API_BASE_URL}/centers`);
    return response.json();
  },

  getCenter: async () => {
    const response = await fetch(`${API_BASE_URL}/center`);
    return response.json();
  },

  // Get services
  getServices: async () => {
    const centerId = getCurrentCenterId();
    const url = `${API_BASE_URL}/services?centerId=${centerId}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur lors de la récupération des services:', errorText);
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur dans getServices:', error);
      throw error;
    }
  },

  // Get medicines
  getMedicines: async () => {
    const centerId = getCurrentCenterId();
    const response = await fetch(`${API_BASE_URL}/medicines?centerId=${centerId}`);
    return response.json();
  },

  // Get patients
  getPatients: async () => {
    const centerId = getCurrentCenterId();
    try {
      const response = await fetch(`${API_BASE_URL}/patients?centerId=${centerId}`);
      if (!response.ok) {
        console.error('Failed to fetch patients:', response.status);
        return []; // Return empty array if endpoint fails
      }
      const data = await response.json();
      return Array.isArray(data) ? data : []; // Ensure array format
    } catch (error) {
      console.warn('Failed to fetch patients:', error);
      return []; // Return empty array on error
    }
  },

  // Get tickets
  getTickets: async () => {
    const centerId = getCurrentCenterId();
    try {
      const response = await fetch(`${API_BASE_URL}/tickets?centerId=${centerId}`);
      if (!response.ok) {
        console.error('Failed to fetch tickets:', response.status);
        return []; // Return empty array if endpoint fails
      }
      const data = await response.json();
      return Array.isArray(data) ? data : []; // Ensure array format
    } catch (error) {
      console.warn('Failed to fetch tickets:', error);
      return []; // Return empty array on error
    }
  },

  // Get users
  getUsers: async () => {
    const centerId = getCurrentCenterId();
    const response = await fetch(`${API_BASE_URL}/users?centerId=${centerId}`);
    return response.json();
  },

  // Get consultations
  getConsultations: async () => {
    try {
      const centerId = getCurrentCenterId();
      const response = await fetch(`${API_BASE_URL}/consultations?centerId=${centerId}`);
      if (!response.ok) {
        return []; // Return empty array if endpoint fails
      }
      const data = await response.json();
      return Array.isArray(data) ? data : []; // Ensure array format
    } catch (error) {
      console.warn('Failed to fetch consultations:', error);
      return []; // Return empty array on error
    }
  },
};
