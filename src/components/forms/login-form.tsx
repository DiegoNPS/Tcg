"use client";

import { Mail, Send } from "lucide-react";
import { useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", nextPath);

        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: callbackUrl.toString(),
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
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
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
      >
        <Send className="size-4" />
        {isPending ? "Enviando enlace..." : "Enviar enlace de acceso"}
      </button>
      {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
    </form>
  );
}
