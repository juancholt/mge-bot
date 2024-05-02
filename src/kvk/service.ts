import { Inject, Injectable } from '@nestjs/common';
import { KVK } from 'src/entity/KVK';
import { Repository } from 'typeorm';
import { KVK_REPOSITORY } from './constants';

@Injectable()
export class KVKService {
  constructor(
    @Inject(KVK_REPOSITORY)
    private readonly kvkRepository: Repository<KVK>,
  ) {}
  async createKvk(kvk: KVK) {
    kvk.activeKvk = true;
    return await this.kvkRepository.save(kvk);
  }
  async updateStats(
    kvk: KVK,
    t4Kills: number,
    t5Kills: number,
    deadTroops: number,
  ) {
    kvk.deadTroops = deadTroops;
    kvk.t4Kills = t4Kills;
    kvk.t5Kills = t5Kills;
    kvk.score = t4Kills + t5Kills * 2 + deadTroops * 5;
    return await this.kvkRepository.save(kvk);
  }
  async endKvk(kvk: KVK) {
    kvk.activeKvk = false;
    return await this.kvkRepository.save(kvk);
  }
  async getAllActiveKvkStats() {
    return await this.kvkRepository.findBy({
      activeKvk: true,
    });
  }
}
