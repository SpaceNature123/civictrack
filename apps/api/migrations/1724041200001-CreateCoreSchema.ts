// =============================================================================
// Migration: 002 — Create core schema
// Creates all enums, tables, and foreign key constraints.
// =============================================================================
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoreSchema1724041200001 implements MigrationInterface {
  name = 'CreateCoreSchema1724041200001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enums ────────────────────────────────────────────────────────────────

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('citizen', 'officer', 'admin');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE issue_status AS ENUM (
          'reported', 'acknowledged', 'in_progress',
          'resolved', 'verified', 'disputed', 'closed'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE issue_severity AS ENUM ('low', 'medium', 'high', 'critical');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE issue_category AS ENUM (
          'pothole', 'garbage_overflow', 'broken_streetlight', 'water_leakage',
          'sewer_overflow', 'illegal_parking', 'noise_complaint', 'stray_animals',
          'damaged_road', 'tree_fall', 'other'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    // ── Wards ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wards (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name                VARCHAR(255) NOT NULL UNIQUE,
        boundary            GEOMETRY(Polygon, 4326),
        department_mapping  JSONB NOT NULL DEFAULT '{}',
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ── Departments ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name              VARCHAR(255) NOT NULL UNIQUE,
        category_mapping  TEXT NOT NULL DEFAULT '',
        head_user_id      UUID,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ── Users ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name              VARCHAR(255) NOT NULL,
        phone             VARCHAR(20),
        email             VARCHAR(255),
        role              user_role NOT NULL DEFAULT 'citizen',
        ward_id           UUID REFERENCES wards(id) ON DELETE SET NULL,
        avatar_url        VARCHAR,
        reputation_score  INT NOT NULL DEFAULT 0,
        is_active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_users_email UNIQUE (email),
        CONSTRAINT uq_users_phone UNIQUE (phone)
      )
    `);

    // Add FK from departments.head_user_id → users now that users table exists
    await queryRunner.query(`
      ALTER TABLE departments
        ADD CONSTRAINT fk_departments_head_user
        FOREIGN KEY (head_user_id) REFERENCES users(id) ON DELETE SET NULL
    `);

    // ── Issues ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        uuid                    UUID NOT NULL UNIQUE,
        citizen_id              UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        category                issue_category NOT NULL,
        description             TEXT NOT NULL,
        photo_urls              TEXT[] NOT NULL DEFAULT '{}',
        location                GEOGRAPHY(Point, 4326),
        ward_id                 UUID REFERENCES wards(id) ON DELETE SET NULL,
        department_id           UUID REFERENCES departments(id) ON DELETE SET NULL,
        assigned_officer_id     UUID REFERENCES users(id) ON DELETE SET NULL,
        status                  issue_status NOT NULL DEFAULT 'reported',
        severity                issue_severity NOT NULL DEFAULT 'low',
        severity_score          NUMERIC(10,2) NOT NULL DEFAULT 0,
        upvote_count            INT NOT NULL DEFAULT 0,
        duplicate_of_issue_id   UUID REFERENCES issues(id) ON DELETE SET NULL,
        resolution_photo_urls   TEXT[] NOT NULL DEFAULT '{}',
        resolution_note         TEXT,
        sla_due_at              TIMESTAMPTZ,
        created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ── StatusHistory ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS status_history (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        issue_id    UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
        status      issue_status NOT NULL,
        changed_by  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        note        TEXT,
        photo_url   VARCHAR,
        timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ── Upvotes ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS upvotes (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        issue_id    UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
        citizen_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_upvotes_issue_citizen UNIQUE (issue_id, citizen_id)
      )
    `);

    // ── Escalations ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS escalations (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        issue_id      UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
        escalated_to  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        escalated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
        reason        TEXT NOT NULL,
        is_resolved   BOOLEAN NOT NULL DEFAULT FALSE,
        timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ── updated_at triggers ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    for (const table of ['wards', 'departments', 'users', 'issues']) {
      await queryRunner.query(`
        DROP TRIGGER IF EXISTS trg_${table}_updated_at ON ${table};
        CREATE TRIGGER trg_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS escalations CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS upvotes CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS status_history CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS issues CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS departments CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS wards CASCADE`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role`);
    await queryRunner.query(`DROP TYPE IF EXISTS issue_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS issue_severity`);
    await queryRunner.query(`DROP TYPE IF EXISTS issue_category`);
  }
}
