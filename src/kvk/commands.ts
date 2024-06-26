import { Injectable } from '@nestjs/common';
import { Attachment } from 'discord.js';
import {
  AttachmentOption,
  Context,
  Options,
  SlashCommand,
  SlashCommandContext,
} from 'necord';
import { Governor } from 'src/entity/Governor';
import { KVK } from 'src/entity/KVK';
import { GovernorService } from 'src/governor/service';
import { downloadAndSplitInRows } from 'src/utils/file-downloader';
import { KVKService } from './service';
import Decimal from 'decimal.js-light';

export class BatchSetStatsDto {
  @AttachmentOption({
    name: 'file',
    description: 'CSV file containing governor ids and points',
    required: true,
  })
  file: Attachment;
}
@Injectable()
export class KvkCommands {
  constructor(
    private readonly kvkService: KVKService,
    private readonly governorService: GovernorService,
  ) {}

  @SlashCommand({
    name: 'batch-create_kvk-stats',
    description: 'Creates kvk stats for a list of governors from a csv',
    defaultMemberPermissions: 'Administrator',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onBatchSetStats(
    @Context() [interaction]: SlashCommandContext,
    @Options() { file }: BatchSetStatsDto,
  ) {
    const previousKvkStats =
      (await this.kvkService.getAllActiveKvkStats()) ?? [];
    await Promise.all(previousKvkStats.map(this.kvkService.endKvk));
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
      console.log(row);
      const [id, name, matchmakingPower, t4Kills, t5Kills, deadTroops] =
        row.split(',');
      let currentGovernor =
        await this.governorService.getGovernorByGovernorId(id);
      if (currentGovernor) {
        currentGovernor.governorName = name;
        await this.governorService.updateGovernor(currentGovernor);
      } else {
        currentGovernor = new Governor();
        currentGovernor.governorId = id;
        currentGovernor.governorName = name;
        currentGovernor.points = 0;
        await this.governorService.createGovernor(currentGovernor);
      }

      const currentKVK =
        (currentGovernor.kvks ?? []).length > 0
          ? currentGovernor.kvks.find((kvk) => kvk.activeKvk)
          : new KVK();
      currentKVK.matchMakingPower = Number(matchmakingPower);
      currentKVK.t4Kills = Number(t4Kills);
      currentKVK.t5Kills = Number(t5Kills);
      currentKVK.deadTroops = Number(deadTroops);
      currentKVK.score = 0;
      currentKVK.governor = currentGovernor;
      await this.kvkService.createKvk(currentKVK);
    });

    return interaction.reply({
      ephemeral: true,
      embeds: [
        {
          title: `KVK succesfully uploaded`,
          color: 0x00ff00,
        },
      ],
    });
  }

  @SlashCommand({
    name: 'end-kvk',
    description:
      'Creates/Updates stats for a list of governors from a csv and finishes kvk',
    defaultMemberPermissions: 'Administrator',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onEndKVK(
    @Context() [interaction]: SlashCommandContext,
    @Options() { file }: BatchSetStatsDto,
  ) {
    await interaction.deferReply();
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
      const [id, name, t4Kills, t5Kills, deadTroops, powerLoss] =
        row.split(',');
      let currentGovernor =
        await this.governorService.getGovernorByGovernorId(id);
      if (currentGovernor) {
        currentGovernor.governorName = name;
        await this.governorService.updateGovernor(currentGovernor);
      } else {
        currentGovernor = new Governor();
        currentGovernor.governorId = id;
        currentGovernor.governorName = name;
        currentGovernor.points = 0;
        await this.governorService.createGovernor(currentGovernor);
      }

      const currentKVK = currentGovernor.kvks.find((kvk) => kvk.activeKvk);
      if (!currentKVK) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            {
              title: `No active KVK found for governor ${currentGovernor.governorName}`,
              color: 0xff0000,
            },
          ],
        });
      }
      console.log({ t4Kills, t5Kills, deadTroops });
      const t4Decimal = new Decimal(t4Kills || 0);
      const t5Decimal = new Decimal(t5Kills || 0);
      const deadDecimal = new Decimal(deadTroops || 0);
      const score = t4Decimal
        .times(4)
        .plus(t5Decimal.times(8))
        .plus(deadDecimal.times(20))
        .toNumber();
      currentKVK.t5Kills = Number(t5Kills);
      currentKVK.t4Kills = Number(t4Kills);
      currentKVK.deadTroops = Number(deadTroops);
      currentKVK.powerLoss = Number(powerLoss);
      currentKVK.score = score;
      currentKVK.governor = currentGovernor;
      currentKVK.endDate = new Date().toISOString().split('T')[0];
      await this.kvkService.endKvk(currentKVK);
      const [lastKvk, secondToLastKvk] = currentGovernor.kvks.sort(
        (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
      );
      if (lastKvk && !secondToLastKvk) {
        currentGovernor.points += lastKvk.score;
        await this.governorService.updateGovernor(currentGovernor);
      }
      if (lastKvk && secondToLastKvk) {
        const lastKvkScore = lastKvk.score;
        const secondToLastKvkScore = secondToLastKvk.score;

        currentGovernor.points += lastKvkScore;
        if (currentGovernor.points > lastKvkScore + secondToLastKvkScore) {
          currentGovernor.points = lastKvkScore + secondToLastKvkScore;
        }
        await this.governorService.updateGovernor(currentGovernor);
      }
    });

    return interaction.followUp({
      ephemeral: true,
      embeds: [
        {
          title: `KVK succesfully uploaded`,
          color: 0x00ff00,
        },
      ],
    });
  }

  @SlashCommand({
    name: 'batch-update-stats',
    description: 'Creates/Updates stats for a list of governors from a csv',
    defaultMemberPermissions: 'Administrator',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onBatchUpdateStats(
    @Context() [interaction]: SlashCommandContext,
    @Options() { file }: BatchSetStatsDto,
  ) {
    await interaction.deferReply();
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
      console.log(row);
      const [id, name, t4Kills, t5Kills, deadTroops] = row.split(',');
      let currentGovernor =
        await this.governorService.getGovernorByGovernorId(id);
      if (currentGovernor) {
        currentGovernor.governorName = name;
        await this.governorService.updateGovernor(currentGovernor);
      } else {
        currentGovernor = new Governor();
        currentGovernor.governorId = id;
        currentGovernor.governorName = name;
        currentGovernor.points = 0;
        await this.governorService.createGovernor(currentGovernor);
      }

      const currentKVK = currentGovernor.kvks.find((kvk) => kvk.activeKvk);
      if (!currentKVK) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            {
              title: `No active KVK found for governor ${currentGovernor.governorName}`,
              color: 0xff0000,
            },
          ],
        });
      }
      currentKVK.t5Kills = Number(t5Kills);
      currentKVK.t4Kills = Number(t4Kills);
      currentKVK.deadTroops = Number(deadTroops);
      currentKVK.score = 0;
      currentKVK.governor = currentGovernor;
      await this.kvkService.createKvk(currentKVK);
    });

    return interaction.followUp({
      ephemeral: true,
      embeds: [
        {
          title: `KVK succesfully uploaded`,
          color: 0x00ff00,
        },
      ],
    });
  }
}
