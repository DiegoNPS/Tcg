import Link from "next/link";

import { requirePlayer } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilJugadorPage() {
  await requirePlayer();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, user_role, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <p className="text-sm font-medium text-zinc-500">Jugador</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Mi perfil</h1>
        <p className="text-sm text-zinc-600">Revisa tu información de cuenta y accesos.</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-zinc-500">Nombre visible</p>
            <p className="font-medium text-zinc-900">{profile?.display_name ?? "Sin definir"}</p>
          </div>
          <div>
            <p className="text-zinc-500">Correo</p>
            <p className="font-medium text-zinc-900">{user.email ?? "Sin correo"}</p>
          </div>
          <div>
            <p className="text-zinc-500">Rol</p>
            <p className="font-medium text-zinc-900">{profile?.user_role ?? "jugador"}</p>
          </div>
          <div>
            <p className="text-zinc-500">Miembro desde</p>
            <p className="font-medium text-zinc-900">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES") : "-"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Acciones rápidas</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/jugador/inscripciones"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Ver mis inscripciones
          </Link>
          <Link
            href="/torneos"
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Buscar torneos
          </Link>
        </div>
      </section>
    </main>
  );
}