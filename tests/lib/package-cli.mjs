import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT } from "./state-contracts.mjs";

// Execute pinned JS entrypoints with an argument array; never concatenate a cmd.exe command.
export function packageCli(name, args, options = {}) {
  const directory = resolve(ROOT, "node_modules", name);
  const manifest = JSON.parse(readFileSync(resolve(directory, "package.json"), "utf8"));
  const bin = typeof manifest.bin === "string" ? manifest.bin : manifest.bin[name];
  if (!bin) throw new Error(`No CLI entrypoint for ${name}; run npm ci first`);
  return execFileSync(process.execPath, [resolve(directory, bin), ...args], {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options, shell: false,
  });
}
