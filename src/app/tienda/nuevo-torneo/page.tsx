import { requireStore } from "@/lib/auth/guards";
import { TorneoForm } from "@/components/forms/torneo-form";

export default async function NuevoTorneoPage() {
  // Solo tiendas pueden crear torneos
  await requireStore();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Publicar torneo</h1>
        <p className="text-sm text-zinc-600">
          Completa los datos del evento. El torneo aparecera en la home publica al publicarlo!.
        </p>
      </header>

      <TorneoForm />
    </main>
  );
}
