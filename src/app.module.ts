/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';
import { PrismaConfigCommand } from './commands/prisma-config.command';
import { PackageManagerService } from './utils/packageManager.service';
import { FileManagerService } from './utils/fileManager.service';
import { TypeOrmConfigCommand } from './commands/typeOrm-config.command';
import { MongooseConfigCommand } from './commands/mongoose-config.command';
import { CommandExecutionService } from './utils/commandExecutionService.service';
@Module({
  providers:[PrismaConfigCommand, MongooseConfigCommand, TypeOrmConfigCommand, PackageManagerService, FileManagerService, CommandExecutionService],
  imports:[CommandRunnerModule],
})
export class AppModule {}
