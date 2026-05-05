import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

function buildLoginPath(nextPath: string) {
  return `${LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`;
}

export async function requireAuthenticatedUser(nextPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(buildLoginPath(nextPath));
  }

  return { supabase, user };
}
