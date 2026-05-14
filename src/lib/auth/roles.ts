import { createClient } from "@/lib/supabase/server";

export type UserRole = "jugador" | "tienda" | "admin";

/**
 * Obtener el perfil del usuario autenticado
 */
export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return profile;
}

/**
 * Verificar si el usuario es 'tienda'
 */
export async function isStore() {
  const profile = await getUserProfile();
  return profile?.user_role === "tienda";
}

/**
 * Verificar si el usuario es 'jugador'
 */
export async function isPlayer() {
  const profile = await getUserProfile();
  return profile?.user_role === "jugador";
}

/**
 * Verificar si el usuario es 'admin'
 */
export async function isAdmin() {
  const profile = await getUserProfile();
  return profile?.user_role === "admin";
}

/**
 * Obtener el rol del usuario (o null si no autenticado)
 */
export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile();
  return profile?.user_role || null;
}
