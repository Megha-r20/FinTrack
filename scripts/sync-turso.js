import { createClient } from "@libsql/client";
import { execSync } from "child_process";
import path from "path";

try {
  process.loadEnvFile?.();
} catch {}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment.");
  process.exit(1);
}

async function syncTurso() {
  console.log(`🌐 Connecting to Turso database: ${url}...`);
  const client = createClient({ url, authToken });

  console.log("📝 Generating schema diff SQL...");
  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script",
    { encoding: "utf-8" }
  );

  console.log("🚀 Applying schema to Turso...");
  await client.executeMultiple(sql);
  console.log("✅ Turso database schema successfully synced!");
}

syncTurso().catch((err) => {
  console.error("❌ Error syncing Turso schema:", err);
  process.exit(1);
});
