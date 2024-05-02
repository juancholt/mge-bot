import { DATA_SOURCE } from 'src/database/constants';
import { KVKStats } from 'src/entity/KVKStat';
import { DataSource } from 'typeorm';
import { KVK_REPOSITORY } from './constants';

export const KvkRepository = [
  {
    provide: KVK_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(KVKStats),
    inject: [DATA_SOURCE],
  },
];
