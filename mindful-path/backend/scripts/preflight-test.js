import { config } from "dotenv";

let envPath;
if (process.env.NODE_ENV === "test") {
  envPath = new URL("../.env.test", import.meta.url).pathname;
} else if (process.env.NODE_ENV === "test-db") {
  envPath = new URL("../.env.test.db", import.meta.url).pathname;
}
config({ path: envPath, override: true });

function assertEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing required env var: ${name}`);
  }
}

assertEnv("SESSION_SECRET");
assertEnv("DATABASE_URL");
if (process.env.MOCK_ELEVENLABS !== "true") {
  assertEnv("ELEVENLABS_API_KEY");
}

console.log("preflight: ok");
