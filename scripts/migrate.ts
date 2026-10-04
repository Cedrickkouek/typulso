import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getPool, transaction } from "../db";

const directory = resolve(process.cwd(), "db/migrations");
await getPool().query(
  "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
);
for (const name of (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort()) {
  await transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(84671230)");
    if ((await client.query("SELECT 1 FROM schema_migrations WHERE name=$1", [name])).rowCount)
      return;
    await client.query(await readFile(resolve(directory, name), "utf8"));
    await client.query("INSERT INTO schema_migrations(name) VALUES($1)", [name]);
    console.log(`Applied ${name}`);
  });
}
await getPool().end();
