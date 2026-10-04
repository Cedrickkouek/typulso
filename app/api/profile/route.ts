import { requireSession } from "../../../lib/server/auth";
import { profile } from "../../../lib/server/rooms";
import { handle, json } from "../../../lib/server/http";
export async function GET(request: Request) {
  return handle(async () => json(await profile(await requireSession(request))));
}
