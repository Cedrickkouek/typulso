import { createHash, randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import { getPool } from "../../db";

export class ServiceError extends Error {
  constructor(
    public code: string,
    public status = 400,
  ) {
    super(code);
  }
}
export const secret = () => randomBytes(32).toString("base64url");
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const appUrl = () => (process.env.APP_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
export function checkOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(appUrl()).origin) throw new ServiceError("invalid_origin", 403);
}
export async function limited(
  key: string,
  maximum: number,
  seconds: number,
  client?: PoolClient,
): Promise<void> {
  const query = client || getPool();
  const result = await query.query<{ count: number }>(
    `INSERT INTO rate_limits(key,window_start,count) VALUES($1,now(),1)
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.window_start<now()-($2::integer*interval '1 second') THEN 1 ELSE rate_limits.count+1 END,
      window_start=CASE WHEN rate_limits.window_start<now()-($2::integer*interval '1 second') THEN now() ELSE rate_limits.window_start END RETURNING count`,
    [digest(key), seconds],
  );
  if (result.rows[0].count > maximum) throw new ServiceError("rate_limited", 429);
}
export function requestKey(request: Request): string {
  // Forwarded addresses are accepted only behind an explicitly trusted reverse proxy.
  return process.env.TRUST_PROXY === "true"
    ? (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim().slice(0, 64)
    : "local";
}
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new ServiceError("invalid_json");
  const source = await request.text();
  if (source.length > 16000) throw new ServiceError("payload_too_large", 413);
  try {
    const body = JSON.parse(source);
    if (!body || Array.isArray(body) || typeof body !== "object") throw new Error();
    return body;
  } catch {
    throw new ServiceError("invalid_json");
  }
}
export function username(value: unknown): string {
  if (typeof value !== "string") throw new ServiceError("invalid_username");
  const name = value.trim().normalize("NFC");
  if (!/^[\p{L}\p{N}_-]{3,24}$/u.test(name)) throw new ServiceError("invalid_username");
  return name;
}
export function password(value: unknown): string {
  if (typeof value !== "string" || value.length < 10 || value.length > 128)
    throw new ServiceError("invalid_password");
  return value;
}
export function errorCode(error: unknown): string {
  if (error instanceof ServiceError) return error.code;
  if (
    error instanceof Error &&
    "code" in error &&
    typeof error.code === "string" &&
    /^[A-Za-z_]+$/.test(error.code)
  )
    return error.code.toLowerCase();
  return "service_unavailable";
}
