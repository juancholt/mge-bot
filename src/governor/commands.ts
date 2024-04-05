import { Injectable } from '@nestjs/common';
import {
  AttachmentOption,
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
import {
  Attachment,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
} from 'discord.js';
import { downloadAndSplitInRows } from 'src/utils/file-downloader';
import { requirements } from 'src/utils/util';
import { filledBar } from 'string-progressbar';
import Decimal from 'decimal.js-light';

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
export class ClaimGovernorDto {
  @StringOption({
    name: 'governor-id',
    description: 'Your ingame governor id.',
    required: true,
  })
  governorId: string;

  @StringOption({
    name: 'governor-name',
    description: 'Your ingame governor name.',
    required: false,
  })
  governorName: string;
}
export class RenameGovernorDto {
  @StringOption({
    name: 'governor-name',
    description: 'Your ingame governor name.',
    required: false,
  })
  governorName: string;
}
export class BatchSetPointsDto {
  @AttachmentOption({
    name: 'file',
    description: 'CSV file containing governor ids and points',
    required: true,
  })
  file: Attachment;
}

export class GovernorIdDto {
  @StringOption({
    name: 'governor-id',
    description: 'Governor ingame id.',
    required: true,
  })
  governorId: string;
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
    newGovernor.points = 0;
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
    const discordGovernor = await this.governorService.getGovernorByDiscordId(
      interaction.user.id,
    );
    const rokGovernor =
      await this.governorService.getGovernorByGovernorId(governorId);
    if (discordGovernor) {
      return await interaction.reply({
        embeds: [
          {
            title: `Governor Linked already`,
            description:
              'Your account is already linked to a governor.\nYou can see your info using `my-info`',
            color: 0xff0000,
          },
        ],
      });
    }
    if (rokGovernor) {
      if (rokGovernor.discordId)
        return await interaction.reply({
          embeds: [
            {
              title: `GovernorID already taken`,
              description: 'This governor id already taken.',
              color: 0xff0000,
            },
          ],
        });
      return interaction.reply({
        ephemeral: true,
        content: `Governor id already exists. Do you want to link it to your account?`,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: 'Link it',
                style: ButtonStyle.Primary,
                custom_id: `link/${governorId}`,
              },
              {
                type: 2,
                label: 'Cancel',
                style: ButtonStyle.Secondary,
                custom_id: `cancel-governor-create`,
              },
            ],
          },
        ],
      });
    }
    await this.createGovernorWith({ governorId, governorName, interaction });
    return await interaction.reply({
      embeds: [
        {
          title: `Welcome ${governorName}`,
          color: 0x00ff00,
        },
      ],
    });
  }
  @Button('link/:governorId')
  public async onClickLink(
    @Context() [interaction]: ButtonContext,
    @ComponentParam('governorId') governorId: string,
  ) {
    const unclaimedGovernor =
      await this.governorService.getGovernorByGovernorId(governorId);
    unclaimedGovernor.discordId = interaction.user.id;
    await this.governorService.updateGovernor(unclaimedGovernor);
    await interaction.update({
      content: '',
      components: [],
      embeds: [
        {
          title: `Welcome ${unclaimedGovernor.governorName}`,
          color: 0x00ff00,
        },
      ],
    });
  }

  @Button('cancel-governor-create')
  public async onCancel(@Context() [interaction]: ButtonContext) {
    await interaction.update({
      content: '',
      components: [],
      embeds: [
        {
          title: `Governor not created`,
          color: 0xffbf00,
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
    const currentGovernor = await this.governorService.getGovernorByDiscordId(
      interaction.user.id,
    );
    const unclaimedGovernor =
      await this.governorService.getGovernorByGovernorId(governorId);
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
      if (governorName) unclaimedGovernor.governorName = governorName;
      await this.governorService.updateGovernor(unclaimedGovernor);
      await interaction.reply({
        ephemeral: true,

        embeds: [
          {
            title: `Welcome ${unclaimedGovernor.governorName}`,
            color: 0x00ff00,
          },
        ],
      });
      return;
    }
    if (!governorName) {
      return interaction.reply({
        ephemeral: true,
        content: `Governor id not found. To create a new one use \`/create-governor\``,
      });
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
    name: 'batch-set-points',
    description: 'Creates/Updates points for a list of governors from a csv',
    defaultMemberPermissions: 'Administrator',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onBatchSetPoints(
    @Context() [interaction]: SlashCommandContext,
    @Options() { file }: BatchSetPointsDto,
  ) {
    if (!file.contentType.includes('text/csv')) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          {
            title: `Invalid file type`,
            description: 'Only csv files are allowed',
            color: 0xff0000,
          },
        ],
      });
    }
    const rows = await downloadAndSplitInRows(file.url);
    rows.forEach(async (row) => {
      const [id, name, points] = row.split(',');
      const newGovernor = new Governor();
      newGovernor.governorId = id;
      newGovernor.governorName = name;
      newGovernor.points = new Decimal(
        points.replace(/(\r\n|\n|\r)/gm, ''),
      ).toNumber();
      await this.governorService.createGovernor(newGovernor);
    });

    return interaction.reply({
      ephemeral: true,
      embeds: [
        {
          title: `Governors succesfully uploaded`,
          description: `${rows.length} governors uploaded`,
          color: 0x00ff00,
        },
      ],
    });
  }

  @SlashCommand({
    name: 'rename-governor',
    description:
      'Changes the name of your ROK governor. This will not change your discord name.',
  })
  public async onGovernorRename(
    @Context() [interaction]: SlashCommandContext,
    @Options() { governorName }: RenameGovernorDto,
  ) {
    const governor = await this.governorService.getGovernorByDiscordId(
      interaction.user.id,
    );
    if (!governor) {
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          {
            title: `You don't have a governor linked to your discord account.\nUse \`/create-governor\` to create one.`,
            color: 0xff0000,
            fields: [],
          },
        ],
      });
    }
    governor.governorName = governorName;
    await this.governorService.updateGovernor(governor);
    return await interaction.reply({
      ephemeral: true,
      embeds: [
        {
          title: `Governor renamed successfully`,
          color: 0x00ff00,
          fields: [],
        },
      ],
    });
  }
  @SlashCommand({
    name: 'my-info',
    description: 'Gets the profile info for your governor.',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onGetPointBalance(
    @Context() [interaction]: SlashCommandContext,
  ) {
    const governor = await this.governorService.getGovernorByDiscordId(
      interaction.user.id,
    );
    await this.getGovernorInfo(governor, interaction);
  }

  @SlashCommand({
    name: 'last-kvk',
    description: 'Gets the last kvk stats for your id.',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onGetLastKvk(@Context() [interaction]: SlashCommandContext) {
    const governor = await this.governorService.getGovernorByDiscordId(
      interaction.user.id,
    );
    if (!governor) {
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          {
            title: `You don't have a governor linked to your discord account.\nUse \`/create-governor\` to create one.`,
            color: 0xff0000,
            fields: [],
          },
        ],
      });
    }

    await interaction.reply({
      ephemeral: true,
      embeds: [
        {
          title: `🛡️ Governor Info 🛡️`,
          description: `# ${governor.governorName}
          > **🪪 Governor Id** : ${governor.governorId}`,
          color: 0xa632a8,
        },
        ...this.getLastKvkEmbed(governor),
      ],
    });
  }
  @SlashCommand({
    name: 'governor-info',
    defaultMemberPermissions: 'Administrator',
    description: 'Gets the profile info for your governor.',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onGetPointBalanceByGovernorId(
    @Context() [interaction]: SlashCommandContext,
    @Options() { governorId }: GovernorIdDto,
  ) {
    const governor =
      await this.governorService.getGovernorByGovernorId(governorId);
    if (!governor) {
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          {
            title: `This governor doesn't exist`,
            color: 0xff0000,
            fields: [],
          },
        ],
      });
    }
    await this.getGovernorInfo(governor, interaction);
  }
  private async getGovernorInfo(
    governor: Governor,
    interaction: ChatInputCommandInteraction,
  ) {
    if (!governor) {
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          {
            title: `You don't have a governor linked to your discord account.\nUse \`/create-governor\` to create one.`,
            color: 0xff0000,
            fields: [],
          },
        ],
      });
    }
    const points = parseInt(`${governor.points}`);
    const kvkInfo = governor.kvks.find((kvk) => kvk.activeKvk)
      ? this.getActiveKvkEmbed(governor)
      : this.getLastKvkEmbed(governor);

    await interaction.reply({
      ephemeral: true,
      embeds: [
        {
          title: `🛡️ Governor Info 🛡️`,
          description: `# ${governor.governorName}
          > **🪪 Governor Id** : ${governor.governorId}
          > **🏦 Point balance**: ${points.toLocaleString('de-DE')}`,
          color: 0xa632a8,
        },
        ...(governor.kvks.length > 0 ? kvkInfo : []),
      ],
    });
  }
  private getActiveKvkEmbed(governor: Governor) {
    const { kvks = [] } = governor;
    const {
      matchMakingPower = 0,
      t4Kills = 0,
      t5Kills = 0,
    } = kvks.find((kvk) => kvk.activeKvk) ?? {};
    const requirementIndex =
      Number(matchMakingPower) > 150_000_000
        ? requirements.length - 1
        : Number(matchMakingPower) < 40_000_000
          ? 0
          : Math.floor((Number(matchMakingPower) - 40_000_000) / 5_000_000) + 1;
    const killProgress =
      ((Number(t4Kills) + Number(t5Kills)) /
        requirements[requirementIndex].killRequirement) *
      100;
    const [killProgressBar, killProgressPercentage] = filledBar(
      100,
      killProgress,
      20,
      '░',
      '▓',
    );
    return [
      {
        title: ``,
        description: `
      # ⚔️ KVK Requirements ⚔️
      > # ${Number(matchMakingPower).toLocaleString('de-DE').trim()}
      > *Matchmaking Power 💪*
      ## -
      > # ${Number(requirements[requirementIndex].powerLoss).toLocaleString(
        'de-DE',
      )} **
      > *Required Power Drop 📉*
      ## -
      ## Minimum Required Kills 💀
      > ${(Number(t4Kills) + Number(t5Kills)).toLocaleString(
        'de-DE',
      )} / **${requirements[requirementIndex].killRequirement.toLocaleString(
        'de-DE',
      )}**\n> ${killProgressBar} ${Number(killProgressPercentage).toFixed(
        2,
      )}%\n`,
        color:
          killProgress < 50
            ? 0xff0000
            : killProgress < 75
              ? 0xffbf00
              : 0x00ff00,
      },
    ];
  }
  private getLastKvkEmbed(governor: Governor) {
    const { kvks = [] } = governor;
    const {
      matchMakingPower = 0,
      t4Kills = 0,
      t5Kills = 0,
      powerLoss = 0,
      endDate,
    } = kvks
      .filter((kvk) => !kvk.activeKvk)
      .sort(
        (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
      )[0] ?? {};
    const requirementIndex =
      Number(matchMakingPower) > 150_000_000
        ? requirements.length - 1
        : Number(matchMakingPower) < 40_000_000
          ? 0
          : Math.floor((Number(matchMakingPower) - 40_000_000) / 5_000_000) + 1;
    const killProgress =
      ((Number(t4Kills) + Number(t5Kills)) /
        requirements[requirementIndex].killRequirement) *
      100;
    const [killProgressBar, killProgressPercentage] = filledBar(
      100,
      killProgress,
      10,
      '░',
      '▓',
    );
    const powerlossProgress =
      (Number(powerLoss) / requirements[requirementIndex].powerLoss) * 100;

    const [powerLossProgressBar, powerLossProgressPercentage] = filledBar(
      100,
      powerlossProgress,
      10,
      '░',
      '▓',
    );
    const powerLossSection = `> ${powerLossProgressBar} ${Number(
      powerLossProgressPercentage,
    ).toFixed(2)}%`;
    return [
      {
        title: ``,
        description: `
      # ⚔️ KVK Requirements ⚔️
      ### (finished: ${new Date(endDate).toLocaleDateString('de-DE')})
      > # ${Number(matchMakingPower).toLocaleString('de-DE').trim()}
      > *Matchmaking Power 💪*
      ## -
      ## Required Power Drop 📉
      > ${Number(powerLoss).toLocaleString('de-DE')} / ** ${Number(
        requirements[requirementIndex].powerLoss,
      ).toLocaleString('de-DE')} **
      ${powerLossSection}
      ## -
      ## Minimum Required Kills 💀
      > ${(Number(t4Kills) + Number(t5Kills)).toLocaleString(
        'de-DE',
      )} / **${requirements[requirementIndex].killRequirement.toLocaleString(
        'de-DE',
      )}**\n> ${killProgressBar} ${Number(killProgressPercentage).toFixed(
        2,
      )}%\n`,
        color:
          killProgress < 50
            ? 0xff0000
            : killProgress < 75
              ? 0xffbf00
              : 0x00ff00,
      },
      {
        title: ``,
        description: `
          ## ${
            killProgress < 50
              ? '❌ DEADWEIGHT'
              : killProgress < 75
                ? `⚠️ Close enough, but could've been better`
                : '✅ Good job'
          }
        `,
        color:
          killProgress < 50
            ? 0xff0000
            : killProgress < 75
              ? 0xffbf00
              : 0x00ff00,
      },
    ];
  }
}
