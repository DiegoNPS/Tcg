/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const TCG_VALUES = [
  "pokemon",
  "yugioh",
  "magic",
  "one_piece",
  "digimon",
  "lorcana",
  "otro",
] as const;

const CATEGORIA_VALUES = ["local", "regional", "premier", "casual"] as const;

const editarTorneoSchema = z.object({
  titulo: z.string().trim().min(1).max(100),
  descripcion: z.string().trim().min(1).max(1200),
  tcg_juego: z.enum(TCG_VALUES).optional(),
  categoria: z.enum(CATEGORIA_VALUES).optional(),
  juego_id: z.string().uuid().optional(),
  categoria_id: z.string().uuid().optional(),
  ciudad: z.string().trim().min(1).max(100),
  direccion: z.string().trim().min(1).max(500),
  fecha_inicio: z.string().min(1, "La fecha es requerida"),
  cupo_maximo: z.coerce.number().int().min(2, "Mínimo 2 jugadores").max(1024),
  costo_entrada: z.coerce.number().min(0, "No puede ser negativo").max(1_000_000),
  publicado: z.boolean().optional(),
  latitud: z.number().optional().nullable(),
  longitud: z.number().optional().nullable(),
  imagen_url: z.string().optional().nullable(),
});

const idSchema = z.string().uuid();

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  // Verify ownership
  const { data: torneo, error: torneoError } = await supabase
    .from("torneos")
    .select("tienda_id")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (torneoError || !torneo) {
    return Response.json({ error: "Torneo no encontrado" }, { status: 404 });
  }

  const { data: tienda } = await supabase
    .from("tiendas")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tienda || tienda.id !== torneo.tienda_id) {
    return Response.json({ error: "No puedes editar este torneo" }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const parsed = editarTorneoSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      const first = issues?.[0];
      if (first) fieldErrors[key] = first;
    }
    return Response.json({ error: "Datos inválidos", fieldErrors }, { status: 400 });
  }

  const fecha = new Date(parsed.data.fecha_inicio);
  if (Number.isNaN(fecha.getTime())) {
    return Response.json({ error: "Fecha no válida" }, { status: 400 });
  }

  // Resolve related ids (respect provided ids)
  let juego_id: string | null = parsed.data.juego_id ?? null;
  if (!juego_id && parsed.data.tcg_juego) {
    const { data: juegoRes, error: juegoErr } = await supabase.rpc("get_or_create_juego", {
      p_key: parsed.data.tcg_juego,
      p_nombre: parsed.data.tcg_juego,
    } as any);
    if (juegoErr) return Response.json({ error: "No se pudo resolver el juego" }, { status: 500 });
    const juegoResAny = juegoRes as any;
    juego_id = Array.isArray(juegoResAny) ? juegoResAny[0]?.id ?? null : juegoResAny?.id ?? null;
  }

  let categoria_id: string | null = parsed.data.categoria_id ?? null;
  if (!categoria_id && parsed.data.categoria) {
    const { data: categoriaRes, error: categoriaErr } = await supabase.rpc("get_or_create_categoria", {
      p_key: parsed.data.categoria,
      p_nombre: parsed.data.categoria,
    } as any);
    if (categoriaErr) return Response.json({ error: "No se pudo resolver la categoría" }, { status: 500 });
    const categoriaResAny = categoriaRes as any;
    categoria_id = Array.isArray(categoriaResAny) ? categoriaResAny[0]?.id ?? null : categoriaResAny?.id ?? null;
  }

  const { data: ciudadRes, error: ciudadErr } = await supabase.rpc("get_or_create_ciudad", { p_nombre: parsed.data.ciudad } as any);
  if (ciudadErr) return Response.json({ error: "No se pudo resolver la ciudad" }, { status: 500 });
  const ciudadResAny = ciudadRes as any;
  const ciudad_id = Array.isArray(ciudadResAny) ? ciudadResAny[0]?.id ?? null : ciudadResAny?.id ?? null;

  const { data, error } = await supabase
    .from("torneos")
    .update({
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion,
      juego_id,
      categoria_id,
      ciudad_id,
      direccion: parsed.data.direccion,
      fecha_inicio: fecha.toISOString(),
      cupo_maximo: parsed.data.cupo_maximo,
      costo_entrada: parsed.data.costo_entrada,
      publicado: parsed.data.publicado ?? false,
      latitud: parsed.data.latitud ?? null,
      longitud: parsed.data.longitud ?? null,
      imagen_url: parsed.data.imagen_url || null,
    } as any)
    .eq("id", parsedId.data)
    .select()
    .single();

  if (error) {
    return Response.json({ error: "No se pudo actualizar el torneo" }, { status: 400 });
  }

  return Response.json({ data }, { status: 200 });
}
