/* eslint-disable prettier/prettier */
 import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';

import { PrismaConfigCommand } from './commands/prisma-config.command';
import { PackageManagerService } from './utils/packageManager.service';
import { FileManagerService } from './utils/fileManager.service';
import { TypeOrmComfigCommand } from './commands/typeOrm-config.command';
@Module({
providers:[PrismaConfigCommand,TypeOrmComfigCommand, PackageManagerService, FileManagerService],
  imports: [CommandRunnerModule],
})
export class AppModule {}
