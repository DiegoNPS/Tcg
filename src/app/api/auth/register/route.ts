import { z } from "zod";

import { AUTH_CALLBACK_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  nextPath: z.string().optional(),
});

function sanitizeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Datos de registro inválidos" }, { status: 400 });
  }

  const supabase = await createClient();
  const appBase = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const callbackUrl = new URL(AUTH_CALLBACK_PATH, appBase);
  callbackUrl.searchParams.set("next", sanitizeNextPath(parsed.data.nextPath));

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(
    {
      message: "Cuenta creada. Revisa tu correo para verificar la cuenta.",
    },
    { status: 201 },
  );
}