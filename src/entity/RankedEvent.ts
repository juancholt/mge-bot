import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bid } from './Bid';

const RankedEventStatuses = ['active', 'finished'] as const;
export type RankedEventStatus = (typeof RankedEventStatuses)[number];

export const RankedEventTypes = [
  'Cavalry MGE',
  'Infantry MGE',
  'Archers MGE',
  'Leadership MGE',
  'Gold Head Event',
] as const;
export type RankedEventType = (typeof RankedEventTypes)[number];

@Entity()
export class RankedEvent extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('smallint')
  places: number;

  @Column('int')
  minimumScore: number;

  @Column({
    type: 'enum',
    enum: RankedEventStatuses,
    default: 'finished',
  })
  status: RankedEventStatus;

  @Column({
    type: 'enum',
    enum: RankedEventTypes,
  })
  type: RankedEventType;

  @OneToMany(() => Bid, (bid) => bid.rankedEvent)
  bids: Bid[];
}
