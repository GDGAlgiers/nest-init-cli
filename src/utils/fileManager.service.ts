/* eslint-disable prettier/prettier */
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import * as path from 'path';

export class FileManagerService {
  private async readByLineAsyncAndUpdate(
    filePath: string,
    providerName: string,
    stringCheck: string,
    providerPath: string,
  ): Promise<string> {
    let fileData = '';
    const lineReader = await import('line-reader');

    return new Promise((resolve, reject) => {
      let providersFound = false;
      let providerNameAlreadyAdded = false;
      let providerPathAdded = false;

      lineReader.eachLine(filePath, function (line, last) {
        if (line.toString().includes(providerPath)) {
          providerPathAdded = true;
        }
        if (
          line.toString().includes(`${stringCheck}:`) &&
          line.toString().includes(providerName)
        ) {
          providerNameAlreadyAdded = true;
        }
        if (line.toString().includes(`${stringCheck}:`)) {
          providersFound = true;
        }
        if (providersFound) {
          const provider = line.replace('[', '');
          if (!providerNameAlreadyAdded) {
            fileData += `${stringCheck}:[${providerName}, ${provider.replace(
              `${stringCheck}:`,
              '',
            )}\n`;
          } else {
            fileData += `${stringCheck}:[${provider.replace(
              `${stringCheck}:`,
              '',
            )}\n`;
          }
          providersFound = false;
        } else {
          fileData += `${line.toString()}\n`;
        }
        if (last) {
          if (!providerPathAdded) {
            fileData = `${providerPath}\n` + fileData;
          }
          resolve(fileData);
        }
      });
    });
  }

  async addProviderToAppModule(providerPath: string, providerName: string) {
    const filePath = process.cwd() + '/src/app.module.ts';

    const fileData: string = await this.readByLineAsyncAndUpdate(
      filePath,
      providerName,
      'providers',
      providerPath,
    );
    await writeFile(filePath, fileData);
  }

  async addImportsToAppModule(providerPath: string, providerName: string) {
    const filePath = path.join(process.cwd(), 'src/app.module.ts');

    // Check if the providerPath is already in the file
    const fileContent = await readFile(filePath, 'utf8');
    if (fileContent.includes(providerPath)) {
      console.error(`Provider path '${providerPath}' is already added.`);
    }

    try {
      const fileData: string = await this.readByLineAsyncAndUpdate(
        filePath,
        providerName,
        'imports',
        providerPath,
      );
      await writeFile(filePath, fileData);
    } catch (error) {
      console.error(error.message);
    }
  }
  async addcontrollersToAppModule(providerPath: string, providerName: string) {
    const filePath = process.cwd() + '/src/app.module.ts';

    const fileData: string = await this.readByLineAsyncAndUpdate(
      filePath,
      providerName,
      'controllers',
      providerPath,
    );
    await writeFile(filePath, fileData);
  }
  async createDirectoryIfNotExists(path: string): Promise<void> {
    if (!existsSync(path)) {
      await mkdir(path, { recursive: true });
    }
  }

  async doesFolderExist(folder: string): Promise<boolean> {
    const folderPath = join(process.cwd(), 'src', folder);
    console.log(folderPath);
    // Check if the folder exists
    return existsSync(folderPath);
  }
  // function to create a folder in src/auth
  async initFolder(dir: string): Promise<void> {
    await this.createDirectoryIfNotExists(`src/auth/${dir}`);
  }
}
