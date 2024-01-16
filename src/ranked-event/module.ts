import { Module } from '@nestjs/common';
import { RankedEventCommands } from './commands';
import { DatabaseModule } from 'src/database/module';
import { RankedEventService } from './service';
import { RankedEventRepository } from './repository';
import { BidService } from 'src/bid/service';
import { GovernorService } from 'src/governor/service';
import { BidRepository } from 'src/bid/repository';
import { GovernorRepository } from 'src/governor/repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    ...GovernorRepository,
    ...BidRepository,
    ...RankedEventRepository,
    BidService,
    GovernorService,
    RankedEventService,
    RankedEventCommands,
  ],
  exports: [RankedEventService, RankedEventCommands],
})
export class RankedEventModule {}
