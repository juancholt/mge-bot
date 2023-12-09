import { AppDataSource } from '../data-source';
import { DATA_SOURCE } from './constants';

export const Database = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      return AppDataSource.initialize();
    },
  },
];
