import { beginOAuth } from "../../../../../lib/server/oauth";
import { handle } from "../../../../../lib/server/http";
import { requestKey } from "../../../../../lib/server/security";
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  return handle(async () => beginOAuth((await params).provider, requestKey(request)));
}
