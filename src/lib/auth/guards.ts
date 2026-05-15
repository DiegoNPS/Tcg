import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import { isStore, isPlayer, isAdmin } from "./roles";

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

/**
 * Guard: Solo tiendas o admins pueden acceder
 */
export async function requireStore() {
  const { supabase, user } = await requireAuthenticatedUser("/tienda/dashboard");

  const [{ data: tienda }, { data: profile }] = await Promise.all([
    supabase.from("tiendas").select("id").eq("owner_id", user.id).maybeSingle(),
    supabase.from("profiles").select("user_role").eq("user_id", user.id).maybeSingle(),
  ]);

  const storeCheck = Boolean(tienda);
  const adminCheck = profile?.user_role === "admin";

  if (!storeCheck && !adminCheck) {
    redirect("/");
  }
}

/**
 * Guard: Solo jugadores pueden acceder
 */
export async function requirePlayer() {
  await requireAuthenticatedUser("/");
  const playerCheck = await isPlayer();

  if (!playerCheck) {
    redirect("/");
  }
}

/**
 * Guard: Solo admins pueden acceder
 */
export async function requireAdmin() {
  await requireAuthenticatedUser("/admin");
  const adminCheck = await isAdmin();

  if (!adminCheck) {
    redirect("/");
  }
}
