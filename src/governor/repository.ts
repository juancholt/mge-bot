import { DataSource } from 'typeorm';
import { GOVERNOR_REPOSITORY } from './constants';
import { DATA_SOURCE } from 'src/database/constants';
import { Governor } from 'src/entity/Governor';

export const GovernorRepository = [
  {
    provide: GOVERNOR_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Governor),
    inject: [DATA_SOURCE],
  },
];
