import { Injectable } from '@nestjs/common';
import { Attachment } from 'discord.js';
import {
  AttachmentOption,
  Context,
  Options,
  SlashCommand,
  SlashCommandContext,
  StringOption,
} from 'necord';
import { Governor } from 'src/entity/Governor';
import { KVKStats } from 'src/entity/KVKStat';
import { GovernorService } from 'src/governor/service';
import { downloadAndSplitInRows } from 'src/utils/file-downloader';
import { KVKStatsService } from './kvk_stats.service';
import Decimal from 'decimal.js-light';
import { KVKType, KVKTypes } from 'src/entity/KVK';

export class CreateKvkOptions {
  @StringOption({
    name: 'type',
    description: 'Type of KVK',
    choices: KVKTypes.map((type) => ({ name: type, value: type })),
    required: true,
  })
  type: KVKType;
}
@Injectable()
export class KvkCommands {
  constructor(
    private readonly kvkService: KVKStatsService,
    private readonly governorService: GovernorService,
  ) {}

  @SlashCommand({
    name: 'create-kvk',
    description: 'Creates a new KVK, and sets it as active',
    defaultMemberPermissions: 'Administrator',
    guilds: ['1111240948446416896'],
  })
  public async onCreateKVK(
    @Context() [interaction]: SlashCommandContext,
    @Options() { type }: CreateKvkOptions,
  ) {
    const currentActiveKVK = await this.kvkService.getActiveKVK();
    if (currentActiveKVK) {
      currentActiveKVK.active = false;
      await this.kvkService.updateKvk(currentActiveKVK);
    }
    const newKVK = new KVKStats();
    newKVK.activeKvk = true;
    newKVK.type = type;
    await this.kvkService.createKvk(newKVK);
    return interaction.reply({
      ephemeral: true,
      embeds: [
        {
          title: `KVK ${type} succesfully created`,
          color: 0x00ff00,
        },
      ],
    });
  }

  @SlashCommand({
    name: 'batch-set-stats',
    description: 'Creates/Updates stats for a list of governors from a csv',
    defaultMemberPermissions: 'Administrator',
    guilds: ['1111240948446416896'],
  })
  public async onBatchSetStats(
    @Context() [interaction]: SlashCommandContext,
    @Options() { file }: BatchSetStatsDto,
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
          ? currentGovernor.kvks.find((kvk) => kvk.activeKvk) ?? new KVKStats()
          : new KVKStats();
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
    guilds: ['1111240948446416896'],
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
    guilds: ['1111240948446416896'],
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
