import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KVKRequirement } from './KVKRequirements';
import { KVKStat } from './KVKStat';

export const KVKTypes = [
  'Tides of War',
  'Strife of the Eight',
  'Warriors Unbound',
  'King of the Nile',
  'Heroic Anthem',
  'Siege of Orleans',
  'Alliance Invictus',
  'Storm of Stratagems',
  'Desert Conquest',
] as const;
export type KVKType = (typeof KVKTypes)[number];

@Entity()
export class KVK {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updated_at: Date; // Last updated date

  @Column({ enum: KVKTypes, type: 'enum' })
  type: KVKType;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column('boolean')
  active: boolean;

  @OneToMany(() => KVKStat, (kvkStat) => kvkStat.kvk)
  kvkStats: KVKStat[];

  @OneToMany(() => KVKRequirement, (kvkRequirement) => kvkRequirement.kvk)
  kvkRequirements: KVKRequirement[];
}
