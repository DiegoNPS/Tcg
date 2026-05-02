import { redirect } from "next/navigation";

import { TorneoForm } from "@/components/forms/torneo-form";
import { createClient } from "@/lib/supabase/server";

export default async function NuevoTorneoPage() {

  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    supabase = await createClient();
  } catch {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
        <h1 className="text-2xl font-bold text-zinc-900">Nuevo torneo</h1>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para habilitar esta funcion.
        </p>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/tienda/nuevo-torneo");
  }

  const { data: tienda } = await supabase
    .from("tiendas")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tienda) {
    redirect("/tienda/dashboard?error=sin-tienda");
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Publicar torneo</h1>
        <p className="text-sm text-zinc-600">
          Completa los datos del evento. El torneo aparecera en la home publica al publicarlo.
        </p>
      </header>

      <TorneoForm />
    </main>
  );
}
