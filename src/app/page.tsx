import Link from "next/link";

import { GameCarousel } from "@/components/home/game-carousel";
import { TCG_OPTIONS } from "@/lib/constants";

export default function HomePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const storageBase = supabaseUrl
    ? `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/tcg`
    : "";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-14">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Torneo hub
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
          Encuentra tu proximo torneo TCG
        </h1>
        <p className="max-w-2xl text-sm text-zinc-600">
          Explora los eventos por juego, revisa las fechas y encuentra la tienda que esta organizando cada torneo.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-400"
            href="/torneos"
          >
            Ver todos los torneos
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
            href="/torneos?juego=pokemon"
          >
            Torneos Pokemon
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-900">Elige tu juego</h2>
          <p className="text-sm text-zinc-600">
            Filtra automaticamente por el TCG que quieres jugar.
          </p>
        </div>
        <div className="mt-4">
          <GameCarousel
            items={TCG_OPTIONS.map((option) => {
              const imageUrl = storageBase ? `${storageBase}/${option.value}.jpg` : "";
              const backgroundImage = imageUrl
                ? `linear-gradient(180deg, rgba(9, 9, 11, 0.15) 0%, rgba(9, 9, 11, 0.55) 100%), url(${imageUrl})`
                : "linear-gradient(160deg, rgba(24, 24, 27, 0.9) 0%, rgba(63, 63, 70, 0.85) 100%)";

              return {
                label: option.label,
                href: `/torneos?juego=${encodeURIComponent(option.value)}`,
                backgroundImage,
              };
            })}
          />
        </div>
      </section>
    </main>
  );
}
