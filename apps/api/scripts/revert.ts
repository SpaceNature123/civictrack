// Migration revert script — undoes the last applied migration
import 'reflect-metadata';
import { AppDataSource } from '../src/database/data-source';

async function revertMigration(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.undoLastMigration();
  console.log('✅ Last migration reverted');
  await AppDataSource.destroy();
}

revertMigration().catch((err: unknown) => {
  console.error('❌ Revert failed:', err);
  process.exit(1);
});
