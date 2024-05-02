import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Governor } from './Governor';
import { KVK } from './KVK';

@Entity({ name: 'kvk_stats' })
export class KVKStat {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updated_at: Date; // Last updated date

  @Column({ type: 'bigint', default: 0 })
  matchMakingPower: number;

  @Column({ type: 'bigint', default: 0 })
  t4Kills: number;

  @Column({ type: 'bigint', default: 0 })
  t5Kills: number;

  @Column({ type: 'bigint', default: 0 })
  deadTroops: number;

  @Column({ type: 'bigint', default: 0 })
  powerLoss: number;

  @Column({ type: 'bigint', default: 0 })
  score: number;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @ManyToOne(() => Governor, (governor) => governor.stats)
  @JoinColumn({ name: 'governorId', referencedColumnName: 'governorId' })
  governor: Governor;

  @ManyToOne(() => KVK, (kvk) => kvk.kvkStats)
  @JoinColumn({ name: 'kvkId', referencedColumnName: 'id' })
  kvk: KVK;
}
