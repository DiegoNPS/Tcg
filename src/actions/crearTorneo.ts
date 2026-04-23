"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

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

const crearTorneoSchema = z.object({
  titulo: z.string().trim().min(4).max(100),
  descripcion: z.string().trim().min(10).max(1200),
  tcg_juego: z.enum(TCG_VALUES),
  categoria: z.enum(CATEGORIA_VALUES),
  ciudad: z.string().trim().min(2).max(100),
  direccion: z.string().trim().min(5).max(180),
  fecha_inicio: z.string().min(1),
  cupo_maximo: z.coerce.number().int().min(2).max(1024),
  costo_entrada: z.coerce.number().min(0).max(1_000_000),
});

export async function crearTorneo(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/tienda/nuevo-torneo");
  }

  const { data: tienda, error: tiendaError } = await supabase
    .from("tiendas")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (tiendaError) {
    throw new Error(tiendaError.message);
  }

  if (!tienda) {
    redirect("/tienda/dashboard?error=sin-tienda");
  }

  const parsed = crearTorneoSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    redirect("/tienda/nuevo-torneo?error=datos-invalidos");
  }

  const fecha = new Date(parsed.data.fecha_inicio);

  if (Number.isNaN(fecha.getTime())) {
    redirect("/tienda/nuevo-torneo?error=fecha-invalida");
  }

  const { error } = await supabase.from("torneos").insert({
    tienda_id: tienda.id,
    titulo: parsed.data.titulo,
    descripcion: parsed.data.descripcion,
    tcg_juego: parsed.data.tcg_juego,
    categoria: parsed.data.categoria,
    ciudad: parsed.data.ciudad,
    direccion: parsed.data.direccion,
    fecha_inicio: fecha.toISOString(),
    cupo_maximo: parsed.data.cupo_maximo,
    costo_entrada: parsed.data.costo_entrada,
    publicado: true,
  });

  if (error) {
    redirect("/tienda/nuevo-torneo?error=no-se-pudo-crear");
  }

  revalidatePath("/");
  revalidatePath("/tienda/dashboard");
  redirect("/tienda/dashboard?created=1");
}
