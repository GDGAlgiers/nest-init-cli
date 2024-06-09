/* eslint-disable prettier/prettier */
 import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';

import { PrismaConfigCommand } from './commands/prisma-config.command';
import { PackageManagerService } from './utils/packageManager.service';
import { FileManagerService } from './utils/fileManager.service';
import { TypeOrmConfigCommand } from './commands/typeOrm-config.command';
@Module({
providers:[PrismaConfigCommand,TypeOrmConfigCommand, PackageManagerService, FileManagerService],
  imports: [CommandRunnerModule],
})
export class AppModule {}
