import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const idSchema = z.string().uuid();

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const parsed = idSchema.safeParse(id);

  if (!parsed.success) {
    return Response.json({ error: "ID de torneo inválido" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: torneo, error } = await supabase
    .from("torneos")
    .select(
      "id, tienda_id, titulo, descripcion, tcg_juego, categoria, ciudad, direccion, fecha_inicio, cupo_maximo, costo_entrada, imagen_url, latitud, longitud, publicado",
    )
    .eq("id", parsed.data)
    .maybeSingle();

  if (error) {
    return Response.json({ error: "No se pudo consultar el torneo" }, { status: 500 });
  }

  if (!torneo || !torneo.publicado) {
    return Response.json({ error: "Torneo no encontrado" }, { status: 404 });
  }

  const { data: tienda } = await supabase
    .from("tiendas")
    .select("nombre")
    .eq("id", torneo.tienda_id)
    .maybeSingle();

  return Response.json(
    {
      data: {
        ...torneo,
        tienda_nombre: tienda?.nombre ?? null,
      },
    },
    { status: 200 },
  );
}