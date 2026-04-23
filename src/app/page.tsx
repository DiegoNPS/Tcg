import { TorneoCard } from "@/components/cards/torneo-card";
import { TorneosFilters } from "@/components/home/torneos-filters";
import { CATEGORIA_OPTIONS, TCG_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { CategoriaTorneo, TcgJuego } from "@/types/database.types";

type HomePageProps = {
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

const validJuegos = new Set<TcgJuego>(TCG_OPTIONS.map((option) => option.value));
const validCategorias = new Set<CategoriaTorneo>(
  CATEGORIA_OPTIONS.map((option) => option.value),
);

function isTcgJuego(value: string): value is TcgJuego {
  return validJuegos.has(value as TcgJuego);
}

function isCategoriaTorneo(value: string): value is CategoriaTorneo {
  return validCategorias.has(value as CategoriaTorneo);
}

const inscripcionMessages: Record<string, string> = {
  ok: "Inscripcion completada.",
  existente: "Ya estabas inscrito en este torneo.",
  error: "No se pudo completar la inscripcion.",
  "torneo-invalido": "El torneo solicitado no es valido.",
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const juegoRaw = getSingleParam(params.juego);
  const categoriaRaw = getSingleParam(params.categoria);
  const ciudadRaw = getSingleParam(params.ciudad);
  const inscripcionCode = getSingleParam(params.inscripcion);

  const juego: TcgJuego | "" = juegoRaw && isTcgJuego(juegoRaw) ? juegoRaw : "";
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

  let query = supabase
    .from("torneos")
    .select(
      "id, tienda_id, titulo, descripcion, tcg_juego, categoria, ciudad, direccion, fecha_inicio, cupo_maximo, costo_entrada",
    )
    .eq("publicado", true)
    .order("fecha_inicio", { ascending: true });

  if (juego) {
    query = query.eq("tcg_juego", juego);
  }

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  if (ciudad) {
    query = query.ilike("ciudad", `%${ciudad}%`);
  }

  const { data: torneos, error: torneosError } = await query;

  if (torneosError) {
    throw new Error(torneosError.message);
  }

  const tiendaIds = Array.from(new Set((torneos ?? []).map((torneo) => torneo.tienda_id)));
  const tiendaMap = new Map<string, string>();

  if (tiendaIds.length > 0) {
    const { data: tiendas, error: tiendasError } = await supabase
      .from("tiendas")
      .select("id, nombre")
      .in("id", tiendaIds);

    if (tiendasError) {
      throw new Error(tiendasError.message);
    }

    tiendas?.forEach((tienda) => {
      tiendaMap.set(tienda.id, tienda.nombre);
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const torneosInscritos = new Set<string>();

  if (user) {
    const { data: inscripciones } = await supabase
      .from("inscripciones")
      .select("torneo_id")
      .eq("jugador_id", user.id);

    inscripciones?.forEach((inscripcion) => {
      torneosInscritos.add(inscripcion.torneo_id);
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
      />

      {torneos?.length ? (
        <section className="grid gap-4 md:grid-cols-2">
          {torneos.map((torneo) => (
            <TorneoCard
              key={torneo.id}
              torneo={{
                ...torneo,
                tiendaNombre: tiendaMap.get(torneo.tienda_id) ?? "Tienda independiente",
              }}
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
