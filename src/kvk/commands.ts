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
    name: 'batch-set-stats',
    description: 'Creates/Updates stats for a list of governors from a csv',
    defaultMemberPermissions: 'Administrator',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onBatchUpdateStats(
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
}
