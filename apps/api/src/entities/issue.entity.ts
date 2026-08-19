// =============================================================================
// CivicTrack — Issue Entity (TypeORM)
// Core entity with geography(Point,4326) location + all required indexes
// =============================================================================
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { IssueCategory, IssueSeverity, IssueStatus } from '@civictrack/shared';

import type { DepartmentEntity } from './department.entity';
import type { EscalationEntity } from './escalation.entity';
import type { StatusHistoryEntity } from './status-history.entity';
import type { UpvoteEntity } from './upvote.entity';
import type { UserEntity } from './user.entity';
import type { WardEntity } from './ward.entity';

@Entity('issues')
// GIST spatial index — required for ST_DWithin proximity queries
@Index('idx_issues_location', { synchronize: false }) // Created via raw migration SQL
// Composite index for officer queue queries
@Index('idx_issues_ward_status', ['wardId', 'status'])
// Index for SLA breach scanner background job
@Index('idx_issues_sla_due_at', ['slaDueAt'])
// Unique idempotency index — prevents duplicate client submissions
@Index('idx_issues_uuid', ['uuid'], { unique: true })
export class IssueEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Client-generated idempotency key — same UUID from retried submits → same issue */
  @Column({ type: 'uuid' })
  uuid!: string;

  @Column({ name: 'citizen_id', type: 'uuid' })
  citizenId!: string;

  @Column({
    type: 'enum',
    enum: [
      'pothole', 'garbage_overflow', 'broken_streetlight', 'water_leakage',
      'sewer_overflow', 'illegal_parking', 'noise_complaint', 'stray_animals',
      'damaged_road', 'tree_fall', 'other',
    ],
  })
  category!: IssueCategory;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'photo_urls', type: 'text', array: true, default: '{}' })
  photoUrls!: string[];

  /**
   * Issue location stored as PostGIS geography(Point,4326).
   * Using geography (not geometry) so distance calculations are in metres.
   */
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location!: object | null;

  @Column({ name: 'ward_id', type: 'uuid', nullable: true })
  wardId!: string | null;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId!: string | null;

  @Column({ name: 'assigned_officer_id', type: 'uuid', nullable: true })
  assignedOfficerId!: string | null;

  @Column({
    type: 'enum',
    enum: ['reported', 'acknowledged', 'in_progress', 'resolved', 'verified', 'disputed', 'closed'],
    default: 'reported',
  })
  status!: IssueStatus;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  })
  severity!: IssueSeverity;

  @Column({ name: 'severity_score', type: 'numeric', precision: 10, scale: 2, default: 0 })
  severityScore!: number;

  @Column({ name: 'upvote_count', type: 'int', default: 0 })
  upvoteCount!: number;

  @Column({ name: 'duplicate_of_issue_id', type: 'uuid', nullable: true })
  duplicateOfIssueId!: string | null;

  @Column({ name: 'resolution_photo_urls', type: 'text', array: true, default: '{}' })
  resolutionPhotoUrls!: string[];

  @Column({ name: 'resolution_note', type: 'text', nullable: true })
  resolutionNote!: string | null;

  @Column({ name: 'sla_due_at', type: 'timestamptz', nullable: true })
  slaDueAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // ── Relations ────────────────────────────────────────────────────────────
  @ManyToOne('UserEntity', (u: UserEntity) => u.reportedIssues, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'citizen_id' })
  citizen!: UserEntity;

  @ManyToOne('WardEntity', (w: WardEntity) => w.issues, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ward_id' })
  ward!: WardEntity | null;

  @ManyToOne('DepartmentEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department!: DepartmentEntity | null;

  @ManyToOne('UserEntity', (u: UserEntity) => u.assignedIssues, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_officer_id' })
  assignedOfficer!: UserEntity | null;

  @ManyToOne('IssueEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'duplicate_of_issue_id' })
  duplicateOfIssue!: IssueEntity | null;

  @OneToMany('StatusHistoryEntity', (sh: StatusHistoryEntity) => sh.issue)
  statusHistory!: StatusHistoryEntity[];

  @OneToMany('UpvoteEntity', (upvote: UpvoteEntity) => upvote.issue)
  upvotes!: UpvoteEntity[];

  @OneToMany('EscalationEntity', (esc: EscalationEntity) => esc.issue)
  escalations!: EscalationEntity[];
}
