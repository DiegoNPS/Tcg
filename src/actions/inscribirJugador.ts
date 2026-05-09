"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth/guards";

const torneoIdSchema = z.string().uuid();

export async function inscribirJugador(torneoId: string) {
  const parsedId = torneoIdSchema.safeParse(torneoId);

  if (!parsedId.success) {
    redirect("/torneos?inscripcion=torneo-invalido");
  }

  const { supabase, user } = await requireAuthenticatedUser(
    `/torneos?torneo=${parsedId.data}`,
  );

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
      redirect("/torneos?inscripcion=existente");
    }

    redirect("/torneos?inscripcion=error");
  }

  revalidatePath("/torneos");
  redirect("/torneos?inscripcion=ok");
}
