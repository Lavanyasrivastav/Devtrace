import { apiClient } from './axiosClient';

export const monitorsApi = {
  list: (projectId) => apiClient.get('/monitors', { params: { projectId } }).then((r) => r.data),
  create: (payload) => apiClient.post('/monitors', payload).then((r) => r.data),
  get: (id) => apiClient.get(`/monitors/${id}`).then((r) => r.data),
  update: (id, payload) => apiClient.patch(`/monitors/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/monitors/${id}`).then((r) => r.data),
  results: (id, limit) => apiClient.get(`/monitors/${id}/results`, { params: { limit } }).then((r) => r.data),
};
