import { z } from "zod";

import { CATEGORIA_OPTIONS, TCG_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

import type { CategoriaTorneo, TcgJuego } from "@/types/database.types";

const validJuegos = new Set<TcgJuego>(TCG_OPTIONS.map((option) => option.value));
const validCategorias = new Set<CategoriaTorneo>(
  CATEGORIA_OPTIONS.map((option) => option.value),
);

const querySchema = z.object({
  juego: z.string().optional(),
  categoria: z.string().optional(),
  ciudad: z.string().trim().max(100).optional(),
});

function isTcgJuego(value: string): value is TcgJuego {
  return validJuegos.has(value as TcgJuego);
}

function isCategoriaTorneo(value: string): value is CategoriaTorneo {
  return validCategorias.has(value as CategoriaTorneo);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    juego: url.searchParams.get("juego") ?? undefined,
    categoria: url.searchParams.get("categoria") ?? undefined,
    ciudad: url.searchParams.get("ciudad") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Parámetros de búsqueda inválidos" },
      { status: 400 },
    );
  }

  const { juego, categoria, ciudad } = parsed.data;

  if (juego && !isTcgJuego(juego)) {
    return Response.json({ error: "Juego inválido" }, { status: 400 });
  }

  if (categoria && !isCategoriaTorneo(categoria)) {
    return Response.json({ error: "Categoría inválida" }, { status: 400 });
  }

  const juegoFiltro: TcgJuego | undefined = juego && isTcgJuego(juego) ? juego : undefined;
  const categoriaFiltro: CategoriaTorneo | undefined =
    categoria && isCategoriaTorneo(categoria) ? categoria : undefined;

  const supabase = await createClient();

  let query = supabase
    .from("torneos")
    .select(
      "id, tienda_id, titulo, descripcion, tcg_juego, categoria, ciudad, direccion, fecha_inicio, cupo_maximo, costo_entrada, imagen_url, latitud, longitud",
    )
    .eq("publicado", true)
    .order("fecha_inicio", { ascending: true });

  if (juegoFiltro) {
    query = query.eq("tcg_juego", juegoFiltro);
  }

  if (categoriaFiltro) {
    query = query.eq("categoria", categoriaFiltro);
  }

  if (ciudad) {
    query = query.ilike("ciudad", `%${ciudad}%`);
  }

  const { data: torneos, error: torneosError } = await query;

  if (torneosError) {
    return Response.json({ error: "No se pudieron cargar los torneos" }, { status: 500 });
  }

  const tiendaIds = Array.from(new Set((torneos ?? []).map((torneo) => torneo.tienda_id)));
  const tiendaMap = new Map<string, string>();

  if (tiendaIds.length > 0) {
    const { data: tiendas, error: tiendasError } = await supabase
      .from("tiendas")
      .select("id, nombre")
      .in("id", tiendaIds);

    if (tiendasError) {
      return Response.json({ error: "No se pudieron cargar las tiendas" }, { status: 500 });
    }

    tiendas?.forEach((tienda) => {
      tiendaMap.set(tienda.id, tienda.nombre);
    });
  }

  const items = (torneos ?? []).map((torneo) => ({
    ...torneo,
    tienda_nombre: tiendaMap.get(torneo.tienda_id) ?? null,
  }));

  return Response.json({ data: items }, { status: 200 });
}