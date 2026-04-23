"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { CATEGORIA_OPTIONS, TCG_OPTIONS } from "@/lib/constants";

type TorneosFiltersProps = {
  initialValues: {
    juego: string;
    categoria: string;
    ciudad: string;
  };
};

export function TorneosFilters({ initialValues }: TorneosFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    startTransition(() => {
      router.replace(nextUrl);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.replace(pathname);
    });
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Juego</span>
          <select
            defaultValue={initialValues.juego}
            onChange={(event) => updateParam("juego", event.target.value)}
            className="rounded-xl border border-zinc-300 px-3 py-2 outline-none transition focus:border-zinc-900"
          >
            <option value="">Todos</option>
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
            defaultValue={initialValues.categoria}
            onChange={(event) => updateParam("categoria", event.target.value)}
            className="rounded-xl border border-zinc-300 px-3 py-2 outline-none transition focus:border-zinc-900"
          >
            <option value="">Todas</option>
            {CATEGORIA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Ciudad</span>
          <input
            defaultValue={initialValues.ciudad}
            onBlur={(event) => updateParam("ciudad", event.target.value.trim())}
            placeholder="Ej: Madrid"
            className="rounded-xl border border-zinc-300 px-3 py-2 outline-none transition focus:border-zinc-900"
          />
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </section>
  );
}
