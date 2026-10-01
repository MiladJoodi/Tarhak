export function assertDevOnly() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Admin APIs are only available in development.");
  }
}

export function isDev() {
  return process.env.NODE_ENV === "development";
}

/**
 * Who may open /admin outside development.
 *
 * Unset means nobody: the filesystem-backed admin tools only work locally,
 * so production access is the exception and has to be named. Fails closed.
 */
function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdminUser() {
  const allowed = adminEmails();
  if (allowed.length === 0) return false;

  const { createClient } = await import("@/lib/supabase/server");
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const email = user?.email?.toLowerCase();
    return Boolean(email && allowed.includes(email));
  } catch {
    return false;
  }
}
