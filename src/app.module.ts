import { Module } from '@nestjs/common';
import 'dotenv/config';
import { NecordModule } from 'necord';
import { AppService } from './app.service';
import { GovernorModule } from './governor/module';
@Module({
  imports: [
    GovernorModule,
    NecordModule.forRoot({
      token: process.env.DISCORD_BOT_TOKEN,
      intents: ['Guilds', 'GuildMessages', 'DirectMessages'],
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
