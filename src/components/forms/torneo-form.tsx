"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DireccionAutocomplete } from "@/components/ui/direccion-autocomplete";
import { ImagenUpload } from "@/components/ui/imagen-upload";
import { CATEGORIA_OPTIONS, TCG_OPTIONS } from "@/lib/constants";
import type { CategoriaTorneo, TcgJuego } from "@/types/database.types";

type TorneoDefaults = {
  id?: string;
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
  defaults?: never;
};

type EditProps = {
  mode: "edit";
  defaults: TorneoDefaults;
};

type TorneoFormProps = CreateProps | EditProps;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-rose-600">{message}</span>;
}

export function TorneoForm({ mode = "create", defaults }: TorneoFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [titulo, setTitulo] = useState(defaults?.titulo || "");
  const [descripcion, setDescripcion] = useState(defaults?.descripcion || "");
  const [tcgJuego, setTcgJuego] = useState(defaults?.tcg_juego || "pokemon");
  const [categoria, setCategoria] = useState(defaults?.categoria || "casual");
  const [direccion, setDireccion] = useState(defaults?.direccion || "");
  const [latitud, setLatitud] = useState(defaults?.latitud ?? null);
  const [longitud, setLongitud] = useState(defaults?.longitud ?? null);
  const [ciudad, setCiudad] = useState("");
  const [fechaInicio, setFechaInicio] = useState(
    defaults?.fecha_inicio ? new Date(defaults.fecha_inicio).toISOString().slice(0, 16) : "",
  );
  const [cupoMaximo, setCupoMaximo] = useState(defaults?.cupo_maximo ?? 32);
  const [costoEntrada, setCostoEntrada] = useState(defaults?.costo_entrada ?? 0);
  const [imagenUrl, setImagenUrl] = useState(defaults?.imagen_url || "");

  const handleDireccionChange = (addr: string, lat: number | null, lng: number | null, ciudad?: string) => {
    setDireccion(addr);
    setLatitud(lat);
    setLongitud(lng);
    if (ciudad) {
      setCiudad(ciudad);
    }
  };

  const handleSubmit = async (
    event: React.FormEvent,
    publicar: boolean,
  ) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsPending(true);

    const payload = {
      titulo,
      descripcion,
      tcg_juego: tcgJuego,
      categoria,
      ciudad,
      direccion,
      fecha_inicio: fechaInicio,
      cupo_maximo: Number(cupoMaximo),
      costo_entrada: Number(costoEntrada),
      publicado: publicar,
      latitud,
      longitud,
      imagen_url: imagenUrl || null,
    };

    try {
      const url =
        mode === "create"
          ? "/api/torneos/crear"
          : `/api/torneos/${defaults?.id}/editar`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        } else {
          setError(data.error || "No se pudo guardar el torneo");
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
    <form className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Titulo</span>
          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Liga de Sabado"
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
            aria-invalid={!!fieldErrors.titulo || undefined}
          />
          <FieldError message={fieldErrors.titulo} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Fecha y hora</span>
          <input
            required
            type="datetime-local"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
            aria-invalid={!!fieldErrors.fecha_inicio || undefined}
          />
          <FieldError message={fieldErrors.fecha_inicio} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Descripcion</span>
        <textarea
          required
          rows={4}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalles del torneo, premios y formato."
          className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
          aria-invalid={!!fieldErrors.descripcion || undefined}
        />
        <FieldError message={fieldErrors.descripcion} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Juego</span>
          <select
            required
            value={tcgJuego}
            onChange={(e) => setTcgJuego(e.target.value as TcgJuego)}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          >
            {TCG_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.tcg_juego} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Categoria</span>
          <select
            required
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaTorneo)}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900"
          >
            {CATEGORIA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.categoria} />
        </label>
      </div>

      <DireccionAutocomplete
        error={fieldErrors.direccion}
        defaultValue={defaults?.direccion}
        defaultLat={defaults?.latitud ?? undefined}
        defaultLng={defaults?.longitud ?? undefined}
        onAddressChange={handleDireccionChange}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Cupo maximo</span>
          <input
            required
            type="number"
            min={2}
            max={1024}
            value={cupoMaximo}
            onChange={(e) => setCupoMaximo(Number(e.target.value))}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
            aria-invalid={!!fieldErrors.cupo_maximo || undefined}
          />
          <FieldError message={fieldErrors.cupo_maximo} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Costo de entrada</span>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={costoEntrada}
            onChange={(e) => setCostoEntrada(Number(e.target.value))}
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
            aria-invalid={!!fieldErrors.costo_entrada || undefined}
          />
          <FieldError message={fieldErrors.costo_entrada} />
        </label>
      </div>

      <ImagenUpload defaultValue={defaults?.imagen_url} onUpload={setImagenUrl} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
        >
          {isPending ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Publicar torneo"}
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
        >
          {isPending ? "Guardando…" : "Guardar borrador"}
        </button>
      </div>
    </form>
  );
}
