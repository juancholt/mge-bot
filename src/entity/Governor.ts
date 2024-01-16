import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bid } from './Bid';

@Entity()
export class Governor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    nullable: true,
    default: null,
  })
  discordId: string | null;

  @Column({
    unique: true,
  })
  governorId: string;

  @Column({
    length: 30,
  })
  governorName: string;

  @Column('bigint')
  points: number;

  @Column('bigint')
  power: number;

  @Column('date')
  lastPowerUpdate: Date;

  @OneToMany(() => Bid, (bid) => bid.governor)
  bids: Bid[];
}
