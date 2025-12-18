import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiFetch, getAccessToken, setTokens, clearTokens } from "@/lib/api";
import { 
  isMockMode, 
  mockLogin, 
  mockRegister, 
  mockGetCurrentUser, 
  setMockCurrentUser 
} from "@/lib/mockAuth";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshMe = useCallback(async () => {
    // Mock mode: check localStorage for mock user
    if (isMockMode()) {
      const mockUser = await mockGetCurrentUser();
      if (mockUser) {
        setUser(mockUser);
        setIsAdmin(mockUser.is_admin || mockUser.role === "admin");
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
      return;
    }

    // API mode: use real token
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

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
    // Mock mode
    if (isMockMode()) {
      const response = await mockLogin(email, password);
      setTokens({
        access: response.access_token,
        refresh: response.refresh_token,
      });
      setMockCurrentUser(response.user);
      setUser(response.user);
      setIsAdmin(response.user.is_admin || response.user.role === "admin");
      return;
    }

    // API mode
    const response = await apiFetch<LoginResponse>("/v1/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });

    setTokens({
      access: response.access_token,
      refresh: response.refresh_token,
    });

    // Fetch user data after login
    await refreshMe();
  };

  const register = async (data: RegisterData) => {
    // Mock mode
    if (isMockMode()) {
      const response = await mockRegister(data);
      setTokens({
        access: response.access_token,
        refresh: response.refresh_token,
      });
      setMockCurrentUser(response.user);
      setUser(response.user);
      setIsAdmin(response.user.is_admin || response.user.role === "admin");
      return;
    }

    // API mode
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
    setMockCurrentUser(null);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
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
