import { Injectable } from '@nestjs/common';
import { ButtonStyle } from 'discord.js';
import {
  Button,
  ButtonContext,
  ComponentParam,
  Context,
  IntegerOption,
  Options,
  SlashCommand,
  SlashCommandContext,
  StringOption,
} from 'necord';
import {
  RankedEvent,
  RankedEventType,
  RankedEventTypes,
} from 'src/entity/RankedEvent';
import { RankedEventService } from './service';
import { Bid } from 'src/entity/Bid';
import { BidService } from 'src/bid/service';

export class CreateRankedEventDto {
  @StringOption({
    name: 'type',
    description: 'Type of Event',
    choices: RankedEventTypes.map((type) => ({ name: type, value: type })),
    required: true,
  })
  type: RankedEventType;

  @IntegerOption({
    name: 'places-awarded',
    description: 'Set the number of places awarded for the event',
    required: true,
  })
  places: number;

  @IntegerOption({
    name: 'minimum-score',
    description: 'Set a minimum score for the event',
    required: true,
  })
  minimumScore: number;
}
const ACCEPTED = true;
const REJECTED = false;
const TypeMap: Record<string, RankedEventType> = {
  cav: 'Cavalry MGE',
  inf: 'Infantry MGE',
  arc: 'Archers MGE',
  lea: 'Leadership MGE',
  gh: 'Gold Head Event',
};
const ReverseTypeMap = {} as Record<RankedEventType, string>;
Object.entries(TypeMap).forEach(
  ([value, key]) => {
    ReverseTypeMap[key] = value;
  },
  {} as Record<string, string>,
);

@Injectable()
export class RankedEventCommands {
  constructor(
    private readonly rankedEventService: RankedEventService,
    private readonly bidService: BidService,
  ) {}

  async createRankedEvent({
    minimumScore,
    places,
    type,
  }: CreateRankedEventDto): Promise<RankedEvent> {
    const newRankedEvent = new RankedEvent();
    newRankedEvent.minimumScore = minimumScore;
    newRankedEvent.places = places;
    newRankedEvent.type = type;
    const event =
      await this.rankedEventService.createRankedEvent(newRankedEvent);

    return await this.rankedEventService.activateEvent(event.id);
  }

