const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export async function fetchApi(endpoint, options = {}) {
  const multipart = options.body instanceof FormData;
  const headers = { Accept: 'application/json', ...(!multipart && options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  const body = options.body && typeof options.body === 'object' && !multipart ? JSON.stringify(options.body) : options.body;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers, body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || data.detail || `Request failed (${response.status})`);
  return data;
}
export const authApi = {
  login: (email,password) => fetchApi('/auth/login/',{method:'POST',body:{email,password}}),
  logout: () => fetchApi('/auth/logout/',{method:'POST'}), me: () => fetchApi('/auth/me/'),
};
export const usersApi = {
  getAll: () => fetchApi('/users/'), getById: id => fetchApi(`/users/${id}/`),
  create: data => fetchApi('/users/',{method:'POST',body:data}),
  update: (id,data) => fetchApi(`/users/${id}/`,{method:'PATCH',body:data}),
  delete: id => fetchApi(`/users/${id}/`,{method:'DELETE'}),
};
export const patientsApi = {
  getAll: () => fetchApi('/patients/'), getById: id => fetchApi(`/patients/${id}/`),
  create: data => fetchApi('/patients/',{method:'POST',body:data}),
  cbcReference: () => fetchApi('/patients/cbc-reference/'),
  extractCbc: (id,force=false) => fetchApi(`/patients/${id}/extract-cbc/`,{method:'POST',body:{force}}),
  replaceFiles: (id,data) => fetchApi(`/patients/${id}/replace-files/`,{method:'POST',body:data}),
  updateCbc: (id,cbcData,options={}) => fetchApi(`/patients/${id}/update-cbc/`,{method:'PATCH',body:{cbcData,...options}}),
  runAiDiagnosis: (id,options={}) => fetchApi(`/patients/${id}/run-ai/`,{method:'POST',body:options}),
  submitDoctorReview: (id,action,comments,reviewerName) => fetchApi(`/patients/${id}/technician-review/`,{method:'POST',body:{action,comments,reviewerName}}),
  submitTechnicianReview: (id,action,comments,reviewerName) => patientsApi.submitDoctorReview(id,action,comments,reviewerName),
};
export const diagnosticsApi=patientsApi;
export const notificationsApi={getAll:()=>fetchApi('/notifications/'),markRead:id=>fetchApi(`/notifications/${id}/read/`,{method:'PATCH'}),clearAll:()=>fetchApi('/notifications/clear/',{method:'POST'})};
export const analyticsApi={getOverview:()=>fetchApi('/analytics/overview/')};
