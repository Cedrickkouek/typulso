import { createRealtimeTicket, requireSession } from "../../../lib/server/auth";
import { handle, json } from "../../../lib/server/http";
import { checkOrigin } from "../../../lib/server/security";
export async function POST(request: Request) {
  return handle(async () => {
    checkOrigin(request);
    return json(await createRealtimeTicket(await requireSession(request)));
  });
}