  @SlashCommand({
    name: 'create-ranked-event',
    description: 'Creates a new ranked event',
    defaultMemberPermissions: 'Administrator',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onCreate(
    @Context() [interaction]: SlashCommandContext,
    @Options() { minimumScore, places, type }: CreateRankedEventDto,
  ) {
    const newRankedEvent = new RankedEvent();
    newRankedEvent.minimumScore = minimumScore;
    newRankedEvent.places = places;
    newRankedEvent.type = type;
    const previousActiveEvent =
      await this.rankedEventService.getActiveRankedEvent();
    if (previousActiveEvent) {
      console.log(
        `create-event/${ReverseTypeMap[type]}/${places}/${minimumScore}`,
      );
      await interaction.reply({
        ephemeral: true,
        content: `There's already an active event. Creating a new one, will end the previous. Continue?`,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: 'Yes',
                style: ButtonStyle.Primary,
                custom_id: `create-event/${ReverseTypeMap[type]}/${places}/${minimumScore}`,
              },
              {
                type: 2,
                label: 'No',
                style: ButtonStyle.Secondary,
                custom_id: `cancel-event-creation`,
              },
            ],
          },
        ],
      });
      return;
    } else {
      await this.createRankedEvent({
        minimumScore,
        places,
        type,
      });
      await interaction.reply({
        embeds: [
          {
            title: `New ${type} created successfully`,
            fields: [
              { name: 'Places', value: `${places}` },
              {
                name: 'Minimum Score',
                value: `${minimumScore.toLocaleString('de-DE')}`,
              },
            ],
            color: 0x00ff00,
          },
        ],
      });
    }
  }
  @Button('cancel-event-creation')
  public async onCancel(@Context() [interaction]: ButtonContext) {
    await interaction.update({
      content: '',
      components: [],
      embeds: [
        {
          title: `Event not created`,
          color: 0xffbf00,
        },
      ],
    });
  }
  @Button('create-event/:type/:places/:score')
  public async onClickCreate(
    @Context() [interaction]: ButtonContext,
    @ComponentParam('type') type: string,
    @ComponentParam('places') rankedEventPlaces: number,
    @ComponentParam('score') rankedEventMinimumScore: number,
  ) {
    const currentActiveEvent =
      await this.rankedEventService.getActiveRankedEvent();
    const acceptedBids = await this.terminateBids(
      currentActiveEvent.bids,
      currentActiveEvent.places,
    );
    await this.rankedEventService.terminateRankedEvent(currentActiveEvent);
    await this.createRankedEvent({
      type: TypeMap[type],
      places: rankedEventPlaces,
      minimumScore: rankedEventMinimumScore,
    });
    await interaction.update({
      content: '',
      components: [],
      embeds: [
        {
          title: `New ${TypeMap[type]} created successfully`,
          fields: [
            { name: 'Places', value: `${rankedEventPlaces}` },
            {
              name: 'Minimum Score',
              value: `${rankedEventMinimumScore.toLocaleString('de-DE')}`,
            },
          ],
          color: 0x00ff00,
        },
        {
          title: `Previous ${currentActiveEvent.type} closed`,
          color: 0xffbf00,
          fields: acceptedBids.map((bid) => ({
            name: bid.governor.governorName,
            value: Number(bid.amount).toLocaleString('de-DE'),
            inline: true,
          })),
        },
      ],
    });
  }
  async terminateBids(bids: Bid[], places: number) {
    bids.sort((a, b) => b.amount - a.amount);
    let currentRank = 0;
    const updatedBids = bids.map(async (bid, index) => {
      console.log({ bid, places, index });
      if (currentRank < places) {
        if (currentRank + 1 > Number(bid.desiredRank)) {
          return await this.bidService.closeBid(bid, REJECTED);
        }
        currentRank++;
        return await this.bidService.closeBid(bid, ACCEPTED);
      } else {
        return await this.bidService.closeBid(bid, REJECTED);
      }
    });
    await Promise.all(updatedBids);
    return bids.filter((bid) => bid.status === 'accepted');
  }
  @SlashCommand({
    name: 'close-active-event',
    description: 'Close current event to stop receiving bids',
    defaultMemberPermissions: 'Administrator',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onCloseEvent(@Context() [interaction]: SlashCommandContext) {
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
    const acceptedBids = await this.terminateBids(
      currentActiveEvent.bids,
      currentActiveEvent.places,
    );
    await this.rankedEventService.terminateRankedEvent(currentActiveEvent);
    return interaction.reply({
      embeds: [
        {
          title: `Active ${currentActiveEvent.type} is now closed`,
          color: 0xffbf00,
          description: `Event winners:`,
          fields: acceptedBids.map((bid, idx) => ({
            name: `${idx + 1} - ${bid.governor.governorName}`,
            value: '',
          })),
        },
      ],
    });
  }
  @SlashCommand({
    name: 'active-event-info',
    description: 'Gets current event to information',
    guilds: ['1111240948446416896', process.env.GUILD_ID],
  })
  public async onGetInfo(@Context() [interaction]: SlashCommandContext) {
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
    const { places, bids } = currentActiveEvent;
    const topBids = bids
      .filter((bid) => bid.status === 'pending')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .filter((_bid, idx) => idx < places);
    return interaction.reply({
      embeds: [
        {
          title: `Active ${currentActiveEvent.type}`,
          color: 0xffbf00,
          fields: [
            {
              value: currentActiveEvent.minimumScore.toLocaleString('de-DE'),
              name: 'Minimum Score',
            },
            {
              value: `${currentActiveEvent.places}`,
              name: 'Places',
            },

            {
              value: `${currentActiveEvent.bids.length}`,
              name: 'Current bids',
            },
          ],
        },
        {
          title: `Rankings ${currentActiveEvent.type}`,
          color: 0xffbf00,
          fields: topBids.map((bid, idx) => ({
            value: `${idx + 1} - ${bid.governor.governorName} - ${Number(
              bid.amount,
            ).toLocaleString()}`,
            name: '',
          })),
        },
      ],
    });
  }
}
