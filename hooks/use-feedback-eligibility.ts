"use client";

import * as React from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";

/** Matches the database trigger on public.feedback. */
export const FEEDBACK_COOLDOWN_DAYS = 14;

/**
 * Whether this visitor still has their say for the fortnight.
 *
 * `null` while unknown — callers should render nothing rather than show a
 * button they are about to take away. The database trigger is the actual
 * limit; this only decides what to put on screen.
 */
export function useFeedbackEligibility() {
  const { user, configured } = useAuth();
  const [canSubmit, setCanSubmit] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!configured || !user) {
      setCanSubmit(null);
      return;
    }

    let cancelled = false;
    setCanSubmit(null);

    void createClient()
      .from("feedback")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (cancelled) return;
        // On a read failure, let them try: the trigger still holds the line.
        if (error || !data?.length) {
          setCanSubmit(true);
          return;
        }
        const last = new Date(data[0]!.created_at as string);
        const next = new Date(last);
        next.setDate(next.getDate() + FEEDBACK_COOLDOWN_DAYS);
        setCanSubmit(next <= new Date());
      });

    return () => {
      cancelled = true;
    };
  }, [configured, user]);

  const markSubmitted = React.useCallback(() => setCanSubmit(false), []);

  return { canSubmit, markSubmitted };
}
