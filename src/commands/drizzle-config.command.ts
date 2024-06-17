/* eslint-disable prettier/prettier */
import { Command, CommandRunner, Option } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { PackageManagerService } from '../utils/packageManager.service';
import { FileManagerService } from 'src/utils/fileManager.service';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { CommandExecutionService } from 'src/utils/commandExecutionService.service';

@Command({ name: 'install-drizzle', description: 'Install Drizzle' })
export class DrizzleConfigCommand extends CommandRunner {
  
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,
    private readonly commandExecutionService: CommandExecutionService,
  ) {
    super();
  }
  private readonly drizzleModuleContent = 
`import { Module, Global } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';

@Global()
@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DrizzleModule {}
`
  private drizzleServiceContent: string;

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    try {
      if (
        !options?.flag ||
        options?.flag === '-sl' ||
        options?.flag === '--sqlite' ||
        options?.flag === '-psql' ||
        options?.flag === '--postgresql' ||
        options?.flag === '-my' ||
        options?.flag === '--mysql'
      ) {
        await this.installDrizzleDependencies();
        await this.commandExecutionService.asyncExecuteCommand("nest g module drizzle")
        await writeFile(
            join(process.cwd(), 'src\\drizzle', 'drizzle.module.ts'),
            this.drizzleModuleContent,
        );
        if(!options.flag) {
          await this.runWithPostgresql()
        }
        await this.createDrizzleConfig(options.flag)
        const importDrizzle = `import { DrizzleModule } from './drizzle.module'; `;
        const drizzleImport ="DrizzleModule"

        await this.fileManagerService.addImportsToAppModule(importDrizzle,drizzleImport);
        console.log("drizzle configured succefully")

        // we need the create user module here !!!
       
      } else {
        console.log(
          'Please provide a valid flag -psql for postgresql, or -my for mysql, or -sl for sqlite',
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  @Option({
    flags: '-sl, --sqlite',
    description: 'Configure Drizzle with Sqlite',
  })
  async runWithSqlite() {
    console.log('Configuring Drizzle with Sqlite...');
    await this.packageManagerService.installDependency('better-sqlite3');
    await this.createDrizzleServiceFile("-sl");
    console.log('Drizzle with Sqlite configured successfully!');
  }

  @Option({
    flags: '-psql, --postgresql',
    description: 'Configure Drizzle with PostgreSQL',
  })
  async runWithPostgresql() {
    console.log('Configuring Drizzle with PostgreSQL...');
    await this.packageManagerService.installDependency('pg');
    await this.packageManagerService.installDependency('@types/pg', true);
    await this.createDrizzleServiceFile("-psql");

    console.log('Drizzle with PostgreSQL configured successfully!');
  }

  @Option({
    flags: '-my, --mysql',
    description: 'Configure Drizzle with MySQL',
  })
  async runWithMySQL() {
    console.log('Configuring Drizzle with MySQL...');
    await this.packageManagerService.installDependency('mysql2');
    await this.createDrizzleServiceFile("-my");

    console.log('Drizzle with MySQL configured successfully!');
  }

  private async installDrizzleDependencies(): Promise<void> {
    const spinner = new Spinner('Installing Drizzle... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependency('drizzle-orm');
    await this.packageManagerService.installDependency('drizzle-kit', true);
    spinner.stop(true);
    console.log('Drizzle installed successfully!');
  }

  private async createDrizzleConfig(flag?: string) {
    const dialect = !flag || flag === '-psql' || flag === '--postgresql' ? 'postgresql'
      : flag === '-my' || flag === '--mysql' ? 'mysql'
      : flag === '-sl' || flag === '--sqlite' ? 'sqlite' 
      : ""
    const fileContent = 
`import { defineConfig } from 'drizzle-kit';
export default defineConfig({
schema: './src/schema.ts',
out: './drizzle',
dialect: ${dialect},
dbCredentials: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
},
});
`
    await writeFile(
        join(process.cwd(), 'drizzle.config.ts'),
        fileContent,
    );
  }

  private async createDrizzleServiceFile(flag: string): Promise<void> {
    const drizzleServicePath = join(process.cwd(), 'src', 'drizzle'); 
    await this.fileManagerService.createDirectoryIfNotExists(drizzleServicePath);
    
    if (flag === '-sl' || flag === '--sqlite') {
      this.drizzleServiceContent = 
`import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
    private sqlite: Database;
    db: any;

    async onModuleInit() {
        this.sqlite = new Database('sqlite.db');
        this.db = drizzle(this.sqlite);
    }

    async onModuleDestroy() {
        this.sqlite.close();
    }
}
  `;
    } else if (flag === '-psql' || flag === '--postgresql') {
      this.drizzleServiceContent = 
`import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  db: any;

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.db = drizzle(this.pool);
    await this.pool.connect();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
`;
    } else if (flag === '-my' || flag === '--mysql') {
      this.drizzleServiceContent = 
`import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
    private connection: mysql.Connection;
    db: any;

    async onModuleInit() {
        this.connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,,
        });
        this.db = drizzle(this.connection);
    }

    async onModuleDestroy() {
        await this.connection.end();
    }
}
`;
    }
  
    try {
      const filePath = join(drizzleServicePath, 'drizzle.service.ts');
      await writeFile(
        filePath,
        this.drizzleServiceContent
      );
    } catch (err) {
      console.error(`Failed to create drizzle.service.ts: `, err);
    }
  }

}
