import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';

@Injectable()
export class AppService {
  @SlashCommand({
    name: 'ping',
    description: 'Ping command!',
  })
  public async onPing(@Context() [interaction]: SlashCommandContext) {
    await interaction.reply({
      embeds: [
        {
          title: 'Ping received',
          color: 0x00ff00,
          fields: [{ name: 'Answer', value: 'PONG', inline: true }],
        },
      ],
    });
  }
}
