/* eslint-disable prettier/prettier */
import { Command, CommandRunner } from 'nest-commander';
import { PackageManagerService } from '../utils/packageManager.service';
import { MikroOrmConfigCommand } from './mikro-orm-config.command';
import { AuthConfigCommand } from './auth-config.command';
import { DrizzleConfigCommand } from './drizzle-config.command';
import { MongooseConfigCommand } from './mongoose-config.command';
import { PrismaConfigCommand } from './prisma-config.command';
import { SequelizeConfigCommand } from './sequelize-config.command';
import { TypeOrmConfigCommand } from './typeOrm-config.command';
import * as inquirer from 'inquirer';
import * as colors from 'colors';

@Command({
  name: 'configure',
  description: 'Configure authentication or database with ORM',
})
export class ConfigureCommand extends CommandRunner {
  constructor(
    private readonly mikroOrmConfigCmd: MikroOrmConfigCommand,
    private readonly authConfigCmd: AuthConfigCommand,
    private readonly drizzleConfigCmd: DrizzleConfigCommand,
    private readonly mongooseConfigCmd: MongooseConfigCommand,
    private readonly prismaConfigCmd: PrismaConfigCommand,
    private readonly sequelizeConfigCmd: SequelizeConfigCommand,
    private readonly typeOrmConfigCmd: TypeOrmConfigCommand,
  ) {
    super();
  }

  async run(): Promise<void> {
    const { configType } = await inquirer.prompt({
      type: 'list',
      name: 'configType',

      message: colors.cyan.italic('What would you like to configure?'),
      choices: [
        {
          name: colors.yellow('Setup Authentication strategies and services'),
          value: 'Authentication',
        },
        {
          name: colors.green('Configure Database with ORM'),
          value: 'Database with ORM',
        },
        {
          name: colors.blue('Exit'),
          value: 'Exit',
        },
      ],
      loop: false,
    });

    if (configType === 'Authentication') {
      await this.runAuthConfig();
    } else if (configType === 'Database with ORM') {
      await this.runDbConfig();
    } else {
      console.log(colors.yellow('Exiting configuration. Goodbye!'));
      process.exit(0);
    }
  }

  private async runAuthConfig(): Promise<void> {
    await this.authConfigCmd.setupAuth();
  }
  private async runDbConfig(): Promise<void> {
    const { dbType } = await inquirer.prompt({
      type: 'list',
      name: 'dbType',
      message: colors.cyan.italic('Choose Database:'),
      choices: [
        { name: colors.yellow('MySQL'), value: 'MySQL' },
        { name: colors.green('PostgreSQL'), value: 'PostgreSQL' },
        { name: colors.blue('SQLite'), value: 'SQLite' },
        { name: colors.red('MongoDB'), value: 'MongoDB' },
      ],
    });
    let ormType;
    switch (dbType) {
      case 'MySQL':
        ({ ormType } = await inquirer.prompt({
          type: 'list',
          name: 'ormType',
          message: colors.cyan.italic('Choose ORM:'),
          choices: [
            { name: colors.yellow('Drizzle'), value: 'Drizzle' },
            { name: colors.green('MikroORM'), value: 'MikroORM' },
            { name: colors.blue('Sequelize'), value: 'Sequelize' },
            { name: colors.red('TypeORM'), value: 'TypeORM' },
            { name: colors.yellow('Prisma'), value: 'Prisma' },
          ],
        }));
        switch (ormType) {
          case 'Drizzle':
            await this.drizzleConfigCmd.runWithMySQL();

            break;
          case 'MikroORM':
            await this.mikroOrmConfigCmd.runWithMySQL();

            break;
          case 'Sequelize':
            await this.sequelizeConfigCmd.runWithMySQL();
            break;
          case 'TypeORM':
            await this.typeOrmConfigCmd.runWithMySQL();
            break;
          case 'Prisma':
            await this.prismaConfigCmd.runWithMySQL();
            break;
          default:
            console.log('Setting up MySQL with TypeORM by default...');
            await this.typeOrmConfigCmd.runWithMySQL();
            break;
        }
        break;
      case 'PostgreSQL':
        ({ ormType } = await inquirer.prompt({
          type: 'list',
          name: 'ormType',
          message: 'Choose ORM:',
          choices: [
            { name: colors.yellow('Drizzle'), value: 'Drizzle' },
            { name: colors.green('MikroORM'), value: 'MikroORM' },
            { name: colors.blue('Sequelize'), value: 'Sequelize' },
            { name: colors.red('TypeORM'), value: 'TypeORM' },
            { name: colors.yellow('Prisma'), value: 'Prisma' },
          ],
        }));
        switch (ormType) {
          case 'Drizzle':
            await this.drizzleConfigCmd.runWithPostgresql();

            break;
          case 'MikroORM':
            await this.mikroOrmConfigCmd.runWithPostgres();

            break;
          case 'Sequelize':
            await this.sequelizeConfigCmd.runWithPostgres();

            break;
          case 'TypeORM':
            await this.typeOrmConfigCmd.runWithSql();
            break;

          case 'Prisma':
            await this.prismaConfigCmd.runWithPostgres();
            break;
          default:
            console.log('Setting up PostgreSQL with Prisma by default...');
            await this.prismaConfigCmd.runWithPostgres();
            break;
        }
        break;
      case 'SQLite':
        ormType = await inquirer.prompt({
          type: 'list',
          name: 'ormType',
          message: 'Choose ORM:',
          choices: [{ name: colors.yellow('Drizzle'), value: 'Drizzle' }],
        });
        await this.drizzleConfigCmd.runWithSQLite();
        break;

      case 'MongoDB':
        ({ ormType } = await inquirer.prompt({
          type: 'list',
          name: 'ormType',
          message: 'Choose ORM:',
          choices: [
            { name: colors.green('Mongoose'), value: 'Mongoose' },
            { name: colors.red('TypeORM'), value: 'TypeORM' },
            { name: colors.blue('MikroORM'), value: 'MikroORM' },
            { name: colors.yellow('Prisma'), value: 'Prisma' },
          ],
        }));
        switch (ormType) {
          case 'Mongoose':
            await this.mongooseConfigCmd.run();
            break;
          case 'MikroORM':
            await this.mikroOrmConfigCmd.runWithMongo();
            break;
          case 'TypeORM':
            await this.typeOrmConfigCmd.runWithMongo();
            break;
          case 'Prisma':
            await this.prismaConfigCmd.runWithMongo();
            break;
          default:
            console.log('Setting up MongoDB with Mongoose by default...');
            await this.mongooseConfigCmd.run();
            break;
        }
        break;
      default:
        console.log('Setting up PostgreSQL with Prisma by default...');
        await this.prismaConfigCmd.runWithPostgres();
        break;
    }
  }
}
