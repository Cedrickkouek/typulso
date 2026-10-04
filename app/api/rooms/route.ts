import { listRooms } from "../../../lib/server/rooms";
import { handle, json } from "../../../lib/server/http";
export async function GET() {
  return handle(async () => json({ rooms: await listRooms() }));
}
