import { crearTorneo } from "@/actions/crearTorneo";
import { CATEGORIA_OPTIONS, TCG_OPTIONS } from "@/lib/constants";

type TorneoFormProps = {
  errorMessage?: string;
};

export function TorneoForm({ errorMessage }: TorneoFormProps) {
  return (
    <form action={crearTorneo} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {errorMessage ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Titulo</span>
          <input
            required
            name="titulo"
            minLength={4}
            maxLength={100}
            placeholder="Liga de Sabado"
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Fecha y hora</span>
          <input
            required
            name="fecha_inicio"
            type="datetime-local"
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Descripcion</span>
        <textarea
          required
          name="descripcion"
          minLength={10}
          maxLength={1200}
          rows={4}
          placeholder="Detalles del torneo, premios y formato."
          className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Juego</span>
          <select
            required
            name="tcg_juego"
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          >
            {TCG_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Categoria</span>
          <select
            required
            name="categoria"
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          >
            {CATEGORIA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Ciudad</span>
          <input
            required
            name="ciudad"
            minLength={2}
            maxLength={100}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Direccion</span>
          <input
            required
            name="direccion"
            minLength={5}
            maxLength={180}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Cupo maximo</span>
          <input
            required
            type="number"
            name="cupo_maximo"
            min={2}
            max={1024}
            defaultValue={32}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Costo de entrada</span>
          <input
            required
            type="number"
            name="costo_entrada"
            min={0}
            step="0.01"
            defaultValue={0}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          />
        </label>
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
      >
        Publicar torneo
      </button>
    </form>
  );
}
