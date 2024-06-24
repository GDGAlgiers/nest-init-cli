/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';
import { PrismaConfigCommand } from './commands/prisma-config.command';
import { PackageManagerService } from './utils/packageManager.service';
import { FileManagerService } from './utils/fileManager.service';
import { TypeOrmConfigCommand } from './commands/typeOrm-config.command';
import { MongooseConfigCommand } from './commands/mongoose-config.command';
import { CommandExecutionService } from './utils/commandExecutionService.service';
import { SequelizeConfigCommand } from './commands/sequelize-config.command';
import { MikroOrmConfigCommand } from './commands/mikro-orm-config.command';
@Module({
providers:[SequelizeConfigCommand, MikroOrmConfigCommand,PrismaConfigCommand,TypeOrmConfigCommand, MongooseConfigCommand,PackageManagerService,CommandExecutionService, FileManagerService],
imports:[ CommandRunnerModule],
})
export class AppModule {}
