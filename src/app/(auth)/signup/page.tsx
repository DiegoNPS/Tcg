import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { SignupForm } from "@/components/forms/signup-form";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/auth/routes";

type SignupPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

function sanitizeNextPath(value: string | string[] | undefined) {
  const nextValue = Array.isArray(value) ? value[0] : value;

  if (!nextValue || !nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  return nextValue;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-8 sm:py-10 lg:py-14">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-10%] h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute right-[-8%] top-[18%] h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute bottom-[-14%] left-[24%] h-96 w-96 rounded-full bg-emerald-200/25 blur-3xl" />
      </div>

      <div className="relative w-full space-y-6">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 self-center rounded-full border border-zinc-300 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600 shadow-sm backdrop-blur">
            <Sparkles className="size-3.5" />
            Registro de nuevo jugador
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Crea tu cuenta para ser parte de la comunidad.
            </h1>
            <p className="mx-auto max-w-3xl text-sm leading-7 text-zinc-600 sm:text-base">
              Regístrate con Google o correo y empieza a explorar torneos, tiendas y nuevas oportunidades dentro de la plataforma.
            </p>
          </div>
        </header>

        <div className="mx-auto h-px w-full max-w-5xl bg-zinc-300/80" />

        <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white/90 p-6 shadow-[0_22px_60px_rgba(24,24,27,0.12)] backdrop-blur sm:p-8">
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Datos de acceso
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                Regístrate en segundos.
              </h2>
            </div>

            <SignupForm nextPath={nextPath} />

            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
              <span>No tienes cuenta aún?</span>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-zinc-900 underline underline-offset-4"
              >
                Iniciar sesión
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
