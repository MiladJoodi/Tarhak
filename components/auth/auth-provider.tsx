"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  /**
   * If signed in (or Supabase unset in local/dev), runs `action`.
   * Otherwise opens the login dialog and runs `action` after a successful sign-in.
   */
  requireAuth: (action?: () => void | Promise<void>) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const pathname = usePathname();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(configured);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const pendingActionRef = React.useRef<(() => void | Promise<void>) | null>(
    null,
  );

  // `user` is mirrored into a ref because `requireAuth` reads it *after* an
  // await, where the state captured in its closure would be stale.
  const userRef = React.useRef<User | null>(null);
  const applyUser = React.useCallback((next: User | null) => {
    userRef.current = next;
    setUser(next);
  }, []);

  // Settles when the initial `getUser()` call does. `requireAuth` awaits it so
  // a click made while the session is still in flight does not show the login
  // dialog to someone who is already signed in.
  const sessionReadyRef = React.useRef<Promise<void> | null>(null);

  const runPending = React.useCallback(() => {
    const pending = pendingActionRef.current;
    pendingActionRef.current = null;
    if (pending) void pending();
  }, []);

  const clearPending = React.useCallback(() => {
    pendingActionRef.current = null;
  }, []);

  React.useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    // `getUser()` reports a missing session via `error` but still rejects when
    // the request itself fails, so settle on both paths. Without the rejection
    // handler a flaky network left `loading` true forever and surfaced an
    // unhandled rejection.
    const settle = (next: User | null) => {
      if (cancelled) return;
      applyUser(next);
      setLoading(false);
    };

    sessionReadyRef.current = supabase.auth.getUser().then(
      ({ data, error }) => settle(error ? null : (data.user ?? null)),
      () => settle(null),
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        setLoginOpen(false);
        runPending();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [applyUser, configured, runPending]);

  // Close login on in-app navigation or browser back/forward.
  React.useEffect(() => {
    setLoginOpen(false);
    clearPending();
  }, [pathname, clearPending]);

  React.useEffect(() => {
    const onPopState = () => {
      setLoginOpen(false);
      clearPending();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [clearPending]);

  const openLogin = React.useCallback(() => setLoginOpen(true), []);
  const closeLogin = React.useCallback(() => {
    clearPending();
    setLoginOpen(false);
  }, [clearPending]);

  const requireAuth = React.useCallback(
    async (action?: () => void | Promise<void>) => {
      if (!configured) {
        await action?.();
        return true;
      }
      // Wait out the initial session fetch before deciding to prompt.
      if (!userRef.current) await sessionReadyRef.current;
      if (userRef.current) {
        await action?.();
        return true;
      }
      pendingActionRef.current = action ?? null;
      setLoginOpen(true);
      return false;
    },
    [configured],
  );

  const signOut = React.useCallback(async () => {
    if (!configured) return;
    await createClient().auth.signOut();
    applyUser(null);
  }, [applyUser, configured]);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      configured,
      loginOpen,
      openLogin,
      closeLogin,
      requireAuth,
      signOut,
    }),
    [
      user,
      loading,
      configured,
      loginOpen,
      openLogin,
      closeLogin,
      requireAuth,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
