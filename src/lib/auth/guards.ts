import { redirect } from "next/navigation";

import { LOGIN_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import { isStore, isPlayer } from "./roles";

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
 * Guard: Solo tiendas pueden acceder
 */
export async function requireStore() {
  await requireAuthenticatedUser("/tienda/dashboard");
  const storeCheck = await isStore();

  if (!storeCheck) {
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
