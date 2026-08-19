// =============================================================================
// CivicTrack — User Entity (TypeORM)
// Maps to the User interface in @civictrack/shared
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

import type { UserRole } from '@civictrack/shared';

import type { EscalationEntity } from './escalation.entity';
import type { IssueEntity } from './issue.entity';
import type { UpvoteEntity } from './upvote.entity';
import type { WardEntity } from './ward.entity';

@Entity('users')
@Index('idx_users_email', ['email'], { unique: true, where: '"email" IS NOT NULL' })
@Index('idx_users_phone', ['phone'], { unique: true, where: '"phone" IS NOT NULL' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({
    type: 'enum',
    enum: ['citizen', 'officer', 'admin'],
    default: 'citizen',
  })
  role!: UserRole;

  @Column({ name: 'ward_id', type: 'uuid', nullable: true })
  wardId!: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl!: string | null;

  @Column({ name: 'reputation_score', type: 'int', default: 0 })
  reputationScore!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // ── Relations ────────────────────────────────────────────────────────────
  @ManyToOne('WardEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ward_id' })
  ward!: WardEntity | null;

  @OneToMany('IssueEntity', (issue: IssueEntity) => issue.citizen)
  reportedIssues!: IssueEntity[];

  @OneToMany('IssueEntity', (issue: IssueEntity) => issue.assignedOfficer)
  assignedIssues!: IssueEntity[];

  @OneToMany('UpvoteEntity', (upvote: UpvoteEntity) => upvote.citizen)
  upvotes!: UpvoteEntity[];

  @OneToMany('EscalationEntity', (esc: EscalationEntity) => esc.escalatedToUser)
  escalationsReceived!: EscalationEntity[];
}
