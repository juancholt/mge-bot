import { Inject, Injectable } from '@nestjs/common';
import { GOVERNOR_REPOSITORY } from './constants';
import { Repository } from 'typeorm';
import { Governor } from 'src/entity/Governor';

@Injectable()
export class GovernorService {
  constructor(
    @Inject(GOVERNOR_REPOSITORY)
    private readonly governorRepository: Repository<Governor>,
  ) {}
  async createGovernor(governor: Governor) {
    return await this.governorRepository.save(governor);
  }
  async updateGovernor(governor: Governor) {
    return await this.governorRepository.save(governor);
  }
  async findGovernorByGovernorId(governorId: string) {
    return await this.governorRepository.findOneBy({ governorId });
  }
  async findGovernorByDiscordId(discordId: string) {
    return await this.governorRepository.findOneBy({ discordId });
  }
  async resetPointsForAllGovernors() {
    await this.governorRepository.update({}, { points: '0' });
  }
  async assignPointsToGovernor(governorId: string, points: string) {
    await this.governorRepository.update({ governorId }, { points });
  }
}
