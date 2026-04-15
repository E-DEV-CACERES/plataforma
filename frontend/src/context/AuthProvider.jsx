import { useState, useCallback } from 'react';
import { AuthContext } from './authContext';
import { authService } from '../services/api';

function readStoredUser() {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  if (!token || !userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [error, setError] = useState(null);

  const register = async (name, email, password) => {
    try {
      setError(null);
      await authService.register({ name, email, password });
      return await login(email, password);
    } catch (err) {
      const data = err.response?.data;
      const validationMsg = Array.isArray(data?.errors) ? data.errors[0]?.msg : null;
      const errorMsg = data?.message || validationMsg || 'Error en el registro';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (err) {
      const data = err.response?.data;
      const validationMsg = Array.isArray(data?.errors) ? data.errors[0]?.msg : null;
      const errorMsg = data?.message || validationMsg || 'Error en el login';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, loading: false, error, register, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
