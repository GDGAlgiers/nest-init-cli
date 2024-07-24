/* eslint-disable prettier/prettier */
import { writeFile } from 'fs/promises';
import { FileManagerService } from 'src/utils/fileManager.service';

export class FileManager {
  constructor(private readonly fileManagerService: FileManagerService) {}
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
  async addProviderToAuthModule(providerPath: string, providerName: string) {
    const filePath = process.cwd() + '/src/auth/auth.module.ts';

    const fileData: string = await this.readByLineAsyncAndUpdate(
      filePath,
      providerName,
      'providers',
      providerPath,
    );
    await writeFile(filePath, fileData);
  }

  async addImportsToAuthModule(providerPath: string, providerName: string) {
    const filePath = process.cwd() + '/src/auth/auth.module.ts';

    const fileData: string = await this.readByLineAsyncAndUpdate(
      filePath,
      providerName,
      'imports',
      providerPath,
    );
    await writeFile(filePath, fileData);
  }
  async addControllersToAuthModule(providerPath: string, providerName: string) {
    const filePath = process.cwd() + '/src/auth/auth.module.ts';

    const fileData: string = await this.readByLineAsyncAndUpdate(
      filePath,
      providerName,
      'controllers',
      providerPath,
    );
    await writeFile(filePath, fileData);
  }
}
