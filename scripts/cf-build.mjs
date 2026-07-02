import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

async function main() {
  const patchTarget = require.resolve(
    "@opennextjs/cloudflare/dist/cli/build/bundle-server.js"
  );

  const original = await readFile(patchTarget, "utf8");

  const patched = original.replace(
    `external: ["./middleware/handler.mjs"]`,
    `external: ["./middleware/handler.mjs", "sharp-*"]`
  );

  if (original === patched) {
    console.error("Patch pattern not found — maybe already applied or OpenNext version changed?");
    process.exit(1);
  }

  await writeFile(patchTarget, patched, "utf8");
  console.log("✓ Patched bundle-server.js to externalize sharp-*");

  const args = process.argv.slice(2).join(" ");
  const cmd = `npx @opennextjs/cloudflare build ${args}`;
  console.log(`→ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
