/* eslint-disable prettier/prettier */
import { Command, CommandRunner, Option } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { PackageManagerService } from '../utils/packageManager.service';
import { FileManagerService } from 'src/utils/fileManager.service';
import {
  SequelizeMySqlModuleContent,
  SequelizePostgresModuleContent,
} from 'src/module-content/sequelize.content';
import { checkAndPromptEnvVariables } from 'src/utils/check-env-variables';
import { Injectable } from '@nestjs/common';

@Injectable()
@Command({
  name: 'install-sequelize',
  description: 'Install Sequelize with MySQL and PostgreSQL',
})
export class SequelizeConfigCommand extends CommandRunner {
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
    } catch (err) {
      console.error(err);
    }
  }

  @Option({
    flags: '-psql, --postgresql',
    description: 'Configure Sequelize with PostgreSQL',
  })
  async runWithPostgres() {
    console.log('Configuring Sequelize with PostgreSQL...');
    await this.installSequelizeDependencies();

    await checkAndPromptEnvVariables('postgres');
    await this.installPostgresDependencies();
    await this.writeToFile('-psql');
  }

  @Option({
    flags: '-my, --mysql',
    description: 'Configure Sequelize with MySQL',
  })
  async runWithMySQL() {
    console.log('Configuring Sequelize with MySQL...');
    await this.installSequelizeDependencies();
    await checkAndPromptEnvVariables('mysql');
    await this.installMysqlDependencies();
    await this.writeToFile('-my');
  }

  private async installPostgresDependencies(): Promise<void> {
    const spinner = new Spinner('Installing PostgreSQL dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependency('pg');
    spinner.stop(true);
    console.log('PostgreSQL dependencies installed successfully!');
  }

  private async installMysqlDependencies(): Promise<void> {
    const spinner = new Spinner('Installing MySQL dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependency('mysql2');
    spinner.stop(true);
    console.log('MySQL dependencies installed successfully!');
  }

  private async installSequelizeDependencies(): Promise<void> {
    const spinner = new Spinner('Installing Sequelize dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    try {
      await this.packageManagerService.installDependency('sequelize');
      await this.packageManagerService.installDependency('@types/sequelize');
      await this.packageManagerService.installDependency(
        'sequelize-typescript',
      );
      await this.packageManagerService.installDependency('@nestjs/sequelize');
      spinner.stop(true);
      console.log('Sequelize dependencies installed successfully!');
    } catch (error) {
      console.error('Error installing Sequelize dependencies:', error);
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
      moduleContent = SequelizePostgresModuleContent;
    } else if (flag === '-my' || flag === '--mysql') {
      filename = 'database.mysql.module.ts';
      moduleContent = SequelizeMySqlModuleContent;
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
    }
    return '';
  }
}
