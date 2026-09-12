import { apiClient } from './axiosClient';

export const analyticsApi = {
  overview: (params) => apiClient.get('/analytics/overview', { params }).then((r) => r.data),
  frequency: (params) => apiClient.get('/analytics/frequency', { params }).then((r) => r.data),
  bySeverity: (params) => apiClient.get('/analytics/by-severity', { params }).then((r) => r.data),
  byProject: () => apiClient.get('/analytics/by-project').then((r) => r.data),
  topErrors: (params) => apiClient.get('/analytics/top-errors', { params }).then((r) => r.data),
};
