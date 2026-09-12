import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

// On a hard page load there's no access token in memory, but the httpOnly
// refresh cookie may still be valid — so we attempt a silent refresh once,
// and only if that succeeds do we fetch /me. Runs once at app root.
export function useSessionBootstrap() {
  const { setUser, setAccessToken, setInitialized } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const { apiClient } = await import('../api/axiosClient');
        const refreshRes = await apiClient.post('/auth/refresh');
        if (cancelled) return;
        setAccessToken(refreshRes.data.data.accessToken);

        const meRes = await authApi.me();
        if (cancelled) return;
        setUser(meRes.data.user);
      } catch {
        // No valid session — that's fine, user just isn't logged in.
      } finally {
        if (!cancelled) setInitialized(true);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useLogin() {
  const navigate = useNavigate();
  const { loginSuccess } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      loginSuccess(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const { loginSuccess } = useAuthStore();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      loginSuccess(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
}
