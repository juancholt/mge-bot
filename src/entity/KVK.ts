import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Governor } from './Governor';

@Entity()
export class KVK {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', default: 0 })
  matchMakingPower: number;

  @Column({ type: 'bigint', default: 0 })
  t4Kills: number;

  @Column({ type: 'bigint', default: 0 })
  t5Kills: number;

  @Column({ type: 'bigint', default: 0 })
  deadTroops: number;

  @Column('boolean')
  activeKvk: boolean;

  @Column({ type: 'bigint', default: 0 })
  score: number;

  @ManyToOne(() => Governor, (governor) => governor.kvks)
  @JoinColumn({ name: 'governorId', referencedColumnName: 'governorId' })
  governor: Governor;
}
