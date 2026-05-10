import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  getConfiguredPassword,
  makeAuthToken,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LoginBody {
  password?: string;
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { error: "Format request tidak valid." },
      { status: 400 },
    );
  }

  const submitted = typeof body.password === "string" ? body.password : "";
  if (!submitted) {
    return NextResponse.json(
      { error: "Password tidak boleh kosong." },
      { status: 400 },
    );
  }

  const expected = getConfiguredPassword();
  if (submitted !== expected) {
    // Tiny delay to mildly discourage brute force. Not bulletproof; for real
    // brute-force protection add rate limiting (e.g. @upstash/ratelimit).
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json(
      { error: "Password salah. Coba lagi ya!" },
      { status: 401 },
    );
  }

  const token = await makeAuthToken(expected);
  const res = NextResponse.json({ ok: true });

  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });

  return res;
}

export function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed. Gunakan POST." },
    { status: 405 },
  );
}
