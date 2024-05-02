import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/module';
import { KvkCommands } from './commands';
import { KvkRepository } from './repository';
import { KVKStatsService } from './kvk_stats.service';
import { GovernorService } from 'src/governor/service';
import { GovernorRepository } from 'src/governor/repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    KVKStatsService,
    GovernorService,
    KvkCommands,
    ...KvkRepository,
    ...GovernorRepository,
  ],
  exports: [KVKStatsService, KvkCommands],
})
export class KVKModule {}
