// src/store/useAuthStore.ts
import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface AuthState {
    user: User | null; // 로그인한 유저 정보 (로그인 안 했으면 null)
    isInitialized: boolean; // 로그인 상태 확인 완료 여부
    setUser: (user: User | null) => void;
    setInitialized: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isInitialized: false,
    setUser: (user) => set({ user }),
    setInitialized: (status) => set({ isInitialized: status }),
}));