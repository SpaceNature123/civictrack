// =============================================================================
// CivicTrack — StatusHistory Entity (TypeORM)
// Immutable audit log of every status transition on an Issue
// =============================================================================
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { IssueStatus } from '@civictrack/shared';

import type { IssueEntity } from './issue.entity';
import type { UserEntity } from './user.entity';

@Entity('status_history')
@Index('idx_status_history_issue_id', ['issueId'])
export class StatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'issue_id', type: 'uuid' })
  issueId!: string;

  @Column({
    type: 'enum',
    enum: ['reported', 'acknowledged', 'in_progress', 'resolved', 'verified', 'disputed', 'closed'],
  })
  status!: IssueStatus;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ name: 'photo_url', type: 'varchar', nullable: true })
  photoUrl!: string | null;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  timestamp!: Date;

  // ── Relations ────────────────────────────────────────────────────────────
  @ManyToOne('IssueEntity', (issue: IssueEntity) => issue.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' })
  issue!: IssueEntity;

  @ManyToOne('UserEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'changed_by' })
  changedByUser!: UserEntity;
}
