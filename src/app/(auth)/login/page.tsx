import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

function sanitizeNextPath(value: string | string[] | undefined) {
  const nextValue = Array.isArray(value) ? value[0] : value;

  if (!nextValue || !nextValue.startsWith("/")) {
    return "/tienda/dashboard";
  }

  return nextValue;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Accede a TCG Torneos</h1>
          <p className="text-sm text-zinc-600">
            Inicia sesion con enlace magico. No necesitas contrasena.
          </p>
        </div>

        <LoginForm nextPath={nextPath} />

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
