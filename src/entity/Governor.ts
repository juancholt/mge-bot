import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bid } from './Bid';
import { KVK } from './KVK';

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

  @OneToMany(() => Bid, (bid) => bid.governor)
  bids: Bid[];

  @OneToMany(() => KVK, (kvk) => kvk.governor)
  kvks: KVK[];
}
