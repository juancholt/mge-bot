import { Injectable } from '@nestjs/common';
import {
  Context,
  IntegerOption,
  Options,
  SlashCommand,
  SlashCommandContext,
} from 'necord';
import { Bid } from 'src/entity/Bid';
import { GovernorService } from 'src/governor/service';
import { RankedEventService } from 'src/ranked-event/service';
import { BidService } from './service';

export class CreateBidDto {
  @IntegerOption({
    name: 'amount',
    description: 'Total amount of points to bid',
    required: true,
  })
  amount: number;
}

@Injectable()
export class BidCommands {
  constructor(
    private readonly bidService: BidService,
    private readonly governorService: GovernorService,
    private readonly rankedEventService: RankedEventService,
  ) {}

  @SlashCommand({
    name: 'place-bid',
    description: 'Add a bid for the current active event',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onCreate(
    @Context() [interaction]: SlashCommandContext,
    @Options() { amount }: CreateBidDto,
  ) {
    if (amount < 0) {
      await interaction.reply({
        embeds: [
          {
            title: `You can't bid a negative amount`,
            color: 0xff0000,
            fields: [],
          },
        ],
        ephemeral: true,
      });
      return;
    }
    const governor = await this.governorService.getGovernorByDiscordId(
      interaction.user.id,
    );
    const currentActiveEvent =
      await this.rankedEventService.getActiveRankedEvent();
    if (!currentActiveEvent) {
      await interaction.reply({
        embeds: [
          {
            title: `No active events currently`,
            color: 0xff0000,
            fields: [],
          },
        ],
        ephemeral: true,
      });
      return;
    }
    if (!governor) {
      await interaction.reply({
        embeds: [
          {
            title: `You don't have a governor linked to your discord account.\nUse \`/create-governor\` to create one.`,
            color: 0xff0000,
            fields: [],
          },
        ],
        ephemeral: true,
      });
      return;
    }
    const governorPoints = governor.points;
    if (governorPoints < amount) {
      await interaction.reply({
        embeds: [
          {
            title: `You don't have enough points to bid.`,
            color: 0xff0000,
            fields: [
              {
                name: 'Your Points',
                value: governorPoints.toLocaleString('de-DE'),
              },
              {
                name: 'Bid Amount',
                value: Number(amount).toLocaleString('de-DE'),
              },
            ],
          },
        ],
        ephemeral: true,
      });
      return;
    }
    governor.points = governorPoints - amount;
    const existingBid =
      await this.bidService.getCurrentEventBidForGovernor(governor);
    if (existingBid) {
      existingBid.amount = +existingBid.amount + amount;
      await this.bidService.createBid(existingBid);
      // Update governor balance
      await this.governorService.updateGovernor(governor);
      await interaction.reply({
        embeds: [
          {
            title: `Succesfully updated bid`,
            fields: [
              { name: 'Event:', value: `${currentActiveEvent.type}` },
              {
                name: 'Amount bidded:',
                value: `${existingBid.amount.toLocaleString('de-DE')}`,
              },
            ],
            color: 0x00ff00,
          },
        ],
      });
      return;
    }

    const newBid = new Bid();
    newBid.amount = amount;
    newBid.governor = governor;
    newBid.rankedEvent = currentActiveEvent;
    newBid.status = 'pending';
    await this.bidService.createBid(newBid);
    // Update governor balance
    await this.governorService.updateGovernor(governor);
    await interaction.reply({
      embeds: [
        {
          title: `Succesfully added bid`,
          fields: [
            { name: 'Event:', value: `${currentActiveEvent.type}` },
            {
              name: 'Amount bidded:',
              value: `${amount.toLocaleString('de-DE')}`,
            },
          ],
          color: 0x00ff00,
        },
      ],
    });
    return;
  }
}
