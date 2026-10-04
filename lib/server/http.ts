import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { appUrl, errorCode, ServiceError } from "./security";
import { SESSION_COOKIE } from "./auth";

export function json(value: unknown, status = 200): NextResponse {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });
}
export async function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (error) {
    unstable_rethrow(error);
    if (
      !(error instanceof ServiceError) &&
      !(
        error instanceof Error &&
        "code" in error &&
        typeof error.code === "string" &&
        /^[a-z_]+$/.test(error.code)
      )
    )
      console.error("API request failed", error instanceof Error ? error.message : error);
    return json(
      { error: errorCode(error) },
      error instanceof ServiceError
        ? error.status
        : errorCode(error) === "service_unavailable"
          ? 503
          : 400,
    );
  }
}
export function withSession(response: NextResponse, token: string, kind: "account" | "guest") {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: new URL(appUrl()).protocol === "https:",
    sameSite: "lax",
    path: "/",
    ...(kind === "account" ? { maxAge: 30 * 86400 } : {}),
  });
  return response;
}
export function clearSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
