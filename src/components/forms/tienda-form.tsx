"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-rose-600">{message}</span>;
}

export function TiendaForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const nombre = formData.get("nombre") as string;
    const ciudad = formData.get("ciudad") as string;

    try {
      const response = await fetch("/api/tiendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, ciudad }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400 && data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        } else {
          setError(data.error || "No se pudo crear la tienda");
        }
        setIsPending(false);
        return;
      }

      router.push("/tienda/dashboard?created=1");
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm max-w-xl">
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Nombre de la tienda</span>
        <input required name="nombre" placeholder="Mi tienda" className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none" />
        <FieldError message={fieldErrors?.nombre} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Ciudad</span>
        <input required name="ciudad" placeholder="Ciudad" className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none" />
        <FieldError message={fieldErrors?.ciudad} />
      </label>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
        >
          {isPending ? "Creando…" : "Crear tienda"}
        </button>
      </div>
    </form>
  );
}

export default TiendaForm;
