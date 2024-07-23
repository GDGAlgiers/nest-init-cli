/* eslint-disable prettier/prettier */
import { GithubStrategy } from './auth/github/github.strategy';
import { GithubAuthModule } from './auth/github/githubauth.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './auth/email.module';
import { AuthModule } from './auth/auth.module';

 
import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';
import { PrismaConfigCommand } from './commands/prisma-config.command';
import { PackageManagerService } from './utils/packageManager.service';
import { FileManagerService } from './utils/fileManager.service';
import { TypeOrmConfigCommand } from './commands/typeOrm-config.command';
import { SequelizeConfigCommand } from './commands/sequelize-config.command';
import { AuthConfigCommand } from './commands/auth-config.command';
import { AppController } from './app.controller';

@Module({
providers:[GithubStrategy,AuthConfigCommand,SequelizeConfigCommand,PrismaConfigCommand,TypeOrmConfigCommand, PackageManagerService, FileManagerService,FileManager,AppService],
imports:[GithubAuthModule, PassportModule.register({ defaultStrategy: 'github' }), ConfigModule.forRoot(), MailModule, AuthModule,    CommandRunnerModule, UsersModule, ],
controllers:[AppController],

})
export class AppModule {}
