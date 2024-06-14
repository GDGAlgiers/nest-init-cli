/* eslint-disable prettier/prettier */
import { Command, CommandRunner, Option } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { PackageManagerService } from '../utils/packageManager.service';
import { FileManagerService } from 'src/utils/fileManager.service';
import { writeFile } from 'fs/promises';

@Command({ name: 'install-knexORm', description: 'Install knex Orm' })
export class KnexOrmConfigCommand extends CommandRunner {
  
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
          await this.installKnexORmDependencies();
         
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
      description: 'Configure Knex ORm  with MongoDB',
    })
    async runWithMongo() {
      console.log('Configuring Knex ORm  with MongoDB...');
      await this.packageManagerService.installDependency('mongodb');
      await this.packageManagerService.installDependency('@nestjs/mongoose');
      await this.packageManagerService.installDependency('mongoose');
      console.log('Knex ORm  with MongoDB configured successfully!');
    }
  
    @Option({
        flags: '-psql, --postgresql',
        description: 'Configure Knex.js with PostgreSQL',
      })
      async runWithSql() {
        console.log('Configuring Knex.js with PostgreSQL...');
        await this.packageManagerService.installDependency('pg');
        await this.createKnexConfigModule("-psql");
    
        console.log('Knex.js with PostgreSQL configured successfully!');
      }
  
    @Option({
      flags: '-my, --mysql',
      description: 'Configure Knex ORm  with MySQL',
    })
    async runWithMySQL() {
      console.log('Configuring Knex ORm  with MySQL...');
      await this.packageManagerService.installDependency('mysql2');  
      console.log('Knex ORm with MySQL configured successfully!');
    }
  
    private async installKnexORmDependencies(): Promise<void> {
      const spinner = new Spinner('Installing knex... %s');
      spinner.setSpinnerString('|/-\\');
      spinner.start();
      await this.packageManagerService.installDependency('knex', true);
      await this.packageManagerService.installDependency('@nestjs/typeorm');
      spinner.stop(true);
      console.log('Knex ORm  installed successfully!');
    }
  
  
    
    private async createKnexConfigModule(flag: string): Promise<void> {
        const datasourcePath = join(process.cwd(), 'src', 'datasource');
        await this.fileManagerService.createDirectoryIfNotExists(datasourcePath);
      
        let moduleContent = '';
        let filename = '';
      
        if (flag === '-psql' || flag === '--postgresql') {
          filename = 'knex.postgresql.module.ts';
          moduleContent = `
          import * as Knex from 'knex';
import { Module } from '@nestjs/common';

export const knexProvider = {
  provide: 'KnexConnection',
  useFactory: async () => {
    const knexConnection = Knex({
      client: 'pg',
      connection: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '20032003',
        database: 'test',
      },
    });

    try {
      await knexConnection.raw('SELECT 1'); // Test connection
      console.log('Knex connected to PostgreSQL database successfully');
    } catch (error) {
      console.error('Error connecting to PostgreSQL database:', error);
      throw error;
    }

    return knexConnection;
  },
};

@Module({
  providers: [knexProvider],
  exports: ['KnexConnection'],
})
export class KnexPostgresModule {}
          `;
        }
      
        try {
          console.log('Datasource Path:', datasourcePath);
          const filePath = join(datasourcePath, filename);
          await writeFile(filePath, moduleContent);
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
        return 'knexOrmMongoModule';
      } else if (flag === '-psql' || flag === '--postgresql') {
        return 'KnexPostgresModule';
      } else if (flag === '-my' || flag === '--mysql') {
        return 'KnexORmMySqlModule';
      }
      return '';
    }
  }
  