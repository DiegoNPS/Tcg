import { Home, LayoutDashboard, PlusCircle, Shield, Store, Ticket, Trophy } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/actions/auth";
import { LOGIN_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  let userEmail: string | null = null;
  let isTienda = false;
  let isAdmin = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    userEmail = user?.email ?? null;

    if (user) {
      const [{ data: tienda }, { data: profile }] = await Promise.all([
        supabase.from("tiendas").select("id").eq("owner_id", user.id).maybeSingle(),
        supabase.from("profiles").select("user_role").eq("user_id", user.id).maybeSingle(),
      ]);

      isTienda = Boolean(tienda);
      isAdmin = profile?.user_role === "admin";
    }
  } catch {
    userEmail = null;
    isTienda = false;
    isAdmin = false;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <Trophy className="size-4" />
          TCG Torneos
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-zinc-700 transition hover:bg-zinc-100"
          >
            <Home className="size-4" />
            Home
          </Link>

          <Link
            href="/torneos"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-zinc-700 transition hover:bg-zinc-100"
          >
            <Ticket className="size-4" />
            Torneos
          </Link>

          {isTienda ? (
            <>
              <Link
                href="/tienda/dashboard"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-zinc-700 transition hover:bg-zinc-100"
              >
                <Store className="size-4" />
                Dashboard
              </Link>
              <Link
                href="/tienda/nuevo-torneo"
                className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2 py-1.5 font-medium text-white transition hover:bg-zinc-700"
              >
                <PlusCircle className="size-4" />
                Nuevo torneo
              </Link>
            </>
          ) : null}

          {isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-zinc-700 transition hover:bg-zinc-100"
            >
              <LayoutDashboard className="size-4" />
              Admin
            </Link>
          ) : null}

          {!userEmail ? (
            <Link
              href={LOGIN_PATH}
              className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2 py-1.5 font-medium text-white transition hover:bg-zinc-700"
            >
              <Shield className="size-4" />
              Iniciar sesion
            </Link>
          ) : (
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 px-2 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Cerrar sesion
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
