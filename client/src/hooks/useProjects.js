import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
    select: (res) => res.data.projects,
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.get(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.archive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useRegenerateKey() {
  return useMutation({ mutationFn: projectsApi.regenerateKey });
}

export function useProjectMembers(projectId) {
  return useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: () => projectsApi.listMembers(projectId),
    select: (res) => res.data.members,
    enabled: !!projectId,
  });
}

export function useInviteMember(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => projectsApi.inviteMember(projectId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] }),
  });
}

export function useUpdateMemberRole(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }) => projectsApi.updateMemberRole(projectId, memberId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] }),
  });
}

export function useRemoveMember(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId) => projectsApi.removeMember(projectId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] }),
  });
}
