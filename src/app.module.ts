/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';
import { PrismaConfigCommand } from './commands/prisma-config.command';
import { PackageManagerService } from './utils/packageManager.service';
import { FileManagerService } from './utils/fileManager.service';
import { TypeOrmConfigCommand } from './commands/typeOrm-config.command';
import { DrizzleConfigCommand } from './commands/drizzle-config.command';
import { MongooseConfigCommand } from './commands/mongoose-config.command';
import { CommandExecutionService } from './utils/commandExecutionService.service';
import { SequelizeConfigCommand } from './commands/sequelize-config.command';
import { AuthConfigCommand } from './commands/auth-config.command';
import { AppController } from './app.controller';
import { FileManager } from './authStrategyMethods/utils/fileManager';
import { AppService } from './app.service';
import { AuthFileManager } from './authStrategyMethods/authFileManager';
import { MikroOrmConfigCommand } from './commands/mikro-orm-config.command';
import { ConfigureCommand } from './commands/configure.command';

@Module({
  imports: [CommandRunnerModule],
  providers: [
    ConfigureCommand,
    PrismaConfigCommand,
    TypeOrmConfigCommand,
    DrizzleConfigCommand,
    MongooseConfigCommand,
    SequelizeConfigCommand,
    AuthConfigCommand,
    MikroOrmConfigCommand,
    PackageManagerService,
    FileManagerService,
    CommandExecutionService,
    FileManager,
    AuthFileManager,
    AppService,
  ],
  controllers: [AppController],
})
export class AppModule {}
