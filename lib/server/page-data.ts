import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { SESSION_COOKIE, sessionForToken } from "./auth";
import { oauthAvailability } from "./oauth";
import { errorCode } from "./security";
import type { SessionData } from "../../types/game";
import type { ApiSeed } from "../client/api";

// React cache only deduplicates within this server render, never across visitors.
export const pageSession = cache(async () =>
  sessionForToken((await cookies()).get(SESSION_COOKIE)?.value ?? null),
);
export async function initialSession(): Promise<{
  session: SessionData | null;
  error: string | null;
}> {
  try {
    const session = await pageSession();
    return { session: { user: session?.user ?? null, oauth: oauthAvailability() }, error: null };
  } catch (error) {
    unstable_rethrow(error);
    return { session: null, error: errorCode(error) };
  }
}
export async function pageData<T>(
  url: string,
  scope: string,
  load: () => Promise<T>,
): Promise<ApiSeed<T>> {
  try {
    return { url, scope, data: await load(), error: null };
  } catch (error) {
    unstable_rethrow(error);
    return { url, scope, data: null, error: errorCode(error) };
  }
}
