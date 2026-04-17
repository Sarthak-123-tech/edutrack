import { useAuthStore } from "@/store/auth";
import type { UserProfile, UserRole } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export interface AuthState {
  principal: string | null;
  role: UserRole | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  setUserProfile: (profile: UserProfile) => void;
}

export function useAuthState(): AuthState {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const {
    role,
    userProfile,
    isAuthenticated,
    setRole,
    setUserProfile,
    clearAuth,
  } = useAuthStore();

  const principal = identity?.getPrincipal().toText() ?? null;
  const isLoading = loginStatus === "logging-in";

  const logout = () => {
    clear();
    clearAuth();
  };

  return {
    principal,
    role,
    userProfile,
    isAuthenticated: isAuthenticated || !!identity,
    isLoading,
    login,
    logout,
    setRole,
    setUserProfile,
  };
}
