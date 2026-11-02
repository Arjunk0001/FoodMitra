import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  quickLogin: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Quick test credentials for seamless testing of each role
export const DEMO_USERS = {
  super_admin: {
    email: 'admin@foodmitra.org',
    password: 'Admin@FoodMitra123',
    label: 'Super Admin',
    desc: 'Platform trust, safety moderation & audit controls',
    name: 'Super Admin FoodMitra'
  },
  donor: {
    email: 'grandpalace@donors.foodmitra.org',
    password: 'Donor@123',
    label: 'Donor (Grand Royal Banquet)',
    desc: 'Luxury banquet venue listing surplus buffet food',
    name: 'The Grand Royal Banquet & Hotel'
  },
  ngo: {
    email: 'contact@annaseva.org',
    password: 'Ngo@123',
    label: 'NGO (AnnaSeva Foundation)',
    desc: 'Community charity claiming food & feeding shelters',
    name: 'AnnaSeva Welfare Foundation'
  },
  volunteer: {
    email: 'rahul.sharma@volunteers.org',
    password: 'Volunteer@123',
    label: 'Volunteer (Rahul Sharma)',
    desc: 'Electric vehicle field volunteer handling pickups',
    name: 'Rahul Sharma'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('foodmitra_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('foodmitra_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (e) {
          console.error('Session expired or invalid:', e);
          localStorage.removeItem('foodmitra_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('foodmitra_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(userData);
      localStorage.setItem('foodmitra_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('foodmitra_token');
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (role: UserRole) => {
    const creds = DEMO_USERS[role];
    if (creds) {
      await login(creds.email, creds.password);
    }
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
