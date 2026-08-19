// =============================================================================
// CivicTrack — Escalation Entity (TypeORM)
// Triggered by SLA breach scanner or manual supervisor override
// =============================================================================
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { IssueEntity } from './issue.entity';
import type { UserEntity } from './user.entity';

@Entity('escalations')
@Index('idx_escalations_issue_id', ['issueId'])
export class EscalationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'issue_id', type: 'uuid' })
  issueId!: string;

  @Column({ name: 'escalated_to', type: 'uuid' })
  escalatedTo!: string;

  @Column({ name: 'escalated_by', type: 'uuid', nullable: true })
  escalatedBy!: string | null;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ name: 'is_resolved', type: 'boolean', default: false })
  isResolved!: boolean;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  timestamp!: Date;

  // ── Relations ────────────────────────────────────────────────────────────
  @ManyToOne('IssueEntity', (issue: IssueEntity) => issue.escalations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' })
  issue!: IssueEntity;

  @ManyToOne('UserEntity', (user: UserEntity) => user.escalationsReceived, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'escalated_to' })
  escalatedToUser!: UserEntity;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'escalated_by' })
  escalatedByUser!: UserEntity | null;
}
