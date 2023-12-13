import { Inject, Injectable } from '@nestjs/common';
import { Bid } from 'src/entity/Bid';
import { Repository } from 'typeorm';
import { BID_REPOSITORY } from './constants';
import { Governor } from 'src/entity/Governor';
import { GOVERNOR_REPOSITORY } from 'src/governor/constants';

@Injectable()
export class BidService {
  constructor(
    @Inject(BID_REPOSITORY)
    private readonly bidRepository: Repository<Bid>,
    @Inject(GOVERNOR_REPOSITORY)
    private readonly governorRepository: Repository<Governor>,
  ) {}

  async createBid(bid: Bid) {
    return await this.bidRepository.save(bid);
  }
  async getCurrentEventBidForGovernor(governor: Governor) {
    return await this.bidRepository.findOne({
      where: {
        rankedEvent: { status: 'active' },
        governor: { id: governor.id },
      },
      relations: ['governor', 'rankedEvent'],
    });
  }
  async closeBid(bid: Bid, isBidAccepted: boolean) {
    bid.status = isBidAccepted ? 'accepted' : 'rejected';
    const governor = bid.governor;

    if (!isBidAccepted) {
      governor.points = Number(governor.points) + Number(bid.amount);
    }
    await this.governorRepository.save(governor);
    return await this.bidRepository.save(bid);
  }
}
