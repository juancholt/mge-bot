import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/module';
import { KvkCommands } from './commands';
import { KvkRepository } from './repository';
import { KVKService } from './service';
import { GovernorService } from 'src/governor/service';
import { GovernorRepository } from 'src/governor/repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    KVKService,
    GovernorService,
    KvkCommands,
    ...KvkRepository,
    ...GovernorRepository,
  ],
  exports: [KVKService, KvkCommands],
})
export class KVKModule {}
