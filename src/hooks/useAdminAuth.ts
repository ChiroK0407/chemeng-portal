import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/axios';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.get('/admin/check');
      setIsAdmin(true);
    } catch {
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (password: string) => {
    setLoginError(null);
    try {
      await api.post('/admin/login', { password });
      setIsAdmin(true);
      return true;
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Something went wrong. Try again.');
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/admin/logout');
    } finally {
      setIsAdmin(false);
    }
  }, []);

  return { isAdmin, isLoading, loginError, login, logout };
}
