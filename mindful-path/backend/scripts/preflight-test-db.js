import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../.env.test.db"), override: true });

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

console.log("preflight-db: ok");
