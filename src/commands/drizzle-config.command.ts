/* eslint-disable prettier/prettier */
import { Command, CommandRunner, Option } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { PackageManagerService } from '../utils/packageManager.service';
import { FileManagerService } from '../utils/fileManager.service';
import { writeFile } from 'fs/promises';
import { asyncExecuteCommand } from '../utils/asyncExecuteCommand';
import { checkAndPromptEnvVariables } from 'src/utils/check-env-variables';

@Command({ name: 'install-drizzle', description: 'Install Drizzle' })
export class DrizzleConfigCommand extends CommandRunner {
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService, // private readonly commandExecutionService: CommandExecutionService,
  ) {
    super();
  }
  private readonly drizzleModuleContent = `import { Module, Global } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';

@Global()
@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DrizzleModule {}
`;
  private drizzleServiceContent: string;

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    try {
      const flag = Object.keys(options || {})[0] || 'postgresql';
      await this.intializeUserModule(flag);
      await this.installDrizzleDependencies();
      await asyncExecuteCommand('nest g module drizzle');
      await writeFile(
        join(process.cwd(), 'src\\drizzle', 'drizzle.module.ts'),
        this.drizzleModuleContent,
      );
      if (Object.keys(options || {}).length === 0) {
        await this.runWithPostgresql();
      }
    } catch (err) {
      console.error(err);
    }
  }

  @Option({
    flags: '-psql, --postgresql',
    description: 'Configure Drizzle with PostgreSQL',
  })
  async runWithPostgresql() {
    try {
      console.log('Configuring Drizzle with PostgreSQL...');
      await checkAndPromptEnvVariables('dpostgres');
      await this.installPostgresDependencies();
      await this.createDrizzleConfig('-psql');
      await this.createDrizzleServiceFile('-psql');
    } catch (error) {
      console.error(error);
    } finally {
      console.log('Drizzle with PostgreSQL configured successfully');
    }
  }

  @Option({
    flags: '-my, --mysql',
    description: 'Configure Drizzle with MySQL',
  })
  async runWithMySQL() {
    try {
      console.log('Configuring Drizzle with MySQL...');
      await checkAndPromptEnvVariables('dmysql');
      await this.installMysqlDependencies();
      await this.createDrizzleConfig('-my');
      await this.createDrizzleServiceFile('-my');
    } catch (error) {
      console.error(error);
    } finally {
      console.log('Drizzle with MySQL configured successfully');
    }
  }

  @Option({
    flags: '-sl, --sqlite',
    description: 'Configure Drizzle with Sqlite',
  })
  async runWithSqlite() {
    try {
      console.log('Configuring Drizzle with Sqlite...');
      await this.installSqliteDependencies();
      await this.createDrizzleConfig('-sl');
      await this.createDrizzleServiceFile('-sl');
    } catch (error) {
      console.error(error);
    } finally {
      console.log('Drizzle with Sqlite configured successfully');
    }
  }

  private async installDrizzleDependencies(): Promise<void> {
    const spinner = new Spinner('Installing Drizzle dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependency('drizzle-kit', true);
    await this.packageManagerService.installDependency('drizzle-orm');
    await this.packageManagerService.installDependency('dotenv');
    spinner.stop(true);
    console.log('Drizzle dependencies installed successfully');
  }

  private async installPostgresDependencies(): Promise<void> {
    const spinner = new Spinner('Installing PostgreSQL dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependency('@types/pg', true);
    await this.packageManagerService.installDependency('pg');
    spinner.stop(true);
    console.log('PostgreSQL dependencies installed successfully');
  }

  private async installMysqlDependencies(): Promise<void> {
    const spinner = new Spinner('Installing MySQL dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependency('mysql2');
    spinner.stop(true);
    console.log('MySQL dependencies installed successfully');
  }

  private async installSqliteDependencies(): Promise<void> {
    const spinner = new Spinner('Installing Sqlite dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependency('better-sqlite3');
    await this.packageManagerService.installDependency('@types/better-sqlite3', true);
    spinner.stop(true);
    console.log('Sqlite dependencies installed successfully!');
  }

  private async createDrizzleConfig(flag?: string) {
    const dialect =
      flag === '-my' || flag === '--mysql'
        ? 'mysql'
        : flag === '-sl' || flag === '--sqlite'
        ? 'sqlite'
        : flag === '-psql' || flag === '--postgresql'
        ? 'postgresql'
        : 'postgresql';
    const fileContent = `import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
config();

const {
  DB_HOST = MYSQL_HOST |  POSTGRES_HOST  | 'localhost',
  DB_USER = MYSQL_USER |  POSTGRES_USER  | 'defaultUser',
  DB_PASSWORD = MYSQL_PASSWORD |  POSTGRES_PASSWORD  | 'defaultPassword',
  DB_NAME = MYSQL_DB |  POSTGRES_DB  |'defaultDatabase',
} = process.env;

export default defineConfig({
  schema: [
    './src/*.schema.ts',
    './src/**/*.schema.ts',
    './src/**/**/*.schema.ts',
    './src/schema.ts',
    './src/**/schema.ts',
    './src/**/**/schema.ts',
  ],
  out: './drizzle',
  dialect: '${dialect}',
  dbCredentials: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
});
`;
    try {
      await writeFile(join(process.cwd(), 'drizzle.config.ts'), fileContent);
      console.log(`Created drizzle.config.ts in src/user`);
    } catch (error) {
      console.error(error);
    }
  }

  private async createDrizzleServiceFile(flag: string): Promise<void> {
    const drizzleServicePath = join(process.cwd(), 'src', 'drizzle');
    await this.fileManagerService.createDirectoryIfNotExists(
      drizzleServicePath,
    );

    if (flag === '-sl' || flag === '--sqlite') {
      this.drizzleServiceContent = `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as BetterSqlite3 from 'better-sqlite3'; // Correct import

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private sqlite: BetterSqlite3.Database; // Use the correct type
  db: any;

  async onModuleInit() {
    this.sqlite = new BetterSqlite3('sqlite.db'); // Create a new instance correctly
    this.db = drizzle(this.sqlite);
  }

  async onModuleDestroy() {
    this.sqlite.close();
  }
}
 `;
    } else if (flag === '-psql' || flag === '--postgresql') {
      this.drizzleServiceContent = `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  db: any;

  async onModuleInit() {
    const { DB_URL } = process.env;

    if (!DB_URL) {
      throw new Error('DB_URL is not defined in the environment variables');
    }

    this.pool = new Pool({
      connectionString: DB_URL,
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
      this.drizzleServiceContent = `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection, Connection } from 'mysql2/promise';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  db: any;

  async onModuleInit() {
    const {
      DB_HOST = '',
      DB_USER = '',
      DB_PASSWORD = '',
      DB_NAME = '',
    } = process.env;

    this.connection = await createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
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
      await writeFile(filePath, this.drizzleServiceContent);
    } catch (err) {
      console.error(`Failed to create drizzle.service.ts: `, err);
    }
  }

  private async intializeUserModule(flag: string): Promise<void> {
    let userSchemaContent = '';

    if (flag === 'postgresql' || flag === 'psql') {
      userSchemaContent = `import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
});
`;
    } else if (flag === '-my' || flag === '--mysql') {
      userSchemaContent = `import { mysqlTable, int, text } from 'drizzle-orm/mysql-core';

export const user = mysqlTable('user', {
  id: int('id').primaryKey().autoincrement(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
});
`;
    } else if (flag === '-sl' || flag === '--sqlite') {
      userSchemaContent = `import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
}, (user) => ({
  emailUniqueIndex: uniqueIndex('email_unique_idx').on(user.email),
}));
`;
    }

    const spinner = new Spinner('Initializing user module... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await asyncExecuteCommand('nest g module user');
    await asyncExecuteCommand('nest g controller user');
    await asyncExecuteCommand('nest g service user');
    await writeFile(
      join(process.cwd(), 'src/user', 'user.schema.ts'),
      userSchemaContent,
    );
    spinner.stop(true);
    console.log('Initialized user module in src/user');
  }
}
