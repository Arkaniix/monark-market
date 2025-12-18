// Mock Authentication - for development/demo mode only

import { User } from "@/context/AuthContext";
import { setTokens } from "@/lib/api";

export interface MockLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// Mock user accounts
const MOCK_ACCOUNTS: Record<string, { password: string; user: User }> = {
  "admin@test.com": {
    password: "admin",
    user: {
      id: "mock-admin-001",
      email: "admin@test.com",
      display_name: "Admin Test",
      role: "admin",
      is_admin: true,
      created_at: new Date().toISOString(),
    },
  },
  "user@test.com": {
    password: "user",
    user: {
      id: "mock-user-001",
      email: "user@test.com",
      display_name: "User Test",
      role: "user",
      is_admin: false,
      created_at: new Date().toISOString(),
    },
  },
};

// In dev/mock mode, accept any credentials or use fixed accounts
export async function mockLogin(email: string, password: string): Promise<MockLoginResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Check if it's a known mock account
  const account = MOCK_ACCOUNTS[email.toLowerCase()];
  if (account && account.password === password) {
    return {
      access_token: `mock_access_${account.user.id}_${Date.now()}`,
      refresh_token: `mock_refresh_${account.user.id}_${Date.now()}`,
      token_type: "bearer",
      user: account.user,
    };
  }

  // In dev mode, accept any credentials and create a user on the fly
  const isAdmin = email.toLowerCase().includes("admin");
  const mockUser: User = {
    id: `mock-${Date.now()}`,
    email,
    display_name: email.split("@")[0],
    role: isAdmin ? "admin" : "user",
    is_admin: isAdmin,
    created_at: new Date().toISOString(),
  };

  return {
    access_token: `mock_access_${mockUser.id}_${Date.now()}`,
    refresh_token: `mock_refresh_${mockUser.id}_${Date.now()}`,
    token_type: "bearer",
    user: mockUser,
  };
}

export async function mockRegister(data: {
  email: string;
  password: string;
  display_name: string;
  discord_id?: string;
}): Promise<MockLoginResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const isAdmin = data.email.toLowerCase().includes("admin");
  const mockUser: User = {
    id: `mock-${Date.now()}`,
    email: data.email,
    display_name: data.display_name,
    discord_id: data.discord_id,
    role: isAdmin ? "admin" : "user",
    is_admin: isAdmin,
    created_at: new Date().toISOString(),
  };

  return {
    access_token: `mock_access_${mockUser.id}_${Date.now()}`,
    refresh_token: `mock_refresh_${mockUser.id}_${Date.now()}`,
    token_type: "bearer",
    user: mockUser,
  };
}

export async function mockGetCurrentUser(): Promise<User | null> {
  // Check localStorage for mock user
  const mockUserStr = localStorage.getItem("mock_current_user");
  if (mockUserStr) {
    try {
      return JSON.parse(mockUserStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function setMockCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem("mock_current_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("mock_current_user");
  }
}

export function isMockMode(): boolean {
  return import.meta.env.VITE_DATA_PROVIDER === "mock";
}
