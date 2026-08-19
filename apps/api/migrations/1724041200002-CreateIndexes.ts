// =============================================================================
// Migration: 003 — Create PostGIS indexes
// Separate from schema migration so CONCURRENTLY can be used where needed.
// =============================================================================
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndexes1724041200002 implements MigrationInterface {
  name = 'CreateIndexes1724041200002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── GIST spatial index on issues.location (geography) ────────────────────
    // Enables fast ST_DWithin proximity queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_location
        ON issues USING GIST (location)
    `);

    // ── Composite index for officer queue: ward + status ──────────────────────
    // Supports queries like: SELECT * FROM issues WHERE ward_id=$1 AND status=$2
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_ward_status
        ON issues (ward_id, status)
    `);

    // ── Index for SLA breach scanner background job ───────────────────────────
    // Supports: SELECT * FROM issues WHERE sla_due_at < NOW() AND status != 'resolved'
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_sla_due_at
        ON issues (sla_due_at)
        WHERE sla_due_at IS NOT NULL
    `);

    // ── UUID idempotency index (partial — also declared on entity) ────────────
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_issues_uuid
        ON issues (uuid)
    `);

    // ── Supporting indexes ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_citizen_id
        ON issues (citizen_id)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_status
        ON issues (status)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_status_history_issue_id
        ON status_history (issue_id)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_escalations_issue_id
        ON escalations (issue_id)
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_upvotes_issue_citizen
        ON upvotes (issue_id, citizen_id)
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
        ON users (email)
        WHERE email IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone
        ON users (phone)
        WHERE phone IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const indexes = [
      'idx_issues_location',
      'idx_issues_ward_status',
      'idx_issues_sla_due_at',
      'idx_issues_uuid',
      'idx_issues_citizen_id',
      'idx_issues_status',
      'idx_status_history_issue_id',
      'idx_escalations_issue_id',
      'idx_upvotes_issue_citizen',
      'idx_users_email',
      'idx_users_phone',
    ];
    for (const idx of indexes) {
      await queryRunner.query(`DROP INDEX IF EXISTS ${idx}`);
    }
  }
}
