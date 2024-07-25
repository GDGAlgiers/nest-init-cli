/* eslint-disable prettier/prettier */
import { Command, CommandRunner } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { PackageManagerService } from '../utils/packageManager.service';
import { writeFile } from 'fs/promises';
import { FileManagerService } from 'src/utils/fileManager.service';
import { CommandExecutionService } from 'src/utils/commandExecutionService.service';
import { checkAndPromptEnvVariables } from 'src/utils/check-env-variables';
import { Injectable } from '@nestjs/common';

@Injectable()
@Command({ name: 'install-mongoose', description: 'Install Mongoose' })
export class MongooseConfigCommand extends CommandRunner {
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,
    private readonly commandExecutionService: CommandExecutionService,
  ) {
    super();
  }
  private readonly mongooseServiceContenu = `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongooseService implements OnModuleInit, OnModuleDestroy {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    await this.connection.openUri(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  }

  async onModuleDestroy() {
    await this.connection.close();
    console.log('Disconnected from MongoDB');
  }
}
`;
  private userSchemaContent = `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
`;
  async run(): Promise<void> {
    try {
      console.log('Configuring Mongoose...');
      await checkAndPromptEnvVariables('mongodb');
      await this.installMongooseDependencies();
      await writeFile(
        join(process.cwd(), 'src', 'Mongoose.service.ts'),
        this.mongooseServiceContenu,
      );
      const importMongooseModule = `import { MongooseModule } from '@nestjs/mongoose';`;
      const mongooseImport = `MongooseModule.forRoot(process.env.MONGODB_URI)`;
      const importMongooseService = `import { MongooseService } from './mongoose.service';`;
      const mongooseProvider = 'MongooseService';

      await this.fileManagerService.addProviderToAppModule(
        importMongooseService,
        mongooseProvider,
      );
      await this.fileManagerService.addImportsToAppModule(
        importMongooseModule,
        mongooseImport,
      );
      console.log('Mongoose configured successfully');

      await this.intializeUserModule();
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
    console.log('Mongoose installed successfully');
  }

  private async intializeUserModule(): Promise<void> {
    const spinner = new Spinner('Initializing user module... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.commandExecutionService.asyncExecuteCommand(
      'nest g module user',
    );
    await this.commandExecutionService.asyncExecuteCommand(
      'nest g controller user',
    );
    await this.commandExecutionService.asyncExecuteCommand(
      'nest g service user',
    );
    await writeFile(
      join(process.cwd(), 'src/user', 'user.schema.ts'),
      this.userSchemaContent,
    );
    spinner.stop(true);
    console.log('Initialized user module in src/user');
  }
}
