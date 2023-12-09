import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RankedEvent } from './RankedEvent';
import { Governor } from './Governor';

@Entity()
@Index(['governor', 'rankedEvent'], { unique: true })
export class Bid extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  amount: string;

  @Column()
  status: 'pending' | 'accepted' | 'rejected';

  @ManyToOne(() => Governor, (governor) => governor.bids)
  @JoinColumn()
  governor: Governor;

  @ManyToOne(() => RankedEvent, (event) => event.bids)
  @JoinColumn()
  rankedEvent: RankedEvent;
}
