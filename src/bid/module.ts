import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/module';
import { BidCommands } from './commands';
import { BidRepository } from './repository';
import { BidService } from './service';
import { RankedEventService } from 'src/ranked-event/service';
import { GovernorService } from '../governor/service';
import { RankedEventRepository } from 'src/ranked-event/repository';
import { GovernorRepository } from 'src/governor/repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    BidService,
    RankedEventService,
    GovernorService,
    BidCommands,
    ...BidRepository,
    ...RankedEventRepository,
    ...GovernorRepository,
  ],
  exports: [BidService, BidCommands],
})
export class BidModule {}
