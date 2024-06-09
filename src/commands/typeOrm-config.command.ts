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
        options?.flag === '--postgresql'
      ) {
     await   this.installTypeOrmDependencies();
       
        // const importPrisma = `import { PrismaService } from './prisma.service'; `;
        // const prismaProvider ="PrismaService"

      //  await this.fileManagerService.addProviderToAppModule(importPrisma,prismaProvider);
        console.log("type orm configured succefully")
       
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
    flags: '--mongodb',
    description: 'Configure TypeORM with MongoDB',
  })
  async runWithMongo() {
    console.log('Configuring TypeORM with MongoDB...');
    this.envFileContent = `
    TYPE=mongodb
    URL=mongodb://localhost:27017/nest
    USE_NEW_URL_PARSER=true
    USE_UNIFIED_TOPOLOGY=true
    SYNCHRONIZE=true
    ENTITIES=__dirname + '/**/*.entity{.ts,.js}'
  `;
    await writeFile(join(process.cwd(), '.env'), this.envFileContent);
    console.log('TypeORM with MongoDB configured successfully!');
  }

  @Option({
    flags: '--postgresql',
    description: 'Configure TypeORM with PostgreSQL',
  })
  async runWithSql() {
    console.log('Configuring TypeORM with PostgreSQL...');
    this.envFileContent = `
      TYPE=postgres
      HOST=localhost
      PORT=5432
      USERNAME=user
      PASSWORD=password
      DATABASE=mydb
      ENTITIES=dist/**/*.entity{.ts,.js}
      MIGRATIONS=dist/migration/*.js
      CLI_MIGRATIONS_DIR=src/migration
    `;
    await writeFile(join(process.cwd(), '.env'), this.envFileContent);
    console.log('TypeORM with PostgreSQL configured successfully!');
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
