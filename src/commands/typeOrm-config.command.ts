/* eslint-disable prettier/prettier */
import { Command, CommandRunner, Option } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { PackageManagerService } from '../utils/packageManager.service';
import { writeFile } from 'fs/promises';
import { FileManagerService } from 'src/utils/fileManager.service';

@Command({ name: 'install-typeorm', description: 'Install TypeORM' })
export class TypeOrmConfigCommand extends CommandRunner {
  private envFileContent = ``;

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
        options?.flag === '--postgresql'||
        options?.flag === '-my' ||
        options?.flag === '--mysql'
      ) {
        await this.installTypeOrmDependencies();
      } else {
        console.log(
          'Please provide a valid flag -m for mongodb and -psql for postgresql',
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
//     this.envFileContent = `
// TYPE=mongodb
// URL=mongodb://localhost:27017/nest
// USE_NEW_URL_PARSER=true
// USE_UNIFIED_TOPOLOGY=true
// SYNCHRONIZE=true
// ENTITIES=__dirname + '/**/*.entity{.ts,.js}'
// `;
//     await writeFile(join(process.cwd(), '.env'), this.envFileContent);
    const importTypeOrm = `import { TypeOrmModule } from '@nestjs/typeorm';`;
    const typeOrmModule = `
TypeOrmModule.forRoot({
  type: 'mongodb',
  url: 'mongodb://localhost:27017/nest',
  useNewUrlParser: true,
  useUnifiedTopology: true,
  synchronize: true,
 autoLoadEntities: true,
})
`;
    await this.fileManagerService.addImportsToAppModule(importTypeOrm, typeOrmModule);
    await this.packageManagerService.installDependency('mongodb');
    console.log('TypeORM configured successfully');
    console.log('TypeORM with MongoDB configured successfully!');
  }

  @Option({
    flags: '-psql, --postgresql',
    description: 'Configure TypeORM with PostgreSQL',
  })
  async runWithSql() {
    console.log('Configuring TypeORM with PostgreSQL...');
//     this.envFileContent = `
// TYPE=postgres
// HOST=localhost
// PORT=5432
// USERNAME=user
// PASSWORD=password
// DATABASE=mydb
// ENTITIES=dist/**/*.entity{.ts,.js}
// MIGRATIONS=dist/migration/*.js
// CLI_MIGRATIONS_DIR=src/migration
// `;
//     await writeFile(join(process.cwd(), '.env'), this.envFileContent);
    const importTypeOrm = `import { TypeOrmModule } from '@nestjs/typeorm';`;
    const typeOrmModule = `
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '20032003',
  database: 'me',
  synchronize: true,
  autoLoadEntities: true, 

})
`;
    await this.fileManagerService.addImportsToAppModule(importTypeOrm, typeOrmModule);
    await this.packageManagerService.installDependency('pg');
    console.log('TypeORM configured successfully');
    console.log('TypeORM with PostgreSQL configured successfully!');
  }
  @Option({
    flags: '-my, --mysql',
    description: 'Configure TypeORM with MySQL',
  })
  async runWithMySQL() {
    console.log('Configuring TypeORM with MySQL...');
    const importTypeOrm = `import { TypeOrmModule } from '@nestjs/typeorm';`;
    const typeOrmModule = `
  TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'your_password',
    database: 'your_database',
    synchronize: true,
    autoLoadEntities: true,
  })
  `;
    await this.fileManagerService.addImportsToAppModule(importTypeOrm, typeOrmModule);
    await this.packageManagerService.installDependency('mysql2');
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
}
