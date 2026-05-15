/* eslint-disable @typescript-eslint/no-explicit-any */
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

  // If filtering by juego/categoria, resolve their ids first
  const juegoIds: string[] = [];
  if (juegoFiltro) {
    const { data: jdata } = await (supabase.from("juegos").select("id").eq("key", juegoFiltro).limit(1).maybeSingle() as any);
    const jdataAny = jdata as any;
    if (jdataAny) juegoIds.push(jdataAny.id);
  }

  const categoriaIds: string[] = [];
  if (categoriaFiltro) {
    const { data: cdata } = await (supabase.from("categorias_torneo").select("id").eq("key", categoriaFiltro).limit(1).maybeSingle() as any);
    const cdataAny = cdata as any;
    if (cdataAny) categoriaIds.push(cdataAny.id);
  }

  let ciudadIds: string[] = [];
  if (ciudad) {
    const { data: cids } = await supabase.from("ciudades").select("id").ilike("nombre", `%${ciudad}%`);
    ciudadIds = (cids ?? []).map((r: any) => r.id);
  }

  let query = supabase
    .from("torneos")
    .select(
      "id, tienda_id, titulo, descripcion, juego_id, categoria_id, ciudad_id, direccion, fecha_inicio, cupo_maximo, costo_entrada, imagen_url, latitud, longitud",
    )
    .eq("publicado", true)
    .order("fecha_inicio", { ascending: true });

  if (juegoIds.length > 0) query = query.in("juego_id", juegoIds);
  if (categoriaIds.length > 0) query = query.in("categoria_id", categoriaIds);
  if (ciudadIds.length > 0) query = query.in("ciudad_id", ciudadIds);

  const { data: torneos, error: torneosError } = await query as any;

  if (torneosError) {
    return Response.json({ error: "No se pudieron cargar los torneos" }, { status: 500 });
  }

  const torneosList = (torneos ?? []) as any[];
  const tiendaIds = Array.from(new Set(torneosList.map((torneo) => torneo.tienda_id)));
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

  // intermediate `items` removed; building `finalItems` below

  // Resolve names for juegos, categorias and ciudades
  const juegoIdsAll = Array.from(new Set(torneosList.map((t) => t.juego_id).filter(Boolean)));
  const categoriaIdsAll = Array.from(new Set(torneosList.map((t) => t.categoria_id).filter(Boolean)));
  const ciudadIdsAll = Array.from(new Set(torneosList.map((t) => t.ciudad_id).filter(Boolean)));

  const juegosMap = new Map<string, string>();
  if (juegoIdsAll.length > 0) {
    const { data: juegos } = await supabase.from("juegos").select("id, key").in("id", juegoIdsAll);
    (juegos ?? []).forEach((j: any) => juegosMap.set(j.id, j.key));
  }

  const categoriasMap = new Map<string, string>();
  if (categoriaIdsAll.length > 0) {
    const { data: categorias } = await supabase.from("categorias_torneo").select("id, key").in("id", categoriaIdsAll);
    (categorias ?? []).forEach((c: any) => categoriasMap.set(c.id, c.key));
  }

  const ciudadesMap = new Map<string, string>();
  if (ciudadIdsAll.length > 0) {
    const { data: ciudades } = await supabase.from("ciudades").select("id, nombre").in("id", ciudadIdsAll);
    (ciudades ?? []).forEach((c: any) => ciudadesMap.set(c.id, c.nombre));
  }

  const finalItems = torneosList.map((torneo) => ({
    ...torneo,
    tienda_nombre: tiendaMap.get(torneo.tienda_id) ?? null,
    tcg_juego: torneo.juego_id ? juegosMap.get(torneo.juego_id) ?? null : null,
    categoria: torneo.categoria_id ? categoriasMap.get(torneo.categoria_id) ?? null : null,
    ciudad: torneo.ciudad_id ? ciudadesMap.get(torneo.ciudad_id) ?? null : null,
  }));

  return Response.json({ data: finalItems }, { status: 200 });
}