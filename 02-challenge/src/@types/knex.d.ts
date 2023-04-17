// eslint-disable-next-line
import { Knex } from 'knex';

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string;
      name: string;
      description?: string;
      timestamp: string;
      in_diet: boolean;
      session_id?: string;
    };
  }
}
