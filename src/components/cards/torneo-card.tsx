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
  imagen_url?: string | null;
  latitud?: number | null;
  longitud?: number | null;
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
  const loginHref = `/login?next=${encodeURIComponent(`/torneos?torneo=${torneo.id}`)}`;
  const latitud = torneo.latitud ?? null;
  const longitud = torneo.longitud ?? null;
  const hasCoordinates = typeof latitud === "number" && typeof longitud === "number";
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const mapsEmbedUrl = hasCoordinates && mapsApiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${mapsApiKey}&center=${latitud},${longitud}&zoom=15&maptype=roadmap`
    : "";
  const mapsLink = hasCoordinates
    ? `https://www.google.com/maps?q=${latitud},${longitud}`
    : "";
  const backgroundImage = torneo.imagen_url
    ? `linear-gradient(160deg, rgba(9, 9, 11, 0.65) 0%, rgba(9, 9, 11, 0.55) 40%, rgba(9, 9, 11, 0.85) 100%), url(${torneo.imagen_url})`
    : "linear-gradient(160deg, rgba(24, 24, 27, 0.95) 0%, rgba(63, 63, 70, 0.85) 55%, rgba(9, 9, 11, 0.95) 100%)";

  return (
    <article
      className="relative space-y-3 overflow-hidden rounded-2xl border border-zinc-200 shadow-sm"
      style={{
        backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative space-y-3 p-4 text-white">
        <header className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-white/80">
            <span className="rounded-full bg-white/15 px-2 py-0.5">{torneo.tcg_juego}</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5">{torneo.categoria}</span>
          </div>
          <h2 className="text-base font-semibold text-white">{torneo.titulo}</h2>
          <p className="text-xs text-white/80">{torneo.descripcion}</p>
        </header>

        <dl className="space-y-1.5 text-xs text-white/85">
          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 text-white/70" />
            <div>
              <dt className="font-medium text-white/90">Fecha</dt>
              <dd>{Number.isFinite(fecha.getTime()) ? dateFormatter.format(fecha) : "Por definir"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 text-white/70" />
            <div>
              <dt className="font-medium text-white/90">Ubicacion</dt>
              <dd>{`${torneo.ciudad} - ${torneo.direccion}`}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Store className="mt-0.5 size-4 text-white/70" />
            <div>
              <dt className="font-medium text-white/90">Tienda organizadora</dt>
              <dd>{torneo.tiendaNombre}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Ticket className="mt-0.5 size-4 text-white/70" />
            <div>
              <dt className="font-medium text-white/90">Entrada</dt>
              <dd>{torneo.costo_entrada === 0 ? "Gratis" : `$${torneo.costo_entrada.toFixed(2)}`}</dd>
            </div>
          </div>
        </dl>

        {mapsEmbedUrl ? (
          <iframe
            title={`Mapa ${torneo.titulo}`}
            className="h-32 w-full rounded-xl border border-white/20"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapsEmbedUrl}
          />
        ) : null}

        {!mapsEmbedUrl && mapsLink ? (
          <a
            className="text-xs font-medium text-white underline underline-offset-4"
            href={mapsLink}
            rel="noreferrer"
            target="_blank"
          >
            Ver en Google Maps
          </a>
        ) : null}

        {yaInscripto ? (
          <p className="text-xs font-medium text-emerald-200">Ya estas inscrito en este torneo.</p>
        ) : null}

        {canInscribirse && !yaInscripto ? (
          <form action={formAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-white/90"
            >
              Inscribirme
            </button>
          </form>
        ) : null}

        {!canInscribirse ? (
          <Link href={loginHref} className="text-xs font-medium text-white underline underline-offset-4">
            Inicia sesion para inscribirte
          </Link>
        ) : null}
      </div>
    </article>
  );
}
