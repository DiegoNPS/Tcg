"use client";

import { useMemo, useState } from "react";

type TorneoInfo = {
  id: string;
  titulo: string;
  fecha_inicio: string | null;
  tienda_nombre: string | null;
  ciudad: string | null;
  costo_entrada: number | null;
};

type EntryInfo = {
  id: string;
  status: string;
  torneo: TorneoInfo | null;
};

const statusLabels: Record<string, string> = {
  registered: "Registrado",
  waitlisted: "En espera",
  checked_in: "Check-in",
  seeded: "Seeded",
  dropped: "Cancelado",
  eliminated: "Eliminado",
};

const statusClasses: Record<string, string> = {
  registered: "border-emerald-200 text-emerald-700 bg-emerald-50",
  waitlisted: "border-amber-200 text-amber-700 bg-amber-50",
  checked_in: "border-sky-200 text-sky-700 bg-sky-50",
  seeded: "border-indigo-200 text-indigo-700 bg-indigo-50",
  dropped: "border-zinc-200 text-zinc-600 bg-zinc-50",
  eliminated: "border-rose-200 text-rose-700 bg-rose-50",
};

const cancellableStatuses = new Set(["registered", "waitlisted"]);

export function InscripcionesList({ entries }: { entries: EntryInfo[] }) {
  const [items, setItems] = useState<EntryInfo[]>(entries);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);
  const activeEntries = items.filter((entry) => !["dropped", "eliminated"].includes(entry.status));
  const historyEntries = items.filter((entry) => ["dropped", "eliminated"].includes(entry.status));

  const handleCancel = async (entryId: string) => {
    setMessage(null);
    setLoadingId(entryId);

    try {
      const response = await fetch("/api/inscripciones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_id: entryId }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error || "No se pudo cancelar la inscripción.");
        setLoadingId(null);
        return;
      }

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, status: "dropped" } : entry,
        ),
      );
      setMessage("Inscripción cancelada.");
    } catch {
      setMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoadingId(null);
    }
  };

  const renderEntry = (entry: EntryInfo) => {
    const torneo = entry.torneo;
    const fecha = torneo?.fecha_inicio ? new Date(torneo.fecha_inicio) : null;
    const future = fecha ? fecha > now : false;
    const canCancel = cancellableStatuses.has(entry.status) && future;
    const badgeClass = statusClasses[entry.status] ?? "border-zinc-200 text-zinc-600 bg-zinc-50";
    const costoLabel = torneo?.costo_entrada ? `$${torneo.costo_entrada.toLocaleString("es-CL")}` : "Gratis";

    return (
      <li key={entry.id} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-zinc-900">{torneo?.titulo ?? "Torneo eliminado"}</p>
          <p className="text-zinc-600">
            {torneo?.tienda_nombre ?? "Tienda independiente"}
            {torneo?.ciudad ? ` · ${torneo.ciudad}` : ""}
            {fecha ? ` · ${fecha.toLocaleString("es-ES")}` : ""}
          </p>
          <p className="text-xs text-zinc-500">Entrada: {costoLabel}</p>
          {entry.status === "waitlisted" ? (
            <p className="mt-1 text-xs text-amber-700">En espera de cupo. Te avisaremos cuando se libere un lugar.</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass}`}>
            {statusLabels[entry.status] ?? entry.status}
          </span>
          {canCancel ? (
            <button
              type="button"
              onClick={() => handleCancel(entry.id)}
              disabled={loadingId === entry.id}
              className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingId === entry.id ? "Cancelando..." : "Cancelar"}
            </button>
          ) : null}
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
          {message}
        </p>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold text-zinc-900">Activas</h2>
        {activeEntries.length ? (
          <ul className="mt-3 space-y-3">
            {activeEntries.map((entry) => renderEntry(entry))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-600">No tienes inscripciones activas.</p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-900">Historial</h2>
        {historyEntries.length ? (
          <ul className="mt-3 space-y-3">
            {historyEntries.map((entry) => renderEntry(entry))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-600">Aun no tienes historial.</p>
        )}
      </section>
    </div>
  );
}