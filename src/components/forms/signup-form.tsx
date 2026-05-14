"use client";

import { Globe, KeyRound, Mail, Send, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DireccionAutocomplete } from "@/components/ui/direccion-autocomplete";
import { AUTH_CALLBACK_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";

type SignupFormProps = {
  nextPath: string;
};

const countryOptions = [
  "Chile",
  "Argentina",
  "Bolivia",
  "Perú",
  "Colombia",
  "México",
  "España",
  "Estados Unidos",
  "Otro",
];

export function SignupForm({ nextPath }: SignupFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Chile");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [receiveNews, setReceiveNews] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const buildCallbackUrl = () => {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const callbackUrl = new URL(AUTH_CALLBACK_PATH, base);
    callbackUrl.searchParams.set("next", nextPath);
    return callbackUrl.toString();
  };

  const handleGoogleSignup = () => {
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
            setMessage("No se pudo continuar con Google. Intenta nuevamente.");
          }
        })
        .catch(() => {
          setMessage("Faltan variables de entorno de Supabase. Configura .env.local y vuelve a intentar.");
        });
    } catch {
      setMessage("Faltan variables de entorno de Supabase. Configura .env.local y vuelve a intentar.");
    }
  };

  const handleStreetTyping = (value: string, lat: number | null, lng: number | null, currentCity?: string) => {
    setAddress(value);
    setLatitude(lat);
    setLongitude(lng);

    if (currentCity) {
      setCity(currentCity);
      return;
    }

    setCity("");
    setStateRegion("");
    setPostalCode("");
    setCountry("");
  };

  const handleStreetSelection = (place: {
    address: string;
    city: string;
    stateRegion: string;
    postalCode: string;
    country: string;
    lat: number | null;
    lng: number | null;
  }) => {
    setAddress(place.address);
    setCity(place.city);
    setStateRegion(place.stateRegion);
    setPostalCode(place.postalCode);
    setCountry(place.country || "Chile");
    setLatitude(place.lat);
    setLongitude(place.lng);
  };

  const handlePasswordSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!acceptTerms) {
      setMessage("Debes aceptar los términos para crear la cuenta.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          email: email.trim(),
          password: password.trim(),
          address: address.trim(),
          city: city.trim(),
          stateRegion: stateRegion.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          latitude,
          longitude,
          acceptTerms,
          receiveNews,
          nextPath,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(error.error || "No se pudo crear la cuenta. Intenta nuevamente.");
        return;
      }

      const result = (await response.json()) as {
        message?: string;
        redirectTo?: string | null;
      };

      if (result.redirectTo) {
        router.push(result.redirectTo);
        return;
      }

      setMessage(result.message ?? "Cuenta creada.");
      setDisplayName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAddress("");
      setCity("");
      setStateRegion("");
      setPostalCode("");
      setCountry("Chile");
      setLatitude(null);
      setLongitude(null);
      setReceiveNews(false);
    } catch {
      setMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-5 rounded-[1.75rem] border border-zinc-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(24,24,27,0.12)] sm:p-6">
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <ShieldCheck className="size-4" />
        {isPending ? "Conectando..." : "Registrarse con Google"}
      </button>

      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        <span className="h-px flex-1 bg-zinc-200" />
        <span>o crea cuenta con correo</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={handlePasswordSignup} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Datos personales</p>
            </div>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700">Nombre de usuario</span>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  required
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="JugadorGamer24"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-10 py-3 text-sm outline-none ring-offset-2 transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700">Correo electrónico</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-10 py-3 text-sm outline-none ring-offset-2 transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700">Contraseña</span>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-10 py-3 text-sm outline-none ring-offset-2 transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700">Confirmar contraseña</span>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-10 py-3 text-sm outline-none ring-offset-2 transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </label>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Dirección de contacto</p>
            </div>

            <DireccionAutocomplete
              name="address"
              label="Calle y número"
              placeholder="Calle Gran Vía 123, 4º D"
              showMap={false}
              value={address}
              onAddressChange={handleStreetTyping}
              onPlaceChange={handleStreetSelection}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                <span className="font-medium text-zinc-700">Ciudad</span>
                <input
                  required
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Santiago"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none ring-offset-2 transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700">Estado/Región</span>
                <input
                  required
                  value={stateRegion}
                  onChange={(event) => setStateRegion(event.target.value)}
                  placeholder="Región Metropolitana"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none ring-offset-2 transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700">Código postal</span>
                <input
                  required
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  placeholder="28013"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none ring-offset-2 transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                <span className="font-medium text-zinc-700">País</span>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <select
                    required
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="w-full appearance-none rounded-2xl border border-zinc-300 bg-white px-10 py-3 text-sm outline-none ring-offset-2 transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
                  >
                    {countryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
          </section>
        </div>

        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
          <label className="flex items-start gap-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(event) => setAcceptTerms(event.target.checked)}
              className="mt-1 size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span>
              Acepto los <span className="font-medium text-zinc-900">Términos y Condiciones</span> y la <span className="font-medium text-zinc-900">Política de Privacidad</span>.
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={receiveNews}
              onChange={(event) => setReceiveNews(event.target.checked)}
              className="mt-1 size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span>Deseo recibir noticias sobre torneos y eventos.</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
          <Send className="size-4" />
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      {message ? <p className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700">{message}</p> : null}
    </div>
  );
}
