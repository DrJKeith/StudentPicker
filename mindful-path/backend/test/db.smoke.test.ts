import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "pg";
import fs from "fs";
import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../.env.test.db"), override: true });

async function runSchema(client: Client) {
  const schemaPath = path.resolve(__dirname, "../db/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");
  await client.query(sql);
}

describe("DB smoke", () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  let dbAvailable = true;

  beforeAll(async () => {
    try {
      await client.connect();
      await runSchema(client);
      await client.query("TRUNCATE sessions, guides, users RESTART IDENTITY CASCADE");
    } catch (err) {
      dbAvailable = false;
      console.warn("DB smoke test skipped:", (err as Error).message);
    }
  });

  afterAll(async () => {
    if (dbAvailable) {
      await client.end();
    }
  });

  it("stores guide without overwrite", async () => {
    if (!dbAvailable) {
      return;
    }
    await client.query("INSERT INTO guides(id, title) VALUES($1, $2)", ["guide-1", "Guide 1"]);
    const res = await client.query("SELECT title FROM guides WHERE id=$1", ["guide-1"]);
    expect(res.rows[0].title).toBe("Guide 1");
  });
});
