/* eslint-disable prettier/prettier */
import { Command, CommandRunner } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { PackageManagerService } from '../utils/packageManager.service';
import { writeFile } from 'fs/promises';
import { FileManagerService } from 'src/utils/fileManager.service';

@Command({ name: 'install-mongoose', description: 'Install Mongoose' })
export class MongooseConfigCommand extends CommandRunner {
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,
  ) {
    super();
  }
  private readonly mongooseServiceContenu = `
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongooseService implements OnModuleInit, OnModuleDestroy {
    constructor(@InjectConnection() private readonly connection: Connection) {}

    async onModuleInit() {
        await this.connection.openUri(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    }

    async onModuleDestroy() {
        await this.connection.close();
        console.log('Disconnected from MongoDB');
    }
}`;
  private schemaContent: string;
  async run(): Promise<void> {
    try {
        await this.installMongooseDependencies();
        await writeFile(
            join(process.cwd(), 'src', 'Mongoose.service.ts'),
            this.mongooseServiceContenu,
        );
        const importMongooseModule = `import { MongooseModule } from '@nestjs/mongoose';`;
        const mongooseImport =`MongooseModule.forRoot(process.env.MONGO_URI)`
        const importMongooseService = `import { MongooseService } from './mongoose.service'; `;
        const mongooseProvider ="MongooseService"

        await this.fileManagerService.addImportsToAppModule(importMongooseModule,mongooseImport);
        await this.fileManagerService.addProviderToAppModule(importMongooseService,mongooseProvider);
        console.log("mongoose configured succefully")
    } catch (err) {
      console.error(err);
    }
  }

  private async installMongooseDependencies(): Promise<void> {
    const spinner = new Spinner('Installing Mongoose... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependency('mongoose', true);
    await this.packageManagerService.installDependency('@nestjs/mongoose');
    spinner.stop(true);
    console.log('Mongoose installed successfully!');
  }
}
