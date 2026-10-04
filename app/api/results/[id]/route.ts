import { requireSession } from "../../../../lib/server/auth";
import { storedResult } from "../../../../lib/server/rooms";
import { handle, json } from "../../../../lib/server/http";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () =>
    json(await storedResult((await params).id, await requireSession(request))),
  );
}
