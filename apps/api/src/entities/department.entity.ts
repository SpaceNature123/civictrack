// =============================================================================
// CivicTrack — Department Entity (TypeORM)
// =============================================================================
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { IssueCategory } from '@civictrack/shared';

import type { UserEntity } from './user.entity';

@Entity('departments')
export class DepartmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  /**
   * Array of IssueCategory values this department is responsible for.
   * Stored as text[] in Postgres for simple containment queries.
   */
  @Column({ name: 'category_mapping', type: 'simple-array', default: '' })
  categoryMapping!: IssueCategory[];

  @Column({ name: 'head_user_id', type: 'uuid', nullable: true })
  headUserId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // ── Relations ────────────────────────────────────────────────────────────
  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'head_user_id' })
  headUser!: UserEntity | null;
}
