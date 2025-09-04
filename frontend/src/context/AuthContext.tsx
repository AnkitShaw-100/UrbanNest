import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiClient from '../services/api.ts';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified?: boolean;
}

interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  role?: 'buyer' | 'seller' | 'admin' | string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (userData: UserRegistrationData) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await apiClient.getCurrentUser();
        if (response) {
          setUser(response);
          console.log("data set")
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });
    if (response.success && response.data) {
      setUser(response.data.user);
      return response.data.user;
    } else {
      throw new Error(response.error || 'Login failed');
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const register = async (userData: UserRegistrationData) => {
    const response = await apiClient.register(userData);
    if (response.success) {
      // Registration successful, but user needs to login
      // Don't set user here, redirect to login
    } else {
      throw new Error(response.error || 'Registration failed');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 