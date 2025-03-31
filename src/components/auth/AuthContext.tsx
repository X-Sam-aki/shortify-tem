import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id?: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    // TODO: Implement actual authentication
    const mockUser = { id: '1', email, name: email.split('@')[0] };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const signUp = async (email: string, password: string, name: string) => {
    // TODO: Implement actual registration
    const mockUser = { id: '1', email, name };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
