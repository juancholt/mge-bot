import { Injectable } from '@nestjs/common';
import {
  Context,
  IntegerOption,
  Options,
  SlashCommand,
  SlashCommandContext,
  StringOption,
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

  @IntegerOption({
    name: 'minimum-rank-desired',
    description:
      "If you get a rank lower than this, you'll get your points back",

    choices: [
      { name: 'Minimum top 5', value: 5 },
      { name: 'Minimum top 10', value: 10 },
      { name: 'Minimum top 15', value: 15 },
    ],
    required: true,
  })
  rank: number;
}

export class CancelBidDto {
  @StringOption({
    name: 'governor-id',
    description: 'Governor id to cancel current bid',
    required: true,
  })
  governorId: string;
}
@Injectable()
export class BidCommands {
  constructor(
    private readonly bidService: BidService,
    private readonly governorService: GovernorService,
    private readonly rankedEventService: RankedEventService,
  ) {}

  @SlashCommand({
    name: 'get-current-bid',
    description: 'Get your current bid for the active event',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onGetCurrentBid(@Context() [interaction]: SlashCommandContext) {
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
    const currentBid =
      await this.bidService.getCurrentEventBidForGovernor(governor);
    if (!currentBid) {
      await interaction.reply({
        embeds: [
          {
            title: `You don't have a bid for the current active event`,
            color: 0xff0000,
            fields: [],
          },
        ],
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      embeds: [
        {
          title: `Your current bid for the active event`,
          fields: [
            { name: 'Event:', value: `${currentActiveEvent.type}` },
            {
              name: 'Amount bidded:',
              value: `${currentBid.amount.toLocaleString('de-DE')}`,
            },
            {
              name: "Lowest rank you're bidding for:",
              value: `${currentBid.desiredRank}`,
            },
          ],
          color: 0x00ff00,
        },
      ],
      ephemeral: true,
    });
    return;
  }

  @SlashCommand({
    name: 'place-bid',
    description: 'Add a bid for the current active event',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onCreate(
    @Context() [interaction]: SlashCommandContext,
    @Options() { amount, rank }: CreateBidDto,
  ) {
    if (rank < 0) {
      await interaction.reply({
        embeds: [
          {
            title: `You can't bid for a negative rank`,
            color: 0xff0000,
            fields: [],
          },
        ],
        ephemeral: true,
      });
      return;
    }
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
      existingBid.desiredRank = rank;
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
              {
                name: "Lowest rank you're bidding for:",
                value: `${rank}`,
              },
            ],
            color: 0x00ff00,
          },
        ],
      });
      return;
    }
    if (amount < 100000) {
      await interaction.reply({
        embeds: [
          {
            title: `You can't bid less than 100.000 points`,
            color: 0xff0000,
            fields: [],
          },
        ],
        ephemeral: true,
      });
      return;
    }
    const newBid = new Bid();
    newBid.amount = amount;
    newBid.governor = governor;
    newBid.rankedEvent = currentActiveEvent;
    newBid.status = 'pending';
    newBid.desiredRank = rank;
    console.log({ newBid, governor });
    await this.bidService.createBid(newBid);
    // Update governor balance
    await this.governorService.updateGovernor(governor);
    await interaction.reply({
      embeds: [
        {
          title: `Succesfully added bid`,
          description:
            "You'll get your points back if you don't get the rank you bidded or higher",
          fields: [
            { name: 'Event:', value: `${currentActiveEvent.type}` },
            {
              name: 'Amount bidded:',
              value: `${amount.toLocaleString('de-DE')}`,
            },
            {
              name: "Lowest rank you're bidding for:",
              value: `${rank}`,
            },
          ],
          color: 0x00ff00,
        },
      ],
    });
    return;
  }
  @SlashCommand({
    name: 'cancel-bid-for',
    description: 'Cancel bid for a governor',
    defaultMemberPermissions: 'Administrator',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onCancelBid(
    @Context() [interaction]: SlashCommandContext,
    @Options() { governorId }: CancelBidDto,
  ) {
    const governor =
      await this.governorService.getGovernorByGovernorIdWithBids(governorId);
    const currentBid = governor.bids.find((bid) => bid.status === 'pending');
    this.bidService.closeBid(currentBid, false);
    return interaction.reply({
      embeds: [
        {
          title: `Succesfully cancelled bid`,
          color: 0x00ff00,
        },
        {
          title: `${governor.governorName}`,
          description: `Got ${currentBid.amount} points back`,
        },
      ],
    });
  }
}
