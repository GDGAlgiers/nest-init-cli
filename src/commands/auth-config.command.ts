/* eslint-disable prettier/prettier */
import { Command, CommandRunner } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { prompt } from 'inquirer';
import { exec } from 'child_process';
import { PackageManagerService } from '../utils/packageManager.service';
import { FileManagerService } from '../utils/fileManager.service'; // Adjust path based on actual file location
import { AuthFileManager } from '../authStrategyMethods/authFileManager'; // Adjust path based on actual file location
import { FileManager } from '../authStrategyMethods/utils/fileManager';
import { checkAndPromptEnvVariables } from 'src/utils/check-env-variables';

@Command({ name: 'add-auth', description: 'Add authentication services' })
export class AuthConfigCommand extends CommandRunner {
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,
    private readonly jwt: AuthFileManager,
    private readonly fileManager: FileManager,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    try {
      await this.initauth();
      await this.jwt.createServices();
      await this.fileManagerService.addImportsToAppModule(
        `import { AuthModule } from './auth/auth.module';`,
        `AuthModule`,
      );

      const folderExists = await this.fileManagerService.doesFolderExist(
        'users',
      );
      console.log(`User resource exists: ${folderExists}`);

      if (!folderExists) {
        console.log(
          'User resource does not exist. Generating user resource...',
        );
        await this.generateUserResource();
      }

      await this.installDependencies();

      const { addAuth } = await prompt({
        type: 'confirm',
        name: 'addAuth',
        message: 'Do you want to add auth (login and register)?',
      });

      if (addAuth) {
        await this.runLocalAuth();
      }

      const { addGoogleAuth } = await prompt({
        type: 'confirm',
        name: 'addGoogleAuth',
        message: 'Do you want to add auth with Google?',
      });

      if (addGoogleAuth) {
        await this.runGoogleAuth();
      }

      const { addFbAuth } = await prompt({
        type: 'confirm',
        name: 'addFbAuth',
        message: 'Do you want to add auth with Facebook?',
      });

      if (addFbAuth) {
        await this.runFacebookAuth();
      }
      const { addGithubAuth } = await prompt({
        type: 'confirm',
        name: 'addGithubAuth',
        message: 'Do you want to add auth with Github?',
      });

      if (addGithubAuth) {
        await this.runGithubAuth();
      }
      console.log('Auth services added successfully');
    } catch (error) {
      console.error('Error while adding auth services:', error);
    } finally {
    }
  }
  // function to add Google OAuth Service
  private async runGoogleAuth(): Promise<void> {
    console.log('Adding Google auth...');
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
      await this.jwt.createGoogleAuthStrategy();
      console.log('Google OAuth added successfully.');
    } catch (error) {
      console.error('Error while adding Google OAuth:', error);
    } finally {
      googleAuthSpinner.stop(true);
    }
  }

  // function to add Facebook OAuth
  private async runFacebookAuth(): Promise<void> {
    console.log('Adding Facebook auth...');
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
      await this.jwt.createFacebookAuthStrategy();

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
  private async runGithubAuth(): Promise<void> {
    console.log('Adding Github auth...');
    const githubAuthSpinner = new Spinner(
      'Installing Github auth dependencies... %s',
    );
    githubAuthSpinner.setSpinnerString('|/-\\');
    githubAuthSpinner.start();

    try {
      // Initialize the github folder
      await this.initFolder('github');

      // Install necessary dependencies
      await this.packageManagerService.installDependency('passport-github');

      // Add GitHub strategy to auth module providers
      await this.jwt.addGithubAuthStrategy();

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

      console.log('Github OAuth added successfully.');
    } catch (error) {
      console.error('Error while adding Github OAuth:', error);
    } finally {
      githubAuthSpinner.stop(true);
    }
  }

  // function to add local auth (email/password)
  private async runLocalAuth(): Promise<void> {
    const { authType } = await prompt({
      type: 'list',
      name: 'authType',
      message: 'Choose auth type:',
      choices: ['JWT', 'Cookies', 'Session'],
    });

    console.log(`Selected auth type: ${authType}`);
    const authSpinner = new Spinner('Installing auth dependencies... %s');
    authSpinner.setSpinnerString('|/-\\');
    authSpinner.start();

    await this.packageManagerService.installDependency('passport-local');

    if (authType === 'JWT') {
      await this.addJwtAuth();
    }

    authSpinner.stop(true);
  }

  // function to handle adding JWT strategy
  private async addJwtAuth(): Promise<void> {
    await this.packageManagerService.installDependency('@nestjs/jwt');
    await this.packageManagerService.installDependency('passport-jwt');
    await this.packageManagerService.installDependency('jsonwebtoken');
    await this.packageManagerService.installDependency('bcryptjs');
    await this.jwt.addJwtStrategy();
    await this.fileManager.addProviderToAuthModule(
      `import { JwtStrategy } from './jwt.strategy';`,
      'JwtStrategy',
    );
    await this.fileManager.addImportsToAuthModule(
      `import { JwtModule } from '@nestjs/jwt';`,
      `JwtModule.register({ secret: process.env.JWT_SECRET || "2024", })`,
    );
    console.log('you should fix user services to use jwt strategy');
  }

  // checks if the users module exists, creates it if it doesn't
  private async generateUserResource(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      exec('npx nest g resource users', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error generating user resource: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          console.error(`Error output: ${stderr}`);
          reject(new Error(stderr));
          return;
        }
        console.log(`User resource generated: ${stdout}`);
        resolve();
      });
    });
  }
  // function to install passport.js dependencies
  private installDependencies(): void {
    const spinner = new Spinner('Installing dependencies  ... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    this.packageManagerService.installDependency('passport');
    this.packageManagerService.installDependency('@nestjs/passport');
    spinner.stop(true);
    console.log('Passport.js installed successfully!');
  }

  // creates the auth directory if it doesn't exist
  private async initauth(): Promise<void> {
    console.log('Initializing authentication service and module.');
    const authExists = await this.fileManagerService.doesFolderExist('auth');
    if (!authExists) {
      try {
        await this.fileManagerService.createDirectoryIfNotExists('src/auth');
      } catch (err) {
        console.error('Error while init auth ', err);
        throw err; // Rethrow the error to handle it further if needed
      }
    } else {
      console.log('Auth module and service already exist.');
    }
  }
  private async initFolder(dir: string): Promise<void> {
    await this.fileManagerService.createDirectoryIfNotExists(`src/auth/${dir}`);
  }
}
