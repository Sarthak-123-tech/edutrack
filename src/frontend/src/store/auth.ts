import type { UserProfile, UserRole } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  userProfile: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  setUserProfile: (profile: UserProfile) => void;
  setRole: (role: UserRole) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userProfile: null,
      role: null,
      isAuthenticated: false,

      setUserProfile: (profile) =>
        set({
          userProfile: profile,
          role: profile.role,
          isAuthenticated: true,
        }),

      setRole: (role) =>
        set((state) => ({
          role,
          userProfile: state.userProfile
            ? { ...state.userProfile, role }
            : null,
        })),

      clearAuth: () =>
        set({ userProfile: null, role: null, isAuthenticated: false }),
    }),
    {
      name: "tuitionms-auth",
      partialize: (state) => ({
        userProfile: state.userProfile,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
