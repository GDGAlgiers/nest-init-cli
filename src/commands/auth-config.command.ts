/* eslint-disable prettier/prettier */
import { Command, CommandRunner } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { prompt } from 'inquirer';
import { PackageManagerService } from '../utils/packageManager.service';
import { FileManagerService } from '../utils/fileManager.service';
import { AuthFileManager } from '../authStrategyMethods/authFileManager';
import { FileManager } from '../authStrategyMethods/utils/fileManager';
import { checkAndPromptEnvVariables } from 'src/utils/check-env-variables';
import { generateUserResource } from 'src/authStrategyMethods/utils/generate-user-resource';
import { Injectable } from '@nestjs/common';
import * as colors from 'colors';

@Injectable()
@Command({ name: 'add-auth', description: 'Add authentication services' })
export class AuthConfigCommand extends CommandRunner {
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,
    private readonly authFileManager: AuthFileManager,
    private readonly fileManager: FileManager,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
    } catch (error) {
      console.error(
        'Error occurred while configuring authentication services:',
        error,
      );
    }
  }

  // function to add Google OAuth Service
  async runGoogleAuth(): Promise<void> {
    const googleAuthSpinner = new Spinner(
      'Installing Google auth dependencies... %s',
    );
    googleAuthSpinner.setSpinnerString('|/-\\');

    try {
      // Check and prompt for required environment variables
      await checkAndPromptEnvVariables('google');
      await this.initFolder('google');
      googleAuthSpinner.start();
      // Install necessary dependencies
      await this.packageManagerService.installDependency(
        'passport-google-oauth20',
      );

      await this.fileManagerService.addImportsToAppModule(
        `import { PassportModule } from '@nestjs/passport';`,
        `PassportModule.register({ defaultStrategy: 'google' })`,
      );

      // Add GoogleAuthModule to app module imports
      await this.fileManagerService.addImportsToAppModule(
        `import { GoogleAuthModule } from './auth/google/googleauth.module';`,
        `GoogleAuthModule`,
      );

      // Add Google strategy provider to app module
      await this.fileManagerService.addProviderToAppModule(
        `import { GoogleStrategy } from './auth/google/google.strategy';`,
        `GoogleStrategy`,
      );
      // Create Google OAuth strategy
      await this.authFileManager.createGoogleAuthStrategy();
      console.log('Google OAuth added successfully.');
    } catch (error) {
      console.error('Error while adding Google OAuth:', error);
    } finally {
      googleAuthSpinner.stop(true);
    }
  }

  // function to add Facebook OAuth
  async runFacebookAuth(): Promise<void> {
    const facebookAuthSpinner = new Spinner(
      'Installing Facebook auth dependencies... %s',
    );
    facebookAuthSpinner.setSpinnerString('|/-\\');

    try {
      // Check and prompt for required environment variables
      await checkAndPromptEnvVariables('facebook');

      // Initialize the facebook folder
      await this.initFolder('facebook');
      facebookAuthSpinner.start();

      // Install necessary dependencies
      await this.packageManagerService.installDependency('passport-facebook');

      // Create Facebook strategy
      await this.authFileManager.createFacebookAuthStrategy();

      await this.fileManagerService.addImportsToAppModule(
        `import { PassportModule } from '@nestjs/passport';`,
        `PassportModule.register({ defaultStrategy: 'facebook' })`,
      );

      // Add FacebookAuthModule to app module imports
      await this.fileManagerService.addImportsToAppModule(
        `import { FacebookAuthModule } from './auth/facebook/facebookauth.module';`,
        `FacebookAuthModule`,
      );

      // Add Facebook strategy provider to app module
      await this.fileManagerService.addProviderToAppModule(
        `import { FacebookStrategy } from './auth/facebook/facebook.strategy';`,
        `FacebookStrategy`,
      );

      console.log('Facebook OAuth added successfully.');
    } catch (error) {
      console.error('Error while adding Facebook OAuth:', error);
    } finally {
      facebookAuthSpinner.stop(true);
    }
  }

  // function to add github auth
  async runGithubAuth(): Promise<void> {
    const githubAuthSpinner = new Spinner(
      'Installing Github auth dependencies... %s',
    );
    githubAuthSpinner.setSpinnerString('|/-\\');

    try {
      await checkAndPromptEnvVariables('github');
      // Initialize the github folder
      await this.initFolder('github');
      githubAuthSpinner.start();

      // Install necessary dependencies
      await this.packageManagerService.installDependency('passport-github');

      // Add GitHub strategy to auth module providers
      await this.authFileManager.addGithubAuthStrategy();

      // Add PassportModule configuration to auth module imports
      await this.fileManagerService.addImportsToAppModule(
        `import { PassportModule } from '@nestjs/passport';`,
        `PassportModule.register({ defaultStrategy: 'github' })`,
      );

      // Add GithubAuthModule to app module imports
      await this.fileManagerService.addImportsToAppModule(
        `import { GithubAuthModule } from './auth/github/githubauth.module';`,
        `GithubAuthModule`,
      );

      // Add Github strategy provider to app module
      await this.fileManagerService.addProviderToAppModule(
        `import { GithubStrategy } from './auth/github/github.strategy';`,
        `GithubStrategy`,
      );
      // Add config service provider to app module
      await this.fileManagerService.addProviderToAppModule(
        `import { ConfigService } from '@nestjs/config';`,
        `ConfigService`,
      );

      console.log('Github OAuth added successfully.');
    } catch (error) {
      console.error('Error while adding Github OAuth:', error);
    } finally {
      githubAuthSpinner.stop(true);
    }
  }

  // function to add local auth (email/password)
  async setupAuth(): Promise<void> {
    try {
      // install passport.js dependencies
      await this.installDependencies();
      await this.initAuth();
      await this.authFileManager.createServices();
      await this.fileManagerService.addImportsToAppModule(
        `import { AuthModule } from './auth/auth.module';`,
        `AuthModule`,
      );

      const folderExists = await this.fileManagerService.doesFolderExist(
        'users',
      );
      if (!folderExists) {
        await generateUserResource();
      }
      console.log('Authentication services have been successfully added.');

      const { strategy } = await prompt({
        type: 'list',
        name: 'strategy',
        message: colors.cyan.italic('Choose an autentication strategy:'),
        choices: [
          {
            name: colors.yellow('JWT (JSON Web Token)'),
            value: 'JWT (JSON Web Token)',
          },
          { name: colors.green('Session'), value: 'Session' },
          { name: colors.red('Cookies'), value: 'Cookies' },
        ],
      });
      switch (strategy) {
        case 'JWT (JSON Web Token)':
          await this.addJwtAuth();
          break;
        case 'Session':
          await this.addSessionAuth();
          break;
        case 'Cookies':
          await this.addCookiesAuth();
          break;
        default:
          console.log('Adding JWT strategy by default...');
          await this.addJwtAuth();
          break;
      }

      const { addGoogleAuth } = await prompt({
        type: 'confirm',
        name: 'addGoogleAuth',
        message: colors.cyan.italic(
          'Would you like to integrate authentication using Google in your project?',
        ),
      });
      if (addGoogleAuth) {
        await this.runGoogleAuth();
      }

      const { addFbAuth } = await prompt({
        type: 'confirm',
        name: 'addFbAuth',
        message: colors.cyan.italic(
          'Would you like to integrate authentication using Facebook in your project?',
        ),
      });
      if (addFbAuth) {
        await this.runFacebookAuth();
      }

      const { addGithubAuth } = await prompt({
        type: 'confirm',
        name: 'addGithubAuth',
        message: colors.cyan.italic(
          'Would you like to integrate authentication using Github in your project?',
        ),
      });
      if (addGithubAuth) {
        await this.runGithubAuth();
      }
    } catch (error) {
      console.error('An error has occurred while setting up authentication');
    }
  }

  // function to handle adding JWT strategy
  async addJwtAuth(): Promise<void> {
    const spinner = new Spinner('Installing JWT dependencies  ... %s');
    spinner.setSpinnerString('|/-\\');
    await this.packageManagerService.installDependency('@nestjs/jwt');
    await this.packageManagerService.installDependency('passport-jwt');
    await this.packageManagerService.installDependency('jsonwebtoken');
    await this.packageManagerService.installDependency('bcryptjs');
    await checkAndPromptEnvVariables('jwt');
    await this.authFileManager.addJwtStrategy();
    await this.fileManager.addProviderToAuthModule(
      `import { JwtStrategy } from './jwt.strategy';`,
      'JwtStrategy',
    );
    await this.fileManager.addProviderToAuthModule(
      `import { UsersService } from 'src/users/users.service';`,
      'UsersService',
    );
    await this.fileManager.addImportsToAuthModule(
      `import { MailerModule } from '@nestjs-modules/mailer';`,
      `MailerModule.forRoot({
      transport: {
        host: 'smtp.example.com',
        port: 587,
        auth: {
          user: 'username',
          pass: 'password',
        },
      },
    })`,
    );
    spinner.stop(true);
  }

  // function to handle adding express session strategy
  async addSessionAuth(): Promise<void> {
    const spinner = new Spinner('Installing dependencies  ... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependency('express-session');
    await this.packageManagerService.installDependency(
      '@types/express-session',
      true,
    );
    await this.initFolder('protected');
    await this.authFileManager.addSessionStrategy();
    await this.fileManagerService.addImportsToAppModule(
      `import { ProtectedModule } from './auth/protected/protected.module';`,
      `ProtectedModule`,
    );

    await this.fileManager.addProviderToAuthModule(
      `import { SessionSerializer } from './session.strategy';`,
      'SessionSerializer',
    );
    await this.fileManager.addImportsToAuthModule(
      `import { PassportModule } from '@nestjs/passport';`,
      `PassportModule.register({ session: true })`,
    );
    spinner.stop(false);
  }

  // function to handle adding cookies strategy
  async addCookiesAuth(): Promise<void> {
    const spinner = new Spinner('Installing dependencies  ... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    await this.packageManagerService.installDependency('express-session');
    await this.initFolder('protected');
    await this.authFileManager.addCookiesStrategy();
    await this.fileManagerService.addImportsToAppModule(
      `import { ProtectedModule } from './auth/protected/protected.module';`,
      `ProtectedModule`,
    );

    await this.fileManager.addProviderToAuthModule(
      `import { SessionSerializer } from './cookies.strategy';`,
      'SessionSerializer',
    );
    await this.fileManager.addImportsToAuthModule(
      `import { PassportModule } from '@nestjs/passport';`,
      `PassportModule`,
    );
    spinner.stop(true);
  }

  // function to install passport.js dependencies
  private async installDependencies(): Promise<void> {
    const spinner = new Spinner('Installing Passport.js dependencies  ... %s');
    try {
      spinner.setSpinnerString('|/-\\');
      spinner.start();
      await this.packageManagerService.installDependency('bcryptjs');
      await this.packageManagerService.installDependency('passport-local');
      await this.packageManagerService.installDependency(
        '@types/passport-local',
      );
      await this.packageManagerService.installDependency('passport');
      await this.packageManagerService.installDependency('@nestjs/passport');
      await this.packageManagerService.installDependency(
        '@nestjs-modules/mailer',
      );
      console.log('Passport.js dependencies installed successfully.');
    } catch (error) {
      console.error(error);
    } finally {
      spinner.stop(true);
    }
  }

  // creates the auth directory if it doesn't exist
  private async initAuth(): Promise<void> {
    console.log('Initializing Authentication service and module.');
    const authExists = await this.fileManagerService.doesFolderExist('auth');
    if (!authExists) {
      try {
        await this.fileManagerService.createDirectoryIfNotExists('src/auth');
        await this.fileManagerService.createDirectoryIfNotExists('src/mailer');
      } catch (err) {
        console.error(
          'Error while initializing authentication service and module:',
          err,
        );
        throw err;
      }
    } else {
      console.log(
        'Authentication module and service already exist. Skipping creation.',
      );
    }
  }

  // function to create a folder in src/auth
  async initFolder(dir: string): Promise<void> {
    await this.fileManagerService.createDirectoryIfNotExists(`src/auth/${dir}`);
  }
}
