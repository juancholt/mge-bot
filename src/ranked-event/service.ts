import { Inject, Injectable } from '@nestjs/common';
import { RankedEvent } from 'src/entity/RankedEvent';
import { Repository } from 'typeorm';
import { RANKED_EVENT_REPOSITORY } from './constants';

@Injectable()
export class RankedEventService {
  constructor(
    @Inject(RANKED_EVENT_REPOSITORY)
    private readonly rankedEventRepository: Repository<RankedEvent>,
  ) {}

  async createRankedEvent(rankedEvent: RankedEvent) {
    return await this.rankedEventRepository.save(rankedEvent);
  }

  async getActiveRankedEvent() {
    return await this.rankedEventRepository.findOne({
      where: { status: 'active' },
      relations: ['bids', 'bids.governor'],
    });
  }

  async activateEvent(id: number) {
    const rankedEvent = await this.rankedEventRepository.findOneBy({
      id,
    });
    rankedEvent.status = 'active';
    const previousActiveEvents = await this.rankedEventRepository.findBy({
      status: 'active',
    });
    previousActiveEvents.forEach((event) => {
      event.status = 'finished';
    });
    await this.rankedEventRepository.save(previousActiveEvents);
    return await this.rankedEventRepository.save(rankedEvent);
  }

  async terminateRankedEvent(rankedEvent: RankedEvent) {
    rankedEvent.status = 'finished';
    return await this.rankedEventRepository.save(rankedEvent);
  }
}
