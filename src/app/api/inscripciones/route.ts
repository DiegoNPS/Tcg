import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const inscripcionSchema = z.object({
  torneo_id: z.string().uuid(),
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

  const parsed = inscripcionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Datos de inscripción inválidos" }, { status: 400 });
  }

  const nombreJugador =
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name.trim()) ||
    user.email ||
    "Jugador";

  const { data, error } = await supabase
    .from("inscripciones")
    .insert({
      torneo_id: parsed.data.torneo_id,
      jugador_id: user.id,
      nombre_jugador: nombreJugador,
      estado: "confirmada",
    })
    .select("id, torneo_id, jugador_id, nombre_jugador, estado, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "Ya estabas inscrito en este torneo" }, { status: 409 });
    }

    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ data }, { status: 201 });
}