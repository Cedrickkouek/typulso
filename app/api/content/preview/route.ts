import { generateText, validateSettings } from "../../../../lib/domain";
import { requireSession } from "../../../../lib/server/auth";
import { handle, json } from "../../../../lib/server/http";
import { checkOrigin, limited, readJson } from "../../../../lib/server/security";
export async function POST(request: Request) {
  return handle(async () => {
    checkOrigin(request);
    const session = await requireSession(request);
    await limited(`preview:${session.actorId}`, 30, 60);
    const body = await readJson(request);
    const settings = validateSettings(body.settings);
    return json({ text: generateText(settings), settings });
  });
}
