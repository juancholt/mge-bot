import { Module } from '@nestjs/common';
import { Database } from './providers';

@Module({
  providers: [...Database],
  exports: [...Database],
})
export class DatabaseModule {}
