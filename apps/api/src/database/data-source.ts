// =============================================================================
// CivicTrack — TypeORM DataSource
// Used by the TypeORM CLI for migrations AND by NestJS at runtime.
// =============================================================================
import 'reflect-metadata';

import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';

// Load .env — check multiple possible locations for CLI vs NestJS contexts
const envPaths = [
  path.resolve(__dirname, '../../.env'),  // from apps/api/src/database/
  path.resolve(process.cwd(), '.env'),    // from apps/api/
];
for (const p of envPaths) {
  dotenv.config({ path: p });
  if (process.env['DATABASE_URL']) break;
}

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  ssl:
    process.env['NODE_ENV'] === 'production' ||
    DATABASE_URL.includes('.railway.app') ||
    DATABASE_URL.includes('.rlwy.net')
      ? { rejectUnauthorized: false }
      : false,

  // Entities — using glob pattern for CLI; NestJS uses explicit array via module
  entities: [path.join(__dirname, '../entities/**/*.entity.{ts,js}')],

  // Migration files — local to apps/api/migrations/
  migrations: [path.join(__dirname, '../../migrations/**/*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',

  // Never auto-sync in any env — always use migrations
  synchronize: false,
  logging: process.env['NODE_ENV'] !== 'test',
});
