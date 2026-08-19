// =============================================================================
// CivicTrack — Database Module
// Provides TypeORM connection to all NestJS modules via forRootAsync
// =============================================================================
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  DepartmentEntity,
  EscalationEntity,
  IssueEntity,
  StatusHistoryEntity,
  UpvoteEntity,
  UserEntity,
  WardEntity,
} from '../entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('DATABASE_URL');
        const isRemote = url.includes('.railway.app') || url.includes('.rlwy.net');
        return {
          type: 'postgres',
          url,
          ssl: isRemote ? { rejectUnauthorized: false } : false,
          entities: [
            UserEntity,
            WardEntity,
            DepartmentEntity,
            IssueEntity,
            StatusHistoryEntity,
            UpvoteEntity,
            EscalationEntity,
          ],
          migrations: [],
          synchronize: false,
          logging: config.get('NODE_ENV') === 'development',
        };
      },
    }),
  ],
})
export class DatabaseModule {}
