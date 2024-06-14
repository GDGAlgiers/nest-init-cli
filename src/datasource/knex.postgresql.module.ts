import * as Knex from 'knex';
import { Module } from '@nestjs/common';

export const knexProvider = {
  provide: 'KnexConnection',
  useFactory: async () => {
    const knexConnection = Knex({
      client: 'pg',
      connection: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '20032003',
        database: 'test',
      },
    });

    try {
      await knexConnection.raw('SELECT 1'); // Test connection
      console.log('Knex connected to PostgreSQL database successfully');
    } catch (error) {
      console.error('Error connecting to PostgreSQL database:', error);
      throw error;
    }

    return knexConnection;
  },
};

@Module({
  providers: [knexProvider],
  exports: ['KnexConnection'],
})
export class KnexPostgresModule {}
