"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const torneoIdSchema = z.string().uuid();

export async function inscribirJugador(torneoId: string) {
  const parsedId = torneoIdSchema.safeParse(torneoId);

  if (!parsedId.success) {
    redirect("/?inscripcion=torneo-invalido");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/?torneo=${torneoId}`)}`);
  }

  const nombreJugador =
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name.trim()) ||
    user.email ||
    "Jugador";

  const { error } = await supabase.from("inscripciones").insert({
    torneo_id: parsedId.data,
    jugador_id: user.id,
    nombre_jugador: nombreJugador,
    estado: "confirmada",
  });

  if (error) {
    if (error.code === "23505") {
      redirect("/?inscripcion=existente");
    }

    redirect("/?inscripcion=error");
  }

  revalidatePath("/");
  redirect("/?inscripcion=ok");
}
