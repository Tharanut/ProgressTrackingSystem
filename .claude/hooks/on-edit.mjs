#!/usr/bin/env node
// PostToolUse hook (Write|Edit) — lints, formats, and unit-tests edited src/**/*.ts(x) files.
// Reads the Claude Code hook input JSON from stdin; see .claude/settings.json.
import { execSync } from "node:child_process";

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath) process.exit(0);

  const normalized = filePath.replace(/\\/g, "/");
  const isSrcTypeScript = /(^|\/)src\/.*\.tsx?$/.test(normalized);
  if (!isSrcTypeScript) process.exit(0);

  const run = (label, command) => {
    try {
      execSync(command, { stdio: "inherit" });
    } catch {
      console.error(`[on-edit hook] ${label} reported issues for ${filePath}`);
    }
  };

  run("eslint --fix", `npx eslint --fix "${filePath}"`);
  run("prettier --write", `npx prettier --write "${filePath}"`);
  run("unit tests", `npm run test:unit --silent`);

  // Never block the edit flow — this hook is informational, not a gate.
  process.exit(0);
});
