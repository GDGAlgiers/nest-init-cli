/* eslint-disable prettier/prettier */
import { Command, CommandRunner, Option } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { PackageManagerService } from '../utils/packageManager.service';
import { FileManagerService } from 'src/utils/fileManager.service';
import { writeFile } from 'fs/promises';
import { typeOrmMongoModuleContent, typeOrmMySqlModuleContent, typeOrmPostgresModuleContent } from 'src/module-content/typeORm.content';

@Command({ name: 'install-typeOrm', description: 'Install TypeORM' })
export class TypeOrmConfigCommand extends CommandRunner {
  
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,

  ) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    try {
      if (
        !options?.flag ||
        options?.flag === '-m' ||
        options?.flag === '--mongodb' ||
        options?.flag === '-psql' ||
        options?.flag === '--postgresql' ||
        options?.flag === '-my' ||
        options?.flag === '--mysql'
      ) {
        await this.installTypeOrmDependencies();
       
      } else {
        console.log(
          'Please provide a valid flag -m for mongodb, -psql for postgresql, or -my for mysql',
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  @Option({
    flags: '-m, --mongodb',
    description: 'Configure TypeORM with MongoDB',
  })
  async runWithMongo() {
    console.log('Configuring TypeORM with MongoDB...');
    await this.packageManagerService.installDependency('mongodb');
    await this.packageManagerService.installDependency('@nestjs/mongoose');
    await this.packageManagerService.installDependency('@nestjs/config');
    await this.packageManagerService.installDependency('mongoose');
    await this.createDatasourceModule("-m");
    console.log('TypeORM with MongoDB configured successfully!');
  }

  @Option({
    flags: '-psql, --postgresql',
    description: 'Configure TypeORM with PostgreSQL',
  })
  async runWithSql() {
    console.log('Configuring TypeORM with PostgreSQL...');
    await this.packageManagerService.installDependency('pg');
    await this.createDatasourceModule("-psql");

    console.log('TypeORM with PostgreSQL configured successfully!');
  }

  @Option({
    flags: '-my, --mysql',
    description: 'Configure TypeORM with MySQL',
  })
  async runWithMySQL() {
    console.log('Configuring TypeORM with MySQL...');
    await this.packageManagerService.installDependency('mysql2');
    await this.createDatasourceModule("-my");

    console.log('TypeORM with MySQL configured successfully!');
  }

  private async installTypeOrmDependencies(): Promise<void> {
    const spinner = new Spinner('Installing TypeORM... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependency('typeorm', true);
    await this.packageManagerService.installDependency('@nestjs/typeorm');
    spinner.stop(true);
    console.log('TypeORM installed successfully!');
  }

  private async createDatasourceModule(flag: string): Promise<void> {
    const datasourcePath = join(process.cwd(), 'src', 'datasource'); // Corrected file path
    await this.fileManagerService.createDirectoryIfNotExists(datasourcePath);
  
    let moduleContent = '';
    let filename = '';
  
    if (flag === '-m' || flag === '--mongodb') {
      filename = 'typeorm.mongodb.module.ts';
      moduleContent =typeOrmMongoModuleContent
console.log("please add mongo uri in env file like:MONGODB_URI=mongodb://127.0.0.1:27017/test");

    } else if (flag === '-psql' || flag === '--postgresql') {
      filename = 'typeorm.postgresql.module.ts';
      moduleContent = typeOrmPostgresModuleContent
    } else if (flag === '-my' || flag === '--mysql') {
      filename = 'typeorm.mysql.module.ts';
      moduleContent = typeOrmMySqlModuleContent
    }
  
    try {
      console.log('Datasource Path:', datasourcePath);
      const filePath = join(datasourcePath, filename);
      await writeFile(
        filePath,
        moduleContent
      );
      console.log(`Created ${filename} in src`);
    } catch (err) {
      console.error(`Failed to create ${filename}:`, err);
    }
  
    const importStatement = `import { ${this.getModuleName(flag)} } from './datasource/${filename.replace('.ts', '')}';`;
    const moduleClass = `${this.getModuleName(flag)}`;
    await this.fileManagerService.addImportsToAppModule(importStatement, moduleClass);
  }
  


  private getModuleName(flag: string): string {
    if (flag === '-m' || flag === '--mongodb') {
      return 'TypeOrmMongoModule';
    } else if (flag === '-psql' || flag === '--postgresql') {
      return 'TypeOrmPostgresModule';
    } else if (flag === '-my' || flag === '--mysql') {
      return 'TypeOrmMySqlModule';
    }
    return '';
  }
}
