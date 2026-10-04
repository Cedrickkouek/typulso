import { finishOAuth } from "../../../../../../lib/server/oauth";
import { handle } from "../../../../../../lib/server/http";
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  return handle(async () => finishOAuth((await params).provider, request));
}
