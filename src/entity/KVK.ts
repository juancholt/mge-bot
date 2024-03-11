import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Governor } from './Governor';

@Entity()
export class KVK {
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

  @Column('boolean')
  activeKvk: boolean;

  @Column({ type: 'bigint', default: 0 })
  score: number;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @ManyToOne(() => Governor, (governor) => governor.kvks)
  @JoinColumn({ name: 'governorId', referencedColumnName: 'governorId' })
  governor: Governor;
}
