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
  titulo: z.string().trim().min(1).max(100),
  descripcion: z.string().trim().min(1).max(1200),
  tcg_juego: z.enum(TCG_VALUES),
  categoria: z.enum(CATEGORIA_VALUES),
  ciudad: z.string().trim().min(1).max(100),
  direccion: z.string().trim().min(1).max(500),
  fecha_inicio: z.string().min(1, "La fecha es requerida"),
  cupo_maximo: z.coerce.number().int().min(2, "Mínimo 2 jugadores").max(1024),
  costo_entrada: z.coerce.number().min(0, "No puede ser negativo").max(1_000_000),
  publicado: z.coerce.boolean().optional(),
  latitud: z.coerce.number().optional(),
  longitud: z.coerce.number().optional(),
  imagen_url: z.string().optional(),
});

export type CrearTorneoState = {
  fieldErrors?: Partial<Record<keyof z.infer<typeof crearTorneoSchema>, string>>;
  error?: string;
};

export async function crearTorneo(
  _prev: CrearTorneoState,
  formData: FormData,
): Promise<CrearTorneoState> {
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
    return { error: "Error al verificar la tienda. Intenta nuevamente." };
  }

  if (!tienda) {
    redirect("/tienda/dashboard?error=sin-tienda");
  }

  const parsed = crearTorneoSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    const fieldErrors: CrearTorneoState["fieldErrors"] = {};
    for (const [key, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
      const first = issues?.[0];
      if (first) fieldErrors[key as keyof typeof fieldErrors] = first;
    }
    return { fieldErrors };
  }

  const fecha = new Date(parsed.data.fecha_inicio);

  if (Number.isNaN(fecha.getTime())) {
    return { fieldErrors: { fecha_inicio: "Fecha no válida" } };
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
    publicado: parsed.data.publicado ?? false,
    latitud: parsed.data.latitud ?? null,
    longitud: parsed.data.longitud ?? null,
    imagen_url: parsed.data.imagen_url || null,
  });

  if (error) {
    return { error: "No se pudo crear el torneo. Intenta nuevamente." };
  }

  revalidatePath("/");
  revalidatePath("/tienda/dashboard");
  redirect("/tienda/dashboard?created=1");
}
