/* eslint-disable prettier/prettier */
import { Command, CommandRunner } from 'nest-commander';
import { Spinner } from 'cli-spinner';
import { join } from 'path';
import { prompt } from 'inquirer';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { PackageManagerService } from '../utils/packageManager.service';
import { FileManagerService } from 'src/utils/fileManager.service';

@Command({ name: 'add-auth', description: 'add auth services' })
export class AuthConfigCommand extends CommandRunner {
  constructor(
    private readonly packageManagerService: PackageManagerService,
    private readonly fileManagerService: FileManagerService,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const spinner = new Spinner('Processing.. %s');
    spinner.setSpinnerString('|/-\\');

    try {
      // Check if the user folder exists
      const folderExists = await this.fileManagerService.doesUserFolderExist();
      console.log(`User folder exists: ${folderExists}`);
      
      if (!folderExists) {
        console.log('User folder does not exist. Generating user resource...');
        
        await new Promise<void>((resolve, reject) => {
          exec('npx nest g resource user', (error, stdout, stderr) => {
            if (error) {
              console.error(`Error generating user resource: ${error.message}`);
              reject(error);
              return
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

        // Process based on the selected auth type
        console.log(`Selected auth type: ${authType}`);
      }

      const { addGoogleAuth } = await prompt({
        type: 'confirm',
        name: 'addGoogleAuth',
        message: 'Do you want to add auth with Google?',
      });

      if (addGoogleAuth) {
        console.log('Adding Google auth...');
        // Process Google auth setup
      }

      const { addFbAuth } = await prompt({
        type: 'confirm',
        name: 'addFbAuth',
        message: 'Do you want to add auth with Facebook?',
      });

      if (addFbAuth) {
        console.log('Adding Facebook auth...');
        // Process Facebook auth setup
      }

      // Example of using the services and fs/promises
      spinner.start();
      const path = join(__dirname, 'path-to-file');
      const content = 'File content here';

      await writeFile(path, content);

      // Example of using PackageManagerService and FileManagerService

      console.log('Auth services added successfully');
    } catch (error) {
      console.error('Error while adding auth services:', error);
    } finally {
      // Stop the spinner
      spinner.stop(true);
    }
  }
}
