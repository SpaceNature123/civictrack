// =============================================================================
// CivicTrack — Database Seed Script
// Creates baseline data for local dev and testing.
// IDEMPOTENT: Running twice never duplicates rows (upsert on stable IDs).
// =============================================================================
import 'reflect-metadata';

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env — resolve from multiple possible locations
const envPaths = [
  path.resolve(__dirname, '../../../.env'),  // from src/database/seeds/
  path.resolve(process.cwd(), '.env'),       // from apps/api/
];
for (const p of envPaths) {
  dotenv.config({ path: p });
  if (process.env['DATABASE_URL']) break;
}

import { DataSource } from 'typeorm';

import { IssueCategory, IssueStatus, IssueSeverity, SLA_HOURS, UserRole } from '@civictrack/shared';

import { DepartmentEntity } from '../../entities/department.entity';
import { EscalationEntity } from '../../entities/escalation.entity';
import { IssueEntity } from '../../entities/issue.entity';
import { StatusHistoryEntity } from '../../entities/status-history.entity';
import { UpvoteEntity } from '../../entities/upvote.entity';
import { UserEntity } from '../../entities/user.entity';
import { WardEntity } from '../../entities/ward.entity';

// ── Stable IDs (UUIDs) — ensures idempotency on re-run ────────────────────
const SEED_IDS = {
  wards: {
    ward1: '11111111-0001-0001-0001-000000000001',
    ward2: '11111111-0002-0002-0002-000000000002',
    ward3: '11111111-0003-0003-0003-000000000003',
    ward4: '11111111-0004-0004-0004-000000000004',
    ward5: '11111111-0005-0005-0005-000000000005',
  },
  depts: {
    roads: '22222222-0001-0001-0001-000000000001',
    utilities: '22222222-0002-0002-0002-000000000002',
  },
  users: {
    citizen1: '33333333-0001-0001-0001-000000000001',
    citizen2: '33333333-0002-0002-0002-000000000002',
    officer1: '33333333-0003-0003-0003-000000000003',
    officer2: '33333333-0004-0004-0004-000000000004',
    admin1:   '33333333-0005-0005-0005-000000000005',
  },
  issues: {
    issue1: '44444444-0001-0001-0001-000000000001',
    issue2: '44444444-0002-0002-0002-000000000002',
    issue3: '44444444-0003-0003-0003-000000000003',
    issue4: '44444444-0004-0004-0004-000000000004',
    issue5: '44444444-0005-0005-0005-000000000005',
  },
};

// ── Plausible Chennai-area ward boundaries (simplified rectangles) ─────────
// Using real-ish lat/lng around Adyar, Chennai (lat~13.0, lng~80.2)
const WARD_SEEDS: Array<{ id: string; name: string; minLng: number; minLat: number; maxLng: number; maxLat: number }> = [
  { id: SEED_IDS.wards.ward1, name: 'Adyar Ward',      minLng: 80.200, minLat: 12.990, maxLng: 80.250, maxLat: 13.020 },
  { id: SEED_IDS.wards.ward2, name: 'Velachery Ward',  minLng: 80.200, minLat: 13.020, maxLng: 80.250, maxLat: 13.050 },
  { id: SEED_IDS.wards.ward3, name: 'T.Nagar Ward',    minLng: 80.220, minLat: 13.035, maxLng: 80.270, maxLat: 13.065 },
  { id: SEED_IDS.wards.ward4, name: 'Mylapore Ward',   minLng: 80.265, minLat: 13.030, maxLng: 80.295, maxLat: 13.055 },
  { id: SEED_IDS.wards.ward5, name: 'Guindy Ward',     minLng: 80.195, minLat: 13.000, maxLng: 80.240, maxLat: 13.030 },
];

/** Build a rectangular GeoJSON polygon from bounding box coords */
function rectPolygon(minLng: number, minLat: number, maxLng: number, maxLat: number): object {
  return {
    type: 'Polygon',
    coordinates: [[
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat], // close ring
    ]],
  };
}

/** Build a GeoJSON Point for PostGIS ST_GeomFromGeoJSON */
function point(lng: number, lat: number): object {
  return { type: 'Point', coordinates: [lng, lat] };
}

// ── Issue seeds (geo points within ward boundaries) ────────────────────────
interface IssueSeed {
  id: string;
  uuid: string;
  citizenId: string;
  wardId: string;
  deptId: string;
  officerId: string;
  category: IssueCategory;
  description: string;
  status: IssueStatus;
  severity: IssueSeverity;
  lng: number;
  lat: number;
}

