// =============================================================================
// CivicTrack — PostGIS Proximity Integration Test
// Verifies that ST_DWithin correctly finds seeded issues within radius.
//
// Uses raw pg.Pool (no TypeORM entity registration needed — all queries are SQL).
// Run after migrations + seed: pnpm --filter @civictrack/api test:integration
// =============================================================================
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool } from 'pg';

import { IssueStatus } from '@civictrack/shared';

// Load env before tests run
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Seed point coordinates (must match seed.ts ISSUE_SEEDS)
const ISSUE_1_LNG = 80.225;
const ISSUE_1_LAT = 13.005;

describe('PostGIS ST_DWithin proximity query', () => {
  let pool: Pool;

  beforeAll(() => {
    const url = process.env['DATABASE_URL'];
    if (!url) throw new Error('DATABASE_URL not set — run migrations + seed first');
    pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('finds seeded issues within 500m of a known point', async () => {
    const result = await pool.query<{ id: string; category: string; status: string; dist_metres: number }>(
      `SELECT
         i.id,
         i.category,
         i.status,
         ST_Distance(i.location, ST_MakePoint($1, $2)::geography) AS dist_metres
       FROM issues i
       WHERE ST_DWithin(
         i.location,
         ST_MakePoint($1, $2)::geography,
         500
       )
       ORDER BY dist_metres ASC`,
      [ISSUE_1_LNG, ISSUE_1_LAT],
    );

    expect(result.rows.length).toBeGreaterThanOrEqual(2);

    // Issue 1 itself should be at ~0m
    const atOrigin = result.rows.find((r) => r.dist_metres < 1);
    expect(atOrigin).toBeDefined();

    // Issue 2 is ~380m away — should also appear
    const nearby = result.rows.find((r) => r.dist_metres > 100 && r.dist_metres < 500);
    expect(nearby).toBeDefined();

    // All results must be within 500m
    for (const r of result.rows) {
      expect(r.dist_metres).toBeLessThanOrEqual(500);
    }
  });

  it('returns zero results 500m from a far-away point', async () => {
    // Egmore area — ~8km from Adyar seed cluster
    const result = await pool.query<{ cnt: number }>(
      `SELECT COUNT(*)::int AS cnt
       FROM issues
       WHERE ST_DWithin(location, ST_MakePoint($1, $2)::geography, 500)`,
      [80.259, 13.079],
    );
    expect(result.rows[0]?.cnt ?? 0).toBe(0);
  });

  it('confirms issues table has expected row count', async () => {
    const result = await pool.query<{ cnt: number }>(
      `SELECT COUNT(*)::int AS cnt FROM issues`,
    );
    expect(result.rows[0]?.cnt ?? 0).toBeGreaterThanOrEqual(5);
  });

  it('confirms GIST index exists on issues.location', async () => {
    const result = await pool.query<{ indexname: string; indexdef: string }>(
      `SELECT indexname, indexdef
       FROM pg_indexes
       WHERE tablename = 'issues' AND indexdef ILIKE '%gist%'`,
    );
    expect(result.rows.length).toBeGreaterThanOrEqual(1);
    const gist = result.rows.find((r) => r.indexname === 'idx_issues_location');
    expect(gist).toBeDefined();
    expect(gist?.indexdef.toLowerCase()).toContain('gist');
  });

  it('confirms composite (ward_id, status) index exists', async () => {
    const result = await pool.query<{ indexname: string }>(
      `SELECT indexname FROM pg_indexes
       WHERE tablename = 'issues' AND indexname = 'idx_issues_ward_status'`,
    );
    expect(result.rows.length).toBe(1);
  });

  it('confirms sla_due_at index exists', async () => {
    const result = await pool.query<{ indexname: string }>(
      `SELECT indexname FROM pg_indexes
       WHERE tablename = 'issues' AND indexname = 'idx_issues_sla_due_at'`,
    );
    expect(result.rows.length).toBe(1);
  });

  it('confirms issues with InProgress status exist', async () => {
    const result = await pool.query<{ cnt: number }>(
      `SELECT COUNT(*)::int AS cnt FROM issues WHERE status = $1`,
      [IssueStatus.InProgress],
    );
    expect(result.rows[0]?.cnt ?? 0).toBeGreaterThanOrEqual(1);
  });
});
