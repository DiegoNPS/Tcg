import { InscripcionesList } from "@/components/jugador/inscripciones-list";
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
  tienda_id: string;
  costo_entrada: number | null;
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
  const torneosMap = new Map<string, TorneoResumen>();
  const tiendasMap = new Map<string, string>();

  if (torneoIds.length > 0) {
    const { data: torneos } = await supabase
      .from("torneos")
      .select("id, titulo, fecha_inicio, tienda_id, costo_entrada")
      .in("id", torneoIds as string[]);

    const torneosList = (torneos ?? []) as TorneoResumen[];
    torneosList.forEach((torneo) => {
      torneosMap.set(torneo.id, torneo);
    });

    const tiendaIds = Array.from(new Set(torneosList.map((torneo) => torneo.tienda_id)));
    if (tiendaIds.length > 0) {
      const { data: tiendas } = await supabase
        .from("tiendas")
        .select("id, nombre, ciudad_id")
        .in("id", tiendaIds);
      const tiendasList = tiendas ?? [];
      tiendasList.forEach((tienda) => tiendasMap.set(tienda.id, tienda.nombre));

      const ciudadIds = Array.from(new Set(tiendasList.map((tienda) => tienda.ciudad_id).filter(Boolean))) as string[];
      if (ciudadIds.length > 0) {
        const { data: ciudades } = await supabase
          .from("ciudades")
          .select("id, nombre")
          .in("id", ciudadIds);
        const ciudadesMap = new Map<string, string>();
        (ciudades ?? []).forEach((ciudad) => ciudadesMap.set(ciudad.id, ciudad.nombre));
        tiendasList.forEach((tienda) => {
          if (tienda.ciudad_id) {
            tiendasMap.set(tienda.id, `${tienda.nombre}||${ciudadesMap.get(tienda.ciudad_id) ?? ""}`);
          }
        });
      }
    }
  }

  const entriesWithTorneo = typedEntries.map((entry) => {
    const torneo = torneosMap.get(entry.torneo_id);
    return {
      id: entry.id,
      status: entry.status,
      torneo: torneo
        ? {
            id: torneo.id,
            titulo: torneo.titulo,
            fecha_inicio: torneo.fecha_inicio,
            tienda_nombre: (tiendasMap.get(torneo.tienda_id) ?? "").split("||")[0] || null,
            ciudad: (tiendasMap.get(torneo.tienda_id) ?? "").split("||")[1] || null,
            costo_entrada: torneo.costo_entrada ?? null,
          }
        : null,
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10">
      <header className="mb-6">
        <p className="text-sm font-medium text-zinc-500">Jugador</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Mis inscripciones</h1>
        <p className="text-sm text-zinc-600">Lista de tus inscripciones a torneos.</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        {entries && entries.length > 0 ? (
          <InscripcionesList entries={entriesWithTorneo} />
        ) : (
          <p className="text-sm text-zinc-600">Aun no tienes inscripciones.</p>
        )}
      </section>
    </main>
  );
}
