import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const createTiendaSchema = z.object({
  nombre: z.string().trim().min(1).max(200),
  ciudad: z.string().trim().min(1).max(200),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const parsed = createTiendaSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Datos de tienda inválidos" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tiendas")
    .insert({
      owner_id: user.id,
      nombre: parsed.data.nombre,
      ciudad: parsed.data.ciudad,
    })
    .select("id, owner_id, nombre, ciudad, created_at, updated_at")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ data }, { status: 201 });
}