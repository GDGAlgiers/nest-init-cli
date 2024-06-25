/* eslint-disable prettier/prettier */
import { Command, CommandRunner } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { prompt } from 'inquirer';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { PackageManagerService } from '../utils/packageManager.service';
import { FileManagerService } from '../utils/fileManager.service'; // Adjust path based on actual file location
import { AuthFileManager } from '../authStrategyMethods/authFileManager'; // Adjust path based on actual file location
import { FileManager } from '../authStrategyMethods/utils/fileManager';

@Command({ name: 'add-auth', description: 'add auth services' })
export class AuthConfigCommand extends CommandRunner {
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,
    private readonly jwt:  AuthFileManager,
    private readonly fileManager: FileManager,

  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    try {
      await this.initauth();
      await this.jwt.createServices();
      await  this.fileManagerService.addImportsToAppModule(`import { AuthModule } from './auth/auth.module';`,`AuthModule`)

      const folderExists = await this.fileManagerService.doesFolderExist("users");
      console.log(`User resource exists: ${folderExists}`);

      if (!folderExists) {
        console.log('User resource does not exist. Generating user resource...');
        await new Promise<void>((resolve, reject) => {
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

      await this.installDependencies();

      const { addAuth } = await prompt({
        type: 'confirm',
        name: 'addAuth',
        message: 'Do you want to add auth (login and register)?',
      });

      if (addAuth) {
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
          await this.packageManagerService.installDependency('@nestjs/jwt');
          await this.packageManagerService.installDependency('passport-jwt');
          await this.packageManagerService.installDependency('jsonwebtoken');
          await this.packageManagerService.installDependency('bcryptjs');
          await this.jwt.addJwtStrategy();
          await this.fileManager.addProviderToAuthModule(`import { JwtStrategy } from './jwt.strategy';`,"JwtStrategy")
          await this.fileManager.addImportsToAuthModule(`import { JwtModule } from '@nestjs/jwt';`,`JwtModule.register({ secret: process.env.JWT_SECRET||"2024",})`)
          authSpinner.stop(true);
        }

      }

      const { addGoogleAuth } = await prompt({
        type: 'confirm',
        name: 'addGoogleAuth',
        message: 'Do you want to add auth with Google?',
      });

      if (addGoogleAuth) {
        console.log('Adding Google auth...');
        this.packageManagerService.installDependency('passport-google-oauth20');
      }

      const { addFbAuth } = await prompt({
        type: 'confirm',
        name: 'addFbAuth',
        message: 'Do you want to add auth with Facebook?',
      });

      if (addFbAuth) {
        console.log('Adding Facebook auth...');
        this.packageManagerService.installDependency('passport-facebook');
      }

      console.log('Auth services added successfully');
    } catch (error) {
      console.error('Error while adding auth services:', error);
    } finally {
      // Stop the spinner
    }
  }
  private installDependencies(): void {
    const spinner = new Spinner('Installing dependencies  ... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    this.packageManagerService.installDependency('passport');
    this.packageManagerService.installDependency('@nestjs/passport');
    spinner.stop(true);
    console.log('passport js installed successfully!');
  }

  private async initauth(): Promise<void> {
    console.log('Initializing authentication service and module.');
    
    const authExists = await this.fileManagerService.doesFolderExist("auth");
    
    if (!authExists) {
      try {
        await this.fileManagerService.createDirectoryIfNotExists("src/auth");
      } catch (err) {
        console.error('Error while init auth ', err);
        throw err; // Rethrow the error to handle it further if needed
      }
    } else {
      console.log('Auth module and service already exist.');
    }
  }
}
