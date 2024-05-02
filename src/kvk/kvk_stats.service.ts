import { Inject, Injectable } from '@nestjs/common';
import { KVKStat } from 'src/entity/KVKStat';
import { Repository } from 'typeorm';
import { KVK_REPOSITORY } from './constants';

@Injectable()
export class KVKStatsService {
  constructor(
    @Inject(KVK_REPOSITORY)
    private readonly kvkRepository: Repository<KVKStat>,
  ) {}
  async createKvk(kvk: KVKStat) {
    kvk.activeKvk = true;
    return await this.kvkRepository.save(kvk);
  }
  async updateStats(
    kvk: KVKStat,
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
  async endKvk(kvk: KVKStat) {
    kvk.activeKvk = false;
    return await this.kvkRepository.save(kvk);
  }
}
