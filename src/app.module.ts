import { KnexPostgresModule } from './datasource/knex.postgresql.module';
     /* eslint-disable prettier/prettier */
 import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';
import { PrismaConfigCommand } from './commands/prisma-config.command';
import { PackageManagerService } from './utils/packageManager.service';
import { FileManagerService } from './utils/fileManager.service';
import { TypeOrmConfigCommand } from './commands/typeOrm-config.command';
import { KnexOrmConfigCommand } from './commands/knexOrm-config.command';
@Module({
providers:[PrismaConfigCommand,TypeOrmConfigCommand,KnexOrmConfigCommand, PackageManagerService, FileManagerService],
imports:[KnexPostgresModule,  CommandRunnerModule,],
})
export class AppModule {}
