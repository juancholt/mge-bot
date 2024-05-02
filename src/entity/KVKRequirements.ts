import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { KVK } from './KVK';

@Entity()
export class KVKRequirement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', default: 0 })
  minimumPower: number;

  @Column({ type: 'bigint', nullable: true })
  maximumPower: number;

  @Column({ type: 'bigint', default: 0 })
  requiredPowerLoss: number;

  @Column({ type: 'bigint', default: 0 })
  requiredKills: number;

  @ManyToOne(() => KVK, (kvk) => kvk.kvkRequirements)
  @JoinColumn({ name: 'kvkId', referencedColumnName: 'id' })
  kvk: KVK;
}
