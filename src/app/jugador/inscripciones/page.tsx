import { requirePlayer } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

type EntryRow = {
  id: string;
  torneo_id: string;
  status: string;
};

type TorneoResumen = {
  id: string;
  titulo: string;
  fecha_inicio: string;
};

export default async function InscripcionesPage() {
  // Protege ruta: solo jugadores
  await requirePlayer();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const { data: entries, error: entriesError } = await supabase
    .from("tournament_entries")
    .select("id, torneo_id, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (entriesError) {
    throw new Error(entriesError.message);
  }

  const typedEntries = (entries ?? []) as EntryRow[];
  const torneoIds = Array.from(new Set(typedEntries.map((entry) => entry.torneo_id)));
  const torneosMap = new Map<string, { titulo: string; fecha_inicio: string }>();

  if (torneoIds.length > 0) {
    const { data: torneos } = await supabase
      .from("torneos")
      .select("id, titulo, fecha_inicio")
      .in("id", torneoIds as string[]);

    (torneos ?? []).forEach((torneo) => {
      const resumen = torneo as TorneoResumen;
      torneosMap.set(resumen.id, { titulo: resumen.titulo, fecha_inicio: resumen.fecha_inicio });
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10">
      <header className="mb-6">
        <p className="text-sm font-medium text-zinc-500">Jugador</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Mis inscripciones</h1>
        <p className="text-sm text-zinc-600">Lista de tus inscripciones a torneos.</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        {entries && entries.length > 0 ? (
          <ul className="space-y-3">
            {typedEntries.map((entry) => {
              const torneo = torneosMap.get(entry.torneo_id);
              return (
                <li key={entry.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">{torneo?.titulo ?? "Torneo eliminado"}</p>
                    <p className="text-sm text-zinc-600">{torneo?.fecha_inicio ? new Date(torneo.fecha_inicio).toLocaleString("es-ES") : "Fecha no disponible"}</p>
                  </div>
                  <div className="text-sm text-zinc-700">{entry.status}</div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-zinc-600">Aun no tienes inscripciones.</p>
        )}
      </section>
    </main>
  );
}
