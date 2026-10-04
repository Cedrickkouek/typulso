import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";

// Next traces server dependencies; standalone deployments also need these static assets.
const standalone = join(process.cwd(), ".next", "standalone");
await mkdir(join(standalone, ".next"), { recursive: true });
await cp(join(process.cwd(), "public"), join(standalone, "public"), { recursive: true });
await cp(join(process.cwd(), ".next", "static"), join(standalone, ".next", "static"), {
  recursive: true,
});
