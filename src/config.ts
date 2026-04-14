import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

function readStoredToken(): string | null {
  try {
    const configPath = join(homedir(), ".manycontacts", "config.json");
    const data = JSON.parse(readFileSync(configPath, "utf-8"));
    return data["cli-token"] || null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return process.env.MC_CLI_TOKEN || readStoredToken();
}

export function getApiUrl(): string {
  return process.env.MC_API_URL || "https://api.manycontacts.com";
}
