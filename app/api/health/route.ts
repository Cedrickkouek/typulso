import { databaseHealthy } from "../../../db";
import { json } from "../../../lib/server/http";
export async function GET() {
  const database = await databaseHealthy();
  return json({ ok: database, database, service: "web" }, database ? 200 : 503);
}
