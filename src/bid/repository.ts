import { DATA_SOURCE } from 'src/database/constants';
import { Bid } from 'src/entity/Bid';
import { DataSource } from 'typeorm';
import { BID_REPOSITORY } from './constants';

export const BidRepository = [
  {
    provide: BID_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Bid),
    inject: [DATA_SOURCE],
  },
];
