import { Module } from '@nestjs/common';
import { GovernorCommands } from './commands';
import { GovernorService } from './service';
import { GovernorRepository } from './repository';
import { DatabaseModule } from 'src/database/module';

@Module({
  imports: [DatabaseModule],
  providers: [GovernorService, GovernorCommands, ...GovernorRepository],
  exports: [GovernorService, GovernorCommands],
})
export class GovernorModule {}