const ISSUE_SEEDS: IssueSeed[] = [
  {
    id: SEED_IDS.issues.issue1,
    uuid: 'aaaaaaaa-0001-0001-0001-000000000001',
    citizenId: SEED_IDS.users.citizen1,
    wardId: SEED_IDS.wards.ward1,
    deptId: SEED_IDS.depts.roads,
    officerId: SEED_IDS.users.officer1,
    category: IssueCategory.Pothole,
    description: 'Large pothole on 5th Main Road near bus stop',
    status: IssueStatus.InProgress,
    severity: IssueSeverity.High,
    lng: 80.225, lat: 13.005,
  },
  {
    id: SEED_IDS.issues.issue2,
    uuid: 'aaaaaaaa-0002-0002-0002-000000000002',
    citizenId: SEED_IDS.users.citizen2,
    wardId: SEED_IDS.wards.ward1,
    deptId: SEED_IDS.depts.utilities,
    officerId: SEED_IDS.users.officer1,
    category: IssueCategory.WaterLeakage,
    description: 'Burst water pipe causing road flooding',
    status: IssueStatus.Reported,
    severity: IssueSeverity.Critical,
    lng: 80.228, lat: 13.008, // ~380m from issue1 — within ST_DWithin(500m)
  },
  {
    id: SEED_IDS.issues.issue3,
    uuid: 'aaaaaaaa-0003-0003-0003-000000000003',
    citizenId: SEED_IDS.users.citizen1,
    wardId: SEED_IDS.wards.ward2,
    deptId: SEED_IDS.depts.utilities,
    officerId: SEED_IDS.users.officer2,
    category: IssueCategory.BrokenStreetlight,
    description: 'Streetlight out on main junction for 3 days',
    status: IssueStatus.Acknowledged,
    severity: IssueSeverity.Medium,
    lng: 80.215, lat: 13.035,
  },
  {
    id: SEED_IDS.issues.issue4,
    uuid: 'aaaaaaaa-0004-0004-0004-000000000004',
    citizenId: SEED_IDS.users.citizen2,
    wardId: SEED_IDS.wards.ward3,
    deptId: SEED_IDS.depts.roads,
    officerId: SEED_IDS.users.officer2,
    category: IssueCategory.GarbageOverflow,
    description: 'Garbage bins overflowing near T.Nagar market',
    status: IssueStatus.Resolved,
    severity: IssueSeverity.Medium,
    lng: 80.240, lat: 13.050,
  },
  {
    id: SEED_IDS.issues.issue5,
    uuid: 'aaaaaaaa-0005-0005-0005-000000000005',
    citizenId: SEED_IDS.users.citizen1,
    wardId: SEED_IDS.wards.ward4,
    deptId: SEED_IDS.depts.utilities,
    officerId: SEED_IDS.users.officer1,
    category: IssueCategory.SewerOverflow,
    description: 'Sewage overflowing onto footpath near temple',
    status: IssueStatus.Reported,
    severity: IssueSeverity.Critical,
    lng: 80.280, lat: 13.040,
  },
];

