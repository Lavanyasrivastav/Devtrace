import { apiClient } from './axiosClient';

export const errorsApi = {
  list: (params) => apiClient.get('/errors', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/errors/${id}`).then((r) => r.data),
  update: (id, payload) => apiClient.patch(`/errors/${id}`, payload).then((r) => r.data),
  occurrences: (id, params) => apiClient.get(`/errors/${id}/occurrences`, { params }).then((r) => r.data),
};
