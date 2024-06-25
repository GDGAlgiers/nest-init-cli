import { AuthModule } from './auth/auth.module';
  /* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';
import { PrismaConfigCommand } from './commands/prisma-config.command';
import { PackageManagerService } from './utils/packageManager.service';
import { FileManagerService } from './utils/fileManager.service';
import { TypeOrmConfigCommand } from './commands/typeOrm-config.command';
import { SequelizeConfigCommand } from './commands/sequelize-config.command';
import { AuthConfigCommand } from './commands/auth-config.command';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthFileManager } from './authStrategyMethods/authFileManager';
import { FileManager } from './authStrategyMethods/utils/fileManager';

@Module({
providers:[AuthFileManager,AuthConfigCommand,SequelizeConfigCommand,PrismaConfigCommand,TypeOrmConfigCommand, PackageManagerService, FileManagerService,FileManager,AppService],
imports:[AuthModule,  CommandRunnerModule, UsersModule,],
controllers: [AppController],
})
export class AppModule {}
