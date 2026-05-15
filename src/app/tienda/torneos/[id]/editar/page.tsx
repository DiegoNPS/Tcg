import { notFound, redirect } from "next/navigation";

import { TorneoForm } from "@/components/forms/torneo-form";
import { LOGIN_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

type EditarTorneoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarTorneoPage({ params }: EditarTorneoPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(LOGIN_PATH);

  const { data: torneo } = await supabase
    .from("torneos")
    .select(
      "*, tienda:tiendas(owner_id), juego:juegos(id, key, nombre), categoria:categorias_torneo(id, key, nombre)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!torneo) notFound();

  const tienda = Array.isArray(torneo.tienda) ? torneo.tienda[0] : torneo.tienda;
  if (tienda?.owner_id !== user.id) notFound();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Editar torneo</h1>
        <p className="text-sm text-zinc-600">{torneo.titulo}</p>
      </header>

      <TorneoForm
        mode="edit"
        defaults={{
          id,
          titulo: torneo.titulo,
          descripcion: torneo.descripcion,
          tcg_juego: (torneo.juego?.key as import("@/types/database.types").TcgJuego) ?? undefined,
          categoria: (torneo.categoria?.key as import("@/types/database.types").CategoriaTorneo) ?? undefined,
          direccion: torneo.direccion,
          fecha_inicio: torneo.fecha_inicio,
          cupo_maximo: torneo.cupo_maximo,
          costo_entrada: torneo.costo_entrada,
          publicado: torneo.publicado,
          latitud: torneo.latitud,
          longitud: torneo.longitud,
          imagen_url: torneo.imagen_url,
        }}
      />
    </main>
  );
}
