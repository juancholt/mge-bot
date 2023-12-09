import { Injectable } from '@nestjs/common';
import {
  Button,
  ButtonContext,
  ComponentParam,
  Context,
  Options,
  SlashCommand,
  SlashCommandContext,
  StringOption,
} from 'necord';
import { GovernorService } from './service';
import { Governor } from 'src/entity/Governor';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

export class CreateGovernorDto {
  @StringOption({
    name: 'governor-id',
    description: 'Your ingame governor id.',
    required: true,
  })
  governorId: string;

  @StringOption({
    name: 'governor-name',
    description: 'Your ingame governor name.',
    required: true,
  })
  governorName: string;
}

@Injectable()
export class GovernorCommands {
  constructor(private readonly governorService: GovernorService) {}
  async createGovernorWith({
    governorId,
    governorName,
    interaction,
  }: {
    governorId: string;
    governorName: string;
    interaction: ChatInputCommandInteraction | ButtonInteraction;
  }) {
    const newGovernor = new Governor();
    newGovernor.discordId = interaction.user.id;
    newGovernor.governorId = governorId;
    newGovernor.governorName = governorName;
    newGovernor.points = '0';
    await this.governorService.createGovernor(newGovernor);
  }
  @SlashCommand({
    name: 'create-governor',
    description:
      'Creates a new ROK governor and links it to your discord account.',
  })
  public async onCreateGovernor(
    @Context() [interaction]: SlashCommandContext,
    @Options() { governorId, governorName }: CreateGovernorDto,
  ) {
    await this.createGovernorWith({ governorId, governorName, interaction });
    await interaction.reply({
      embeds: [
        {
          title: `Governor created successfully`,
          color: 0x00ff00,
        },
      ],
    });
  }
  @Button('create/:governorId/:governorName')
  public async onClickCreate(
    @Context() [interaction]: ButtonContext,
    @ComponentParam('governorId') governorId: string,
    @ComponentParam('governorName') governorName: string,
  ) {
    await this.createGovernorWith({
      governorId,
      governorName,
      interaction,
    });
    await interaction.update({
      content: '',
      components: [],
      embeds: [
        {
          title: `Governor created successfully`,
          color: 0x00ff00,
        },
      ],
    });
  }

  @SlashCommand({
    name: 'claim-governor-id',
    description: 'Links your governor id to your discord account',
  })
  public async onGovernorClaim(
    @Context() [interaction]: SlashCommandContext,
    @Options() { governorId, governorName }: CreateGovernorDto,
  ) {
    const currentGovernor = await this.governorService.findGovernorByDiscordId(
      interaction.user.id,
    );
    const unclaimedGovernor =
      await this.governorService.findGovernorByGovernorId(governorId);
    if (currentGovernor) {
      await interaction.reply({
        embeds: [
          {
            title: `You already have a governor linked to your discord account`,
            color: 0xff0000,
            fields: [],
          },
        ],
        ephemeral: true,
      });
      return;
    }
    if (unclaimedGovernor) {
      if (unclaimedGovernor.discordId) {
        await interaction.reply({
          ephemeral: true,

          embeds: [
            {
              title: `This governor id is already taken`,
              color: 0xff0000,
              fields: [],
            },
          ],
        });
        return;
      }
      unclaimedGovernor.discordId = interaction.user.id;
      unclaimedGovernor.governorId = governorId;
      unclaimedGovernor.governorName = governorName;
      unclaimedGovernor.points = '0';
      await this.governorService.updateGovernor(unclaimedGovernor);
      await interaction.reply({
        ephemeral: true,

        embeds: [
          {
            title: `Governor id successfully claimed`,
            color: 0x00ff00,
          },
        ],
      });
      return;
    }
    return interaction.reply({
      ephemeral: true,
      content: `Governor id not found. Do you want to create a new one?`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: 'Create a new one',
              style: 1,
              custom_id: `create/${governorId}/${governorName}`,
            },
          ],
        },
      ],
    });
  }
  @SlashCommand({
    name: 'my-info',
    description: 'Gets the profile info for your governor.',
    guilds: ['1111240948446416896'],
  })
  public async onGetPointBalance(
    @Context() [interaction]: SlashCommandContext,
  ) {
    const governor = await this.governorService.findGovernorByDiscordId(
      interaction.user.id,
    );
    await interaction.reply({
      ephemeral: true,
      embeds: [
        {
          title: `${governor.governorName}`,
          color: 0xa632a8,
          fields: [
            { name: 'Governor Id', value: governor.governorId, inline: false },
            { name: 'Point Balance', value: governor.points, inline: false },
          ],
        },
      ],
    });
  }
}
