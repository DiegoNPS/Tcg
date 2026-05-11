import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/auth/routes";

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>;
};

function sanitizeNextPath(value: string | string[] | undefined) {
  const nextValue = Array.isArray(value) ? value[0] : value;

  if (!nextValue || !nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return "/tienda/dashboard";
  }

  return nextValue;
}

function getErrorMessage(value: string | string[] | undefined) {
  const errorValue = Array.isArray(value) ? value[0] : value;

  if (errorValue === "callback") {
    return "No pudimos completar el inicio de sesión. Verifica tus credenciales o intenta con Google.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next) || DEFAULT_POST_LOGIN_PATH;
  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Accede a TCG Torneos</h1>
          <p className="text-sm text-zinc-600">
            Inicia sesión con tu cuenta (email/contraseña) o con Google.
          </p>
        </div>

        <LoginForm nextPath={nextPath} />

        {errorMessage ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {errorMessage}
          </p>
        ) : null}

        <p className="text-sm text-zinc-600">
          No tienes cuenta?{" "}
          <Link href="/signup" className="font-medium text-zinc-900 underline underline-offset-4">
            Registrate
          </Link>
          .
        </p>

        <p className="text-sm text-zinc-600">
          Volver a{" "}
          <Link href="/" className="font-medium text-zinc-900 underline underline-offset-4">
            torneos publicos
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
