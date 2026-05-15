import { TorneoCard } from "@/components/cards/torneo-card";
import { TorneosFilters } from "@/components/home/torneos-filters";
import { CATEGORIA_OPTIONS, TCG_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { CategoriaTorneo } from "@/types/database.types";

type TorneosPageProps = {
  searchParams: Promise<{
    juego?: string | string[];
    categoria?: string | string[];
    ciudad?: string | string[];
    inscripcion?: string | string[];
  }>;
};

function getSingleParam(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param;
}

const validCategorias = new Set<CategoriaTorneo>(
  CATEGORIA_OPTIONS.map((option) => option.value),
);

function isCategoriaTorneo(value: string): value is CategoriaTorneo {
  return validCategorias.has(value as CategoriaTorneo);
}

const inscripcionMessages: Record<string, string> = {
  ok: "Inscripcion completada.",
  existente: "Ya estabas inscrito en este torneo.",
  error: "No se pudo completar la inscripcion.",
  "no-jugador": "Solo jugadores pueden inscribirse a torneos.",
  "torneo-invalido": "El torneo solicitado no es valido.",
};

export default async function TorneosPage({ searchParams }: TorneosPageProps) {
  const params = await searchParams;

  const juegoRaw = getSingleParam(params.juego);
  const categoriaRaw = getSingleParam(params.categoria);
  const ciudadRaw = getSingleParam(params.ciudad);
  const inscripcionCode = getSingleParam(params.inscripcion);

  const categoria: CategoriaTorneo | "" =
    categoriaRaw && isCategoriaTorneo(categoriaRaw) ? categoriaRaw : "";
  const ciudad = ciudadRaw?.trim() ?? "";

  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    supabase = await createClient();
  } catch {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Torneos TCG</h1>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para cargar torneos.
        </p>
      </main>
    );
  }

  const { data: juegos } = await supabase.from("juegos").select("id, key, nombre").order("nombre", { ascending: true });
  const gameOptions = (juegos ?? []).length
    ? (juegos ?? []).map((juego) => ({ value: juego.key, label: juego.nombre }))
    : TCG_OPTIONS;
  const validJuegos = new Set(gameOptions.map((option) => option.value));
  const juego: string = juegoRaw && validJuegos.has(juegoRaw) ? juegoRaw : "";

  // Resolve filter values to IDs in lookup tables
  let juegoId: string | undefined;
  let categoriaId: string | undefined;
  let tiendaIdsForCiudad: string[] | undefined;

  if (juego) {
    const { data: juegoRow } = await supabase.from("juegos").select("id").eq("key", juego).maybeSingle();
    juegoId = juegoRow?.id;
  }

  if (categoria) {
    const { data: categoriaRow } = await supabase
      .from("categorias_torneo")
      .select("id")
      .eq("key", categoria)
      .maybeSingle();
    categoriaId = categoriaRow?.id;
  }

  if (ciudad) {
    const { data: ciudades } = await supabase
      .from("ciudades")
      .select("id")
      .ilike("nombre", `%${ciudad}%`);

    const ciudadIds = (ciudades ?? []).map((c) => c.id);
    if (ciudadIds.length > 0) {
      const { data: tiendas } = await supabase.from("tiendas").select("id").in("ciudad_id", ciudadIds);
      tiendaIdsForCiudad = (tiendas ?? []).map((t) => t.id);
    } else {
      tiendaIdsForCiudad = [];
    }
  }

  let query = supabase
    .from("torneos")
    .select(
      "id, tienda_id, titulo, descripcion, juego_id, categoria_id, direccion, fecha_inicio, cupo_maximo, costo_entrada, imagen_url, latitud, longitud",
    )
    .eq("publicado", true)
    .order("fecha_inicio", { ascending: true });

  if (juegoId) query = query.eq("juego_id", juegoId);
  if (categoriaId) query = query.eq("categoria_id", categoriaId);
  if (tiendaIdsForCiudad) query = query.in("tienda_id", tiendaIdsForCiudad);

  const { data: torneos, error: torneosError } = await query;

  if (torneosError) {
    throw new Error(torneosError.message);
  }

  const tiendaIds = Array.from(new Set((torneos ?? []).map((torneo) => torneo.tienda_id)));
  const tiendaMap = new Map<string, string>();

  if (tiendaIds.length > 0) {
    const { data: tiendas, error: tiendasError } = await supabase
      .from("tiendas")
      .select("id, nombre, ciudad_id")
      .in("id", tiendaIds);

    if (tiendasError) {
      throw new Error(tiendasError.message);
    }

    tiendas?.forEach((tienda) => {
      tiendaMap.set(tienda.id, tienda.nombre);
    });
  }

  // resolve juegos, categorias and ciudades for display
  const juegoIds = Array.from(new Set((torneos ?? []).map((t) => t.juego_id).filter(Boolean))) as string[];
  const categoriaIds = Array.from(new Set((torneos ?? []).map((t) => t.categoria_id).filter(Boolean))) as string[];

  const juegoMap = new Map<string, string>();
  const categoriaMap = new Map<string, string>();
  const ciudadMap = new Map<string, string>();

  if (juegoIds.length > 0) {
    const { data: juegos } = await supabase.from("juegos").select("id, key, nombre").in("id", juegoIds);
    juegos?.forEach((j) => juegoMap.set(j.id, j.key ?? j.nombre));
  }

  if (categoriaIds.length > 0) {
    const { data: categorias } = await supabase
      .from("categorias_torneo")
      .select("id, key, nombre")
      .in("id", categoriaIds);
    categorias?.forEach((c) => categoriaMap.set(c.id, c.key ?? c.nombre));
  }

  // collect ciudad_ids from tiendas we already fetched
  const tiendaRows = (await supabase.from("tiendas").select("id, nombre, ciudad_id").in("id", tiendaIds)).data ?? [] as { id: string; nombre: string; ciudad_id?: string | null }[];
  const ciudadIds = Array.from(new Set(tiendaRows.map((t) => t.ciudad_id).filter(Boolean))) as string[];
  if (ciudadIds.length > 0) {
    const { data: ciudades } = await supabase.from("ciudades").select("id, nombre").in("id", ciudadIds);
    ciudades?.forEach((c) => ciudadMap.set(c.id, c.nombre));
  }

  // build enriched torneos with display fields expected by TorneoCard
  const enrichedTorneos = (torneos ?? []).map((t) => {
    const tiendaRow = tiendaRows.find((tr) => tr.id === t.tienda_id);
    return {
      ...t,
      tcg_juego: juegoMap.get(t.juego_id ?? "") ?? "otro",
      categoria: categoriaMap.get(t.categoria_id ?? "") ?? "casual",
      ciudad: tiendaRow ? ciudadMap.get(tiendaRow.ciudad_id ?? "") ?? "" : "",
      tiendaNombre: tiendaMap.get(t.tienda_id) ?? "Tienda independiente",
    };
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const torneosInscritos = new Set<string>();

  if (user) {
    const { data: entries } = await supabase
      .from("tournament_entries")
      .select("torneo_id, status")
      .eq("entry_type", "solo")
      .eq("user_id", user.id);

    entries?.forEach((entry) => {
      if (entry.status !== "dropped" && entry.status !== "eliminated") {
        torneosInscritos.add(entry.torneo_id);
      }
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Calendario publico
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Torneos TCG</h1>
        <p className="max-w-2xl text-sm text-zinc-600">
          Descubre eventos de Pokemon, Yu-Gi-Oh!, Magic y mas. Filtra por juego y ciudad para encontrar tu proxima fecha.
        </p>
      </header>

      {inscripcionCode ? (
        <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
          {inscripcionMessages[inscripcionCode] ?? "Estado de inscripcion actualizado."}
        </p>
      ) : null}

      <TorneosFilters
        initialValues={{
          juego,
          categoria,
          ciudad,
        }}
        juegos={gameOptions}
      />

      {torneos?.length ? (
        <section className="grid gap-4 sm:grid-cols-3">
          {enrichedTorneos.map((torneo) => (
            <TorneoCard
              key={torneo.id}
              torneo={torneo}
              canInscribirse={Boolean(user)}
              yaInscripto={torneosInscritos.has(torneo.id)}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">No hay torneos con esos filtros</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Ajusta los filtros o vuelve mas tarde para ver nuevas publicaciones.
          </p>
        </section>
      )}
    </main>
  );
}

