import Link from "next/link";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams: Promise<{ created?: string; updated?: string; error?: string }>;
};

const errorMessages: Record<string, string> = {
  "sin-tienda":
    "Tu cuenta no tiene una tienda asociada. Crea un registro en la tabla tiendas para desbloquear el panel.",
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    supabase = await createClient();
  } catch {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard de tienda</h1>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para habilitar el panel.
        </p>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/tienda/dashboard");
  }

  const { data: tienda, error: tiendaError } = await supabase
    .from("tiendas")
    .select("id, nombre, ciudad")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (tiendaError) {
    throw new Error(tiendaError.message);
  }

  if (!tienda) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard de tienda</h1>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tu usuario aun no esta vinculado a una tienda. Inserta un registro en la tabla tiendas con owner_id =
          {` ${user.id}`}.
        </p>
      </main>
    );
  }

  const { data: torneos, error: torneosError } = await supabase
    .from("torneos")
    .select("id, titulo, fecha_inicio, tcg_juego, categoria, ciudad, publicado")
    .eq("tienda_id", tienda.id)
    .order("fecha_inicio", { ascending: false });

  if (torneosError) {
    throw new Error(torneosError.message);
  }

  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-500">Panel de tienda</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{tienda.nombre}</h1>
          <p className="text-sm text-zinc-600">{tienda.ciudad}</p>
        </div>
        <Link
          href="/tienda/nuevo-torneo"
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Publicar nuevo torneo
        </Link>
      </header>

      {params.created === "1" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Torneo creado correctamente.
        </p>
      ) : null}

      {params.updated === "1" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Torneo actualizado correctamente.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">Torneos publicados</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {torneos?.length ? (
            torneos.map((torneo) => (
              <article key={torneo.id} className="flex flex-col gap-1 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-zinc-900">{torneo.titulo}</p>
                  <p className="text-zinc-600">
                    {torneo.tcg_juego} / {torneo.categoria} / {torneo.ciudad}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-zinc-500">{new Date(torneo.fecha_inicio).toLocaleString("es-ES")}</p>
                  <Link
                    href={`/tienda/torneos/${torneo.id}/editar`}
                    className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
                  >
                    <Pencil size={12} />
                    Editar
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-zinc-600">Aun no has publicado torneos.</p>
          )}
        </div>
      </section>
    </main>
  );
}
