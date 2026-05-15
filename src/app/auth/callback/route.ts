import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_POST_LOGIN_PATH, LOGIN_PATH } from "@/lib/auth/routes";
import { resolvePostLoginPath } from "@/lib/auth/post-login";
import { createClient } from "@/lib/supabase/server";

function sanitizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  return value;
}

function buildLoginRedirect(baseUrl: string, nextPath: string) {
  const loginUrl = new URL(LOGIN_PATH, baseUrl);
  loginUrl.searchParams.set("next", nextPath);
  loginUrl.searchParams.set("error", "callback");
  return loginUrl;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next");
  const hasNext = requestUrl.searchParams.has("next");
  const nextPath = sanitizeNextPath(rawNext);
  const appBase = process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin;

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        return NextResponse.redirect(buildLoginRedirect(appBase, nextPath));
      }

      if (!hasNext) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const resolvedPath = await resolvePostLoginPath(supabase, user.id);
          return NextResponse.redirect(new URL(resolvedPath, appBase));
        }
      }
    } catch {
      return NextResponse.redirect(buildLoginRedirect(appBase, nextPath));
    }
  }

  return NextResponse.redirect(new URL(nextPath, appBase));
}
