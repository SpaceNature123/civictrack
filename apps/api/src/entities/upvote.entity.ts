// =============================================================================
// CivicTrack — Upvote Entity (TypeORM)
// Unique constraint prevents double-upvoting the same issue
// =============================================================================
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { IssueEntity } from './issue.entity';
import type { UserEntity } from './user.entity';

@Entity('upvotes')
@Index('idx_upvotes_issue_citizen', ['issueId', 'citizenId'], { unique: true })
export class UpvoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'issue_id', type: 'uuid' })
  issueId!: string;

  @Column({ name: 'citizen_id', type: 'uuid' })
  citizenId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  // ── Relations ────────────────────────────────────────────────────────────
  @ManyToOne('IssueEntity', (issue: IssueEntity) => issue.upvotes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' })
  issue!: IssueEntity;

  @ManyToOne('UserEntity', (user: UserEntity) => user.upvotes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'citizen_id' })
  citizen!: UserEntity;
}
