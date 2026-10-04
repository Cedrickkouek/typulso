import { logout } from "../../../../lib/server/auth";
import { clearSession, handle, json } from "../../../../lib/server/http";
import { checkOrigin } from "../../../../lib/server/security";
export async function POST(request: Request) {
  return handle(async () => {
    checkOrigin(request);
    await logout(request);
    return clearSession(json({ ok: true }));
  });
}
