/* eslint-disable prettier/prettier */
import { Command, CommandRunner, Option } from 'nest-commander';
import { exec } from 'child_process';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { PackageManagerService } from '../utils/packageManager.service';
import { writeFile } from 'fs/promises';
import { FileManagerService } from 'src/utils/fileManager.service';
import readline from 'readline';
import * as fs from 'fs';
@Command({ name: 'install-typeOrm', description: 'Install Prisma test' })
export class TypeOrmComfigCommand extends CommandRunner {
    constructor(
        private readonly packageManagerService: PackageManagerService,
        private readonly fileManagerService: FileManagerService,
        private type:string

    ) {
        super();
    }
    private readonly envFileContenu = `{
  "type": "${this.type}",
  "host": "localhost",
  "port": 5432,
  "username": "user",
  "password": "password",
  "database": "mydb",
  "entities": ["dist/**/*.entity{.ts,.js}"],
  "migrations": ["dist/migration/*.js"],
  "cli": {
    "migrationsDir": "src/migration"
  }
}`
      
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
                // this.installPrismaDependencies();
                
                await writeFile(
                  join(process.cwd(), 'src', '.env'),
                  this.envFileContenu,
                );
              
                console.log("env file added succefully")
               
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
            description: 'config prisma with mongo-db',
          })
          runWithMongo() {
           
            console.log('Configuring Prisma with MongoDB...');
          }
          private async initPrisma(): Promise<void> {
            exec('npx prisma init').on('exit', async () => {
            //   await writeFile(
            //     join(process.cwd(), 'prisma', 'schema.prisma'),
            //     // this.schemaContent,
            //   );
            });
            exec('npx prisma generate');
            console.log('Prisma init successfully!');
          }
          private installPrismaDependencies(): void {
            const spinner = new Spinner('Installing Prisma... %s');
            spinner.setSpinnerString('|/-\\');
            spinner.start();
            this.packageManagerService.installDependency('prisma', true);
            this.packageManagerService.installDependency('@prisma/client');
            spinner.stop(true);
            console.log('Prisma installed successfully!');
          }
}