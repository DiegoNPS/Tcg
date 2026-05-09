"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

type GameCarouselItem = {
  label: string;
  href: string;
  backgroundImage: string;
};

type GameCarouselProps = {
  items: GameCarouselItem[];
};

export function GameCarousel({ items }: GameCarouselProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!listRef.current) return;

    const { clientWidth } = listRef.current;
    const delta = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;

    listRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={listRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            aria-label={`Ver torneos de ${item.label}`}
            className="group relative h-44 min-w-[220px] snap-start overflow-hidden rounded-2xl border border-zinc-200 transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md sm:min-w-[240px]"
            href={item.href}
            style={{
              backgroundImage: item.backgroundImage,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            title={item.label}
          >
            <span className="sr-only">{item.label}</span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="Anterior"
        className="absolute left-0 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 p-2 text-zinc-700 shadow-sm transition hover:bg-white sm:flex"
        onClick={() => scrollByAmount("left")}
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        className="absolute right-0 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 p-2 text-zinc-700 shadow-sm transition hover:bg-white sm:flex"
        onClick={() => scrollByAmount("right")}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
