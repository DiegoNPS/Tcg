import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const updateProfileSchema = z.object({
  display_name: z.string().trim().optional(),
  user_role: z.enum(["jugador", "tienda"]).optional(),
});

export async function PUT(request: Request) {
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

  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const toUpsert: Record<string, unknown> = { user_id: user.id };
  if (parsed.data.display_name !== undefined) toUpsert.display_name = parsed.data.display_name;
  if (parsed.data.user_role !== undefined) toUpsert.user_role = parsed.data.user_role;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(toUpsert, { onConflict: ["user_id"] })
    .select()
    .single();

  if (error) {
    return Response.json({ error: "No se pudo actualizar el perfil" }, { status: 400 });
  }

  return Response.json({ data }, { status: 200 });
}
