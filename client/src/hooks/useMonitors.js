import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitorsApi } from '../api/monitors';

export function useMonitors(projectId) {
  return useQuery({
    queryKey: ['monitors', projectId],
    queryFn: () => monitorsApi.list(projectId),
    select: (res) => res.data.monitors,
  });
}

export function useMonitorResults(id, limit = 50) {
  return useQuery({
    queryKey: ['monitors', id, 'results', limit],
    queryFn: () => monitorsApi.results(id, limit),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCreateMonitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: monitorsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitors'] }),
  });
}

export function useDeleteMonitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: monitorsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitors'] }),
  });
}

export function useUpdateMonitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => monitorsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitors'] }),
  });
}
