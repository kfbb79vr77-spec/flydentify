// One-time migration: add trial columns to users table
import Database from "better-sqlite3";

const db = new Database("data.db");
db.pragma("journal_mode = WAL");

const cols = db.prepare("PRAGMA table_info(users)").all() as any[];
const colNames = cols.map((c: any) => c.name);

if (!colNames.includes("trial_started_at")) {
  db.exec("ALTER TABLE users ADD COLUMN trial_started_at INTEGER");
  console.log("Added trial_started_at");
}
if (!colNames.includes("trial_ends_at")) {
  db.exec("ALTER TABLE users ADD COLUMN trial_ends_at INTEGER");
  console.log("Added trial_ends_at");
}

// Backfill existing users: treat createdAt as trial start, expire in 7 days from now
// (gives existing beta users a fresh 7-day window rather than immediately locking them out)
const now = Math.floor(Date.now() / 1000);
const trialEndsAt = now + 7 * 24 * 60 * 60;
db.exec(`
  UPDATE users
  SET
    trial_started_at = created_at,
    trial_ends_at    = ${trialEndsAt},
    subscription_status = CASE
      WHEN subscription_status = 'active' THEN 'active'
      ELSE 'trialing'
    END
  WHERE trial_started_at IS NULL
`);
console.log("Backfilled existing users with 7-day trial window");
db.close();
