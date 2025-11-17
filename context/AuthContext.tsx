import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as loginAPI, logout as logoutAPI, initAuth, AuthResponse } from "../services/api";

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authData = await initAuth();
        if (authData) {
          // Fetch full user profile if needed
          setUser(authData as any);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginAPI({ email, password, isAdmin: false });
      setUser(response);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutAPI();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

