import { spawnSync } from "node:child_process";

const RELATION_ALREADY_EXISTS = /relation\s+"[^"]+"\s+already exists/i;
const JOURNAL_COLLISION = /__drizzle_migrations/;
const DUPLICATE_OR_EXISTS = /(already exists|duplicate key)/i;

export const BACKFILL_SCRIPT = "scripts/backfill-drizzle-migrations.ts";

export type CommandResult = {
  ok: boolean;
  output: string;
};

function combineOutput(
  stdout: string | Buffer | null | undefined,
  stderr: string | Buffer | null | undefined
): string {
  const parts = [stdout, stderr]
    .filter((value): value is string | Buffer => value != null && value !== "")
    .map((value) => (typeof value === "string" ? value : value.toString()));
  return parts.join("\n");
}

export function isMigrationDriftOutput(output: string): boolean {
  const text = output.trim();
  if (text.length === 0) {
    return false;
  }

  if (RELATION_ALREADY_EXISTS.test(text)) {
    return true;
  }

  if (JOURNAL_COLLISION.test(text) && DUPLICATE_OR_EXISTS.test(text)) {
    return true;
  }

  return false;
}

export function runBackfillScript(
  env: NodeJS.ProcessEnv = process.env
): CommandResult {
  const result = spawnSync("pnpm", ["tsx", BACKFILL_SCRIPT], {
    stdio: ["ignore", "pipe", "pipe"],
    env,
    encoding: "utf8",
  });

  const output = combineOutput(result.stdout, result.stderr);
  return {
    ok: result.status === 0,
    output,
  };
}

export function runDbMigrate(
  env: NodeJS.ProcessEnv = process.env
): CommandResult {
  const result = spawnSync("pnpm", ["db:migrate"], {
    stdio: ["ignore", "pipe", "pipe"],
    env,
    encoding: "utf8",
  });

  const output = combineOutput(result.stdout, result.stderr);
  return {
    ok: result.status === 0,
    output,
  };
}
