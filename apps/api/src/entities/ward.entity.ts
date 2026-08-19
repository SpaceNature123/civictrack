// =============================================================================
// CivicTrack — Ward Entity (TypeORM)
// Stores ward boundaries as PostGIS geometry(Polygon,4326)
// =============================================================================
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { IssueCategory } from '@civictrack/shared';

import type { IssueEntity } from './issue.entity';
import type { UserEntity } from './user.entity';

@Entity('wards')
export class WardEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  /**
   * GeoJSON Polygon boundary stored as PostGIS geometry(Polygon,4326).
   * TypeORM maps this as a raw geometry column — queries use ST_* functions.
   * The column type is declared as 'geometry' and PostGIS handles the rest.
   */
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: true,
  })
  boundary!: object | null;

  /**
   * Maps each IssueCategory to a Department ID.
   * Stored as JSONB for flexible querying.
   */
  @Column({ name: 'department_mapping', type: 'jsonb', default: '{}' })
  departmentMapping!: Record<IssueCategory, string>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // ── Relations ────────────────────────────────────────────────────────────
  @OneToMany('IssueEntity', (issue: IssueEntity) => issue.ward)
  issues!: IssueEntity[];

  @OneToMany('UserEntity', (user: UserEntity) => user.ward)
  officers!: UserEntity[];
}
