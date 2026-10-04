import { randomUUID } from "node:crypto";
import {
  CodeChallengeMethod,
  Discord,
  OAuth2Client,
  generateCodeVerifier,
  generateState,
} from "arctic";
import { NextResponse } from "next/server";
import { getPool, transaction } from "../../db";
import { cookieValue, issueSession } from "./auth";
import { withSession } from "./http";
import { appUrl, digest, limited, secret, ServiceError } from "./security";

type Provider = "github" | "discord";
export const oauthAvailability = () => ({
  github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  discord: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
});
function provider(value: string): Provider {
  if ((value !== "github" && value !== "discord") || !oauthAvailability()[value])
    throw new ServiceError("oauth_unavailable", 404);
  return value;
}
function client(p: Provider) {
  const redirect = `${appUrl()}/api/auth/oauth/${p}/callback`;
  return p === "discord"
    ? new Discord(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_CLIENT_SECRET!, redirect)
    : new OAuth2Client(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!, redirect);
}
export async function beginOAuth(value: string, key: string): Promise<NextResponse> {
  const p = provider(value);
  await limited(`oauth:${key}`, 20, 600);
  const state = generateState(),
    verifier = generateCodeVerifier(),
    binding = secret();
  await getPool().query(
    "INSERT INTO oauth_states(state_hash,provider,verifier,binding_hash,expires_at) VALUES($1,$2,$3,$4,now()+interval '10 minutes')",
    [digest(state), p, verifier, digest(binding)],
  );
  const c = client(p);
  const url =
    c instanceof Discord
      ? c.createAuthorizationURL(state, verifier, ["identify"])
      : c.createAuthorizationURLWithPKCE(
          "https://github.com/login/oauth/authorize",
          state,
          CodeChallengeMethod.S256,
          verifier,
          ["read:user"],
        );
  const response = NextResponse.redirect(url);
  response.cookies.set(`typulso_oauth_${p}`, binding, {
    httpOnly: true,
    secure: new URL(appUrl()).protocol === "https:",
    sameSite: "lax",
    path: `/api/auth/oauth/${p}`,
    maxAge: 600,
  });
  return response;
}
export async function finishOAuth(value: string, request: Request): Promise<NextResponse> {
  const p = provider(value),
    url = new URL(request.url),
    state = url.searchParams.get("state"),
    code = url.searchParams.get("code"),
    binding = cookieValue(request, `typulso_oauth_${p}`);
  if (!state || !code || !binding || state.length > 128 || code.length > 1024)
    throw new ServiceError("invalid_oauth_state", 401);
  const row = (
    await getPool().query(
      "DELETE FROM oauth_states WHERE state_hash=$1 AND provider=$2 AND binding_hash=$3 AND expires_at>now() RETURNING verifier",
      [digest(state), p, digest(binding)],
    )
  ).rows[0];
  if (!row) throw new ServiceError("invalid_oauth_state", 401);
  const c = client(p);
  const tokens =
    c instanceof Discord
      ? await c.validateAuthorizationCode(code, row.verifier)
      : await c.validateAuthorizationCode(
          "https://github.com/login/oauth/access_token",
          code,
          row.verifier,
        );
  const info = await fetch(
    p === "github" ? "https://api.github.com/user" : "https://discord.com/api/users/@me",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
        Accept: "application/json",
        "User-Agent": "Typulso",
      },
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!info.ok) throw new ServiceError("oauth_failed", 401);
  const profile = (await info.json()) as {
    id?: string | number;
    login?: string;
    username?: string;
  };
  if (!profile.id) throw new ServiceError("oauth_failed", 401);
  const session = await transaction(async (db) => {
    // Provider identity, never display name or e-mail, determines account ownership.
    await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${p}:${profile.id}`]);
    const existing = (
      await db.query("SELECT user_id FROM auth_identities WHERE provider=$1 AND subject=$2", [
        p,
        String(profile.id),
      ])
    ).rows[0];
    let id = existing?.user_id;
    if (!id) {
      id = randomUUID();
      const base =
        (profile.login || profile.username || p)
          .normalize("NFC")
          .replace(/[^\p{L}\p{N}_-]/gu, "")
          .slice(0, 15) || p;
      const name = `${base}_${id.slice(0, 8)}`;
      await db.query("INSERT INTO users(id,username,username_key) VALUES($1,$2,$3)", [
        id,
        name,
        name.toLocaleLowerCase("fr"),
      ]);
      await db.query("INSERT INTO actors(id,user_id,username,kind) VALUES($1,$1,$2,'account')", [
        id,
        name,
      ]);
      await db.query("INSERT INTO auth_identities(provider,subject,user_id) VALUES($1,$2,$3)", [
        p,
        String(profile.id),
        id,
      ]);
    }
    return issueSession(id, "account", db);
  });
  const response = withSession(NextResponse.redirect(`${appUrl()}/`), session.token, "account");
  response.cookies.set(`typulso_oauth_${p}`, "", { path: `/api/auth/oauth/${p}`, maxAge: 0 });
  return response;
}