// ── Main seed function ─────────────────────────────────────────────────────
async function seed(): Promise<void> {
  const DATABASE_URL = process.env['DATABASE_URL'];
  if (!DATABASE_URL) throw new Error('DATABASE_URL not set');

  const ds = new DataSource({
    type: 'postgres',
    url: DATABASE_URL,
    ssl: DATABASE_URL.includes('.rlwy.net') || DATABASE_URL.includes('.railway.app')
      ? { rejectUnauthorized: false }
      : false,
    entities: [WardEntity, DepartmentEntity, UserEntity, IssueEntity, StatusHistoryEntity, UpvoteEntity, EscalationEntity],
    synchronize: false,
    logging: false,
  });

  await ds.initialize();
  console.log('✅ Connected to database');

  const wardRepo   = ds.getRepository(WardEntity);
  const deptRepo   = ds.getRepository(DepartmentEntity);
  const userRepo   = ds.getRepository(UserEntity);
  const issueRepo  = ds.getRepository(IssueEntity);
  const histRepo   = ds.getRepository(StatusHistoryEntity);

  // ── 1. Wards ───────────────────────────────────────────────────────────
  console.log('🌍 Seeding wards...');
  for (const w of WARD_SEEDS) {
    const existing = await wardRepo.findOne({ where: { id: w.id } });
    if (existing) { console.log(`   ↩ Ward "${w.name}" already exists — skipping`); continue; }

    const boundary = rectPolygon(w.minLng, w.minLat, w.maxLng, w.maxLat);
    await ds.query(
      `INSERT INTO wards (id, name, boundary, department_mapping)
       VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4)`,
      [w.id, w.name, JSON.stringify(boundary), '{}'],
    );
    console.log(`   ✔ Created ward "${w.name}"`);
  }

  // ── 2. Departments ─────────────────────────────────────────────────────
  console.log('🏢 Seeding departments...');
  const deptSeeds = [
    {
      id: SEED_IDS.depts.roads,
      name: 'Roads & Infrastructure',
      categoryMapping: [IssueCategory.Pothole, IssueCategory.DamagedRoad].join(','),
    },
    {
      id: SEED_IDS.depts.utilities,
      name: 'Utilities & Sanitation',
      categoryMapping: [
        IssueCategory.WaterLeakage, IssueCategory.SewerOverflow,
        IssueCategory.BrokenStreetlight, IssueCategory.GarbageOverflow,
        IssueCategory.StrayAnimals, IssueCategory.NoiseComplaint,
        IssueCategory.IllegalParking, IssueCategory.TreeFall,
        IssueCategory.Other,
      ].join(','),
    },
  ];
  for (const d of deptSeeds) {
    const existing = await deptRepo.findOne({ where: { id: d.id } });
    if (existing) { console.log(`   ↩ Dept "${d.name}" already exists — skipping`); continue; }

    await ds.query(
      `INSERT INTO departments (id, name, category_mapping) VALUES ($1, $2, $3)`,
      [d.id, d.name, d.categoryMapping],
    );
    console.log(`   ✔ Created department "${d.name}"`);
  }

  // ── 3. Users ───────────────────────────────────────────────────────────
  console.log('👤 Seeding users...');
  const userSeeds: Array<{ id: string; name: string; email: string; role: UserRole; wardId?: string }> = [
    { id: SEED_IDS.users.citizen1, name: 'Priya Chandran',  email: 'priya@example.com',   role: UserRole.Citizen, wardId: SEED_IDS.wards.ward1 },
    { id: SEED_IDS.users.citizen2, name: 'Arjun Nair',      email: 'arjun@example.com',   role: UserRole.Citizen, wardId: SEED_IDS.wards.ward2 },
    { id: SEED_IDS.users.officer1, name: 'Meena Selvam',    email: 'officer1@corp.in',     role: UserRole.Officer, wardId: SEED_IDS.wards.ward1 },
    { id: SEED_IDS.users.officer2, name: 'Ravi Kumar',      email: 'officer2@corp.in',     role: UserRole.Officer, wardId: SEED_IDS.wards.ward3 },
    { id: SEED_IDS.users.admin1,   name: 'Admin Suresh',    email: 'admin@civictrack.in',  role: UserRole.Admin },
  ];
  for (const u of userSeeds) {
    const existing = await userRepo.findOne({ where: { id: u.id } });
    if (existing) { console.log(`   ↩ User "${u.name}" already exists — skipping`); continue; }

    await ds.query(
      `INSERT INTO users (id, name, email, role, ward_id) VALUES ($1, $2, $3, $4, $5)`,
      [u.id, u.name, u.email, u.role, u.wardId ?? null],
    );
    console.log(`   ✔ Created user "${u.name}" (${u.role})`);
  }

  // ── 4. Issues ──────────────────────────────────────────────────────────
  console.log('📋 Seeding issues...');
  for (const iss of ISSUE_SEEDS) {
    const existing = await issueRepo.findOne({ where: { id: iss.id } });
    if (existing) { console.log(`   ↩ Issue "${iss.id}" already exists — skipping`); continue; }

    const slaHours = SLA_HOURS[iss.category];
    const slaDueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    const locationGeoJSON = JSON.stringify(point(iss.lng, iss.lat));

    await ds.query(
      `INSERT INTO issues
         (id, uuid, citizen_id, ward_id, department_id, assigned_officer_id,
          category, description, location, status, severity, sla_due_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
               ST_GeogFromText('POINT(' || $9 || ' ' || $10 || ')'),
               $11, $12, $13)`,
      [
        iss.id, iss.uuid, iss.citizenId, iss.wardId, iss.deptId, iss.officerId,
        iss.category, iss.description,
        iss.lng, iss.lat,
        iss.status, iss.severity, slaDueAt,
      ],
    );

    // Add initial status history entry
    const adminId = SEED_IDS.users.admin1;
    await histRepo.save({
      issueId: iss.id,
      status: IssueStatus.Reported,
      changedBy: iss.citizenId,
      note: 'Issue reported by citizen',
    });

    // If status progressed, add another history entry
    if (iss.status !== IssueStatus.Reported) {
      await histRepo.save({
        issueId: iss.id,
        status: iss.status,
        changedBy: iss.status === IssueStatus.Resolved ? adminId : iss.officerId,
        note: `Status updated to ${iss.status}`,
      });
    }

    console.log(`   ✔ Created issue [${iss.category}] at (${iss.lat}, ${iss.lng})`);
  }

  // ── Summary ────────────────────────────────────────────────────────────
  const counts = await ds.query(`
    SELECT
      (SELECT COUNT(*) FROM wards)          AS wards,
      (SELECT COUNT(*) FROM departments)    AS departments,
      (SELECT COUNT(*) FROM users)          AS users,
      (SELECT COUNT(*) FROM issues)         AS issues,
      (SELECT COUNT(*) FROM status_history) AS status_history,
      (SELECT COUNT(*) FROM upvotes)        AS upvotes,
      (SELECT COUNT(*) FROM escalations)    AS escalations
  `) as Array<Record<string, string>>;

  console.log('\n📊 Seed complete — row counts:');
  console.table(counts[0]);

  await ds.destroy();
}

seed().catch((err: unknown) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
