import { apiClient } from './axiosClient';

export const projectsApi = {
  list: () => apiClient.get('/projects').then((r) => r.data),
  create: (payload) => apiClient.post('/projects', payload).then((r) => r.data),
  get: (id) => apiClient.get(`/projects/${id}`).then((r) => r.data),
  update: (id, payload) => apiClient.patch(`/projects/${id}`, payload).then((r) => r.data),
  archive: (id) => apiClient.patch(`/projects/${id}/archive`).then((r) => r.data),
  remove: (id) => apiClient.delete(`/projects/${id}`).then((r) => r.data),
  regenerateKey: (id) => apiClient.post(`/projects/${id}/regenerate-key`).then((r) => r.data),
  listMembers: (id) => apiClient.get(`/projects/${id}/members`).then((r) => r.data),
  inviteMember: (id, payload) => apiClient.post(`/projects/${id}/members`, payload).then((r) => r.data),
  updateMemberRole: (id, memberId, role) =>
    apiClient.patch(`/projects/${id}/members/${memberId}`, { role }).then((r) => r.data),
  removeMember: (id, memberId) => apiClient.delete(`/projects/${id}/members/${memberId}`).then((r) => r.data),
};
