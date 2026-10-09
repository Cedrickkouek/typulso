import { generateText, validateSettings } from "../../../../lib/domain";
import { requireSession } from "../../../../lib/server/auth";
import { handle, json } from "../../../../lib/server/http";
import { checkOrigin, limited, readJson, ServiceError } from "../../../../lib/server/security";
import { previewSchema } from "../../../../lib/validation";
export async function POST(request: Request) {
  return handle(async () => {
    checkOrigin(request);
    const session = await requireSession(request);
    await limited(`preview:${session.actorId}`, 30, 60);
    const body = previewSchema.safeParse(await readJson(request));
    if (!body.success) throw new ServiceError("invalid_settings");
    const settings = validateSettings(body.data.settings);
    return json({ text: generateText(settings), settings });
  });
}
