import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { errorsApi } from '../api/errors';

export function useErrorsList(filters) {
  return useQuery({
    queryKey: ['errors', filters],
    queryFn: () => errorsApi.list(filters),
    select: (res) => res.data,
    keepPreviousData: true,
  });
}

export function useErrorDetail(id) {
  return useQuery({
    queryKey: ['errors', id],
    queryFn: () => errorsApi.get(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useErrorOccurrences(id, page = 1) {
  return useQuery({
    queryKey: ['errors', id, 'occurrences', page],
    queryFn: () => errorsApi.occurrences(id, { page, limit: 20 }),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useUpdateError(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => errorsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errors'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
