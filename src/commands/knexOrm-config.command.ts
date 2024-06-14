/* eslint-disable prettier/prettier */
import { Command, CommandRunner, Option } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { PackageManagerService } from '../utils/packageManager.service';
import { FileManagerService } from 'src/utils/fileManager.service';
import { writeFile } from 'fs/promises';
import { knexMySQLModuleContent, knexPostgresModuleContent } from 'src/module-content/knexOrm.content';

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
      await this.createKnexMySQLModule("-my");
      console.log('Knex ORm with MySQL configured successfully!');
    }
  
    private async installKnexORmDependencies(): Promise<void> {
      const spinner = new Spinner('Installing knex... %s\n');
      spinner.setSpinnerString('|/-\\');
      spinner.start();
      await this.packageManagerService.installDependency('knex');
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
          moduleContent = knexPostgresModuleContent
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
      
  
    private async createKnexMySQLModule(flag: string): Promise<void> {
      const datasourcePath = join(process.cwd(), 'src', 'datasource');
      await this.fileManagerService.createDirectoryIfNotExists(datasourcePath);
    
      let moduleContent = '';
      let filename = '';
    
      if (flag === '-my' || flag === '--mysql') {
        filename = 'knex.mysql.module.ts';
        moduleContent = knexMySQLModuleContent
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
    if (flag === '-psql' || flag === '--postgresql') {
        return 'KnexPostgresModule';
      } else if (flag === '-my' || flag === '--mysql') {
        return 'KnexORmMySqlModule';
      }
      return '';
    }
}
