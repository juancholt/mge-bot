import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bid } from './Bid';

@Entity()
export class Governor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  discordId: string;

  @Column({
    unique: true,
  })
  governorId: string;

  @Column({
    length: 30,
  })
  governorName: string;

  @Column('bigint')
  points: string;

  @OneToMany(() => Bid, (bid) => bid.governor)
  bids: Bid[];
}
