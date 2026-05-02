"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { crearTorneo, type CrearTorneoState } from "@/actions/crearTorneo";
import { type EditarTorneoState } from "@/actions/editarTorneo";
import { DireccionAutocomplete } from "@/components/ui/direccion-autocomplete";
import { ImagenUpload } from "@/components/ui/imagen-upload";
import { CATEGORIA_OPTIONS, TCG_OPTIONS } from "@/lib/constants";
import type { CategoriaTorneo, TcgJuego } from "@/types/database.types";

type TorneoDefaults = {
  titulo?: string;
  descripcion?: string;
  tcg_juego?: TcgJuego;
  categoria?: CategoriaTorneo;
  direccion?: string;
  fecha_inicio?: string;
  cupo_maximo?: number;
  costo_entrada?: number;
  publicado?: boolean;
  latitud?: number | null;
  longitud?: number | null;
  imagen_url?: string | null;
};

type CreateProps = {
  mode?: "create";
  action?: never;
  defaults?: never;
};

type EditProps = {
  mode: "edit";
  action: (prev: EditarTorneoState, formData: FormData) => Promise<EditarTorneoState>;
  defaults: TorneoDefaults;
};

type TorneoFormProps = CreateProps | EditProps;

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <button
        type="submit"
        name="publicado"
        value="true"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Publicar torneo"}
      </button>
      <button
        type="submit"
        name="publicado"
        value="false"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar borrador"}
      </button>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-rose-600">{message}</span>;
}

const initialState: CrearTorneoState = {};

export function TorneoForm({ mode = "create", action, defaults }: TorneoFormProps) {
  const resolvedAction = mode === "edit" && action ? action : crearTorneo;
  const [state, formAction] = useActionState(resolvedAction, initialState);
  const fe = state.fieldErrors ?? {};

  // Format date for datetime-local input
  const defaultFecha = defaults?.fecha_inicio
    ? new Date(defaults.fecha_inicio).toISOString().slice(0, 16)
    : undefined;

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      {state.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Titulo</span>
          <input
            required
            name="titulo"
            defaultValue={defaults?.titulo}
            placeholder="Liga de Sabado"
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
            aria-invalid={!!fe.titulo || undefined}
          />
          <FieldError message={fe.titulo} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Fecha y hora</span>
          <input
            required
            name="fecha_inicio"
            type="datetime-local"
            defaultValue={defaultFecha}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
            aria-invalid={!!fe.fecha_inicio || undefined}
          />
          <FieldError message={fe.fecha_inicio} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Descripcion</span>
        <textarea
          required
          name="descripcion"
          rows={4}
          defaultValue={defaults?.descripcion}
          placeholder="Detalles del torneo, premios y formato."
          className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
          aria-invalid={!!fe.descripcion || undefined}
        />
        <FieldError message={fe.descripcion} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Juego</span>
          <select
            required
            name="tcg_juego"
            defaultValue={defaults?.tcg_juego}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          >
            {TCG_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError message={fe.tcg_juego} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Categoria</span>
          <select
            required
            name="categoria"
            defaultValue={defaults?.categoria}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          >
            {CATEGORIA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError message={fe.categoria} />
        </label>
      </div>

      <DireccionAutocomplete
        error={fe.direccion}
        defaultValue={defaults?.direccion}
        defaultLat={defaults?.latitud ?? undefined}
        defaultLng={defaults?.longitud ?? undefined}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Cupo maximo</span>
          <input
            required
            type="number"
            name="cupo_maximo"
            min={2}
            max={1024}
            defaultValue={defaults?.cupo_maximo ?? 32}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
            aria-invalid={!!fe.cupo_maximo || undefined}
          />
          <FieldError message={fe.cupo_maximo} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Costo de entrada</span>
          <input
            required
            type="number"
            name="costo_entrada"
            min={0}
            step="0.01"
            defaultValue={defaults?.costo_entrada ?? 0}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
            aria-invalid={!!fe.costo_entrada || undefined}
          />
          <FieldError message={fe.costo_entrada} />
        </label>
      </div>

      <ImagenUpload defaultValue={defaults?.imagen_url} />

      <SubmitButton mode={mode} />
    </form>
  );
}
