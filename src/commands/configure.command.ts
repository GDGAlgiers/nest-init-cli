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
    private readonly packageManagerService: PackageManagerService,
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

      message: colors.blue('What would you like to configure?'),
      choices: [
        { name: colors.yellow('Authentication'), value: 'Authentication' },
        { name: colors.green('Database with ORM'), value: 'Database with ORM' },
      ],
      loop: false,
    });

    if (configType === 'Authentication') {
      await this.runAuthConfig();
      const { strategy } = await inquirer.prompt({
        type: 'list',
        name: 'strategy',
        message: 'Choose strategy:',
        choices: ['JWT (JSON Web Token)', 'Session', 'Cookies'],
      });
      switch (strategy) {
        case 'JWT (JSON Web Token)':
          break;
        case 'Session':
          break;
        case 'Cookies':
          break;
        default:
          break;
      }
    } else {
      await this.runDbConfig();
    }
  }

  private async runAuthConfig(): Promise<void> {
    await this.authConfigCmd.run();
  }

  private async runDbConfig(): Promise<void> {
    const { dbType } = await inquirer.prompt({
      type: 'list',
      name: 'dbType',
      message: 'Choose Database:',
      choices: ['MySQL', 'PostgreSQL', 'SQLite', 'MongoDB'],
    });
    let ormType;
    switch (dbType) {
      case 'MySQL':
        ({ ormType } = await inquirer.prompt({
          type: 'list',
          name: 'ormType',
          message: 'Choose ORM:',
          choices: [
            { name: colors.yellow('Drizzle'), value: 'Drizzle' },

            { name: colors.green('MikroORM'), value: 'MikroORM' },
            { name: colors.blue('Sequelize'), value: 'Sequelize' },
            { name: colors.red('TypeORM'), value: 'TypeORM' },
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
          default:
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
            await this.prismaConfigCmd.runWithSql();
            break;
          default:
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
        await this.drizzleConfigCmd.runWithSqlite();
        break;

      case 'MongoDB':
        ({ ormType } = await inquirer.prompt({
          type: 'list',
          name: 'ormType',
          message: 'Choose ORM:',
          choices: [
            { name: colors.green('MikroORM'), value: 'MikroORM' },
            { name: colors.red('TypeORM'), value: 'TypeORM' },
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
          case 'Prisma':
            await this.prismaConfigCmd.runWithMongo();
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  private async addJwtAuth() {}

  private async addSessionAuth() {}

  private async addCookiesAuth() {}
}
