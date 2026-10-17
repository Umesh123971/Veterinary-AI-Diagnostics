const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.warn(`[VetAI API] Call to ${endpoint} failed, fallback to local state:`, err.message);
    throw err;
  }
}

// Authentication API
export const authApi = {
  login: (email, password) => fetchApi('/auth/login/', { method: 'POST', body: { email, password } }),
  logout: () => fetchApi('/auth/logout/', { method: 'POST' }),
  me: () => fetchApi('/auth/me/'),
};

// Users API
export const usersApi = {
  getAll: () => fetchApi('/users/'),
  getById: (id) => fetchApi(`/users/${id}/`),
  create: (userData) => fetchApi('/users/', { method: 'POST', body: userData }),
  update: (id, userData) => fetchApi(`/users/${id}/`, { method: 'PATCH', body: userData }),
  delete: (id) => fetchApi(`/users/${id}/`, { method: 'DELETE' }),
};

// Diagnostics & Patients API
export const patientsApi = {
  getAll: () => fetchApi('/patients/'),
  getById: (id) => fetchApi(`/patients/${id}/`),
  create: (patientData) => fetchApi('/patients/', { method: 'POST', body: patientData }),
  runAiDiagnosis: (id, imageInput = null) => {
    if (imageInput) {
      if (imageInput instanceof File || imageInput instanceof Blob) {
        const formData = new FormData();
        formData.append('image', imageInput);
        return fetch(`${API_BASE_URL}/patients/${id}/run-ai/`, {
          method: 'POST',
          body: formData,
        }).then(r => r.json());
      } else {
        return fetchApi(`/patients/${id}/run-ai/`, {
          method: 'POST',
          body: { image: imageInput }
        });
      }
    }
    return fetchApi(`/patients/${id}/run-ai/`, { method: 'POST' });
  },
  analyzeBloodSmear: async (imageInput) => {
    let res;
    if (imageInput instanceof File || imageInput instanceof Blob) {
      const formData = new FormData();
      formData.append('image', imageInput);
      res = await fetch(`${API_BASE_URL}/patients/analyze-image/`, {
        method: 'POST',
        body: formData,
      });
    } else {
      res = await fetch(`${API_BASE_URL}/patients/analyze-image/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageInput }),
      });
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || data.status || `Analysis failed: ${res.status}`);
    }
    return data;
  },
  submitDoctorReview: (id, action, comments, doctorName) => 
    fetchApi(`/patients/${id}/doctor-review/`, { method: 'POST', body: { action, comments, doctorName } }),
  updateCbc: (id, cbcData) => fetchApi(`/patients/${id}/update-cbc/`, { method: 'PATCH', body: { cbcData } }),
};

export const diagnosticsApi = patientsApi;

// Notifications API
export const notificationsApi = {
  getAll: () => fetchApi('/notifications/'),
  markRead: (id) => fetchApi(`/notifications/${id}/read/`, { method: 'PATCH' }),
  clearAll: () => fetchApi('/notifications/clear/', { method: 'POST' }),
};

// Analytics API
export const analyticsApi = {
  getOverview: () => fetchApi('/analytics/overview/'),
};
