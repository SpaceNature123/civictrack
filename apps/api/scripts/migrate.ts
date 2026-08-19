// Migration runner script — called by npm scripts
import 'reflect-metadata';
import { AppDataSource } from '../src/database/data-source';

async function runMigrations(): Promise<void> {
  await AppDataSource.initialize();
  const migrations = await AppDataSource.runMigrations({ transaction: 'all' });
  if (migrations.length === 0) {
    console.log('✅ All migrations already applied — nothing to run');
  } else {
    console.log('✅ Applied migrations:');
    for (const m of migrations) {
      console.log(`   → ${m.name}`);
    }
  }
  await AppDataSource.destroy();
}

runMigrations().catch((err: unknown) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
