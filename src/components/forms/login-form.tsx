"use client";

import { Mail, Send, ShieldCheck, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AUTH_CALLBACK_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const buildCallbackUrl = () => {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const callbackUrl = new URL(AUTH_CALLBACK_PATH, base);
    callbackUrl.searchParams.set("next", nextPath);
    return callbackUrl.toString();
  };

  const handleGoogleLogin = () => {
    setMessage(null);

    try {
      const supabase = createClient();

      supabase.auth
        .signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: buildCallbackUrl(),
          },
        })
        .then(({ error }) => {
          if (error) {
            setMessage("No se pudo iniciar con Google. Intenta nuevamente.");
          }
        })
        .catch(() => {
          setMessage("Faltan variables de entorno de Supabase. Configura .env.local y vuelve a intentar.");
        });
    } catch {
      setMessage("Faltan variables de entorno de Supabase. Configura .env.local y vuelve a intentar.");
    }
  };

  const handlePasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(error.error || "No se pudo iniciar sesión. Verifica tus credenciales.");
        setIsPending(false);
        return;
      }

      router.push(nextPath);
    } catch {
      setMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <ShieldCheck className="size-4" />
        {isPending ? "Conectando..." : "Continuar con Google"}
      </button>

      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-zinc-200" />
        <span>o inicia sesión con correo</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={handlePasswordLogin} className="space-y-4">
        <label className="block text-sm font-medium text-zinc-700" htmlFor="email">
          Correo
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu-correo@ejemplo.com"
            className="w-full rounded-xl border border-zinc-300 px-10 py-2.5 text-sm outline-none ring-offset-2 transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <label className="block text-sm font-medium text-zinc-700" htmlFor="password">
          Contraseña
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tu contraseña"
            className="w-full rounded-xl border border-zinc-300 px-10 py-2.5 text-sm outline-none ring-offset-2 transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
          <Send className="size-4" />
          {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
    </div>
  );
}
