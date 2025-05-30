import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = authService.getStoredToken();
      const userData = authService.getStoredUser();
      
      if (token && userData) {
        setUser(userData);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    
    if (result.success) {
      setUser(result.user);
    }
    
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};