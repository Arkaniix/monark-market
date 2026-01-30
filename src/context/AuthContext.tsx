import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiFetch, getAccessToken, setTokens, clearTokens } from "@/lib/api";

// Check if we're in mock mode - SECURITY: Mock mode is DISABLED in production builds
const DATA_PROVIDER = import.meta.env.VITE_DATA_PROVIDER || 'mock';
const IS_PRODUCTION = import.meta.env.PROD;

// SECURITY FIX: Force mock mode OFF in production builds regardless of environment variable
// This prevents authentication bypass if VITE_DATA_PROVIDER is accidentally set to 'mock' in production
const IS_MOCK_MODE = !IS_PRODUCTION && DATA_PROVIDER === 'mock';

// Mock user accounts for development
const MOCK_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'admin@test.com': {
    password: 'Admin123!',
    user: {
      id: 'mock-admin-1',
      email: 'admin@test.com',
      display_name: 'Admin Test',
      role: 'admin',
      is_admin: true,
      created_at: new Date().toISOString(),
    },
  },
  'user@test.com': {
    password: 'User123!',
    user: {
      id: 'mock-user-1',
      email: 'user@test.com',
      display_name: 'User Test',
      role: 'user',
      is_admin: false,
      created_at: new Date().toISOString(),
    },
  },
};

export interface User {
  id: string;
  email: string;
  display_name?: string;
  discord_id?: string;
  role?: string;
  is_admin?: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isMockMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  display_name: string;
  discord_id?: string;
  plan_id?: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user?: User;
}

interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user?: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate a fake JWT-like token for mock mode
function generateMockToken(email: string): string {
  const payload = {
    sub: email,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    iat: Date.now(),
  };
  return `mock.${btoa(JSON.stringify(payload))}.signature`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshMe = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    // Mock mode: decode token and get user from mock accounts or localStorage
    if (IS_MOCK_MODE) {
      try {
        const storedUser = localStorage.getItem('mock_current_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser) as User;
          setUser(userData);
          setIsAdmin(userData.is_admin || userData.role === 'admin');
        } else {
          clearTokens();
          setUser(null);
          setIsAdmin(false);
        }
      } catch {
        clearTokens();
        setUser(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // API mode: call the real endpoint
    try {
      const userData = await apiFetch<User>("/v1/users/me");
      setUser(userData);
      setIsAdmin(userData.is_admin || userData.role === "admin");
    } catch (error) {
      console.error("Failed to fetch user:", error);
      clearTokens();
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = async (email: string, password: string) => {
    // Set loading to true during login to prevent race conditions
    setIsLoading(true);
    
    try {
      // Mock mode: accept any email/password or known accounts
      if (IS_MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

        const knownAccount = MOCK_ACCOUNTS[email.toLowerCase()];
        let mockUser: User;

        if (knownAccount) {
          // Check password for known accounts
          if (knownAccount.password !== password) {
            setIsLoading(false);
            throw new Error('Mot de passe incorrect');
          }
          mockUser = knownAccount.user;
        } else {
          // Dev mode: accept any email/password, determine admin by email
          const isAdminEmail = email.toLowerCase().includes('admin');
          mockUser = {
            id: `mock-${Date.now()}`,
            email: email,
            display_name: email.split('@')[0],
            role: isAdminEmail ? 'admin' : 'user',
            is_admin: isAdminEmail,
            created_at: new Date().toISOString(),
          };
        }

        const mockToken = generateMockToken(email);
        setTokens({
          access: mockToken,
          refresh: `refresh-${mockToken}`,
        });
        localStorage.setItem('mock_current_user', JSON.stringify(mockUser));

        setUser(mockUser);
        setIsAdmin(mockUser.is_admin || mockUser.role === 'admin');
        setIsLoading(false);
        return;
      }

      // API mode: call the real login endpoint
      const response = await apiFetch<LoginResponse>("/v1/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });

      setTokens({
        access: response.access_token,
        refresh: response.refresh_token,
      });

      // Fetch user data after login - keep isLoading true during this
      const userData = await apiFetch<User>("/v1/users/me");
      setUser(userData);
      setIsAdmin(userData.is_admin || userData.role === "admin");
    } catch (error) {
      // Reset state on error
      clearTokens();
      setUser(null);
      setIsAdmin(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    // Mock mode: create a mock user
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

      const isAdminEmail = data.email.toLowerCase().includes('admin');
      const mockUser: User = {
        id: `mock-${Date.now()}`,
        email: data.email,
        display_name: data.display_name,
        discord_id: data.discord_id,
        role: isAdminEmail ? 'admin' : 'user',
        is_admin: isAdminEmail,
        created_at: new Date().toISOString(),
      };

      const mockToken = generateMockToken(data.email);
      setTokens({
        access: mockToken,
        refresh: `refresh-${mockToken}`,
      });
      localStorage.setItem('mock_current_user', JSON.stringify(mockUser));

      setUser(mockUser);
      setIsAdmin(mockUser.is_admin || mockUser.role === 'admin');
      return;
    }

    // API mode: call the real register endpoint
    const response = await apiFetch<RegisterResponse>("/v1/auth/register", {
      method: "POST",
      body: data,
      auth: false,
    });

    setTokens({
      access: response.access_token,
      refresh: response.refresh_token,
    });

    // Fetch user data after registration
    await refreshMe();
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem('mock_current_user');
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isMockMode: IS_MOCK_MODE,
        login,
        register,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
