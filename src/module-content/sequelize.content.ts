/* eslint-disable prettier/prettier */
// src/module-content/sequelize.content.ts
export const SequelizeMySqlModuleContent = `
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'mysql',
        host: process.env.MYSQL_HOST || configService.get<string>('MYSQL_HOST'),
        port: Number(process.env.MYSQL_PORT) || configService.get<number>('MYSQL_PORT'),
        username: process.env.MYSQL_USER || configService.get<string>('MYSQL_USER'),
        password: process.env.MYSQL_PASSWORD || configService.get<string>('MYSQL_PASSWORD'),
        database: process.env.MYSQL_DB || configService.get<string>('MYSQL_DB'),
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseMySqlModule {}`;

export const SequelizePostgresModuleContent = `
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: process.env.POSTGRES_HOST || configService.get<string>('POSTGRES_HOST'),
        port: Number(process.env.POSTGRES_PORT) || configService.get<number>('POSTGRES_PORT'),
        username: process.env.POSTGRES_USER || configService.get<string>('POSTGRES_USER'),
        password: process.env.POSTGRES_PASSWORD || configService.get<string>('POSTGRES_PASSWORD'),
        database: process.env.POSTGRES_DB || configService.get<string>('POSTGRES_DB'),
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
  ],
})
export class DatabasePostgresModule {}`;
