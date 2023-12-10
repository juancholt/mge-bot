import { Module } from '@nestjs/common';
import { RankedEventCommands } from './commands';
import { DatabaseModule } from 'src/database/module';
import { RankedEventService } from './service';
import { RankedEventRepository } from './repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    RankedEventService,
    RankedEventCommands,
    ...RankedEventRepository,
  ],
  exports: [RankedEventService, RankedEventCommands],
})
export class RankedEventModule {}
