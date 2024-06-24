/* eslint-disable prettier/prettier */
import { Command, CommandRunner, Option } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { PackageManagerService } from '../utils/packageManager.service';
import { FileManagerService } from 'src/utils/fileManager.service';
import { checkAndPromptEnvVariables } from 'src/utils/check-env-variables';

@Command({
  name: 'install-mikroorm',
  description: 'Install MikroORM',
})
export class MikroOrmConfigCommand extends CommandRunner {
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,
  ) {
    super();
  }
  private readonly MongoModuleContent = `
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mongo',
        clientUrl: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DB'),
        entities: ['./dist/entities'],
        entitiesTs: ['./src/entities'],
      }),
    }),
  ],
})
export class DatabaseMongoModule { }`;

  private readonly MySqlModuleContent = `
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgresql',
        host: configService.get<string>('MYSQL_HOST'),
        port: configService.get<number>('MYSQL_PORT'),
        user: configService.get<string>('MYSQL_USER'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        dbName: configService.get<string>('MYSQL_DB'),
        entities: ['./dist/entities'],
        entitiesTs: ['./src/entities'],
      }),
    }),
  ],
})
export class DatabaseMySqlModule { }`;

  private readonly PostgreSqlModuleContent = `
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgresql',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        user: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        dbName: configService.get<string>('POSTGRES_DB'),
        entities: ['./dist/entities'],
        entitiesTs: ['./src/entities'],
      }),
    }),
  ],
})
export class DatabasePostgresModule { }`;
  async run(): Promise<void> {
    try {
    } catch (err) {
      console.error(err);
    }
  }

  @Option({
    flags: '-psql, --postgresql',
    description: 'Configure MikroORM with PostgreSQL',
  })
  async runWithPostgres() {
    console.log('Configuring MikroORM with PostgreSQL...');
    await this.installMikroOrmDependencies();
    await checkAndPromptEnvVariables('postgres');
    await this.installPostgresDependencies();
    await this.writeToFile('-psql');
  }

  @Option({
    flags: '-my, --mysql',
    description: 'Configure MikroORM with MySQL',
  })
  async runWithMySQL() {
    console.log('Configuring MikroORM with MySQL...');
    await this.installMikroOrmDependencies();
    await checkAndPromptEnvVariables('mysql');
    await this.installMysqlDependencies();
    await this.writeToFile('-my');
  }

  @Option({
    flags: '-m, --mongodb',
    description: 'Configure MikroORM with MongoDB',
  })
  async runWithMongo() {
    console.log('Configuring MikroORM with MongoDB...');
    await this.installMikroOrmDependencies();
    await checkAndPromptEnvVariables('mongodb');
    await this.installMongoDependencies();
    await this.writeToFile('-m');
  }

  private async installPostgresDependencies(): Promise<void> {
    const spinner = new Spinner('Installing PostgreSQL dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependencyVersion(
      '@mikro-orm/postgresql',
      '5.1.5',
    );
    spinner.stop(true);
    console.log('PostgreSQL dependencies installed successfully!');
  }

  private async installMysqlDependencies(): Promise<void> {
    const spinner = new Spinner('Installing MySQL dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependencyVersion(
      '@mikro-orm/mysql',
      '5.1.5',
    );
    await this.packageManagerService.installDependency('mysql');

    spinner.stop(true);
    console.log('MySQL dependencies installed successfully!');
  }

  private async installMongoDependencies(): Promise<void> {
    const spinner = new Spinner('Installing MongoDB dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependencyVersion(
      '@mikro-orm/mongodb',
      '5.1.5',
    );
    spinner.stop(true);
    console.log('MongoDB dependencies installed successfully!');
  }

  private async installMikroOrmDependencies(): Promise<void> {
    const spinner = new Spinner('Installing MikroORM dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    try {
      await this.packageManagerService.installDependencyVersion(
        '@mikro-orm/core',
        '5.1.5',
      );
      await this.packageManagerService.installDependencyVersion(
        '@mikro-orm/nestjs',
        '5.1.5',
      );
      spinner.stop(true);
      console.log('MikroORM dependencies installed successfully!');
    } catch (error) {
      spinner.stop(true);
      console.error('Error installing MikroORM dependencies:', error);
      throw error;
    }
  }

  private async writeToFile(flag: string): Promise<void> {
    const databasePath = join(process.cwd(), 'src', 'database');
    await this.fileManagerService.createDirectoryIfNotExists(databasePath);

    let moduleContent = '';
    let filename = '';

    if (flag === '-psql' || flag === '--postgresql') {
      filename = 'database.psql.module.ts';
      moduleContent = this.PostgreSqlModuleContent;
    } else if (flag === '-my' || flag === '--mysql') {
      filename = 'database.mysql.module.ts';
      moduleContent = this.MySqlModuleContent;
    } else if (flag === '-m' || flag === '--mongodb') {
      filename = 'database.mongo.module.ts';
      moduleContent = this.MongoModuleContent;
    }

    try {
      const filePath = join(databasePath, filename);
      await writeFile(filePath, moduleContent);
      console.log(`Created ${filename} in src/database`);
    } catch (err) {
      console.error(`Failed to create ${filename}:`, err);
    }

    const importStatement = `import { ${this.getModuleName(
      flag,
    )} } from './database/${filename.replace('.ts', '')}';`;
    const moduleClass = `${this.getModuleName(flag)}`;
    await this.fileManagerService.addImportsToAppModule(
      importStatement,
      moduleClass,
    );
  }

  private getModuleName(flag: string): string {
    if (flag === '-psql' || flag === '--postgresql') {
      return 'DatabasePostgresModule';
    } else if (flag === '-my' || flag === '--mysql') {
      return 'DatabaseMySqlModule';
    } else if (flag === '-m' || '--mongodb') {
      return 'DatabaseMongoModule';
    }
    return '';
  }
}
