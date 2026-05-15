import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { TiendaForm } from "@/components/forms/tienda-form";

export const metadata = {
  title: "Crear tienda",
};

export default async function CrearTiendaPage() {
  // Cualquier usuario autenticado puede crear una tienda.
  await requireAuthenticatedUser("/tienda/crear");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10">
      <header className="mb-6">
        <p className="text-sm font-medium text-zinc-500">Tienda</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Crear tu tienda</h1>
        <p className="text-sm text-zinc-600">Crea una tienda para publicar torneos y gestionar tu panel.</p>
      </header>

      <TiendaForm />
    </main>
  );
}
