import { AuthModule } from './auth/auth.module';
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
import { AuthConfigCommand } from './commands/auth-config.command';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthFileManager } from './authStrategyMethods/authFileManager';
import { FileManager } from './authStrategyMethods/utils/fileManager';

import { MikroOrmConfigCommand } from './commands/mikro-orm-config.command';
@Module({
  providers: [
    AuthFileManager,
    AuthConfigCommand,
    SequelizeConfigCommand,
    MikroOrmConfigCommand,
    PrismaConfigCommand,
    TypeOrmConfigCommand,
    MongooseConfigCommand,
    PackageManagerService,
    CommandExecutionService,
    FileManagerService,
    FileManager,
    AppService,
  ],
  imports: [AuthModule, CommandRunnerModule, UsersModule],
  controllers: [AppController],
})
export class AppModule {}
