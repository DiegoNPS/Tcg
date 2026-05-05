"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createTienda, type CreateTiendaState } from "@/actions/createTienda";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-rose-600">{message}</span>;
}

const initialState: CreateTiendaState = {};

export function TiendaForm() {
  const [state, action] = useActionState(createTienda, initialState);
  const { pending } = useFormStatus();

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm max-w-xl">
      {state.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Nombre de la tienda</span>
        <input required name="nombre" placeholder="Mi tienda" className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none" />
        <FieldError message={state.fieldErrors?.nombre} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Ciudad</span>
        <input required name="ciudad" placeholder="Ciudad" className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none" />
        <FieldError message={state.fieldErrors?.ciudad} />
      </label>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
        >
          {pending ? "Creando…" : "Crear tienda"}
        </button>
      </div>
    </form>
  );
}

export default TiendaForm;
