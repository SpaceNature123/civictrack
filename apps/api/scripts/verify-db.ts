import * as dotenv from 'dotenv';
import { Pool } from 'pg';

const envPaths = [require('path').resolve(process.cwd(), '.env')];
for (const p of envPaths) { dotenv.config({ path: p }); if (process.env['DATABASE_URL']) break; }

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: process.env['DATABASE_URL'], ssl: { rejectUnauthorized: false } });

  // Row counts
  const counts = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM wards)          AS wards,
      (SELECT COUNT(*) FROM departments)    AS departments,
      (SELECT COUNT(*) FROM users)          AS users,
      (SELECT COUNT(*) FROM issues)         AS issues,
      (SELECT COUNT(*) FROM status_history) AS status_history,
      (SELECT COUNT(*) FROM upvotes)        AS upvotes,
      (SELECT COUNT(*) FROM escalations)    AS escalations
  `);
  console.log('\n📊 Row counts:');
  console.table(counts.rows[0]);

  // Indexes on issues table
  const indexes = await pool.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'issues'
    ORDER BY indexname
  `);
  console.log('\n🗂  Indexes on issues table:');
  for (const r of indexes.rows as Array<{indexname: string; indexdef: string}>) {
    console.log(`  ${r.indexname}:\n    ${r.indexdef}`);
  }

  // Migrations applied
  const migs = await pool.query(`SELECT name, timestamp FROM typeorm_migrations ORDER BY timestamp`);
  console.log('\n✅ Applied migrations:');
  console.table(migs.rows);

  await pool.end();
}

main().catch((e: unknown) => { console.error(e); process.exit(1); });
