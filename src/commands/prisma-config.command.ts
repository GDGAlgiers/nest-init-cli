/* eslint-disable prettier/prettier */
import { Command, CommandRunner, Option } from 'nest-commander';
import { exec } from 'child_process';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { PackageManagerService } from '../utils/packageManager.service';
import { writeFile } from 'fs/promises';
import { FileManagerService } from 'src/utils/fileManager.service';
import { checkAndPromptEnvVariables } from 'src/utils/check-env-variables';
import { Injectable } from '@nestjs/common';

@Injectable()
@Command({
  name: 'install-prisma',
  description: 'Install Prisma ',
})
export class PrismaConfigCommand extends CommandRunner {
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,
  ) {
    super();
  }

  private readonly prismaServiceContent = `
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

  private readonly prismaModuleContent = `
    import { Module } from '@nestjs/common';
    import { PrismaService } from './prisma.service';

    @Module({
      providers: [PrismaService],
      exports: [PrismaService],
    })
    export class PrismaModule {}
  `;

  async run(): Promise<void> {
    console.log(
      'Please provide a valid flag: -m for MongoDB, -psql for PostgreSQL, -mysql for MySQL',
    );
  }

  @Option({
    flags: '-m, --mongodb',
    description: 'Configure Prisma with MongoDB',
  })
  async runWithMongo(): Promise<void> {
    console.log('Configuring Prisma with MongoDB...');
    await this.installPrismaDependencies();
    await this.createPrismaFiles();
    const schemaContentMongo: string = `generator client {
      provider = "prisma-client-js"
      }
            
            datasource db {
                provider = "mongodb"
                url      = env("MONGODB_URI")
                }
                
                model User {
                id          String      @id @default(auto()) @map("_id") @db.ObjectId
                username    String
                email       String      @unique
                password    String              
                };`;

    await this.initPrisma(schemaContentMongo);

    await checkAndPromptEnvVariables('mongodb');
    console.log('Prisma with MongoDB configured successfully');
  }

  @Option({
    flags: '-psql, --postgresql',
    description: 'Configure Prisma with PostgreSQL',
  })
  async runWithPostgres(): Promise<void> {
    console.log('Configuring Prisma with PostgreSQL...');

    const postgresHost = process.env.POSTGRES_HOST;
    const postgresPort = process.env.POSTGRES_PORT;
    const postgresName = process.env.POSTGRES_DB;
    const connectionString = `postgresql://${postgresHost}:${postgresPort}/${postgresName}`;
    const schemaContentPostgre = `
    generator client {
      provider = "prisma-client-js"
        }
        
        datasource db {
            provider = "postgresql"
            url      = "${connectionString}"
            }
            
            model User {
              id          String      @id 
              username    String
              email       String      @unique
              password    String
              }`;
    await checkAndPromptEnvVariables('postgres');
    await this.installPrismaDependencies();
    await this.createPrismaFiles();
    await this.initPrisma(schemaContentPostgre);
    console.log('Prisma with PostgreSQL configured successfully');
  }

  @Option({
    flags: '-mysql, --mysql',
    description: 'Configure Prisma with MySQL',
  })
  async runWithMySQL(): Promise<void> {
    console.log('Configuring Prisma with MySQL...');

    const mysqlHost = process.env.MYSQL_HOST;
    const mysqlPort = process.env.MYSQL_PORT;
    const mysqlName = process.env.MYSQL_DB;
    const connectionString = `mysql://${mysqlHost}:${mysqlPort}/${mysqlName}`;
    const schemaContentMySQL = `
        generator client {
            provider = "prisma-client-js"
        }
        
        datasource db {
            provider = "mysql"
            url      = "${connectionString}"
            }
            
            model User {
            id          String      @id 
            username    String
            email       String      @unique
            password    String
            }`;

    await checkAndPromptEnvVariables('mysql');
    await this.installPrismaDependencies();
    await this.createPrismaFiles();
    await this.initPrisma(schemaContentMySQL);
    console.log('Prisma with MySQL configured successfully');
  }

  private async initPrisma(content: string): Promise<void> {
    exec('npx prisma init').on('exit', async () => {
      await writeFile(join(process.cwd(), 'prisma', 'schema.prisma'), content);
    });
    exec('npx prisma generate');
    console.log('Initialized Prisma schema successfully');
  }

  private async installPrismaDependencies(): Promise<void> {
    const spinner = new Spinner('Installing Prisma dependencies ... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    try {
      await this.packageManagerService.installDependency('prisma', true);
      await this.packageManagerService.installDependency('@prisma/client');
      spinner.stop(true);
      console.log('Prisma installed successfully');
    } catch (error) {
      spinner.stop(true);
      console.error('Failed to install Prisma dependencies:', error);
      throw error;
    }
  }

  private async createPrismaFiles(): Promise<void> {
    const prismaDir = join(process.cwd(), 'prisma');
    await this.fileManagerService.createDirectoryIfNotExists(prismaDir);
    let filename = 'prisma.service.ts';
    let filePath = join(prismaDir, filename);
    try {
      await writeFile(filePath, this.prismaServiceContent);
      console.log(`Created ${filename} in prisma`);
      filename = 'prisma.module.ts';
      filePath = join(prismaDir, filename);
      await writeFile(filePath, this.prismaModuleContent);
      console.log(`Created ${filename} in prisma`);
    } catch (err) {
      console.error(`Failed to create ${filename}:`, err);
    }
    const importPrisma = `import { PrismaModule } from '../prisma/prisma.module'; `;
    const prismaProvider = 'PrismaModule';

    await this.fileManagerService.addProviderToAppModule(
      importPrisma,
      prismaProvider,
    );
  }
}
