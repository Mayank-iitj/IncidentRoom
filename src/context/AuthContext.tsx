"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { CometChat, initCometChat, loginUser, logoutUser } from "@/lib/cometchat";
import { PERSONAS, seedData } from "@/lib/seed";

export type Persona = (typeof PERSONAS)[number];

interface AuthState {
  user: CometChat.User | null;
  persona: Persona | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (uid: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    persona: null,
    initialized: false,
    loading: true,
    error: null,
  });

  const initRef = useRef(false);

  const init = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      await initCometChat();

      // Check if already logged in
      const existing = await CometChat.getLoggedinUser();
      if (existing) {
        const persona = PERSONAS.find((p) => p.uid === existing.getUid()) ?? null;
        setState({
          user: existing,
          persona,
          initialized: true,
          loading: false,
          error: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          initialized: true,
          loading: false,
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        initialized: false,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to initialize CometChat",
      }));
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const login = useCallback(async (uid: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const user = await loginUser(uid);
      const persona = PERSONAS.find((p) => p.uid === uid) ?? null;

      setState({
        user,
        persona,
        initialized: true,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Login failed",
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setState({
      user: null,
      persona: null,
      initialized: true,
      loading: false,
      error: null,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
