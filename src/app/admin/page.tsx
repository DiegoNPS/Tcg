import Link from "next/link";

import { AdminGameForm } from "@/components/forms/admin-game-form";
import createAdminClient from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/guards";

type StatCardProps = {
  label: string;
  value: string | number;
  description: string;
};

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
      <p className="mt-1 text-sm text-zinc-600">{description}</p>
    </article>
  );
}

export default async function AdminPage() {
  await requireAdmin();

  const admin = createAdminClient();

  if (!admin) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Panel de administración</h1>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Configura `SUPABASE_SERVICE_ROLE` para cargar métricas y usuarios del sistema.
        </p>
      </main>
    );
  }

  const [profilesCount, tiendasCount, torneosCount, entriesCount, gamesCount, { data: usersData }, { data: juegosData }] = await Promise.all([
    admin.from("profiles").select("user_id", { count: "exact", head: true }),
    admin.from("tiendas").select("id", { count: "exact", head: true }),
    admin.from("torneos").select("id", { count: "exact", head: true }),
    admin.from("tournament_entries").select("id", { count: "exact", head: true }),
    admin.from("juegos").select("id", { count: "exact", head: true }),
    admin.auth.admin.listUsers({ page: 1, perPage: 8 }),
    admin.from("juegos").select("id, key, nombre, descripcion, created_at").order("nombre", { ascending: true }),
  ]);

  const recentUsers = usersData?.users ?? [];
  const juegos = juegosData ?? [];

  const recentTorneos = await admin
    .from("torneos")
    .select("id, titulo, publicado, fecha_inicio, tienda_id")
    .order("created_at", { ascending: false })
    .limit(5);

  const recentStores = await admin
    .from("tiendas")
    .select("id, nombre, ciudad_id, owner_id")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Administración</p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Panel de control</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Supervisa usuarios, tiendas, torneos e inscripciones. Este panel usa el client de servicio del servidor.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Refrescar panel
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Usuarios" value={profilesCount.count ?? 0} description="Perfiles registrados en `profiles`" />
        <StatCard label="Tiendas" value={tiendasCount.count ?? 0} description="Tiendas creadas por usuarios" />
        <StatCard label="Torneos" value={torneosCount.count ?? 0} description="Eventos creados en la plataforma" />
        <StatCard label="Inscripciones" value={entriesCount.count ?? 0} description="Entradas registradas en torneos" />
        <StatCard label="Juegos" value={gamesCount.count ?? 0} description="Catálogo disponible para torneos" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Catálogo de juegos</h2>
          </div>
          <div className="space-y-4 px-4 py-4">
            <AdminGameForm actionLabel="Crear juego" />
            <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200">
              {juegos.length ? (
                juegos.map((juego) => (
                  <div key={juego.id} className="px-4 py-3 text-sm">
                    <p className="font-medium text-zinc-900">{juego.nombre}</p>
                    <p className="text-zinc-600">{juego.key}{juego.descripcion ? ` · ${juego.descripcion}` : ""}</p>
                  </div>
                ))
              ) : (
                <p className="px-4 py-6 text-sm text-zinc-600">Todavía no hay juegos cargados.</p>
              )}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Usuarios recientes</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentUsers.length ? (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-zinc-900">{user.email ?? "Sin email"}</p>
                    <p className="text-zinc-600">{user.created_at ? new Date(user.created_at).toLocaleString("es-ES") : "Sin fecha"}</p>
                  </div>
                  <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    {user.email_confirmed_at ? "Confirmado" : "Pendiente"}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-zinc-600">No hay usuarios para mostrar.</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Torneos recientes</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentTorneos.data?.length ? (
              recentTorneos.data.map((torneo) => {
                const tienda = recentStores.data?.find((t) => t.id === torneo.tienda_id);
                return (
                  <div key={torneo.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-zinc-900">{torneo.titulo}</p>
                      <p className="text-zinc-600">{tienda?.nombre ?? "Tienda independiente"} · {new Date(torneo.fecha_inicio).toLocaleString("es-ES")}</p>
                    </div>
                    <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600">
                      {torneo.publicado ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="px-4 py-6 text-sm text-zinc-600">No hay torneos para mostrar.</p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Tiendas recientes</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentStores.data?.length ? (
              recentStores.data.map((tienda) => (
                <div key={tienda.id} className="px-4 py-3 text-sm">
                  <p className="font-medium text-zinc-900">{tienda.nombre}</p>
                  <p className="text-zinc-600">{tienda.ciudad_id ?? "-"}</p>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-zinc-600">No hay tiendas para mostrar.</p>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">Acciones recomendadas</h2>
        </div>
        <div className="space-y-3 px-4 py-4 text-sm text-zinc-700">
          <p>• Revisar usuarios nuevos y asignarles `jugador`, `tienda` o `admin`.</p>
          <p>• Verificar torneos borrador antes de publicarlos.</p>
          <p>• Monitorear inscripciones y detectar duplicados o abuso.</p>
          <p>• Auditar tiendas inactivas o sin torneos publicados.</p>
        </div>
      </section>
    </main>
  );
}

