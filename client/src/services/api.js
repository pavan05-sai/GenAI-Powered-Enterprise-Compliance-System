import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Auth
  login: (email, password) => axios.post(`${API_BASE}/auth/login`, { email, password }),
  register: (data) => axios.post(`${API_BASE}/auth/register`, data),
  getMe: () => axios.get(`${API_BASE}/auth/me`),

  // Documents
  getDocuments: (params) => axios.get(`${API_BASE}/documents`, { params }),
  uploadDocument: (formData) => axios.post(`${API_BASE}/documents/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocumentById: (id) => axios.get(`${API_BASE}/documents/${id}`),
  deleteDocument: (id) => axios.delete(`${API_BASE}/documents/${id}`),
  getDocumentVersions: (id) => axios.get(`${API_BASE}/documents/${id}/versions`),

  // Graph
  getGraph: () => axios.get(`${API_BASE}/graph`),
  getEntity: (name) => axios.get(`${API_BASE}/graph/entity/${encodeURIComponent(name)}`),
  getGraphStats: () => axios.get(`${API_BASE}/graph/stats`),

  // AI Analyst
  queryAI: (question) => axios.post(`${API_BASE}/ai/query`, { question }),
  getQueryHistory: () => axios.get(`${API_BASE}/ai/history`),
  getDashboardStats: () => axios.get(`${API_BASE}/ai/dashboard-stats`),
  getAIProviderStatus: () => axios.get(`${API_BASE}/ai/provider-status`),

  // Compliance
  getComplianceOverview: () => axios.get(`${API_BASE}/compliance/overview`),
  getComplianceRisks: () => axios.get(`${API_BASE}/compliance/risks`),
  getContradictions: () => axios.get(`${API_BASE}/compliance/contradictions`),
  getScoreBreakdown: () => axios.get(`${API_BASE}/compliance/score-breakdown`),
  analyzeImpact: (entityName) => axios.post(`${API_BASE}/compliance/analyze-impact`, { entityName }),

  // Alerts
  getAlerts: () => axios.get(`${API_BASE}/alerts`),
  markAlertRead: (id) => axios.patch(`${API_BASE}/alerts/${id}/read`),

  // Reports
  generateComplianceReport: () => axios.post(`${API_BASE}/reports/compliance`),
  getReports: () => axios.get(`${API_BASE}/reports`),

  // Audit
  getAuditTrail: (params) => axios.get(`${API_BASE}/audit`, { params })
};

