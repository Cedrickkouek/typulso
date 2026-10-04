import { register } from "../../../../lib/server/auth";
import { handle, json, withSession } from "../../../../lib/server/http";
import { checkOrigin, readJson, requestKey } from "../../../../lib/server/security";
export async function POST(request: Request) {
  return handle(async () => {
    checkOrigin(request);
    const result = await register(await readJson(request), requestKey(request));
    return withSession(json({ user: result.user }, 201), result.token, result.kind);
  });
}
