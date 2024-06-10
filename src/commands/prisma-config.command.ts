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
@Command({ name: 'install-prisma', description: 'Install prisma' })
export class PrismaConfigCommand extends CommandRunner {
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,
  ) {
    super();
  }
  private readonly prismaServiceContenu = `
    import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
    import { PrismaClient } from '@prisma/client';

    
    @Injectable()
    export class PrismaService extends PrismaClient implements OnModuleInit {
      async onModuleInit() {
        await this.$connect();
      }
    
      async onModuleDestroy() {
        await this.$disconnect();
      }
    }
    
    `;
  private schemaContent: string;
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
        this.installPrismaDependencies();
        this.initPrisma();
        await writeFile(
          join(process.cwd(), 'src', 'prisma.service.ts'),
          this.prismaServiceContenu,
        );
        const importPrisma = `import { PrismaService } from './prisma.service'; `;
        const prismaProvider ="PrismaService"

       await this.fileManagerService.addProviderToAppModule(importPrisma,prismaProvider);
        console.log("prisma configured succefully")
       
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
    this.schemaContent = `generator client {
                provider = "prisma-client-js"
            }
            
            datasource db {
                provider = "mongodb"
                url      = env("DATABASE_URL")
            }
            
            model User {
                id          String      @id @default(auto()) @map("_id") @db.ObjectId
                username    String
                email       String      @unique
                password    String              
            }`;
    console.log('Configuring Prisma with MongoDB...');
  }

  @Option({
    flags: '-psql, --postgresql',
    description: 'prisma with postgresql',
  })
  runWithSql() {
    this.schemaContent = `
        generator client {
            provider = "prisma-client-js"
        }

        datasource db {
            provider = "postgresql"
            url      = env("DATABASE_URL")
        }

        model User {
            id          String      @id 
            username    String
            email       String      @unique
            password    String
        }`;
    console.log('Configuring Prisma with Postgresql...');
  }

  private async initPrisma(): Promise<void> {
    exec('npx prisma init').on('exit', async () => {
      await writeFile(
        join(process.cwd(), 'prisma', 'schema.prisma'),
        this.schemaContent,
      );
    });
    exec('npx prisma generate');
    console.log('Prisma init successfully!');
  }
  private installPrismaDependencies(): void {
    const spinner = new Spinner('Installing type orm ... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    this.packageManagerService.installDependency('prisma', true);
    this.packageManagerService.installDependency('@prisma/client');
    spinner.stop(true);
    console.log('Prisma installed successfully!');
  }
}
