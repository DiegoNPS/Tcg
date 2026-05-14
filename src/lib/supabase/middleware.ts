import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database.types";

import { DEFAULT_POST_LOGIN_PATH, LOGIN_PATH, SIGNUP_PATH } from "@/lib/auth/routes";
import { getSupabaseEnv } from "./config";

const PRIVATE_PREFIXES = ["/tienda", "/admin"];

function isPrivateRoute(pathname: string) {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function redirectToLogin(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = LOGIN_PATH;
  redirectUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(redirectUrl);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getSupabaseEnv();

  if (!env) {
    if (isPrivateRoute(request.nextUrl.pathname)) {
      return redirectToLogin(request);
    }

    return response;
  }

  const supabase = createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: {
        name: string;
        value: string;
        options: CookieOptions;
      }[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isPrivateRoute(pathname) && !user) {
    return redirectToLogin(request);
  }

  if (pathname === LOGIN_PATH && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = DEFAULT_POST_LOGIN_PATH;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === SIGNUP_PATH && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = DEFAULT_POST_LOGIN_PATH;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
