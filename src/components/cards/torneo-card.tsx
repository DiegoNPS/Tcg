import { CalendarClock, MapPin, Store, Ticket } from "lucide-react";
import Link from "next/link";

import { inscribirJugador } from "@/actions/inscribirJugador";

type TorneoCardModel = {
  id: string;
  titulo: string;
  descripcion: string;
  tcg_juego: string;
  categoria: string;
  ciudad: string;
  direccion: string;
  fecha_inicio: string;
  cupo_maximo: number;
  costo_entrada: number;
  tiendaNombre: string;
};

type TorneoCardProps = {
  torneo: TorneoCardModel;
  canInscribirse: boolean;
  yaInscripto: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "full",
  timeStyle: "short",
});

export function TorneoCard({ torneo, canInscribirse, yaInscripto }: TorneoCardProps) {
  const formAction = inscribirJugador.bind(null, torneo.id);
  const fecha = new Date(torneo.fecha_inicio);
  const loginHref = `/login?next=${encodeURIComponent(`/?torneo=${torneo.id}`)}`;

  return (
    <article className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          <span className="rounded-full bg-zinc-100 px-2 py-1">{torneo.tcg_juego}</span>
          <span className="rounded-full bg-zinc-100 px-2 py-1">{torneo.categoria}</span>
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">{torneo.titulo}</h2>
        <p className="text-sm text-zinc-600">{torneo.descripcion}</p>
      </header>

      <dl className="space-y-2 text-sm text-zinc-700">
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 size-4 text-zinc-500" />
          <div>
            <dt className="font-medium">Fecha</dt>
            <dd>{Number.isFinite(fecha.getTime()) ? dateFormatter.format(fecha) : "Por definir"}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 text-zinc-500" />
          <div>
            <dt className="font-medium">Ubicacion</dt>
            <dd>{`${torneo.ciudad} - ${torneo.direccion}`}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Store className="mt-0.5 size-4 text-zinc-500" />
          <div>
            <dt className="font-medium">Tienda organizadora</dt>
            <dd>{torneo.tiendaNombre}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Ticket className="mt-0.5 size-4 text-zinc-500" />
          <div>
            <dt className="font-medium">Entrada</dt>
            <dd>{torneo.costo_entrada === 0 ? "Gratis" : `$${torneo.costo_entrada.toFixed(2)}`}</dd>
          </div>
        </div>
      </dl>

      {yaInscripto ? (
        <p className="text-sm font-medium text-emerald-700">Ya estas inscrito en este torneo.</p>
      ) : null}

      {canInscribirse && !yaInscripto ? (
        <form action={formAction}>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Inscribirme
          </button>
        </form>
      ) : null}

      {!canInscribirse ? (
        <Link href={loginHref} className="text-sm font-medium text-zinc-700 underline underline-offset-4">
          Inicia sesion para inscribirte
        </Link>
      ) : null}
    </article>
  );
}
