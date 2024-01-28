import { Module } from '@nestjs/common';
import 'dotenv/config';
import { NecordModule } from 'necord';
import { AppService } from './app.service';
import { GovernorModule } from './governor/module';
import { RankedEventModule } from './ranked-event/module';
import { BidModule } from './bid/module';
import { KVKModule } from './kvk/module';
@Module({
  imports: [
    GovernorModule,
    RankedEventModule,
    BidModule,
    KVKModule,
    NecordModule.forRoot({
      token: process.env.DISCORD_BOT_TOKEN,
      intents: ['Guilds', 'GuildMessages', 'DirectMessages'],
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
