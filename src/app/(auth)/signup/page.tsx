import Link from "next/link";

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
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Crea tu cuenta</h1>
          <p className="text-sm text-zinc-600">Registra tu cuenta con Google o correo.</p>
        </div>

        <SignupForm nextPath={nextPath} />

        <p className="text-sm text-zinc-600">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline underline-offset-4">
            Inicia sesion
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
