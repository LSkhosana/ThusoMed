import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PracticeAccount } from '../types';
import { storage } from '../utils/storage';
import { seedDemoData } from '../utils/seedData';

interface AuthContextType {
  account: PracticeAccount | null;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  signup: (account: Omit<PracticeAccount, 'id' | 'createdAt'>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<PracticeAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Seed demo data on first load
    seedDemoData();

    // Check for existing account
    const savedAccount = storage.getAccount();
    setAccount(savedAccount);
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    // Demo mode: accept any credentials
    // In real app, this would validate against stored account
    const savedAccount = storage.getAccount();
    if (savedAccount && savedAccount.email === email) {
      setAccount(savedAccount);
      return true;
    }
    // For demo, allow any login
    if (savedAccount) {
      setAccount(savedAccount);
      return true;
    }
    return false;
  };

  const signup = (accountData: Omit<PracticeAccount, 'id' | 'createdAt'>) => {
    const newAccount: PracticeAccount = {
      ...accountData,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
    };
    storage.setAccount(newAccount);
    setAccount(newAccount);
  };

  const logout = () => {
    storage.clearAccount();
    setAccount(null);
    // Re-seed for demo
    seedDemoData();
  };

  return (
    <AuthContext.Provider value={{ account, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
