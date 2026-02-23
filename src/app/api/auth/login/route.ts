import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_CREDENTIALS,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_VALUE,
  AUTH_COOKIE_MAX_AGE,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (
    username === AUTH_CREDENTIALS.username &&
    password === AUTH_CREDENTIALS.password
  ) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  }

  return NextResponse.json(
    { success: false, error: "Invalid credentials" },
    { status: 401 }
  );
}
