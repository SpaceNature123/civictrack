import * as dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: process.env['DATABASE_URL'], ssl: { rejectUnauthorized: false } });

  const ver = await pool.query(`SELECT version()`);
  console.log('PG Version:', ver.rows[0]);

  const allExts = await pool.query(`
    SELECT name, installed_version FROM pg_available_extensions ORDER BY name
  `);
  console.log('\nAll available extensions:');
  console.table(allExts.rows);

  await pool.end();
}

main().catch((e: unknown) => { console.error(e); process.exit(1); });
