import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';

export function useOverview(projectId) {
  return useQuery({
    queryKey: ['analytics', 'overview', projectId],
    queryFn: () => analyticsApi.overview(projectId ? { projectId } : {}),
    select: (res) => res.data,
  });
}

export function useFrequency(projectId, range = '7d') {
  return useQuery({
    queryKey: ['analytics', 'frequency', projectId, range],
    queryFn: () => analyticsApi.frequency({ ...(projectId ? { projectId } : {}), range }),
    select: (res) => res.data,
  });
}

export function useBySeverity(projectId) {
  return useQuery({
    queryKey: ['analytics', 'by-severity', projectId],
    queryFn: () => analyticsApi.bySeverity(projectId ? { projectId } : {}),
    select: (res) => res.data.bySeverity,
  });
}

export function useByProject() {
  return useQuery({
    queryKey: ['analytics', 'by-project'],
    queryFn: analyticsApi.byProject,
    select: (res) => res.data.byProject,
  });
}

export function useTopErrors(projectId, limit = 5) {
  return useQuery({
    queryKey: ['analytics', 'top-errors', projectId, limit],
    queryFn: () => analyticsApi.topErrors({ ...(projectId ? { projectId } : {}), limit }),
    select: (res) => res.data.topErrors,
  });
}
