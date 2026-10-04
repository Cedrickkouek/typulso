import { sessionForRequest } from "../../../lib/server/auth";
import { handle, json } from "../../../lib/server/http";
import { oauthAvailability } from "../../../lib/server/oauth";
export async function GET(request: Request) {
  return handle(async () =>
    json({ user: (await sessionForRequest(request))?.user || null, oauth: oauthAvailability() }),
  );
}
