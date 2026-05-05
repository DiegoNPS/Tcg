"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

const createTiendaSchema = z.object({
  nombre: z.string().trim().min(1).max(200),
  ciudad: z.string().trim().min(1).max(200),
});

export type CreateTiendaState = { fieldErrors?: Record<string, string>; error?: string };

export async function createTienda(_prev: CreateTiendaState, formData: FormData) {
  const { supabase, user } = await requireAuthenticatedUser("/tienda/crear");

  const parsed = createTiendaSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
      const first = v?.[0];
      if (first) fieldErrors[k] = first;
    }
    return { fieldErrors } as CreateTiendaState;
  }

  // Insert tienda; RLS requires auth.uid() = owner_id so client insert works when authenticated.
  const { error } = await supabase.from("tiendas").insert({
    owner_id: user.id,
    nombre: parsed.data.nombre,
    ciudad: parsed.data.ciudad,
  });

  if (error) {
    // Unique constraint or other DB error
    return { error: error.message ?? "No se pudo crear la tienda" } as CreateTiendaState;
  }

  revalidatePath("/tienda/dashboard");
  redirect("/tienda/dashboard");
}
