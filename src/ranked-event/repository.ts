import { DataSource } from 'typeorm';
import { DATA_SOURCE } from 'src/database/constants';
import { RANKED_EVENT_REPOSITORY } from './constants';
import { RankedEvent } from 'src/entity/RankedEvent';

export const RankedEventRepository = [
  {
    provide: RANKED_EVENT_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(RankedEvent),
    inject: [DATA_SOURCE],
  },
];
