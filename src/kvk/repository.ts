import { DATA_SOURCE } from 'src/database/constants';
import { KVK } from 'src/entity/KVK';
import { DataSource } from 'typeorm';
import { KVK_REPOSITORY } from './constants';

export const KvkRepository = [
  {
    provide: KVK_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(KVK),
    inject: [DATA_SOURCE],
  },
];
