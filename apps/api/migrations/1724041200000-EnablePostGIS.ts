// =============================================================================
// Migration: 001 — Enable PostGIS extension
// Must run before any geometry/geography column is created.
// =============================================================================
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePostGIS1724041200000 implements MigrationInterface {
  name = 'EnablePostGIS1724041200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: dropping postgis would destroy all geometry data — intentionally left as no-op
    // In production, extensions are managed manually by the DBA
    await queryRunner.query(`-- PostGIS extension drop is intentionally skipped`);
  }
}
