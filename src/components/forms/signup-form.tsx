"use client";

import { Mail, Send, ShieldCheck, KeyRound } from "lucide-react";
import { useState, useTransition } from "react";

import { AUTH_CALLBACK_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";

type SignupFormProps = {
  nextPath: string;
};

export function SignupForm({ nextPath }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const buildCallbackUrl = () => {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const callbackUrl = new URL(AUTH_CALLBACK_PATH, base);
    callbackUrl.searchParams.set("next", nextPath);
    return callbackUrl.toString();
  };

  const handleGoogleSignup = () => {
    setMessage(null);

    startTransition(async () => {
      try {
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: buildCallbackUrl(),
          },
        });

        if (error) {
          setMessage("No se pudo continuar con Google. Intenta nuevamente.");
        }
      } catch {
        setMessage("Faltan variables de entorno de Supabase. Configura .env.local y vuelve a intentar.");
      }
    });
  };

  const handlePasswordSignup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        const supabase = createClient();

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: buildCallbackUrl(),
          },
        });

        if (error) {
          setMessage("No se pudo crear la cuenta. Verifica tus datos.");
          return;
        }

        setMessage("Cuenta creada. Revisa tu correo para verificar y continuar.");
      } catch {
        setMessage("Faltan variables de entorno de Supabase. Configura .env.local y vuelve a intentar.");
      }
    });
  };

  const handleMagicLink = () => {
    setMessage(null);

    startTransition(async () => {
      try {
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: buildCallbackUrl(),
          },
        });

        if (error) {
          setMessage("No se pudo enviar el enlace. Revisa el correo e intenta nuevamente.");
          return;
        }

        setMessage("Te enviamos un enlace magico. Abre tu correo para continuar.");
      } catch {
        setMessage("Faltan variables de entorno de Supabase. Configura .env.local y vuelve a intentar.");
      }
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <ShieldCheck className="size-4" />
        {isPending ? "Conectando..." : "Registrarse con Google"}
      </button>

      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-zinc-200" />
        <span>o crea cuenta con correo</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={handlePasswordSignup} className="space-y-4">
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
          Contrasena
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimo 6 caracteres"
            className="w-full rounded-xl border border-zinc-300 px-10 py-2.5 text-sm outline-none ring-offset-2 transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
          <Send className="size-4" />
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleMagicLink}
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Send className="size-4" />
        {isPending ? "Enviando enlace..." : "Enviar enlace magico"}
      </button>

      {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
    </div>
  );
}
